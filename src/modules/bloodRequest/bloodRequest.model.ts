// Create src/models/bloodRequest.ts (new file)
import mongoose, { Document, Schema } from "mongoose";

export interface IBloodRequest extends Document {
  patientName: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  unitsNeeded: number;
  requiredBy: Date;
  hospitalName: string;
  doctorName: string;
  primaryContact: string;
  emergencyContact: string;
  location: string;
  medicalReason: string;
  additionalInformation?: string;
  detailsDescription?: string;
}

// Schema definition
const bloodRequestSchema: Schema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters"],
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB+", "O+", "O-"],
        message: "Invalid blood group",
      },
    },
    urgencyLevel: {
      type: String,
      required: [true, "Urgency level is required"],
      enum: {
        values: ["Low", "Medium", "High", "Critical"],
        message: "Urgency level must be Low, Medium, High, or Critical",
      },
    },
    unitsNeeded: {
      type: Number,
      required: [true, "Units needed is required"],
      min: [1, "At least 1 unit is required"],
    },
    requiredBy: {
      type: Date,
      required: [true, "Required by date is required"],
      // Future date validation can be added in pre-save hook if needed
    },
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      minlength: [2, "Hospital name must be at least 2 characters"],
    },
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: [2, "Doctor name must be at least 2 characters"],
    },
    primaryContact: {
      type: String,
      required: [true, "Primary contact is required"],
      match: [
        /^\+?[\d\s-]{10,}$|^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid phone or email for primary contact",
      ],
    },
    emergencyContact: {
      type: String,
      required: [true, "Emergency contact is required"],
      match: [
        /^\+?[\d\s-]{10,}$|^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid phone or email for emergency contact",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [5, "Location must be at least 5 characters"],
    },
    medicalReason: {
      type: String,
      required: [true, "Medical reason is required"],
      trim: true,
      minlength: [10, "Medical reason must be at least 10 characters"],
    },
    additionalInformation: {
      type: String,
      trim: true,
    },
    detailsDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-save hook for requiredBy date validation (must be in future, e.g., after October 02, 2025)
bloodRequestSchema.pre("save", function (next) {
  const currentDate = new Date("2025-10-02"); // Fixed as per context
  // Assert 'this' as IBloodRequest
  const doc = this as any;
  if (doc.requiredBy <= currentDate) {
    return next(new Error("Required by date must be in the future"));
  }
  next();
});

// Create and export the model
const BloodRequest = mongoose.model<IBloodRequest>(
  "BloodRequest",
  bloodRequestSchema
);

export default BloodRequest;
