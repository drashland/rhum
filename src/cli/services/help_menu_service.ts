interface IHelpMenuData {
  commands: { [key: string]: string };
  description: string;
  example_usage: IExampleUsageData[];
  options: {
    [key: string]: {
      [key: string]: string;
    };
  };
  usage: string[];
}

interface IExampleUsageData {
  description: string;
  examples: string[];
}

/**
 * Create the help menu.
 *
 * @param data - The data to use to create the help menu.
 *
 * @returns The help menu output.
 */
export function createHelpMenu(data: IHelpMenuData): string {
  let output = "\n";

  for (const key in data) {
    if (key == "description") {
      output += wordWrap(data[key]);
    }

    if (key == "usage") {
      output += `\n\nUSAGE\n\n`;
      data[key].forEach((usageLine: string) => {
        output += ("    " + usageLine + "\n");
      });
    }

    if (key == "commands") {
      output += `\n\nCOMMANDS\n`;
      for (const command in data[key]) {
        output += (`\n    ${command}\n`);
        output += (`        ${wordWrap(`${data[key][command]}`, 8)}\n`);
      }
    }

    if (key == "options") {
      output += `\n\nOPTIONS\n\n    Options are categorized by command.\n`;
      for (const command in data[key]) {
        output += (`\n    ${command}\n`);
        for (const option in data[key][command]) {
          output += (`        ${option}\n`);
          output +=
            (`${wordWrap(`            ${data[key][command][option]}`, 12)}\n`);
        }
      }
    }

    if (key == "example_usage") {
      output += `\n\nEXAMPLE USAGE\n`;
      data[key].forEach((exampleUsageData: IExampleUsageData) => {
        output += (`\n    ${wordWrap(exampleUsageData.description, 4)}\n`);
        exampleUsageData.examples.forEach((example: string) => {
          output += (`        ${example}\n`);
        });
      });
    }
  }

  return output;
}

/**
 * Word wrap a string. Thanks https://j11y.io/snippets/wordwrap-for-javascript/.
 */
export function wordWrap(str: string, indent = 0): string {
  const brk = "\n" + (indent > 0 ? " ".repeat(indent) : "");
  const regex = new RegExp(/.{1,80}(\s|$)/, "g");
  const ret = str.match(regex);
  if (!ret) {
    throw new Error("Error loading help menu.");
  }
  ret.map((item: string) => {
    return item.trim();
  });
  return ret.join(brk);
}
