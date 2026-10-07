import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Brain,
  Check,
  CircleUserRound,
  Clock3,
  Droplets,
  HeartPulse,
  LoaderCircle,
  Moon,
  Plus,
  ShieldAlert,
  Sparkles,
  Thermometer,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const ML_BASE = (import.meta.env.VITE_ML_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const dateTimeNow = () => new Date().toISOString().slice(0, 16);
const emptyDashboard = {
  totalWellnessLogs: 0,
  totalVitalLogs: 0,
  totalSymptomLogs: 0,
  latestWellnessLog: null,
  latestVitalLog: null,
  latestSymptomLog: null,
};

async function requestJson(base, path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!response.ok) {
    const details = typeof body === "object" && body ? JSON.stringify(body) : body;
    throw new Error(details || `Request failed (${response.status})`);
  }
  return body;
}

function numericOrNull(value) {
  return value === "" || value == null ? null : Number(value);
}

function formatDate(value) {
  if (!value) return "No entries yet";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function App() {
  const [section, setSection] = useState("overview");
  const [userId, setUserId] = useState(() => localStorage.getItem("sanjeevani.userId") || "");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [vitalLogs, setVitalLogs] = useState([]);
  const [symptomCatalog, setSymptomCatalog] = useState([]);
  const [status, setStatus] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisInput, setAnalysisInput] = useState("");
  const [registration, setRegistration] = useState({ name: "", email: "", password: "" });
  const [symptomName, setSymptomName] = useState("");

  async function refresh() {
    setStatus("checking");
    try {
      const [health, summary, wellness, vitals, symptoms] = await Promise.all([
        requestJson(API_BASE, "/api/health"),
        requestJson(API_BASE, "/api/dashboard"),
        requestJson(API_BASE, "/api/wellness"),
        requestJson(API_BASE, "/api/vitals"),
        requestJson(API_BASE, "/api/symptoms"),
      ]);
      setDashboard(summary || emptyDashboard);
      setWellnessLogs(Array.isArray(wellness) ? wellness : []);
      setVitalLogs(Array.isArray(vitals) ? vitals : []);
      setSymptomCatalog(Array.isArray(symptoms) ? symptoms : []);
      setStatus(health ? "online" : "offline");
      setError("");
    } catch (requestError) {
      setStatus("offline");
      setError(`Backend unavailable: ${requestError.message}`);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submitRegistration(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await requestJson(API_BASE, "/api/users", {
        method: "POST",
        body: JSON.stringify(registration),
      });
      const id = String(user.id);
      localStorage.setItem("sanjeevani.userId", id);
      setUserId(id);
      setNotice(`Profile ready for ${user.name}.`);
      await refresh();
    } catch (requestError) {
      setError(`Could not create profile: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitWellness(event) {
    event.preventDefault();
    if (!userId) return setError("Create a profile before saving a log.");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setError("");
    try {
      await requestJson(API_BASE, "/api/wellness", {
        method: "POST",
        body: JSON.stringify({
          user: { id: Number(userId) },
          logDate: values.logDate,
          sleepHours: numericOrNull(values.sleepHours),
          waterLiters: numericOrNull(values.waterLiters),
          moodScore: numericOrNull(values.moodScore),
          stressScore: numericOrNull(values.stressScore),
          activityMinutes: numericOrNull(values.activityMinutes),
          notes: values.notes,
        }),
      });
      form.reset();
      setNotice("Wellness log saved.");
      await refresh();
    } catch (requestError) {
      setError(`Could not save wellness log: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitVitals(event) {
    event.preventDefault();
    if (!userId) return setError("Create a profile before saving a log.");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setError("");
    try {
      await requestJson(API_BASE, "/api/vitals", {
        method: "POST",
        body: JSON.stringify({
          user: { id: Number(userId) },
          recordedAt: new Date().toISOString(),
          temperature: numericOrNull(values.temperature),
          heartRate: numericOrNull(values.heartRate),
          weight: numericOrNull(values.weight),
        }),
      });
      form.reset();
      setNotice("Vitals saved.");
      await refresh();
    } catch (requestError) {
      setError(`Could not save vitals: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitSymptom(event) {
    event.preventDefault();
    if (!userId) return setError("Create a profile before saving a log.");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const name = symptomName.trim();
    if (!name) return setError("Enter a symptom to continue.");
    setBusy(true);
    setError("");
    try {
      let symptom = symptomCatalog.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (!symptom) {
        symptom = await requestJson(API_BASE, "/api/symptoms", {
          method: "POST",
          body: JSON.stringify({ name, description: "" }),
        });
      }
      await requestJson(API_BASE, "/api/symptom-logs", {
        method: "POST",
        body: JSON.stringify({
          user: { id: Number(userId) },
          symptom: { id: symptom.id },
          severity: Number(values.severity),
          startedAt: new Date().toISOString(),
          endedAt: null,
          notes: values.notes,
        }),
      });
      form.reset();
      setSymptomName("");
      setNotice("Symptom log saved.");
      await refresh();
    } catch (requestError) {
      setError(`Could not save symptom log: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function runAnalysis(event) {
    event.preventDefault();
    const symptoms = analysisInput.split(",").map((value) => value.trim()).filter(Boolean);
    if (!symptoms.length) return setError("Enter one or more comma-separated symptoms.");
    setBusy(true);
    setError("");
    setAnalysis(null);
    try {
      const result = await requestJson(ML_BASE, "/predict", {
        method: "POST",
        body: JSON.stringify({ symptoms }),
      });
      setAnalysis(result);
    } catch (requestError) {
      setError(`Pattern service unavailable: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }

  const orderedWellness = [...wellnessLogs]
    .filter((log) => log.logDate)
    .sort((left, right) => new Date(left.logDate) - new Date(right.logDate))
    .slice(-7);
  const tabs = [
    ["overview", "Overview", Activity],
    ["wellness", "Wellness", Moon],
    ["vitals", "Vitals", HeartPulse],
    ["symptoms", "Symptoms", Plus],
    ["analysis", "AI patterns", Brain],
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => setSection("overview")} aria-label="Sanjeevani overview">
          <span className="brand-mark"><HeartPulse size={21} strokeWidth={2.3} /></span>
          <span><strong>Sanjeevani</strong><small>PERSONAL HEALTH JOURNAL</small></span>
        </a>
        <div className="topbar-right">
          <span className={`connection ${status}`}><span />{status === "online" ? "Backend connected" : status === "checking" ? "Connecting" : "Backend offline"}</span>
          {userId && <span className="profile-pill"><CircleUserRound size={16} /> Profile #{userId}</span>}
        </div>
      </header>

      <main id="top" className="page-wrap">
        <section className="intro-row">
          <div>
            <p className="eyebrow">YOUR WELLNESS, IN CONTEXT</p>
            <h1>Notice your patterns.<br /><span>Care for your whole self.</span></h1>
            <p className="intro-copy">AI-assisted health logging and pattern analysis, built around your everyday wellbeing.</p>
          </div>
          <aside className="disclaimer"><ShieldAlert size={18} /><span>For personal tracking only. Not a diagnosis or medical advice.</span></aside>
        </section>

        {error && <div className="message error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss">×</button></div>}
        {notice && <div className="message success" role="status"><Check size={16} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

        {!userId && (
          <section className="profile-setup panel">
            <div className="section-title"><div><p className="eyebrow">GET STARTED</p><h2>Create your personal profile</h2></div><CircleUserRound size={25} /></div>
            <form className="registration-grid" onSubmit={submitRegistration}>
              <label>Name<input name="name" autoComplete="name" value={registration.name} onChange={(event) => setRegistration({ ...registration, name: event.target.value })} required /></label>
              <label>Email<input name="email" type="email" autoComplete="email" value={registration.email} onChange={(event) => setRegistration({ ...registration, email: event.target.value })} required /></label>
              <label>Password<input name="password" type="password" minLength="6" autoComplete="new-password" value={registration.password} onChange={(event) => setRegistration({ ...registration, password: event.target.value })} required /></label>
              <button className="button primary registration-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}Create profile</button>
            </form>
            <p className="fine-print">Your profile ID is kept in this browser for logging. This demo does not use sign-in.</p>
          </section>
        )}

        <nav className="tabs" aria-label="Health journal sections">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} className={section === id ? "tab active" : "tab"} onClick={() => { setSection(id); setNotice(""); setError(""); }}>
              <Icon size={17} strokeWidth={1.9} />{label}
            </button>
          ))}
          <button className="refresh-button" onClick={() => void refresh()} title="Refresh dashboard" aria-label="Refresh dashboard"><ArrowUpRight size={17} /></button>
        </nav>

        {section === "overview" && (
          <section className="content-section">
            <div className="section-heading"><div><p className="eyebrow">AT A GLANCE</p><h2>Your recent health journal</h2></div><span className="updated"><Clock3 size={14} />Updated just now</span></div>
            <div className="stats-grid">
              <SummaryCard icon={Moon} label="Wellness entries" value={dashboard.totalWellnessLogs} tone="sage" detail="Daily rhythms" />
              <SummaryCard icon={HeartPulse} label="Vital readings" value={dashboard.totalVitalLogs} tone="blue" detail="Personal measurements" />
              <SummaryCard icon={Activity} label="Symptom logs" value={dashboard.totalSymptomLogs} tone="coral" detail="Patterns over time" />
            </div>
            <div className="overview-grid">
              <section className="panel trend-panel">
                <div className="section-title"><div><p className="eyebrow">REST & RECOVERY</p><h3>Sleep, logged</h3></div><span className="unit-tag">HOURS</span></div>
                {orderedWellness.length ? (
                  <div className="sleep-chart" aria-label="Sleep hours over recent wellness entries">
                    {orderedWellness.map((log) => <div className="sleep-column" key={log.id ?? log.logDate}><span>{log.sleepHours ?? "-"}</span><div className="sleep-track"><i style={{ height: `${Math.min(100, Math.max(5, (Number(log.sleepHours) || 0) / 12 * 100))}%` }} /></div><small>{formatDate(log.logDate)}</small></div>)}
                  </div>
                ) : <EmptyState text="Your sleep trend will appear after your first wellness entry." />}
              </section>
              <section className="panel latest-panel">
                <div className="section-title"><div><p className="eyebrow">LATEST ENTRIES</p><h3>Recent check-ins</h3></div><Clock3 size={19} /></div>
                <LatestRow icon={Moon} label="Wellness" value={dashboard.latestWellnessLog ? `${dashboard.latestWellnessLog.sleepHours ?? "—"}h sleep · ${dashboard.latestWellnessLog.waterLiters ?? "—"}L water` : "No wellness entry yet"} date={formatDate(dashboard.latestWellnessLog?.logDate)} />
                <LatestRow icon={Thermometer} label="Vitals" value={dashboard.latestVitalLog ? `${dashboard.latestVitalLog.heartRate ?? "—"} bpm · ${dashboard.latestVitalLog.temperature ?? "—"}°` : "No vital reading yet"} date={formatDate(dashboard.latestVitalLog?.recordedAt)} />
                <LatestRow icon={Activity} label="Symptom" value={dashboard.latestSymptomLog?.symptom?.name || "No symptom entry yet"} date={formatDate(dashboard.latestSymptomLog?.startedAt)} />
              </section>
            </div>
            <p className="data-note">Journal totals include records currently stored by this demo backend.</p>
          </section>
        )}

        {section === "wellness" && (
          <section className="content-section form-layout">
            <SectionHeading eyebrow="DAILY CHECK-IN" title="Log wellness" copy="Small observations can add up to useful personal context." />
            <form className="panel entry-form" onSubmit={submitWellness}>
              <label>Log date<input name="logDate" type="date" defaultValue={today} required /></label>
              <div className="field-grid">
                <label><span>Sleep <small>hours</small></span><input name="sleepHours" type="number" min="0" max="24" step="0.25" placeholder="7.5" /></label>
                <label><span>Water <small>liters</small></span><input name="waterLiters" type="number" min="0" step="0.1" placeholder="2.0" /></label>
                <label><span>Mood <small>1–10</small></span><input name="moodScore" type="number" min="1" max="10" placeholder="7" /></label>
                <label><span>Stress <small>1–10</small></span><input name="stressScore" type="number" min="1" max="10" placeholder="3" /></label>
                <label><span>Activity <small>minutes</small></span><input name="activityMinutes" type="number" min="0" placeholder="30" /></label>
              </div>
              <label>Notes<textarea name="notes" rows="3" placeholder="Anything you noticed today?" /></label>
              <button className="button primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}Save wellness log</button>
            </form>
          </section>
        )}

        {section === "vitals" && (
          <section className="content-section form-layout">
            <SectionHeading eyebrow="PERSONAL MEASUREMENTS" title="Log vitals" copy="Record readings to keep your own timeline in one place." />
            <form className="panel entry-form" onSubmit={submitVitals}>
              <div className="field-grid">
                <label><span>Temperature <small>°C</small></span><input name="temperature" type="number" min="25" max="45" step="0.1" placeholder="36.7" /></label>
                <label><span>Heart rate <small>bpm</small></span><input name="heartRate" type="number" min="20" max="250" placeholder="72" /></label>
                <label><span>Weight <small>kg</small></span><input name="weight" type="number" min="1" max="500" step="0.1" placeholder="68.5" /></label>
              </div>
              <button className="button primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}Save vital reading</button>
            </form>
            <section className="panel history-panel"><div className="section-title"><div><p className="eyebrow">YOUR JOURNAL</p><h3>Recent readings</h3></div></div>
              {vitalLogs.slice(-5).reverse().map((vital) => <LatestRow key={vital.id} icon={Thermometer} label={formatDate(vital.recordedAt)} value={`${vital.heartRate ?? "—"} bpm · ${vital.temperature ?? "—"}°C · ${vital.weight ?? "—"} kg`} date="" />)}
              {!vitalLogs.length && <EmptyState text="No vital readings saved yet." />}
            </section>
          </section>
        )}

        {section === "symptoms" && (
          <section className="content-section form-layout">
            <SectionHeading eyebrow="NOTICE & RECORD" title="Log a symptom" copy="A record is a personal observation, not a diagnosis." />
            <form className="panel entry-form" onSubmit={submitSymptom}>
              <label>Symptom<input list="known-symptoms" value={symptomName} onChange={(event) => setSymptomName(event.target.value)} placeholder="e.g. headache" required /><datalist id="known-symptoms">{symptomCatalog.map((symptom) => <option key={symptom.id} value={symptom.name} />)}</datalist></label>
              <label><span>Severity <small>1–10</small></span><input name="severity" type="number" min="1" max="10" defaultValue="3" required /></label>
              <label>Notes<textarea name="notes" rows="3" placeholder="When did you notice it? Anything else to record?" /></label>
              <button className="button primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}Save symptom log</button>
            </form>
            <div className="panel responsible-note"><ShieldAlert size={20} /><p><strong>Personal tracking only.</strong> Sanjeevani does not diagnose conditions or replace qualified healthcare advice.</p></div>
          </section>
        )}

        {section === "analysis" && (
          <section className="content-section form-layout">
            <SectionHeading eyebrow="DATASET-BASED MODEL" title="Explore a symptom pattern" copy="The model compares entered features with patterns in its training dataset." />
            <form className="panel entry-form analysis-form" onSubmit={runAnalysis}>
              <div className="model-label"><span className="model-icon"><Brain size={20} /></span><span><strong>Logistic Regression</strong><small>Model version logistic-v1</small></span></div>
              <label>Symptoms, separated by commas<textarea rows="3" value={analysisInput} onChange={(event) => setAnalysisInput(event.target.value)} placeholder="headache, fatigue, nausea" /></label>
              <button className="button primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Analyze pattern</button>
              {analysis && <div className="analysis-result" role="status">
                <span className="eyebrow">PATTERN CLASSIFICATION · NOT A DIAGNOSIS</span>
                <strong>{analysis.prediction || "No matching features"}</strong>
                {analysis.confidence != null && <span>Model confidence: {Math.round(analysis.confidence * 100)}%</span>}
                <small>{analysis.message}</small>
                {analysis.unknown_symptoms?.length > 0 && <small>Unrecognized features ignored: {analysis.unknown_symptoms.join(", ")}</small>}
              </div>}
            </form>
            <div className="panel responsible-note"><ShieldAlert size={20} /><p><strong>Responsible AI.</strong> This is dataset-based pattern classification. Confidence is not medical certainty. Do not use results for diagnosis or treatment decisions; consult a qualified healthcare professional for medical concerns.</p></div>
          </section>
        )}

        <footer className="footer"><span>Sanjeevani <span aria-hidden="true">·</span> Portfolio MVP</span><span>Health patterns, not diagnoses.</span></footer>
      </main>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone, detail }) {
  return <article className={`summary-card ${tone}`}><span className="summary-icon"><Icon size={18} /></span><span className="summary-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function LatestRow({ icon: Icon, label, value, date }) {
  return <div className="latest-row"><span className="latest-icon"><Icon size={17} /></span><div><small>{label}</small><strong>{value}</strong></div>{date && <time>{date}</time>}</div>;
}

function EmptyState({ text }) {
  return <div className="empty-state"><span><Activity size={19} /></span><p>{text}</p></div>;
}

function SectionHeading({ eyebrow, title, copy }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="section-copy">{copy}</p></div></div>;
}

export default App;