#!/usr/bin/env node
// codesense - 本地语义代码搜索 v260429.164126

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(
              fullText,
              helpWidth - itemIndentWidth,
              termWidth + itemSeparatorWidth
            );
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.wrap(commandDescription, helpWidth, 0),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(
            helper.argumentTerm(argument),
            helper.argumentDescription(argument)
          );
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(
            helper.optionTerm(option),
            helper.optionDescription(option)
          );
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(
              helper.optionTerm(option),
              helper.optionDescription(option)
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              "Global Options:",
              formatList(globalOptionList),
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(
            helper.subcommandTerm(cmd2),
            helper.subcommandDescription(cmd2)
          );
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent)) return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth) return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(
          `
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`,
          "g"
        );
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n") return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path13 = require("node:path");
    var fs12 = require("node:fs");
    var process2 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path13.resolve(baseDir, baseName);
          if (fs12.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path13.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs12.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs12.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path13.resolve(
            path13.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path13.basename(
              this._scriptPath,
              path13.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path13.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path13.basename(filename, path13.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path14) {
        if (path14 === void 0) return this._executableDir;
        this._executableDir = path14;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", context);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", context)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process2.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    exports2.Command = Command2;
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// src/types.ts
var types_exports = {};
__export(types_exports, {
  DEFAULT_BATCH_SIZE: () => DEFAULT_BATCH_SIZE,
  DEFAULT_EMBEDDING_CONFIG: () => DEFAULT_EMBEDDING_CONFIG,
  DEFAULT_EXCLUDE_FILES: () => DEFAULT_EXCLUDE_FILES,
  DEFAULT_THRESHOLD: () => DEFAULT_THRESHOLD,
  DEFAULT_TOP_K: () => DEFAULT_TOP_K,
  DEFAULT_TRACE_DEPTH: () => DEFAULT_TRACE_DEPTH,
  EXCLUDE_DIRS: () => EXCLUDE_DIRS,
  EXT_TO_LANGUAGE: () => EXT_TO_LANGUAGE,
  TREE_SITTER_LANGUAGES: () => TREE_SITTER_LANGUAGES
});
var DEFAULT_EXCLUDE_FILES, DEFAULT_BATCH_SIZE, DEFAULT_TOP_K, DEFAULT_THRESHOLD, DEFAULT_TRACE_DEPTH, DEFAULT_EMBEDDING_CONFIG, EXCLUDE_DIRS, EXT_TO_LANGUAGE, TREE_SITTER_LANGUAGES;
var init_types = __esm({
  "src/types.ts"() {
    "use strict";
    DEFAULT_EXCLUDE_FILES = ["SKILL.md", "README.md", "CLAUDE.md"];
    DEFAULT_BATCH_SIZE = 32;
    DEFAULT_TOP_K = 10;
    DEFAULT_THRESHOLD = 0.5;
    DEFAULT_TRACE_DEPTH = 3;
    DEFAULT_EMBEDDING_CONFIG = {
      baseUrl: "http://localhost:11434",
      model: "qwen3-embedding:0.6b",
      dimensions: 1024,
      dimensionsFull: 2048,
      batchSize: 32,
      batchDelay: 0
    };
    EXCLUDE_DIRS = /* @__PURE__ */ new Set([
      ".git",
      "node_modules",
      "__pycache__",
      ".venv",
      "venv",
      "env",
      ".env",
      "dist",
      "build",
      ".next",
      ".nuxt",
      "target",
      "bin",
      "obj",
      ".idea",
      ".vscode",
      ".cache",
      "codesense-out"
    ]);
    EXT_TO_LANGUAGE = {
      ".py": "python",
      ".js": "javascript",
      ".jsx": "javascript",
      ".ts": "typescript",
      ".tsx": "tsx",
      ".go": "go",
      ".rs": "rust",
      ".java": "java",
      ".c": "c",
      ".h": "c",
      ".cpp": "cpp",
      ".cc": "cpp",
      ".cxx": "cpp",
      ".hpp": "cpp",
      ".md": "markdown",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".json": "json",
      ".toml": "toml",
      ".vue": "vue",
      ".svelte": "svelte"
    };
    TREE_SITTER_LANGUAGES = /* @__PURE__ */ new Set([
      "python",
      "javascript",
      "typescript",
      "tsx",
      "go",
      "rust",
      "java",
      "c",
      "cpp"
    ]);
  }
});

// src/database.ts
var database_exports = {};
__export(database_exports, {
  closeDb: () => closeDb,
  dbDeleteProjectData: () => dbDeleteProjectData,
  dbDiffManifests: () => dbDiffManifests,
  dbFindProjectByDir: () => dbFindProjectByDir,
  dbGetDepStats: () => dbGetDepStats,
  dbGetManifestCount: () => dbGetManifestCount,
  dbListProjects: () => dbListProjects,
  dbLoadConfig: () => dbLoadConfig,
  dbLoadDepGraph: () => dbLoadDepGraph,
  dbLoadGlobalConfig: () => dbLoadGlobalConfig,
  dbLoadManifest: () => dbLoadManifest,
  dbLoadRegistry: () => dbLoadRegistry,
  dbMergeDepGraph: () => dbMergeDepGraph,
  dbRegisterProject: () => dbRegisterProject,
  dbRemoveFileFromGraph: () => dbRemoveFileFromGraph,
  dbSaveConfig: () => dbSaveConfig,
  dbSaveDepGraph: () => dbSaveDepGraph,
  dbSaveGlobalConfig: () => dbSaveGlobalConfig,
  dbSaveManifest: () => dbSaveManifest,
  dbSaveManifestIncremental: () => dbSaveManifestIncremental,
  dbSaveRegistry: () => dbSaveRegistry,
  dbUnregisterProject: () => dbUnregisterProject,
  getDb: () => getDb
});
function getDb() {
  if (!_db) {
    const globalDir = path.join(os.homedir(), ".codesense");
    if (!fs.existsSync(globalDir)) {
      fs.mkdirSync(globalDir, { recursive: true });
    }
    const dbPath = path.join(globalDir, "codesense.db");
    _db = new import_better_sqlite3.default(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initializeDatabase();
    migrateFromJson();
  }
  return _db;
}
function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
function initializeDatabase() {
  const db = _db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id        INTEGER PRIMARY KEY CHECK (id = 1),
      version   INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      name       TEXT PRIMARY KEY,
      path       TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path);

    CREATE TABLE IF NOT EXISTS global_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_config (
      project_name    TEXT PRIMARY KEY REFERENCES projects(name) ON DELETE CASCADE,
      model           TEXT NOT NULL,
      dimensions      INTEGER NOT NULL,
      dimensions_full INTEGER NOT NULL,
      strategy        TEXT NOT NULL DEFAULT 'auto',
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manifest (
      project_name TEXT NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
      file_path    TEXT NOT NULL,
      sha256       TEXT NOT NULL,
      PRIMARY KEY (project_name, file_path)
    );
    CREATE INDEX IF NOT EXISTS idx_manifest_project ON manifest(project_name);

    CREATE TABLE IF NOT EXISTS dep_nodes (
      id           TEXT PRIMARY KEY,
      project_name TEXT NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
      symbol       TEXT NOT NULL,
      file         TEXT NOT NULL,
      line         INTEGER NOT NULL,
      type         TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dep_nodes_project ON dep_nodes(project_name);
    CREATE INDEX IF NOT EXISTS idx_dep_nodes_file ON dep_nodes(project_name, file);
    CREATE INDEX IF NOT EXISTS idx_dep_nodes_symbol ON dep_nodes(symbol);

    CREATE TABLE IF NOT EXISTS dep_edges (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
      from_id      TEXT NOT NULL,
      to_id        TEXT NOT NULL,
      relation     TEXT NOT NULL,
      confidence   TEXT NOT NULL DEFAULT 'EXTRACTED'
    );
    CREATE INDEX IF NOT EXISTS idx_dep_edges_project ON dep_edges(project_name);
    CREATE INDEX IF NOT EXISTS idx_dep_edges_from ON dep_edges(from_id);
    CREATE INDEX IF NOT EXISTS idx_dep_edges_to ON dep_edges(to_id);
  `);
  try {
    db.exec("ALTER TABLE project_config ADD COLUMN exclude_files TEXT");
  } catch {
  }
}
function migrateFromJson() {
  const db = _db;
  const row = db.prepare("SELECT version FROM schema_version WHERE id = 1").get();
  if (row) return;
  const globalDir = path.join(os.homedir(), ".codesense");
  const tx = db.transaction(() => {
    const regPath = path.join(globalDir, "registry.json");
    if (fs.existsSync(regPath)) {
      const registry = JSON.parse(fs.readFileSync(regPath, "utf-8"));
      const stmt = db.prepare("INSERT OR IGNORE INTO projects (name, path, created_at) VALUES (?, ?, ?)");
      for (const [name, entry] of Object.entries(registry)) {
        stmt.run(name, entry.path, entry.createdAt);
      }
    }
    const cfgPath = path.join(globalDir, "global-config.json");
    if (fs.existsSync(cfgPath)) {
      const config = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      const stmt = db.prepare("INSERT OR REPLACE INTO global_config (key, value) VALUES (?, ?)");
      if (config.model) stmt.run("model", config.model);
      if (config.ollamaUrl) stmt.run("ollamaUrl", config.ollamaUrl);
    }
    const projectsDir = path.join(globalDir, "projects");
    if (fs.existsSync(projectsDir)) {
      const projects = fs.readdirSync(projectsDir);
      for (const projName of projects) {
        const projDir = path.join(projectsDir, projName);
        if (!fs.statSync(projDir).isDirectory()) continue;
        const cPath = path.join(projDir, "config.json");
        if (fs.existsSync(cPath)) {
          const cfg = JSON.parse(fs.readFileSync(cPath, "utf-8"));
          db.prepare(
            "INSERT OR REPLACE INTO project_config (project_name, model, dimensions, dimensions_full, strategy, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).run(projName, cfg.model, cfg.dimensions, cfg.dimensionsFull, cfg.strategy, cfg.createdAt, cfg.updatedAt);
        }
        const mPath = path.join(projDir, "manifest.json");
        if (fs.existsSync(mPath)) {
          const man = JSON.parse(fs.readFileSync(mPath, "utf-8"));
          const stmt = db.prepare("INSERT OR REPLACE INTO manifest (project_name, file_path, sha256) VALUES (?, ?, ?)");
          for (const [fp, hash] of Object.entries(man)) {
            stmt.run(projName, fp, hash);
          }
        }
        const dPath = path.join(projDir, "deps.json");
        if (fs.existsSync(dPath)) {
          const deps = JSON.parse(fs.readFileSync(dPath, "utf-8"));
          const nodeStmt = db.prepare("INSERT OR REPLACE INTO dep_nodes (id, project_name, symbol, file, line, type) VALUES (?, ?, ?, ?, ?, ?)");
          for (const [id, node] of Object.entries(deps.nodes || {})) {
            nodeStmt.run(id, projName, node.symbol, node.file, node.line, node.type);
          }
          const edgeStmt = db.prepare("INSERT INTO dep_edges (project_name, from_id, to_id, relation, confidence) VALUES (?, ?, ?, ?, ?)");
          for (const edge of deps.edges || []) {
            edgeStmt.run(projName, edge.from, edge.to, edge.relation, edge.confidence);
          }
        }
      }
    }
    db.prepare("INSERT INTO schema_version (id, version, updated_at) VALUES (1, 1, ?)").run((/* @__PURE__ */ new Date()).toISOString());
  });
  tx();
}
function dbLoadRegistry() {
  const db = getDb();
  const rows = db.prepare("SELECT name, path, created_at FROM projects").all();
  const registry = {};
  for (const r of rows) {
    registry[r.name] = { name: r.name, path: r.path, createdAt: r.created_at };
  }
  return registry;
}
function dbSaveRegistry(registry) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM projects").run();
    const stmt = db.prepare("INSERT INTO projects (name, path, created_at) VALUES (?, ?, ?)");
    for (const entry of Object.values(registry)) {
      stmt.run(entry.name, entry.path, entry.createdAt);
    }
  });
  tx();
}
function dbRegisterProject(name, sourcePath) {
  const db = getDb();
  db.prepare("INSERT OR IGNORE INTO projects (name, path, created_at) VALUES (?, ?, ?)").run(name, path.resolve(sourcePath), (/* @__PURE__ */ new Date()).toISOString());
}
function dbUnregisterProject(name) {
  const db = getDb();
  db.prepare("DELETE FROM projects WHERE name = ?").run(name);
}
function dbFindProjectByDir(sourceDir) {
  const db = getDb();
  const absPath = path.resolve(sourceDir);
  const row = db.prepare("SELECT name, path, created_at FROM projects WHERE path = ?").get(absPath);
  return row ? { name: row.name, path: row.path, createdAt: row.created_at } : null;
}
function dbListProjects() {
  const db = getDb();
  const rows = db.prepare("SELECT name, path, created_at FROM projects").all();
  return rows.map((r) => ({ name: r.name, path: r.path, createdAt: r.created_at }));
}
function dbLoadGlobalConfig() {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM global_config").all();
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    model: map.model || DEFAULT_GLOBAL_CONFIG.model,
    ollamaUrl: map.ollamaUrl || DEFAULT_GLOBAL_CONFIG.ollamaUrl,
    batchSize: map.batchSize ? parseInt(map.batchSize, 10) : DEFAULT_GLOBAL_CONFIG.batchSize,
    batchDelay: map.batchDelay ? parseInt(map.batchDelay, 10) : DEFAULT_GLOBAL_CONFIG.batchDelay
  };
}
function dbSaveGlobalConfig(config) {
  const db = getDb();
  const tx = db.transaction(() => {
    const stmt = db.prepare("INSERT OR REPLACE INTO global_config (key, value) VALUES (?, ?)");
    stmt.run("model", config.model);
    stmt.run("ollamaUrl", config.ollamaUrl);
    stmt.run("batchSize", String(config.batchSize));
    stmt.run("batchDelay", String(config.batchDelay));
  });
  tx();
}
function dbLoadConfig(projectName) {
  const db = getDb();
  const row = db.prepare(
    "SELECT model, dimensions, dimensions_full, strategy, created_at, updated_at, exclude_files FROM project_config WHERE project_name = ?"
  ).get(projectName);
  if (!row) return null;
  return {
    model: row.model,
    dimensions: row.dimensions,
    dimensionsFull: row.dimensions_full,
    strategy: row.strategy,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    excludeFiles: row.exclude_files ? JSON.parse(row.exclude_files) : void 0
  };
}
function dbSaveConfig(projectName, config) {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO project_config (project_name, model, dimensions, dimensions_full, strategy, created_at, updated_at, exclude_files) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    projectName,
    config.model,
    config.dimensions,
    config.dimensionsFull,
    config.strategy,
    config.createdAt,
    config.updatedAt,
    config.excludeFiles ? JSON.stringify(config.excludeFiles) : null
  );
}
function dbLoadManifest(projectName) {
  const db = getDb();
  const rows = db.prepare("SELECT file_path, sha256 FROM manifest WHERE project_name = ?").all(projectName);
  const manifest = {};
  for (const r of rows) manifest[r.file_path] = r.sha256;
  return manifest;
}
function dbSaveManifest(projectName, manifest) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM manifest WHERE project_name = ?").run(projectName);
    const stmt = db.prepare("INSERT INTO manifest (project_name, file_path, sha256) VALUES (?, ?, ?)");
    for (const [fp, hash] of Object.entries(manifest)) {
      stmt.run(projectName, fp, hash);
    }
  });
  tx();
}
function dbDiffManifests(projectName, newManifest) {
  const db = getDb();
  db.exec("CREATE TEMP TABLE IF NOT EXISTS new_manifest (file_path TEXT PRIMARY KEY, sha256 TEXT NOT NULL)");
  db.exec("DELETE FROM new_manifest");
  const insertTemp = db.prepare("INSERT INTO new_manifest (file_path, sha256) VALUES (?, ?)");
  const insertMany = db.transaction((entries) => {
    for (const [fp, hash] of entries) insertTemp.run(fp, hash);
  });
  insertMany(Object.entries(newManifest));
  const added = db.prepare(`
    SELECT n.file_path FROM new_manifest n
    LEFT JOIN manifest m ON m.project_name = ? AND m.file_path = n.file_path
    WHERE m.file_path IS NULL
  `).all(projectName).map((r) => r.file_path);
  const modified = db.prepare(`
    SELECT n.file_path FROM new_manifest n
    JOIN manifest m ON m.project_name = ? AND m.file_path = n.file_path
    WHERE m.sha256 != n.sha256
  `).all(projectName).map((r) => r.file_path);
  const deleted = db.prepare(`
    SELECT m.file_path FROM manifest m
    LEFT JOIN new_manifest n ON m.file_path = n.file_path
    WHERE m.project_name = ? AND n.file_path IS NULL
  `).all(projectName).map((r) => r.file_path);
  db.exec("DELETE FROM new_manifest");
  return { added, modified, deleted };
}
function dbSaveManifestIncremental(projectName, toUpsert, toDelete) {
  const db = getDb();
  const upsertStmt = db.prepare("INSERT OR REPLACE INTO manifest (project_name, file_path, sha256) VALUES (?, ?, ?)");
  const deleteStmt = db.prepare("DELETE FROM manifest WHERE project_name = ? AND file_path = ?");
  const tx = db.transaction(() => {
    for (const [fp, hash] of Object.entries(toUpsert)) upsertStmt.run(projectName, fp, hash);
    for (const fp of toDelete) deleteStmt.run(projectName, fp);
  });
  tx();
}
function dbLoadDepGraph(projectName) {
  const db = getDb();
  const nodes = {};
  const nodeRows = db.prepare("SELECT id, symbol, file, line, type FROM dep_nodes WHERE project_name = ?").all(projectName);
  for (const r of nodeRows) {
    nodes[r.id] = { symbol: r.symbol, file: r.file, line: r.line, type: r.type };
  }
  const edges = db.prepare("SELECT from_id, to_id, relation, confidence FROM dep_edges WHERE project_name = ?").all(projectName);
  return {
    nodes,
    edges: edges.map((e) => ({ from: e.from_id, to: e.to_id, relation: e.relation, confidence: e.confidence }))
  };
}
function dbSaveDepGraph(projectName, graph) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM dep_edges WHERE project_name = ?").run(projectName);
    db.prepare("DELETE FROM dep_nodes WHERE project_name = ?").run(projectName);
    const nodeStmt = db.prepare("INSERT INTO dep_nodes (id, project_name, symbol, file, line, type) VALUES (?, ?, ?, ?, ?, ?)");
    for (const [id, node] of Object.entries(graph.nodes)) {
      nodeStmt.run(id, projectName, node.symbol, node.file, node.line, node.type);
    }
    const edgeStmt = db.prepare("INSERT INTO dep_edges (project_name, from_id, to_id, relation, confidence) VALUES (?, ?, ?, ?, ?)");
    for (const edge of graph.edges) {
      if (typeof edge.from === "string" && typeof edge.to === "string") {
        edgeStmt.run(projectName, edge.from, edge.to, edge.relation || "calls", edge.confidence || "EXTRACTED");
      }
    }
  });
  tx();
}
function dbRemoveFileFromGraph(projectName, filePath) {
  const db = getDb();
  const tx = db.transaction(() => {
    const nodeIds = db.prepare("SELECT id FROM dep_nodes WHERE project_name = ? AND file = ?").all(projectName, filePath).map((r) => r.id);
    if (nodeIds.length === 0) return;
    const placeholders = nodeIds.map(() => "?").join(",");
    db.prepare(`DELETE FROM dep_edges WHERE project_name = ? AND (from_id IN (${placeholders}) OR to_id IN (${placeholders}))`).run(projectName, ...nodeIds, ...nodeIds);
    db.prepare(`DELETE FROM dep_nodes WHERE project_name = ? AND id IN (${placeholders})`).run(projectName, ...nodeIds);
  });
  tx();
}
function dbMergeDepGraph(projectName, incoming) {
  const db = getDb();
  const tx = db.transaction(() => {
    const upsertNode = db.prepare("INSERT OR REPLACE INTO dep_nodes (id, project_name, symbol, file, line, type) VALUES (?, ?, ?, ?, ?, ?)");
    for (const [id, node] of Object.entries(incoming.nodes)) {
      upsertNode.run(id, projectName, node.symbol, node.file, node.line, node.type);
    }
    const insertEdge = db.prepare("INSERT OR IGNORE INTO dep_edges (project_name, from_id, to_id, relation, confidence) VALUES (?, ?, ?, ?, ?)");
    for (const edge of incoming.edges) {
      insertEdge.run(projectName, edge.from, edge.to, edge.relation, edge.confidence);
    }
  });
  tx();
}
function dbDeleteProjectData(projectName) {
  const db = getDb();
  db.prepare("DELETE FROM projects WHERE name = ?").run(projectName);
}
function dbGetManifestCount(projectName) {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM manifest WHERE project_name = ?").get(projectName);
  return row.count;
}
function dbGetDepStats(projectName) {
  const db = getDb();
  const nodes = db.prepare("SELECT COUNT(*) as count FROM dep_nodes WHERE project_name = ?").get(projectName);
  const edges = db.prepare("SELECT COUNT(*) as count FROM dep_edges WHERE project_name = ?").get(projectName);
  return { nodeCount: nodes.count, edgeCount: edges.count };
}
var import_better_sqlite3, fs, path, os, DEFAULT_GLOBAL_CONFIG, _db;
var init_database = __esm({
  "src/database.ts"() {
    "use strict";
    import_better_sqlite3 = __toESM(require("better-sqlite3"));
    fs = __toESM(require("fs"));
    path = __toESM(require("path"));
    os = __toESM(require("os"));
    DEFAULT_GLOBAL_CONFIG = {
      model: "qwen3-embedding:0.6b",
      ollamaUrl: "http://localhost:11434",
      batchSize: 32,
      batchDelay: 0
    };
    _db = null;
  }
});

// src/embedder.ts
var embedder_exports = {};
__export(embedder_exports, {
  OllamaEmbedder: () => OllamaEmbedder,
  createEmbedderFromGlobalConfig: () => createEmbedderFromGlobalConfig
});
function createEmbedderFromGlobalConfig(dimensions) {
  const gc = dbLoadGlobalConfig();
  return new OllamaEmbedder({
    baseUrl: gc.ollamaUrl,
    model: gc.model,
    dimensions,
    batchSize: gc.batchSize,
    batchDelay: gc.batchDelay
  });
}
var OllamaEmbedder;
var init_embedder = __esm({
  "src/embedder.ts"() {
    "use strict";
    init_types();
    init_database();
    OllamaEmbedder = class {
      config;
      constructor(config) {
        this.config = { ...DEFAULT_EMBEDDING_CONFIG, ...config };
      }
      async checkHealth() {
        try {
          const resp = await fetch(`${this.config.baseUrl}/api/tags`);
          if (!resp.ok) {
            return { ok: false, modelAvailable: false, error: `HTTP ${resp.status}` };
          }
          const data = await resp.json();
          const modelAvailable = data.models.some(
            (m) => m.name === this.config.model || m.name.startsWith(this.config.model + ":")
          );
          return { ok: true, modelAvailable, error: modelAvailable ? void 0 : `\u6A21\u578B ${this.config.model} \u672A\u627E\u5230` };
        } catch (e) {
          return {
            ok: false,
            modelAvailable: false,
            error: `Ollama \u4E0D\u53EF\u7528 (${this.config.baseUrl}): ${e.message}\u3002\u8BF7\u786E\u8BA4 Ollama \u6B63\u5728\u8FD0\u884C\u3002`
          };
        }
      }
      async ensureModel() {
        const health = await this.checkHealth();
        if (!health.ok) {
          console.error(`\u9519\u8BEF: ${health.error}`);
          console.error("\u8BF7\u5148\u5B89\u88C5\u5E76\u542F\u52A8 Ollama: https://ollama.com");
          process.exit(1);
        }
        if (!health.modelAvailable) {
          console.error(`\u9519\u8BEF: \u6A21\u578B ${this.config.model} \u672A\u627E\u5230`);
          console.error(`\u8BF7\u8FD0\u884C: ollama pull ${this.config.model}`);
          process.exit(1);
        }
      }
      async embed(texts, onProgress) {
        if (texts.length === 0) return [];
        const results = [];
        const batchSize = this.config.batchSize;
        const totalBatches = Math.ceil(texts.length / batchSize);
        for (let i = 0; i < texts.length; i += batchSize) {
          const batch = texts.slice(i, i + batchSize);
          const batchNum = Math.floor(i / batchSize) + 1;
          if (totalBatches > 1) {
            process.stderr.write(`  Embedding batch ${batchNum}/${totalBatches}...
`);
            onProgress?.(batchNum, totalBatches);
          }
          const resp = await fetch(`${this.config.baseUrl}/api/embed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: this.config.model, input: batch })
          });
          if (!resp.ok) {
            const errText = await resp.text();
            throw new Error(`Ollama embed API \u9519\u8BEF (HTTP ${resp.status}): ${errText}`);
          }
          const data = await resp.json();
          if (!data.embeddings || data.embeddings.length !== batch.length) {
            throw new Error(`Ollama \u8FD4\u56DE\u7684 embeddings \u6570\u91CF\u4E0D\u5339\u914D: \u671F\u671B ${batch.length}, \u5B9E\u9645 ${data.embeddings?.length}`);
          }
          const truncated = data.embeddings.map((e) => e.slice(0, this.config.dimensions));
          results.push(...truncated);
          if (this.config.batchDelay > 0 && i + batchSize < texts.length) {
            await new Promise((resolve9) => setTimeout(resolve9, this.config.batchDelay));
          }
        }
        return results;
      }
      async embedQuery(text) {
        const results = await this.embed([text]);
        return results[0];
      }
      getConfig() {
        return { ...this.config };
      }
    };
  }
});

