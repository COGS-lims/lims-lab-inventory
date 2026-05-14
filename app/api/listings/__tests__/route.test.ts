import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";

/** test route handler, mock db connection and svc handlers */
jest.mock("@/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

jest.mock("@/services/listings/listings", () => ({
  getListings: jest.fn(),
  getFilteredListings: jest.fn(),
  getListing: jest.fn(),
  addListing: jest.fn(),
  updateListing: jest.fn(),
  deleteListing: jest.fn(),
}));

jest.mock("@/lib/googleCloud", () => ({
  uploadImage: jest.fn().mockResolvedValue("https://mock.com/image.jpg"),
}));

jest.mock("@/lib/rbac", () => ({
  getSession: jest.fn().mockResolvedValue({
    allowed: true,
    user: null,
    reason: undefined,
  }),
}));

/** import after mocking */
import { GET, POST } from "@/app/api/listings/route";
import { GET as GET_BY_ID, PUT, DELETE } from "@/app/api/listings/[id]/route";
import {
  getFilteredListings,
  getListing,
  addListing,
  updateListing,
  deleteListing,
} from "@/services/listings/listings";

describe("API: Successful Responses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /listings", () => {
    test("returns filtered listings successfully", async () => {
      // arrange
      const date = new Date().toISOString();
      const id = "123";

      const listingData = {
        id: id,
        itemName: "Flask",
        itemId: "item1",
        labName: "Dr. Jones Lab",
        labLocation: "Torrey Pines",
        labId: "lab1",
        imageUrls: [],
        quantityAvailable: 5,
        createdAt: date,
        expiryDate: null,
        description: "High quality flask for use",
        price: 50,
        status: "ACTIVE",
        condition: "New",
        hazardTags: ["Physical"],
      };

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (getFilteredListings as jest.Mock).mockResolvedValue({
        listings: [listingData],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      // act
      const req = new Request("http://localhost/api/listings");
      const res = await GET(req);
      const body = await res.json();

      // assert
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([listingData]);
      expect(body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(getFilteredListings).toHaveBeenCalledWith({
        labId: undefined,
        itemId: undefined,
        page: 1, // default
        limit: 10, // default
      });
    });
  });

  describe("GET /listings/[id]", () => {
    test("returns a specific listing successfully", async () => {
      const date = new Date().toISOString();
      const id = new mongoose.Types.ObjectId().toString();

      const listingData = {
        id: id,
        itemName: "Flask",
        itemId: "item1",
        labName: "Dr. Jones Lab",
        labLocation: "Torrey Pines",
        labId: "lab1",
        imageUrls: [],
        quantityAvailable: 5,
        createdAt: date,
        expiryDate: null,
        description: "High quality flask for use",
        price: 50,
        status: "ACTIVE",
        condition: "New",
        hazardTags: ["Physical"],
      };

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (getListing as jest.Mock).mockResolvedValue(listingData);

      const req = new Request(`http://localhost/api/listings/${id}`);
      const res = await GET_BY_ID(req, { params: { id: id } });
      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.success).toEqual(true);
      expect(body.data).toEqual(listingData);
      expect(getListing).toHaveBeenCalledWith(id);
    });
  });

  describe("POST /listings", () => {
    test("creates a new listing with all fields", async () => {
      const date = new Date();

      const listingData = {
        itemName: "Flask",
        itemId: "item1",
        labName: "Dr. Jones Lab",
        labLocation: "Torrey Pines",
        labId: "lab1",
        quantityAvailable: 5,
        description: "High quality flask for use",
        price: 50,
        status: "ACTIVE",
        condition: "New",
        hazardTags: ["Physical", "Chemical"],
        expiryDate: date.toISOString(),
      };

      const mockReturnedData = {
        ...listingData,
        expiryDate: new Date(listingData.expiryDate),
        id: "123",
        createdAt: date,
        imageUrls: [],
      };

      const formData = new FormData();
      Object.entries(listingData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      });

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (addListing as jest.Mock).mockResolvedValue(mockReturnedData);

      const req = new Request(`http://localhost/api/listings`, {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);

      expect(body.data).toMatchObject({
        itemName: "Flask",
        itemId: "item1",
        labName: "Dr. Jones Lab",
        labLocation: "Torrey Pines",
        labId: "lab1",
        quantityAvailable: 5,
        description: "High quality flask for use",
        price: 50,
        status: "ACTIVE",
        condition: "New",
        hazardTags: ["Physical", "Chemical"],
        expiryDate: expect.any(String),
        id: "123",
        createdAt: expect.any(String),
        imageUrls: [],
      });

      expect(addListing).toHaveBeenCalledWith(
        expect.objectContaining({
          ...listingData,
          quantityAvailable: 5,
          price: 50,
          expiryDate: new Date(listingData.expiryDate),
          hazardTags: ["Physical", "Chemical"],
        })
      );
    });

    test("creates listing with defaults for optional fields", async () => {
      const date = new Date();

      const minimalData = {
        itemName: "Flask",
        itemId: "item1",
        labId: "lab1",
        quantityAvailable: 5,
        status: "ACTIVE",
        condition: "New",
      };

      const mockReturnedData = {
        ...minimalData,
        id: "123",
        createdAt: date,
        imageUrls: [],
        labName: "",
        labLocation: "",
        description: "",
        price: 0,
        hazardTags: [],
      };

      const formData = new FormData();
      Object.entries(minimalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (addListing as jest.Mock).mockResolvedValue(mockReturnedData);

      const req = new Request(`http://localhost/api/listings`, {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);

      expect(body.data).toMatchObject({
        ...minimalData,
        labName: "",
        labLocation: "",
        description: "",
        price: 0,
        hazardTags: [],
        imageUrls: [],
      });
    });
  });

  describe("PUT /listings/[id]", () => {
    test("successfully updates a listing with all fields", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const date = new Date();

      const listingData = {
        itemName: "Updated Flask",
        itemId: "item1",
        labName: "Updated Lab",
        labLocation: "Updated Location",
        labId: "lab1",
        quantityAvailable: 10,
        description: "Updated description",
        price: 100,
        status: "ACTIVE",
        condition: "Good",
        hazardTags: ["Chemical", "Biological"],
        expiryDate: date.toISOString(),
      };

      const mockReturnedData = {
        ...listingData,
        id,
        createdAt: date,
        imageUrls: [
          "http://example.com/image1.jpg",
          "http://example.com/image2.jpg",
        ],
      };

      const formData = new FormData();
      Object.entries(listingData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      });

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (updateListing as jest.Mock).mockResolvedValue(mockReturnedData);

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });

      const res = await PUT(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Listing successfully updated.");
      expect(body.data).toEqual({
        ...listingData,
        id,
        createdAt: expect.any(String),
        imageUrls: [
          "http://example.com/image1.jpg",
          "http://example.com/image2.jpg",
        ],
      });
      expect(updateListing).toHaveBeenCalledWith(id, {
        ...listingData,
        expiryDate: new Date(listingData.expiryDate),
      });
    });
  });

  describe("DELETE /listings/[id]", () => {
    test("deletes a listing successfully", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (deleteListing as jest.Mock).mockResolvedValue(true);

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Listing successfully deleted.");
      expect(deleteListing).toHaveBeenCalledWith(id);
    });
  });
});

