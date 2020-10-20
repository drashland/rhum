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
  let currentInput = "";

  for (const key in data) {
    if (key == "description") {
      output += wrap(data[key]);
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
        output += (`${wrap(`        ${data[key][option]}`)}\n`);
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

/**
 * Word wrap a string. Thanks https://j11y.io/snippets/wordwrap-for-javascript/.
 */
function wrap(str: string): string {
  const brk = '\n       ';
  const width = 80;
  const cut = false;
  const regex = '.{1,' +width+ '}(\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\S+?(\s|$)');
  return str.match( RegExp(regex, 'g') )!.join( brk );
}