// src/global.ts
var global_exports = {};
__export(global_exports, {
  ensureGlobalDir: () => ensureGlobalDir,
  ensureProjectDir: () => ensureProjectDir,
  findProjectByDir: () => findProjectByDir,
  getGlobalDir: () => getGlobalDir,
  getProjectDir: () => getProjectDir,
  listProjects: () => listProjects,
  loadGlobalConfig: () => loadGlobalConfig,
  loadRegistry: () => loadRegistry,
  registerProject: () => registerProject,
  resolveProjectName: () => resolveProjectName,
  saveGlobalConfig: () => saveGlobalConfig,
  saveRegistry: () => saveRegistry,
  unregisterProject: () => unregisterProject
});
function getGlobalDir() {
  return path2.join(os2.homedir(), ".codesense");
}
function ensureGlobalDir() {
  const dir = getGlobalDir();
  const subdirs = ["projects", "cache"];
  if (!fs2.existsSync(dir)) {
    fs2.mkdirSync(dir, { recursive: true });
  }
  for (const sub of subdirs) {
    const subPath = path2.join(dir, sub);
    if (!fs2.existsSync(subPath)) {
      fs2.mkdirSync(subPath, { recursive: true });
    }
  }
  return dir;
}
function loadRegistry() {
  return dbLoadRegistry();
}
function saveRegistry(registry) {
  dbSaveRegistry(registry);
}
function loadGlobalConfig() {
  const config = dbLoadGlobalConfig();
  return { ...DEFAULT_GLOBAL_CONFIG2, ...config };
}
function saveGlobalConfig(config) {
  dbSaveGlobalConfig(config);
}
function resolveProjectName(sourceDir) {
  return path2.basename(path2.resolve(sourceDir));
}
function registerProject(name, sourcePath) {
  dbRegisterProject(name, sourcePath);
}
function unregisterProject(name) {
  dbUnregisterProject(name);
}
function getProjectDir(name) {
  return path2.join(getGlobalDir(), "projects", name);
}
function ensureProjectDir(name) {
  const dir = getProjectDir(name);
  if (!fs2.existsSync(dir)) {
    fs2.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
function findProjectByDir(sourceDir) {
  return dbFindProjectByDir(sourceDir);
}
function listProjects() {
  return dbListProjects();
}
var fs2, os2, path2, DEFAULT_GLOBAL_CONFIG2;
var init_global = __esm({
  "src/global.ts"() {
    "use strict";
    fs2 = __toESM(require("fs"));
    os2 = __toESM(require("os"));
    path2 = __toESM(require("path"));
    init_database();
    DEFAULT_GLOBAL_CONFIG2 = {
      model: "qwen3-embedding:0.6b",
      ollamaUrl: "http://localhost:11434",
      batchSize: 32,
      batchDelay: 0
    };
  }
});

// src/install.ts
var install_exports = {};
__export(install_exports, {
  CLAUDE_MD_END_MARKER: () => CLAUDE_MD_END_MARKER,
  CLAUDE_MD_MARKER: () => CLAUDE_MD_MARKER,
  HOOK_MARKER: () => HOOK_MARKER,
  init: () => init,
  loadProjectConfig: () => loadProjectConfig
});
function getSkillCommand() {
  return `node "${path3.resolve(__dirname, "skill.js")}"`;
}
function getClaudeMdInjection() {
  const cmd = getSkillCommand();
  return `
${CLAUDE_MD_MARKER}
## codesense

\u672C\u9879\u76EE\u6709 codesense \u8BED\u4E49\u4EE3\u7801\u7D22\u5F15\u3002

Rules:
- \u56DE\u7B54"\u8FD9\u6BB5\u4EE3\u7801\u5728\u54EA"\u3001"\u600E\u4E48\u5B9E\u73B0 X"\u7C7B\u95EE\u9898\u65F6\uFF0C\u5148\u8FD0\u884C \`${cmd} search "<\u95EE\u9898\u63CF\u8FF0>"\`
- \u9700\u8981\u7406\u89E3\u8C03\u7528\u94FE\u3001\u5F71\u54CD\u8303\u56F4\u65F6\uFF0C\u8FD0\u884C \`${cmd} trace "<\u7B26\u53F7\u540D>"\`
- \u4FEE\u6539\u4EE3\u7801\u540E\uFF0C\u8FD0\u884C \`${cmd} update\` \u589E\u91CF\u66F4\u65B0\uFF08\u5982\u5DF2\u5B89\u88C5 hook \u5219\u81EA\u52A8\u89E6\u53D1\uFF09
- \u641C\u7D22\u8FD4\u56DE\u7684\u662F chunk \u7EA7\u7ED3\u679C\uFF0C\u4ECD\u9700\u8BFB\u53D6\u6E90\u6587\u4EF6\u786E\u8BA4\u5B8C\u6574\u4E0A\u4E0B\u6587
${CLAUDE_MD_END_MARKER}
`;
}
function checkNodeVersion() {
  const major = parseInt(process.versions.node.split(".")[0], 10);
  if (major < 22) {
    console.error(`\u2717 Node.js \u7248\u672C\u8FC7\u4F4E: v${process.versions.node}\uFF0C\u9700\u8981 >= 22`);
    console.error("  \u8BF7\u5347\u7EA7 Node.js: https://nodejs.org");
    process.exit(1);
  }
  console.log(`\u2713 Node.js v${process.versions.node}`);
}
function findPackageManager() {
  try {
    (0, import_child_process.execSync)("pnpm --version", { stdio: "pipe" });
    return { cmd: "pnpm", name: "pnpm" };
  } catch {
  }
  try {
    (0, import_child_process.execSync)("npm --version", { stdio: "pipe" });
    return { cmd: "npm", name: "npm" };
  } catch {
  }
  return { cmd: "", name: "" };
}
function installDependencies() {
  const skillDir = __dirname;
  const nodeModules = path3.join(skillDir, "node_modules");
  if (fs3.existsSync(nodeModules)) {
    console.log("\u2713 \u4F9D\u8D56\u5DF2\u5B89\u88C5");
    return;
  }
  const pm = findPackageManager();
  if (!pm.cmd) {
    console.error("\u2717 \u672A\u627E\u5230 pnpm \u6216 npm");
    console.error("  \u8BF7\u5B89\u88C5 pnpm: npm install -g pnpm");
    process.exit(1);
  }
  console.log(`\u5B89\u88C5\u4F9D\u8D56 (${pm.name} install)...`);
  try {
    (0, import_child_process.execSync)(`${pm.cmd} install`, { cwd: skillDir, stdio: "inherit" });
    console.log("\u2713 \u4F9D\u8D56\u5B89\u88C5\u5B8C\u6210");
  } catch {
    console.error("\u2717 \u4F9D\u8D56\u5B89\u88C5\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u8FD0\u884C: " + pm.cmd + " install");
    process.exit(1);
  }
}
async function checkOllama() {
  console.log("\u68C0\u67E5 Ollama \u670D\u52A1...");
  const embedder = new OllamaEmbedder();
  const health = await embedder.checkHealth();
  if (!health.ok) {
    console.error(`\u2717 Ollama \u4E0D\u53EF\u7528: ${health.error}`);
    console.error("  \u8BF7\u5148\u5B89\u88C5\u5E76\u542F\u52A8 Ollama: https://ollama.com");
    process.exit(1);
  }
  console.log("\u2713 Ollama \u670D\u52A1\u6B63\u5E38");
}
async function checkOrPullModel() {
  const modelName = "qwen3-embedding:0.6b";
  const embedder = new OllamaEmbedder();
  const health = await embedder.checkHealth();
  if (health.modelAvailable) {
    console.log(`\u2713 \u6A21\u578B ${modelName} \u5DF2\u5C31\u7EEA`);
    return;
  }
  console.log(`\u26A0 \u6A21\u578B ${modelName} \u672A\u627E\u5230`);
  console.log(`  \u9700\u8981\u4E0B\u8F7D\u6A21\u578B (\u7EA6 500MB)\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F`);
  if (!process.stdin.isTTY) {
    console.log(`  \u6B63\u5728\u4E0B\u8F7D ${modelName}...`);
    try {
      (0, import_child_process.execSync)(`ollama pull ${modelName}`, { stdio: "inherit" });
      console.log(`\u2713 \u6A21\u578B ${modelName} \u4E0B\u8F7D\u5B8C\u6210`);
    } catch {
      console.error(`\u2717 \u6A21\u578B\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u8FD0\u884C: ollama pull ${modelName}`);
      process.exit(1);
    }
    return;
  }
  process.stdout.write("  \u8F93\u5165 y \u786E\u8BA4\u4E0B\u8F7D: ");
  const answer = await new Promise((resolve9) => {
    process.stdin.once("data", (data) => resolve9(data.toString().trim().toLowerCase()));
    setTimeout(() => resolve9("n"), 3e4);
  });
  if (answer !== "y" && answer !== "yes") {
    console.error(`\u2717 \u8BF7\u624B\u52A8\u8FD0\u884C: ollama pull ${modelName} \u540E\u91CD\u65B0 init`);
    process.exit(1);
  }
  console.log(`  \u6B63\u5728\u4E0B\u8F7D ${modelName}...`);
  try {
    (0, import_child_process.execSync)(`ollama pull ${modelName}`, { stdio: "inherit" });
    console.log(`\u2713 \u6A21\u578B ${modelName} \u4E0B\u8F7D\u5B8C\u6210`);
  } catch {
    console.error(`\u2717 \u6A21\u578B\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u8FD0\u884C: ollama pull ${modelName}`);
    process.exit(1);
  }
}
function initializeDatabase2() {
  ensureGlobalDir();
  getDb();
  dbSaveGlobalConfig({ model: "qwen3-embedding:0.6b", ollamaUrl: "http://localhost:11434", batchSize: 32, batchDelay: 0 });
  console.log("\u2713 \u6570\u636E\u5E93\u5DF2\u521D\u59CB\u5316 (~/.codesense/codesense.db)");
}
function integrateProject(absDir, projectName) {
  registerProject(projectName, absDir);
  console.log(`\u2713 \u9879\u76EE "${projectName}" \u5DF2\u6CE8\u518C`);
  checkProjectConfig(absDir);
  checkClaudeMd(absDir);
  checkGitHook(absDir);
  checkUncommittedChanges(absDir);
}
function checkProjectConfig(absDir) {
  const configDir = path3.join(absDir, PROJECT_CONFIG_DIR);
  const configPath = path3.join(configDir, PROJECT_CONFIG_FILE);
  if (fs3.existsSync(configPath)) {
    console.log("\u2713 \u9879\u76EE\u914D\u7F6E .codesense/index.json \u5DF2\u5B58\u5728");
    return;
  }
  if (!fs3.existsSync(configDir)) {
    fs3.mkdirSync(configDir, { recursive: true });
  }
  fs3.writeFileSync(configPath, JSON.stringify(DEFAULT_PROJECT_CONFIG, null, 2) + "\n", "utf-8");
  console.log("\u2713 \u5DF2\u521B\u5EFA .codesense/index.json\uFF08\u9ED8\u8BA4\u6392\u9664\u89C4\u5219\uFF09");
}
function loadProjectConfig(absDir) {
  const configPath = path3.join(absDir, PROJECT_CONFIG_DIR, PROJECT_CONFIG_FILE);
  if (!fs3.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs3.readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}
function checkClaudeMd(absDir) {
  const claudeMdPath = path3.resolve(absDir, "CLAUDE.md");
  const injection = getClaudeMdInjection();
  if (!fs3.existsSync(claudeMdPath)) {
    fs3.writeFileSync(claudeMdPath, injection.trimStart(), "utf-8");
    console.log("\u2713 \u5DF2\u521B\u5EFA CLAUDE.md \u5E76\u6CE8\u5165 codesense \u4F7F\u7528\u8BF4\u660E");
    return;
  }
  const content = fs3.readFileSync(claudeMdPath, "utf-8");
  if (!content.includes(CLAUDE_MD_MARKER)) {
    fs3.writeFileSync(claudeMdPath, content + injection, "utf-8");
    console.log("\u2713 \u5DF2\u5411 CLAUDE.md \u6CE8\u5165 codesense \u4F7F\u7528\u8BF4\u660E");
    return;
  }
  const startIdx = content.indexOf(CLAUDE_MD_MARKER);
  const endIdx = content.indexOf(CLAUDE_MD_END_MARKER);
  if (endIdx === -1 || endIdx <= startIdx) {
    const before = content.slice(0, startIdx);
    fs3.writeFileSync(claudeMdPath, before + injection, "utf-8");
    console.log("\u2713 CLAUDE.md codesense \u6BB5\u843D\u5DF2\u4FEE\u590D\uFF08\u4E4B\u524D\u7684\u5185\u5BB9\u4E0D\u5B8C\u6574\uFF09");
    return;
  }
  console.log("\u2713 CLAUDE.md codesense \u6BB5\u843D\u6B63\u5E38");
}
function checkGitHook(absDir) {
  const gitDir = path3.resolve(absDir, ".git");
  if (!fs3.existsSync(gitDir)) {
    console.log("\u26A0 \u5F53\u524D\u76EE\u5F55\u4E0D\u662F git \u4ED3\u5E93\u3002");
    console.log("  codesense \u4F9D\u8D56 git \u8FDB\u884C\u589E\u91CF\u66F4\u65B0\uFF0C\u6B63\u5728\u6267\u884C git init...");
    try {
      (0, import_child_process.execSync)("git init", { cwd: absDir, stdio: "inherit" });
      console.log("\u2713 git \u4ED3\u5E93\u5DF2\u521D\u59CB\u5316");
    } catch {
      console.error("\u2717 git init \u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u8FD0\u884C: git init");
      process.exit(1);
    }
  }
  const skillCmd = getSkillCommand();
  const hookCmd = `nohup ${skillCmd} update --quiet </dev/null >/dev/null 2>&1 &`;
  let hooksPath = null;
  try {
    const hp = (0, import_child_process.execSync)("git config core.hooksPath", { cwd: absDir, encoding: "utf-8", timeout: 3e3 }).trim();
    if (hp) hooksPath = hp;
  } catch {
  }
  if (hooksPath) {
    const huskyDir = path3.resolve(absDir, hooksPath, "..");
    const huskyHook = path3.join(huskyDir, "post-commit");
    writeOrUpdateHook(huskyHook, skillCmd, hookCmd);
  } else {
    const hookDir = path3.join(gitDir, "hooks");
    if (!fs3.existsSync(hookDir)) fs3.mkdirSync(hookDir, { recursive: true });
    writeOrUpdateHook(path3.join(hookDir, "post-commit"), skillCmd, hookCmd);
  }
}
function writeOrUpdateHook(hookPath, skillCmd, hookCmd) {
  const hookContent = `#!/bin/sh
${HOOK_MARKER}
${hookCmd}
`;
  if (!fs3.existsSync(hookPath)) {
    fs3.writeFileSync(hookPath, hookContent, "utf-8");
    fs3.chmodSync(hookPath, 493);
    console.log("\u2713 \u5DF2\u521B\u5EFA post-commit hook\uFF08codesense \u81EA\u52A8\u66F4\u65B0\uFF09");
    return;
  }
  const content = fs3.readFileSync(hookPath, "utf-8");
  if (!content.includes(HOOK_MARKER)) {
    fs3.writeFileSync(hookPath, content + "\n" + HOOK_MARKER + "\n" + hookCmd + "\n", "utf-8");
    console.log("\u2713 \u5DF2\u5411 post-commit hook \u8FFD\u52A0 codesense \u66F4\u65B0");
    return;
  }
  const lines = content.split("\n");
  const markerIdx = lines.findIndex((l) => l.includes(HOOK_MARKER));
  if (markerIdx >= 0 && markerIdx + 1 < lines.length) {
    const cmdLine = lines[markerIdx + 1];
    if (cmdLine.includes(skillCmd) && cmdLine.trim() !== hookCmd) {
      lines[markerIdx + 1] = hookCmd;
      fs3.writeFileSync(hookPath, lines.join("\n"), "utf-8");
      console.log("\u2713 post-commit hook \u5DF2\u66F4\u65B0\uFF08\u5F02\u6B65\u6A21\u5F0F\uFF09");
      return;
    }
  }
  try {
    fs3.accessSync(hookPath, fs3.constants.X_OK);
    console.log("\u2713 post-commit hook \u6B63\u5E38");
  } catch {
    fs3.chmodSync(hookPath, 493);
    console.log("\u2713 post-commit hook \u5DF2\u4FEE\u590D\u53EF\u6267\u884C\u6743\u9650");
  }
}
function checkUncommittedChanges(absDir) {
  try {
    const output = (0, import_child_process.execSync)("git status --porcelain", {
      cwd: absDir,
      encoding: "utf-8",
      timeout: 5e3
    }).trim();
    if (!output) return;
    const lines = output.split("\n");
    const staged = lines.filter((l) => l.match(/^[MADRC]/)).length;
    const unstaged = lines.filter((l) => l.match(/^ [MADRC?]/)).length;
    if (staged > 0 || unstaged > 0) {
      console.log(`\u26A0 \u6709\u672A\u63D0\u4EA4\u7684\u53D8\u66F4 (${staged} \u5DF2\u6682\u5B58, ${unstaged} \u672A\u6682\u5B58)`);
      console.log("  \u63D0\u4EA4\u540E post-commit hook \u5C06\u81EA\u52A8\u89E6\u53D1\u589E\u91CF\u66F4\u65B0");
    }
  } catch {
  }
}
async function init(projectDir) {
  const absDir = path3.resolve(projectDir || ".");
  const projectName = resolveProjectName(absDir);
  console.log("codesense \u521D\u59CB\u5316\n");
  console.log("--- \u73AF\u5883\u68C0\u67E5 ---");
  checkNodeVersion();
  installDependencies();
  console.log("\n--- \u5916\u90E8\u670D\u52A1 ---");
  await checkOllama();
  await checkOrPullModel();
  console.log("\n--- \u6570\u636E\u521D\u59CB\u5316 ---");
  initializeDatabase2();
  console.log("\n--- \u9879\u76EE\u96C6\u6210 ---");
  integrateProject(absDir, projectName);
  console.log(`
\u521D\u59CB\u5316\u5B8C\u6210\uFF01\u9879\u76EE: ${projectName}`);
  console.log(`  \u8FD0\u884C \`codesense index ${absDir}\` \u5EFA\u7ACB\u9996\u6B21\u7D22\u5F15\uFF08\u81EA\u52A8\u540E\u53F0\u6267\u884C\uFF09\u3002`);
}
var fs3, path3, import_child_process, CLAUDE_MD_MARKER, CLAUDE_MD_END_MARKER, HOOK_MARKER, PROJECT_CONFIG_DIR, PROJECT_CONFIG_FILE, DEFAULT_PROJECT_CONFIG;
var init_install = __esm({
  "src/install.ts"() {
    "use strict";
    fs3 = __toESM(require("fs"));
    path3 = __toESM(require("path"));
    import_child_process = require("child_process");
    init_embedder();
    init_global();
    init_database();
    CLAUDE_MD_MARKER = "<!-- codesense-start -->";
    CLAUDE_MD_END_MARKER = "<!-- codesense-end -->";
    HOOK_MARKER = "# codesense auto-update";
    PROJECT_CONFIG_DIR = ".codesense";
    PROJECT_CONFIG_FILE = "index.json";
    DEFAULT_PROJECT_CONFIG = {
      excludeFiles: ["SKILL.md", "README.md", "CLAUDE.md", "*.test.ts", "*.test.js", "*.spec.ts", "*.spec.js", "*.min.js", "*.min.css", "*.bundle.js"],
      excludeDirs: []
    };
  }
});

// src/notify.ts
var notify_exports = {};
__export(notify_exports, {
  notifyServer: () => notifyServer
});
async function notifyServer(event, data) {
  const port = parseInt(process.env.CODESENSE_PORT || String(DEFAULT_PORT), 10);
  try {
    await fetch(`http://localhost:${port}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      signal: AbortSignal.timeout(2e3)
    });
  } catch {
  }
}
var DEFAULT_PORT;
var init_notify = __esm({
  "src/notify.ts"() {
    "use strict";
    DEFAULT_PORT = 54321;
  }
});

// src/config.ts
var config_exports = {};
__export(config_exports, {
  ensureProjectOutputDir: () => ensureProjectOutputDir,
  getProjectOutputDir: () => getProjectOutputDir,
  loadConfig: () => loadConfig,
  resolveDimensions: () => resolveDimensions,
  saveConfig: () => saveConfig,
  showStatus: () => showStatus
});
function resolveDimensions(_chunkCount, strategy) {
  switch (strategy) {
    case "quality":
      return 1024;
    case "performance":
      return 1024;
    case "auto":
    default:
      return 1024;
  }
}
function loadConfig(projectName) {
  return dbLoadConfig(projectName);
}
function saveConfig(projectName, config) {
  dbSaveConfig(projectName, config);
}
function getProjectOutputDir(projectName) {
  return getProjectDir(projectName);
}
function ensureProjectOutputDir(projectName) {
  return ensureProjectDir(projectName);
}
async function showStatus(projectName) {
  if (projectName) {
    showProjectStatus(projectName);
    return;
  }
  const entry = findProjectByDir(".");
  if (entry) {
    showProjectStatus(entry.name);
    return;
  }
  const projects = listProjects();
  if (projects.length === 0) {
    console.log("\u6CA1\u6709\u5DF2\u6CE8\u518C\u7684\u9879\u76EE\u3002\u8FD0\u884C `codesense init` \u521D\u59CB\u5316\u3002");
    return;
  }
  console.log("codesense \u5168\u5C40\u72B6\u6001:");
  console.log(`  \u76EE\u5F55: ${getGlobalDir()}`);
  console.log(`  \u5DF2\u6CE8\u518C\u9879\u76EE: ${projects.length}
`);
  for (const p of projects) {
    console.log(`  ${p.name}`);
    console.log(`    \u8DEF\u5F84: ${p.path}`);
    const config = loadConfig(p.name);
    if (config) {
      console.log(`    \u6A21\u578B: ${config.model}  \u7EF4\u5EA6: ${config.dimensions}  \u66F4\u65B0: ${config.updatedAt}`);
    } else {
      console.log(`    (\u672A\u5EFA\u7D22\u5F15)`);
    }
  }
}
function showProjectStatus(projectName) {
  const config = loadConfig(projectName);
  if (!config) {
    console.log(`\u9879\u76EE "${projectName}" \u672A\u5EFA\u7D22\u5F15\u3002\u8FD0\u884C \`codesense index <\u76EE\u5F55>\` \u5EFA\u7ACB\u7D22\u5F15\u3002`);
    return;
  }
  console.log(`codesense \u7D22\u5F15\u72B6\u6001 [${projectName}]:`);
  console.log(`  \u6A21\u578B:     ${config.model}`);
  console.log(`  \u7EF4\u5EA6:     ${config.dimensions}`);
  console.log(`  \u7B56\u7565:     ${config.strategy}`);
  console.log(`  \u521B\u5EFA\u65F6\u95F4: ${config.createdAt}`);
  console.log(`  \u66F4\u65B0\u65F6\u95F4: ${config.updatedAt}`);
  const fileCount = dbGetManifestCount(projectName);
  console.log(`  \u6587\u4EF6\u6570:   ${fileCount}`);
  const { nodeCount, edgeCount } = dbGetDepStats(projectName);
  console.log(`  \u4F9D\u8D56\u8282\u70B9: ${nodeCount}`);
  console.log(`  \u4F9D\u8D56\u8FB9:   ${edgeCount}`);
}
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    init_global();
    init_database();
  }
});

