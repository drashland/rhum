interface IHelpMenuData {
  description: string;
  usage: string[];
  options: {[key: string]: string};
  example_usage: IExampleUsageData[]
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
      output += data[key];
    }

    if (key == "usage") {
      output += `\n\nUSAGE\n\n`
      data[key].forEach((usageLine: string) => {
        output += ("    " + usageLine + "\n");
      });
    }

    if (key == "options") {
      output += `\n\nOPTIONS\n`;
      for (const option in data[key]) {
        output += (`\n    ${option}\n`);
        output += (`        ${data[key][option]}\n`);
      }
    }

    if (key == "example_usage") {
      output += `\n\nEXAMPLE USAGE\n`;
      data[key].forEach((exampleUsageData: IExampleUsageData) => {
        output += (`\n    ${exampleUsageData.description}\n`);
        exampleUsageData.examples.forEach((example: string) => {
          output += (`        ${example}\n`);
        });
      });
    }
  }

  return output;
}
