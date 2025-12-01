import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  userType: "blood donor" | "recipient" | "other";
  userIdentification?: string;
  reportCategory:
    | "fake people"
    | "harassment"
    | "spam"
    | "fraud"
    | "other"
    | "rude behavior";
  detailedDescription: string;
  supportingEvidence?: string;
  anonymous: boolean;
  createdAt?: string;
}

// Schema definition
const reportSchema: Schema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: [true, "User type is required"],
      enum: {
        values: ["blood donor", "recipient", "other"],
        message: "User type must be blood donor, recipient, or other",
      },
    },
    userIdentification: {
      type: String,
      required: function (this: any) {
        return !this.anonymous;
      },
      validate: {
        validator: function (v: string) {
          const phoneRegex = /^\+?[\d\s-]{10,}$/;
          const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
          return phoneRegex.test(v) || emailRegex.test(v);
        },
        message: "User identification must be a valid phone number or email",
      },
    },
    reportCategory: {
      type: String,
      required: [true, "Report category is required"],
      enum: {
        values: [
          "fake people",
          "harassment",
          "spam",
          "fraud",
          "other",
          "rude behavior",
        ],
        message: "Invalid report category",
      },
    },
    detailedDescription: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
      minlength: [10, "Detailed description must be at least 10 characters"],
    },
    supportingEvidence: {
      type: String,
      trim: true,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: If anonymous, clear userIdentification for privacy
reportSchema.pre("save", function (next) {
  if (this.anonymous) {
    this.userIdentification = undefined;
  }
  next();
});

const Report = mongoose.model<IReport>("Report", reportSchema);

export default Report;
