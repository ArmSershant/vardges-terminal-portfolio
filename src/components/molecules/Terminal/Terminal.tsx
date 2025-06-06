import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { commands } from "../../../utils/commands";
import { handleCommand } from "../../../utils/handleCommand";
import styles from "./terminal.module.scss";

const TerminalComponent: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);
  const [term, setTerm] = useState<Terminal | null>(null);

  const newLine = (terminal: Terminal, fitAddon: FitAddon) => {
    terminal.write("\r\n$ ");
    fitAddon.fit();
    terminal.scrollToBottom();
    terminal.resize(terminal.cols, terminal.rows - 1);
  };

  useEffect(() => {
    if (!terminalRef.current || term) return;

    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;

    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: "underline",
      fontFamily: "Courier New, monospace",
      fontSize: isMobile ? 10 : isTablet ? 12 : 14,
      lineHeight: isMobile ? 1.2 : isTablet ? 1.3 : 1.4,
      theme: {
        background: "#000000",
        foreground: "#00FF00",
        cursor: "#00FF00",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();
    newLine(terminal, fitAddon);

    terminal.registerLinkProvider({
      provideLinks(y, callback) {
        const regex = /(https?:\/\/[^\s]+)/g;
        const links = [];

        // Get the active buffer
        const buffer = terminal.buffer.active;

        // Collect wrapped lines starting from line y-1 upwards
        let startLineIndex = y - 1;
        while (
          startLineIndex > 0 &&
          buffer.getLine(startLineIndex)?.isWrapped
        ) {
          startLineIndex--;
        }

        // Collect wrapped lines downward starting from startLineIndex
        let endLineIndex = startLineIndex;
        while (
          endLineIndex + 1 < buffer.length &&
          buffer.getLine(endLineIndex + 1)?.isWrapped
        ) {
          endLineIndex++;
        }

        // Concatenate all wrapped lines' text to a single string
        let combinedText = "";
        for (let i = startLineIndex; i <= endLineIndex; i++) {
          combinedText += buffer.getLine(i)?.translateToString() || "";
        }

        let match;
        while ((match = regex.exec(combinedText))) {
          const startPos = match.index;
          const length = match[0].length;

          // Map startPos and length back to terminal coordinates (x,y)
          let remaining = startPos;
          let linkStartX = 0;
          let linkStartY = 0;
          let found = false;

          for (
            let lineIdx = startLineIndex;
            lineIdx <= endLineIndex;
            lineIdx++
          ) {
            const lineText = buffer.getLine(lineIdx)?.translateToString() || "";
            if (remaining < lineText.length) {
              linkStartX = remaining + 1;
              linkStartY = lineIdx + 1;
              found = true;
              break;
            }
            remaining -= lineText.length;
          }

          if (!found) continue;

          let remainingLength = length;
          let linkEndX = linkStartX;
          let linkEndY = linkStartY;

          for (
            let lineIdx = linkStartY - 1;
            lineIdx <= endLineIndex;
            lineIdx++
          ) {
            const lineText = buffer.getLine(lineIdx)?.translateToString() || "";
            const lineRemaining =
              lineText.length -
              (lineIdx === linkStartY - 1 ? linkStartX - 1 : 0);
            if (remainingLength <= lineRemaining) {
              linkEndX =
                (lineIdx === linkStartY - 1 ? linkStartX - 1 : 0) +
                remainingLength;
              linkEndY = lineIdx + 1;
              break;
            }
            remainingLength -= lineRemaining;
          }

          const url = match[0];
          links.push({
            text: url,
            range: {
              start: { x: linkStartX, y: linkStartY },
              end: { x: linkEndX, y: linkEndY },
            },
            activate: () => window.open(url, "_blank"),
          });
        }

        callback(links);
      },
    });

    let commandBuffer = "";
    const commandHistory: string[] = [];
    let historyIndex = -1;

    terminal.onKey(({ key, domEvent }) => {
      if (domEvent.ctrlKey && domEvent.key === "c") {
        domEvent.preventDefault();
        terminal.write("^C");
        commandBuffer = "";
        historyIndex = commandHistory.length;
        newLine(terminal, fitAddon);
        return;
      }

      if (domEvent.ctrlKey && domEvent.key === "l") {
        domEvent.preventDefault();
        terminal.clear();
        commandBuffer = "";
        historyIndex = commandHistory.length;
        return;
      }

      if (domEvent.key === "Escape") {
        domEvent.preventDefault();
        commandBuffer = "";
        historyIndex = commandHistory.length;
        newLine(terminal, fitAddon);
        return;
      }

      if (domEvent.key === "Enter") {
        const processedCommand = commandBuffer.trim().toLowerCase();
        handleCommand(terminal, processedCommand);
        commandHistory.push(processedCommand);
        historyIndex = commandHistory.length;
        commandBuffer = "";
        newLine(terminal, fitAddon);
      } else if (domEvent.key === "Backspace") {
        if (commandBuffer.length > 0) {
          terminal.write("\b \b");
          commandBuffer = commandBuffer.slice(0, -1);
        }
      } else if (domEvent.key === "ArrowUp") {
        domEvent.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          const newCommand = commandHistory[historyIndex];
          terminal.write(`\r\x1b[K$ ${newCommand}`);
          commandBuffer = newCommand;
        }
      } else if (domEvent.key === "ArrowDown") {
        domEvent.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          const newCommand = commandHistory[historyIndex];
          terminal.write(`\r\x1b[K$ ${newCommand}`);
          commandBuffer = newCommand;
        } else {
          historyIndex = commandHistory.length;
          commandBuffer = "";
          terminal.write("\r\x1b[K$ ");
        }
      } else if (domEvent.key === "Tab") {
        domEvent.preventDefault();
        const matchedCommands = commands.filter((command) =>
          command.startsWith(commandBuffer.toLowerCase())
        );
        if (matchedCommands.length === 1) {
          const completion = matchedCommands[0];
          const remainingText = completion.slice(commandBuffer.length);
          commandBuffer = completion;
          terminal.write(remainingText);
        } else if (matchedCommands.length > 1) {
          terminal.write("\r\n" + matchedCommands.join("  "));
          terminal.write("\r\n$ " + commandBuffer);
        }
      } else if (!domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
        if (key.length === 1) {
          commandBuffer += key;
          terminal.write(key);
        }
      }
    });

    setTerm(terminal);

    const mobileInput = mobileInputRef.current;
    if (mobileInput) {
      mobileInput.focus();
    
      mobileInput.addEventListener("keydown", (e) => {
        e.preventDefault();
        const key = e.key;
    
        if (key === "Backspace") {
          if (commandBuffer.length > 0) {
            terminal.write("\b \b");
            commandBuffer = commandBuffer.slice(0, -1);
          }
        } else if (key === "Enter") {
          const processedCommand = commandBuffer.trim().toLowerCase();
          handleCommand(terminal, processedCommand);
          commandHistory.push(processedCommand);
          historyIndex = commandHistory.length;
          commandBuffer = "";
          newLine(terminal, fitAddon);
        } else if (key.length === 1) {
          commandBuffer += key;
          terminal.write(key);
        }
      });
    
      terminalRef.current?.addEventListener("touchstart", () => {
        mobileInput.focus();
      });
    }
    

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commands, term]);

  return (
    <>
      <div>
        <p className={styles.terminalDescription}>
          Welcome to my terminal-based portfolio! Type <code>help</code> to see
          available commands.
        </p>
        <p className={styles.terminalDescription}>
          Clean code always looks like it was written by someone who cares.{" "}
        </p>
      </div>
      <div className={styles.terminal} ref={terminalRef} />
      <div className={styles.terminalShortcuts}>
        <p>
          <strong>Shortcuts:</strong> Ctrl + C: Cancel | Ctrl + L: Clear | Esc:
          Reset | ↑ / ↓: History | Tab: Auto-complete
        </p>
      </div>
      <textarea
        id="mobileInput"
        ref={mobileInputRef}
        className={styles.mobileInput}
      />
    </>
  );
};

export default TerminalComponent;
