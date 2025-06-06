import { Terminal } from "xterm";
import { jokes } from "./jokes";

let randomJoke: string;
let previousJoke: null | string;

export const terminalReset = (terminal: Terminal) => {
  terminal.reset();
  terminal.writeln(
    "\r\nAvailable commands: about, projects, contact, clear, whoami, joke, resume, sudo hire-me"
  );
};

export const handleCommand = (terminal: Terminal, command: string) => {
  switch (command) {
    case "help":
      terminal.writeln(
        "\r\nAvailable commands: about, projects, contact, clear, whoami, joke, resume, sudo hire-me"
      );
      break;
    case "about":
      terminal.writeln("\r\nVardges Movsesyan - Full-Stack & Game Developer.");
      break;
    case "projects":
      terminal.writeln(
        "\r\n1. Uplift Solution: https://www.fiverr.com/users/armsershant/portfolio/Njc5M2ExMmY5ZmM3NWIwMDAxNDllZGU5"
      );
      terminal.writeln(
        "\r\n2. Trilium Quest: https://www.fiverr.com/users/armsershant/portfolio/Njc5MzlmMmNmMDMyYWEwMDAxMTAyYjg1"
      );
      terminal.writeln(
        "\r\n3. Trilium Quest Wiki: https://www.fiverr.com/users/armsershant/portfolio/Njc5Mzk4NDU0N2Q0NjgwMDAxZWMxMmJk"
      );
      terminal.writeln(
        "\r\n4. Arch Games Studio: https://www.fiverr.com/users/armsershant/portfolio/Njc5M2EwYTJmMDMyYWEwMDAxMTAyYzJj"
      );
      terminal.writeln(
        "\r\n5. Exodus NFT Marketplace: https://www.fiverr.com/users/armsershant/portfolio/Njc5M2EzMDk0N2Q0NjgwMDAxZWMxNzYy"
      );
      terminal.writeln(
        "\r\n6. Ticket Metric: https://www.fiverr.com/users/armsershant/portfolio/Njc5M2EyMmJmMDMyYWEwMDAxMTAyY2Vj"
      );
      terminal.writeln("\r\nMore info: https://vardges-movsesyan.vercel.app");
      break;
    case "contact": {
      terminal.writeln(
        "\r\nEmail: vardges.movsesyan6@gmail.com press E to mail"
      );
      terminal.writeln("\r\nPhone: +37496804036 press C to call");
      terminal.writeln(
        "\r\nGitHub: https://github.com/ArmSershant press G to open Github"
      );
      terminal.writeln(
        "\r\nPortfolio: https://vardges-movsesyan.vercel.app press M to open Main Portfolio"
      );

      const handleContactKeys = ({ key }: { key: string }) => {
        if (key.toUpperCase() === "E")
          window.open("mailto:vardges.movsesyan6@gmail.com", "_blank");
        else if (key.toUpperCase() === "C")
          window.open("tel:+37496804036", "_blank");
        else if (key.toUpperCase() === "G")
          window.open("https://github.com/ArmSershant", "_blank");
        else if (key.toUpperCase() === "M")
          window.open("https://vardges-movsesyan.vercel.app", "_blank");

        listener.dispose();
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
          terminal.writeln("");
          terminal.writeln("\r\nOpening portfolio...");

          setTimeout(() => {
            window.open(
              "https://vardges-movsesyan.vercel.app#bottom",
              "_blank"
            );
          }, 1000);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (key.toUpperCase() === "N") {
          terminal.writeln(
            `\r\nPhone: +37496804036\r\nEmail: vardges.movsesyan6@gmail.com\r\n`
          );
        } else {
          return;
        }
        listener.dispose();
      };
      const listener = terminal.onKey((event) => {
        event.domEvent.preventDefault();
        handleConfirmation(event);
      });
      break;
    }
    case "joke":
      do {
        randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      } while (randomJoke === previousJoke);
      previousJoke = randomJoke;
      terminal.writeln("\r\n" + randomJoke);
      break;
    case "clear":
      terminalReset(terminal);
      break;
    default:
      terminal.writeln(
        `\r\nCommand not found. Type 'help' for a list of commands or visit: https://vardges-movsesyan.vercel.app`
      );
  }
};
