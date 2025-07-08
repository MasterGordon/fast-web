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
        console.log("loading", args.path);
        const path = require.resolve(args.path);
        let contents = await Bun.file(path).text();
        const createStateCalls = contents.matchAll(createStateStringRegex);
        createStateCalls.forEach((match) => {
          console.log(match);
          let braces = 1;
          let index = match.index + createStateString.length;
          let needsComma = false;
          console.log(contents[index]);
          do {
            index++;
            if (contents[index] == "(") braces++;
            else if (contents[index] == ")") braces--;
            else if (contents[index] == ",") needsComma = false;
            else if (contents[index].trim().length) needsComma = true;
          } while (braces > 0);
          console.log(contents[index]);
          const meta = {
            path,
            hash: crazyHash(contents),
          };
          contents =
            contents.substring(0, index) +
            (needsComma ? ", " : "") +
            JSON.stringify(meta) +
            contents.substring(index);
          console.log(contents);
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
