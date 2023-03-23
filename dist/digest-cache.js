"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDigestCache = exports.readDigestCache = void 0;
const node_fs_1 = __importStar(require("node:fs"));
const jtd_1 = __importDefault(require("ajv/dist/jtd"));
const CACHE_FILENAME = '.genflowcache';
const ajv = new jtd_1.default();
const schema = {
    elements: {
        properties: {
            filePath: { type: 'string' },
            digest: { type: 'string' }
        }
    }
};
const serialize = ajv.compileSerializer(schema);
const parse = ajv.compileParser(schema);
const readDigestCacheFile = async (filePath) => {
    const hasFile = node_fs_1.default.existsSync(filePath);
    if (!hasFile) {
        return [];
    }
    const data = await node_fs_1.promises.readFile(filePath, { encoding: 'utf8' });
    const digests = parse(data);
    if (digests === undefined) {
        throw new Error(`${parse.position}: ${parse.message}`);
    }
    else {
        return digests;
    }
};
const writeDigestCacheFile = async (filePath, digests) => {
    const data = serialize(digests);
    return await node_fs_1.promises.writeFile(filePath, data);
};
const readDigestCache = () => readDigestCacheFile(CACHE_FILENAME);
exports.readDigestCache = readDigestCache;
const writeDigestCache = (digests) => writeDigestCacheFile(CACHE_FILENAME, digests);
exports.writeDigestCache = writeDigestCache;
