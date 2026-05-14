import { getSession } from "@/lib/rbac";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

jest.mock("@/auth", () => ({
    auth: jest.fn(),
}));
jest.mock("@/lib/mongoose", () => ({
    connectToDatabase: jest.fn(),
}));
jest.mock("@/models/User", () => ({
    User: { findOne: jest.fn() },
}));

const mockAuth = auth as jest.Mock;
const mockConnectToDatabase = connectToDatabase as jest.Mock;
const mockUserFindOne = User.findOne as jest.Mock;

describe("RBAC System - getSession", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Unauthenticated Users", () => {
        it("should deny access when no session exists", async () => {
            mockAuth.mockResolvedValue(null);

            const result = await getSession("inventory:view");

            expect(result.allowed).toBe(false);
            expect(result.user).toBeNull();
            expect(result.reason).toBe("Unauthenticated");
        });

        it("should deny access when session has no email", async () => {
            mockAuth.mockResolvedValue({ user: { name: "John" } } as any);

            const result = await getSession("inventory:view");

            expect(result.allowed).toBe(false);
            expect(result.user).toBeNull();
            expect(result.reason).toBe("Unauthenticated");
        });
    });

    describe("User Lookup", () => {
        it("should deny access when user is not found in database", async () => {
            mockAuth.mockResolvedValue({
                user: { email: "notfound@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            });

            const result = await getSession("inventory:view");

            expect(result.allowed).toBe(false);
            expect(result.user).toBeNull();
            expect(result.reason).toBe("User not found");
        });
    });

    describe("Account Status", () => {
        it("should deny access when user account is inactive", async () => {
            const inactiveUser = {
                email: "user@ucsd.edu",
                role: "RESEARCHER",
                status: "INACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "user@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(inactiveUser),
            });

            const result = await getSession("inventory:view");

            expect(result.allowed).toBe(false);
            expect(result.user).toEqual(inactiveUser);
            expect(result.reason).toBe("Account inactive");
        });

        it("should deny access when user account is suspended", async () => {
            const suspendedUser = {
                email: "user@ucsd.edu",
                role: "RESEARCHER",
                status: "SUSPENDED",
            };

            mockAuth.mockResolvedValue({
                user: { email: "user@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(suspendedUser),
            });

            const result = await getSession("inventory:view");

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("Account inactive");
        });
    });

    describe("Permission Checks - VIEWER Role", () => {
        it("should allow VIEWER to view inventory", async () => {
            const viewerUser = {
                email: "viewer@ucsd.edu",
                role: "VIEWER",
                status: "ACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "viewer@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(viewerUser),
            });

            const result = await getSession("inventory:view");

            expect(result.allowed).toBe(true);
            expect(result.reason).toBeUndefined();
            expect(result.user).toEqual(viewerUser);
        });

        it("should deny VIEWER from creating inventory", async () => {
            const viewerUser = {
                email: "viewer@ucsd.edu",
                role: "VIEWER",
                status: "ACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "viewer@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(viewerUser),
            });

            const result = await getSession("inventory:create");

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("Insufficient permissions");
        });
    });

    describe("Permission Checks - RESEARCHER Role", () => {
        it("should allow RESEARCHER to view inventory and request transfers", async () => {
            const researcherUser = {
                email: "researcher@ucsd.edu",
                role: "RESEARCHER",
                status: "ACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "researcher@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(researcherUser),
            });

            const viewResult = await getSession("inventory:view");
            const transferResult = await getSession("transfer:request");

            expect(viewResult.allowed).toBe(true);
            expect(transferResult.allowed).toBe(true);
        });

        it("should deny RESEARCHER from deleting inventory", async () => {
            const researcherUser = {
                email: "researcher@ucsd.edu",
                role: "RESEARCHER",
                status: "ACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "researcher@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(researcherUser),
            });

            const result = await getSession("inventory:delete");

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("Insufficient permissions");
        });
    });

    describe("Permission Checks - PI Role", () => {
        it("should allow PI to perform all inventory operations", async () => {
            const piUser = {
                email: "pi@ucsd.edu",
                role: "PI",
                status: "ACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "pi@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(piUser),
            });

            const createResult = await getSession("inventory:create");
            const updateResult = await getSession("inventory:update");
            const deleteResult = await getSession("inventory:delete");
            const approveResult = await getSession("transfer:approve");

            expect(createResult.allowed).toBe(true);
            expect(updateResult.allowed).toBe(true);
            expect(deleteResult.allowed).toBe(true);
            expect(approveResult.allowed).toBe(true);
        });
    });

    describe("Permission Checks - LAB_MANAGER Role", () => {
        it("should allow LAB_MANAGER to manage inventory but not approve transfers", async () => {
            const labManagerUser = {
                email: "manager@ucsd.edu",
                role: "LAB_MANAGER",
                status: "ACTIVE",
            };

            mockAuth.mockResolvedValue({
                user: { email: "manager@ucsd.edu" },
            } as any);
            mockConnectToDatabase.mockResolvedValue(undefined);
            mockUserFindOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(labManagerUser),
            });

            const createResult = await getSession("inventory:create");
            const approveResult = await getSession("transfer:approve");

            expect(createResult.allowed).toBe(true);
            expect(approveResult.allowed).toBe(false);
        });
    });
});
