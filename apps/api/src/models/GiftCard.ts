import { Schema, model, Types } from "mongoose";
const GiftCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    gwClassId: String,
    gwObjectId: String,
    saveLink: String,
  },
  { timestamps: true }
);

export const GiftCard = model("GiftCard", GiftCardSchema);
