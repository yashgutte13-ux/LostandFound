import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: String,
    filename: String,
    colorSignature: [Number]
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    image: imageSchema,
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "matched", "claimed", "rejected"],
      default: "pending"
    },
    matchedItem: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
    matchScore: { type: Number, default: 0 },
    adminNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

itemSchema.index({ title: "text", description: "text", category: "text", location: "text" });

export default mongoose.model("Item", itemSchema);
