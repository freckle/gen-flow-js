"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const flowgen_1 = require("flowgen");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const find_1 = __importDefault(require("lodash/find"));
const digest_1 = require("./digest");
module.exports = async ({ paths, digests }) => {
    const digestPromises = paths.map(p => processFile(p, digests));
    return await Promise.all(digestPromises);
};
const flowDefFilePath = (filePath) => {
    const parsedPath = node_path_1.default.parse(filePath);
    const regexExec = /(.*).d/.exec(parsedPath.name);
    if (regexExec === null) {
        throw new Error('Unexpected RegExp failure');
    }
    const name = regexExec[1];
    return `${parsedPath.dir}/${name}.js.flow`;
};
const processFile = async (filePath, digests) => {
    const outputFilePath = flowDefFilePath(filePath);
    const hasGeneratedInterface = node_fs_1.default.existsSync(outputFilePath);
    const incomingDigest = (0, digest_1.computeDigest)(filePath);
    if (!hasGeneratedInterface) {
        await genFlowDef(filePath);
        return incomingDigest;
    }
    else {
        const matchingDigest = (0, find_1.default)(digests, cachedDigest => (0, digest_1.compare)(incomingDigest, cachedDigest));
        if (matchingDigest !== undefined) {
            return matchingDigest;
        }
        else {
            await genFlowDef(filePath);
            return incomingDigest;
        }
    }
};
const genFlowDef = (filePath) => new Promise((resolve, reject) => {
    const outputFilePath = flowDefFilePath(filePath);
    const flowdef = (0, flowgen_1.beautify)(flowgen_1.compiler.compileDefinitionFile(filePath, { inexact: false }));
    const fixedFlowdef = fixFlowdef(flowdef);
    node_fs_1.default.writeFile(outputFilePath, `// @flow
${fixedFlowdef}`, e => {
        if (e)
            reject(e);
        else
            resolve();
    });
});
const fixFlowdef = (module) => {
    return (module
        // account for special cases
        .replace(/React.Element<ElementType, string \| React.JSXElementConstructor<any>>/g, 'React.Node')
        // https://github.com/joarwilk/flowgen/issues/185
        .replace(/\btype,\s+/g, 'type ')
        // Imports for TS types that are global in Flow need to be removed
        .replaceAll(`import { type SyntheticEvent } from "react";`, '')
        .replaceAll(`import type { SyntheticEvent } from "react";`, '')
        .replaceAll(`import type { ChangeEvent, KeyboardEvent } from "react";`, '')
        .replaceAll(`import { ChangeEvent } from "react";`, '')
        // Convert React TS types to Flow equivalents
        .replaceAll('React.AriaRole', '?string') // Flow does not have an AriaRole
        .replaceAll('ChangeEvent', 'SyntheticInputEvent')
        .replaceAll(`import type { SyntheticInputEvent } from "react";`, '')
        .replaceAll('React.KeyboardEvent', 'SyntheticKeyboardEvent')
        .replaceAll('React.ElementType<any>', 'React.ElementType')
        // Convert missing types to ones that can be shimmed globally
        .replaceAll('React.ForwardRefExoticComponent', 'GlobalForwardRefExoticComponent')
        .replaceAll('React.RefAttributes', 'GlobalRefAttributes')
        .replaceAll('React.LegacyRef', 'GlobalLegacyRef')
        // Third party libraries may also have different interfaces in TS/Flow
        .replaceAll('RouteComponentProps', 'ContextRouter')
        .replaceAll('import { type Location } from "history";', '')
        .replaceAll('import type { History } from "history";', '')
        .replaceAll('import { type History } from "history";', '')
        // Flow's React.Element is different than in TypeScript, so convert to React.Node
        .replace(/\sReact\.Element<+([a-z- A-Z<>>]+)>+/g, ' React.Node') // Account for React.Element<Type<...>>
        .replace(/React\.Element<(.*?)>/g, 'React.Node') // Handle simpler case
        // Flow refuses to render a PureComponent; prefer rewriting the interface
        // to changing the component implementation
        .replaceAll('React.PureComponent', 'React.Component')
        .replaceAll('React.NamedExoticComponent', 'React.ComponentType')
        .replaceAll('React.ComponentClass', 'React.ComponentType')
        // Collapse React.Node union as last step since other rules may create a React.Node
        .replaceAll('React.Node | React.Node[]', 'React.Node')
        // flowts converts ?a into a | undefined | null
        // flowgen converts a | undefined | null into a | void | null
        // a | void | null is not treated the same as ?a in flow
        .replaceAll(/([a-zA-Z_$][0-9a-zA-Z_$]*) \| void \| null/g, (_match, name) => `?${name}`)
        // flowgen uses mixins instead of extends?
        .replaceAll(/(class\s+\S+\s+)mixins/g, (_match, c) => `${c}extends`)
        // fetch uses RequestOptions in flow
        .replaceAll('RequestInit', 'RequestOptions')
        .replaceAll('Record<string, empty>', '{}'));
};
