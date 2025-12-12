import { Router } from "express";
import Report from "./report.model.ts";
import { authenticateToken } from "../../middlewares/authToken.ts";

const router = Router();

// POST - Create a new report
router.post("/", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();

    // If anonymous, ensure no sensitive data in response
    const responseData = report.anonymous
      ? {
          _id: report._id,
          userType: report.userType,
          reportCategory: report.reportCategory,
          createdAt: report.createdAt,
        }
      : report;

    res.status(201).json({
      message: "Report submitted successfully",
      report: responseData,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// GET - List all reports
router.get("/", async (req, res) => {
  try {
    // Optional query params: ?category=fraud&anonymous=false&page=1&limit=10
    const { category, anonymous, page = 1, limit = 10 } = req.query;
    const filters: any = {};
    if (category) filters.reportCategory = category;
    if (anonymous !== undefined) filters.anonymous = anonymous === "true";

    const reports = await Report.find(filters)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select("-userIdentification");

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

// GET /:id - Get a specific report (admin-only)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const safeReport = report.toObject();
    if (safeReport.anonymous) {
      delete safeReport.userIdentification;
    }
    res.json(safeReport);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// Optional: DELETE /:id - Delete (admin-only)
router.delete("/:id", authenticateToken, async (req, res) => {
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
