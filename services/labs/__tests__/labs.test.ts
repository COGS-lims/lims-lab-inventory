import { connectToDatabase } from "@/lib/mongoose";
import { getSession } from "@/lib/rbac";
import Lab from "@/models/Lab";
import { getLab, getLabs, addLab, updateLab, deleteLab } from "../labs";

jest.mock("@/lib/mongoose", () => ({
    connectToDatabase: jest.fn(),
}));

jest.mock("@/lib/rbac", () => ({
    getSession: jest.fn(),
}));

jest.mock("@/models/Lab", () => ({
    __esModule: true,
    default: {
        find: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn(),
    },
    toLab: (doc: any) => ({ id: doc._id?.toString() ?? doc.id, name: doc.name, department: doc.department, createdAt: doc.createdAt }),
    toLabFromLean: (obj: any) => ({ id: String(obj._id), name: obj.name, department: obj.department, createdAt: obj.createdAt }),
}));

const mockedConnectToDatabase = jest.mocked(connectToDatabase);
const mockedGetSession = jest.mocked(getSession);
const mockedLabModel = jest.mocked(Lab);

describe("Lab Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetSession.mockResolvedValue({
            allowed: true,
            user: null,
            reason: "",
        });
    });
    describe("getLabs", () => {
        it("should return a paginated list of labs", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            const mockLabs = [
                { _id: "1", name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") },
                { _id: "2", name: "Lab 2", department: "Biology", createdAt: new Date("2025-12-25T03:24:00Z") },
            ];
            mockedLabModel.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLabs),
            } as any);
            mockedLabModel.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(2),
            } as any);
            // Call the getLabs function
            const result = await getLabs({ page: 1, limit: 10 });
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.find).toHaveBeenCalled();
            expect(mockedLabModel.countDocuments).toHaveBeenCalled();
            // Assert that the result is correct
            expect(result).toEqual({
                data: mockLabs.map(lab => ({ id: lab._id, name: lab.name, department: lab.department, createdAt: lab.createdAt })),
                pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
            });
        });
        it("should return an empty array if no labs are found", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            mockedLabModel.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            } as any);
            mockedLabModel.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(0),
            } as any);
            // Call the getLabs function
            const result = await getLabs({ page: 1, limit: 10 });
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.find).toHaveBeenCalled();
            expect(mockedLabModel.countDocuments).toHaveBeenCalled();
            // Assert that the result is correct
            expect(result).toEqual({
                data: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            });
        });
        it("should throw an error if database connection fails", async () => {
            // Mock the database connection to throw an error
            mockedConnectToDatabase.mockRejectedValue(new Error("Database connection failed"));
            // Call the getLabs function and assert that it throws an error
            await expect(getLabs({ page: 1, limit: 10 })).rejects.toThrow("Database connection failed");
            // Assert that the database connection was attempted
            expect(mockedConnectToDatabase).toHaveBeenCalled();
        });
    });
    describe("getLab", () => {
        it("should return a lab by ID", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            const mockLab = { _id: "1", name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") };
            mockedLabModel.findById.mockReturnValue({
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockLab),
            } as any);
            // Call the getLab function            
            const result = await getLab("1");
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.findById).toHaveBeenCalledWith("1");
            // Assert that the result is correct
            expect(result).toEqual({ id: mockLab._id, name: mockLab.name, department: mockLab.department, createdAt: mockLab.createdAt });
        });
        it("should return null if lab is not found", async () => {
        });
    });
    describe("addLab", () => {
        it("should add a new lab", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            const mockLab = { name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") };
            mockedLabModel.create.mockResolvedValue(mockLab);
            // Call the addLab function
            const result = await addLab({ name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") });
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.create).toHaveBeenCalledWith({ name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") });
            // Assert that the result is correct
            expect(result).toEqual({ name: mockLab.name, department: mockLab.department, createdAt: mockLab.createdAt });
        });
        it("should throw an error if database connection fails", async () => {
            // Mock the database connection to throw an error
            mockedConnectToDatabase.mockRejectedValue(new Error("Database connection failed"));
            // Call the addLab function and assert that it throws an error
            await expect(addLab({ name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") })).rejects.toThrow("Database connection failed");
            // Assert that the database connection was attempted
            expect(mockedConnectToDatabase).toHaveBeenCalled();
        });
    });
    describe("updateLab", () => {
        it("should update a lab by ID", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            const mockLab = { _id: "1", name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") };
            mockedLabModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLab),
            } as any);
            // Call the updateLab function
            const result = await updateLab("1", { name: "Updated Lab 1" });
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.findByIdAndUpdate).toHaveBeenCalledWith("1", { name: "Updated Lab 1" }, { new: true, runValidators: true });
            // Assert that the result is correct
            expect(result).toEqual({ id: mockLab._id, name: mockLab.name, department: mockLab.department, createdAt: mockLab.createdAt });
        });
        it("should return null if lab is not found", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            mockedLabModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);
            // Call the updateLab function
            const result = await updateLab("999", { name: "Updated Lab 1" });
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.findByIdAndUpdate).toHaveBeenCalledWith("999", { name: "Updated Lab 1" }, { new: true, runValidators: true });
            // Assert that the result is correct
            expect(result).toBeNull();
        });
        it("should throw an error if database connection fails", async () => {
            // Mock the database connection to throw an error
            mockedConnectToDatabase.mockRejectedValue(new Error("Database connection failed"));
            // Call the updateLab function and assert that it throws an error
            await expect(updateLab("1", { name: "Updated Lab 1" })).rejects.toThrow("Database connection failed");
            // Assert that the database connection was attempted
            expect(mockedConnectToDatabase).toHaveBeenCalled();
        });
    });
    describe("deleteLab", () => {
        it("should delete a lab by ID", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            const mockLab = { _id: "1", name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z"), deleteOne: jest.fn().mockResolvedValue({}) };
            mockedLabModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLab),
            } as any);
            // Call the deleteLab function
            const result = await deleteLab("1");
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.findById).toHaveBeenCalledWith("1");
            expect(mockLab.deleteOne).toHaveBeenCalled();
            // Assert that the result is correct
            expect(result).toBe(true);
        });
        it("should return false if lab is not found", async () => {
            // Mock the database connection and LabModel methods
            mockedConnectToDatabase.mockResolvedValue(undefined);
            mockedLabModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);
            // Call the deleteLab function
            const result = await deleteLab("999");
            // Assert that the database connection and LabModel methods were called correctly
            expect(mockedConnectToDatabase).toHaveBeenCalled();
            expect(mockedLabModel.findById).toHaveBeenCalledWith("999");
            // Assert that the result is correct
            expect(result).toBe(false);
        });
        it("should throw an error if database connection fails", async () => {
            // Mock the database connection to throw an error
            mockedConnectToDatabase.mockRejectedValue(new Error("Database connection failed"));
            // Call the deleteLab function and assert that it throws an error
            await expect(deleteLab("1")).rejects.toThrow("Database connection failed");
            // Assert that the database connection was attempted
            expect(mockedConnectToDatabase).toHaveBeenCalled();
        });
     });
});
