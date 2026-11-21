import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Flame, Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;
  const submit = async e => {
    e.preventDefault(); setError(""); setBusy(true);
    try { await (isRegister ? register(form) : login({email:form.email,password:form.password})); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Could not connect to the server. Check that the backend is running."); }
    finally { setBusy(false); }
  };
  return <main className="auth-layout"><section className="auth-promo"><div className="brand light"><span className="brand-mark"><Sprout size={21}/></span> daymark</div><div className="promo-copy"><span className="eyebrow">SMALL STEPS. REAL CHANGE.</span><h1>Make your days<br/> <em>count.</em></h1><p>Build routines that stick. Track the little wins that add up to something bigger.</p><div className="promo-points"><span><CheckCircle2/> A clearer daily routine</span><span><Flame/> Streaks that keep you going</span></div></div><div className="promo-bottom">A little better, every day.</div></section>
    <section className="auth-panel"><div className="auth-box"><span className="eyebrow">{isRegister ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</span><h2>{isRegister ? "Create your account" : "Good to see you again."}</h2><p className="muted">{isRegister ? "Start building habits that fit your life." : "Pick up where you left off."}</p>
      <form onSubmit={submit}>{isRegister && <label>Your name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Alex Morgan" required/></label>}<label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label><label>Password<input type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" required/></label>
      {error && <div className="error-box">{error}</div>}<button className="primary-button full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"} <ArrowRight size={17}/></button></form>
      <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Daymark?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></p>
    </div></section></main>;
}
