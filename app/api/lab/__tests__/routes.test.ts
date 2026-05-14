import { GET, POST } from "@/app/api/lab/route";
import { 
    getLabs, 
    addLab
} from "@/services/labs/labs";


jest.mock("@/services/labs/labs", () => ({
    getLabs: jest.fn(),
    addLab: jest.fn(),
}));

const mockGetLab = jest.mocked(getLabs);
const mockAddLab = jest.mocked(addLab);

describe( "Lab API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/lab", () => {
        it("should return a list of labs", async () => {
          // Mock the getLabs function to return a paginated result
          const mockLabs = [
            { id: "1", name: "Lab 1", department: "Cognitive Science", createdAt: new Date("2024-08-01T00:00:00Z") },
            { id: "2", name: "Lab 2", department: "Biology", createdAt: new Date("2025-12-25T03:24:00Z") },
          ];
          const mockPayload = { data: mockLabs, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } };
          mockGetLab.mockResolvedValue(mockPayload);
          // Create a mock request object
          const response = await GET(new Request("http://localhost/api/lab"));
          // Assert that the response is correct
          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toEqual({
            data: mockLabs.map(lab => ({ ...lab, createdAt: lab.createdAt.toISOString() })),
            pagination: mockPayload.pagination,
          });
        });
        it("should return an empty array if no labs are found", async () => {
          // Mock the getLabs function to return an empty paginated result
          const mockPayload = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
          mockGetLab.mockResolvedValue(mockPayload);
          // Create a mock request object
          const response = await GET(new Request("http://localhost/api/lab"));
          // Assert that the response is correct
          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toEqual(mockPayload);
        });
        it("should return 500 on server error", async () => {
          // Mock the getLabs function to throw an error
          mockGetLab.mockRejectedValue(new Error("Database error"));
          // Create a mock request object
          const response = await GET(new Request("http://localhost/api/lab"));
          // Assert that the response is correct
          expect(response.status).toBe(500);
          const data = await response.json();
          expect(data).toEqual({ message: "Internal server error" });
        });
    });
    describe("POST /api/lab", () => {
        it("should create a new lab with valid data", async () => {
         // Mock the addLab function to return a sample lab
         const newLab = { id: "1", name: "New Lab", department: "Chemistry", createdAt: new Date() };
         mockAddLab.mockResolvedValue(newLab);
         // Create a mock request object with valid data
         const request = new Request("http://localhost/api/lab", {
           method: "POST",
           body: JSON.stringify({ name: "New Lab", department: "Chemistry", createdAt: new Date() }),
           headers: { "Content-Type": "application/json" },
         });
         const response = await POST(request);
         // Assert that the response is correct
         expect(response.status).toBe(201);
         const data = await response.json();
         expect(data).toEqual({ ...newLab, createdAt: newLab.createdAt.toISOString() });
        });
        it("should return 400 for invalid data", async () => {
         // Create a mock request object with invalid data
         const request = new Request("http://localhost/api/lab", {
           method: "POST",
           body: JSON.stringify({ name: "", department: "" }),
           headers: { "Content-Type": "application/json" },
         });
         const response = await POST(request);
         // Assert that the response is correct
         expect(response.status).toBe(400);
         const data = await response.json();
         expect(data).toEqual({ message: "Invalid data" });
        });
    });
});