// scripts/forward.ts
var forward_exports = {};
__export(forward_exports, {
  ensureServer: () => ensureServer,
  forwardToServer: () => forwardToServer
});
function isServerReady() {
  return new Promise((resolve9) => {
    const req = http.request(
      { hostname: "localhost", port: DEFAULT_PORT2, path: "/api/status", method: "GET", timeout: 1500 },
      (res) => {
        res.resume();
        res.on("end", () => resolve9(res.statusCode === 200));
      }
    );
    req.on("error", () => resolve9(false));
    req.on("timeout", () => {
      req.destroy();
      resolve9(false);
    });
    req.end();
  });
}
function startServerInBackground() {
  const skillJs = path4.resolve(__dirname, "..", "skill.js");
  const child = (0, import_child_process2.spawn)("node", [skillJs, "server", "--port", String(DEFAULT_PORT2)], {
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  child.unref();
  console.log(`\u540E\u53F0\u542F\u52A8 server (PID: ${child.pid})...`);
}
async function ensureServer() {
  if (await isServerReady()) return;
  startServerInBackground();
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    if (await isServerReady()) {
      console.log(`server \u5DF2\u5C31\u7EEA: http://localhost:${DEFAULT_PORT2}`);
      return;
    }
  }
  console.log("server \u542F\u52A8\u8D85\u65F6\uFF0C\u5C06\u672C\u5730\u6267\u884C");
}
async function forwardToServer(action, projectName) {
  await ensureServer();
  return new Promise((resolve9) => {
    const postData = JSON.stringify({});
    const req = http.request(
      {
        hostname: "localhost",
        port: DEFAULT_PORT2,
        path: `/api/${action}/${encodeURIComponent(projectName)}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
        timeout: 5e3
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(body);
              console.log(data.data?.message || `\u5DF2\u63D0\u4EA4\u540E\u53F0${action === "index" ? "\u7D22\u5F15" : "\u66F4\u65B0"}\u4EFB\u52A1: ${projectName}`);
            } catch {
              console.log(`\u5DF2\u63D0\u4EA4\u540E\u53F0\u4EFB\u52A1: ${projectName}`);
            }
            resolve9(true);
          } else {
            resolve9(false);
          }
        });
      }
    );
    req.on("error", () => resolve9(false));
    req.on("timeout", () => {
      req.destroy();
      resolve9(false);
    });
    req.write(postData);
    req.end();
  });
}
var http, import_child_process2, path4, DEFAULT_PORT2, MAX_WAIT_MS, POLL_INTERVAL_MS;
var init_forward = __esm({
  "scripts/forward.ts"() {
    "use strict";
    http = __toESM(require("http"));
    import_child_process2 = require("child_process");
    path4 = __toESM(require("path"));
    DEFAULT_PORT2 = 54321;
    MAX_WAIT_MS = 8e3;
    POLL_INTERVAL_MS = 300;
  }
});

// src/parser.ts
function getParserClass() {
  if (!_Parser) {
    _Parser = require("tree-sitter");
  }
  return _Parser;
}
function getLanguage(lang) {
  if (_languageCache[lang]) return _languageCache[lang];
  let mod;
  switch (lang) {
    case "python":
      mod = require("tree-sitter-python");
      break;
    case "javascript":
      mod = require("tree-sitter-javascript");
      break;
    case "typescript":
      mod = require("tree-sitter-typescript").typescript;
      break;
    case "tsx":
      mod = require("tree-sitter-typescript").tsx;
      break;
    case "go":
      mod = require("tree-sitter-go");
      break;
    case "rust":
      mod = require("tree-sitter-rust");
      break;
    case "java":
      mod = require("tree-sitter-java");
      break;
    case "c":
      mod = require("tree-sitter-c");
      break;
    case "cpp":
      mod = require("tree-sitter-cpp");
      break;
    default:
      return null;
  }
  _languageCache[lang] = mod;
  return mod;
}
function getNodeText(node, content) {
  return content.slice(node.startIndex, node.endIndex);
}
var _Parser, _languageCache;
var init_parser = __esm({
  "src/parser.ts"() {
    "use strict";
    _Parser = null;
    _languageCache = {};
  }
});

// src/chunker.ts
var chunker_exports = {};
__export(chunker_exports, {
  buildEmbeddingInput: () => buildEmbeddingInput,
  chunkFile: () => chunkFile
});
function computeHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}
function buildEmbeddingInput(chunk) {
  return `${chunk.context}

${chunk.symbol} (${chunk.chunkType}, ${chunk.filePath}:${chunk.lineStart}):
${chunk.text}`;
}
function chunkFile(filePath, content, language) {
  switch (language) {
    case "python":
    case "javascript":
    case "typescript":
    case "tsx":
    case "go":
    case "rust":
    case "java":
    case "c":
    case "cpp":
      return chunkWithTreeSitter(filePath, content, language);
    case "markdown":
      return chunkMarkdown(filePath, content);
    case "yaml":
    case "json":
    case "toml":
      return chunkConfig(filePath, content, language);
    default:
      return chunkFallback(filePath, content, language);
  }
}
function chunkWithTreeSitter(filePath, content, language) {
  const ParserClass = getParserClass();
  const langMod = getLanguage(language);
  if (!ParserClass || !langMod) {
    return chunkFallback(filePath, content, language);
  }
  let parser;
  try {
    parser = new ParserClass();
    parser.setLanguage(langMod);
  } catch {
    return chunkFallback(filePath, content, language);
  }
  let tree;
  try {
    tree = parser.parse(content);
  } catch {
    return chunkFallback(filePath, content, language);
  }
  const root = tree.rootNode;
  const chunks = [];
  const imports = extractImports(root, content, language);
  switch (language) {
    case "python":
      chunkPython(root, content, filePath, imports, chunks);
      break;
    case "javascript":
    case "typescript":
    case "tsx":
      chunkTypeScript(root, content, filePath, imports, chunks);
      break;
    case "go":
      chunkGo(root, content, filePath, imports, chunks);
      break;
    case "rust":
      chunkRust(root, content, filePath, imports, chunks);
      break;
    case "java":
      chunkJava(root, content, filePath, imports, chunks);
      break;
    case "c":
    case "cpp":
      chunkCFamily(root, content, filePath, imports, language, chunks);
      break;
    default:
      chunkFallback(filePath, content, language);
  }
  if (chunks.length === 0) {
    return chunkFallback(filePath, content, language);
  }
  return chunks;
}
function extractImports(root, content, language) {
  const importNodes = findNodesByTypes(root, IMPORT_TYPES[language] || []);
  if (importNodes.length === 0) return "";
  return importNodes.map((n) => getNodeText(n, content)).join("\n");
}
function findNodesByTypes(node, types) {
  const results = [];
  if (types.includes(node.type)) {
    results.push(node);
  }
  for (let i = 0; i < node.childCount; i++) {
    results.push(...findNodesByTypes(node.child(i), types));
  }
  return results;
}
function makeChunk(node, content, filePath, chunkType, context) {
  const text = content.slice(node.startIndex, node.endIndex);
  return {
    text,
    symbol: extractSymbol(node, content, chunkType),
    chunkType,
    filePath,
    lineStart: node.startPosition.row + 1,
    lineEnd: node.endPosition.row + 1,
    language: "",
    context,
    textHash: computeHash(text)
  };
}
function extractSymbol(node, content, chunkType) {
  const nameFields = ["name", "declarator"];
  for (const field of nameFields) {
    const child = node.childForFieldName ? node.childForFieldName(field) : null;
    if (child) {
      if (field === "declarator" && child.childForFieldName) {
        const innerName = child.childForFieldName("name");
        if (innerName) return getNodeText(innerName, content);
      }
      return getNodeText(child, content);
    }
  }
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === "identifier" || child.type === "property_identifier" || child.type === "type_identifier" || child.type === "field_identifier") {
      return getNodeText(child, content);
    }
  }
  return `${chunkType}_L${node.startPosition.row + 1}`;
}
function chunkPython(root, content, filePath, imports, chunks) {
  const topNodes = root.children;
  let currentClass = "";
  let currentClassDoc = "";
  for (const node of topNodes) {
    if (node.type === "class_definition") {
      currentClass = getNodeText(node.childForFieldName("name"), content);
      const body = node.childForFieldName("body");
      currentClassDoc = "";
      if (body && body.childCount > 0) {
        const first = body.child(0);
        if (first.type === "expression_statement" && first.child(0).type === "string") {
          currentClassDoc = getNodeText(first, content);
        }
      }
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language: "python",
        context: imports
      });
      if (body) {
        for (let i = 0; i < body.childCount; i++) {
          const child = body.child(i);
          if (child.type === "function_definition" || child.type === "decorated_definition") {
            const fn = child.type === "decorated_definition" ? child.child(child.childCount - 1) : child;
            if (fn.type === "function_definition") {
              const ctx = [imports, currentClassDoc ? `${currentClass}: ${currentClassDoc}` : `class ${currentClass}`].filter(Boolean).join("\n");
              chunks.push({
                ...makeChunk(fn, content, filePath, "method", ctx),
                language: "python",
                context: ctx
              });
            }
          }
        }
      }
      currentClass = "";
      currentClassDoc = "";
    } else if (node.type === "function_definition") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", imports),
        language: "python",
        context: imports
      });
    } else if (node.type === "decorated_definition") {
      const inner = node.child(node.childCount - 1);
      if (inner.type === "function_definition") {
        chunks.push({
          ...makeChunk(node, content, filePath, "function", imports),
          language: "python",
          context: imports
        });
      }
    }
  }
}
function chunkTypeScript(root, content, filePath, imports, chunks) {
  const walkAndExtract = (node, parentClass = "") => {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      const type = child.type;
      if (type === "function_declaration" || type === "generator_function_declaration") {
        const ctx = parentClass ? `${imports}
class ${parentClass}` : imports;
        chunks.push({
          ...makeChunk(child, content, filePath, parentClass ? "method" : "function", ctx),
          language: "typescript",
          context: ctx
        });
      } else if (type === "class_declaration" || type === "class") {
        const className = child.childForFieldName?.("name") ? getNodeText(child.childForFieldName("name"), content) : "";
        const body = child.childForFieldName?.("body");
        if (body) {
          walkAndExtract(body, className);
        }
        chunks.push({
          ...makeChunk(child, content, filePath, "class", imports),
          language: "typescript",
          context: imports
        });
      } else if (type === "method_definition" || type === "public_field_definition") {
        if (child.childCount > 0 && child.child(child.childCount - 1).type === "function_expression") {
          const ctx = parentClass ? `${imports}
class ${parentClass}` : imports;
          chunks.push({
            ...makeChunk(child, content, filePath, "method", ctx),
            language: "typescript",
            context: ctx
          });
        }
      } else if (type === "lexical_declaration" || type === "variable_declaration") {
        for (let j = 0; j < child.childCount; j++) {
          const decl = child.child(j);
          if (decl.type === "variable_declarator") {
            const value = decl.childForFieldName?.("value");
            if (value && (value.type === "arrow_function" || value.type === "function_expression")) {
              const ctx = parentClass ? `${imports}
class ${parentClass}` : imports;
              chunks.push({
                ...makeChunk(child, content, filePath, "function", ctx),
                language: "typescript",
                context: ctx
              });
            }
          }
        }
      } else if (type === "export_statement") {
        for (let j = 0; j < child.childCount; j++) {
          const inner = child.child(j);
          if (inner.type === "function_declaration" || inner.type === "class_declaration" || inner.type === "lexical_declaration") {
            walkAndExtract({ childCount: 1, child: () => inner }, parentClass);
          }
        }
      } else if (child.childCount > 0 && !["string", "comment", "number"].includes(type)) {
        walkAndExtract(child, parentClass);
      }
    }
  };
  walkAndExtract(root);
}
function chunkGo(root, content, filePath, imports, chunks) {
  const pkgDecl = root.children.find((n) => n.type === "package_clause");
  const pkgName = pkgDecl ? getNodeText(pkgDecl, content) : "";
  for (const node of root.children) {
    if (node.type === "function_declaration") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", `${pkgName}
${imports}`),
        language: "go",
        context: `${pkgName}
${imports}`
      });
    } else if (node.type === "method_declaration") {
      const receiver = node.childForFieldName?.("receiver");
      const receiverText = receiver ? getNodeText(receiver, content) : "";
      const ctx = `${pkgName}
${imports}
receiver: ${receiverText}`;
      chunks.push({
        ...makeChunk(node, content, filePath, "method", ctx),
        language: "go",
        context: ctx
      });
    } else if (node.type === "type_declaration") {
      chunks.push({
        ...makeChunk(node, content, filePath, "class", `${pkgName}
${imports}`),
        language: "go",
        context: `${pkgName}
${imports}`
      });
    }
  }
}
function chunkRust(root, content, filePath, imports, chunks) {
  for (const node of root.children) {
    if (node.type === "function_item") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", imports),
        language: "rust",
        context: imports
      });
    } else if (node.type === "struct_item" || node.type === "enum_item" || node.type === "trait_item") {
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language: "rust",
        context: imports
      });
    } else if (node.type === "impl_item") {
      const body = node.childForFieldName?.("body");
      if (body) {
        for (let i = 0; i < body.childCount; i++) {
          const child = body.child(i);
          if (child.type === "function_item") {
            chunks.push({
              ...makeChunk(child, content, filePath, "method", imports),
              language: "rust",
              context: imports
            });
          }
        }
      }
    }
  }
}
function chunkJava(root, content, filePath, imports, chunks) {
  for (const node of root.children) {
    if (node.type === "class_declaration" || node.type === "interface_declaration" || node.type === "enum_declaration") {
      const name = node.childForFieldName?.("name");
      const className = name ? getNodeText(name, content) : "";
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language: "java",
        context: imports
      });
      const body = node.childForFieldName?.("body");
      if (body) {
        for (let i = 0; i < body.childCount; i++) {
          const child = body.child(i);
          if (child.type === "method_declaration" || child.type === "constructor_declaration") {
            chunks.push({
              ...makeChunk(child, content, filePath, "method", `${imports}
class ${className}`),
              language: "java",
              context: `${imports}
class ${className}`
            });
          }
        }
      }
    }
  }
}
function chunkCFamily(root, content, filePath, imports, language, chunks) {
  for (const node of root.children) {
    if (node.type === "function_definition") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", imports),
        language,
        context: imports
      });
    } else if (node.type === "class_specifier" || node.type === "struct_specifier") {
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language,
        context: imports
      });
    }
  }
}
function chunkMarkdown(filePath, content) {
  const lines = content.split("\n");
  const chunks = [];
  let currentSection = "";
  let currentStartLine = 1;
  let headingStack = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      if (currentSection.trim()) {
        const text = currentSection.trim();
        chunks.push({
          text,
          symbol: headingStack[headingStack.length - 1] || `section_L${currentStartLine}`,
          chunkType: "section",
          filePath,
          lineStart: currentStartLine,
          lineEnd: i,
          language: "markdown",
          context: headingStack.slice(0, -1).join(" > "),
          textHash: computeHash(text)
        });
      }
      const level = match[1].length;
      headingStack = headingStack.slice(0, level - 1);
      headingStack.push(match[2].trim());
      currentSection = lines[i] + "\n";
      currentStartLine = i + 1;
    } else {
      currentSection += lines[i] + "\n";
    }
  }
  if (currentSection.trim()) {
    const text = currentSection.trim();
    chunks.push({
      text,
      symbol: headingStack[headingStack.length - 1] || `section_L${currentStartLine}`,
      chunkType: "section",
      filePath,
      lineStart: currentStartLine,
      lineEnd: lines.length,
      language: "markdown",
      context: headingStack.slice(0, -1).join(" > "),
      textHash: computeHash(text)
    });
  }
  return chunks.length > 0 ? chunks : chunkFallback(filePath, content, "markdown");
}
function chunkConfig(filePath, content, language) {
  if (!content.trim()) return [];
  return [
    {
      text: content,
      symbol: filePath.split("/").pop() || filePath,
      chunkType: "config",
      filePath,
      lineStart: 1,
      lineEnd: content.split("\n").length,
      language,
      context: "",
      textHash: computeHash(content)
    }
  ];
}
function chunkFallback(filePath, content, language) {
  if (!content.trim()) return [];
  const lines = content.split("\n");
  const chunks = [];
  let currentBlock = [];
  let blockStart = 1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "" && currentBlock.length > 0) {
      const text = currentBlock.join("\n").trim();
      if (text) {
        chunks.push({
          text,
          symbol: `block_L${blockStart}`,
          chunkType: "block",
          filePath,
          lineStart: blockStart,
          lineEnd: i,
          language: language || "unknown",
          context: "",
          textHash: computeHash(text)
        });
      }
      currentBlock = [];
      blockStart = i + 2;
    } else {
      currentBlock.push(lines[i]);
    }
  }
  if (currentBlock.length > 0) {
    const text = currentBlock.join("\n").trim();
    if (text) {
      chunks.push({
        text,
        symbol: `block_L${blockStart}`,
        chunkType: "block",
        filePath,
        lineStart: blockStart,
        lineEnd: lines.length,
        language: language || "unknown",
        context: "",
        textHash: computeHash(text)
      });
    }
  }
  return chunks;
}
var crypto, IMPORT_TYPES;
var init_chunker = __esm({
  "src/chunker.ts"() {
    "use strict";
    crypto = __toESM(require("crypto"));
    init_parser();
    IMPORT_TYPES = {
      python: ["import_statement", "import_from_statement"],
      javascript: ["import_statement", "import_declaration"],
      typescript: ["import_statement", "import_declaration"],
      tsx: ["import_statement", "import_declaration"],
      go: ["import_declaration"],
      rust: ["use_declaration"],
      java: ["import_declaration"],
      c: ["preproc_include"],
      cpp: ["preproc_include"]
    };
  }
});

// src/file-scanner.ts
var file_scanner_exports = {};
__export(file_scanner_exports, {
  getLanguage: () => getLanguage2,
  hasTreeSitterSupport: () => hasTreeSitterSupport,
  matchExcludePattern: () => matchExcludePattern,
  scanDirectory: () => scanDirectory
});
function scanDirectory(dir, rootDir) {
  const root = rootDir || dir;
  const gitignorePatterns = loadGitignore(root);
  const projectConfig = loadProjectConfig(root);
  const excludeFiles = projectConfig?.excludeFiles ?? [];
  const excludeDirs = projectConfig?.excludeDirs ?? [];
  const results = [];
  function walk(currentDir) {
    let entries;
    try {
      entries = fs4.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".env") continue;
      const fullPath = path5.join(currentDir, entry.name);
      const relPath = path5.relative(root, fullPath);
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        if (excludeDirs.some((d) => entry.name === d || relPath === d || relPath.startsWith(d + "/"))) continue;
        if (isIgnored(relPath, gitignorePatterns)) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        if (isIgnored(relPath, gitignorePatterns)) continue;
        if (matchExcludePattern(relPath, excludeFiles)) continue;
        const ext = path5.extname(entry.name).toLowerCase();
        const language = EXT_TO_LANGUAGE[ext];
        if (!language) continue;
        results.push({
          filePath: fullPath,
          language,
          relativePath: relPath
        });
      }
    }
  }
  walk(dir);
  return results;
}
function loadGitignore(rootDir) {
  const giPath = path5.join(rootDir, ".gitignore");
  if (!fs4.existsSync(giPath)) return [];
  try {
    const content = fs4.readFileSync(giPath, "utf-8");
    return content.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  } catch {
    return [];
  }
}
function isIgnored(relPath, patterns) {
  for (const pat of patterns) {
    if (matchGitignorePattern(relPath, pat)) return true;
  }
  return false;
}
function matchGitignorePattern(relPath, pattern) {
  const p = pattern;
  const isDir = p.endsWith("/");
  const normalized = isDir ? p.slice(0, -1) : p;
  if (p.includes("*")) {
    const regex = globToRegex(normalized);
    return regex.test(relPath) || regex.test(relPath.split("/").pop() || "");
  }
  if (p.startsWith("/")) {
    const base = p.slice(1);
    return relPath === base || relPath.startsWith(base + "/");
  }
  if (!p.includes("/")) {
    return relPath === p || relPath.endsWith("/" + p);
  }
  return relPath.startsWith(p);
}
function matchExcludePattern(relPath, patterns) {
  for (const pat of patterns) {
    if (pat.includes("*")) {
      const regex = globToRegex(pat);
      if (regex.test(relPath) || regex.test(relPath.split("/").pop() || "")) return true;
    } else {
      if (relPath === pat || relPath.endsWith("/" + pat)) return true;
    }
  }
  return false;
}
function globToRegex(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}
function getLanguage2(ext) {
  return EXT_TO_LANGUAGE[ext.toLowerCase()];
}
function hasTreeSitterSupport(language) {
  return TREE_SITTER_LANGUAGES.has(language);
}
var fs4, path5;
var init_file_scanner = __esm({
  "src/file-scanner.ts"() {
    "use strict";
    fs4 = __toESM(require("fs"));
    path5 = __toESM(require("path"));
    init_types();
    init_install();
  }
});

// src/index.ts
async function getLanceDB() {
  return require("@lancedb/lancedb");
}
async function connect(dbPath) {
  const lancedb = await getLanceDB();
  return await lancedb.connect(dbPath);
}
async function createTable(dbPath, records) {
  const db = await connect(dbPath);
  const tableData = records.map((r) => ({
    vector: r.vector,
    text: r.text,
    symbol: r.symbol,
    chunkType: r.chunkType,
    filePath: r.filePath,
    lineStart: r.lineStart,
    lineEnd: r.lineEnd,
    language: r.language,
    textHash: r.textHash,
    context: r.context
  }));
  try {
    await db.dropTable("chunks");
  } catch {
  }
  const table = await db.createTable("chunks", tableData);
  return table;
}
async function addToTable(dbPath, records) {
  const db = await connect(dbPath);
  const table = await db.openTable("chunks");
  const tableData = records.map((r) => ({
    vector: r.vector,
    text: r.text,
    symbol: r.symbol,
    chunkType: r.chunkType,
    filePath: r.filePath,
    lineStart: r.lineStart,
    lineEnd: r.lineEnd,
    language: r.language,
    textHash: r.textHash,
    context: r.context
  }));
  await table.add(tableData);
}
async function deleteFromTable(dbPath, filePaths) {
  const db = await connect(dbPath);
  const table = await db.openTable("chunks");
  for (const fp of filePaths) {
    await table.delete(`"filePath" = '${fp.replace(/'/g, "''")}'`);
  }
}
async function queryTable(dbPath, vector, options) {
  const db = await connect(dbPath);
  const table = await db.openTable("chunks");
  let query = table.search(vector);
  if (options.where) {
    query = query.where(options.where);
  }
  return await query.limit(options.limit).toArray();
}
async function getTableStats(dbPath) {
  try {
    const db = await connect(dbPath);
    const table = await db.openTable("chunks");
    const count = await table.countRows();
    return { count };
  } catch {
    return null;
  }
}
var init_index = __esm({
  "src/index.ts"() {
    "use strict";
  }
});

// src/manifest.ts
function computeFileHash(filePath) {
  const content = fs5.readFileSync(filePath);
  return crypto2.createHash("sha256").update(content).digest("hex");
}
async function buildManifest(filePaths) {
  const manifest = {};
  for (const fp of filePaths) {
    try {
      manifest[fp] = computeFileHash(fp);
    } catch {
    }
  }
  return manifest;
}
function saveManifest(projectName, manifest) {
  dbSaveManifest(projectName, manifest);
}
function diffManifests(projectName, newManifest) {
  return dbDiffManifests(projectName, newManifest);
}
var fs5, crypto2;
var init_manifest = __esm({
  "src/manifest.ts"() {
    "use strict";
    fs5 = __toESM(require("fs"));
    crypto2 = __toESM(require("crypto"));
    init_database();
  }
});

// src/graph.ts
function emptyDepGraph() {
  return { nodes: {}, edges: [] };
}
function nodeId(filePath, symbol) {
  const stem = filePath.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const sym = symbol.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  return `${stem}_${sym}`;
}
function extractDeps(filePath, content, language) {
  const graph = emptyDepGraph();
  switch (language) {
    case "python":
      return extractPythonDeps(filePath, content, graph);
    case "javascript":
    case "typescript":
    case "tsx":
      return extractTSDeps(filePath, content, graph);
    default:
      return graph;
  }
}
function extractTSDeps(filePath, content, graph) {
  const ParserClass = getParserClass();
  const langMod = getLanguage("typescript");
  if (!ParserClass || !langMod) return graph;
  let parser;
  try {
    parser = new ParserClass();
    parser.setLanguage(langMod);
  } catch {
    return graph;
  }
  let tree;
  try {
    tree = parser.parse(content);
  } catch {
    return graph;
  }
  const root = tree.rootNode;
  const symbols = /* @__PURE__ */ new Map();
  collectTSSymbols(root, filePath, content, graph, symbols);
  const importMap = buildTSImportMap(root, filePath, content);
  collectTSCalls(root, filePath, content, graph, symbols, importMap);
  collectTSImports(root, filePath, content, graph);
  return graph;
}
function collectTSSymbols(node, filePath, content, graph, symbols) {
  const t = node.type;
  if (t === "function_declaration" || t === "generator_function_declaration") {
    const nameNode = node.childForFieldName("name");
    if (nameNode) {
      const name = getNodeText(nameNode, content);
      addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
    }
  } else if (t === "class_declaration" || t === "class") {
    const nameNode = node.childForFieldName("name");
    const className = nameNode ? getNodeText(nameNode, content) : "";
    if (className) {
      addSymbol(className, filePath, node.startPosition.row + 1, "class", graph, symbols);
    }
    const body = node.childForFieldName("body");
    if (body) {
      for (let i = 0; i < body.childCount; i++) {
        collectTSSymbols(body.child(i), filePath, content, graph, symbols);
      }
    }
    return;
  } else if (t === "method_definition") {
    const name = firstIdentifier(node, content);
    if (name) {
      addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
    }
  } else if (t === "lexical_declaration" || t === "variable_declaration") {
    for (let j = 0; j < node.childCount; j++) {
      const decl = node.child(j);
      if (decl.type === "variable_declarator") {
        const value = decl.childForFieldName?.("value");
        if (value && (value.type === "arrow_function" || value.type === "function_expression")) {
          const nameNode = decl.childForFieldName("name");
          if (nameNode) {
            const name = getNodeText(nameNode, content);
            addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
          }
        }
      }
    }
  } else if (t === "export_statement") {
    for (let j = 0; j < node.childCount; j++) {
      collectTSSymbols(node.child(j), filePath, content, graph, symbols);
    }
    return;
  }
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!["string", "comment", "template_string"].includes(child.type)) {
      collectTSSymbols(child, filePath, content, graph, symbols);
    }
  }
}
function collectTSCalls(node, filePath, content, graph, symbols, importMap) {
  const t = node.type;
  if (t === "function_declaration" || t === "method_definition" || t === "generator_function_declaration") {
    const nameNode = node.childForFieldName("name") || findFirstIdentNode(node);
    const callerName = nameNode ? getNodeText(nameNode, content) : null;
    if (callerName) {
      const body = node.childForFieldName("body");
      if (body) extractCallsFromBody(body, callerName, filePath, content, graph, symbols, TS_BUILTINS, importMap);
    }
  } else if (t === "lexical_declaration" || t === "variable_declaration") {
    for (let j = 0; j < node.childCount; j++) {
      const decl = node.child(j);
      if (decl.type === "variable_declarator") {
        const nameNode = decl.childForFieldName("name");
        const value = decl.childForFieldName?.("value");
        if (nameNode && value) {
          const callerName = getNodeText(nameNode, content);
          const body = value.childForFieldName?.("body");
          if (body) {
            extractCallsFromBody(body, callerName, filePath, content, graph, symbols, TS_BUILTINS, importMap);
          } else if (value.type === "arrow_function" || value.type === "function_expression") {
          }
        }
      }
    }
  } else if (t === "export_statement") {
    for (let j = 0; j < node.childCount; j++) {
      collectTSCalls(node.child(j), filePath, content, graph, symbols, importMap);
    }
    return;
  }
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!["string", "comment", "template_string"].includes(child.type)) {
      collectTSCalls(child, filePath, content, graph, symbols, importMap);
    }
  }
}
function extractCallsFromBody(bodyNode, callerName, filePath, content, graph, symbols, builtins, importMap) {
  const callerId = nodeId(filePath, callerName);
  const seen = /* @__PURE__ */ new Set();
  function walk(node) {
    if (node.type === "call_expression") {
      const funcNode = node.child(0);
      if (funcNode) {
        let calleeName = null;
        if (funcNode.type === "identifier") {
          calleeName = getNodeText(funcNode, content);
        } else if (funcNode.type === "member_expression") {
          const prop = funcNode.childForFieldName?.("property");
          if (prop) calleeName = getNodeText(prop, content);
        }
        if (calleeName && calleeName !== callerName && !builtins.has(calleeName)) {
          let calleeId = symbols.get(calleeName);
          if (!calleeId && importMap) {
            calleeId = importMap.get(calleeName);
          }
          if (calleeId && calleeId !== callerId) {
            const edgeKey = callerId + "->" + calleeId;
            if (!seen.has(edgeKey)) {
              seen.add(edgeKey);
              graph.edges.push({ from: callerId, to: calleeId, relation: "calls", confidence: "EXTRACTED" });
            }
          }
        }
      }
    }
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i));
    }
  }
  walk(bodyNode);
}
function buildTSImportMap(root, filePath, content) {
  const importMap = /* @__PURE__ */ new Map();
  function processImport(node) {
    const sourceNode = node.childForFieldName?.("source");
    if (!sourceNode) return;
    const modulePath = getNodeText(sourceNode, content).replace(/['"]/g, "");
    if (!modulePath.startsWith(".")) return;
    const dir = path6.dirname(filePath);
    let resolvedRelPath = path6.relative(process.cwd(), path6.resolve(dir, modulePath));
    if (!resolvedRelPath.match(/\.(ts|tsx|js|jsx)$/)) {
      resolvedRelPath += ".ts";
    }
    function walkImport(n) {
      if (n.type === "import_specifier") {
        const nameNode = n.childForFieldName?.("name");
        const aliasNode = n.childForFieldName?.("alias");
        const originalName = nameNode ? getNodeText(nameNode, content) : null;
        const localName = aliasNode ? getNodeText(aliasNode, content) : originalName;
        if (localName && originalName) {
          importMap.set(localName, nodeId(resolvedRelPath, originalName));
        }
        return;
      }
      for (let i = 0; i < n.childCount; i++) {
        walkImport(n.child(i));
      }
    }
    walkImport(node);
  }
  function walk(node) {
    if (node.type === "import_statement" || node.type === "import_declaration") {
      processImport(node);
      return;
    }
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i));
    }
  }
  walk(root);
  return importMap;
}
function collectTSImports(node, filePath, content, graph) {
  if (node.type === "import_statement" || node.type === "import_declaration") {
    const sourceNode = node.childForFieldName?.("source");
    if (!sourceNode) return;
    const modulePath = getNodeText(sourceNode, content).replace(/['"]/g, "");
    if (modulePath.startsWith(".")) {
      const dir = path6.dirname(filePath);
      let importedRelPath = path6.relative(process.cwd(), path6.resolve(dir, modulePath));
      if (!importedRelPath.match(/\.(ts|tsx|js|jsx)$/)) {
        importedRelPath += ".ts";
      }
      const importerId = nodeId(filePath, "__module__");
      const importedId = nodeId(importedRelPath, "__module__");
      if (!graph.nodes[importerId]) {
        graph.nodes[importerId] = { symbol: "__module__", file: filePath, line: 0, type: "module" };
      }
      if (!graph.nodes[importedId]) {
        graph.nodes[importedId] = { symbol: "__module__", file: importedRelPath, line: 0, type: "module" };
      }
      graph.edges.push({ from: importerId, to: importedId, relation: "imports", confidence: "EXTRACTED" });
    }
    return;
  }
  for (let i = 0; i < node.childCount; i++) {
    collectTSImports(node.child(i), filePath, content, graph);
  }
}
function extractPythonDeps(filePath, content, graph) {
  const ParserClass = getParserClass();
  const langMod = getLanguage("python");
  if (!ParserClass || !langMod) return graph;
  let parser;
  try {
    parser = new ParserClass();
    parser.setLanguage(langMod);
  } catch {
    return graph;
  }
  let tree;
  try {
    tree = parser.parse(content);
  } catch {
    return graph;
  }
  const root = tree.rootNode;
  const symbols = /* @__PURE__ */ new Map();
  collectPythonDefs(root, filePath, content, graph, symbols);
  return graph;
}
function collectPythonDefs(node, filePath, content, graph, symbols) {
  const t = node.type;
  if (t === "function_definition") {
    const nameNode = node.childForFieldName("name");
    if (nameNode) {
      const name = getNodeText(nameNode, content);
      addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
      const body = node.childForFieldName("body");
      if (body) extractCallsFromBody(body, name, filePath, content, graph, symbols, PYTHON_BUILTINS);
    }
  } else if (t === "class_definition") {
    const nameNode = node.childForFieldName("name");
    if (nameNode) {
      const name = getNodeText(nameNode, content);
      addSymbol(name, filePath, node.startPosition.row + 1, "class", graph, symbols);
    }
    const body = node.childForFieldName("body");
    if (body) {
      for (let i = 0; i < body.childCount; i++) {
        const child = body.child(i);
        if (child.type === "decorated_definition") {
          const inner = child.child(child.childCount - 1);
          if (inner.type === "function_definition") {
            const fnName = inner.childForFieldName("name");
            if (fnName) {
              const name = getNodeText(fnName, content);
              addSymbol(name, filePath, inner.startPosition.row + 1, "function", graph, symbols);
              const fnBody = inner.childForFieldName("body");
              if (fnBody) extractCallsFromBody(fnBody, name, filePath, content, graph, symbols, PYTHON_BUILTINS);
            }
          }
        } else if (child.type === "function_definition") {
          const fnName = child.childForFieldName("name");
          if (fnName) {
            const name = getNodeText(fnName, content);
            addSymbol(name, filePath, child.startPosition.row + 1, "function", graph, symbols);
            const fnBody = child.childForFieldName("body");
            if (fnBody) extractCallsFromBody(fnBody, name, filePath, content, graph, symbols, PYTHON_BUILTINS);
          }
        }
      }
    }
    return;
  } else if (t === "decorated_definition") {
    const inner = node.child(node.childCount - 1);
    if (inner.type === "function_definition") {
      collectPythonDefs(inner, filePath, content, graph, symbols);
    } else if (inner.type === "class_definition") {
      collectPythonDefs(inner, filePath, content, graph, symbols);
    }
    return;
  }
  for (let i = 0; i < node.childCount; i++) {
    collectPythonDefs(node.child(i), filePath, content, graph, symbols);
  }
}
function addSymbol(name, filePath, line, type, graph, symbols) {
  const id = nodeId(filePath, name);
  graph.nodes[id] = { symbol: name, file: filePath, line, type };
  symbols.set(name, id);
}
function firstIdentifier(node, content) {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === "identifier" || child.type === "property_identifier") {
      return getNodeText(child, content);
    }
  }
  return null;
}
function findFirstIdentNode(node) {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === "identifier") return child;
  }
  return null;
}
function mergeDepGraphs(graphs) {
  const merged = emptyDepGraph();
  for (const g of graphs) {
    Object.assign(merged.nodes, g.nodes);
    merged.edges.push(...g.edges);
  }
  return merged;
}
function saveDepGraph(projectName, graph) {
  dbSaveDepGraph(projectName, graph);
}
function loadDepGraph(projectName) {
  return dbLoadDepGraph(projectName);
}
function removeFileFromGraph(projectName, filePath) {
  dbRemoveFileFromGraph(projectName, filePath);
}
var path6, TS_BUILTINS, PYTHON_BUILTINS;
var init_graph = __esm({
  "src/graph.ts"() {
    "use strict";
    path6 = __toESM(require("path"));
    init_database();
    init_parser();
    TS_BUILTINS = /* @__PURE__ */ new Set([
      "if",
      "for",
      "while",
      "switch",
      "catch",
      "return",
      "throw",
      "new",
      "typeof",
      "delete",
      "void",
      "await",
      "async",
      "function",
      "class",
      "const",
      "let",
      "var",
      "import",
      "export",
      "require",
      "console",
      "setTimeout",
      "setInterval",
      "parseInt",
      "parseFloat",
      "Array",
      "Object",
      "String",
      "Number",
      "Boolean",
      "Promise",
      "Map",
      "Set",
      "Error",
      "Date",
      "JSON",
      "Math",
      "process",
      "Buffer"
    ]);
    PYTHON_BUILTINS = /* @__PURE__ */ new Set([
      "print",
      "len",
      "range",
      "str",
      "int",
      "float",
      "list",
      "dict",
      "set",
      "tuple",
      "type",
      "isinstance",
      "super",
      "property",
      "staticmethod",
      "classmethod",
      "enumerate",
      "zip",
      "map",
      "filter",
      "sorted",
      "hasattr",
      "getattr",
      "setattr",
      "open",
      "abs",
      "min",
      "max",
      "sum",
      "any",
      "all",
      "round",
      "input",
      "format",
      "repr",
      "bool",
      "bytes",
      "Exception",
      "ValueError",
      "TypeError",
      "KeyError",
      "IndexError",
      "AttributeError",
      "RuntimeError",
      "StopIteration",
      "NotImplementedError"
    ]);
  }
});

