import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiry.controller.js";

import Inquiry from "../models/Inquiry.js";

jest.mock("../models/Inquiry.js");

const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe("Inquiry Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =======================
     CREATE INQUIRY
     ======================= */
  describe("createInquiry", () => {
    it("should create inquiry with userId", async () => {
      const req = {
        body: { message: "Interested in product" },
        user: { id: "user123" },
      };
      const res = mockResponse();

      const createdInquiry = {
        message: "Interested in product",
        userId: "user123",
      };

      Inquiry.create.mockResolvedValue(createdInquiry);

      await createInquiry(req, res);

      expect(Inquiry.create).toHaveBeenCalledWith({
        message: "Interested in product",
        userId: "user123",
      });
      expect(res.json).toHaveBeenCalledWith(createdInquiry);
    });
  });

  /* =======================
     GET INQUIRIES
     ======================= */
  describe("getInquiries", () => {
    it("should return inquiries with populated fields", async () => {
      const req = {};
      const res = mockResponse();

      const inquiries = [{ _id: "1" }, { _id: "2" }];

      Inquiry.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(inquiries),
        }),
      });

      await getInquiries(req, res);

      expect(Inquiry.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(inquiries);
    });
  });

  /* =======================
     UPDATE INQUIRY STATUS
     ======================= */
  describe("updateInquiryStatus", () => {
    it("should update inquiry", async () => {
      const req = {
        params: { id: "inq123" },
        body: { status: "RESOLVED" },
      };
      const res = mockResponse();

      const updatedInquiry = {
        _id: "inq123",
        status: "RESOLVED",
      };

      Inquiry.findByIdAndUpdate.mockResolvedValue(updatedInquiry);

      await updateInquiryStatus(req, res);

      expect(Inquiry.findByIdAndUpdate).toHaveBeenCalledWith(
        "inq123",
        { status: "RESOLVED" },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updatedInquiry);
    });
  });

  /* =======================
     DELETE INQUIRY
     ======================= */
  describe("deleteInquiry", () => {
    it("should delete inquiry", async () => {
      const req = {
        params: { id: "inq123" },
      };
      const res = mockResponse();

      Inquiry.findByIdAndDelete.mockResolvedValue(true);

      await deleteInquiry(req, res);

      expect(Inquiry.findByIdAndDelete).toHaveBeenCalledWith("inq123");
      expect(res.json).toHaveBeenCalledWith({
        message: "Inquiry deleted",
      });
    });
  });
});
