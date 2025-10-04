import express from "express";
import mongoose from "mongoose";

export const app = express();
const port = process.env.PORT || 3000;

import dotenv from "dotenv";
import { donorRouter } from "./modules/donor/donor.controller.ts";
import { bloodRequestRouter } from "./modules/bloodRequest/bloodRequest.controller.ts";
import { reportRouter } from "./modules/report/report.controller.ts";
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myapp")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware for JSON parsing
app.use(express.json());
app.use("/api/v1/donor", donorRouter);
app.use("/api/v1/blood-requests", bloodRequestRouter);
app.use("/api/v1/reports", reportRouter);

// Home Router
app.get("/", (req, res) => {
  res.send("Hello from TypeScript Backend with MongoDB!");
});

// Listening to the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