// src/indexer.ts
var indexer_exports = {};
__export(indexer_exports, {
  buildIndex: () => buildIndex
});
async function buildIndex(dir, options = {}) {
  const strategy = options.strategy || "auto";
  const quiet = options.quiet || false;
  const exitOnError = options.exitOnError !== false;
  const onProgress = options.onProgress;
  const absDir = path7.resolve(dir);
  const projectName = resolveProjectName(absDir);
  const files = scanDirectory(absDir);
  if (files.length === 0) {
    console.error("\u672A\u627E\u5230\u652F\u6301\u7684\u4EE3\u7801\u6587\u4EF6\u3002");
    if (exitOnError) process.exit(1);
    throw new Error("\u672A\u627E\u5230\u652F\u6301\u7684\u4EE3\u7801\u6587\u4EF6\u3002");
  }
  if (!quiet) console.log(`\u627E\u5230 ${files.length} \u4E2A\u4EE3\u7801\u6587\u4EF6`);
  onProgress?.("scanning", files.length, files.length);
  const allChunks = [];
  for (const f of files) {
    try {
      const content = fs6.readFileSync(f.filePath, "utf-8");
      const chunks = chunkFile(f.relativePath, content, f.language);
      allChunks.push(...chunks);
    } catch (e) {
      if (!quiet) process.stderr.write(`  \u8DF3\u8FC7 ${f.relativePath}: ${e.message}
`);
    }
  }
  if (allChunks.length === 0) {
    console.error("\u5206\u5757\u540E\u65E0\u6709\u6548\u4EE3\u7801\u7247\u6BB5\u3002");
    if (exitOnError) process.exit(1);
    throw new Error("\u5206\u5757\u540E\u65E0\u6709\u6548\u4EE3\u7801\u7247\u6BB5\u3002");
  }
  if (!quiet) console.log(`\u751F\u6210 ${allChunks.length} \u4E2A\u4EE3\u7801\u5757`);
  onProgress?.("chunking", allChunks.length, allChunks.length);
  const dimensions = resolveDimensions(allChunks.length, strategy);
  if (!quiet) console.log(`\u5411\u91CF\u7EF4\u5EA6: ${dimensions} (\u7B56\u7565: ${strategy}, chunks: ${allChunks.length})`);
  const embedder = createEmbedderFromGlobalConfig(dimensions);
  if (!quiet) process.stderr.write("\u68C0\u67E5 Ollama...\n");
  await embedder.ensureModel();
  if (!quiet) process.stderr.write("\u751F\u6210\u5411\u91CF...\n");
  const inputs = allChunks.map((c) => buildEmbeddingInput(c));
  const vectors = await embedder.embed(inputs, (current, total) => {
    onProgress?.("embedding", current, total);
  });
  const records = allChunks.map((chunk, i) => ({
    vector: vectors[i],
    text: chunk.text,
    symbol: chunk.symbol,
    chunkType: chunk.chunkType,
    filePath: chunk.filePath,
    lineStart: chunk.lineStart,
    lineEnd: chunk.lineEnd,
    language: chunk.language,
    textHash: chunk.textHash,
    context: chunk.context
  }));
  const outDir = ensureProjectOutputDir(projectName);
  const dbPath = path7.join(outDir, "index.lance");
  if (!quiet) process.stderr.write("\u5199\u5165\u7D22\u5F15...\n");
  onProgress?.("writing", 0, records.length);
  await createTable(dbPath, records);
  onProgress?.("writing", records.length, records.length);
  if (!quiet) process.stderr.write("\u63D0\u53D6\u4F9D\u8D56\u56FE...\n");
  onProgress?.("deps", 0, files.length);
  const graphs = [];
  for (const f of files) {
    try {
      const content = fs6.readFileSync(f.filePath, "utf-8");
      const graph = extractDeps(f.relativePath, content, f.language);
      graphs.push(graph);
    } catch {
    }
  }
  const mergedGraph = mergeDepGraphs(graphs);
  saveDepGraph(projectName, mergedGraph);
  const filePaths = files.map((f) => f.filePath);
  const manifest = await buildManifest(filePaths);
  saveManifest(projectName, manifest);
  const actualDimensions = vectors[0]?.length || dimensions;
  const config = {
    model: embedder.getConfig().model,
    dimensions: actualDimensions,
    dimensionsFull: dimensions,
    strategy,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    excludeFiles: [...DEFAULT_EXCLUDE_FILES]
  };
  saveConfig(projectName, config);
  registerProject(projectName, absDir);
  if (!quiet) {
    console.log(`
\u7D22\u5F15\u6784\u5EFA\u5B8C\u6210\uFF01`);
    console.log(`  \u9879\u76EE:     ${projectName}`);
    console.log(`  \u6587\u4EF6\u6570:   ${files.length}`);
    console.log(`  \u4EE3\u7801\u5757:   ${allChunks.length}`);
    console.log(`  \u7EF4\u5EA6:     ${dimensions}`);
    console.log(`  \u4F9D\u8D56\u8282\u70B9: ${Object.keys(mergedGraph.nodes).length}`);
    console.log(`  \u4F9D\u8D56\u8FB9:   ${mergedGraph.edges.length}`);
    console.log(`  \u8F93\u51FA\u76EE\u5F55: ${outDir}`);
  }
}
var fs6, path7;
var init_indexer = __esm({
  "src/indexer.ts"() {
    "use strict";
    fs6 = __toESM(require("fs"));
    path7 = __toESM(require("path"));
    init_types();
    init_embedder();
    init_chunker();
    init_file_scanner();
    init_index();
    init_manifest();
    init_config();
    init_graph();
    init_global();
  }
});

