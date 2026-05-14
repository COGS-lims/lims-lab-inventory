import { connectToDatabase } from "@/lib/mongoose";
import { getSession } from "@/lib/rbac";
import { IUserLab } from "@/models/UserLab";
import UserLab from "@/models/UserLab";

export type GetUserLabsOptions = {
  page: number;
  limit: number;
  labId: string;
};

export type UserLabPayload = Pick<IUserLab, "user" | "lab" | "role">;

async function requireUserLabPermission() {
  const { allowed, reason } = await getSession("lab:manage_users");

  if (!allowed) {
    throw new Error(`Unauthorized: ${reason}`);
  }
}

export async function getUserLabs({ page, limit, labId }: GetUserLabsOptions) {
  const { allowed, user, reason } = await getSession("lab:manage_users");

  if (!allowed) {
    throw new Error(`Unauthorized: ${reason}`);
  }

  const belongsToLab = user?.labs?.some(
    (membership) => String(membership.labId) === labId
  );

  if (!belongsToLab) {
    throw new Error("Unauthorized: Not a member of this lab");
  }

  await connectToDatabase();
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    UserLab.find({ lab: labId }).skip(skip).limit(limit).populate("user").populate("lab"),
    UserLab.countDocuments({ lab: labId }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getUserLab(id: string) {
  await requireUserLabPermission();
  await connectToDatabase();
  return UserLab.findById(id).populate("user").populate("lab");
}

export async function addUserLab(data: UserLabPayload) {
  await requireUserLabPermission();
  await connectToDatabase();
  return UserLab.create(data);
}

export async function updateUserLab(id: string, update: Partial<UserLabPayload>) {
  await requireUserLabPermission();
  await connectToDatabase();
  return UserLab.findByIdAndUpdate(id, update, { new: true });
}

export async function deleteUserLab(id: string) {
  await requireUserLabPermission();
  await connectToDatabase();
  return UserLab.findByIdAndDelete(id);
}
