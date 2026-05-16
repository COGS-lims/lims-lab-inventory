import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import Notification from "@/models/Notification";

/**
 * Starts a Change Stream watcher on the "products" collection.
 * Inserts a DB_UPDATE notification whenever a product is updated.
 */
export async function startNotificationWatcher() {
  await connectToDatabase();

  const collection = mongoose.connection.collection("items");

  const changeStream = collection.watch([], {
    fullDocument: "updateLookup",
  });

  for await (const change of changeStream) {
    if (change.operationType !== "update") continue;

    // Get the updated document from the change stream
    const updatedDoc = change.fullDocument;

    // If there’s no document, skip this iteration
    if (!updatedDoc) continue;

    // TODO: Check the quantity in updatedDoc
    // If quantity is below the threshold, continue
    // Otherwise, send a notification
    await Notification.create({
      type: "DB_UPDATE",
      labId: updatedDoc.labId ?? "unknown",
      resourceId: String(updatedDoc._id),
      recipients: [],
    });
  }
}
