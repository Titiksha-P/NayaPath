import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Download, ShieldCheck, Sparkles } from "lucide-react";
import type { Opportunity, Profile } from "./livelihoodEngine";

type Props = { profile: Profile; options: Opportunity[] };
type Evidence = { completed: boolean; tried: string; reflection: string; improved: string; interest: string };
type Experiment = { title: string; task: string; learn: string[]; measure: string; digital: boolean };

function chooseExperiment(p: Profile): Experiment {
  const t = (p.occupation + " " + p.skills).toLowerCase();
  const digital = p.device === "smartphone" || p.device === "computer";
  if (p.energy === "low" || p.energy === "exhausted") return { title: "Rest before taking on another task", task: "No work task is recommended while your energy is low. Rest first, then regenerate your opportunity map when you feel ready.", learn: ["Notice what helps you recover", "Do not treat exhaustion as spare capacity"], measure: "No task is required today.", digital: false };
  if (/tailor|sew|stitch/.test(t)) return { title: "Practise one simple stitching seam", task: "Use a scrap of your own material and your own tools to practise one seam. Do not use customer garments or employer equipment.", learn: ["Can you keep the seam even?", "Which step needs practice?"], measure: "One small seam sample.", digital: false };
  if (/cook|bake/.test(t)) return { title: "Plan a familiar recipe without buying anything", task: "Plan the ingredients and steps for one familiar recipe using only what is already at home. Do not prepare food for sale as part of this exercise.", learn: ["Are the steps clear?", "What food-safety step matters?"], measure: "A simple ingredient and step list.", digital: false };
  if (/farm|agri/.test(t)) return { title: "Observe a plant or crop", task: "Observe a plant you have permission to inspect and note three visible details. Do not handle chemicals, tools or unfamiliar equipment.", learn: ["What changes did you notice?", "What would you ask an experienced grower?"], measure: "Three observations.", digital: false };
  if (/electric|plumb|mason|construction|carpenter|repair/.test(t)) return { title: "Map the safe steps of a practical task", task: "Write down the steps and training needed for one familiar task. Do not handle live systems, structural work, hazardous tools or perform work requiring supervision.", learn: ["What can be done safely?", "What requires qualified supervision?"], measure: "A safe step list and one question for a qualified person.", digital: false };
  if (/teach|teacher|tutor|care|child|elder/.test(t)) return { title: "Practise explaining something you know", task: "Explain a simple, non-sensitive topic in three steps to yourself or a willing person. Do not use private information about anyone in your care.", learn: ["Was it understandable?", "Which step needs a clearer example?"], measure: "A three-step explanation.", digital: false };
  if (/driver|delivery|transport/.test(t)) return { title: "Plan a familiar route while off duty", task: "While safely off duty, list a familiar route and two possible delays. Never use a phone while driving or disclose passenger/customer information.", learn: ["Did you identify realistic delays?", "What would improve the plan?"], measure: "One route plan.", digital: false };
  if (/sales|shop|retail|customer|cashier/.test(t)) return { title: "Practise a fictional customer explanation", task: "Write three sentences explaining a fictional product or service. Do not contact customers or use employer/customer data.", learn: ["Was it clear and accurate?", "Did it avoid pressure or unsupported claims?"], measure: "One short fictional explanation.", digital: false };
  if (digital && /computer|digital|phone|design|writing|excel|office|online|data/.test(t)) return { title: "Create a tiny digital sample", task: "Use your own device and a free tool already available to create a one-page sample with fictional information. Do not upload private data or buy software.", learn: ["Can you complete the basic task?", "What would improve clarity or accuracy?"], measure: "One small sample using fictional data.", digital: true };
  if (digital && (p.budget === null || p.budget === 0)) return { title: "Test basic product photography", task: "Photograph three objects you own or have permission to photograph, using daylight and a plain background. Do not photograph people, private documents, customers or employer property.", learn: ["Is the subject clear and well-lit?", "Can you improve one photo?", "Did you enjoy the process?"], measure: "Three clear photos and one revised photo.", digital: true };
  return { title: "Make a small example of an existing skill", task: "Choose one practical skill you already have and describe or demonstrate a tiny safe example using only your own materials. Do not spend money, use employer resources or perform hazardous work.", learn: ["What could you do independently?", "What would require guidance?"], measure: "One small example and a short reflection.", digital: false };
}

