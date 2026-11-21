import { Check, Flame, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { localDate } from "../utils/date";
export default function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);
  const done = habit.completionDates?.includes(localDate());
  const weekCount = (habit.completionDates || []).filter(d => {
    const diff = (new Date(`${localDate()}T12:00:00`) - new Date(`${d}T12:00:00`)) / 86400000;
    return diff >= 0 && diff < 7;
  }).length;
  return <article className={`habit-card ${done ? "is-done" : ""}`}>
    <div className="habit-top"><span className="habit-icon" style={{background:`${habit.color}18`,color:habit.color}}>{habit.category === "Study" ? "✦" : habit.category === "Fitness" ? "↗" : habit.category === "Mindfulness" ? "◉" : habit.category === "Health" ? "♡" : "✳"}</span>
      <div className="habit-menu-wrap"><button className="icon-button small" onClick={() => setMenu(!menu)}><MoreHorizontal size={19}/></button>{menu && <div className="dropdown"><button onClick={() => {setMenu(false);onEdit(habit)}}><Pencil size={14}/> Edit</button><button className="danger-text" onClick={() => {setMenu(false);onDelete(habit._id)}}><Trash2 size={14}/> Delete</button></div>}</div>
    </div>
    <h3>{habit.name}</h3><p className="habit-description">{habit.description || habit.category}</p>
    <div className="habit-stats"><span><Flame size={15}/> {habit.currentStreak || 0} day streak</span><span>{weekCount}/{habit.targetPerWeek} this week</span></div>
    <div className="mini-progress"><span style={{width:`${Math.min(100, weekCount / habit.targetPerWeek * 100)}%`,background:habit.color}}/></div>
    <button className={`complete-button ${done ? "completed" : ""}`} onClick={() => onToggle(habit)}><Check size={16}/>{done ? "Completed today" : "Mark complete"}</button>
  </article>;
}
