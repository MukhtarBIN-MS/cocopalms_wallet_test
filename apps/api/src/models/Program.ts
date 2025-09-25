import { Schema, model, Types } from "mongoose";

export interface ProgramDoc {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  amount: number; // gift card value
  expiryDate?: Date | null;
  themeUrl?: string; // uploaded logo/image URL
  gwClassId?: string; // Google Wallet Class ID
}

const ProgramSchema = new Schema<ProgramDoc>(
  {
    name: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true, min: 0 },
    expiryDate: Date,
    themeUrl: String,
    gwClassId: String,
  },
  { timestamps: true }
);

export const Program = model<ProgramDoc>("Program", ProgramSchema);