// src/search.ts
var search_exports = {};
__export(search_exports, {
  search: () => search
});
function resolveProjectNameOpt(projectOpt) {
  if (projectOpt && projectOpt !== "all") {
    return projectOpt;
  }
  const entry = findProjectByDir(".");
  if (entry) return entry.name;
  return resolveProjectName(".");
}
async function searchSingleProject(query, projectName, options) {
  const topK = options.topK || DEFAULT_TOP_K;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const outDir = getProjectDir(projectName);
  const config = loadConfig(projectName);
  if (!config) return [];
  const excludeFiles = config.excludeFiles ?? DEFAULT_EXCLUDE_FILES;
  const embedder = createEmbedderFromGlobalConfig(config.dimensions);
  const queryVector = await embedder.embedQuery(query);
  const conditions = [];
  if (options.type) {
    conditions.push(`"chunkType" = '${options.type}'`);
  }
  if (options.lang) {
    conditions.push(`language = '${options.lang}'`);
  }
  if (options.dir) {
    conditions.push(`"filePath" LIKE '${options.dir}%'`);
  }
  const where = conditions.length > 0 ? conditions.join(" AND ") : void 0;
  const dbPath = path8.join(outDir, "index.lance");
  if (!fs7.existsSync(dbPath)) return [];
  const rawResults = await queryTable(dbPath, queryVector, { limit: topK, where });
  return rawResults.map((r) => ({
    score: r._distance !== void 0 ? 1 / (1 + r._distance) : 0,
    symbol: r.symbol || "",
    type: r.chunkType || "",
    file: r.filePath || "",
    lineStart: r.lineStart || 0,
    lineEnd: r.lineEnd || 0,
    text: r.text || "",
    context: r.context || "",
    language: r.language || ""
  })).filter((r) => r.score >= threshold).filter((r) => !matchExcludePattern(r.file, excludeFiles)).filter((r, i, arr) => {
    const key = r.file + ":" + r.lineStart + ":" + r.symbol;
    return arr.findIndex((x) => x.file + ":" + x.lineStart + ":" + x.symbol === key) === i;
  });
}
async function search(query, options = {}) {
  if (options.project === "all") {
    const projects = listProjects();
    const allResults = [];
    for (const p of projects) {
      const results = await searchSingleProject(query, p.name, options);
      allResults.push(...results);
    }
    const topK = options.topK || DEFAULT_TOP_K;
    return allResults.sort((a, b) => b.score - a.score).slice(0, topK);
  }
  const projectName = resolveProjectNameOpt(options.project);
  if (!projectName) {
    console.error("\u672A\u627E\u5230\u9879\u76EE\u3002\u8FD0\u884C `codesense init` \u521D\u59CB\u5316\u3002");
    process.exit(1);
  }
  const outDir = getProjectDir(projectName);
  if (!fs7.existsSync(outDir)) {
    console.error(`\u9879\u76EE "${projectName}" \u672A\u5EFA\u7D22\u5F15\u3002\u8FD0\u884C \`codesense index <\u76EE\u5F55>\` \u5EFA\u7ACB\u7D22\u5F15\u3002`);
    process.exit(1);
  }
  return searchSingleProject(query, projectName, options);
}
var fs7, path8;
var init_search = __esm({
  "src/search.ts"() {
    "use strict";
    fs7 = __toESM(require("fs"));
    path8 = __toESM(require("path"));
    init_types();
    init_embedder();
    init_index();
    init_config();
    init_global();
    init_file_scanner();
  }
});

// src/trace.ts
var trace_exports = {};
__export(trace_exports, {
  trace: () => trace
});
function resolveProject(startDir) {
  const entry = findProjectByDir(startDir);
  if (entry) return entry.name;
  const projectName = resolveProjectName(startDir);
  const config = dbLoadConfig(projectName);
  if (config) return projectName;
  return null;
}
function findMatchingNodes(graph, symbol) {
  const lowerSymbol = symbol.toLowerCase();
  const matches = [];
  for (const [id, node] of Object.entries(graph.nodes)) {
    if (node.symbol.toLowerCase() === lowerSymbol || node.symbol.toLowerCase().includes(lowerSymbol)) {
      matches.push({ id, node });
    }
  }
  return matches;
}
function bfsTrace(graph, startId, direction, maxDepth) {
  const visited = /* @__PURE__ */ new Set();
  const results = [];
  function walk(currentId, depth) {
    if (depth > maxDepth || visited.has(currentId)) return;
    visited.add(currentId);
    const edges = direction === "callers" ? graph.edges.filter((e) => e.to === currentId) : graph.edges.filter((e) => e.from === currentId);
    for (const edge of edges) {
      const targetId = direction === "callers" ? edge.from : edge.to;
      const targetNode = graph.nodes[targetId];
      if (!targetNode) continue;
      const traceNode = {
        symbol: targetNode.symbol,
        file: targetNode.file,
        line: targetNode.line,
        type: targetNode.type,
        relation: edge.relation,
        children: []
      };
      if (depth < maxDepth) {
        walk(targetId, depth + 1);
        const childEdges = direction === "callers" ? graph.edges.filter((e) => e.to === targetId) : graph.edges.filter((e) => e.from === targetId);
        for (const ce of childEdges) {
          const childId = direction === "callers" ? ce.from : ce.to;
          const childNode = graph.nodes[childId];
          if (childNode && visited.has(childId)) {
            traceNode.children.push({
              symbol: childNode.symbol,
              file: childNode.file,
              line: childNode.line,
              type: childNode.type,
              relation: ce.relation,
              children: []
            });
          }
        }
      }
      results.push(traceNode);
    }
  }
  walk(startId, 1);
  return results;
}
function formatTree(symbol, file, line, callers, callees, direction) {
  const lines = [];
  lines.push(`${symbol} [${file}:${line}]`);
  if ((direction === "callers" || direction === "both") && callers.length > 0) {
    lines.push("  \u251C\u2500\u2500 callers (\u8C01\u8C03\u7528\u4E86\u5B83)");
    for (let i = 0; i < callers.length; i++) {
      const c = callers[i];
      const prefix = i === callers.length - 1 ? "  \u2502   \u2514\u2500\u2500" : "  \u2502   \u251C\u2500\u2500";
      lines.push(`${prefix} ${c.symbol} [${c.file}:${c.line}]`);
    }
  }
  if ((direction === "callees" || direction === "both") && callees.length > 0) {
    lines.push("  \u2514\u2500\u2500 callees (\u5B83\u8C03\u7528\u4E86\u8C01)");
    for (let i = 0; i < callees.length; i++) {
      const c = callees[i];
      const prefix = i === callees.length - 1 ? "      \u2514\u2500\u2500" : "      \u251C\u2500\u2500";
      lines.push(`${prefix} ${c.symbol} [${c.file}:${c.line}]`);
    }
  }
  if (callers.length === 0 && callees.length === 0) {
    lines.push("  (\u65E0\u4F9D\u8D56\u5173\u7CFB)");
  }
  return lines.join("\n");
}
function formatDot(symbol, file, line, callers, callees) {
  const lines = ["digraph {"];
  const centerId = `"${symbol}"`;
  lines.push(`  ${centerId} [label="${symbol}\\n${file}:${line}", shape=box, style=filled, fillcolor=lightblue];`);
  for (const c of callers) {
    const id = `"${c.symbol}"`;
    lines.push(`  ${id} [label="${c.symbol}\\n${c.file}:${c.line}"];`);
    lines.push(`  ${id} -> ${centerId} [label="${c.relation}"];`);
  }
  for (const c of callees) {
    const id = `"${c.symbol}"`;
    lines.push(`  ${id} [label="${c.symbol}\\n${c.file}:${c.line}"];`);
    lines.push(`  ${centerId} -> ${id} [label="${c.relation}"];`);
  }
  lines.push("}");
  return lines.join("\n");
}
async function trace(symbol, options = {}) {
  const depth = options.depth || 3;
  const direction = options.direction || "both";
  const format = options.format || "tree";
  const projectName = resolveProject(options.baseDir || ".");
  if (!projectName) {
    console.error("\u672A\u627E\u5230\u7D22\u5F15\u3002\u8FD0\u884C `codesense index <\u76EE\u5F55>` \u5EFA\u7ACB\u7D22\u5F15\u3002");
    process.exit(1);
  }
  const graph = loadDepGraph(projectName);
  const matches = findMatchingNodes(graph, symbol);
  if (matches.length === 0) {
    console.log(`\u672A\u627E\u5230\u7B26\u53F7: ${symbol}`);
    return;
  }
  const results = matches.map(({ id, node }) => {
    let callers = [];
    let callees = [];
    if (direction === "callers" || direction === "both") {
      callers = bfsTrace(graph, id, "callers", depth);
    }
    if (direction === "callees" || direction === "both") {
      callees = bfsTrace(graph, id, "callees", depth);
    }
    return { node, callers, callees };
  });
  for (const { node, callers, callees } of results) {
    switch (format) {
      case "json":
        console.log(JSON.stringify({ symbol: node.symbol, file: node.file, line: node.line, callers, callees }, null, 2));
        break;
      case "dot":
        console.log(formatDot(node.symbol, node.file, node.line, callers, callees));
        break;
      case "tree":
      default:
        console.log(formatTree(node.symbol, node.file, node.line, callers, callees, direction));
        break;
    }
  }
}
var init_trace = __esm({
  "src/trace.ts"() {
    "use strict";
    init_graph();
    init_global();
    init_database();
  }
});

// src/logger.ts
function ensureLogsDir() {
  if (!fs8.existsSync(LOGS_DIR)) {
    fs8.mkdirSync(LOGS_DIR, { recursive: true });
  }
}
function logFile(date) {
  const d = date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return path9.join(LOGS_DIR, `${d}.log`);
}
function appendLog(entry) {
  ensureLogsDir();
  const line = JSON.stringify(entry) + "\n";
  fs8.appendFileSync(logFile(), line, "utf-8");
}
function queryLogs(options = {}) {
  ensureLogsDir();
  const limit = options.limit || 100;
  const targetDate = options.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const filePath = logFile(targetDate);
  if (!fs8.existsSync(filePath)) return [];
  const lines = fs8.readFileSync(filePath, "utf-8").trim().split("\n").filter(Boolean);
  let entries = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (options.project && entry.project !== options.project) continue;
      entries.push(entry);
    } catch {
    }
  }
  return entries.slice(-limit).reverse();
}
function listLogDates() {
  ensureLogsDir();
  const files = fs8.readdirSync(LOGS_DIR).filter((f) => f.endsWith(".log")).sort().reverse();
  return files.map((f) => f.replace(".log", ""));
}
var fs8, path9, os3, LOGS_DIR;
var init_logger = __esm({
  "src/logger.ts"() {
    "use strict";
    fs8 = __toESM(require("fs"));
    path9 = __toESM(require("path"));
    os3 = __toESM(require("os"));
    LOGS_DIR = path9.join(os3.homedir(), ".codesense", "logs");
  }
});

// src/update.ts
var update_exports = {};
__export(update_exports, {
  updateIndex: () => updateIndex
});
function resolveProject2(dir) {
  const entry = findProjectByDir(dir);
  if (entry) {
    return { projectName: entry.name, indexDir: entry.path };
  }
  const projectName = resolveProjectName(dir);
  const config = loadConfig(projectName);
  if (config) {
    return { projectName, indexDir: path10.resolve(dir) };
  }
  return null;
}
function getLastCommitHash(projectName) {
  try {
    const f = path10.join(getProjectDir(projectName), ".last-commit");
    return fs9.existsSync(f) ? fs9.readFileSync(f, "utf-8").trim() : null;
  } catch {
    return null;
  }
}
function saveLastCommitHash(projectName, hash) {
  try {
    fs9.writeFileSync(path10.join(getProjectDir(projectName), ".last-commit"), hash, "utf-8");
  } catch {
  }
}
function getGitHeadHash(indexDir) {
  try {
    return (0, import_child_process3.execSync)("git rev-parse HEAD", { cwd: indexDir, encoding: "utf-8", timeout: 5e3 }).trim();
  } catch {
    return null;
  }
}
function getGitChangedFiles(indexDir) {
  try {
    const output = (0, import_child_process3.execSync)("git diff-tree --no-commit-id --name-only -r HEAD", {
      cwd: indexDir,
      encoding: "utf-8",
      timeout: 5e3
    }).trim();
    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    return null;
  }
}
async function updateByFiles(projectName, indexDir, changedFiles, options = {}) {
  const quiet = options.quiet || false;
  const outDir = ensureProjectDir(projectName);
  const config = loadConfig(projectName);
  if (!config) {
    if (!quiet) console.error("\u7D22\u5F15\u914D\u7F6E\u635F\u574F\u3002\u8BF7\u91CD\u65B0\u8FD0\u884C `codesense index`\u3002");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("\u7D22\u5F15\u914D\u7F6E\u635F\u574F\u3002");
  }
  if (!quiet) console.log(`\u5904\u7406 ${changedFiles.length} \u4E2A\u53D8\u66F4\u6587\u4EF6...`);
  const onProgress = options.onProgress;
  onProgress?.("scanning", changedFiles.length, changedFiles.length);
  const dbPath = path10.join(outDir, "index.lance");
  const embedder = createEmbedderFromGlobalConfig(config.dimensions);
  await embedder.ensureModel();
  const toDelete = [];
  const processable = [];
  for (const file of changedFiles) {
    const absPath = path10.resolve(indexDir, file);
    const ext = path10.extname(file);
    if (!fs9.existsSync(absPath)) {
      toDelete.push(file);
    } else if (EXT_TO_LANGUAGE[ext]) {
      processable.push({ absPath, relPath: file, language: EXT_TO_LANGUAGE[ext] });
    }
  }
  if (toDelete.length > 0) {
    if (!quiet) process.stderr.write(`\u5220\u9664 ${toDelete.length} \u4E2A\u6587\u4EF6...
`);
    await deleteFromTable(dbPath, toDelete);
    for (const fp of toDelete) {
      removeFileFromGraph(projectName, fp);
    }
  }
  if (processable.length > 0) {
    const relPaths = processable.map((f) => f.relPath);
    await deleteFromTable(dbPath, relPaths);
    for (const fp of relPaths) {
      removeFileFromGraph(projectName, fp);
    }
    const allChunks = [];
    for (const { absPath, relPath, language } of processable) {
      try {
        const content = fs9.readFileSync(absPath, "utf-8");
        const chunks = chunkFile(relPath, content, language);
        allChunks.push(...chunks);
      } catch (e) {
        if (!quiet) process.stderr.write(`  \u8DF3\u8FC7 ${relPath}: ${e.message}
`);
      }
    }
    onProgress?.("chunking", allChunks.length, allChunks.length);
    if (allChunks.length > 0) {
      if (!quiet) process.stderr.write(`\u5904\u7406 ${allChunks.length} \u4E2A\u4EE3\u7801\u5757...
`);
      const inputs = allChunks.map((c) => buildEmbeddingInput(c));
      const vectors = await embedder.embed(inputs, (current, total) => {
        options.onProgress?.("embedding", current, total);
      });
      const records = allChunks.map((chunk, i) => ({
        vector: vectors[i],
        text: chunk.text,
        symbol: chunk.symbol,
        chunkType: chunk.chunkType,
        filePath: chunk.filePath,
        lineStart: chunk.lineStart,
        lineEnd: chunk.lineEnd,
        language: chunk.language,
        textHash: chunk.textHash,
        context: chunk.context
      }));
      await addToTable(dbPath, records);
      onProgress?.("writing", records.length, records.length);
    }
    onProgress?.("deps", 0, processable.length);
    for (const { absPath, relPath, language } of processable) {
      try {
        const content = fs9.readFileSync(absPath, "utf-8");
        const fileGraph = extractDeps(relPath, content, language);
        const { dbMergeDepGraph: dbMergeDepGraph2 } = (init_database(), __toCommonJS(database_exports));
        dbMergeDepGraph2(projectName, fileGraph);
      } catch {
      }
    }
    onProgress?.("deps", processable.length, processable.length);
  }
  const manifestUpsert = {};
  for (const { absPath } of processable) {
    try {
      const hash = crypto3.createHash("sha256").update(fs9.readFileSync(absPath)).digest("hex");
      manifestUpsert[absPath] = hash;
    } catch {
    }
  }
  if (Object.keys(manifestUpsert).length > 0 || toDelete.length > 0) {
    dbSaveManifestIncremental(projectName, manifestUpsert, toDelete);
  }
  config.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  saveConfig(projectName, config);
  if (!quiet) {
    console.log(`\u66F4\u65B0\u5B8C\u6210\uFF01\u5904\u7406 ${changedFiles.length} \u4E2A\u6587\u4EF6\u3002`);
  }
}
async function updateByManifest(dir, options = {}) {
  const quiet = options.quiet || false;
  const resolved = resolveProject2(dir);
  if (!resolved) {
    if (!quiet) console.error("\u672A\u627E\u5230\u7D22\u5F15\u3002\u8FD0\u884C `codesense index <\u76EE\u5F55>` \u5EFA\u7ACB\u7D22\u5F15\u3002");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("\u672A\u627E\u5230\u7D22\u5F15\u3002");
  }
  const { projectName, indexDir } = resolved;
  const config = loadConfig(projectName);
  if (!config) {
    if (!quiet) console.error("\u7D22\u5F15\u914D\u7F6E\u635F\u574F\u3002\u8BF7\u91CD\u65B0\u8FD0\u884C `codesense index`\u3002");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("\u7D22\u5F15\u914D\u7F6E\u635F\u574F\u3002");
  }
  const files = scanDirectory(indexDir);
  const filePaths = files.map((f) => f.filePath);
  const newManifest = await buildManifest(filePaths);
  const diff = diffManifests(projectName, newManifest);
  const totalChanges = diff.added.length + diff.modified.length + diff.deleted.length;
  if (totalChanges === 0) {
    if (!quiet) console.log("\u7D22\u5F15\u5DF2\u662F\u6700\u65B0\u3002");
    return;
  }
  if (!quiet) {
    console.log(`\u53D8\u66F4: +${diff.added.length} \u65B0\u589E, ~${diff.modified.length} \u4FEE\u6539, -${diff.deleted.length} \u5220\u9664`);
  }
  const changedFiles = [
    ...diff.deleted,
    ...diff.added,
    ...diff.modified.map((fp) => {
      const f = files.find((f2) => f2.filePath === fp);
      return f ? f.relativePath : path10.relative(indexDir, fp);
    })
  ];
  saveManifest(projectName, newManifest);
  await updateByFiles(projectName, indexDir, changedFiles, { ...options, exitOnError: false });
}
async function updateIndex(dir, options = {}) {
  const quiet = options.quiet || false;
  const resolved = resolveProject2(dir);
  if (!resolved) {
    if (!quiet) console.error("\u672A\u627E\u5230\u7D22\u5F15\u3002\u8FD0\u884C `codesense index <\u76EE\u5F55>` \u5EFA\u7ACB\u7D22\u5F15\u3002");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("\u672A\u627E\u5230\u7D22\u5F15\u3002");
  }
  const { projectName, indexDir } = resolved;
  const gitFiles = getGitChangedFiles(indexDir);
  const startTime = Date.now();
  if (gitFiles !== null) {
    const headHash = getGitHeadHash(indexDir);
    const lastHash = getLastCommitHash(projectName);
    if (headHash && lastHash === headHash) {
      if (!quiet) console.log("\u7D22\u5F15\u5DF2\u662F\u6700\u65B0\u3002");
      return;
    }
    if (gitFiles.length === 0) {
      if (!quiet) console.log("\u65E0\u53D8\u66F4\u6587\u4EF6\u3002");
      return;
    }
    try {
      await updateByFiles(projectName, indexDir, gitFiles, options);
      if (headHash) saveLastCommitHash(projectName, headHash);
      appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: projectName, action: "update", status: "completed", files: gitFiles.length, durationMs: Date.now() - startTime });
    } catch (e) {
      appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: projectName, action: "update", status: "failed", error: e.message, durationMs: Date.now() - startTime });
      throw e;
    }
    return;
  }
  try {
    await updateByManifest(dir, options);
    appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: projectName, action: "update", status: "completed", durationMs: Date.now() - startTime });
  } catch (e) {
    appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: projectName, action: "update", status: "failed", error: e.message, durationMs: Date.now() - startTime });
    throw e;
  }
}
var fs9, path10, crypto3, import_child_process3;
var init_update = __esm({
  "src/update.ts"() {
    "use strict";
    fs9 = __toESM(require("fs"));
    path10 = __toESM(require("path"));
    crypto3 = __toESM(require("crypto"));
    import_child_process3 = require("child_process");
    init_types();
    init_embedder();
    init_chunker();
    init_file_scanner();
    init_index();
    init_manifest();
    init_config();
    init_graph();
    init_global();
    init_database();
    init_logger();
    init_global();
  }
});

