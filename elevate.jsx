import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import {
  Heart, MessageCircle, User, Compass, Home as HomeIcon, Settings as SettingsIcon,
  ChevronRight, ChevronLeft, Check, Shield, ArrowLeft, Sparkles, Send, X, LogOut,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* DESIGN TOKENS                                                          */
/* ---------------------------------------------------------------------- */
const C = {
  bg: "#F8F7F4",
  card: "#FFFFFF",
  text: "#171717",
  muted: "#6B6B68",
  primary: "#1D3557",
  primarySoft: "#E9EEF3",
  accent: "#C9A227",
  accentSoft: "#F6EFD9",
  secondary: "#7A8B99",
  line: "#E4E1D9",
};
const serif = "'Fraunces', Georgia, 'Iowan Old Style', serif";
const sans = "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif";

/* ---------------------------------------------------------------------- */
/* DOMAIN MODEL                                                           */
/* ---------------------------------------------------------------------- */
const DOMAINS = [
  { id: "career", label: "Carrière & Ambition", icon: "🚀", archetype: "PROPULSEUR" },
  { id: "wealth", label: "Argent & Patrimoine", icon: "💰", archetype: "BATISSEUR" },
  { id: "love", label: "Amour & Affection", icon: "❤️", archetype: "NOURRICIER" },
  { id: "home", label: "Foyer & Stabilité", icon: "🏡", archetype: "STABILISATEUR" },
  { id: "passion", label: "Passion & Intimité", icon: "🔥", archetype: "CATALYSEUR" },
  { id: "knowledge", label: "Connaissance & Intelligence", icon: "🧠", archetype: "MENTOR" },
  { id: "travel", label: "Voyage & Ouverture", icon: "✈️", archetype: "EXPLORATEUR" },
  { id: "wellbeing", label: "Bien-être & Discipline", icon: "⚖️", archetype: "STABILISATEUR" },
  { id: "radiance", label: "Rayonnement & Confiance", icon: "✨", archetype: "CATALYSEUR" },
  { id: "network", label: "Réseau & Opportunités", icon: "🤝", archetype: "CONNECTEUR" },
  { id: "creativity", label: "Créativité & Plaisir", icon: "🎨", archetype: "CREATEUR" },
  { id: "meaning", label: "Sens & Intériorité", icon: "🧭", archetype: "STRATEGE" },
];

const ARCHETYPES = {
  STRATEGE: { name: "Le Stratège", desc: "Aide à réfléchir, décider et structurer." },
  PROPULSEUR: { name: "Le Propulseur", desc: "Encourage l'action, l'ambition et la progression." },
  BATISSEUR: { name: "Le Bâtisseur", desc: "Aide à créer stabilité, patrimoine et projets." },
  STABILISATEUR: { name: "Le Stabilisateur", desc: "Apporte sécurité, calme et équilibre." },
  CONNECTEUR: { name: "Le Connecteur", desc: "Apporte réseau, relations et opportunités." },
  MENTOR: { name: "Le Mentor", desc: "Favorise apprentissage et développement intellectuel." },
  NOURRICIER: { name: "Le Nourricier", desc: "Apporte affection, soutien et sécurité émotionnelle." },
  EXPLORATEUR: { name: "L'Explorateur", desc: "Apporte aventure, voyage et ouverture." },
  CATALYSEUR: { name: "Le Catalyseur", desc: "Provoque transformation et croissance personnelle." },
  CREATEUR: { name: "Le Créateur", desc: "Apporte imagination, créativité et expression." },
};

const TRAITS = [
  { id: "extraversion", label: "À l'aise en société, tu puises ton énergie des interactions" },
  { id: "openness", label: "Curieux·se, ouvert·e aux idées et expériences nouvelles" },
  { id: "conscientiousness", label: "Organisé·e, discipliné·e, tu tiens tes engagements" },
  { id: "emotionalStability", label: "Calme face au stress, tu ne te laisses pas déborder" },
  { id: "empathy", label: "Attentif·ve aux émotions des autres" },
  { id: "autonomy", label: "Tu as besoin de ton espace et de ton indépendance" },
  { id: "security", label: "Tu as besoin de stabilité et de prévisibilité" },
  { id: "ambition", label: "Tu vises haut et tu aimes progresser" },
  { id: "risk", label: "Tu es à l'aise avec le risque et l'incertitude" },
  { id: "communication", label: "Tu exprimes facilement ce que tu ressens" },
];

const INTENTIONS = [
  { id: "decouverte", label: "Découverte, sans pression" },
  { id: "ouverte", label: "Ouverte à ce qui vient" },
  { id: "longterme", label: "Relation à long terme" },
  { id: "serieuse", label: "Relation sérieuse" },
  { id: "mariage", label: "Vers le mariage" },
];
const intentionRank = { decouverte: 0, ouverte: 1, longterme: 2, serieuse: 3, mariage: 4 };
const intentionLabel = (id) => (INTENTIONS.find((i) => i.id === id) || {}).label || id;
const traitLabel = (id) => (TRAITS.find((t) => t.id === id) || {}).label || id;
const FIELD_LABELS = { importanceCareer: "l'importance de la carrière", importanceFamily: "l'importance de la famille", importanceMoney: "l'importance de l'argent" };

const AVATAR_COLORS = ["#1D3557", "#C9A227", "#7A8B99", "#8A5A44", "#3A5A40", "#6A4C93"];

/* ---------------------------------------------------------------------- */
/* HELPERS                                                                */
/* ---------------------------------------------------------------------- */
function genId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}
function age(birthdate) {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}
function initials(name) {
  return (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function hashPair(id1, id2) {
  const s = [id1, id2].sort().join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}
async function storageGet(key, shared) {
  try {
    const r = await window.storage.get(key, shared);
    return r ? r.value : null;
  } catch {
    return null;
  }
}
async function storageGetJSON(key, shared, fallback) {
  const v = await storageGet(key, shared);
  if (v == null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}
async function storageSetJSON(key, value, shared) {
  try { await window.storage.set(key, JSON.stringify(value), shared); } catch { /* noop */ }
}

/* ---------------------------------------------------------------------- */
/* SCORING ENGINE                                                         */
/* ---------------------------------------------------------------------- */
function lifeVisionCompat(a, b) {
  let points = 0;
  points += 25 * (1 - Math.abs(intentionRank[a.intention] - intentionRank[b.intention]) / 4);
  points += a.wantChildren === b.wantChildren ? 20 : (a.wantChildren === "peut-être" || b.wantChildren === "peut-être" ? 10 : 0);
  points += a.wantMarriage === b.wantMarriage ? 15 : 5;
  ["importanceCareer", "importanceFamily", "importanceMoney", "materialComfort", "spirituality", "fidelity"].forEach((f) => {
    points += 6.67 * (1 - Math.abs((a[f] || 0) - (b[f] || 0)) / 5);
  });
  return Math.round(Math.max(0, Math.min(100, points)));
}
function personalityCompat(a, b) {
  const keys = Object.keys(a.personality);
  let sum = 0;
  keys.forEach((t) => { sum += 1 - Math.abs((a.personality[t] || 0) - (b.personality[t] || 0)) / 5; });
  return Math.round((sum / keys.length) * 100);
}
function elevationDetail(a, b) {
  const aReceives = {}, bReceives = {};
  let sumA = 0, sumB = 0;
  DOMAINS.forEach((d) => {
    const ar = ((a.want[d.id] || 0) / 5) * ((b.give[d.id] || 0) / 5) * 100;
    const br = ((b.want[d.id] || 0) / 5) * ((a.give[d.id] || 0) / 5) * 100;
    aReceives[d.id] = Math.round(ar);
    bReceives[d.id] = Math.round(br);
    sumA += ar; sumB += br;
  });
  const elevationScore = Math.round((sumA + sumB) / (DOMAINS.length * 2));
  return { aReceives, bReceives, elevationScore };
}
function complementarityScore(a, b) {
  let sum = 0, weightSum = 0;
  DOMAINS.forEach((d) => {
    const diff = Math.abs((a.give[d.id] || 0) - (b.give[d.id] || 0)) / 5;
    const relevance = ((a.want[d.id] || 0) + (b.want[d.id] || 0)) / 10;
    sum += diff * relevance * 100;
    weightSum += relevance;
  });
  return weightSum > 0 ? Math.round(sum / weightSum) : 50;
}
function attractionScore(a, b) {
  const base = 1 - ((Math.abs(a.personality.extraversion - b.personality.extraversion) +
    Math.abs(a.personality.openness - b.personality.openness) +
    Math.abs(a.personality.ambition - b.personality.ambition)) / 15);
  const seed = hashPair(a.id, b.id);
  return Math.round(Math.max(0, Math.min(100, base * 65 + seed * 35)));
}
function computeScores(a, b) {
  const vision = lifeVisionCompat(a, b);
  const personality = personalityCompat(a, b);
  const { aReceives, bReceives, elevationScore } = elevationDetail(a, b);
  const complementarity = complementarityScore(a, b);
  const attraction = attractionScore(a, b);
  const compatibility = Math.round(vision * 0.5 + personality * 0.5);
  const relationshipPotential = Math.round(
    personality * 0.30 + vision * 0.25 + complementarity * 0.20 + elevationScore * 0.25
  );
  return { attraction, compatibility, complementarity, elevation: elevationScore, relationshipPotential, aReceives, bReceives };
}
function computeArchetypes(give) {
  const totals = {};
  DOMAINS.forEach((d) => { totals[d.archetype] = (totals[d.archetype] || 0) + (give[d.id] || 0); });
  const sorted = Object.entries(totals).sort((x, y) => y[1] - x[1]).map(([k]) => k);
  return { primary: sorted.slice(0, 3), secondary: sorted.slice(3, 5) };
}
function generateExplanation(a, b, scores) {
  const closer = [], mutual = [], effort = [];
  if (a.intention === b.intention) closer.push(`Vous recherchez tous les deux une relation "${intentionLabel(a.intention)}".`);
  if (a.wantChildren === b.wantChildren) closer.push("Votre vision sur les enfants est alignée.");
  Object.keys(a.personality).forEach((t) => {
    if (Math.abs(a.personality[t] - b.personality[t]) <= 1 && a.personality[t] >= 3) {
      closer.push(`Vous partagez un niveau similaire sur : ${traitLabel(t).toLowerCase()}.`);
    }
  });
  DOMAINS.forEach((d) => {
    if (scores.aReceives[d.id] >= 65) mutual.push(`Cette personne peut t'apporter beaucoup en ${d.label.toLowerCase()}.`);
    if (scores.bReceives[d.id] >= 65) mutual.push(`Tu peux beaucoup apporter à cette personne en ${d.label.toLowerCase()}.`);
  });
  ["importanceCareer", "importanceFamily", "importanceMoney"].forEach((f) => {
    if (Math.abs(a[f] - b[f]) >= 3) effort.push(`Votre rapport à ${FIELD_LABELS[f]} diffère nettement.`);
  });
  Object.keys(a.personality).forEach((t) => {
    if (Math.abs(a.personality[t] - b.personality[t]) >= 4) effort.push(`Votre besoin lié à "${traitLabel(t).toLowerCase()}" diffère sensiblement.`);
  });
  if (closer.length === 0) closer.push("Votre profil global présente des points communs à explorer ensemble.");
  if (mutual.length === 0) mutual.push("Votre dynamique de contribution mutuelle reste à construire.");
  if (effort.length === 0) effort.push("Aucun écart majeur détecté — un bon point de départ.");
  return { closer: closer.slice(0, 4), mutual: mutual.slice(0, 4), effort: effort.slice(0, 3) };
}

/* ---------------------------------------------------------------------- */
/* DEFAULT DRAFT                                                          */
/* ---------------------------------------------------------------------- */
function emptyDraft() {
  const want = {}, give = {}, personality = {};
  DOMAINS.forEach((d) => { want[d.id] = 2; give[d.id] = 2; });
  TRAITS.forEach((t) => { personality[t.id] = 2; });
  return {
    name: "", birthdate: "", gender: "femme", seekingGender: "tout le monde",
    city: "", profession: "", bioShort: "",
    intention: "longterme", wantMarriage: true, wantChildren: "peut-être", numChildren: 2, openExpat: false,
    importanceCareer: 3, importanceFamily: 3, importanceMoney: 3, entrepreneur: false,
    materialComfort: 3, spirituality: 2, fidelity: 4, nonNegotiables: "",
    want, give, personality,
  };
}

/* ---------------------------------------------------------------------- */
/* SMALL UI PRIMITIVES                                                    */
/* ---------------------------------------------------------------------- */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      input[type=range] { -webkit-appearance:none; appearance:none; height:4px; border-radius:4px; background:${C.line}; outline:none; }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:${C.primary}; cursor:pointer; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,.3); }
      input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:${C.primary}; cursor:pointer; border:2px solid white; }
      ::-webkit-scrollbar { width:8px; height:8px; }
      ::-webkit-scrollbar-thumb { background:${C.line}; border-radius:8px; }
    `}</style>
  );
}
function Avatar({ name, color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color || C.primary,
      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: serif, fontWeight: 500, fontSize: size * 0.38, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}
function Pill({ children, tone = "primary" }) {
  const map = {
    primary: { bg: C.primarySoft, fg: C.primary },
    accent: { bg: C.accentSoft, fg: "#8a6c14" },
    muted: { bg: "#EFEEEA", fg: C.muted },
  };
  const s = map[tone];
  return (
    <span style={{ background: s.bg, color: s.fg, padding: "4px 10px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, fontFamily: sans }}>
      {children}
    </span>
  );
}
function ScoreBar({ label, value, color = C.primary }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontFamily: sans, fontSize: 13.5 }}>
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ fontWeight: 700, color: C.text }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: C.line, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 8, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}
function Button({ children, onClick, variant = "primary", full, disabled, type = "button", icon: Icon }) {
  const styles = {
    primary: { background: C.primary, color: "white", border: "none" },
    accent: { background: C.accent, color: "white", border: "none" },
    outline: { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` },
    ghost: { background: "transparent", color: C.muted, border: "none" },
    danger: { background: "transparent", color: "#a13d3d", border: `1.5px solid #d9b3b3` },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{
      ...styles[variant], padding: "12px 20px", borderRadius: 10, fontFamily: sans, fontWeight: 600,
      fontSize: 14.5, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      width: full ? "100%" : "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "opacity .15s ease",
    }}>
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}
function Slider({ label, value, onChange, minLabel, maxLabel }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: sans, fontSize: 14.5, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{label}</div>
      <input type="range" min={0} max={5} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.muted, marginTop: 4, fontFamily: sans }}>
        <span>{minLabel || "Pas important"}</span>
        <span>{maxLabel || "Essentiel"}</span>
      </div>
    </div>
  );
}
function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{
        width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.line}`,
        fontFamily: sans, fontSize: 14.5, color: C.text, background: "white",
      }} />
    </div>
  );
}
function ChoiceGroup({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)} type="button" style={{
            padding: "9px 14px", borderRadius: 10, fontFamily: sans, fontSize: 13.5, cursor: "pointer",
            border: `1.5px solid ${value === o.id ? C.primary : C.line}`,
            background: value === o.id ? C.primarySoft : "white", color: value === o.id ? C.primary : C.text, fontWeight: value === o.id ? 600 : 400,
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, padding: 20,
      cursor: onClick ? "pointer" : "default", ...style,
    }}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* LANDING                                                                */
/* ---------------------------------------------------------------------- */
function Landing({ onStart, onLoginExisting }) {
  const [showLogin, setShowLogin] = useState(false);
  const [idInput, setIdInput] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ fontFamily: serif, fontSize: 15, letterSpacing: 1, color: C.accent, marginBottom: 18 }}>ELEVATE</div>
        <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: "clamp(32px,6vw,52px)", lineHeight: 1.15, color: C.text, margin: 0 }}>
          Rencontre quelqu'un avec qui vous pouvez grandir.
        </h1>
        <p style={{ fontFamily: sans, fontSize: 17, color: C.muted, marginTop: 20, lineHeight: 1.6, maxWidth: 520 }}>
          Une nouvelle façon de rencontrer : basée sur votre vision de la vie, vos forces, et ce que vous pouvez réellement vous apporter l'un à l'autre.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Button onClick={onStart} full={false}>Créer mon profil</Button>
          <Button variant="outline" onClick={() => setShowLogin((s) => !s)}>J'ai déjà un profil</Button>
        </div>
        {showLogin && (
          <div style={{ marginTop: 16, maxWidth: 360 }}>
            <TextField label="Ton identifiant de profil" value={idInput} onChange={setIdInput} placeholder="ex: user_abc123" />
            <Button onClick={() => onLoginExisting(idInput.trim())} disabled={!idInput.trim()}>Continuer</Button>
          </div>
        )}

        <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { t: "COMPATIBILITÉ", d: "Vos valeurs et votre vision de vie." },
            { t: "COMPLÉMENTARITÉ", d: "Vos forces se renforcent." },
            { t: "ÉLÉVATION", d: "Vous contribuez à devenir meilleurs ensemble." },
          ].map((c) => (
            <Card key={c.t}>
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 13, color: C.accent, letterSpacing: 0.5, marginBottom: 8 }}>{c.t}</div>
              <div style={{ fontFamily: sans, fontSize: 14.5, color: C.text, lineHeight: 1.5 }}>{c.d}</div>
            </Card>
          ))}
        </div>

        <p style={{ fontFamily: sans, fontSize: 12.5, color: C.muted, marginTop: 48, lineHeight: 1.6 }}>
          Version MVP de démonstration — les profils créés ici sont partagés entre les personnes qui utilisent cet artefact, afin de permettre de véritables mises en relation et échanges de messages. Ne renseigne pas d'informations sensibles.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ONBOARDING                                                             */
/* ---------------------------------------------------------------------- */
function Onboarding({ draft, setDraft, onFinish, onCancel }) {
  const [step, setStep] = useState(0);
  const steps = ["Identité", "Intentions", "Vision de vie", "Ce que je recherche", "Ce que j'apporte", "Personnalité", "Validation"];
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const setDomain = (bucket, id) => (v) => setDraft((d) => ({ ...d, [bucket]: { ...d[bucket], [id]: v } }));
  const setTrait = (id) => (v) => setDraft((d) => ({ ...d, personality: { ...d.personality, [id]: v } }));

  const canNext = () => {
    if (step === 0) return draft.name.trim().length > 0 && draft.birthdate && age(draft.birthdate) >= 18;
    return true;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 100px" }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: C.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 24 }}>
          <ArrowLeft size={15} /> Retour
        </button>
        <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? C.accent : C.line }} />
          ))}
        </div>
        <div style={{ fontFamily: sans, fontSize: 12.5, color: C.accent, fontWeight: 700, marginBottom: 6 }}>ÉTAPE {step + 1} / {steps.length}</div>
        <h2 style={{ fontFamily: serif, fontWeight: 500, fontSize: 28, color: C.text, margin: "0 0 24px" }}>{steps[step]}</h2>

        {step === 0 && (
          <>
            <TextField label="Prénom" value={draft.name} onChange={set("name")} placeholder="Ton prénom" />
            <TextField label="Date de naissance" type="date" value={draft.birthdate} onChange={set("birthdate")} />
            <ChoiceGroup label="Genre" value={draft.gender} onChange={set("gender")} options={[{ id: "femme", label: "Femme" }, { id: "homme", label: "Homme" }, { id: "autre", label: "Autre" }]} />
            <ChoiceGroup label="Je recherche" value={draft.seekingGender} onChange={set("seekingGender")} options={[{ id: "femmes", label: "Des femmes" }, { id: "hommes", label: "Des hommes" }, { id: "tout le monde", label: "Tout le monde" }]} />
            <TextField label="Ville" value={draft.city} onChange={set("city")} placeholder="ex: Lomé" />
            <TextField label="Profession" value={draft.profession} onChange={set("profession")} placeholder="ex: Product Manager" />
            <TextField label="Bio courte" value={draft.bioShort} onChange={set("bioShort")} placeholder="Une phrase qui te ressemble" />
          </>
        )}

        {step === 1 && (
          <>
            <ChoiceGroup label="Quelle relation recherches-tu ?" value={draft.intention} onChange={set("intention")} options={INTENTIONS} />
            <ChoiceGroup label="Le mariage fait-il partie de ta vision ?" value={draft.wantMarriage ? "oui" : "non"} onChange={(v) => set("wantMarriage")(v === "oui")} options={[{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }]} />
            <ChoiceGroup label="Veux-tu des enfants ?" value={draft.wantChildren} onChange={set("wantChildren")} options={[{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }, { id: "peut-être", label: "Peut-être" }]} />
            <ChoiceGroup label="Ouvert·e à l'expatriation ?" value={draft.openExpat ? "oui" : "non"} onChange={(v) => set("openExpat")(v === "oui")} options={[{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }]} />
          </>
        )}

        {step === 2 && (
          <>
            <Slider label="Importance de la carrière" value={draft.importanceCareer} onChange={set("importanceCareer")} />
            <Slider label="Importance de la famille" value={draft.importanceFamily} onChange={set("importanceFamily")} />
            <Slider label="Importance de l'argent / du patrimoine" value={draft.importanceMoney} onChange={set("importanceMoney")} />
            <Slider label="Niveau de confort matériel recherché" value={draft.materialComfort} onChange={set("materialComfort")} />
            <Slider label="Place de la spiritualité dans ta vie" value={draft.spirituality} onChange={set("spirituality")} />
            <Slider label="Importance de la fidélité" value={draft.fidelity} onChange={set("fidelity")} />
            <ChoiceGroup label="Es-tu entrepreneur·e ou souhaites-tu le devenir ?" value={draft.entrepreneur ? "oui" : "non"} onChange={(v) => set("entrepreneur")(v === "oui")} options={[{ id: "oui", label: "Oui" }, { id: "non", label: "Non" }]} />
            <TextField label="Critères non négociables (optionnel, séparés par des virgules)" value={draft.nonNegotiables} onChange={set("nonNegotiables")} placeholder="ex: veut des enfants, non-fumeur" />
          </>
        )}

        {(step === 3 || step === 4) && (
          <>
            <p style={{ fontFamily: sans, fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
              {step === 3
                ? "Pour chaque domaine, indique son importance dans ce que tu souhaites recevoir d'une relation."
                : "Pour chaque domaine, indique le niveau que tu peux réellement apporter à un partenaire."}
            </p>
            {DOMAINS.map((d) => (
              <Slider
                key={d.id}
                label={`${d.icon} ${d.label}`}
                value={step === 3 ? draft.want[d.id] : draft.give[d.id]}
                onChange={setDomain(step === 3 ? "want" : "give", d.id)}
              />
            ))}
          </>
        )}

        {step === 5 && (
          <>
            <p style={{ fontFamily: sans, fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
              Indique à quel point chaque affirmation te correspond.
            </p>
            {TRAITS.map((t) => (
              <Slider key={t.id} label={t.label} value={draft.personality[t.id]} onChange={setTrait(t.id)} minLabel="Pas du tout" maxLabel="Tout à fait" />
            ))}
          </>
        )}

        {step === 6 && (
          <Card style={{ textAlign: "center", padding: 32 }}>
            <Sparkles size={28} color={C.accent} />
            <h3 style={{ fontFamily: serif, fontSize: 22, margin: "16px 0 8px", color: C.text }}>Ton profil d'élévation est prêt.</h3>
            <p style={{ fontFamily: sans, fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
              L'analyse astrologique et numérologique optionnelle, ainsi que les photos de profil, arriveront dans une prochaine phase. Ton profil sera visible par les autres personnes utilisant cet espace afin de calculer vos compatibilités.
            </p>
          </Card>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 32, position: "sticky", bottom: 16 }}>
          {step > 0 && <Button variant="outline" icon={ChevronLeft} onClick={() => setStep((s) => s - 1)}>Précédent</Button>}
          {step < steps.length - 1 ? (
            <Button onClick={() => canNext() && setStep((s) => s + 1)} disabled={!canNext()}>Continuer</Button>
          ) : (
            <Button variant="accent" icon={Check} onClick={onFinish}>Voir mon tableau de bord</Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* NAV                                                                    */
/* ---------------------------------------------------------------------- */
function NavBar({ tab, setTab, matchCount }) {
  const items = [
    { id: "dashboard", label: "Accueil", icon: HomeIcon },
    { id: "discover", label: "Découvrir", icon: Compass },
    { id: "matches", label: "Messages", icon: MessageCircle, badge: matchCount },
    { id: "profile", label: "Mon profil", icon: User },
    { id: "settings", label: "Réglages", icon: SettingsIcon },
  ];
  return (
    <>
      {/* Desktop */}
      <div style={{ display: "none" }} className="elevate-desktop-nav">
        {items.map((it) => it.label)}
      </div>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-around", padding: "10px 6px 16px", zIndex: 40,
      }}>
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} style={{
              background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, color: active ? C.primary : C.muted, position: "relative", padding: "4px 8px",
            }}>
              <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
              <span style={{ fontFamily: sans, fontSize: 10.5, fontWeight: active ? 700 : 500 }}>{it.label}</span>
              {it.badge > 0 && (
                <span style={{ position: "absolute", top: -2, right: 2, background: C.accent, color: "white", borderRadius: 10, fontSize: 9.5, fontWeight: 700, padding: "1px 5px" }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* MATCH CARD                                                             */
/* ---------------------------------------------------------------------- */
function MatchCard({ user, me, onOpen, onLike, liked }) {
  const scores = useMemo(() => computeScores(me, user), [me, user]);
  const arche = useMemo(() => computeArchetypes(user.give), [user]);
  const theyGiveMeTop = DOMAINS.map((d) => ({ ...d, v: scores.aReceives[d.id] })).sort((a, b) => b.v - a.v).slice(0, 3);
  const iGiveThemTop = DOMAINS.map((d) => ({ ...d, v: scores.bReceives[d.id] })).sort((a, b) => b.v - a.v).slice(0, 3);
  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Avatar name={user.name} color={user.avatarColor} size={52} />
          <div>
            <div style={{ fontFamily: serif, fontSize: 18, color: C.text }}>{user.name}, {age(user.birthdate)}</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>{user.profession || "—"} · {user.city || "—"}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: serif, fontSize: 24, color: C.accent, lineHeight: 1 }}>{scores.relationshipPotential}%</div>
          <div style={{ fontFamily: sans, fontSize: 10.5, color: C.muted, letterSpacing: 0.3 }}>ELEVATION MATCH</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontFamily: sans, fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Peut t'élever en</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {theyGiveMeTop.map((d) => <span key={d.id} style={{ fontFamily: sans, fontSize: 13 }}>{d.icon} {d.label}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontFamily: sans, fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Tu peux l'élever en</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {iGiveThemTop.map((d) => <span key={d.id} style={{ fontFamily: sans, fontSize: 13 }}>{d.icon} {d.label}</span>)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Pill tone="accent">{ARCHETYPES[arche.primary[0]]?.name}</Pill>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Button variant="outline" full onClick={() => onOpen(user.id)}>Voir pourquoi</Button>
        <Button variant={liked ? "ghost" : "accent"} onClick={() => onLike(user.id)} icon={Heart} disabled={liked}>{liked ? "Aimé" : "J'aime"}</Button>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/* DASHBOARD                                                              */
/* ---------------------------------------------------------------------- */
function Dashboard({ me, others, likes, onLike, onOpen, setTab }) {
  const topNeeds = DOMAINS.map((d) => ({ ...d, v: me.want[d.id] })).sort((a, b) => b.v - a.v).slice(0, 3);
  const topStrengths = DOMAINS.map((d) => ({ ...d, v: me.give[d.id] })).sort((a, b) => b.v - a.v).slice(0, 3);
  const ranked = useMemo(() => others
    .map((u) => ({ u, s: computeScores(me, u) }))
    .sort((a, b) => b.s.relationshipPotential - a.s.relationshipPotential)
    .slice(0, 5), [others, me]);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>Bonjour</div>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 28, margin: "2px 0 4px", color: C.text }}>{me.name}</h1>
      <p style={{ fontFamily: sans, fontSize: 14, color: C.muted, marginBottom: 24 }}>Voici ce qui compte pour toi.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <Card>
          <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10 }}>TES BESOINS D'ÉLÉVATION</div>
          {topNeeds.map((d, i) => <div key={d.id} style={{ fontFamily: sans, fontSize: 13.5, marginBottom: 6 }}>{i + 1}. {d.icon} {d.label}</div>)}
        </Card>
        <Card>
          <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 10 }}>TES FORCES</div>
          {topStrengths.map((d, i) => <div key={d.id} style={{ fontFamily: sans, fontSize: 13.5, marginBottom: 6 }}>{i + 1}. {d.icon} {d.label}</div>)}
        </Card>
      </div>

      <div style={{ fontFamily: serif, fontSize: 20, color: C.text, marginBottom: 14 }}>Tes meilleurs matchs</div>
      {ranked.length === 0 && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <p style={{ fontFamily: sans, color: C.muted, fontSize: 14 }}>Aucun autre profil pour l'instant. Reviens quand d'autres personnes auront rejoint ELEVATE, ou explore l'onglet Découvrir.</p>
          <div style={{ marginTop: 12 }}><Button variant="outline" onClick={() => setTab("discover")}>Découvrir</Button></div>
        </Card>
      )}
      {ranked.map(({ u }) => (
        <MatchCard key={u.id} user={u} me={me} onOpen={onOpen} onLike={onLike} liked={likes.includes(u.id)} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* DISCOVER                                                               */
/* ---------------------------------------------------------------------- */
function Discover({ me, others, likes, onLike, onOpen }) {
  const filtered = useMemo(() => {
    return others.filter((u) => {
      if (me.seekingGender !== "tout le monde" && u.gender) {
        const wanted = me.seekingGender === "femmes" ? "femme" : me.seekingGender === "hommes" ? "homme" : null;
        if (wanted && u.gender !== wanted) return false;
      }
      // filter out radically incompatible intentions (casual/decouverte vs mariage)
      const gap = Math.abs(intentionRank[me.intention] - intentionRank[u.intention]);
      if (gap >= 4) return false;
      return true;
    }).map((u) => ({ u, s: computeScores(me, u) })).sort((a, b) => b.s.relationshipPotential - a.s.relationshipPotential);
  }, [others, me]);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, color: C.text, marginBottom: 4 }}>Découvrir</h1>
      <p style={{ fontFamily: sans, fontSize: 13.5, color: C.muted, marginBottom: 20 }}>Classé par potentiel d'élévation mutuelle.</p>
      {filtered.length === 0 && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <p style={{ fontFamily: sans, color: C.muted, fontSize: 14 }}>Personne à afficher pour le moment. Reviens plus tard, ou invite quelqu'un à créer son profil ELEVATE.</p>
        </Card>
      )}
      {filtered.map(({ u }) => (
        <MatchCard key={u.id} user={u} me={me} onOpen={onOpen} onLike={onLike} liked={likes.includes(u.id)} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* MATCH DETAIL                                                           */
/* ---------------------------------------------------------------------- */
function MatchDetail({ me, user, onBack, onLike, liked, mutual, onMessage }) {
  const scores = useMemo(() => computeScores(me, user), [me, user]);
  const explanation = useMemo(() => generateExplanation(me, user, scores), [me, user, scores]);
  const myArche = useMemo(() => computeArchetypes(me.give), [me]);
  const theirArche = useMemo(() => computeArchetypes(user.give), [user]);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20 }}>
        <ArrowLeft size={15} /> Retour
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <Avatar name={user.name} color={user.avatarColor} size={60} />
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: C.text }}>{user.name}, {age(user.birthdate)}</div>
          <div style={{ fontFamily: sans, fontSize: 13.5, color: C.muted }}>{user.profession || "—"} · {user.city || "—"}</div>
        </div>
      </div>

      <Card style={{ textAlign: "center", margin: "20px 0" }}>
        <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, letterSpacing: 0.5 }}>POTENTIEL D'ÉLÉVATION MUTUELLE</div>
        <div style={{ fontFamily: serif, fontSize: 48, color: C.accent, margin: "6px 0" }}>{scores.relationshipPotential}%</div>
        <div style={{ fontFamily: sans, fontSize: 13.5, color: C.text }}>
          Votre dynamique dominante : <strong>{ARCHETYPES[myArche.primary[0]]?.name} × {ARCHETYPES[theirArche.primary[0]]?.name}</strong>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <ScoreBar label="Attraction" value={scores.attraction} color={C.secondary} />
        <ScoreBar label="Compatibilité" value={scores.compatibility} color={C.primary} />
        <ScoreBar label="Complémentarité" value={scores.complementarity} color={C.accent} />
        <ScoreBar label="Élévation" value={scores.elevation} color="#3A5A40" />
      </Card>

      <Section title="Ce qui vous rapproche" items={explanation.closer} />
      <Section title="Ce que vous pouvez vous apporter" items={explanation.mutual} />
      <Section title="Ce qui demandera des efforts" items={explanation.effort} />

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {mutual ? (
          <Button variant="accent" full icon={MessageCircle} onClick={() => onMessage(user.id)}>Envoyer un message</Button>
        ) : (
          <Button variant={liked ? "ghost" : "accent"} full icon={Heart} onClick={() => onLike(user.id)} disabled={liked}>{liked ? "En attente de réponse" : "J'aime"}</Button>
        )}
      </div>
    </div>
  );
}
function Section({ title, items }) {
  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 10, letterSpacing: 0.3 }}>{title.toUpperCase()}</div>
      {items.map((t, i) => <div key={i} style={{ fontFamily: sans, fontSize: 14, color: C.text, marginBottom: 7, lineHeight: 1.5 }}>· {t}</div>)}
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/* PROFILE (own)                                                          */
/* ---------------------------------------------------------------------- */
function ProfileView({ me, onEdit }) {
  const arche = useMemo(() => computeArchetypes(me.give), [me]);
  const radarData = DOMAINS.map((d) => ({ domain: d.label.split(" & ")[0], value: (me.give[d.id] || 0) * 20 }));

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <Avatar name={me.name} color={me.avatarColor} size={64} />
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: C.text }}>{me.name}, {age(me.birthdate)}</div>
          <div style={{ fontFamily: sans, fontSize: 13.5, color: C.muted }}>{me.profession || "—"} · {me.city || "—"}</div>
        </div>
      </div>
      {me.bioShort && <p style={{ fontFamily: sans, fontSize: 14, color: C.text, marginBottom: 20, fontStyle: "italic" }}>"{me.bioShort}"</p>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 10 }}>MON PROFIL D'ÉLÉVATION</div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke={C.line} />
              <PolarAngleAxis dataKey="domain" tick={{ fontFamily: sans, fontSize: 10.5, fill: C.muted }} />
              <Radar dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 12 }}>ARCHÉTYPES D'ÉLÉVATION</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {arche.primary.map((a) => <Pill key={a} tone="accent">{ARCHETYPES[a]?.name}</Pill>)}
          {arche.secondary.map((a) => <Pill key={a} tone="muted">{ARCHETYPES[a]?.name}</Pill>)}
        </div>
        <p style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>{ARCHETYPES[arche.primary[0]]?.desc}</p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 10 }}>CE QUE JE RECHERCHE</div>
          {DOMAINS.slice().sort((a, b) => me.want[b.id] - me.want[a.id]).slice(0, 5).map((d) => (
            <div key={d.id} style={{ fontFamily: sans, fontSize: 13, marginBottom: 5 }}>{d.icon} {d.label.split(" & ")[0]}</div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 10 }}>CE QUE J'APPORTE</div>
          {DOMAINS.slice().sort((a, b) => me.give[b.id] - me.give[a.id]).slice(0, 5).map((d) => (
            <div key={d.id} style={{ fontFamily: sans, fontSize: 13, marginBottom: 5 }}>{d.icon} {d.label.split(" & ")[0]}</div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button variant="outline" full onClick={onEdit}>Modifier mon profil</Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* MESSAGES                                                               */
/* ---------------------------------------------------------------------- */
function MessagesList({ me, mutuals, onOpen }) {
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, color: C.text, marginBottom: 20 }}>Messages</h1>
      {mutuals.length === 0 && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <p style={{ fontFamily: sans, color: C.muted, fontSize: 14 }}>Pas encore de match mutuel. Va dans "Découvrir" et exprime ton intérêt pour des profils qui t'élèvent.</p>
        </Card>
      )}
      {mutuals.map((u) => (
        <Card key={u.id} onClick={() => onOpen(u.id)} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={u.name} color={u.avatarColor} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: serif, fontSize: 16, color: C.text }}>{u.name}</div>
            <div style={{ fontFamily: sans, fontSize: 12.5, color: C.muted }}>Vous vous êtes mutuellement plu — dites bonjour !</div>
          </div>
          <ChevronRight size={18} color={C.muted} />
        </Card>
      ))}
    </div>
  );
}
function Conversation({ me, user, messages, onSend, onBack }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px", borderBottom: `1px solid ${C.line}`, background: "white" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><ArrowLeft size={19} color={C.muted} /></button>
        <Avatar name={user.name} color={user.avatarColor} size={38} />
        <div style={{ fontFamily: serif, fontSize: 17, color: C.text }}>{user.name}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, background: C.bg }}>
        {messages.length === 0 && <p style={{ fontFamily: sans, fontSize: 13.5, color: C.muted, textAlign: "center", marginTop: 40 }}>C'est le début de votre conversation. Dites bonjour !</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === me.id ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{
              maxWidth: "75%", padding: "10px 14px", borderRadius: 14,
              background: m.from === me.id ? C.primary : "white", color: m.from === me.id ? "white" : C.text,
              fontFamily: sans, fontSize: 14, border: m.from === me.id ? "none" : `1px solid ${C.line}`,
            }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: 16, borderTop: `1px solid ${C.line}`, background: "white", paddingBottom: 24 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écris un message..."
          onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onSend(text.trim()); setText(""); } }}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${C.line}`, fontFamily: sans, fontSize: 14 }} />
        <button onClick={() => { if (text.trim()) { onSend(text.trim()); setText(""); } }} style={{ background: C.primary, border: "none", borderRadius: 10, width: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Send size={17} color="white" />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SETTINGS                                                               */
/* ---------------------------------------------------------------------- */
function SettingsView({ me, blocked, onUnblock, onLogout, onDelete, onEdit }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, color: C.text, marginBottom: 20 }}>Réglages</h1>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 8 }}>MON IDENTIFIANT DE DÉMONSTRATION</div>
        <p style={{ fontFamily: sans, fontSize: 13, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>
          Cette version MVP n'a pas d'authentification par mot de passe. Note cet identifiant pour retrouver ton profil sur un autre appareil.
        </p>
        <div style={{ fontFamily: "monospace", fontSize: 13, background: C.bg, padding: "8px 12px", borderRadius: 8, wordBreak: "break-all" }}>{me.id}</div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 10 }}>CONFIDENTIALITÉ & SÉCURITÉ</div>
        <p style={{ fontFamily: sans, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Ta date de naissance exacte n'est jamais affichée publiquement — seul ton âge est visible. Le blocage et le signalement s'appliquent uniquement à ton propre affichage dans cette version MVP.
        </p>
      </Card>

      {blocked.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 700, color: C.primary, marginBottom: 10 }}>PROFILS BLOQUÉS</div>
          {blocked.map((id) => (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12.5 }}>{id}</span>
              <Button variant="ghost" onClick={() => onUnblock(id)}>Débloquer</Button>
            </div>
          ))}
        </Card>
      )}

      <Button variant="outline" full onClick={onEdit}>Modifier mon profil d'élévation</Button>
      <div style={{ height: 10 }} />
      <Button variant="ghost" full icon={LogOut} onClick={onLogout}>Changer de profil (démo)</Button>
      <div style={{ height: 10 }} />
      {!confirmDelete ? (
        <Button variant="danger" full onClick={() => setConfirmDelete(true)}>Supprimer mon compte</Button>
      ) : (
        <Card style={{ borderColor: "#d9b3b3" }}>
          <p style={{ fontFamily: sans, fontSize: 13.5, marginBottom: 12 }}>Cette action est irréversible sur cet appareil. Confirmer ?</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="danger" onClick={onDelete}>Oui, supprimer</Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Annuler</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* APP SHELL                                                              */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | landing | onboarding | app
  const [me, setMe] = useState(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [others, setOthers] = useState([]);
  const [likes, setLikes] = useState([]); // ids I liked
  const [theirLikesOfMe, setTheirLikesOfMe] = useState([]); // ids who liked me
  const [blocked, setBlocked] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [view, setView] = useState({ name: "main" }); // main | matchDetail | conversation
  const [messagesCache, setMessagesCache] = useState({});

  const loadAll = useCallback(async (myId) => {
    const keys = await (async () => { try { return await window.storage.list("users:", true); } catch { return null; } })();
    const ids = keys && keys.keys ? keys.keys.map((k) => k.replace("users:", "")) : [];
    const profiles = await Promise.all(ids.map((id) => storageGetJSON(`users:${id}`, true, null)));
    const valid = profiles.filter(Boolean);
    setOthers(valid.filter((u) => u.id !== myId));
    const myLikes = await storageGetJSON(`likes:${myId}`, true, []);
    setLikes(myLikes);
    const likedMe = [];
    for (const u of valid) {
      if (u.id === myId) continue;
      const theirLikes = await storageGetJSON(`likes:${u.id}`, true, []);
      if (theirLikes.includes(myId)) likedMe.push(u.id);
    }
    setTheirLikesOfMe(likedMe);
    const myBlocked = await storageGetJSON(`blocked:${myId}`, false, []);
    setBlocked(myBlocked);
  }, []);

  const bootstrap = useCallback(async (id) => {
    const profile = await storageGetJSON(`users:${id}`, true, null);
    if (!profile) return false;
    await storageSetJSON("current-user-id", id, false);
    setMe(profile);
    await loadAll(id);
    setPhase("app");
    return true;
  }, [loadAll]);

  useEffect(() => {
    (async () => {
      const id = await storageGet("current-user-id", false);
      if (id) {
        const ok = await bootstrap(id);
        if (!ok) setPhase("landing");
      } else {
        setPhase("landing");
      }
    })();
  }, [bootstrap]);

  const mutuals = useMemo(() => others.filter((u) => likes.includes(u.id) && theirLikesOfMe.includes(u.id)).filter((u) => !blocked.includes(u.id)), [others, likes, theirLikesOfMe, blocked]);

  async function handleStart() {
    setDraft(emptyDraft());
    setPhase("onboarding");
  }
  async function handleLoginExisting(id) {
    const ok = await bootstrap(id);
    if (!ok) alert("Profil introuvable pour cet identifiant.");
  }
  async function handleFinishOnboarding() {
    const id = me?.id || genId("user");
    const profile = {
      ...draft,
      id,
      avatarColor: me?.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      createdAt: me?.createdAt || Date.now(),
    };
    await storageSetJSON(`users:${id}`, profile, true);
    await storageSetJSON("current-user-id", id, false);
    setMe(profile);
    await loadAll(id);
    setTab("dashboard");
    setView({ name: "main" });
    setPhase("app");
  }
  async function handleLike(targetId) {
    const next = Array.from(new Set([...likes, targetId]));
    setLikes(next);
    await storageSetJSON(`likes:${me.id}`, next, true);
    await loadAll(me.id);
  }
  async function handleEdit() {
    setDraft(me);
    setPhase("onboarding");
  }
  async function handleLogout() {
    await storageSetJSON("current-user-id", "", false);
    setMe(null);
    setOthers([]);
    setPhase("landing");
    setTab("dashboard");
  }
  async function handleDelete() {
    await storageSetJSON(`users:${me.id}`, null, true);
    await storageSetJSON("current-user-id", "", false);
    setMe(null);
    setPhase("landing");
  }
  async function handleUnblock(id) {
    const next = blocked.filter((b) => b !== id);
    setBlocked(next);
    await storageSetJSON(`blocked:${me.id}`, next, false);
  }
  function convId(a, b) { return [a, b].sort().join("__"); }
  async function openConversation(userId) {
    const cid = convId(me.id, userId);
    const msgs = await storageGetJSON(`messages:${cid}`, true, []);
    setMessagesCache((c) => ({ ...c, [cid]: msgs }));
    setView({ name: "conversation", userId });
  }
  async function sendMessage(userId, text) {
    const cid = convId(me.id, userId);
    const prev = messagesCache[cid] || [];
    const next = [...prev, { from: me.id, text, at: Date.now() }];
    setMessagesCache((c) => ({ ...c, [cid]: next }));
    await storageSetJSON(`messages:${cid}`, next, true);
  }

  if (phase === "loading") {
    return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, color: C.muted }}>Chargement…</div>;
  }
  if (phase === "landing") {
    return (<><GlobalStyle /><Landing onStart={handleStart} onLoginExisting={handleLoginExisting} /></>);
  }
  if (phase === "onboarding") {
    return (<><GlobalStyle /><Onboarding draft={draft} setDraft={setDraft} onFinish={handleFinishOnboarding} onCancel={() => setPhase(me ? "app" : "landing")} /></>);
  }

  const visibleOthers = others.filter((u) => !blocked.includes(u.id));

  if (view.name === "conversation") {
    const user = others.find((u) => u.id === view.userId);
    const cid = convId(me.id, view.userId);
    return (
      <>
        <GlobalStyle />
        <Conversation me={me} user={user} messages={messagesCache[cid] || []} onSend={(t) => sendMessage(view.userId, t)} onBack={() => setView({ name: "main" })} />
      </>
    );
  }
  if (view.name === "matchDetail") {
    const user = others.find((u) => u.id === view.userId);
    return (
      <>
        <GlobalStyle />
        <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 70 }}>
          <MatchDetail me={me} user={user} onBack={() => setView({ name: "main" })} onLike={handleLike} liked={likes.includes(user.id)} mutual={mutuals.some((m) => m.id === user.id)} onMessage={openConversation} />
        </div>
        <NavBar tab={tab} setTab={(t) => { setTab(t); setView({ name: "main" }); }} matchCount={mutuals.length} />
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 70 }}>
        {tab === "dashboard" && <Dashboard me={me} others={visibleOthers} likes={likes} onLike={handleLike} onOpen={(id) => setView({ name: "matchDetail", userId: id })} setTab={setTab} />}
        {tab === "discover" && <Discover me={me} others={visibleOthers} likes={likes} onLike={handleLike} onOpen={(id) => setView({ name: "matchDetail", userId: id })} />}
        {tab === "matches" && <MessagesList me={me} mutuals={mutuals} onOpen={openConversation} />}
        {tab === "profile" && <ProfileView me={me} onEdit={handleEdit} />}
        {tab === "settings" && <SettingsView me={me} blocked={blocked} onUnblock={handleUnblock} onLogout={handleLogout} onDelete={handleDelete} onEdit={handleEdit} />}
      </div>
      <NavBar tab={tab} setTab={setTab} matchCount={mutuals.length} />
    </>
  );
}
