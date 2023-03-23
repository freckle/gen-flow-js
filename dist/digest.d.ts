export interface Digest {
    filePath: string;
    digest: string;
}
export declare const computeDigest: (filePath: string) => Digest;
export declare const compare: (a: Digest, b: Digest) => boolean;