// src/uninstall.ts
var uninstall_exports = {};
__export(uninstall_exports, {
  uninstall: () => uninstall
});
async function uninstall(projectDir) {
  const absDir = path11.resolve(projectDir || ".");
  const projectName = resolveProjectName(absDir);
  dbDeleteProjectData(projectName);
  console.log(`\u2713 \u9879\u76EE "${projectName}" \u6570\u636E\u5DF2\u4ECE\u6570\u636E\u5E93\u79FB\u9664`);
  const projectDataDir = getProjectDir(projectName);
  if (fs10.existsSync(projectDataDir)) {
    fs10.rmSync(projectDataDir, { recursive: true, force: true });
    console.log(`\u2713 \u5DF2\u6E05\u7406\u7D22\u5F15\u6570\u636E: ${projectDataDir}`);
  }
  const claudeMdPath = path11.resolve(absDir, "CLAUDE.md");
  if (fs10.existsSync(claudeMdPath)) {
    let content = fs10.readFileSync(claudeMdPath, "utf-8");
    if (content.includes(CLAUDE_MD_MARKER)) {
      const startIdx = content.indexOf(CLAUDE_MD_MARKER);
      const endIdx = content.indexOf(CLAUDE_MD_END_MARKER);
      if (endIdx !== -1) {
        const endOfMarker = endIdx + CLAUDE_MD_END_MARKER.length;
        content = content.slice(0, startIdx) + content.slice(endOfMarker);
        content = content.replace(/\n{3,}/g, "\n\n").trimEnd();
        if (content.trim()) {
          fs10.writeFileSync(claudeMdPath, content + "\n", "utf-8");
        } else {
          fs10.unlinkSync(claudeMdPath);
        }
        console.log("\u2713 \u5DF2\u4ECE CLAUDE.md \u79FB\u9664 codesense \u6BB5\u843D");
      }
    } else {
      console.log("  CLAUDE.md \u4E2D\u672A\u627E\u5230 codesense \u6BB5\u843D\u3002");
    }
  }
  const hookPath = path11.resolve(absDir, ".git", "hooks", "post-commit");
  if (fs10.existsSync(hookPath)) {
    let content = fs10.readFileSync(hookPath, "utf-8");
    if (content.includes(HOOK_MARKER)) {
      const lines = content.split("\n");
      const filtered = [];
      let skip = false;
      for (const line of lines) {
        if (line.includes(HOOK_MARKER)) {
          skip = true;
          continue;
        }
        if (skip && (line.includes("codesense") || line.trim() === "")) {
          continue;
        }
        skip = false;
        filtered.push(line);
      }
      const remaining = filtered.join("\n").trim();
      if (remaining && remaining !== "#!/bin/sh") {
        fs10.writeFileSync(hookPath, remaining + "\n", "utf-8");
        console.log("\u2713 \u5DF2\u4ECE post-commit hook \u79FB\u9664 codesense \u66F4\u65B0");
      } else {
        fs10.unlinkSync(hookPath);
        console.log("\u2713 \u5DF2\u5220\u9664\u7A7A\u7684 post-commit hook");
      }
    } else {
      console.log("  post-commit hook \u4E2D\u672A\u627E\u5230 codesense \u90E8\u5206\u3002");
    }
  }
  console.log(`
codesense \u96C6\u6210\u5DF2\u5378\u8F7D\u3002\u9879\u76EE: ${projectName}`);
}
var fs10, path11;
var init_uninstall = __esm({
  "src/uninstall.ts"() {
    "use strict";
    fs10 = __toESM(require("fs"));
    path11 = __toESM(require("path"));
    init_install();
    init_global();
    init_database();
  }
});

// src/server-state.ts
function createServerState(port) {
  return {
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    port,
    projects: {}
  };
}
function initProjectState(state, name, projectPath) {
  if (!state.projects[name]) {
    state.projects[name] = {
      name,
      path: projectPath,
      status: "idle",
      lastIndexAt: null,
      lastDurationMs: null,
      lastChanges: null,
      error: null
    };
  }
}
function updateProjectState(state, name, update) {
  if (state.projects[name]) {
    Object.assign(state.projects[name], update);
  }
}
function getSerializedState(state) {
  const uptimeMs = Date.now() - new Date(state.startedAt).getTime();
  return {
    startedAt: state.startedAt,
    uptimeMs,
    port: state.port,
    projects: Object.values(state.projects).map((p) => ({ ...p }))
  };
}
var init_server_state = __esm({
  "src/server-state.ts"() {
    "use strict";
  }
});

// src/html/dashboard.ts
function getDashboardJS() {
  return `
var curProj=null,graphCache={},sigmaInstance=null,graphologyGraph=null;

// \u521D\u59CB\u5316
document.querySelectorAll(".proj-item").forEach(function(el){
  el.addEventListener("click",function(){selectProject(el.dataset.name)});
});
document.getElementById("searchBtn").addEventListener("click",doSearch);
document.getElementById("searchInput").addEventListener("keydown",function(e){if(e.key==="Enter")doSearch()});
document.getElementById("logDateFilter").addEventListener("change",loadLogs);
document.getElementById("logActionFilter").addEventListener("change",loadLogs);
loadLogDates();

// SSE
var es=new EventSource("/api/events");
es.addEventListener("project-added",function(e){
  var d=JSON.parse(e.data);
  if(d.name&&!document.querySelector('[data-name="'+d.name+'"]')){
    var div=document.createElement("div");
    div.className="proj-item";
    div.dataset.name=d.name;
    div.innerHTML='<div class="proj-name"><span class="status status-idle"></span> '+esc(d.name)+'</div>'
      +'<div class="proj-path" title="'+esc(d.path)+'">'+esc(d.path)+'</div>'
      +'<div class="proj-stats"><span>-</span></div>'
      +'<div class="proj-actions">'
      +'<button class="btn" onclick="event.stopPropagation();triggerAction(\\''+esc(d.name)+'\\',\\'update\\')">\u589E\u91CF\u66F4\u65B0</button> '
      +'<button class="btn" onclick="event.stopPropagation();triggerAction(\\''+esc(d.name)+'\\',\\'index\\')">\u91CD\u5EFA\u7D22\u5F15</button> '
      +'<button class="btn" onclick="event.stopPropagation();showLogs()">\u67E5\u770B\u65E5\u5FD7</button>'
      +'</div>';
    div.addEventListener("click",function(){selectProject(d.name)});
    document.getElementById("projList").appendChild(div);
  }
});
es.addEventListener("index-progress",function(e){
  var d=JSON.parse(e.data);
  if(d.type==="progress"&&d.project){
    updateBar(d.project,d.phase,d.current,d.total);
  }
  if(d.type==="state"&&d.project){
    var el=document.querySelector('[data-name="'+d.project+'"]');
    if(el){
      var dot=el.querySelector(".status");
      if(dot){dot.className="status status-"+d.status}
    }
    if(d.status==="completed"||d.status==="failed"){
      hideBar(d.project);
      loadLogs();
    }
    if(d.status==="indexing")showBar(d.project);
  }
});
es.addEventListener("project-removed",function(e){
  var d=JSON.parse(e.data);
  var el=document.querySelector('[data-name="'+d.name+'"]');
  if(el)el.remove();
});

var phaseLabels={scanning:"\u626B\u63CF\u6587\u4EF6",chunking:"\u4EE3\u7801\u5206\u5757",embedding:"\u751F\u6210\u5411\u91CF",writing:"\u5199\u5165\u7D22\u5F15",deps:"\u63D0\u53D6\u4F9D\u8D56"};

function showBar(name){
  var wrap=document.getElementById("bar-"+name);
  if(!wrap){
    var item=document.querySelector('[data-name="'+name+'"]');
    if(!item)return;
    wrap=document.createElement("div");
    wrap.className="proj-bar-wrap";
    wrap.id="bar-"+name;
    item.appendChild(wrap);
  }
  wrap.classList.add("visible");
  wrap.innerHTML='<div class="proj-bar-label"><span class="bar-phase">\u51C6\u5907\u4E2D...</span><span class="bar-pct">0%</span></div><div class="proj-bar-track"><div class="proj-bar-fill"></div></div>';
}

function updateBar(name,phase,current,total){
  var wrap=document.getElementById("bar-"+name);
  if(!wrap||!wrap.classList.contains("visible"))showBar(name);
  wrap=document.getElementById("bar-"+name);
  if(!wrap)return;
  var pct=total>0?Math.round(current/total*100):0;
  var label=phaseLabels[phase]||phase;
  var lbl=wrap.querySelector(".bar-phase");
  var pctEl=wrap.querySelector(".bar-pct");
  var fill=wrap.querySelector(".proj-bar-fill");
  if(lbl)lbl.textContent=label;
  if(pctEl)pctEl.textContent=pct+"%";
  if(fill)fill.style.width=pct+"%";
}

function hideBar(name){
  var wrap=document.getElementById("bar-"+name);
  if(wrap)wrap.classList.remove("visible");
}

function selectProject(name){
  document.querySelectorAll(".proj-item").forEach(function(el){
    el.classList.toggle("active",el.dataset.name===name);
  });
  curProj=name;
  if(graphCache[name]){renderGraph(graphCache[name])}
  else{
    fetch("/api/graph/"+encodeURIComponent(name)).then(function(r){return r.json()}).then(function(res){
      if(res.ok){var g=buildFileGraph(res.data);graphCache[name]=g;renderGraph(g)}
    });
  }
}

function buildFileGraph(deps){
  var nodes=deps.nodes||{},edges=deps.edges||[];
  var files={},fileSet={};

  for(var nid in nodes){
    var n=nodes[nid];
    var fp=n.file;
    if(!fileSet[fp]){
      fileSet[fp]=1;
      var parts=fp.split("/");
      var file=parts[parts.length-1];
      var dir=parts.length>1?parts.slice(0,-1).join("/"):"(root)";
      var shortFile=file.replace(/\\\\.(ts|js|tsx|json|md)$/,"");
      files[fp]={id:fp,label:shortFile,file:fp,directory:dir,count:0,symbols:[]};
    }
    files[fp].count++;
    if(n.type!=="module"){
      files[fp].symbols.push({symbol:n.symbol,line:n.line,type:n.type});
    }
  }

  var fileEdgesMap={};
  for(var i=0;i<edges.length;i++){
    var e=edges[i];
    var fn=nodes[e.from],tn=nodes[e.to];
    if(!fn||!tn)continue;
    var f1=fn.file,f2=tn.file;
    if(f1&&f2&&f1!==f2){
      var k=f1+"|"+f2;
      if(!fileEdgesMap[k]){
        fileEdgesMap[k]={source:f1,target:f2,weight:0,relations:{}};
      }
      fileEdgesMap[k].weight++;
      fileEdgesMap[k].relations[e.relation]=true;
    }
  }

  var gNodes=[],gEdges=[];
  var fileList=Object.keys(files);
  var colors=["#38bdf8","#a78bfa","#22c55e","#f59e0b","#f472b6","#818cf8","#34d399","#fbbf24","#fb923c","#e879f9"];

  for(var idx=0;idx<fileList.length;idx++){
    var fp=fileList[idx];
    var f=files[fp];
    var size=Math.max(8,Math.min(f.count*2+6,20));
    // \u968F\u673A\u4F4D\u7F6E
    gNodes.push({
      id:fp,
      label:f.label,
      size:size,
      color:colors[idx%colors.length],
      type:"module",
      fullPath:fp,
      directory:f.directory,
      symbolCount:f.count,
      funcCount:f.symbols.length,
      functions:f.symbols,
      x:Math.random()*100,
      y:Math.random()*100
    });
  }

  var edgeList=Object.keys(fileEdgesMap);
  for(var j=0;j<edgeList.length;j++){
    var k=edgeList[j];
    var fe=fileEdgesMap[k];
    var rtypes=Object.keys(fe.relations).join(",");
    var edgeColor={"imports":"#38bdf8","calls":"#22c55e","implements":"#f59e0b"}[rtypes]||"#334155";
    gEdges.push({
      source:fe.source,
      target:fe.target,
      size:Math.min(fe.weight*0.5+0.5,2),
      color:edgeColor,
      weight:fe.weight,
      label:rtypes
    });
  }

  return{nodes:gNodes,edges:gEdges,fileCount:gNodes.length,edgeCount:gEdges.length};
}

function renderGraph(gd){
  document.getElementById("ph").style.display="none";
  document.getElementById("graphInfo").textContent=gd.fileCount+" files | "+gd.edgeCount+" dependencies";
  document.getElementById("nodeCount").textContent=gd.fileCount;

  // \u9500\u6BC1\u65E7\u5B9E\u4F8B
  if(sigmaInstance){sigmaInstance.kill();sigmaInstance=null}
  if(graphologyGraph){graphologyGraph.clear();graphologyGraph=null}

  // \u521B\u5EFA Graphology \u56FE
  graphologyGraph=new graphology.Graph();

  gd.nodes.forEach(function(n){
    graphologyGraph.addNode(n.id,{
      x:n.x,
      y:n.y,
      size:n.size,
      color:n.color,
      label:n.label,
      _data:n
    });
  });

  gd.edges.forEach(function(e){
    var key=e.source+"->"+e.target;
    if(!graphologyGraph.hasEdge(key)){
      try{
        graphologyGraph.addEdgeWithKey(key,e.source,e.target,{
          size:e.size,
          color:e.color,
          type:"arrow",
          _data:e
        });
      }catch(err){}
    }
  });

  // \u521B\u5EFA Sigma \u6E32\u67D3\u5668
  sigmaInstance=new Sigma(graphologyGraph,document.getElementById("graph"),{
    renderLabels:true,
    labelDensity:0.07,
    labelGridCellSize:60,
    labelColor:{color:"#94a3b8"},
    labelFont:"11px Inter, system-ui, sans-serif"
  });

  // \u529B\u5BFC\u5411\u52A8\u753B\uFF08\u5EF6\u8FDF\u542F\u52A8\u786E\u4FDD\u6E32\u67D3\u5668\u5C31\u7EEA\uFF09
  setTimeout(function(){
    var animSteps=0;
    var maxSteps=150;
    function applyForceLayout(){
      if(animSteps>=maxSteps)return;
      animSteps++;
      var nodePositions={};
      graphologyGraph.forEachNode(function(node,attrs){
        nodePositions[node]={x:attrs.x,y:attrs.y,vx:0,vy:0};
      });
      // \u65A5\u529B
      var nodeList=Object.keys(nodePositions);
      for(var i=0;i<nodeList.length;i++){
        for(var j=i+1;j<nodeList.length;j++){
          var n1=nodeList[i],n2=nodeList[j];
          var dx=nodePositions[n2].x-nodePositions[n1].x;
          var dy=nodePositions[n2].y-nodePositions[n1].y;
          var dist=Math.sqrt(dx*dx+dy*dy)||1;
          var force=400/(dist*dist);
          var fx=force*dx/dist,fy=force*dy/dist;
          nodePositions[n1].vx-=fx;nodePositions[n1].vy-=fy;
          nodePositions[n2].vx+=fx;nodePositions[n2].vy+=fy;
        }
      }
      // \u5F15\u529B\uFF08\u8FB9\uFF09
      graphologyGraph.forEachEdge(function(edge,attrs,source,target){
        if(!nodePositions[source]||!nodePositions[target])return;
        var dx=nodePositions[target].x-nodePositions[source].x;
        var dy=nodePositions[target].y-nodePositions[source].y;
        var dist=Math.sqrt(dx*dx+dy*dy)||1;
        var force=(dist-60)*0.008;
        nodePositions[source].vx+=force*dx/dist;
        nodePositions[source].vy+=force*dy/dist;
        nodePositions[target].vx-=force*dx/dist;
        nodePositions[target].vy-=force*dy/dist;
      });
      // \u4E2D\u5FC3\u5F15\u529B\uFF08\u62C9\u56DE\u753B\u5E03\u4E2D\u5FC3\uFF09
      nodeList.forEach(function(node){
        var p=nodePositions[node];
        var dist=Math.sqrt(p.x*p.x+p.y*p.y)||1;
        var force=0.002;
        p.vx-=force*p.x/dist;
        p.vy-=force*p.y/dist;
      });
      // \u66F4\u65B0\u4F4D\u7F6E
      graphologyGraph.forEachNode(function(node){
        var p=nodePositions[node];
        if(p){
          p.x+=p.vx*0.05;
          p.y+=p.vy*0.05;
          graphologyGraph.setNodeAttribute(node,"x",p.x);
          graphologyGraph.setNodeAttribute(node,"y",p.y);
        }
      });
      try{sigmaInstance.refresh()}catch(e){}
      requestAnimationFrame(applyForceLayout);
    }
    applyForceLayout();
  },50);

  // \u8282\u70B9\u70B9\u51FB
  sigmaInstance.on("clickNode",function(params){
    var node=params.node;
    var attrs=graphologyGraph.getNodeAttributes(node);
    var d=attrs._data||{};
    var det=document.getElementById("nodeDetail");
    det.classList.add("visible");
    document.getElementById("ndTitle").textContent=d.fullPath||attrs.label;
    document.getElementById("ndMeta").textContent="Dir: "+(d.directory||"-")+" | Symbols: "+(d.symbolCount||0);
    var ul=document.getElementById("funcList");ul.innerHTML="";
    (d.functions||[]).forEach(function(f){
      var li=document.createElement("li");li.className="func-item";
      li.innerHTML='<span class="sym">'+esc(f.symbol)+'</span> <span class="ln">:'+f.line+" "+f.type+"</span>";
      ul.appendChild(li);
    });
  });

  // \u70B9\u51FB\u7A7A\u767D\u5904\u53D6\u6D88\u9AD8\u4EAE
  sigmaInstance.on("clickStage",function(){
    document.getElementById("nodeDetail").classList.remove("visible");
  });
}

window.addEventListener("resize",function(){
  if(sigmaInstance)sigmaInstance.refresh();
});

function doSearch(){
  var q=document.getElementById("searchInput").value.trim();
  if(!q)return;
  var url="/api/search?q="+encodeURIComponent(q);
  if(curProj)url+="&project="+encodeURIComponent(curProj);
  else url+="&project=all";
  fetch(url).then(function(r){return r.json()}).then(function(res){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    if(!res.ok||!res.data||!res.data.length){box.innerHTML='<div style="color:#64748b;padding:12px">\u65E0\u7ED3\u679C</div>';return}
    box.innerHTML=res.data.map(function(r){
      return '<div class="sr-item"><span class="sr-sym">'+esc(r.symbol)+'</span><span class="sr-score">'+r.score.toFixed(2)+'</span>'
        +'<div class="sr-file">'+esc(r.file)+":"+r.lineStart+'</div>'
        +'<div class="sr-text">'+esc(r.text.substring(0,150))+'</div></div>';
    }).join("");
  }).catch(function(e){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    box.innerHTML='<div style="color:#ef4444;padding:12px">\u641C\u7D22\u5931\u8D25: '+esc(e.message)+'</div>';
  });
}

function triggerAction(name,action){
  var btn=event.target;btn.disabled=true;btn.textContent="...";
  fetch("/api/"+action+"/"+encodeURIComponent(name),{method:"POST"})
    .then(function(r){return r.json()})
    .then(function(res){btn.disabled=false;btn.textContent=action==="index"?"\u91CD\u5EFA\u7D22\u5F15":"\u589E\u91CF\u66F4\u65B0";if(!res.ok)alert(res.error||"\u64CD\u4F5C\u5931\u8D25")})
    .catch(function(e){btn.disabled=false;btn.textContent=action==="index"?"\u91CD\u5EFA\u7D22\u5F15":"\u589E\u91CF\u66F4\u65B0";alert(e.message)});
}

function showLogs(){
  var panel=document.getElementById("logPanel");
  panel.classList.toggle("visible");
  if(panel.classList.contains("visible"))loadLogs();
}

function loadLogDates(){
  fetch("/api/logs/dates").then(function(r){return r.json()}).then(function(res){
    if(!res.ok)return;
    var sel=document.getElementById("logDateFilter");
    sel.innerHTML='<option value="">\u4ECA\u5929</option>';
    res.data.forEach(function(d){
      var o=document.createElement("option");o.value=d;o.textContent=d;sel.appendChild(o);
    });
  });
}

function loadLogs(){
  var date=document.getElementById("logDateFilter").value;
  var action=document.getElementById("logActionFilter").value;
  var url="/api/logs?limit=100";
  if(curProj)url+="&project="+encodeURIComponent(curProj);
  if(date)url+="&date="+encodeURIComponent(date);
  if(action)url+="&action="+encodeURIComponent(action);
  fetch(url).then(function(r){return r.json()}).then(function(res){
    var body=document.getElementById("logBody");
    if(!res.ok||!res.data||!res.data.length){body.innerHTML='<div class="log-empty">\u6682\u65E0\u65E5\u5FD7\u8BB0\u5F55</div>';return}
    body.innerHTML=res.data.map(function(l){
      var stCls="log-st "+l.status;
      var dur=l.durationMs?('<span class="log-dur">'+l.durationMs+'ms</span>'):"";
      var err=l.error?('<div class="log-err">'+esc(l.error)+'</div>'):"";
      var t=new Date(l.time);
      var ts=t.toLocaleTimeString();
      return '<div class="log-row"><span class="log-time">'+ts+'</span>'
        +' <span class="log-action '+l.action+'">'+l.action+'</span>'
        +' <span class="'+stCls+'">'+l.status+'</span>'+dur
        +' <span style="color:#64748b;font-size:10px">'+esc(l.project)+'</span>'
        +err+'</div>';
    }).join("");
  });
}

function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}

function showSettings(){
  var panel=document.getElementById("cfgPanel");
  panel.classList.toggle("visible");
  if(panel.classList.contains("visible"))loadSettings();
}

function loadSettings(){
  fetch("/api/settings").then(function(r){return r.json()}).then(function(res){
    if(!res.ok)return;
    var d=res.data;
    document.getElementById("cfgOllamaUrl").value=d.ollamaUrl||"";
    document.getElementById("cfgModel").value=d.model||"";
    document.getElementById("cfgBatchSize").value=d.batchSize||32;
    document.getElementById("cfgBatchDelay").value=d.batchDelay||0;
  });
}

function saveSettings(){
  var data={
    ollamaUrl:document.getElementById("cfgOllamaUrl").value.trim(),
    model:document.getElementById("cfgModel").value.trim(),
    batchSize:parseInt(document.getElementById("cfgBatchSize").value)||32,
    batchDelay:parseInt(document.getElementById("cfgBatchDelay").value)||0
  };
  fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
    .then(function(r){return r.json()})
    .then(function(res){
      if(res.ok){
        document.getElementById("cfgPanel").classList.remove("visible");
        showToast("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
      }else{
        alert("\u4FDD\u5B58\u5931\u8D25: "+(res.error||"unknown"));
      }
    })
    .catch(function(e){alert("\u4FDD\u5B58\u5931\u8D25: "+e.message)});
}

function showToast(msg){
  var t=document.getElementById("cfgToast");
  t.textContent=msg;
  t.classList.add("show");
  setTimeout(function(){t.classList.remove("show")},2000);
}
`;
}
var init_dashboard = __esm({
  "src/html/dashboard.ts"() {
    "use strict";
  }
});

