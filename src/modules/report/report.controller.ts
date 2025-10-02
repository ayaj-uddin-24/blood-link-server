import { Router } from "express";
import Report from "./report.model.ts";
import { authenticateToken } from "../donor/donor.controller.ts";

const router = Router();
// POST /reports - Create a new report (public, no auth needed; supports anonymous)
router.post("/reports", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();

    // If anonymous, ensure no sensitive data in response
    const responseData = report.anonymous
      ? {
          _id: report._id,
          userType: report.userType,
          reportCategory: report.reportCategory,
          //   createdAt: report.createdAt,
        }
      : report;

    res.status(201).json({
      message: "Report submitted successfully",
      report: responseData,
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// GET /reports - List all reports (admin-only; use auth middleware)
router.get("/reports", authenticateToken, async (req, res) => {
  try {
    // Optional query params: ?category=fraud&anonymous=false&page=1&limit=10
    const { category, anonymous, page = 1, limit = 10 } = req.query;
    const filters: any = {};
    if (category) filters.reportCategory = category;
    if (anonymous !== undefined) filters.anonymous = anonymous === "true";

    const reports = await Report.find(filters)
      .sort({ createdAt: -1 }) // Newest first
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select("-userIdentification"); // Hide identification in list for privacy

    const total = await Report.countDocuments(filters);

    res.json({
      reports,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// GET /reports/:id - Get a specific report (admin-only)
router.get("/reports/:id", authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    // Hide identification unless needed (admin can adjust)
    const safeReport = report.toObject();
    if (safeReport.anonymous) {
      delete safeReport.userIdentification;
    }
    res.json(safeReport);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// Optional: DELETE /reports/:id - Delete (admin-only)
router.delete("/reports/:id", authenticateToken, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export const reportRouter = router;
