import { DELETE, GET, POST, PUT } from "@/app/api/UserLab/route";
import {
  addUserLab,
  deleteUserLab,
  getUserLab,
  getUserLabs,
  updateUserLab,
} from "@/services/UserLab";

jest.mock("@/services/UserLab", () => ({
  getUserLabs: jest.fn(),
  getUserLab: jest.fn(),
  addUserLab: jest.fn(),
  updateUserLab: jest.fn(),
  deleteUserLab: jest.fn(),
}));

const mockedGetUserLabs = jest.mocked(getUserLabs);
const mockedGetUserLab = jest.mocked(getUserLab);
const mockedAddUserLab = jest.mocked(addUserLab);
const mockedUpdateUserLab = jest.mocked(updateUserLab);
const mockedDeleteUserLab = jest.mocked(deleteUserLab);

describe("UserLab API route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a paginated list of user labs", async () => {
    mockedGetUserLabs.mockResolvedValue({
      items: [{ _id: "1" }],
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    } as never);

    const response = await GET(
      new Request(
        "http://localhost/api/UserLab?page=2&limit=10&labId=507f1f77bcf86cd799439012"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [{ _id: "1" }],
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    });
    expect(mockedGetUserLabs).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      labId: "507f1f77bcf86cd799439012",
    });
  });

  it("returns 400 when pagination exceeds the allowed limit", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/UserLab?limit=20&labId=507f1f77bcf86cd799439012"
      )
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Too big: expected number to be <=10",
    });
  });

  it("returns 400 when the list request is missing a labId", async () => {
    const response = await GET(
      new Request("http://localhost/api/UserLab?page=1&limit=10")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Invalid input: expected string, received undefined",
    });
  });

  it("returns 404 when a requested entry does not exist", async () => {
    mockedGetUserLab.mockResolvedValue(null as never);

    const response = await GET(
      new Request("http://localhost/api/UserLab?id=507f1f77bcf86cd799439011")
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "UserLab not found",
    });
  });

  it("defaults a new entry role to VIEWER", async () => {
    mockedAddUserLab.mockResolvedValue({ _id: "1", role: "VIEWER" } as never);

    const response = await POST(
      new Request("http://localhost/api/UserLab", {
        method: "POST",
        body: JSON.stringify({
          user: "507f1f77bcf86cd799439011",
          lab: "507f1f77bcf86cd799439012",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(mockedAddUserLab).toHaveBeenCalledWith({
      user: "507f1f77bcf86cd799439011",
      lab: "507f1f77bcf86cd799439012",
      role: "VIEWER",
    });
  });

  it("returns 500 when POST hits an unexpected error", async () => {
    mockedAddUserLab.mockRejectedValue(new Error("db down"));

    const response = await POST(
      new Request("http://localhost/api/UserLab", {
        method: "POST",
        body: JSON.stringify({
          user: "507f1f77bcf86cd799439011",
          lab: "507f1f77bcf86cd799439012",
          role: "PI",
        }),
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Internal server error",
    });
  });

  it("returns 403 when the service rejects the user as unauthorized", async () => {
    mockedGetUserLabs.mockRejectedValue(new Error("Unauthorized: Insufficient permissions"));

    const response = await GET(
      new Request(
        "http://localhost/api/UserLab?page=1&limit=10&labId=507f1f77bcf86cd799439012"
      )
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "Insufficient permissions",
    });
  });

  it("returns 404 when PUT targets a missing entry", async () => {
    mockedUpdateUserLab.mockResolvedValue(null as never);

    const response = await PUT(
      new Request("http://localhost/api/UserLab", {
        method: "PUT",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
          update: { role: "LAB_MANAGER" },
        }),
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "UserLab not found",
    });
  });

  it("returns 200 after deleting an entry", async () => {
    mockedDeleteUserLab.mockResolvedValue({ _id: "1" } as never);

    const response = await DELETE(
      new Request("http://localhost/api/UserLab", {
        method: "DELETE",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "UserLab deleted",
    });
  });
});
