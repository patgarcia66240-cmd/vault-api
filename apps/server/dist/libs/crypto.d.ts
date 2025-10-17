export interface EncryptedData {
    ciphertext: Buffer;
    nonce: Buffer;
}
export declare const generateAPIKey: () => string;
export declare const hashAPIKey: (apiKey: string) => string;
export declare const extractAPIKeyInfo: (apiKey: string) => {
    prefix: string;
    last4: string;
};
export declare const encryptAPIKey: (apiKey: string, masterKey: Buffer) => EncryptedData;
export declare const decryptAPIKey: (encrypted: EncryptedData, masterKey: Buffer) => string;
export declare const getMasterKey: () => Buffer;
//# sourceMappingURL=crypto.d.ts.map