describe("API: Error Responses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /listings", () => {
    test("DB connection error", async () => {
      (connectToDatabase as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request("http://localhost/api/listings");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Error connecting to database.");
    });

    test("service error retrieving listings", async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (getFilteredListings as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );

      const req = new Request("http://localhost/api/listings");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Error occurred while retrieving listings.");
      expect(getFilteredListings).toHaveBeenCalledWith({
        labId: undefined,
        itemId: undefined,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("GET /listings/[id]", () => {
    test("DB connection error", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request(`http://localhost/api/listings/${id}`);
      const res = await GET_BY_ID(req, { params: { id: id } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Error connecting to database.");
    });

    test("invalid id format", async () => {
      const id = "123";

      (connectToDatabase as jest.Mock).mockResolvedValue({});

      const req = new Request(`http://localhost/api/listings/${id}`);
      const res = await GET_BY_ID(req, { params: { id: id } });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual(
        "Invalid ID format. Must be a valid MongoDB ObjectId."
      );
    });

    test("listing not found", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (getListing as jest.Mock).mockResolvedValue(null);

      const req = new Request(`http://localhost/api/listings/${id}`);
      const res = await GET_BY_ID(req, { params: { id: id } });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Listing not found.");
      expect(getListing).toHaveBeenCalledWith(id);
    });

    test("service error retrieving listing", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (getListing as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request(`http://localhost/api/listings/${id}`);
      const res = await GET_BY_ID(req, { params: { id: id } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Error occurred while retrieving listing.");
      expect(getListing).toHaveBeenCalledWith(id);
    });
  });

  describe("POST /listings", () => {
    test("DB connection error", async () => {
      (connectToDatabase as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const formData = new FormData();

      const req = new Request("http://localhost/api/listings", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Error connecting to database.");
    });

    test("invalid req body", async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({});

      const formData = new FormData();
      formData.append("invalidField", "Invalid Value");

      const req = new Request("http://localhost/api/listings", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Invalid request body.");
    });

    test("listing already exists", async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      // mock mongodb's error, not the http 409 status code
      (addListing as jest.Mock).mockRejectedValue({ code: 11000 });

      const formData = new FormData();
      formData.append("itemName", "Flask");
      formData.append("itemId", "item1");
      formData.append("labId", "lab1");
      formData.append("quantityAvailable", "5");
      formData.append("status", "ACTIVE");
      formData.append("condition", "New");

      const req = new Request("http://localhost/api/listings", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.message).toBe("This listing already exists.");
      expect(addListing).toHaveBeenCalled();
    });

    test("service error creating listing", async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (addListing as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const formData = new FormData();
      formData.append("itemName", "Flask");
      formData.append("itemId", "item1");
      formData.append("labId", "lab1");
      formData.append("quantityAvailable", "5");
      formData.append("status", "ACTIVE");
      formData.append("condition", "New");

      const req = new Request("http://localhost/api/listings", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Error occurred while creating new listing.");
      expect(addListing).toHaveBeenCalled();
    });
  });

  describe("PUT /listings/[id]", () => {
    test("DB connection error", async () => {
      const id = "123";
      const formData = new FormData();
      formData.append("itemName", "Updated Name");

      (connectToDatabase as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });
      const res = await PUT(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Error connecting to database.");
    });

    test("invalid id format", async () => {
      const id = "invalid-id";
      const formData = new FormData();
      formData.append("itemName", "Updated Name");
      formData.append("quantityAvailable", "10");
      formData.append("status", "ACTIVE");
      formData.append("condition", "New");

      (connectToDatabase as jest.Mock).mockResolvedValue({});

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });
      const res = await PUT(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe(
        "Invalid ID format. Must be a valid MongoDB ObjectId."
      );
    });

    test("invalid req body", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const formData = new FormData();
      formData.append("invalidField", "Testing Invalid Value");

      (connectToDatabase as jest.Mock).mockResolvedValue({});

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });

      const res = await PUT(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Invalid request body.");
    });

    test("listing not found", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const formData = new FormData();
      formData.append("itemName", "Updated Name");
      formData.append("quantityAvailable", "10");
      formData.append("status", "ACTIVE");
      formData.append("condition", "New");

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (updateListing as jest.Mock).mockResolvedValue(null);

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });
      const res = await PUT(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Listing not found");
      expect(updateListing).toHaveBeenCalledWith(id, {
        itemName: "Updated Name",
        quantityAvailable: 10,
        status: "ACTIVE",
        condition: "New",
      });
    });

    test("service error updating listing", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const formData = new FormData();
      formData.append("itemName", "Updated Name");
      formData.append("quantityAvailable", "10");
      formData.append("status", "ACTIVE");
      formData.append("condition", "New");

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (updateListing as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });
      const res = await PUT(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Error occurred while updating listing.");
      expect(updateListing).toHaveBeenCalledWith(id, {
        itemName: "Updated Name",
        quantityAvailable: 10,
        status: "ACTIVE",
        condition: "New",
      });
    });
  });

  describe("DELETE /listings/[id]", () => {
    test("DB connection error", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Error connecting to database.");
    });

    test("invalid id format", async () => {
      const id = "invalid-id";

      (connectToDatabase as jest.Mock).mockResolvedValue({});

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe(
        "Invalid ID format. Must be a valid MongoDB ObjectId."
      );
    });

    test("listing not found", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (deleteListing as jest.Mock).mockResolvedValue(false);

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Listing not found");
      expect(deleteListing).toHaveBeenCalledWith(id);
    });

    test("service error deleting listing", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (deleteListing as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const req = new Request(`http://localhost/api/listings/${id}`, {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id } });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Error occurred while deleting listing.");
      expect(deleteListing).toHaveBeenCalledWith(id);
    });
  });
});
