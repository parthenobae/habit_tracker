import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 240, default: "" },
  category: { type: String, enum: ["Health", "Study", "Fitness", "Productivity", "Mindfulness", "Other"], default: "Other" },
  color: { type: String, default: "#7868e6" },
  targetPerWeek: { type: Number, min: 1, max: 7, default: 7 },
  completionDates: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model("Habit", habitSchema);
