"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.computeDigest = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_fs_1 = __importDefault(require("node:fs"));
const computeDigest = (filePath) => {
    const buffer = node_fs_1.default.readFileSync(filePath);
    const hashSum = node_crypto_1.default.createHash('sha256');
    hashSum.update(buffer);
    return {
        filePath,
        digest: hashSum.digest('hex')
    };
};
exports.computeDigest = computeDigest;
const compare = (a, b) => {
    return (a.filePath === b.filePath) && (a.digest === b.digest);
};
exports.compare = compare;
