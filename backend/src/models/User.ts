import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  visitorId: string;
  displayName: string;
  role: "viewer" | "admin";
}

const UserSchema = new Schema<IUser>(
  {
    visitorId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["viewer", "admin"],
      default: "viewer",
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
