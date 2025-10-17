// Mock data storage
let users = [];
let apiKeys = [];
// Sample user for testing
const sampleUser = {
    id: '1',
    email: 'test@example.com',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // 'password123'
    plan: 'FREE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};
users.push(sampleUser);
export const mockDb = {
    users,
    apiKeys
};
//# sourceMappingURL=mockData.js.map