import { GET, POST } from "../inventory/route";
import { filteredGet, addItem } from "@/services/items";

// GET 200 success
// GET 500 failure
// POST 201 success
// POST 400 invalid input
// POST 500 server error

jest.mock("@/services/items", () => ({
    filteredGet: jest.fn(),
    addItem: jest.fn(),
}));

// Helper function to make post tests cleaner
function makePostRequest(body: unknown) {
    return new Request("http://localhost:3000/api/inventory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
}

describe("/api/inventory/", () => {
    describe("GET /api/inventory/", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("GET returns items successfully with status 200", async () => {
            const mockItems = {
                data: [
                    { id: "1", name: "Gloves", quantity: 10 },
                    { id: "2", name: "Goggles", quantity: 5 },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                },
            };

            (filteredGet as jest.Mock).mockResolvedValue(mockItems);

            const response = await GET();
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual(mockItems);

            expect(filteredGet).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
            });
        });

        it("GET returns with status 500 on failure", async () => {
            (filteredGet as jest.Mock).mockRejectedValue(
                new Error("DB failure")
            );

            const response = await GET();
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ message: "Failed to fetch items" });
        });
    });

    describe("POST /api/inventory/", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("POST returns 201 when item successfully created", async () => {
            const validBody = {
                labId: "test-lab",
                name: "Tubes",
                category: "consumable",
                quantity: 5,
                threshold: {
                    minQuantity: 2,
                    enabled: true,
                    lastAlertSentAt: "2026-03-09",
                },
                notificationPolicy: {
                    event: "LOW_STOCK",
                    audience: "LAB_MANAGER",
                },
            };

            const createdItem = {
                id: "1",
                ...validBody,
            };

            (addItem as jest.Mock).mockResolvedValue(createdItem);

            const request = makePostRequest(validBody);
            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body).toEqual(createdItem);

            expect(addItem).toHaveBeenCalledTimes(1);
        });

        it("POST returns 400 when item input is invalid", async () => {
            const invalidBody = {
                labId: "",
            };

            const request = makePostRequest(invalidBody);
            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toEqual({
                success: false,
                message: "Invalid request body.",
            });

            expect(addItem).not.toHaveBeenCalled();
        });

        it("POST returns 500 when service throws error", async () => {
            const validBody = {
                labId: "test-lab",
                name: "Tubes",
                category: "consumable",
                quantity: 5,
                threshold: {
                    minQuantity: 2,
                    enabled: true,
                    lastAlertSentAt: "2026-03-09",
                },
                notificationPolicy: {
                    event: "LOW_STOCK",
                    audience: "LAB_MANAGER",
                },
            };

            (addItem as jest.Mock).mockRejectedValue(new Error("DB failed"));

            const request = makePostRequest(validBody);
            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({
                message: "Error occured while creating item",
            });

            expect(addItem).toHaveBeenCalledTimes(1);
        });
    });
});
