import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
const ALGORITHM = 'aes-256-gcm';
export const generateAPIKey = () => {
    const prefix = 'base44_';
    const randomPart = randomBytes(24).toString('base64url');
    return `${prefix}${randomPart}`;
};
export const hashAPIKey = (apiKey) => {
    return createHash('sha256').update(apiKey).digest('hex');
};
export const extractAPIKeyInfo = (apiKey) => {
    const prefix = apiKey.split('_')[0] + '_';
    const last4 = apiKey.slice(-4);
    return { prefix, last4 };
};
export const encryptAPIKey = (apiKey, masterKey) => {
    const nonce = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, masterKey, nonce);
    const ciphertext = Buffer.concat([
        cipher.update(apiKey, 'utf8'),
        cipher.final()
    ]);
    return { ciphertext, nonce };
};
export const decryptAPIKey = (encrypted, masterKey) => {
    const decipher = createDecipheriv(ALGORITHM, masterKey, encrypted.nonce);
    const plaintext = Buffer.concat([
        decipher.update(encrypted.ciphertext),
        decipher.final()
    ]);
    return plaintext.toString('utf8');
};
export const getMasterKey = () => {
    const key = process.env.CRYPTO_MASTER_KEY;
    if (!key) {
        throw new Error('CRYPTO_MASTER_KEY environment variable is required');
    }
    return Buffer.from(key, 'base64');
};
//# sourceMappingURL=crypto.js.map