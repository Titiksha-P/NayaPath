import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Download, ShieldCheck, Sparkles } from "lucide-react";
import type { Opportunity, Profile } from "./livelihoodEngine";

type Props = { profile: Profile; options: Opportunity[] };
type Evidence = { completed: boolean; photos: string; reflection: string; improved: string; interest: string };

function chooseExperiment(profile: Profile) {
  const hasPhone = profile.device === "smartphone" || profile.device === "computer";
  const hasTime = profile.hoursPerDay !== null && profile.hoursPerDay <= 10;
  const rested = profile.energy !== "exhausted";
  if (hasPhone && hasTime && rested && (profile.budget === null || profile.budget === 0)) {
    return {
      title: "Test whether product photography is worth exploring",
      subtitle: "A small experiment, not a promise of income.",
      task: "Choose three objects you own or have permission to photograph. Use your phone, daylight and a plain background. Take one clear photo of each. Do not photograph customers, private documents, people or employer property without permission.",
      time: "30–45 minutes",
      cost: "₹0 — use your existing phone and natural light",
      learn: ["Can you make the subject clear and well-lit?", "Can you follow a simple visual brief?", "Do you enjoy the process?", "Can you improve one photo after reviewing it?"],
      measure: "Three clear photos, plus one revised photo and a short reflection.",
      risk: ["No payment or purchase required", "Does not require leaving your current work", "Use only your own objects or get permission", "Stop at any time; no client work or income claim"],
      uncertainty: "We have not established whether nearby businesses need this service or would pay for it."
    };
  }
  return {
    title: "Test one useful skill you already have",
    subtitle: "A low-commitment exploration, not a promise of income.",
    task: "Choose one task you already know how to do that can be practised safely at home or during genuinely free time. Make a small example using materials you already have. Do not use employer time, tools, customer information or someone else's property without permission.",
    time: profile.hoursPerDay !== null && profile.hoursPerDay <= 8 ? "20–30 minutes" : "10–15 minutes, only when rested",
    cost: "₹0 — use what you already have",
    learn: ["Can you complete the task safely?", "Which part is easiest or hardest?", "Would you like to practise it again?", "What feedback would help you improve?"],
    measure: "One small example, a note about what you learned and one possible improvement.",
    risk: ["No payment or purchase required", "Does not require leaving your current work", "Use only tools and materials you already own", "Stop at any time; no income is promised"],
    uncertainty: "We have not verified demand, required qualifications or whether this activity could become paid work."
  };
}

