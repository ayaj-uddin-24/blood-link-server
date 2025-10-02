import { Router } from "express";
import Donor from "./donor.model.ts";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, phoneNumber, confirmPassword, ...donorData } = req.body;

    // Check if user already exists by email or phone
    const existingDonor = await Donor.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingDonor) {
      return res.status(400).json({
        error:
          existingDonor.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Check password match
    if (confirmPassword !== req.body.password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Create and save donor (schema hooks handle hashing, age, etc.)
    const donor = new Donor({ ...donorData, confirmPassword });
    await donor.save();

    // Generate JWT token on successful registration
    const token = jwt.sign(
      { donorId: donor._id, email: donor.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Remove password from response
    const { password, ...safeDonor } = donor.toObject();

    res.status(201).json({
      message: "Donor registered successfully",
      token,
      donor: safeDonor,
    });
  } catch (error) {
    // Handle schema validation errors (age, weight, etc.)
    res.status(400).json({ error: (error as Error).message });
  }
});

// New POST /login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find donor by email
    const donor = await Donor.findOne({ email }).select("+password"); // Include password

    if (!donor || !(await donor.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { donorId: donor._id, email: donor.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...safeDonor } = donor.toObject();

    res.json({
      message: "Login successful",
      token,
      donor: safeDonor,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// Middleware to verify JWT token (for protected routes)
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err: any, donor: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.donor = donor;
      next();
    }
  );
};

// Example protected route: GET /profile
router.get("/profile", authenticateToken, async (req: any, res) => {
  try {
    const donor = await Donor.findById(req.donor.donorId).select("-password");
    if (!donor) {
      return res.status(404).json({ error: "Donor not found" });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export const donorRouter = router;
