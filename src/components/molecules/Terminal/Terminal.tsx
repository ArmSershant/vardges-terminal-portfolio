import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { jokes } from "../../../utils/jokes";
import styles from "./terminal.module.scss";
import { commands } from "../../../utils/commands";

const TerminalComponent: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<Terminal | null>(null);

  const prompt = (terminal: Terminal) => {
    terminal.write("\r\n$ ");
  };

  let randomJoke: string;
  let previousJoke: null | string;

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

  const handleCommand = (terminal: Terminal, command: string) => {
    switch (command) {
      case "help":
        terminal.writeln(
          "\r\nAvailable commands: about, projects, contact, clear, whoami, joke, resume, sudo hire-me"
        );
        break;
      case "about":
        terminal.writeln(
          "\r\nVardges Movsesyan - Full-Stack & Game Developer."
        );
        break;
      case "projects":
        terminal.writeln(
          "\r\n1.\x1b]8;;https://www.fiverr.com/users/armsershant/portfolio/Njc5M2ExMmY5ZmM3NWIwMDAxNDllZGU5\x1b\\Uplift Solution\x1b]8;;\x1b\\"
        );
        terminal.writeln(
          "\r\n1.\x1b]8;;https://www.fiverr.com/users/armsershant/portfolio/Njc5MzlmMmNmMDMyYWEwMDAxMTAyYjg1\x1b\\Trilium Quest\x1b]8;;\x1b\\"
        );
        terminal.writeln(
          "\r\n1.\x1b]8;;https://www.fiverr.com/users/armsershant/portfolio/Njc5Mzk4NDU0N2Q0NjgwMDAxZWMxMmJk\x1b\\Trilium Quest Wiki\x1b]8;;\x1b\\"
        );
        terminal.writeln(
          "\r\n1.\x1b]8;;https://www.fiverr.com/users/armsershant/portfolio/Njc5M2EwYTJmMDMyYWEwMDAxMTAyYzJj\x1b\\Arch Games Studio\x1b]8;;\x1b\\"
        );
        terminal.writeln(
          "\r\n2.\x1b]8;;https://www.fiverr.com/users/armsershant/portfolio/Njc5M2EzMDk0N2Q0NjgwMDAxZWMxNzYy\x1b\\Exodus NFT Marketplace\x1b]8;;\x1b\\"
        );
        terminal.writeln(
          "\r\n2.\x1b]8;;https://www.fiverr.com/users/armsershant/portfolio/Njc5M2EyMmJmMDMyYWEwMDAxMTAyY2Vj\x1b\\Ticket Metric\x1b]8;;\x1b\\"
        );
        break;
      case "contact": {
        terminal.writeln(
          "\r\nEmail: vardges.movsesyan6@gmail.com press E to mail"
        );
        terminal.writeln("\r\nPhone: +37496804036 press C to call");
        terminal.writeln(
          "\r\nGitHub: \x1b]8;;https://github.com/ArmSershant\x1b\\https://github.com/ArmSershant\x1b]8;;\x1b\\ press G to open Github"
        );
        terminal.writeln(
          "\r\nPortfolio: \x1b]8;;https://vardges-movsesyan.vercel.app\x1b\\https://vardges-movsesyan.vercel.app\x1b]8;;\x1b\\ press M to open Main Portfolio"
        );

        const handleContactKeys = ({ key }: { key: string }) => {
          if (key.toUpperCase() === "E") {
            window.open("mailto:vardges.movsesyan6@gmail.com", "_blank");
          } else if (key.toUpperCase() === "C") {
            window.open("tel:+37496804036", "_blank");
          } else if (key.toUpperCase() === "G") {
            window.open("https://github.com/ArmSershant", "_blank");
          } else if (key.toUpperCase() === "M") {
            window.open("https://vardges-movsesyan.vercel.app", "_blank");
          }

          listener.dispose();
          setTimeout(() => {
            prompt(terminal);
          }, 2000);
        };

        const listener = terminal.onKey(handleContactKeys);
        break;
      }
      case "whoami":
        terminal.writeln(
          "\r\nMy name is Vardges and I'm a motivated full-stack/game developer with experience in building websites and games. I'm experienced in HTML(BEM), CSS3(SASS RSCSS), Bootstrap, Tailwind CSS, MUI, Solid.js, Chart.js, Apex.js, JavaScript, TypeScript, React(Redux, Redux toolkit), Angular(NGRX), SQL, Node.js, Nest.js, Firebase, Git, HubStaff, Web3(Wax.js), Jira, Godot, GDScript, WordPress, and Wix."
        );
        break;
      case "resume":
        terminal.writeln("\r\nOpening resume...");
        setTimeout(() => {
          window.open(
            "https://vardges-movsesyan.vercel.app/assets/Vardges%20Movsesyan%20CV%20AM-Eek6tv_4.pdf",
            "_blank"
          );
        }, 1000);
        break;
      case "sudo hire-me": {
        terminal.writeln(
          `\r\nCongratulations! You made the best decision.\r\nDo you want to open my main portfolio? (Y/N)`
        );
        const handleConfirmation = ({ key }: { key: string }) => {
          if (key.toUpperCase() === "Y") {
            terminal.writeln("\r\nOpening portfolio...");
            setTimeout(() => {
              window.open("https://vardges-movsesyan.vercel.app", "_blank");
            }, 2000);
          } else if (key.toUpperCase() === "N") {
            terminal.writeln(
              `\r\nPhone: +37496804036\r\nEmail: vardges.movsesyan6@gmail.com`
            );
          } else {
            return;
          }
          listener.dispose();
          prompt(terminal);
        };
        const listener = terminal.onKey((event) => {
          event.domEvent.preventDefault(); // Stop unwanted key input
          handleConfirmation(event);
        });
        break;
      }
      case "joke":
        do {
          randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        } while (randomJoke === previousJoke);
        previousJoke = randomJoke;
        terminal.writeln(randomJoke);
        break;
      case "clear":
        terminal.clear();
        break;
      default:
        terminal.writeln(
          `\r\nCommand not found. Type 'help' for a list of commands or \x1b[4m\x1b[3m\x1b]8;;https://vardges-movsesyan.vercel.app\x1b\\Check this!\x1b]8;;\x1b[24m\x1b[23m\x1b[0m`
        );
    }
  };

  return <div className={styles.terminal} ref={terminalRef} />;
};

export default TerminalComponent;

// This code is a React component that implements a terminal-like interface using the xterm.js library. It allows users to interact with the terminal by typing commands and receiving responses. The terminal supports command history, autocompletion, and various commands like "help", "about", "projects", "contact", "whoami", "joke", and more. The component also includes a fit addon to adjust the terminal size based on the container dimensions.


// Եղած ինֆորմացիայի վրա ստեղծի դինամիկ ռեզյումե ըստ տրված հրամանի (for example get resume for React, Node, etc...)
// Ռեզյումե գեներացնող ծրագիր