export default function ExperimentJourney({ profile, options }: Props) {
  const experiment = useMemo(() => chooseExperiment(profile), [profile.device, profile.hoursPerDay, profile.energy, profile.budget]);
  const [started, setStarted] = useState(false);
  const [evidence, setEvidence] = useState<Evidence>({ completed: false, photos: "", reflection: "", improved: "", interest: "" });
  const [reflection, setReflection] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [correction, setCorrection] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionSaved, setCorrectionSaved] = useState(false);
  const candidates = options.slice(0, 3);
  const first = candidates[0];
  const second = candidates[1];
  const update = (key: keyof Evidence, value: string | boolean) => setEvidence(old => ({ ...old, [key]: value }));
  const next = evidence.completed && evidence.reflection.trim().length > 10
    ? "Review your result, choose one improvement and repeat the experiment once before considering any paid training or work."
    : "Finish the small task and record what happened. If it did not fit your life, stop or choose a different direction.";
  const savePrint = () => window.print();

  return <section className="experiment-section" id="try-before-trust">
    <div className="experiment-heading"><span>FROM RECOMMENDATION TO REAL-WORLD EVIDENCE</span><h2>Try before <i>you trust.</i></h2><p>NayaPath turns a possible pathway into a small, reversible test. Completing it—not earning money—is the first measure of progress.</p></div>
    <div className="experiment-grid">
      <article className="experiment-card experiment-main">
        <div className="experiment-kicker"><Sparkles size={17}/> YOUR FIRST SMALL EXPERIMENT</div>
        <h3>{experiment.title}</h3><p>{experiment.subtitle}</p>
        <div className="experiment-stats"><span><Clock3/> {experiment.time}</span><span>₹ {experiment.cost.replace(/^₹\s*/, "")}</span></div>
        <h4>Your mission</h4><p>{experiment.task}</p>
        <h4>What you will learn</h4><ul>{experiment.learn.map(x=><li key={x}>{x}</li>)}</ul>
        <div className="experiment-measure"><b>Evidence to look for</b><p>{experiment.measure}</p></div>
        <button className="experiment-primary" onClick={()=>setStarted(true)}>{started?"Experiment started":"Start this experiment"}</button>
        {started && <p className="experiment-note">Your experiment is self-paced. You can stop, pause or change direction without penalty.</p>}
      </article>
      <aside className="experiment-card risk-card">
        <div className="experiment-kicker"><ShieldCheck size={17}/> BEFORE YOU BEGIN · RISK CHECK</div>
        {experiment.risk.map(item=><div className="risk-row" key={item}><CheckCircle2 size={17}/><span>{item}</span></div>)}
        <div className="risk-caution"><b>Check before any next step</b><p>{profile.contract === "allowed" ? "You indicated no known outside-work restriction. Recheck the actual policy before accepting paid work." : profile.contract === "approval" ? "Written approval is required according to your answer. This experiment is personal practice only; do not offer paid services before approval." : profile.contract === "restricted" ? "Your outside-work policy may restrict paid activity. Do not turn this experiment into outside employment." : "Your outside-work policy is unknown. Keep this to personal practice; check your contract before any commercial activity."}</p><p>{experiment.uncertainty}</p></div>
        <small>This is a rule-based screening checklist, not legal, employment or safety certification.</small>
      </aside>
    </div>

    <div className="experiment-card reasoning-card">
      <div className="experiment-kicker">WHY THIS PATHWAY · TRANSPARENT RULES</div>
      <h3>Why NayaPath suggested this</h3>
      <div className="reason-grid">
        <div><b>Time</b><p>{profile.hoursPerDay === null ? "Your available time is not yet known; this task is deliberately short and optional." : profile.hoursPerDay <= 10 ? "A short task can be attempted outside work, only if you have genuine free time and feel rested." : "Your workday is long. This is reduced to a short optional task; rest takes priority."}</p></div>
        <div><b>Tools and cost</b><p>{profile.device === "smartphone" || profile.device === "computer" ? "Your profile indicates access to a digital device; no new equipment or paid tool is required." : "Your profile does not confirm suitable digital access, so the task uses an existing skill and offline materials."}</p></div>
        <div><b>Risk</b><p>It is private practice, reversible, and does not require quitting, spending, taking a loan or accepting client work.</p></div>
        <div><b>What we don't know</b><p>{experiment.uncertainty}</p></div>
      </div>
      <h4>Other pathways considered</h4>
      <div className="pathway-compare">
        <div><b>{first?.title || "Current-field progression"}</b><span>{first?.status === "fit" ? "Potential fit" : first?.status === "avoid" ? "Not suitable now" : "Check first"}</span><p>{first?.why || "Could be explored after profile details are clearer."}</p><small>Main uncertainty: {first?.checks?.[0] || "Actual requirements and availability need verification."}</small></div>
        <div><b>{second?.title || "Explore an adjacent skill"}</b><span>{second?.status === "fit" ? "Potential fit" : second?.status === "avoid" ? "Not suitable now" : "Check first"}</span><p>{second?.why || "A second route needs more information before it can be compared."}</p><small>Main uncertainty: {second?.checks?.[0] || "Actual requirements and availability need verification."}</small></div>
      </div>
      <p className="rule-note">No percentage fit scores are used. Labels come from the existing rule-based livelihood engine; this experiment is a separate low-cost test, not a prediction of income or demand.</p>
    </div>

    <div className="experiment-card evidence-card">
      <div className="experiment-kicker">AFTER THE EXPERIMENT</div>
      <h3>Turn the attempt into evidence</h3>
      <p>Tell NayaPath what happened. A completed task is useful evidence even if you decide this pathway is not for you.</p>
      <label className="evidence-check"><input type="checkbox" checked={evidence.completed} onChange={e=>update("completed",e.target.checked)}/> I attempted or completed the task</label>
      <label>What did you make or try?<textarea value={evidence.photos} onChange={e=>update("photos",e.target.value)} placeholder="e.g. I took three photos of objects at home…"/></label>
      <label>What did you learn? (required for next-step guidance)<textarea value={evidence.reflection} onChange={e=>update("reflection",e.target.value)} placeholder="What went well? What was difficult? Be honest."/></label>
      <label>What would you improve next time?<textarea value={evidence.improved} onChange={e=>update("improved",e.target.value)} placeholder="e.g. Better lighting, steadier framing…"/></label>
      <label>How did the task feel?<select value={evidence.interest} onChange={e=>update("interest",e.target.value)}><option value="">Choose if you wish</option><option value="enjoyed">I enjoyed it</option><option value="mixed">Some parts were interesting</option><option value="disliked">I did not enjoy it</option><option value="unsure">I am unsure</option></select></label>
      <div className="next-guidance"><b>Your next step</b><p>{next}</p><small>{evidence.completed && evidence.reflection.trim().length > 10 ? "Based on your completion and reflection. This is a suggested learning step, not a job or income forecast." : "Complete the reflection to unlock a more useful next-step suggestion."}</small></div>
      <button className="experiment-primary" onClick={()=>setConfirmed(true)} disabled={!evidence.completed || evidence.reflection.trim().length <= 10}>Create my exploration record</button>
      {confirmed && <div className="proof-card" id="proof-of-progress">
        <div className="proof-brand">NayaPath · EXPLORATION RECORD <span>PROTOTYPE · NOT A CERTIFICATE</span></div>
        <h3>Skill Evidence Card</h3><h4>{experiment.title.replace("Test whether ","").replace(" is worth exploring","")}</h4>
        <div className="proof-status">✓ EXPERIMENT ATTEMPTED</div>
        <p><b>What I tried</b><br/>{evidence.photos || "Task attempted; details not supplied."}</p>
        <p><b>What I learned</b><br/>{evidence.reflection}</p>
        <p><b>What I would improve</b><br/>{evidence.improved || "Not recorded"}</p>
        <p><b>Next step</b><br/>{next}</p>
        <small>This record documents self-reported exploration only. It does not verify professional competence, qualifications, customer demand or income.</small>
        <button className="experiment-primary no-print" onClick={savePrint}><Download size={16}/> Print / Save as PDF</button>
      </div>}
    </div>
  </section>;
}
