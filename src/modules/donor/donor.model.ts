import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IDonor extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  weight: number;
  address: string;
  password: string;
  confirmPassword?: string;

  // Method to compare passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema definition
const donorSchema: Schema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [
        /^\+?[\d\s-]{10,}$/,
        "Please enter a valid phone number (at least 10 digits)",
      ],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message: "Invalid blood group",
      },
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [50, "Weight must be at least 50kg"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for confirmPassword
donorSchema.virtual("confirmPassword").set(function (value: string) {
  this._confirmPassword = value;
});

// Pre-save middleware for password hashing and validations
donorSchema.pre("save", async function (this: IDonor, next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);

    if (this.confirmPassword && this.password !== this.confirmPassword) {
      return next(new Error("Passwords do not match"));
    }

    // Age validation: Calculate age from DOB
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18 || age > 65) {
      return next(new Error("Age must be between 18 and 65 years"));
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
donorSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Donor = mongoose.model<IDonor>("Donor", donorSchema);

export default Donor;
