import Habit from "../models/Habit.js";
import { getStreakStats } from "../utils/streaks.js";

const categories = ["Health", "Study", "Fitness", "Productivity", "Mindfulness", "Other"];

export async function getHabits(req, res) {
  const habits = await Habit.find({ user: req.userId }).sort({ createdAt: -1 });
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "") ? req.query.date : new Date().toISOString().slice(0, 10);
  res.json(habits.map(h => ({ ...h.toObject(), ...getStreakStats(h.completionDates, today) })));
}

export async function createHabit(req, res) {
  const { name, description = "", category = "Other", color = "#7868e6", targetPerWeek = 7 } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Habit name is required." });
  if (!categories.includes(category)) return res.status(400).json({ message: "Invalid category." });
  const habit = await Habit.create({ user: req.userId, name: name.trim(), description, category, color, targetPerWeek });
  res.status(201).json({ ...habit.toObject(), currentStreak: 0, longestStreak: 0 });
}

export async function updateHabit(req, res) {
  const allowed = ["name", "description", "category", "color", "targetPerWeek"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (updates.name !== undefined && !updates.name.trim()) return res.status(400).json({ message: "Habit name cannot be empty." });
  const habit = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.userId }, updates, { new: true, runValidators: true });
  if (!habit) return res.status(404).json({ message: "Habit not found." });
  res.json({ ...habit.toObject(), ...getStreakStats(habit.completionDates) });
}

export async function deleteHabit(req, res) {
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!habit) return res.status(404).json({ message: "Habit not found." });
  res.json({ message: "Habit deleted." });
}

export async function toggleCompletion(req, res) {
  const { date } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return res.status(400).json({ message: "A valid date (YYYY-MM-DD) is required." });
  const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
  if (!habit) return res.status(404).json({ message: "Habit not found." });
  const index = habit.completionDates.indexOf(date);
  if (index >= 0) habit.completionDates.splice(index, 1);
  else habit.completionDates.push(date);
  await habit.save();
  res.json({ ...habit.toObject(), ...getStreakStats(habit.completionDates), completed: index < 0 });
}
