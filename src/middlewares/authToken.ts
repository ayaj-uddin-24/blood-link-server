import jwt from "jsonwebtoken";

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
