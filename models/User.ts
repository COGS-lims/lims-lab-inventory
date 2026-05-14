import mongoose, { Schema, Document, Types } from "mongoose";

export type Role = "PI" | "LAB_MANAGER" | "RESEARCHER" | "VIEWER";
export type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// describes what one lab membership looks like
export interface ILabMembership {
    labId: Types.ObjectId;
    role: Role;
}

// shape of a user document in mongodb
export interface IUser extends Document {
    ucsdId: string; // ucsd pid
    email: string; // ucsd email
    name: {
        first: string;
        last: string;
    };
    role: Role;
    labs: ILabMembership[];
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        inApp: boolean;
    };
    safety: {
        trainingCompleted: string[];
        clearanceLevel: string;
        lastReviewedAt: Date;
    };
    profile: {
        title: string;
        department: string;
        phone: string;
    }
    status: Status;
    createdAt: Date;
    lastLoginAt: Date;
}

// mongoose schema to valid the data
const userSchema = new Schema<IUser>({

    ucsdId: { type: String, required: true, unique: true }, // ucsd pid
    email: { type: String, required: true, unique: true, trim: true, lowercase: true,
        match:[/^\S+@ucsd\.edu$/, "Must be a valid UCSD email (@ucsd.edu)"],
    }, // ucsd email

    name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
    },
    role: { // global role - enum restricts to only these 4 valid roles
        type: String,
        enum: ["PI", "LAB_MANAGER", "RESEARCHER", "VIEWER"],
        required: true,
    },
    
    // each entry represents membership in one lab

    labs: [
        {
            labId: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
            role: {
                type: String,
                enum: ["PI", "LAB_MANAGER", "RESEARCHER", "VIEWER"],
                required: true,
            },
        },
    ],
    notificationPreferences: { // default notification preferences
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
    },

    // checks for if you completed training and if you are cleared
    safety: {
        trainingCompleted: [{ type: String }],
        clearanceLevel: { type: String },
        lastReviewedAt: { type: Date },
    },

    profile: {
        title: { type: String },
        department: { type: String },
        phone: { type: String },
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        default: "ACTIVE",
    },
    lastLoginAt: { type: Date },

},
{
    timestamps: true,
});
userSchema.index({"labs.labId": 1});


//creates and exports the mongoose model
export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);