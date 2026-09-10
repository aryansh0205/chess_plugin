import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    /** Relm / server the embed user belongs to. */
    serverId: { type: String, trim: true },
    /** Relmes account id within that relm. */
    relmesUserId: { type: String, trim: true },
  },
  { timestamps: true },
);

userSchema.index(
  { serverId: 1, relmesUserId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      serverId: { $exists: true, $type: "string" },
      relmesUserId: { $exists: true, $type: "string" },
    },
  },
);

export type UserDoc = mongoose.InferSchemaType<typeof userSchema>;

export const User =
  mongoose.models.User ?? mongoose.model("User", userSchema);
