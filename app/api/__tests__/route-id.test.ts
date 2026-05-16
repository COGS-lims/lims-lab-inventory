import { GET, PUT, DELETE } from "../inventory/[id]/route";
import { getItem, updateItem, deleteItem } from "@/services/items";

// GET by id 200 success
// GET id 404 not found
// PUT 200 by id success
// PUT 400 invalid input
// DELETE 200 success
// DELETE 404 not found failure

jest.mock("@/services/items", () => ({
    getItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
}));

describe("api/inventory/[id]/", () => {
    const mockItem = {
        id: "1234abcd1234abcd1234abcd",
        labId: "lab1",
        name: "Gloves",
        category: "consumable",
        quantity: 10,
        threshold: {
            minQuantity: 2,
            enabled: true,
            lastAlertSentAt: "2026-03-09",
        },
        notificationPolicy: {
            event: "LOW_STOCK",
            audience: "LAB_ADMINS",
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/inventory/[id]/", () => {
        it("GET by id returns with item and status 200", async () => {
            (getItem as jest.Mock).mockResolvedValue(mockItem);

            const request = new Request(
                "http://localhost:3000/api/inventory/1234abcd1234abcd1234abcd"
            );
            const response = await GET(request, {
                params: { id: "1234abcd1234abcd1234abcd" },
            });

            const body = await response.json();

            expect(getItem).toHaveBeenCalledWith("1234abcd1234abcd1234abcd");
            expect(response.status).toBe(200);
            expect(body).toEqual(mockItem);
        });

        it("GET by id returns with status 404 when item not found", async () => {
            (getItem as jest.Mock).mockResolvedValue(null);

            const request = new Request(
                "http://localhost:3000/api/inventory/22223333444455556666aaaa"
            );
            const response = await GET(request, {
                params: { id: "22223333444455556666aaaa" },
            });

            const body = await response.json();

            expect(getItem).toHaveBeenCalledWith("22223333444455556666aaaa");
            expect(response.status).toBe(404);
            expect(body).toEqual({
                message: "Item not found",
            });
        });
    });

    describe("PUT /api/inventory/[id]/", () => {
        it("PUT successfully updates item and returns 200", async () => {
            const updatedItem = {
                ...mockItem,
                name: "Gloves 2",
                quantity: 20,
            };

            (updateItem as jest.Mock).mockResolvedValue(updatedItem);

            const request = new Request(
                "http://localhost:3000/api/inventory/1234abcd1234abcd1234abcd",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: "Gloves 2",
                        quantity: 20,
                        category: "consumable",
                        threshold: {
                            minQuantity: 3,
                            enabled: true,
                            lastAlertSentAt: "2026-03-09",
                        },
                        notificationPolicy: {
                            event: "LOW_STOCK",
                            audience: "LAB_MANAGER",
                        },
                    }),
                }
            );

            const response = await PUT(request, {
                params: { id: "1234abcd1234abcd1234abcd" },
            });

            const body = await response.json();

            expect(updateItem).toHaveBeenCalled();
            expect(updateItem).toHaveBeenCalledWith(
                "1234abcd1234abcd1234abcd",
                expect.objectContaining({
                    name: "Gloves 2",
                    quantity: 20,
                })
            );
            expect(response.status).toBe(200);
            expect(body).toEqual(updatedItem);
        });

        it("PUT returns 400 on invalid input", async () => {
            const request = new Request(
                "http://localhost:3000/api/inventory/1234abcd1234abcd1234abcd",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: -10,
                    }),
                }
            );

            const response = await PUT(request, {
                params: { id: "1234abcd1234abcd1234abcd" },
            });

            const body = await response.json();

            expect(updateItem).not.toHaveBeenCalled();
            expect(response.status).toBe(400);
            expect(body).toHaveProperty("message");
        });
    });

    describe("DELETE /api/inventory/[id]/", () => {
        it("DELETE successfully deletes item and returns 200", async () => {
            (deleteItem as jest.Mock).mockResolvedValue(mockItem);

            const request = new Request(
                "http://localhost:3000/api/inventory/1234abcd1234abcd1234abcd",
                { method: "DELETE" }
            );

            const response = await DELETE(request, {
                params: { id: "1234abcd1234abcd1234abcd" },
            });

            const body = await response.json();

            expect(deleteItem).toHaveBeenCalledWith("1234abcd1234abcd1234abcd");
            expect(response.status).toBe(200);
            expect(body).toEqual(mockItem);
        });

        it("DELETE returns 404 when item not found", async () => {
            (deleteItem as jest.Mock).mockResolvedValue(null);

            const request = new Request(
                "http://localhost:3000/api/inventory/2234abcd1234abcd1234abcd",
                { method: "DELETE" }
            );

            const response = await DELETE(request, {
                params: { id: "2234abcd1234abcd1234abcd" },
            });

            const body = await response.json();

            expect(deleteItem).toHaveBeenCalledWith("2234abcd1234abcd1234abcd");
            expect(response.status).toBe(404);
            expect(body).toEqual({
                message: "Item not found",
            });
        });
    });
});
