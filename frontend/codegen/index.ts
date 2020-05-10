import fs from "fs";
import path from "path";
import glob from "glob";
import prettier from "prettier";
import yargs from "yargs";
import { ethers } from "ethers";
import { Project, QuoteKind, IndentationText } from "ts-morph";
import { generate, ContractData } from "./utils/generate";

interface Config {
  contracts: {
    [key: string]: string;
  };
}

const args = yargs
  .option("input", {
    array: true,
    normalize: true,
    demandOption: true,
    coerce: (input) => {
      const nested = input.map((item: string) => {
        if (item.indexOf("*") !== -1 || item.indexOf("{") !== -1) {
          return glob.sync(item);
        }

        if (fs.existsSync(item)) {
          const stats = fs.lstatSync(item);
          if (stats.isDirectory()) {
            return glob.sync(path.join(item, "**/*.json"));
          }

          if (stats.isFile()) {
            return [item];
          }
        }

        throw new Error(
          "Failed to recognize input path. Please pass the path to a file or directory or a glob pattern."
        );
      });

      // @ts-ignore
      return nested.flat();
    },
  })
  .options("config", {
    default: path.relative(process.cwd(), path.join(__dirname, "config.json")),
    coerce: (file) => JSON.parse(fs.readFileSync(file, "utf8")),
  })
  .option("prettier", {
    default: process.cwd(),
    defaultDescription: "Relative to current working directory.",
    coerce: (directory) => prettier.resolveConfig.sync(directory),
  })
  .pkgConf("codegen").argv;

(async () => {
  const config = (args.config as any) as Config;
  const output = path.resolve(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  const mapping = Object.entries(config.contracts).map(
    ([contract, destination]) => {
      try {
        const source = args.input.find((item) => {
          return path.basename(item, ".json") === contract;
        });

        if (!source) {
          throw new Error(`Missing contract output for ${contract}.`);
        }

        const output = JSON.parse(
          fs.readFileSync(path.resolve(source), "utf8")
        );

        return {
          destination,
          name: contract,
          interface: new ethers.utils.Interface(output.abi),
          userdoc: output.userdoc,
          devdoc: output.devdoc,
        } as ContractData;
      } catch (error) {
        throw new Error(
          `Failed to load source data for contract ${contract}: ${error}`
        );
      }
    }
  );

  const project = new Project({
    tsConfigFilePath: `${process.cwd()}/tsconfig.json`,
    addFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    manipulationSettings: {
      useTrailingCommas: true,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      quoteKind: QuoteKind.Single,
      indentationText: IndentationText.TwoSpaces,
    },
  });

  generate(project, output, mapping, (source: string) => {
    const options: prettier.Options = { ...config, parser: "typescript" };
    return prettier.format(source, options);
  });

  await project.save();
})();
