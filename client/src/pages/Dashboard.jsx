import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, LogOut, Sprout, Flame, Target, CheckCircle2, CalendarDays, TrendingUp, Sparkles, Moon, Sun, Download, Timer, Play, Pause, RotateCcw, Trophy, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import HabitCard from "../components/HabitCard";
import HabitModal from "../components/HabitModal";
import { lastSevenDays, localDate } from "../utils/date";
import { Link } from "react-router-dom";

const dayKey = localDate();
const quotes = [
  "Small daily improvements are the key to staggering long-term results.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Great things are done by a series of small things brought together."
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("habit_theme") === "dark");
  const [seconds, setSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [focusMode, setFocusMode] = useState("Focus");
  const [note, setNote] = useState(() => localStorage.getItem(`habit_note_${user?._id || user?.email}_${dayKey}`) || "");
  const today = localDate();
  const days = useMemo(lastSevenDays, []);
  const heatDays = useMemo(() => Array.from({length: 90}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (89 - i));
    return {date: localDate(d), label: d.toLocaleDateString("en", {month:"short",day:"numeric"})};
  }), []);
  const load = useCallback(async () => {
    try { const {data} = await api.get("/habits", { params: { date: localDate() } }); setHabits(data); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Unable to load habits."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { localStorage.setItem("habit_theme", dark ? "dark" : "light"); document.documentElement.classList.toggle("dark-mode", dark); }, [dark]);
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setSeconds(s => {
      if (s <= 1) { setTimerRunning(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);
  useEffect(() => {
    localStorage.setItem(`habit_note_${user?._id || user?.email}_${today}`, note);
  }, [note, user, today]);
  const completed = habits.filter(h => h.completionDates?.includes(today)).length;
  const percent = habits.length ? Math.round(completed / habits.length * 100) : 0;
  const totalStreak = habits.reduce((sum,h) => sum + (h.currentStreak || 0), 0);
  const longest = habits.reduce((max,h) => Math.max(max,h.longestStreak || 0), 0);
  const weekData = days.map(day => ({...day, count: habits.filter(h => h.completionDates?.includes(day.date)).length}));
  const allDates = habits.flatMap(h => h.completionDates || []);
  const heatCounts = heatDays.map(d => ({...d, count: habits.reduce((n,h) => n + (h.completionDates?.includes(d.date) ? 1 : 0), 0)}));
  const activeDays = new Set(allDates).size;
  const achievements = [
    {name:"First step", detail:"Complete your first habit", earned:allDates.length >= 1, icon:"🌱"},
    {name:"One-week wonder", detail:"Build a 7-day streak", earned:habits.some(h => h.longestStreak >= 7), icon:"🔥"},
    {name:"Consistency club", detail:"Complete habits on 30 different days", earned:activeDays >= 30, icon:"🏆"},
    {name:"Habit collector", detail:"Create 5 habits", earned:habits.length >= 5, icon:"⭐"},
    {name:"Century club", detail:"Build a 100-day streak", earned:habits.some(h => h.longestStreak >= 100), icon:"💎"}
  ];
  const save = async data => { if (modal?.habit) await api.put(`/habits/${modal.habit._id}`, data); else await api.post("/habits", data); await load(); };
  const toggle = async habit => { try { await api.post(`/habits/${habit._id}/toggle`, {date:today}); await load(); } catch(e) {setError(e.response?.data?.message || "Could not update habit.");} };
  const remove = async id => { if (!window.confirm("Delete this habit and its completion history?")) return; try { await api.delete(`/habits/${id}`); await load(); } catch(e) {setError("Could not delete habit.");} };
  const exportCSV = () => {
    const rows = [["Habit","Category","Date","Completed"]];
    habits.forEach(h => {
      const dates = h.completionDates || [];
      if (!dates.length) rows.push([h.name,h.category,"","No"]);
      else dates.forEach(d => rows.push([h.name,h.category,d,"Yes"]));
    });
    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"}));
    const a = document.createElement("a"); a.href = url; a.download = "habitflow-history.csv"; a.click(); URL.revokeObjectURL(url);
  };
  const changeTimer = mode => { setFocusMode(mode); setSeconds(mode === "Focus" ? 25*60 : 5*60); setTimerRunning(false); };
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const quote = quotes[new Date().getDate() % quotes.length];
  return <div className="app-shell"><aside className="sidebar"><Link to="/" className="brand"><span className="brand-mark"><Sprout size={21}/></span> daymark</Link><div className="side-label">WORKSPACE</div><a href="#overview" className="side-link active"><span>▦</span> Overview</a><a href="#activity" className="side-link"><span>▥</span> Activity</a><a href="#achievements" className="side-link"><span>♛</span> Achievements</a><div className="side-label side-bottom-label">YOUR ACCOUNT</div><div className="user-mini"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="user-info"><strong>{user?.name}</strong><span>{user?.email}</span></div><button className="icon-button" title="Log out" onClick={logout}><LogOut size={17}/></button></div><div className="sidebar-note"><Sparkles size={17}/><p>Consistency beats intensity. Keep showing up.</p></div></aside>
    <main className="main-area" id="overview"><header className="topbar"><div><span className="eyebrow">YOUR PERSONAL HABIT SPACE</span><div className="date-line"><CalendarDays size={15}/>{new Date().toLocaleDateString("en", {weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div></div><div className="top-actions"><button className="icon-button" title="Export CSV" onClick={exportCSV}><Download size={18}/></button><button className="icon-button" title="Toggle theme" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="primary-button add-top" onClick={()=>setModal({habit:null})}><Plus size={17}/> New habit</button></div></header>
      <section className="welcome-row"><div><span className="eyebrow">{greeting.toUpperCase()}</span><h1>Make today <em>matter,</em> {user?.name?.split(" ")[0]}.</h1><p>Every small action is a vote for the person you want to become.</p></div><div className="welcome-flower">✳</div></section>
      {error && <div className="error-box page-error">{error}</div>}
      <section className="stats-grid"><div className="stat-card"><div className="stat-icon purple"><Target size={19}/></div><span>Today's progress</span><strong>{completed}<small> / {habits.length}</small></strong><div className="stat-foot">{percent}% of habits completed</div></div><div className="stat-card"><div className="stat-icon orange"><Flame size={19}/></div><span>Active streaks</span><strong>{totalStreak}<small> days</small></strong><div className="stat-foot">Combined current streaks</div></div><div className="stat-card"><div className="stat-icon green"><TrendingUp size={19}/></div><span>Personal best</span><strong>{longest}<small> days</small></strong><div className="stat-foot">Your longest habit streak</div></div><div className="stat-card"><div className="stat-icon blue"><CheckCircle2 size={19}/></div><span>Completion rate</span><strong>{percent}<small>%</small></strong><div className="stat-foot">Today's completion rate</div></div></section>
      <section className="content-grid"><div className="habits-section"><div className="section-heading"><div><span className="eyebrow">YOUR ROUTINE</span><h2>Today's habits <span className="count-pill">{habits.length}</span></h2></div><button className="text-button" onClick={()=>setModal({habit:null})}><Plus size={16}/> Add habit</button></div>
        {loading ? <div className="empty-state">Loading your habits…</div> : habits.length === 0 ? <div className="empty-state"><span className="empty-symbol">✳</span><h3>Start with one small habit</h3><p>Choose something you can do consistently. You can always add more later.</p><button className="primary-button" onClick={()=>setModal({habit:null})}><Plus size={17}/> Create your first habit</button></div> : <div className="habit-grid">{habits.map(h=><HabitCard key={h._id} habit={h} onToggle={toggle} onEdit={habit=>setModal({habit})} onDelete={remove}/>)}</div>}
      </div>
      <aside className="right-column"><div className="progress-panel"><div className="section-heading compact"><div><span className="eyebrow">A QUICK LOOK</span><h2>Daily progress</h2></div></div><div className="ring-wrap"><div className="progress-ring" style={{background:`conic-gradient(#7868e6 ${percent*3.6}deg, #eeedf4 0deg)`}}><div className="ring-inner"><strong>{percent}%</strong><span>complete</span></div></div></div><p className="ring-caption">{completed === habits.length && habits.length ? "All done. Excellent work!" : `${habits.length - completed} ${habits.length - completed === 1 ? "habit" : "habits"} left for today.`}</p><div className="panel-divider"/><div className="legend-row"><span><i className="dot purple-dot"/> Completed</span><strong>{completed}</strong></div><div className="legend-row"><span><i className="dot grey-dot"/> Remaining</span><strong>{habits.length-completed}</strong></div></div>
      <div className="week-panel"><div className="section-heading compact"><div><span className="eyebrow">LAST 7 DAYS</span><h2>This week</h2></div></div><div className="week-bars">{weekData.map(day=><div className="bar-column" key={day.date}><div className="bar-track"><div className="bar-fill" style={{height:`${habits.length ? Math.max(day.count ? 8 : 0, day.count/habits.length*100) : 0}%`}}/></div><span className={day.date===today?"today-label":""}>{day.label}</span></div>)}</div><p className="week-caption">Habits completed each day</p></div>
      <div className="quote-card"><span>“</span><p>{quote}</p><small>— Your daily reminder</small></div></aside></section>

      <section className="feature-grid" id="activity">
        <div className="feature-panel heat-panel"><div className="section-heading"><div><span className="eyebrow">YOUR CONSISTENCY</span><h2>90-day activity</h2></div><span className="muted">{activeDays} active days</span></div><div className="heatmap">{heatCounts.map(d=><div key={d.date} title={`${d.label}: ${d.count} completed`} className={`heat-cell heat-${Math.min(4,d.count)}`}/>)}</div><div className="heat-legend"><span>Less</span>{[0,1,2,3,4].map(n=><i key={n} className={`heat-cell heat-${n}`}/>)}<span>More</span></div></div>
        <div className="feature-panel timer-panel"><div className="section-heading"><div><span className="eyebrow">STAY IN THE ZONE</span><h2><Timer size={18}/> Focus timer</h2></div></div><div className="timer-modes"><button className={focusMode==="Focus"?"selected":""} onClick={()=>changeTimer("Focus")}>Focus 25m</button><button className={focusMode==="Break"?"selected":""} onClick={()=>changeTimer("Break")}>Break 5m</button></div><div className="timer-display">{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</div><div className="timer-controls"><button className="primary-button" onClick={()=>setTimerRunning(v=>!v)}>{timerRunning?<Pause size={15}/>:<Play size={15}/>} {timerRunning?"Pause":"Start"}</button><button className="icon-button" title="Reset timer" onClick={()=>{setTimerRunning(false);setSeconds(focusMode==="Focus"?1500:300)}}><RotateCcw size={17}/></button></div>{seconds===0&&<p className="timer-done">Session complete. Take a moment before the next one.</p>}</div>
      </section>
      <section className="feature-grid lower-grid" id="achievements">
        <div className="feature-panel"><div className="section-heading"><div><span className="eyebrow">MILESTONES</span><h2><Trophy size={18}/> Achievements</h2></div><span className="count-pill">{achievements.filter(a=>a.earned).length}/{achievements.length} unlocked</span></div><div className="achievement-grid">{achievements.map(a=><div key={a.name} className={`achievement ${a.earned?"earned":""}`}><span>{a.icon}</span><div><strong>{a.name}</strong><small>{a.detail}</small></div>{a.earned&&<CheckCircle2 size={16}/>}</div>)}</div></div>
        <div className="feature-panel journal-panel"><div className="section-heading"><div><span className="eyebrow">END-OF-DAY REFLECTION</span><h2><BookOpen size={18}/> Daily journal</h2></div></div><p className="muted">What went well today? What can you improve tomorrow?</p><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a few thoughts about your day..." maxLength={1000}/><small className="muted">Saved automatically on this device · {note.length}/1000</small></div>
      </section>
      <footer className="footer">DAYMARK <span>·</span> Built one day at a time.</footer>
    </main>
    {modal && <HabitModal habit={modal.habit} onClose={()=>setModal(null)} onSave={save}/>}
  </div>;
}
