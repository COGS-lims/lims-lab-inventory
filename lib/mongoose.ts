import mongoose from "mongoose";

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const globalForMongoose = globalThis as typeof globalThis & {
    mongoose?: MongooseCache;
};
const cached: MongooseCache = globalForMongoose.mongoose ?? {
    conn: null,
    promise: null,
};
globalForMongoose.mongoose = cached;

export async function connectToDatabase() {
    // Remove this check for testing
    const mongoDbUri = process.env.DATABASE_URL;

    if (!mongoDbUri) {
        throw new Error(
            "Please define the DATABASE_URL environment variable inside .env"
        );
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoDbUri, {
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

/**
 * Disconnect from MongoDB for testing
 */
export async function disconnectDatabase() {
    if (cached.conn) {
        try {
            await cached.conn.disconnect();
            cached.conn = null;
            cached.promise = null;
            console.log("DB disconnected");
        } catch (error) {
            console.error("Error disconnecting from database", error);
            throw error;
        }
    }
}

function test() {
    console.log("not tested"); // making sure coverage can see which aren't tested
    // coverage also can't test things that don't occur like errors
}
