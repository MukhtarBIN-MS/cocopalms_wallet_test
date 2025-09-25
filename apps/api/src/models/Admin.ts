import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

interface AdminDoc {
  email: string;
  passwordHash: string;
  compare(password: string): Promise<boolean>;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

AdminSchema.methods.compare = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const Admin = model<AdminDoc>("Admin", AdminSchema);
