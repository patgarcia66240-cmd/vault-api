import { createServer } from './server';
const start = async () => {
    const port = parseInt(process.env.PORT || '8080');
    const host = process.env.HOST || '0.0.0.0';
    try {
        const server = await createServer();
        await server.listen({ port, host });
        console.log(`🚀 Server ready at http://${host}:${port}`);
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map