// src/html/css.ts
function getDashboardCSS() {
  return `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;background:#0b1020;color:#e5e7eb;overflow:hidden}
.app{display:flex;height:100vh;width:100vw}

/* Sidebar */
.sidebar{width:320px;min-width:320px;background:rgba(17,24,39,0.95);border-right:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;backdrop-filter:blur(12px)}
.sidebar-hd{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between}
.sidebar-hd h1{color:#38bdf8;font-size:18px;font-weight:600;letter-spacing:-0.3px}
.sidebar-hd span{color:#64748b;font-size:11px;font-family:monospace}
.proj-list{flex:1;overflow-y:auto;padding:8px 12px}
.proj-item{padding:10px 12px;border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all .15s;border:1px solid transparent}
.proj-item:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.06)}
.proj-item.active{background:rgba(56,189,248,0.12);border-color:rgba(56,189,248,0.3)}
.proj-item.active .proj-name{color:#38bdf8}
.proj-name{font-weight:600;font-size:13px;display:flex;align-items:center;gap:8px}
.proj-path{color:#64748b;font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.proj-stats{font-size:10px;color:#64748b;margin-top:4px;display:flex;gap:8px;align-items:center}
.status{display:inline-block;width:7px;height:7px;border-radius:50%}
.status-idle{background:#64748b}
.status-checking,.status-indexing{background:#f59e0b;animation:pulse 1s infinite}
.status-completed{background:#22c55e}
.status-failed{background:#ef4444}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.proj-actions{margin-top:6px;display:flex;gap:4px;flex-wrap:wrap}
.proj-actions .btn{font-size:10px;padding:3px 8px}
.proj-bar-wrap{margin-top:8px;display:none}
.proj-bar-wrap.visible{display:block}
.proj-bar-label{font-size:10px;color:#64748b;margin-bottom:3px;display:flex;justify-content:space-between}
.proj-bar-track{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}
.proj-bar-fill{height:100%;background:linear-gradient(90deg,#38bdf8,#818cf8);border-radius:2px;width:0%;transition:width .3s ease}

/* Buttons */
.btn{background:rgba(255,255,255,0.06);color:#e5e7eb;border:1px solid rgba(255,255,255,0.08);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;transition:all .15s}
.btn:hover{background:rgba(255,255,255,0.1)}
.btn.active{background:#38bdf8;border-color:#38bdf8;color:#0b1020}

/* Node detail */
.node-detail{border-top:1px solid rgba(255,255,255,0.06);padding:12px 16px;max-height:40vh;overflow-y:auto;display:none}
.node-detail.visible{display:block}
.node-detail h3{color:#38bdf8;font-size:13px;margin-bottom:4px;word-break:break-all}
.node-detail .meta{color:#64748b;font-size:11px;margin-bottom:8px}
.func-list{list-style:none}
.func-item{padding:3px 0;font-size:11px;color:#e5e7eb;border-bottom:1px solid rgba(255,255,255,0.04)}
.func-item:last-child{border:none}
.func-item .sym{color:#f0f6fc}
.func-item .ln{color:#64748b;font-size:10px}

/* Search */
.search-box{display:flex;gap:6px;align-items:center}
.search-box input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#e5e7eb;padding:8px 12px;border-radius:10px;font-size:13px;width:260px;outline:none;transition:border-color .15s}
.search-box input:focus{border-color:rgba(56,189,248,0.5)}
.search-box input::placeholder{color:#475569}
.search-box button{background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s}
.search-box button:hover{background:rgba(56,189,248,0.25)}
.search-results{padding:0 8px;max-height:30vh;overflow-y:auto;display:none;border-top:1px solid rgba(255,255,255,0.06)}
.search-results.visible{display:block}
.sr-item{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background .1s}
.sr-item:hover{background:rgba(255,255,255,0.03)}
.sr-item:last-child{border:none}
.sr-sym{color:#f0f6fc;font-weight:600;font-size:12px}
.sr-score{color:#64748b;font-size:10px;float:right}
.sr-file{color:#38bdf8;font-size:11px}
.sr-text{color:#64748b;font-size:11px;margin-top:3px;max-height:40px;overflow:hidden}

/* Toolbar & main */
.toolbar{padding:8px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:center;background:rgba(17,24,39,0.6);backdrop-filter:blur(8px)}
.toolbar .info{color:#64748b;font-size:12px;margin-left:auto;font-family:monospace}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}
.graph-wrap{flex:1;position:relative}
#graph{width:100%;height:100%}
.placeholder{display:flex;align-items:center;justify-content:center;height:100%;color:#334155;font-size:14px;font-weight:300}

/* Topbar */
.topbar{position:absolute;top:16px;right:16px;background:rgba(15,23,42,0.85);padding:8px 14px;border-radius:10px;font-size:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);color:#64748b;z-index:10;font-family:monospace}

/* Log overlay */
.log-overlay{display:none;position:fixed;top:0;right:0;width:440px;height:100vh;background:rgba(17,24,39,0.98);border-left:1px solid rgba(255,255,255,0.08);z-index:100;flex-direction:column;backdrop-filter:blur(12px)}
.log-overlay.visible{display:flex}
.log-hd{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between}
.log-hd h2{color:#38bdf8;font-size:14px;font-weight:600}
.log-hd .close{background:none;border:none;color:#64748b;cursor:pointer;font-size:20px;padding:0 4px;transition:color .15s}
.log-hd .close:hover{color:#e5e7eb}
.log-filters{padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:center}
.log-filters select{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#e5e7eb;padding:4px 8px;border-radius:6px;font-size:11px}
.log-body{flex:1;overflow-y:auto;padding:4px 0}
.log-row{padding:6px 14px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:11px;transition:background .1s}
.log-row:hover{background:rgba(255,255,255,0.03)}
.log-time{color:#64748b;font-size:10px}
.log-action{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;margin:0 4px}
.log-action.index{background:rgba(56,189,248,0.15);color:#38bdf8}
.log-action.update{background:rgba(34,197,94,0.15);color:#22c55e}
.log-st.Completed{color:#22c55e}
.log-st.Failed{color:#ef4444}
.log-st.Started{color:#f59e0b}
.log-dur{color:#64748b;font-size:10px;margin-left:6px}
.log-err{color:#ef4444;font-size:10px;margin-top:2px}
.log-empty{color:#334155;text-align:center;padding:32px;font-size:12px}

/* Settings overlay */
.cfg-overlay{display:none;position:fixed;top:0;right:0;width:440px;height:100vh;background:rgba(17,24,39,0.98);border-left:1px solid rgba(255,255,255,0.08);z-index:101;flex-direction:column;backdrop-filter:blur(12px)}
.cfg-overlay.visible{display:flex}
.cfg-hd{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between}
.cfg-hd h2{color:#38bdf8;font-size:14px;font-weight:600}
.cfg-hd .close{background:none;border:none;color:#64748b;cursor:pointer;font-size:20px;padding:0 4px;transition:color .15s}
.cfg-hd .close:hover{color:#e5e7eb}
.cfg-body{flex:1;overflow-y:auto;padding:16px 18px}
.cfg-group{margin-bottom:14px}
.cfg-group label{display:block;color:#94a3b8;font-size:11px;font-weight:500;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
.cfg-group input,.cfg-group select{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#e5e7eb;padding:8px 12px;border-radius:8px;font-size:13px;outline:none;transition:border-color .15s}
.cfg-group input:focus,.cfg-group select:focus{border-color:rgba(56,189,248,0.5)}
.cfg-group input::placeholder{color:#475569}
.cfg-hint{color:#475569;font-size:10px;margin-top:3px}
.cfg-actions{padding:14px 18px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px}
.cfg-save{background:#38bdf8;color:#0b1020;border:1px solid #38bdf8;padding:8px 20px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.cfg-save:hover{background:#7dd3fc}
.cfg-toast{position:fixed;bottom:24px;right:24px;background:#22c55e;color:#0b1020;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:500;z-index:200;opacity:0;transition:opacity .3s}
.cfg-toast.show{opacity:1}`;
}
var init_css = __esm({
  "src/html/css.ts"() {
    "use strict";
  }
});

