import { Router } from "express";
import BloodRequest from "./bloodRequest.model.ts";
import { authenticateToken } from "../../middlewares/authToken.ts";

const router = Router();

// POST - Create a new blood request (public, no auth needed)
router.post("/", async (req, res) => {
  try {
    const bloodRequest = new BloodRequest(req.body);
    await bloodRequest.save();
    res.status(201).json({
      message: "Blood request created successfully",
      bloodRequest,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// GET - List all blood requests (public, for viewing requests)
router.get("/", async (req, res) => {
  try {
    const { urgencyLevel, bloodGroup, page = 1, limit = 10 } = req.query;
    const filters: any = {};
    if (urgencyLevel) filters.urgencyLevel = urgencyLevel;
    if (bloodGroup) filters.bloodGroup = bloodGroup;

    const bloodRequests = await BloodRequest.find(filters)
      .sort({ createdAt: -1 }) // Newest first
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await BloodRequest.countDocuments(filters);

    res.status(200).json({
      success: true,
      message: "Blood Requests Data Retrieved Successfully",
      bloodRequests,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blood requests" });
  }
});

// GET /:id - Get a specific blood request
router.get("/:id", async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({ error: "Blood request not found" });
    }
    res.json(bloodRequest);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blood request" });
  }
});

// Optional: PUT /:id - Update (e.g., for donors/admins to mark fulfilled; use auth middleware if needed)
router.put("/:id", authenticateToken, async (req, res) => {
  // Assuming auth for updates
  try {
    const bloodRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bloodRequest) {
      return res.status(404).json({ error: "Blood request not found" });
    }
    res.json({ message: "Blood request updated", bloodRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// DELETE /:id - Delete (admin only; use auth)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({ error: "Blood request not found" });
    }
    res.json({ message: "Blood request deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blood request" });
  }
});

export const bloodRequestRouter = router;
