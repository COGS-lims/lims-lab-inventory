import mongoose from "mongoose";
import { startNotificationWatcher } from "../notifications/watchUpdates";
import Notification from "@/models/Notification";

jest.mock("mongoose", () => ({
  ...jest.requireActual("mongoose"),
  connection: {
    collection: jest.fn(),
  },
}));

jest.mock("@/models/Notification", () => ({
  __esModule: true, 
  default: {
    create: jest.fn(),
  },
}));

jest.mock("../../lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

const mockCollection = {
  watch: jest.fn(),
};

beforeEach(() => {
  (mongoose.connection.collection as jest.Mock).mockReturnValue(mockCollection);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("startNotificationWatcher", () => {
  test("creates notification on update event", async () => {
    const fakeStream = {
      async *[Symbol.asyncIterator]() {
        yield {
          operationType: "update",
          fullDocument: {
            _id: "item1",
            labId: "lab1",
          },
        };
      },
    };

    mockCollection.watch.mockReturnValue(fakeStream);

    await startNotificationWatcher();

    expect(Notification.create).toHaveBeenCalled();
  });
});