// src/html/index.ts
function renderDashboard(state) {
  const uptimeMs = Date.now() - new Date(state.startedAt).getTime();
  const uptime = formatUptime(uptimeMs);
  const projects = Object.values(state.projects);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>codesense server</title>
<style>
${getDashboardCSS()}
</style>
</head>
<body>
<div class="app">
<div class="sidebar">
  <div class="sidebar-hd"><h1>codesense</h1><div style="display:flex;gap:8px;align-items:center"><button class="btn" onclick="showSettings()" title="\u8BBE\u7F6E" style="font-size:14px;padding:2px 8px;cursor:pointer">&#9881;</button><span id="uptime">${uptime}</span></div></div>
  <div class="proj-list" id="projList">
    ${projects.map((p) => projItem(p)).join("\n    ")}
  </div>
  <div class="node-detail" id="nodeDetail">
    <h3 id="ndTitle"></h3>
    <div class="meta" id="ndMeta"></div>
    <ul class="func-list" id="funcList"></ul>
  </div>
</div>
<div class="main">
  <div class="toolbar">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="\u8BED\u4E49\u641C\u7D22..." />
      <button id="searchBtn">\u641C\u7D22</button>
    </div>
    <span class="info" id="graphInfo"></span>
  </div>
  <div class="search-results" id="searchResults"></div>
  <div class="graph-wrap">
    <div class="topbar" id="topbar">Nodes: <span id="nodeCount">0</span></div>
    <div class="placeholder" id="ph">Click a project in the sidebar to view its dependency graph</div>
    <div id="graph"></div>
  </div>
</div>
</div>
<div class="log-overlay" id="logPanel">
  <div class="log-hd">
    <h2>\u64CD\u4F5C\u65E5\u5FD7</h2>
    <button class="close" onclick="document.getElementById('logPanel').classList.remove('visible')">&times;</button>
  </div>
  <div class="log-filters">
    <select id="logDateFilter"><option value="">\u4ECA\u5929</option></select>
    <select id="logActionFilter"><option value="">\u5168\u90E8</option><option value="index">\u7D22\u5F15</option><option value="update">\u66F4\u65B0</option></select>
  </div>
  <div class="log-body" id="logBody"></div>
</div>
<div class="cfg-overlay" id="cfgPanel">
  <div class="cfg-hd">
    <h2>Embedding \u8BBE\u7F6E</h2>
    <button class="close" onclick="document.getElementById('cfgPanel').classList.remove('visible')">&times;</button>
  </div>
  <div class="cfg-body">
    <div class="cfg-group">
      <label>Ollama URL</label>
      <input type="text" id="cfgOllamaUrl" placeholder="http://localhost:11434" />
    </div>
    <div class="cfg-group">
      <label>Model</label>
      <input type="text" id="cfgModel" placeholder="qwen3-embedding:0.6b" />
    </div>
    <div class="cfg-group">
      <label>Batch Size</label>
      <input type="number" id="cfgBatchSize" min="1" max="100" placeholder="32" />
      <div class="cfg-hint">\u6BCF\u6279\u5904\u7406\u7684\u6587\u672C\u6570\u91CF\u3002\u4F4E\u914D\u673A\u5668\u5EFA\u8BAE 5-10</div>
    </div>
    <div class="cfg-group">
      <label>Batch Delay (ms)</label>
      <input type="number" id="cfgBatchDelay" min="0" max="10000" step="50" placeholder="0" />
      <div class="cfg-hint">\u6279\u6B21\u95F4\u95F4\u9694\u3002\u4F4E\u914D\u673A\u5668\u5EFA\u8BAE 200-500ms</div>
    </div>
  </div>
  <div class="cfg-actions">
    <button class="cfg-save" onclick="saveSettings()">\u4FDD\u5B58</button>
    <button class="btn" onclick="document.getElementById('cfgPanel').classList.remove('visible')">\u53D6\u6D88</button>
  </div>
</div>
<div class="cfg-toast" id="cfgToast"></div>
<script src="https://unpkg.com/graphology@0.25.4/dist/graphology.umd.min.js"></script>
<script src="https://unpkg.com/sigma@2.4.0/build/sigma.min.js"></script>
<script>
${getDashboardJS()}
</script>
</body>
</html>`;
}
function projItem(p) {
  const timeStr = p.lastIndexAt ? new Date(p.lastIndexAt).toLocaleTimeString() : "-";
  const changesStr = p.lastChanges ? `+${p.lastChanges.added} ~${p.lastChanges.modified} -${p.lastChanges.deleted}` : "";
  return `<div class="proj-item" data-name="${p.name}">
  <div class="proj-name"><span class="status status-${p.status}"></span> ${p.name}</div>
  <div class="proj-path" title="${p.path}">${p.path}</div>
  <div class="proj-stats"><span>${timeStr}</span>${changesStr ? "<span>" + changesStr + "</span>" : ""}</div>
  <div class="proj-actions">
    <button class="btn" onclick="event.stopPropagation();triggerAction('${p.name}','update')">\u589E\u91CF\u66F4\u65B0</button>
    <button class="btn" onclick="event.stopPropagation();triggerAction('${p.name}','index')">\u91CD\u5EFA\u7D22\u5F15</button>
    <button class="btn" onclick="event.stopPropagation();showLogs()">\u67E5\u770B\u65E5\u5FD7</button>
  </div>
  <div class="proj-bar-wrap" id="bar-${p.name}"></div>
</div>`;
}
function formatUptime(ms) {
  const sec = Math.floor(ms / 1e3);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}
var init_html = __esm({
  "src/html/index.ts"() {
    "use strict";
    init_dashboard();
    init_css();
  }
});

// src/server.ts
var server_exports = {};
__export(server_exports, {
  startServer: () => startServer
});
function broadcastSSE(event, data) {
  const payload = `event: ${event}
data: ${JSON.stringify(data)}

`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}
async function startServer(options) {
  const state = createServerState(options.port);
  const projects = listProjects();
  for (const p of projects) {
    initProjectState(state, p.name, p.path);
  }
  const server = http2.createServer(
    (req, res) => handleRequest(req, res, state)
  );
  const shutdown = () => {
    console.log("\n\u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...");
    for (const client of sseClients) {
      try {
        client.end();
      } catch {
      }
    }
    sseClients.clear();
    closeDb();
    server.close(() => {
      console.log("\u670D\u52A1\u5668\u5DF2\u5173\u95ED");
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 3e3);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  server.listen(options.port, () => {
    console.log(`codesense server \u5DF2\u542F\u52A8`);
    console.log(`  \u5730\u5740:     http://localhost:${options.port}`);
    console.log(`  \u9879\u76EE\u6570:   ${projects.length}`);
    console.log(`
\u6309 Ctrl+C \u505C\u6B62`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\u7AEF\u53E3 ${options.port} \u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u4F7F\u7528 --port \u6307\u5B9A\u5176\u4ED6\u7AEF\u53E3`);
      process.exit(1);
    }
    console.error("\u670D\u52A1\u5668\u9519\u8BEF:", err.message);
  });
}
function handleNotify(req, res, state) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const { event, data } = JSON.parse(body);
      const name = data.name;
      const ts = (/* @__PURE__ */ new Date()).toLocaleTimeString();
      console.log(`[${ts}] notify: ${event}${name ? " " + name : ""}`);
      switch (event) {
        case "project-registered":
          if (name) {
            initProjectState(state, name, data.path || "");
            broadcastSSE("project-added", { name, path: data.path || "", status: "idle" });
          }
          break;
        case "project-unregistered":
          if (name) {
            delete state.projects[name];
            broadcastSSE("project-removed", { name });
          }
          break;
        case "index-started":
        case "update-started":
          if (name) {
            updateProjectState(state, name, { status: "indexing", error: null });
            broadcastSSE("index-progress", { type: "state", project: name, status: "indexing" });
          }
          break;
        case "index-progress":
        case "update-progress":
          broadcastSSE("index-progress", { type: "progress", ...data });
          break;
        case "index-completed":
        case "update-completed":
          if (name) {
            updateProjectState(state, name, {
              status: "completed",
              lastIndexAt: (/* @__PURE__ */ new Date()).toISOString(),
              lastDurationMs: data.durationMs || null,
              error: null
            });
            broadcastSSE("index-progress", { type: "state", project: name, ...state.projects[name] });
          }
          break;
        case "index-failed":
        case "update-failed":
          if (name) {
            updateProjectState(state, name, { status: "failed", error: data.error || "unknown" });
            broadcastSSE("index-progress", { type: "state", project: name, ...state.projects[name] });
          }
          break;
      }
      sendJSON(res, 200, { ok: true });
    } catch {
      sendJSON(res, 400, { ok: false, error: "Invalid JSON" });
    }
  });
}
async function handleRequest(req, res, state) {
  const url = new import_url.URL(req.url || "/", `http://localhost:${state.port}`);
  const pathname = url.pathname;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  try {
    if (pathname === "/" && req.method === "GET") {
      serveHTML(res, state);
    } else if (pathname === "/api/status" && req.method === "GET") {
      await serveStatus(res, state);
    } else if (pathname === "/api/projects" && req.method === "GET") {
      await serveProjects(res);
    } else if (pathname.startsWith("/api/projects/") && req.method === "GET") {
      const name = decodeURIComponent(pathname.slice("/api/projects/".length));
      await serveProjectDetail(res, name);
    } else if (pathname.startsWith("/api/graph/") && req.method === "GET") {
      const name = decodeURIComponent(pathname.slice("/api/graph/".length));
      await serveGraphData(res, name);
    } else if (pathname.startsWith("/api/index/") && req.method === "POST") {
      const name = decodeURIComponent(pathname.slice("/api/index/".length));
      await triggerIndex(res, state, name);
    } else if (pathname.startsWith("/api/update/") && req.method === "POST") {
      const name = decodeURIComponent(pathname.slice("/api/update/".length));
      await triggerUpdate(res, state, name);
    } else if (pathname === "/api/search" && req.method === "GET") {
      await serveSearch(res, url);
    } else if (pathname === "/api/logs" && req.method === "GET") {
      serveLogs(res, url);
    } else if (pathname === "/api/logs/dates" && req.method === "GET") {
      serveLogDates(res);
    } else if (pathname === "/api/events" && req.method === "GET") {
      handleSSE(req, res);
    } else if (pathname === "/api/notify" && req.method === "POST") {
      handleNotify(req, res, state);
    } else if (pathname === "/api/settings" && req.method === "GET") {
      serveSettings(res);
    } else if (pathname === "/api/settings" && req.method === "PUT") {
      updateSettings(req, res);
    } else {
      sendJSON(res, 404, { ok: false, error: "Not Found" });
    }
  } catch (err) {
    sendJSON(res, 500, { ok: false, error: err.message });
  }
}
function serveHTML(res, state) {
  const html = renderDashboard(state);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}
async function serveStatus(res, state) {
  sendJSON(res, 200, { ok: true, data: getSerializedState(state) });
}
async function serveProjects(res) {
  const projects = listProjects();
  const results = await Promise.all(
    projects.map(async (p) => {
      const projectDir = getProjectDir(p.name);
      const config = loadConfig(p.name);
      const stats = await getTableStats(path12.join(projectDir, "index.lance"));
      return {
        name: p.name,
        path: p.path,
        createdAt: p.createdAt,
        hasIndex: !!config,
        chunkCount: stats?.count ?? 0,
        config: config ? { dimensions: config.dimensions, strategy: config.strategy, updatedAt: config.updatedAt } : null
      };
    })
  );
  sendJSON(res, 200, { ok: true, data: results });
}
async function serveProjectDetail(res, name) {
  const projectDir = getProjectDir(name);
  if (!fs11.existsSync(projectDir)) {
    sendJSON(res, 404, { ok: false, error: `\u9879\u76EE "${name}" \u672A\u627E\u5230` });
    return;
  }
  const config = loadConfig(name);
  const stats = await getTableStats(path12.join(projectDir, "index.lance"));
  const { nodeCount: depCount, edgeCount } = dbGetDepStats(name);
  sendJSON(res, 200, {
    ok: true,
    data: {
      name,
      config,
      chunkCount: stats?.count ?? 0,
      depNodes: depCount,
      depEdges: edgeCount
    }
  });
}
async function serveGraphData(res, name) {
  const config = loadConfig(name);
  if (!config) {
    sendJSON(res, 404, { ok: false, error: `\u9879\u76EE "${name}" \u65E0\u4F9D\u8D56\u56FE\u6570\u636E` });
    return;
  }
  const deps = loadDepGraph(name);
  sendJSON(res, 200, { ok: true, data: deps });
}
async function triggerIndex(res, state, name) {
  const projects = listProjects();
  const project = projects.find((p) => p.name === name);
  if (!project) {
    sendJSON(res, 404, { ok: false, error: `\u9879\u76EE "${name}" \u672A\u627E\u5230` });
    return;
  }
  updateProjectState(state, name, { status: "indexing", error: null });
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    status: "indexing"
  });
  sendJSON(res, 200, { ok: true, data: { message: `\u5F00\u59CB\u5168\u91CF\u7D22\u5F15 ${name}` } });
  const start = Date.now();
  try {
    const { buildIndex: buildIndex2 } = (init_indexer(), __toCommonJS(indexer_exports));
    await buildIndex2(project.path, {
      quiet: true,
      exitOnError: false,
      onProgress: (phase, current, total) => {
        broadcastSSE("index-progress", {
          type: "progress",
          project: name,
          phase,
          current,
          total
        });
      }
    });
    const durationMs = Date.now() - start;
    updateProjectState(state, name, {
      status: "completed",
      lastIndexAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastDurationMs: durationMs,
      error: null
    });
    appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: name, action: "index", status: "completed", durationMs });
  } catch (err) {
    updateProjectState(state, name, { status: "failed", error: err.message });
    appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: name, action: "index", status: "failed", error: err.message });
  }
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    ...state.projects[name]
  });
}
async function triggerUpdate(res, state, name) {
  const projects = listProjects();
  const project = projects.find((p) => p.name === name);
  if (!project) {
    sendJSON(res, 404, { ok: false, error: `\u9879\u76EE "${name}" \u672A\u627E\u5230` });
    return;
  }
  updateProjectState(state, name, { status: "indexing", error: null });
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    status: "indexing"
  });
  sendJSON(res, 200, {
    ok: true,
    data: { message: `\u5F00\u59CB\u589E\u91CF\u66F4\u65B0 ${name}` }
  });
  const start = Date.now();
  try {
    const { updateIndex: updateIndex2 } = (init_update(), __toCommonJS(update_exports));
    await updateIndex2(project.path, { quiet: true, exitOnError: false });
    const durationMs = Date.now() - start;
    updateProjectState(state, name, {
      status: "completed",
      lastIndexAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastDurationMs: durationMs,
      error: null
    });
    appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: name, action: "update", status: "completed", durationMs });
  } catch (err) {
    updateProjectState(state, name, { status: "failed", error: err.message });
    appendLog({ time: (/* @__PURE__ */ new Date()).toISOString(), project: name, action: "update", status: "failed", error: err.message });
  }
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    ...state.projects[name]
  });
}
function serveLogs(res, url) {
  const project = url.searchParams.get("project") || void 0;
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const date = url.searchParams.get("date") || void 0;
  const logs = queryLogs({ project, limit, date });
  sendJSON(res, 200, { ok: true, data: logs });
}
function serveLogDates(res) {
  const dates = listLogDates();
  sendJSON(res, 200, { ok: true, data: dates });
}
async function serveSearch(res, url) {
  const q = url.searchParams.get("q") || "";
  if (!q) {
    sendJSON(res, 400, { ok: false, error: "\u7F3A\u5C11\u67E5\u8BE2\u53C2\u6570 q" });
    return;
  }
  const project = url.searchParams.get("project") || void 0;
  const topK = parseInt(url.searchParams.get("topK") || "10", 10);
  const results = await search(q, { topK, project });
  sendJSON(res, 200, { ok: true, data: results });
}
function handleSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write("\n");
  sseClients.add(res);
  req.on("close", () => {
    sseClients.delete(res);
  });
}
function serveSettings(res) {
  const config = dbLoadGlobalConfig();
  sendJSON(res, 200, {
    ok: true,
    data: {
      ollamaUrl: config.ollamaUrl,
      model: config.model,
      batchSize: config.batchSize,
      batchDelay: config.batchDelay
    }
  });
}
function updateSettings(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const updates = JSON.parse(body);
      const current = dbLoadGlobalConfig();
      const newConfig = {
        model: updates.model || current.model,
        ollamaUrl: updates.ollamaUrl || current.ollamaUrl,
        batchSize: typeof updates.batchSize === "number" ? updates.batchSize : current.batchSize,
        batchDelay: typeof updates.batchDelay === "number" ? updates.batchDelay : current.batchDelay
      };
      if (newConfig.batchSize < 1 || newConfig.batchSize > 100) {
        sendJSON(res, 400, { ok: false, error: "batchSize \u5FC5\u987B\u5728 1-100 \u4E4B\u95F4" });
        return;
      }
      if (newConfig.batchDelay < 0 || newConfig.batchDelay > 1e4) {
        sendJSON(res, 400, { ok: false, error: "batchDelay \u5FC5\u987B\u5728 0-10000ms \u4E4B\u95F4" });
        return;
      }
      dbSaveGlobalConfig(newConfig);
      sendJSON(res, 200, { ok: true });
    } catch {
      sendJSON(res, 400, { ok: false, error: "Invalid JSON" });
    }
  });
}
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}
var http2, fs11, path12, import_url, sseClients;
var init_server = __esm({
  "src/server.ts"() {
    "use strict";
    http2 = __toESM(require("http"));
    fs11 = __toESM(require("fs"));
    path12 = __toESM(require("path"));
    import_url = require("url");
    init_server_state();
    init_html();
    init_global();
    init_config();
    init_index();
    init_search();
    init_graph();
    init_database();
    init_logger();
    sseClients = /* @__PURE__ */ new Set();
  }
});

// node_modules/.pnpm/commander@12.1.0/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// scripts/init.ts
function register(program3) {
  program3.command("init").description("\u521D\u59CB\u5316 codesense\uFF08\u73AF\u5883\u68C0\u67E5 + \u5168\u5C40\u76EE\u5F55 + \u6CE8\u518C\u9879\u76EE + CLAUDE.md + git hook\uFF09").argument("[path]", "\u9879\u76EE\u76EE\u5F55", ".").action(async (projectDir) => {
    const { init: init2 } = await (init_install(), __toCommonJS(install_exports));
    const { notifyServer: notifyServer2 } = await (init_notify(), __toCommonJS(notify_exports));
    const { resolveProjectName: resolveProjectName2 } = await (init_global(), __toCommonJS(global_exports));
    const absDir = require("path").resolve(projectDir);
    await init2(projectDir);
    const name = resolveProjectName2(absDir);
    await notifyServer2("project-registered", { name, path: absDir });
  });
}

// scripts/list.ts
function register2(program3) {
  program3.command("list").description("\u5217\u51FA\u6240\u6709\u5DF2\u6CE8\u518C\u7684\u9879\u76EE").action(async () => {
    const { listProjects: listProjects2 } = await (init_global(), __toCommonJS(global_exports));
    const { loadConfig: loadConfig2 } = await (init_config(), __toCommonJS(config_exports));
    const projects = listProjects2();
    if (projects.length === 0) {
      console.log("\u6CA1\u6709\u5DF2\u6CE8\u518C\u7684\u9879\u76EE\u3002\u8FD0\u884C `codesense init` \u521D\u59CB\u5316\u3002");
      return;
    }
    console.log(`\u5DF2\u6CE8\u518C\u9879\u76EE (${projects.length}):
`);
    for (const p of projects) {
      const config = loadConfig2(p.name);
      let status = "\u672A\u5EFA\u7D22\u5F15";
      if (config) {
        status = `${config.dimensions}\u7EF4, ${config.updatedAt.slice(0, 10)}`;
      }
      console.log(`  ${p.name}`);
      console.log(`    \u8DEF\u5F84: ${p.path}`);
      console.log(`    \u72B6\u6001: ${status}
`);
    }
  });
}

// scripts/index_cmd.ts
function register3(program3) {
  program3.command("index").description("\u4E3A\u6307\u5B9A\u76EE\u5F55\u5EFA\u7ACB\u8BED\u4E49\u7D22\u5F15").argument("[path]", "\u76EE\u6807\u76EE\u5F55", ".").option("--strategy <strategy>", "\u7EF4\u5EA6\u7B56\u7565: auto | quality | performance", "auto").option("--local", "\u5F3A\u5236\u672C\u5730\u6267\u884C\uFF0C\u4E0D\u8F6C\u53D1\u7ED9 server").action(async (dir, options) => {
    const { resolveProjectName: resolveProjectName2 } = await (init_global(), __toCommonJS(global_exports));
    const absDir = require("path").resolve(dir);
    const name = resolveProjectName2(absDir);
    if (!options.local) {
      const { forwardToServer: forwardToServer2 } = await (init_forward(), __toCommonJS(forward_exports));
      const forwarded = await forwardToServer2("index", name);
      if (forwarded) return;
    }
    const { buildIndex: buildIndex2 } = await (init_indexer(), __toCommonJS(indexer_exports));
    const { notifyServer: notifyServer2 } = await (init_notify(), __toCommonJS(notify_exports));
    await notifyServer2("index-started", { name });
    const start = Date.now();
    try {
      await buildIndex2(absDir, {
        strategy: options.strategy,
        quiet: false,
        onProgress: (phase, current, total) => {
          notifyServer2("index-progress", { project: name, phase, current, total });
        }
      });
      await notifyServer2("index-completed", { name, durationMs: Date.now() - start });
    } catch (e) {
      await notifyServer2("index-failed", { name, error: e.message });
      throw e;
    }
  });
}

// scripts/search.ts
function register4(program3) {
  program3.command("search").description("\u8BED\u4E49\u641C\u7D22\u4EE3\u7801").argument("<query>", "\u641C\u7D22\u67E5\u8BE2\uFF08\u652F\u6301\u4E2D\u82F1\u6587\uFF09").option("-k, --top-k <number>", "\u8FD4\u56DE\u7ED3\u679C\u6570\u91CF", "10").option("-t, --type <type>", "\u8FC7\u6EE4\u7B26\u53F7\u7C7B\u578B: function | class | module").option("-l, --lang <lang>", "\u8FC7\u6EE4\u8BED\u8A00: python | typescript | go ...").option("-d, --dir <dir>", "\u8FC7\u6EE4\u76EE\u5F55\u524D\u7F00").option("--threshold <number>", "\u76F8\u4F3C\u5EA6\u9608\u503C (0-1)", "0.5").option("-p, --project <project>", "\u6307\u5B9A\u9879\u76EE\u540D\uFF08\u6216 all \u641C\u7D22\u5168\u90E8\u9879\u76EE\uFF09").action(
    async (query, options) => {
      const { search: search2 } = await (init_search(), __toCommonJS(search_exports));
      const results = await search2(query, {
        topK: parseInt(options.topK, 10),
        type: options.type,
        lang: options.lang,
        dir: options.dir,
        threshold: parseFloat(options.threshold),
        project: options.project
      });
      console.log(JSON.stringify({ results }, null, 2));
    }
  );
}

// scripts/trace.ts
function register5(program3) {
  program3.command("trace").description("\u8FFD\u8E2A\u7B26\u53F7\u7684\u4F9D\u8D56\u5173\u7CFB").argument("<symbol>", "\u7B26\u53F7\u540D\u79F0").option("--depth <number>", "\u5C55\u5F00\u6DF1\u5EA6", "3").option("--direction <direction>", "\u65B9\u5411: callers | callees | both", "both").option("--format <format>", "\u8F93\u51FA\u683C\u5F0F: tree | json | dot", "tree").action(
    async (symbol, options) => {
      const { trace: trace2 } = await (init_trace(), __toCommonJS(trace_exports));
      await trace2(symbol, {
        depth: parseInt(options.depth, 10),
        direction: options.direction,
        format: options.format
      });
    }
  );
}

// scripts/update.ts
function register6(program3) {
  program3.command("update").description("\u589E\u91CF\u66F4\u65B0\u7D22\u5F15\uFF08\u81EA\u52A8\u68C0\u6D4B git \u53D8\u66F4\u6587\u4EF6\uFF09").option("-q, --quiet", "\u9759\u9ED8\u6A21\u5F0F").option("--local", "\u5F3A\u5236\u672C\u5730\u6267\u884C\uFF0C\u4E0D\u8F6C\u53D1\u7ED9 server").action(async (options) => {
    const { resolveProjectName: resolveProjectName2 } = await (init_global(), __toCommonJS(global_exports));
    const absDir = require("path").resolve(".");
    const name = resolveProjectName2(absDir);
    if (!options.local && !options.quiet) {
      const { forwardToServer: forwardToServer2 } = await (init_forward(), __toCommonJS(forward_exports));
      const forwarded = await forwardToServer2("update", name);
      if (forwarded) return;
    }
    const { updateIndex: updateIndex2 } = await (init_update(), __toCommonJS(update_exports));
    const { notifyServer: notifyServer2 } = await (init_notify(), __toCommonJS(notify_exports));
    await notifyServer2("update-started", { name });
    const start = Date.now();
    try {
      await updateIndex2(".", {
        quiet: options.quiet,
        onProgress: (phase, current, total) => {
          notifyServer2("update-progress", { project: name, phase, current, total });
        }
      });
      await notifyServer2("update-completed", { name, durationMs: Date.now() - start });
    } catch (e) {
      await notifyServer2("update-failed", { name, error: e.message });
      throw e;
    }
  });
}

// scripts/status.ts
function register7(program3) {
  program3.command("status").description("\u67E5\u770B\u7D22\u5F15\u72B6\u6001").argument("[project]", "\u9879\u76EE\u540D\u79F0\uFF08\u53EF\u9009\uFF0C\u9ED8\u8BA4\u5F53\u524D\u9879\u76EE\uFF09").action(async (project) => {
    const { showStatus: showStatus2 } = await (init_config(), __toCommonJS(config_exports));
    await showStatus2(project);
  });
}

// scripts/uninstall.ts
function register8(program3) {
  program3.command("uninstall").description("\u5378\u8F7D\u9879\u76EE\u96C6\u6210").argument("[path]", "\u9879\u76EE\u76EE\u5F55", ".").action(async (projectDir) => {
    const { uninstall: uninstall2 } = await (init_uninstall(), __toCommonJS(uninstall_exports));
    const { notifyServer: notifyServer2 } = await (init_notify(), __toCommonJS(notify_exports));
    const { resolveProjectName: resolveProjectName2 } = await (init_global(), __toCommonJS(global_exports));
    const absDir = require("path").resolve(projectDir);
    await uninstall2(projectDir);
    const name = resolveProjectName2(absDir);
    await notifyServer2("project-unregistered", { name });
  });
}

// scripts/server.ts
function register9(program3) {
  program3.command("server").description("\u542F\u52A8\u540E\u53F0 HTTP \u670D\u52A1\uFF08Web \u72B6\u6001\u9875 + \u77E5\u8BC6\u56FE\u8C31\u53EF\u89C6\u5316\uFF09").option("-p, --port <number>", "\u7AEF\u53E3\u53F7", "54321").action(async (options) => {
    const { startServer: startServer2 } = await (init_server(), __toCommonJS(server_exports));
    await startServer2({ port: parseInt(options.port, 10) });
  });
}

// src/cli.ts
var VERSION = true ? "260429.164126" : "0.1.0-dev";
var program2 = new Command();
program2.name("codesense").description("\u672C\u5730\u8BED\u4E49\u4EE3\u7801\u641C\u7D22 - \u901A\u8FC7\u5411\u91CF\u7D22\u5F15\u5B9A\u4F4D\u4EE3\u7801\u7247\u6BB5\uFF0C\u652F\u6301 AST \u4F9D\u8D56\u8FFD\u8E2A").version(VERSION);
register(program2);
register2(program2);
register3(program2);
register4(program2);
register5(program2);
register6(program2);
register7(program2);
register8(program2);
register9(program2);
program2.command("embed-test").description("\u6D4B\u8BD5 embedding \u8FDE\u63A5").argument("<text>", "\u6D4B\u8BD5\u6587\u672C").action(async (text) => {
  const { OllamaEmbedder: OllamaEmbedder2 } = await (init_embedder(), __toCommonJS(embedder_exports));
  const embedder = new OllamaEmbedder2();
  const health = await embedder.checkHealth();
  if (!health.ok) {
    console.error("Ollama \u4E0D\u53EF\u7528:", health.error);
    process.exit(1);
  }
  console.log("Ollama \u72B6\u6001:", health);
  const vec = await embedder.embedQuery(text);
  console.log(`\u5411\u91CF\u7EF4\u5EA6: ${vec.length}`);
  console.log(`\u524D5\u4E2A\u503C: [${vec.slice(0, 5).map((v) => v.toFixed(6)).join(", ")}]`);
});
program2.command("chunk-test").description("\u6D4B\u8BD5 AST \u5206\u5757").argument("<path>", "\u6587\u4EF6\u6216\u76EE\u5F55\u8DEF\u5F84").action(async (filePath) => {
  const { chunkFile: chunkFile2 } = await (init_chunker(), __toCommonJS(chunker_exports));
  const { scanDirectory: scanDirectory2 } = await (init_file_scanner(), __toCommonJS(file_scanner_exports));
  const fs12 = await import("fs");
  const path13 = await import("path");
  const { EXT_TO_LANGUAGE: EXT_TO_LANGUAGE2 } = await (init_types(), __toCommonJS(types_exports));
  const stat = fs12.statSync(filePath);
  if (stat.isFile()) {
    const ext = path13.extname(filePath);
    const lang = EXT_TO_LANGUAGE2[ext] || "unknown";
    const content = fs12.readFileSync(filePath, "utf-8");
    const chunks = chunkFile2(filePath, content, lang);
    console.log(JSON.stringify(chunks, null, 2));
  } else {
    const files = scanDirectory2(filePath);
    let total = 0;
    for (const f of files) {
      const content = fs12.readFileSync(f.filePath, "utf-8");
      const chunks = chunkFile2(f.filePath, content, f.language);
      total += chunks.length;
      console.log(`${f.filePath} (${f.language}): ${chunks.length} chunks`);
    }
    console.log(`
\u603B\u8BA1: ${files.length} \u6587\u4EF6, ${total} chunks`);
  }
});
program2.parse();
