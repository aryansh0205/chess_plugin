import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export type UserDoc = mongoose.InferSchemaType<typeof userSchema>;

export const User =
  mongoose.models.User ?? mongoose.model("User", userSchema);
