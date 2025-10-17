export const generateJWT = (jwt, payload) => {
    return jwt.sign(payload);
};
export const verifyJWT = (jwt, token) => {
    return jwt.verify(token);
};
//# sourceMappingURL=jwt.js.map