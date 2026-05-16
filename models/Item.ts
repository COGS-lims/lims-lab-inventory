import {
    HydratedDocument,
    InferSchemaType,
    Model,
    Schema,
    model,
    models,
    FlattenMaps,
    Types,
} from "mongoose";

// Fill enums with more items when more info is provided
export const categoryValues = ["consumable"] as const;
export const notificationEventValues = ["LOW_STOCK"] as const;
export const notificationAudienceValues = [
    "PI",
    "LAB_MANAGER",
    "RESEARCHER",
    "VIEWER",
] as const;

const transformDocument = (_: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
}; // Handling document to JSON / Object conversions

const thresholdSchema = new Schema({
    minQuantity: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, required: true, default: true },
    lastAlertSentAt: { type: Date, required: true },
});

const notificationSchema = new Schema({
    event: { type: String, enum: notificationEventValues, required: true },
    audience: {
        type: String,
        enum: notificationAudienceValues,
        required: true,
    },
});

// itemSchema holds information, previously defined schemas, and conversion information
const itemSchema = new Schema(
    {
        labId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, enum: categoryValues, required: true },
        quantity: { type: Number, required: true, min: 0 },

        threshold: { type: thresholdSchema, required: true },
        notificationPolicy: { type: notificationSchema, required: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: transformDocument,
        },
        toObject: {
            virtuals: true,
            versionKey: false,
            transform: transformDocument,
        },
    }
);

export type ItemInput = InferSchemaType<typeof itemSchema>;
export type Item = { id: string } & Omit<ItemInput, "_id">;

export type ItemCreateInput = Omit<ItemInput, "createdAt" | "updatedAt">;
export type ItemUpdateInput = Partial<ItemCreateInput>;

export type ItemDocument = HydratedDocument<ItemInput>;

export type ItemLean = FlattenMaps<ItemInput> & { _id: Types.ObjectId };

const ItemModel: Model<ItemInput> =
    (models.Item as Model<ItemInput>) || model<ItemInput>("Item", itemSchema);
export default ItemModel;

export const toItem = (doc: ItemDocument): Item => doc.toObject<Item>();

export const toItemFromLean = (obj: ItemLean): Item => {
    const { _id, ...rest } = obj as any;

    return {
        ...(rest as Omit<ItemInput, "_id">),
        id: String(_id),
    };
};
