import type { HydratedDocument } from "mongoose";

import { connectToDatabase } from "@/lib/mongoose";
import { User, IUser } from "@/models/User";

type UserDocument = HydratedDocument<IUser>;

const toUser = (doc: UserDocument): IUser => doc.toObject<IUser>();

export async function getUsers(): Promise<IUser[]> {
    await connectToDatabase();
    const users = await User.find().exec();
    return users.map((user) => toUser(user));
}

export async function getUserById(id: string): Promise<IUser | null> {
    await connectToDatabase();
    const user = await User.findById(id).exec();
    return user ? toUser(user) : null;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    return user ? toUser(user) : null;
}

export async function createUser(newUser: Partial<IUser>): Promise<IUser> {
    await connectToDatabase();
    const createdUser = await User.create(newUser);
    return toUser(createdUser);
}

export async function updateUser(
    id: string,
    data: Partial<IUser>,
): Promise<IUser | null> {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).exec();
    return updatedUser ? toUser(updatedUser) : null;
}