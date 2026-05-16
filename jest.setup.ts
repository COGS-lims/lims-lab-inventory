import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

/**
 * Start in-memory MongoDB before all tests
 */
beforeAll(async () => {
    // Download MongoDB binary if needed
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Set environment variable for tests
    process.env.DATABASE_URL = mongoUri;
    process.env.NEXTAUTH_SECRET = "test-secret-key-for-testing-only";
    process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";

    console.log(":white_check_mark: In-memory MongoDB started");
});

/**
 * Clean up after all tests
 */
afterAll(async () => {
    if (mongoServer) {
        await mongoServer.stop();
    }

    // Close mongoose connection
    await mongoose.disconnect();
    console.log(":white_check_mark: MongoDB stopped and disconnected");
});

/**
 * Clear all collections after each test
 */
afterEach(async () => {
    if (mongoose.connection.readyState !== 1) return;

    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

// Extend test timeout for slow operations
jest.setTimeout(10000);

// Suppress console output during tests (optional)
global.console = {
    ...console,
    // Uncomment to suppress logs
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
};
