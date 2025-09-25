import { Schema, model, Types } from "mongoose";

export interface UserDoc {
  _id: Types.ObjectId;
  fullName: string;
  phone: String;
  dob?: Date | null;
  email: string;
  programId: Types.ObjectId;
  gwObjectId?: string; // Google Wallet Object ID
  gwSaveLink?: string; // save link for button
}

const UserSchema = new Schema<UserDoc>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    dob: Date,
    email: { type: String, required: true, lowercase: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    gwObjectId: String,
    gwSaveLink: String,
  },
  { timestamps: true }
);

export const User = model<UserDoc>("User", UserSchema);
