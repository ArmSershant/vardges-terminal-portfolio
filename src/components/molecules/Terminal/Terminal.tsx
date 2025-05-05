import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { commands } from "../../../utils/commands";
import { handleCommand } from "../../../utils/handleCommand";
import styles from "./terminal.module.scss";

const TerminalComponent: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<Terminal | null>(null);

  const prompt = (terminal: Terminal) => {
    terminal.write("\r\n$ ");
  };

  useEffect(() => {
    if (!terminalRef.current || term) return;

    const terminal = new Terminal({
      cursorBlink: true,
      theme: { background: "#000", foreground: "#00FF00" },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminal.writeln(
      "Welcome to Vardges's Terminal based Portfolio! Type 'help' for commands.\r\nClean code always looks like it was written by someone who cares."
    );
    prompt(terminal);

    let commandBuffer = "";
    const commandHistory: string[] = [];
    let historyIndex = -1;

    terminal.onKey(({ key, domEvent }) => {
      if (domEvent.key === "Enter") {
        terminal.writeln("");
        handleCommand(terminal, commandBuffer.trim());
        commandHistory.push(commandBuffer.trim());
        historyIndex = commandHistory.length;
        commandBuffer = "";
        prompt(terminal);
      } else if (domEvent.key === "Backspace") {
        if (commandBuffer.length > 0) {
          terminal.write("\b \b");
          commandBuffer = commandBuffer.slice(0, -1);
        }
      } else if (domEvent.key === "ArrowUp") {
        if (historyIndex > 0) {
          historyIndex--;
          commandBuffer = commandHistory[historyIndex];
          terminal.write(`\r$ ${commandBuffer}`);
        }
      } else if (domEvent.key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          commandBuffer = commandHistory[historyIndex];
          terminal.write(`\r$ ${commandBuffer}`);
        } else {
          historyIndex = commandHistory.length;
          commandBuffer = "";
          terminal.write("\r$ ");
        }
      } else if (domEvent.key === "Tab") {
        const matchedCommands = commands.filter((command) =>
          command.startsWith(commandBuffer)
        );
        if (matchedCommands.length === 1) {
          commandBuffer = matchedCommands[0];
          terminal.write(`\r$ ${commandBuffer}`);
        } else if (matchedCommands.length > 1) {
          terminal.write("\r\n" + matchedCommands.join("\r\n"));
          terminal.write("\r\n$ " + commandBuffer);
        }
      } else {
        commandBuffer += key;
        terminal.write(key);
      }
    });

    setTerm(terminal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commands, term]);

  return <div className={styles.terminal} ref={terminalRef} />;
};

export default TerminalComponent;

// This code is a React component that implements a terminal-like interface using the xterm.js library. It allows users to interact with the terminal by typing commands and receiving responses. The terminal supports command history, autocompletion, and various commands like "help", "about", "projects", "contact", "whoami", "joke", and more. The component also includes a fit addon to adjust the terminal size based on the container dimensions.
