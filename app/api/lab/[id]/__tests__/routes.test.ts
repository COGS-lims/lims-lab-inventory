import { GET, PUT, DELETE } from "@/app/api/lab/[id]/route";
import { 
    getLab, 
    updateLab, 
    deleteLab 
} from "@/services/labs/labs";

jest.mock("@/services/labs/labs", () => ({
    getLab: jest.fn(),
    updateLab: jest.fn(),
    deleteLab: jest.fn(),
}));

const mockGetLab = jest.mocked(getLab);
const mockUpdateLab = jest.mocked(updateLab);
const mockDeleteLab = jest.mocked(deleteLab);

describe( "Lab API by ID", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/lab/[id]", () => {
        it("should return a lab by ID", async () => {
            // Mock the getLab function to return a sample lab
            const mockLab = { id: "1", name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") };
            mockGetLab.mockResolvedValue(mockLab);
            // Create a mock request object
            const response = await GET(new Request("http://localhost/api/lab/1"), { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({ ...mockLab, createdAt: mockLab.createdAt.toISOString() });
        });
        it("should return 404 if lab is not found", async () => {
            // Mock the getLab function to return null
            mockGetLab.mockResolvedValue(null);
            // Create a mock request object
            const response = await GET(new Request("http://localhost/api/lab/999"), { params: { id: "999" } });
            // Assert that the response is correct
            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toEqual({ message: "Lab not found" });
        });
        it("should return 400 for invalid ID", async () => {
            // Create a mock request object with an invalid ID
            const response = await GET(new Request("http://localhost/api/lab/"), { params: { id: "" } });
            // Assert that the response is correct
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({ message: "Invalid ID" });
        });
        it("should return 500 on server error", async () => {
            // Mock the getLab function to throw an error
            mockGetLab.mockRejectedValue(new Error("Database error"));
            // Create a mock request object
            const response = await GET(new Request("http://localhost/api/lab/1"), { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({ message: "Internal server error" });
        });
    });
    describe ("PUT /api/lab/[id]", () => {
        it("should update a lab by ID", async () => {
            // Mock the updateLab function to return an updated lab
            const mockUpdatedLab = { id: "1", name: "Updated Lab", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") };
            mockUpdateLab.mockResolvedValue(mockUpdatedLab);
            // Create a mock request object with valid data
            const request = new Request("http://localhost/api/lab/1", {
                method: "PUT",
                body: JSON.stringify({ name: "Updated Lab", department: "Cognitive Science" }),
                headers: { "Content-Type": "application/json" },
            });
            const response = await PUT(request, { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({ ...mockUpdatedLab, createdAt: mockUpdatedLab.createdAt.toISOString() });
        });
        it("should return 404 if lab to update is not found", async () => {
            // Mock the updateLab function to return null
            mockUpdateLab.mockResolvedValue(null);
            // Create a mock request object with valid data
            const request = new Request("http://localhost/api/lab/999", {
                method: "PUT",
                body: JSON.stringify({ name: "Updated Lab", department: "Cognitive Science" }),
                headers: { "Content-Type": "application/json" },
            });
            const response = await PUT(request, { params: { id: "999" } });
            // Assert that the response is correct
            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toEqual({ message: "Lab not found" });
        });
        it("should return 400 for invalid ID", async () => {
            // Create a mock request object with an invalid ID
            const request = new Request("http://localhost/api/lab/", {
                method: "PUT",
                body: JSON.stringify({ name: "Updated Lab", department: "Cognitive Science" }),
                headers: { "Content-Type": "application/json" },
            });
            const response = await PUT(request, { params: { id: "" } });
            // Assert that the response is correct
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({ message: "Invalid ID" });
        });
        it("should return 400 for invalid data", async () => {
            // Create a mock request object with invalid data
            const request = new Request("http://localhost/api/lab/1", {
                method: "PUT",
                body: JSON.stringify({ name: "", department: "" }),
                headers: { "Content-Type": "application/json" },
            });
            const response = await PUT(request, { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({ message: "Invalid data" });
        });
        it("should return 500 on server error", async () => {
            // Mock the updateLab function to throw an error
            mockUpdateLab.mockRejectedValue(new Error("Database error"));
            // Create a mock request object with valid data
            const request = new Request("http://localhost/api/lab/1", {
                method: "PUT",
                body: JSON.stringify({ name: "Updated Lab", department: "Cognitive Science" }),
                headers: { "Content-Type": "application/json" },
            });
            const response = await PUT(request, { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({ message: "Internal server error" });
        });
    });
    describe("DELETE /api/lab/[id]", () => {
        it("should delete a lab by ID", async () => {
            // Mock the deleteLab function to return true
            mockDeleteLab.mockResolvedValue(true);
            // Create a mock request object
            const response = await DELETE(new Request("http://localhost/api/lab/1"), { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({ message: "Lab deleted successfully" });
        });
        it("should return 404 if lab to delete is not found", async () => {
            // Mock the deleteLab function to return false
            mockDeleteLab.mockResolvedValue(false);
            // Create a mock request object
            const response = await DELETE(new Request("http://localhost/api/lab/999"), { params: { id: "999" } });
            // Assert that the response is correct
            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toEqual({ message: "Lab not found" });
        });
        it("should return 400 for invalid ID", async () => {
            // Create a mock request object with an invalid ID
            const response = await DELETE(new Request("http://localhost/api/lab/"), { params: { id: "" } });
            // Assert that the response is correct
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toEqual({ message: "Invalid ID" });
        });
        it("should return 500 on server error", async () => {
            // Mock the deleteLab function to throw an error
            mockDeleteLab.mockRejectedValue(new Error("Database error"));
            // Create a mock request object
            const response = await DELETE(new Request("http://localhost/api/lab/1"), { params: { id: "1" } });
            // Assert that the response is correct
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toEqual({ message: "Internal server error" });
        });
    });

});