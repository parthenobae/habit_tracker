import { useEffect, useState } from "react";
import { X } from "lucide-react";
const categories = ["Health", "Study", "Fitness", "Productivity", "Mindfulness", "Other"];
export default function HabitModal({ habit, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", description: "", category: "Health", targetPerWeek: 7, color: "#7868e6" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (habit) setForm({ name: habit.name, description: habit.description || "", category: habit.category, targetPerWeek: habit.targetPerWeek, color: habit.color || "#7868e6" }); }, [habit]);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => { e.preventDefault(); setBusy(true); try { await onSave({ ...form, targetPerWeek: Number(form.targetPerWeek) }); onClose(); } finally { setBusy(false); } };
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-heading"><div><span className="eyebrow">BUILD A BETTER ROUTINE</span><h2>{habit ? "Edit habit" : "Create a habit"}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div>
      <label>Habit name<input name="name" value={form.name} onChange={change} placeholder="e.g. Read for 20 minutes" maxLength="80" required autoFocus /></label>
      <label>Description <span className="muted">(optional)</span><input name="description" value={form.description} onChange={change} placeholder="A small note to keep you focused" maxLength="240"/></label>
      <div className="form-row"><label>Category<select name="category" value={form.category} onChange={change}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Weekly target<select name="targetPerWeek" value={form.targetPerWeek} onChange={change}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} days / week</option>)}</select></label></div>
      <label>Accent colour<div className="color-row">{["#7868e6","#e58a62","#48a995","#e0ae4d","#d56b91","#5289c7"].map(c => <button type="button" key={c} aria-label={c} className={`color-dot ${form.color === c ? "selected" : ""}`} style={{background:c}} onClick={() => setForm({...form,color:c})}/>)}</div></label>
      <button className="primary-button full" disabled={busy}>{busy ? "Saving…" : habit ? "Save changes" : "Create habit"}</button>
    </form>
  </div>;
}
