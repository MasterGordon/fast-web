import { plugin, type BunPlugin } from "bun";
import { crazyHash } from "./system/crazyHash";

const createStateString = "createState(";
const createStateStringRegex = /createState\(/g;
export const myPlugin: BunPlugin = {
  name: "Custom loader",
  setup(build) {
    build.onLoad(
      {
        filter: /\.tsx?$/,
      },
      async (args) => {
        const path = require.resolve(args.path);
        let contents = await Bun.file(path).text();
        return { contents };
        const createStateCalls = contents.matchAll(createStateStringRegex);
        createStateCalls.forEach((match) => {
          let braces = 1;
          let index = match.index + createStateString.length;
          let needsComma = false;
          do {
            index++;
            if (contents[index] == "(") braces++;
            else if (contents[index] == ")") braces--;
            else if (contents[index] == ",") needsComma = false;
            else if (contents[index].trim().length) needsComma = true;
          } while (braces > 0);
          const meta = {
            path,
            hash: crazyHash(contents),
          };
          contents =
            contents.substring(0, index) +
            (needsComma ? ", " : "") +
            JSON.stringify(meta) +
            contents.substring(index);
        });
        // console.log(contents);
        return {
          contents,
        };
      },
    );
  },
};

plugin(myPlugin);
