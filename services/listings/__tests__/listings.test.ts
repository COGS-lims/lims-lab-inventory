import ListingModel, { ListingInput } from "@/models/Listing";
import {
  getListings,
  getFilteredListings,
  getListing,
  addListing,
  updateListing,
  deleteListing,
} from "@/services/listings/listings";

// functions depend on model which we can't use to call db, so mock
jest.mock("@/models/Listing");

describe("Services: Successful Return Tests", () => {
  // make sure tests are independent
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("sucessfully get all listings", async () => {
    // arrange
    const date = new Date();
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
    const listingDoc = {
      toObject: jest.fn().mockReturnValue(listingData),
    };

    (ListingModel.find as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue([listingDoc]),
    });

    // act
    const result = await getListings();

    // assert
    expect(result.length).toBe(1);
    expect(result).toEqual([listingData]);
  });

  test("successfully getFilteredListings", async () => {
    // arrange
    const date = new Date();
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
    const listingDoc = {
      toObject: jest.fn().mockReturnValue(listingData),
    };

    (ListingModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(), // mock how the method chaining returns same query obj
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([listingDoc]), // mock the list of documents
    });

    (ListingModel.countDocuments as jest.Mock).mockResolvedValue(1);

    // act
    const result = await getFilteredListings({
      page: 1,
      limit: 10,
    });

    // assert
    expect(result.listings.length).toBe(1);
    expect(result).toEqual({
      listings: [listingData],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  test("successfully get a specific listing", async () => {
    const date = new Date();
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
    const listingDoc = {
      toObject: jest.fn().mockReturnValue(listingData),
    };

    // id already exists, this mock only needs toObject method
    (ListingModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(listingDoc), // mock the mongoose doc
    });

    const result = await getListing(id);

    expect(result).toEqual(listingData);
    expect(ListingModel.findById).toHaveBeenCalledWith(id);
  });

  test("successfully add a new listing", async () => {
    const date = new Date();
    const id = "123";

    const listingData: ListingInput = {
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

    const listingDoc = {
      toObject: jest.fn().mockReturnValue({
        id: id,
        ...listingData,
      }),
    };
    (ListingModel.create as jest.Mock).mockResolvedValue(listingDoc);

    const result = await addListing(listingData);

    expect(result).toEqual({
      id: id,
      ...listingData,
    });
    expect(ListingModel.create).toHaveBeenCalledWith(listingData);
  });

  test("successfully update a listing", async () => {
    const date = new Date();
    const id = "123";

    const listingData: ListingInput = {
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

    const listingDoc = {
      toObject: jest.fn().mockReturnValue({
        id: id,
        ...listingData,
      }),
    };
    (ListingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(listingDoc),
    });

    const result = await updateListing(id, listingData);

    expect(result).toEqual({
      id: id,
      ...listingData,
    });
    expect(ListingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      listingData,
      {
        new: true,
        runValidators: true,
      }
    );
  });

  test("successfully delete a listing", async () => {
    const id = "123";
    (ListingModel.findByIdAndDelete as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(true),
    });

    const result = await deleteListing(id);

    expect(result).toBe(true);
    expect(ListingModel.findByIdAndDelete).toHaveBeenCalledWith(id);
  });
});

describe("Services: Null Return Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("listing DNE so getListing returns null", async () => {
    const id = "123";

    const listingDoc = null;
    (ListingModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(listingDoc),
    });

    const result = await getListing(id);

    expect(result).toBe(null);
    expect(ListingModel.findById).toHaveBeenCalledWith(id);
  });

  test("listing DNE so updateListing returns null", async () => {
    const date = new Date();
    const id = "123";

    const listingData: ListingInput = {
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

    const listingDoc = null;
    (ListingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(listingDoc),
    });

    const result = await updateListing(id, listingData);

    expect(result).toBe(null);
    expect(ListingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      listingData,
      {
        new: true,
        runValidators: true,
      }
    );
  });
});

describe("Services: Error Return Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("db error in getListings", async () => {
    (ListingModel.find as jest.Mock).mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(getListings()).rejects.toThrow("DB Error");
  });

  test("db error in getFilteredListings", async () => {
    (ListingModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(getFilteredListings({ page: 1, limit: 10 })).rejects.toThrow(
      "DB Error"
    );
    expect(ListingModel.find).toHaveBeenCalledWith({});
  });

  test("db error in getListing", async () => {
    const id = "123";
    (ListingModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(getListing(id)).rejects.toThrow("DB Error");
    expect(ListingModel.findById).toHaveBeenCalledWith(id);
  });

  test("db error in addListing", async () => {
    const date = new Date();
    const listingData: ListingInput = {
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

    (ListingModel.create as jest.Mock).mockRejectedValue(new Error("DB Error"));

    await expect(addListing(listingData)).rejects.toThrow("DB Error");
    expect(ListingModel.create).toHaveBeenCalledWith(listingData);
  });

  test("db error in updateListing", async () => {
    const date = new Date();
    const id = "123";
    const listingData: ListingInput = {
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
    (ListingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(updateListing(id, listingData)).rejects.toThrow("DB Error");
    expect(ListingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      listingData,
      {
        new: true,
        runValidators: true,
      }
    );
  });

  test("db error in deleteListing", async () => {
    const id = "123";
    (ListingModel.findByIdAndDelete as jest.Mock).mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    await expect(deleteListing(id)).rejects.toThrow("DB Error");
    expect(ListingModel.findByIdAndDelete).toHaveBeenCalledWith(id);
  });
});
