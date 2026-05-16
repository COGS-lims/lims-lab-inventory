import {
    HydratedDocument,
    InferSchemaType,
    Model,
    Schema,
    model,
    models,
} from "mongoose";

const transformDocument = (_: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
}; // for properly handling toObject() or toJSON() and stringifying id

const listingSchema = new Schema(
    {
        itemName: { type: String, required: true },
        itemId: { type: String, required: true },
        labName: { type: String },
        labLocation: { type: String },
        labId: { type: String, required: true },
        imageUrls: [{ type: String }],
        quantityAvailable: { type: Number, required: true },
        createdAt: { type: Date, required: true },
        expiryDate: { type: Date },
        description: { type: String, default: "" },
        price: { type: Number, default: 0 },
        status: { type: String, enum: ["ACTIVE", "INACTIVE"], required: true },
        condition: {
            type: String,
            enum: ["New", "Good", "Fair", "Poor"],
            required: true,
        },
        hazardTags: [
            {
                type: String,
                enum: ["Physical", "Chemical", "Biological", "Other"],
            },
        ],
    },
    {
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

// for filtering
listingSchema.index({ labId: 1, createdAt: -1 });
listingSchema.index({ itemId: 1, createdAt: -1 });
listingSchema.index({ expiryDate: 1 });
listingSchema.index({ hazardTags: 1 });

export type ListingInput = InferSchemaType<typeof listingSchema>;
export type Listing = ListingInput & { id: string };
export type ListingDocument = HydratedDocument<ListingInput>;

const ListingModel: Model<ListingInput> =
    (models.Listing as Model<ListingInput>) ||
    model<ListingInput>("Listing", listingSchema);
export default ListingModel;
