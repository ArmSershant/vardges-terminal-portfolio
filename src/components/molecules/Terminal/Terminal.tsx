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
  const [term, setTerm] = useState<Terminal | null>(null);

  const newLine = (terminal: Terminal, fitAddon: FitAddon) => {
    terminal.write("\r\n$ ");
    fitAddon.fit();
    terminal.scrollToBottom();
    terminal.resize(terminal.cols, terminal.rows - 1);
  };

  useEffect(() => {
    if (!terminalRef.current || term) return;

    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: "underline",
      fontFamily: "Courier New, monospace",
      fontSize: 14,
      lineHeight: 1.4,
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
        const line = terminal.buffer.active.getLine(y - 1)?.translateToString();
        if (line) {
          let match;
          while ((match = regex.exec(line))) {
            const startIndex = match.index;
            const length = match[0].length;
            const url = match[0];
            links.push({
              text: url,
              range: {
                start: { x: startIndex + 1, y },
                end: { x: startIndex + length + 1, y },
              },
              activate: () => window.open(url, "_blank"),
            });
          }
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
    </>
  );
};

export default TerminalComponent;