export default function ExperimentJourney({ profile, options }: Props) {
  const experiment = useMemo(() => chooseExperiment(profile), [profile.occupation, profile.skills, profile.device, profile.energy, profile.budget]);
  const [started, setStarted] = useState(false);
  const [ack, setAck] = useState(false);
  const [evidence, setEvidence] = useState<Evidence>({ completed: false, tried: "", reflection: "", improved: "", interest: "" });
  const [confirmed, setConfirmed] = useState(false);
  const update = (key: keyof Evidence, value: string | boolean) => setEvidence(old => ({ ...old, [key]: value }));
  const longHours = profile.hoursPerDay !== null && profile.hoursPerDay >= 10;
  const noDaysOff = profile.daysOff === 0;
  const tired = profile.energy === "low" || profile.energy === "exhausted";
  const blocked = tired || longHours || noDaysOff || (experiment.digital && (profile.device === "none" || profile.device === "limited"));
  const reasons = [
    ...(tired ? ["Your energy is low or exhausted. Rest first; starting is disabled."] : []),
    ...(longHours ? ["You reported at least 10 work hours a day. The system will not add another task."] : []),
    ...(noDaysOff ? ["You reported no days off. The system will not add another task."] : []),
    ...(experiment.digital && (profile.device === "none" || profile.device === "limited") ? ["Required digital access is unavailable; choose an offline pathway."] : [])
  ];
  const contractNote = profile.contract === "allowed" ? "You reported outside work is allowed, but this exercise is still private practice only." : profile.contract === "approval" ? "You reported approval is required. No paid work, client contact or commercial activity is permitted by this exercise." : profile.contract === "restricted" ? "You reported outside-work restrictions. This is private, non-commercial practice only; if your policy also restricts this, do not start." : "Outside-work rules are unknown. Keep this strictly private and non-commercial; clarify the policy before any outside activity.";
  const ranked = [...options].sort((a,b) => (a.status === "avoid" ? 1 : 0) - (b.status === "avoid" ? 1 : 0) || b.score-a.score);
  const first = ranked[0], second = ranked.find(o => o.pathway !== first?.pathway) || ranked.find(o => o.id !== first?.id);
  const why = (o?: Opportunity) => {
    if (!o) return "No second alternative is available under the current goal.";
    const r = [];
    if (o.status === "avoid") r.push("Screened out by one or more constraints.");
    if (tired) r.push("Low energy makes extra workload unsuitable.");
    if (longHours) r.push("Long work hours limit available capacity.");
    if (noDaysOff) r.push("No recovery day was reported.");
    if (profile.contract !== "allowed" && o.pathway === "independent-livelihood") r.push("Outside-work permission is not established.");
    if ((profile.device === "none" || profile.device === "limited") && /digital/i.test(o.title)) r.push("Reliable digital access is not confirmed.");
    return r.length ? r.join(" ") : "No hard conflict was identified by the current rules; verify the checks before proceeding.";
  };
  const next = evidence.completed && evidence.reflection.trim().length > 10 ? "Review what happened and repeat only if it still fits your time, energy and permissions." : "Record what happened. If it did not fit your life, stop or choose another direction.";
  return <section className="experiment-section" id="try-before-trust">
    <div className="experiment-heading"><span>FROM RECOMMENDATION TO REAL-WORLD EVIDENCE</span><h2>Try before <i>you trust.</i></h2><p>A small practice task selected from your profile and screened before it can begin.</p></div>
    <div className="experiment-grid">
      <article className="experiment-card experiment-main">
        <div className="experiment-kicker"><Sparkles size={17}/> PROFILE-MATCHED EXPERIMENT</div>
        <h3>{experiment.title}</h3><p>A private, no-spend practice task—not a promise of income.</p>
        <div className="experiment-stats"><span><Clock3/> 10–15 minutes, only when genuinely free and rested</span><span>₹0 · No purchases</span></div>
        <h4>Your mission</h4><p>{experiment.task}</p>
        <h4>What you will learn</h4><ul>{experiment.learn.map(x=><li key={x}>{x}</li>)}</ul>
        <div className="experiment-measure"><b>Evidence to look for</b><p>{experiment.measure}</p></div>
        {blocked && <div className="risk-caution" role="alert"><b>Experiment blocked for now</b>{reasons.map(x=><p key={x}>{x}</p>)}<p>Rest or update your circumstances, then regenerate the map.</p></div>}
        {!blocked && <label className="evidence-check"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/> I confirm this is private practice, I have permission to use the materials, I will not spend money or contact clients, and I will stop if it feels unsafe or tiring.</label>}
        <button className="experiment-primary" disabled={blocked || !ack} onClick={()=>setStarted(true)}>{started ? "Experiment started" : blocked ? "Cannot start under current constraints" : !ack ? "Confirm safety check to start" : "Start this experiment"}</button>
        {started && <p className="experiment-note">Private practice only. This does not authorise outside employment or paid work.</p>}
      </article>
      <aside className="experiment-card risk-card">
        <div className="experiment-kicker"><ShieldCheck size={17}/> ENFORCED RISK SCREEN</div>
        {reasons.length ? reasons.map(x=><div className="risk-row" key={x}><ShieldCheck size={17}/><span>{x}</span></div>) : <div className="risk-row"><CheckCircle2 size={17}/><span>No automatic stop condition detected. Your safety confirmation is still required.</span></div>}
        <div className="risk-caution"><b>Contract and permission check</b><p>{contractNote}</p><p>No spending, borrowing, customer work or paid activity is allowed in this experiment. Unknown conditions are not treated as permission.</p></div>
        <small>Rule-based guardrails, not legal, employment or safety certification.</small>
      </aside>
    </div>
    <div className="experiment-card reasoning-card">
      <div className="experiment-kicker">WHY THIS PATHWAY · PROFILE CONSTRAINTS</div><h3>Why NayaPath suggested this</h3>
      <div className="reason-grid">
        <div><b>Occupation and skills</b><p>{profile.occupation || "Not provided"} · {profile.skills || "No specific skills provided"}. The task uses the closest supported skill category; otherwise it falls back to a generic safe practice task.</p></div>
        <div><b>Time and recovery</b><p>{profile.hoursPerDay === null ? "Work hours unknown; no spare time assumed." : "Reported work hours: " + profile.hoursPerDay + " per day; these are not treated as free time."} {profile.daysOff === null ? "Days off unknown." : "Days off reported: " + profile.daysOff + "."} {blocked ? "A current constraint blocks starting." : "Start only when genuinely free and rested."}</p></div>
        <div><b>Tools and cost</b><p>{experiment.digital ? "Your profile indicates digital-device access." : "The task does not require a digital device."} No spending is required or allowed.</p></div>
        <div><b>Contract and risk</b><p>{contractNote} {blocked ? "The start control is disabled by a safety rule." : "An explicit safety acknowledgement is required."}</p></div>
      </div>
      <h4>Pathways compared under your constraints</h4>
      <div className="pathway-compare">
        {[first, second].filter(Boolean).map(o=><div key={o!.id}><b>{o!.title}</b><span>{o!.status === "fit" ? "Potential fit" : o!.status === "avoid" ? "Not suitable now" : "Check first"}</span><p>{o!.why}</p><small>{why(o)} Main check: {o!.checks[0] || "Verify requirements before proceeding."}</small></div>)}
        {!first && <div><b>No pathway cleared</b><span>More information needed</span><p>The current profile does not support a comparison yet.</p></div>}
      </div>
      <p className="rule-note">Alternatives are ranked by the existing rule-based engine. Constraint explanations are generated from your profile; no income or fit percentages are invented.</p>
    </div>
    <div className="experiment-card evidence-card">
      <div className="experiment-kicker">AFTER THE EXPERIMENT</div><h3>Turn the attempt into evidence</h3><p>This dated record is self-reported, not a certificate or independent assessment.</p>
      <label className="evidence-check"><input type="checkbox" checked={evidence.completed} onChange={e=>update("completed",e.target.checked)}/> I attempted or completed the task</label>
      <label>What did you make or try?<textarea value={evidence.tried} onChange={e=>update("tried",e.target.value)} placeholder="Describe what you tried…"/></label>
      <label>What did you learn? (required)<textarea value={evidence.reflection} onChange={e=>update("reflection",e.target.value)} placeholder="What went well? What was difficult?"/></label>
      <label>What would you improve?<textarea value={evidence.improved} onChange={e=>update("improved",e.target.value)} placeholder="One possible improvement…"/></label>
      <label>How did it feel?<select value={evidence.interest} onChange={e=>update("interest",e.target.value)}><option value="">Choose if you wish</option><option value="enjoyed">I enjoyed it</option><option value="mixed">Some parts were interesting</option><option value="disliked">I did not enjoy it</option><option value="unsure">I am unsure</option></select></label>
      <div className="next-guidance"><b>Your next step</b><p>{next}</p></div>
      <button className="experiment-primary" onClick={()=>setConfirmed(true)} disabled={!evidence.completed || evidence.reflection.trim().length <= 10}>Create my exploration record</button>
      {confirmed && <div className="proof-card" id="proof-of-progress">
        <div className="proof-brand">NayaPath · EXPLORATION RECORD <span>SELF-REPORTED · NOT A CERTIFICATE</span></div><h3>Skill Evidence Card</h3><h4>{experiment.title}</h4><div className="proof-status">✓ EXPERIMENT ATTEMPTED</div>
        <p><b>Date recorded</b><br/>{new Date().toLocaleDateString("en-IN", {day:"2-digit",month:"long",year:"numeric"})}</p>
        <p><b>What I tried</b><br/>{evidence.tried || "Task attempted; details not supplied."}</p><p><b>What I learned</b><br/>{evidence.reflection}</p><p><b>What I would improve</b><br/>{evidence.improved || "Not recorded"}</p><p><b>Interest</b><br/>{evidence.interest || "Not recorded"}</p><p><b>Next step</b><br/>{next}</p>
        <small>This record is self-reported and not independently verified. It is not stored in an account; use Print / Save as PDF to keep it.</small>
        <button className="experiment-primary no-print" onClick={()=>window.print()}><Download size={16}/> Print / Save as PDF</button>
      </div>}
    </div>
  </section>;
}
