import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    campus: {
      type: String,
      required: true
    },
    house: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["Student", "Handler", "Associate", "SuperAdmin"],
      default: "Student"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
