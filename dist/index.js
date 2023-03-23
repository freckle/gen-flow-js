"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const glob_1 = __importDefault(require("glob"));
const chunk_1 = __importDefault(require("lodash/chunk"));
const flatten_1 = __importDefault(require("lodash/flatten"));
const piscina_1 = __importDefault(require("piscina"));
const digest_cache_1 = require("./digest-cache");
const main = async () => {
    const [_nodeBin, _scriptPath, ...args] = process.argv;
    if (args.length !== 1) {
        console.log('Usage: gen-flow <path/to/interfaces>');
        return;
    }
    const [libPath] = args;
    const digestCache = await (0, digest_cache_1.readDigestCache)();
    // Create a new thread pool
    const pool = new piscina_1.default();
    const options = { filename: node_path_1.default.resolve(__dirname, 'worker-pool') };
    (0, glob_1.default)(`${libPath}/**/*.d.ts`, {}, async (err, files) => {
        if (err)
            console.error(err);
        const n = node_os_1.default.cpus().length;
        const fileChunks = (0, chunk_1.default)(files, Math.ceil(files.length / n));
        const promises = fileChunks.map(fileChunk => {
            const data = {
                paths: fileChunk,
                digests: digestCache
            };
            return pool.run(data, options);
        });
        const res = await Promise.all(promises);
        const digests = (0, flatten_1.default)(res);
        await (0, digest_cache_1.writeDigestCache)(digests);
    });
};
main();
