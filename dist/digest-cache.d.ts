import { Digest } from './digest';
export declare const readDigestCache: () => Promise<Digest[]>;
export declare const writeDigestCache: (digests: Digest[]) => Promise<void>;
