import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    proof: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Claim", claimSchema);
