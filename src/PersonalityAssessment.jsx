import { useState, useEffect, useMemo, useRef } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, ReferenceLine
} from 'recharts';

// ════════════════════════════════════════════════════════════════
// QUESTION BANK
// 60 Big Five items + 2 attention checks = 62 total
// ════════════════════════════════════════════════════════════════

const ATTENTION_CHECK_AFTER = { 20: 'ac1', 45: 'ac2' }; // insert after these item ids

const RAW_QUESTIONS = [
  // Openness 1–6
  { id: 1, text: "I enjoy exploring new ideas, methods, or possibilities.", trait: "openness", reverse: false },
  { id: 2, text: "I like routines and prefer familiar ways of doing things.", trait: "openness", reverse: true },
  { id: 3, text: "I enjoy learning about abstract, creative, or deep topics.", trait: "openness", reverse: false },
  { id: 4, text: "I rarely feel interested in art, imagination, or unusual ideas.", trait: "openness", reverse: true },
  { id: 5, text: "I am curious about people, cultures, tools, or concepts that are new to me.", trait: "openness", reverse: false },
  { id: 6, text: "I avoid trying new approaches unless I really have to.", trait: "openness", reverse: true },
  // Conscientiousness 7–12
  { id: 7, text: "I make plans and follow through on them.", trait: "conscientiousness", reverse: false },
  { id: 8, text: "I often start tasks but leave them unfinished.", trait: "conscientiousness", reverse: true },
  { id: 9, text: "I pay attention to details and try to do things properly.", trait: "conscientiousness", reverse: false },
  { id: 10, text: "I tend to be disorganized in my work or personal responsibilities.", trait: "conscientiousness", reverse: true },
  { id: 11, text: "I can discipline myself to keep working even when I do not feel like it.", trait: "conscientiousness", reverse: false },
  { id: 12, text: "I often act without thinking through the consequences.", trait: "conscientiousness", reverse: true },
  // Extraversion 13–18
  { id: 13, text: "I feel energized when I interact with people.", trait: "extraversion", reverse: false },
  { id: 14, text: "I prefer to stay quiet in group conversations.", trait: "extraversion", reverse: true },
  { id: 15, text: "I am comfortable starting conversations with people.", trait: "extraversion", reverse: false },
  { id: 16, text: "I usually avoid being the center of attention.", trait: "extraversion", reverse: true },
  { id: 17, text: "I speak up when I have something important to say.", trait: "extraversion", reverse: false },
  { id: 18, text: "I prefer solitary activities more than social activities.", trait: "extraversion", reverse: true },
  // Agreeableness 19–24
  { id: 19, text: "I try to be considerate of other people's feelings.", trait: "agreeableness", reverse: false },
  { id: 20, text: "I can be critical or blunt when people make mistakes.", trait: "agreeableness", reverse: true },
  { id: 21, text: "I find it natural to cooperate and compromise.", trait: "agreeableness", reverse: false },
  { id: 22, text: "I tend to distrust people's motives.", trait: "agreeableness", reverse: true },
  { id: 23, text: "I am willing to help others even when it is inconvenient.", trait: "agreeableness", reverse: false },
  { id: 24, text: "I get irritated when others slow me down.", trait: "agreeableness", reverse: true },
  // Neuroticism 25–30
  { id: 25, text: "I often worry about what could go wrong.", trait: "neuroticism", reverse: false },
  { id: 26, text: "I stay calm even when things become stressful.", trait: "neuroticism", reverse: true },
  { id: 27, text: "I am easily affected by criticism, conflict, or uncertainty.", trait: "neuroticism", reverse: false },
  { id: 28, text: "I recover quickly after disappointments.", trait: "neuroticism", reverse: true },
  { id: 29, text: "I often feel tense, anxious, or emotionally unsettled.", trait: "neuroticism", reverse: false },
  { id: 30, text: "I rarely feel overwhelmed by pressure.", trait: "neuroticism", reverse: true },
  // Extra Openness 31–34
  { id: 31, text: "I enjoy thinking about complex questions that do not have simple answers.", trait: "openness", reverse: false },
  { id: 32, text: "I prefer practical facts over theories or imagination.", trait: "openness", reverse: true },
  { id: 33, text: "I like experimenting with different ways of solving problems.", trait: "openness", reverse: false },
  { id: 34, text: "I feel uncomfortable when ideas are too abstract or unconventional.", trait: "openness", reverse: true },
  // Extra Conscientiousness 35–38
  { id: 35, text: "I keep my commitments even when they become inconvenient.", trait: "conscientiousness", reverse: false },
  { id: 36, text: "I often delay important tasks until the last minute.", trait: "conscientiousness", reverse: true },
  { id: 37, text: "I organize my time so I can meet my responsibilities.", trait: "conscientiousness", reverse: false },
  { id: 38, text: "I sometimes ignore details if I want to finish quickly.", trait: "conscientiousness", reverse: true },
  // Extra Extraversion 39–42
  { id: 39, text: "I enjoy being around groups of people.", trait: "extraversion", reverse: false },
  { id: 40, text: "I often wait for others to start conversations.", trait: "extraversion", reverse: true },
  { id: 41, text: "I feel comfortable expressing my opinions in a group.", trait: "extraversion", reverse: false },
  { id: 42, text: "Social activities usually drain me quickly.", trait: "extraversion", reverse: true },
  // Extra Agreeableness 43–46
  { id: 43, text: "I try to understand people's situation before judging them.", trait: "agreeableness", reverse: false },
  { id: 44, text: "I find it hard to forgive people who disappoint me.", trait: "agreeableness", reverse: true },
  { id: 45, text: "I usually look for a peaceful solution during disagreements.", trait: "agreeableness", reverse: false },
  { id: 46, text: "I can be suspicious when people offer help or praise.", trait: "agreeableness", reverse: true },
  // Extra Neuroticism 47–50
  { id: 47, text: "I feel stressed when plans suddenly change.", trait: "neuroticism", reverse: false },
  { id: 48, text: "I can usually keep my emotions steady under pressure.", trait: "neuroticism", reverse: true },
  { id: 49, text: "I tend to replay mistakes or awkward moments in my mind.", trait: "neuroticism", reverse: false },
  { id: 50, text: "I rarely worry about things before they happen.", trait: "neuroticism", reverse: true },
  // MBTI Bridge 51–60
  { id: 51, text: "When making decisions, I prioritize objective logic over people's feelings.", trait: "bridge_TF", reverse: false },
  { id: 52, text: "I usually consider how a decision will affect relationships and morale.", trait: "bridge_TF", reverse: false },
  { id: 53, text: "I prefer clear schedules, plans, and closure.", trait: "bridge_JP", reverse: false },
  { id: 54, text: "I like keeping options open rather than deciding too early.", trait: "bridge_JP", reverse: false },
  { id: 55, text: "I trust concrete facts more than possibilities or patterns.", trait: "bridge_SN", reverse: false },
  { id: 56, text: "I often notice hidden meanings, patterns, or future possibilities.", trait: "bridge_SN", reverse: false },
  { id: 57, text: "I prefer to think things through privately before speaking.", trait: "bridge_EI", reverse: false },
  { id: 58, text: "I understand my thoughts better by discussing them with others.", trait: "bridge_EI", reverse: false },
  { id: 59, text: "I become uncomfortable when plans are too loose or undefined.", trait: "bridge_JP", reverse: false },
  { id: 60, text: "I enjoy adapting as things unfold, even without a fixed plan.", trait: "bridge_JP", reverse: false },
];

// Build the final question list with attention checks inserted
const QUESTIONS = (() => {
  const out = [];
  for (const q of RAW_QUESTIONS) {
    out.push(q);
    if (ATTENTION_CHECK_AFTER[q.id] === 'ac1') {
      out.push({ id: 'ac1', text: "Attention check — please select 'Disagree' to confirm you are reading carefully.", trait: 'attention', expected: 2 });
    }
    if (ATTENTION_CHECK_AFTER[q.id] === 'ac2') {
      out.push({ id: 'ac2', text: "Attention check — please select 'Agree' to confirm you are still focused.", trait: 'attention', expected: 4 });
    }
  }
  return out;
})();

const PAGE_SIZE = 10;
const TOTAL_PAGES = Math.ceil(QUESTIONS.length / PAGE_SIZE);

// ════════════════════════════════════════════════════════════════
// SCORING
// ════════════════════════════════════════════════════════════════

const BIG_FIVE_GROUPS = {
  openness: [1, 2, 3, 4, 5, 6, 31, 32, 33, 34],
  conscientiousness: [7, 8, 9, 10, 11, 12, 35, 36, 37, 38],
  extraversion: [13, 14, 15, 16, 17, 18, 39, 40, 41, 42],
  agreeableness: [19, 20, 21, 22, 23, 24, 43, 44, 45, 46],
  neuroticism: [25, 26, 27, 28, 29, 30, 47, 48, 49, 50],
};

const TRAIT_META = {
  openness: { label: 'Openness', color: '#C8553D', short: 'O' },
  conscientiousness: { label: 'Conscientiousness', color: '#8B6E3F', short: 'C' },
  extraversion: { label: 'Extraversion', color: '#D9A441', short: 'E' },
  agreeableness: { label: 'Agreeableness', color: '#6B8E6B', short: 'A' },
  neuroticism: { label: 'Neuroticism', color: '#5C6E91', short: 'N' },
};

function adjust(id, raw, reverse) {
  if (raw == null) return null;
  return reverse ? (6 - raw) : raw;
}

function calcBigFive(answers) {
  const out = {};
  for (const [trait, ids] of Object.entries(BIG_FIVE_GROUPS)) {
    const vals = ids.map(id => {
      const q = RAW_QUESTIONS.find(r => r.id === id);
      return adjust(id, answers[id], q.reverse);
    }).filter(v => v != null);
    out[trait] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return out;
}

function levelOf(s) {
  if (s == null) return { label: '—', tone: 'neutral' };
  if (s >= 4.21) return { label: 'Very high', tone: 'high' };
  if (s >= 3.41) return { label: 'High', tone: 'high' };
  if (s >= 2.61) return { label: 'Moderate', tone: 'mid' };
  if (s >= 1.81) return { label: 'Low', tone: 'low' };
  return { label: 'Very low', tone: 'low' };
}

function calcTemperament(b) {
  const E = b.extraversion, N = b.neuroticism;
  let primary;
  if (E >= 3 && N < 3) primary = 'Sanguine';
  else if (E >= 3 && N >= 3) primary = 'Choleric';
  else if (E < 3 && N >= 3) primary = 'Melancholic';
  else primary = 'Phlegmatic';
  const distance = Math.sqrt((E - 3) ** 2 + (N - 3) ** 2);
  let clarity;
  if (distance >= 1.0) clarity = 'clear';
  else if (distance >= 0.5) clarity = 'moderate';
  else clarity = 'mixed';
  // Strength scores per temperament
  const strengths = {
    Sanguine: Math.max(0, E - 3) + Math.max(0, 3 - N),
    Choleric: Math.max(0, E - 3) + Math.max(0, N - 3),
    Melancholic: Math.max(0, 3 - E) + Math.max(0, N - 3),
    Phlegmatic: Math.max(0, 3 - E) + Math.max(0, 3 - N),
  };
  const ranked = Object.entries(strengths).sort((a, b) => b[1] - a[1]);
  return { primary, secondary: ranked[1][0], E, N, distance, clarity, strengths };
}

function calcMBTI(b, a) {
  // E score: avg of extraversion trait, (6 - i57: prefer to think privately = I), i58 (discussing = E)
  const eRaw = (b.extraversion + (6 - a[57]) + a[58]) / 3;
  // N score: avg of openness, (6 - i55: facts = S), i56 (patterns = N)
  const nRaw = (b.openness + (6 - a[55]) + a[56]) / 3;
  // F score: avg of (6 - i51: logic over feelings = T), i52 (relationships = F), agreeableness
  const fRaw = ((6 - a[51]) + a[52] + b.agreeableness) / 3;
  // J score: avg of conscientiousness, i53 (schedules = J), (6 - i54: keep options = P), i59 (uncomfortable loose = J), (6 - i60: adapting = P)
  const jRaw = (b.conscientiousness + a[53] + (6 - a[54]) + a[59] + (6 - a[60])) / 5;
  const type =
    (eRaw >= 3 ? 'E' : 'I') +
    (nRaw >= 3 ? 'N' : 'S') +
    (fRaw >= 3 ? 'F' : 'T') +
    (jRaw >= 3 ? 'J' : 'P');
  return {
    type,
    scores: { E: eRaw, N: nRaw, F: fRaw, J: jRaw },
    // Preference clarity (how far from neutral 3)
    clarity: {
      EI: Math.abs(eRaw - 3) / 2,
      SN: Math.abs(nRaw - 3) / 2,
      TF: Math.abs(fRaw - 3) / 2,
      JP: Math.abs(jRaw - 3) / 2,
    },
  };
}

const MBTI_BLURB = {
  INTJ: 'The Architect — strategic, independent, drawn to long-horizon systems thinking.',
  INTP: 'The Logician — analytical, curious, more interested in ideas than implementation.',
  ENTJ: 'The Commander — decisive, goal-oriented, comfortable directing groups.',
  ENTP: 'The Debater — inventive, exploratory, energized by intellectual sparring.',
  INFJ: 'The Advocate — quietly idealistic, deeply attuned to meaning and people.',
  INFP: 'The Mediator — values-led, imaginative, protective of inner authenticity.',
  ENFJ: 'The Protagonist — warm, persuasive, naturally invested in others\' growth.',
  ENFP: 'The Campaigner — enthusiastic, possibility-focused, allergic to rigidity.',
  ISTJ: 'The Logistician — dependable, methodical, faithful to commitments.',
  ISFJ: 'The Defender — loyal, observant, quietly carrying the load for others.',
  ESTJ: 'The Executive — organized, direct, builds order out of chaos.',
  ESFJ: 'The Consul — sociable, dutiful, the emotional infrastructure of teams.',
  ISTP: 'The Virtuoso — practical, hands-on, drawn to how things work.',
  ISFP: 'The Adventurer — gentle, expressive, attuned to the present moment.',
  ESTP: 'The Entrepreneur — bold, action-oriented, thrives where the rules are loose.',
  ESFP: 'The Entertainer — spontaneous, generous, makes ordinary moments feel alive.',
};

const TEMPERAMENT_BLURB = {
  Sanguine: 'Warm, sociable, optimistic. Energized by people and novelty; sometimes scattered.',
  Choleric: 'Driven, decisive, intense. Naturally takes charge; can run hot under pressure.',
  Melancholic: 'Reflective, sensitive, depth-oriented. Notices what others miss; carries inner weight.',
  Phlegmatic: 'Calm, steady, accommodating. The peacekeeper; needs gentle prompting to assert.',
};

const TRAIT_DESCRIPTIONS = {
  openness: {
    high: 'You lean toward curiosity, abstraction, and new experience. You\'re comfortable with ambiguity and drawn to ideas more than fixed answers.',
    mid: 'You balance openness with practicality — willing to consider new ideas but anchored in what works.',
    low: 'You favor proven approaches and concrete realities over speculation. You trust what\'s tested.',
  },
  conscientiousness: {
    high: 'You are organized, reliable, and self-disciplined. You finish what you start and respect commitments.',
    mid: 'You can be structured when it matters and flexible when it doesn\'t. You may oscillate based on stakes.',
    low: 'You\'re spontaneous and adaptable, less bound by schedules. Routine can feel constricting.',
  },
  extraversion: {
    high: 'You draw energy from people and outward activity. You think out loud and seek engagement.',
    mid: 'You shift between social and solitary modes. You enjoy people but also need recovery time.',
    low: 'You recharge in quiet, prefer depth over breadth in relationships, and think before speaking.',
  },
  agreeableness: {
    high: 'You are cooperative, considerate, and trust-extending. Harmony matters to you.',
    mid: 'You can be warm and direct in turn — kind by default but willing to push back when needed.',
    low: 'You are direct, skeptical, and competitive. You speak plainly and don\'t need to be liked.',
  },
  neuroticism: {
    high: 'You feel emotions vividly and notice threats early. You may carry stress and replay mistakes.',
    mid: 'You feel stress in spikes but recover. Most days you\'re emotionally steady, with hot moments.',
    low: 'You stay calm under pressure and bounce back quickly. You may underestimate others\' stress.',
  },
};

// ════════════════════════════════════════════════════════════════
// AI SYNTHESIS
// ════════════════════════════════════════════════════════════════

async function generateAIInsights({ context, bigFive, temperament, mbti }) {
  const requestBody = {
    context,
    bigFive,
    temperament,
    mbti,
  };

  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    attempts: [],
  };

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const a = { attempt, phase: 'starting', startedAt: Date.now() };
    diagnostics.attempts.push(a);

    let response;
    try {
      a.phase = 'fetching';
      response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      a.phase = 'fetch_returned';
    } catch (e) {
      a.phase = 'fetch_threw';
      a.errorName = e.name;
      a.errorMessage = e.message;
      a.errorStack = e.stack ? String(e.stack).slice(0, 600) : null;
      a.durationMs = Date.now() - a.startedAt;
      lastError = new Error(`fetch threw: ${e.name}: ${e.message}`);
      lastError.diagnostics = diagnostics;
      if (attempt < 2) await new Promise(r => setTimeout(r, 800));
      continue;
    }

    a.status = response.status;
    a.statusText = response.statusText;
    try {
      a.headers = Object.fromEntries(response.headers.entries());
    } catch {}

    if (!response.ok) {
      a.phase = 'http_not_ok';
      try {
        a.errorBody = (await response.text()).slice(0, 500);
      } catch (e) {
        a.bodyReadError = e.message;
      }
      a.durationMs = Date.now() - a.startedAt;
      lastError = new Error(`HTTP ${response.status} ${response.statusText}: ${a.errorBody || ''}`);
      lastError.diagnostics = diagnostics;
      if (attempt < 2) await new Promise(r => setTimeout(r, 800));
      continue;
    }

    let rawText;
    try {
      rawText = await response.text();
      a.phase = 'got_body';
      a.bodyLength = rawText.length;
      a.bodyPreview = rawText.slice(0, 300);
    } catch (e) {
      a.phase = 'body_read_failed';
      a.errorMessage = e.message;
      lastError = new Error(`Body read: ${e.message}`);
      lastError.diagnostics = diagnostics;
      continue;
    }

    let data;
    try {
      data = JSON.parse(rawText);
      a.phase = 'outer_parsed';
    } catch (e) {
      a.phase = 'outer_json_parse_failed';
      a.errorMessage = e.message;
      lastError = new Error(`Response wasn't JSON: ${e.message}`);
      lastError.diagnostics = diagnostics;
      continue;
    }

    if (data?.diagnostics) {
      a.serverDiagnostics = data.diagnostics;
    }

    if (!data || typeof data.insights !== 'object') {
      a.phase = 'no_insights_object';
      a.dataKeys = data ? Object.keys(data) : null;
      a.dataPreview = JSON.stringify(data).slice(0, 300);
      lastError = new Error(data?.error || 'Response missing insights object');
      lastError.diagnostics = diagnostics;
      continue;
    }

    a.phase = 'success';
    a.durationMs = Date.now() - a.startedAt;
    console.log('AI synthesis diagnostics:', diagnostics);
    return data.insights;
  }

  console.error('AI synthesis failed. Diagnostics:', diagnostics);
  if (!lastError) {
    lastError = new Error('All attempts failed');
    lastError.diagnostics = diagnostics;
  }
  throw lastError;
}

// Standalone connection test - tries 3 different model strings with minimal payload
async function runConnectionTest() {
  const response = await fetch('/api/connection-test');
  const data = await response.json();
  return data.results || [data];
}

// ════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ════════════════════════════════════════════════════════════════

const STORAGE = {
  DRAFT: 'pa:draft',
  RESULT: (id) => `pa:result:${id}`,
};

async function saveDraft(state) {
  try {
    if (window.storage?.set) {
      await window.storage.set(STORAGE.DRAFT, JSON.stringify(state));
      return;
    }
    window.localStorage.setItem(STORAGE.DRAFT, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}
async function loadDraft() {
  try {
    if (window.storage?.get) {
      const r = await window.storage.get(STORAGE.DRAFT);
      return r ? JSON.parse(r.value) : null;
    }
    const value = window.localStorage.getItem(STORAGE.DRAFT);
    return value ? JSON.parse(value) : null;
  } catch { return null; }
}
async function clearDraft() {
  try {
    if (window.storage?.delete) {
      await window.storage.delete(STORAGE.DRAFT);
      return;
    }
    window.localStorage.removeItem(STORAGE.DRAFT);
  } catch {}
}

// ════════════════════════════════════════════════════════════════
// THEME / GLOBAL STYLES
// ════════════════════════════════════════════════════════════════

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap';

const COLORS = {
  paper: '#F6EFE3',
  paper2: '#EFE5D2',
  ink: '#1F2238',
  ink2: '#3A3D55',
  muted: '#8C8475',
  rule: '#D9CDB6',
  accent: '#C8553D',
  accent2: '#8B6E3F',
  ochre: '#D9A441',
  sage: '#6B8E6B',
  blue: '#5C6E91',
  cream: '#FBF7EE',
};

// ════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════

function Rule({ thick, style }) {
  return (
    <div
      style={{
        height: thick ? 2 : 1,
        background: COLORS.rule,
        margin: '24px 0',
        ...style,
      }}
    />
  );
}

function Pill({ children, color = COLORS.accent }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontFamily: 'Manrope, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        background: color + '18',
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = 'primary', disabled, style }) {
  const base = {
    fontFamily: 'Manrope, sans-serif',
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: '0.04em',
    padding: '14px 28px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.4 : 1,
    borderRadius: 2,
  };
  const variants = {
    primary: { background: COLORS.ink, color: COLORS.paper },
    accent: { background: COLORS.accent, color: COLORS.cream },
    ghost: {
      background: 'transparent',
      color: COLORS.ink,
      border: `1px solid ${COLORS.ink}40`,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREENS
// ════════════════════════════════════════════════════════════════

function WelcomeScreen({ onBegin, hasDraft, onResume, onDiscard }) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <Pill>An integrated self-assessment</Pill>
      </div>
      <h1
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 500,
          fontSize: 'clamp(40px, 7vw, 64px)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: COLORS.ink,
          textAlign: 'center',
          margin: '24px 0 16px',
          fontStyle: 'italic',
        }}
      >
        A Long Look<br />in the Mirror
      </h1>
      <p
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 17,
          lineHeight: 1.65,
          color: COLORS.ink2,
          textAlign: 'center',
          maxWidth: 540,
          margin: '0 auto',
        }}
      >
        Sixty questions, three frameworks, one synthesis. The Big Five gives you the
        empirical core; the Four Temperaments give you a quick portrait;
        an MBTI-style mapping gives you a familiar handle. Then an AI coach
        weaves them together for you.
      </p>

      <Rule />

      <div
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 14,
          lineHeight: 1.7,
          color: COLORS.ink2,
          background: COLORS.cream,
          padding: 24,
          border: `1px solid ${COLORS.rule}`,
        }}
      >
        <strong style={{ color: COLORS.ink, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 11 }}>
          Before you begin
        </strong>
        <ul style={{ marginTop: 12, paddingLeft: 20, margin: '12px 0 0' }}>
          <li style={{ marginBottom: 8 }}>Set aside about 15 minutes. Quiet beats fast.</li>
          <li style={{ marginBottom: 8 }}>Answer for who you are <em>most of the time</em>, not who you'd like to be.</li>
          <li style={{ marginBottom: 8 }}>This is for self-reflection. It is not validated for hiring, diagnosis, or formal evaluation.</li>
          <li>Your responses are stored locally on this device only.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32, alignItems: 'center' }}>
        {hasDraft ? (
          <>
            <Button onClick={onResume} variant="accent">Resume in progress</Button>
            <Button onClick={onDiscard} variant="ghost">Start fresh</Button>
          </>
        ) : (
          <Button onClick={onBegin} variant="accent">Begin assessment →</Button>
        )}
      </div>
    </div>
  );
}

function ContextScreen({ context, setContext, onNext, onBack }) {
  const audiences = [
    { key: 'personal', label: 'Personal self-reflection' },
    { key: 'coaching', label: 'Coaching or mentoring' },
    { key: 'family', label: 'Family / relationship use' },
    { key: 'work', label: 'Work / leadership context' },
  ];
  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 24px' }}>
      <Pill>Step 1 of 3</Pill>
      <h2
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 500,
          fontSize: 36,
          letterSpacing: '-0.01em',
          color: COLORS.ink,
          margin: '16px 0 8px',
          fontStyle: 'italic',
        }}
      >
        A little context.
      </h2>
      <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
        This shapes how the AI synthesis is written. Skip anything you'd rather not share.
      </p>

      <label style={{ display: 'block', marginBottom: 24 }}>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.muted, display: 'block', marginBottom: 8 }}>
          Your name (optional)
        </span>
        <input
          type="text"
          value={context.name || ''}
          onChange={(e) => setContext({ ...context, name: e.target.value })}
          placeholder="What should we call you?"
          style={{
            width: '100%',
            background: COLORS.cream,
            border: `1px solid ${COLORS.rule}`,
            padding: '14px 16px',
            fontFamily: 'Fraunces, serif',
            fontSize: 18,
            color: COLORS.ink,
            outline: 'none',
            borderRadius: 2,
          }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.rule)}
        />
      </label>

      <div style={{ marginBottom: 24 }}>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.muted, display: 'block', marginBottom: 12 }}>
          What's this for?
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {audiences.map((a) => (
            <button
              key={a.key}
              onClick={() => setContext({ ...context, audience: a.key })}
              style={{
                padding: '14px 16px',
                background: context.audience === a.key ? COLORS.ink : COLORS.cream,
                color: context.audience === a.key ? COLORS.paper : COLORS.ink2,
                border: `1px solid ${context.audience === a.key ? COLORS.ink : COLORS.rule}`,
                fontFamily: 'Manrope, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderRadius: 2,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: 'block', marginBottom: 32 }}>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.muted, display: 'block', marginBottom: 8 }}>
          What's on your mind right now? (optional)
        </span>
        <textarea
          value={context.note || ''}
          onChange={(e) => setContext({ ...context, note: e.target.value })}
          placeholder="A current decision, transition, or pattern you want insight on..."
          rows={3}
          style={{
            width: '100%',
            background: COLORS.cream,
            border: `1px solid ${COLORS.rule}`,
            padding: '14px 16px',
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            color: COLORS.ink,
            outline: 'none',
            resize: 'vertical',
            borderRadius: 2,
          }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.rule)}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Button onClick={onBack} variant="ghost">← Back</Button>
        <Button onClick={onNext} variant="accent">
          Begin questions →
        </Button>
      </div>
    </div>
  );
}

function RatingScale({ value, onChange, qid }) {
  const labels = ['Strongly\u00a0disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\u00a0agree'];
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(qid, n)}
              style={{
                flex: '1 1 calc(20% - 8px)',
                minWidth: 48,
                aspectRatio: '1.4 / 1',
                background: selected ? COLORS.ink : COLORS.cream,
                color: selected ? COLORS.paper : COLORS.ink2,
                border: `1px solid ${selected ? COLORS.ink : COLORS.rule}`,
                fontFamily: 'Fraunces, serif',
                fontSize: 22,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderRadius: 2,
              }}
              aria-label={`${n} - ${labels[n - 1].replace(/\u00a0/g, ' ')}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontFamily: 'Manrope, sans-serif',
          fontSize: 11,
          letterSpacing: '0.04em',
          color: COLORS.muted,
        }}
      >
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
    </div>
  );
}

function QuestionnaireScreen({ page, answers, setAnswer, onNext, onBack, onJumpHome }) {
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, QUESTIONS.length);
  const pageQuestions = QUESTIONS.slice(start, end);
  const allAnswered = pageQuestions.every((q) => answers[q.id] != null);
  const progress = ((page + 1) / TOTAL_PAGES) * 100;
  const totalAnswered = Object.keys(answers).length;

  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  return (
    <div ref={containerRef} style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Progress header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: COLORS.paper,
          paddingTop: 16,
          paddingBottom: 16,
          marginBottom: 16,
          zIndex: 10,
          borderBottom: `1px solid ${COLORS.rule}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.muted, fontWeight: 600 }}>
            Page {page + 1} of {TOTAL_PAGES}
          </span>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: COLORS.muted }}>
            {totalAnswered} / {QUESTIONS.length} answered
          </span>
        </div>
        <div style={{ height: 2, background: COLORS.rule, position: 'relative' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: COLORS.accent,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {pageQuestions.map((q, idx) => {
        const isAttention = q.trait === 'attention';
        return (
          <div
            key={q.id}
            style={{
              marginBottom: 28,
              padding: 0,
              borderBottom: idx === pageQuestions.length - 1 ? 'none' : `1px solid ${COLORS.rule}`,
              paddingBottom: 28,
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 14,
                  fontVariantNumeric: 'oldstyle-nums',
                  color: isAttention ? COLORS.accent : COLORS.muted,
                  fontWeight: 500,
                  minWidth: 28,
                  paddingTop: 4,
                }}
              >
                {isAttention ? '✻' : `${start + idx + 1}.`}
              </span>
              <p
                style={{
                  flex: 1,
                  margin: 0,
                  fontFamily: 'Fraunces, serif',
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: COLORS.ink,
                  fontWeight: 400,
                  fontStyle: isAttention ? 'italic' : 'normal',
                }}
              >
                {q.text}
              </p>
            </div>
            <RatingScale value={answers[q.id]} onChange={setAnswer} qid={q.id} />
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
        <Button onClick={onBack} variant="ghost">
          {page === 0 ? '← Context' : '← Previous'}
        </Button>
        <Button onClick={onNext} variant="accent" disabled={!allAnswered}>
          {page === TOTAL_PAGES - 1 ? 'Review answers →' : 'Next page →'}
        </Button>
      </div>
      {!allAnswered && (
        <p
          style={{
            textAlign: 'center',
            marginTop: 12,
            fontFamily: 'Manrope, sans-serif',
            fontSize: 12,
            color: COLORS.muted,
            fontStyle: 'italic',
          }}
        >
          Please answer all questions on this page to continue.
        </p>
      )}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          onClick={onJumpHome}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'Manrope, sans-serif',
            fontSize: 11,
            color: COLORS.muted,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Save & exit
        </button>
      </div>
    </div>
  );
}

function ReviewScreen({ answers, onSubmit, onEdit, onBack }) {
  const totalAnswered = Object.keys(answers).length;
  const ac1 = answers.ac1, ac2 = answers.ac2;
  const ac1Pass = ac1 === 2;
  const ac2Pass = ac2 === 4;
  const acFails = (!ac1Pass ? 1 : 0) + (!ac2Pass ? 1 : 0);

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 24px' }}>
      <Pill>Step 3 of 3</Pill>
      <h2
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 500,
          fontSize: 36,
          letterSpacing: '-0.01em',
          color: COLORS.ink,
          margin: '16px 0 8px',
          fontStyle: 'italic',
        }}
      >
        Ready to see the read?
      </h2>
      <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
        {totalAnswered} of {QUESTIONS.length} questions answered. We'll calculate your scores
        and ask the AI coach to write a personalized synthesis.
      </p>

      {acFails > 0 && (
        <div
          style={{
            background: COLORS.accent + '12',
            border: `1px solid ${COLORS.accent}40`,
            padding: 16,
            marginBottom: 24,
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14,
            color: COLORS.ink2,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: COLORS.accent }}>Heads up:</strong> {acFails} attention check item{acFails > 1 ? 's were' : ' was'} not answered as expected.
          Your results will still calculate, but consider whether you want to redo any items.
        </div>
      )}

      <Rule />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button onClick={onSubmit} variant="accent" style={{ padding: '16px 28px', fontSize: 15 }}>
          Calculate my results →
        </Button>
        <Button onClick={onEdit} variant="ghost">
          Go back and edit answers
        </Button>
      </div>
    </div>
  );
}

function LoadingScreen({ phase, error, onRetry, onSkipAI }) {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      {!error ? (
        <>
          <div
            style={{
              width: 48,
              height: 48,
              border: `3px solid ${COLORS.rule}`,
              borderTopColor: COLORS.accent,
              borderRadius: '50%',
              margin: '0 auto 32px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 500,
              fontSize: 32,
              fontStyle: 'italic',
              color: COLORS.ink,
              margin: '0 0 12px',
            }}
          >
            {phase === 'scoring' ? 'Tallying your answers…' : 'The AI coach is synthesizing…'}
          </h2>
          <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>
            {phase === 'scoring'
              ? 'Reverse-scoring items, computing trait averages, mapping temperaments and preferences.'
              : 'Weaving the three frameworks into a personalized portrait. This usually takes 15–30 seconds.'}
          </p>
        </>
      ) : (
        <>
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 500,
              fontSize: 32,
              fontStyle: 'italic',
              color: COLORS.ink,
              margin: '0 0 12px',
            }}
          >
            The synthesis didn't go through.
          </h2>
          <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            We can still show your scored results without the AI synthesis. Or you can retry.
          </p>
          <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 12, fontStyle: 'italic', marginBottom: 32 }}>
            Error: {String(error).slice(0, 200)}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={onRetry} variant="accent">Retry</Button>
            <Button onClick={onSkipAI} variant="ghost">Show results without AI</Button>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// RESULTS
// ════════════════════════════════════════════════════════════════

function BigFiveTab({ bigFive }) {
  const data = Object.entries(bigFive).map(([k, v]) => ({
    trait: TRAIT_META[k].label,
    short: TRAIT_META[k].short,
    score: Number(v.toFixed(2)),
    fullMark: 5,
  }));

  return (
    <div>
      <div style={{ height: 360, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke={COLORS.rule} />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: COLORS.ink2, fontSize: 12, fontFamily: 'Manrope, sans-serif' }}
            />
            <PolarRadiusAxis
              domain={[0, 5]}
              tick={{ fill: COLORS.muted, fontSize: 10 }}
              stroke={COLORS.rule}
              tickCount={6}
            />
            <Radar
              name="You"
              dataKey="score"
              stroke={COLORS.accent}
              fill={COLORS.accent}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(bigFive).map(([trait, score]) => {
          const meta = TRAIT_META[trait];
          const lvl = levelOf(score);
          const desc =
            score >= 3.41
              ? TRAIT_DESCRIPTIONS[trait].high
              : score >= 2.61
              ? TRAIT_DESCRIPTIONS[trait].mid
              : TRAIT_DESCRIPTIONS[trait].low;
          return (
            <div
              key={trait}
              style={{
                background: COLORS.cream,
                padding: 20,
                borderLeft: `3px solid ${meta.color}`,
                borderTop: `1px solid ${COLORS.rule}`,
                borderRight: `1px solid ${COLORS.rule}`,
                borderBottom: `1px solid ${COLORS.rule}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
                <h4
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontStyle: 'italic',
                    fontSize: 22,
                    fontWeight: 500,
                    color: COLORS.ink,
                    margin: 0,
                  }}
                >
                  {meta.label}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 28,
                      fontWeight: 500,
                      color: meta.color,
                      fontVariantNumeric: 'oldstyle-nums',
                    }}
                  >
                    {score.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: COLORS.muted,
                      fontWeight: 600,
                    }}
                  >
                    {lvl.label}
                  </span>
                </div>
              </div>
              {/* Score bar */}
              <div style={{ height: 4, background: COLORS.paper2, position: 'relative', marginBottom: 12 }}>
                <div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: `${(score / 5) * 100}%`,
                    background: meta.color,
                  }}
                />
              </div>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>
                {desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultExplanationPanel({ title, intro, accent = COLORS.sage, items }) {
  return (
    <section
      style={{
        background: COLORS.cream,
        border: `1px solid ${COLORS.rule}`,
        padding: 22,
        margin: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h3
        style={{
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 24,
          color: COLORS.ink,
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.65, color: COLORS.ink2, margin: 0 }}>
        {intro}
      </p>
      {items.map((item) => (
        <div key={item.title} style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 14 }}>
          <div
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: COLORS.muted,
              marginBottom: 4,
            }}
          >
            {item.title}
          </div>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>
            {item.text}
          </p>
        </div>
      ))}
    </section>
  );
}

function TemperamentTab({ temperament }) {
  const t = temperament;
  // Plot data: a single point at (E, N)
  const point = [{ x: t.E, y: t.N, name: 'You' }];

  const quadrantLabels = [
    { x: 4, y: 1.5, label: 'Sanguine', sub: 'High E · Low N' },
    { x: 4, y: 4.5, label: 'Choleric', sub: 'High E · High N' },
    { x: 1.5, y: 4.5, label: 'Melancholic', sub: 'Low E · High N' },
    { x: 1.5, y: 1.5, label: 'Phlegmatic', sub: 'Low E · Low N' },
  ];

  return (
    <div>
      <div
        style={{
          background: COLORS.cream,
          padding: 24,
          marginBottom: 24,
          textAlign: 'center',
          border: `1px solid ${COLORS.rule}`,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <Pill color={COLORS.sage}>Primary temperament</Pill>
        </div>
        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 48,
            fontWeight: 500,
            color: COLORS.ink,
            margin: '8px 0',
          }}
        >
          {t.primary}
        </h3>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: COLORS.ink2, lineHeight: 1.6, margin: '0 auto', maxWidth: 480 }}>
          {TEMPERAMENT_BLURB[t.primary]}
        </p>
        <div style={{ marginTop: 16, fontFamily: 'Manrope, sans-serif', fontSize: 12, color: COLORS.muted }}>
          Profile clarity: <strong style={{ color: COLORS.ink2 }}>{t.clarity}</strong>
          {t.clarity === 'mixed' && (
            <span> — your scores sit close to the center, so you may shift between styles depending on context.</span>
          )}
          {t.secondary !== t.primary && (
            <span> · Secondary lean: <strong style={{ color: COLORS.ink2 }}>{t.secondary}</strong></span>
          )}
        </div>
      </div>

      {/* Quadrant chart */}
      <div style={{ height: 360, position: 'relative', marginBottom: 24, background: COLORS.cream, border: `1px solid ${COLORS.rule}`, padding: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid stroke={COLORS.rule} strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke={COLORS.muted}
              tick={{ fontFamily: 'Manrope, sans-serif', fontSize: 11 }}
              label={{
                value: 'Extraversion →',
                position: 'bottom',
                offset: 10,
                style: { fontFamily: 'Manrope, sans-serif', fontSize: 12, fill: COLORS.muted, letterSpacing: '0.05em' },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke={COLORS.muted}
              tick={{ fontFamily: 'Manrope, sans-serif', fontSize: 11 }}
              label={{
                value: 'Neuroticism →',
                angle: -90,
                position: 'left',
                offset: 0,
                style: { fontFamily: 'Manrope, sans-serif', fontSize: 12, fill: COLORS.muted, letterSpacing: '0.05em' },
              }}
            />
            <ReferenceLine x={3} stroke={COLORS.ink2} strokeWidth={1} />
            <ReferenceLine y={3} stroke={COLORS.ink2} strokeWidth={1} />
            {quadrantLabels.map((q) => (
              <Scatter
                key={q.label}
                data={[{ x: q.x, y: q.y, label: q.label, sub: q.sub }]}
                fill="transparent"
                shape={(props) => (
                  <text
                    x={props.cx}
                    y={props.cy}
                    textAnchor="middle"
                    fontFamily="Fraunces, serif"
                    fontSize="14"
                    fontStyle="italic"
                    fill={COLORS.muted}
                  >
                    {q.label}
                  </text>
                )}
              />
            ))}
            <Scatter
              data={point}
              shape={(props) => (
                <g>
                  <circle cx={props.cx} cy={props.cy} r="14" fill={COLORS.accent} fillOpacity="0.2" />
                  <circle cx={props.cx} cy={props.cy} r="6" fill={COLORS.accent} />
                </g>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, lineHeight: 1.6, color: COLORS.muted, fontStyle: 'italic' }}>
        The Four Temperaments are mapped from Extraversion (E) and Neuroticism (N) using the
        Eysenck two-axis model. Your dot sits at E={t.E.toFixed(2)}, N={t.N.toFixed(2)}.
      </div>

      <ResultExplanationPanel
        title="How to read this result"
        intro="Temperament is a quick lens for emotional pace and social energy. It is useful for reflection, but it should be read alongside your Big Five scores rather than treated as a fixed identity."
        accent={COLORS.sage}
        items={[
          {
            title: 'Primary temperament',
            text: 'This is the quadrant your Extraversion and Neuroticism scores place you closest to. It describes your most likely default under ordinary conditions.',
          },
          {
            title: 'Secondary lean',
            text: 'Your secondary temperament shows the neighboring style you may shift into depending on pressure, setting, or who you are with.',
          },
          {
            title: 'Profile clarity',
            text: 'Clear means your scores sit away from the center. Mixed means you are close to the midpoint, so context may shape how your temperament shows up.',
          },
          {
            title: 'The two axes',
            text: 'Extraversion tracks outward social energy. Neuroticism tracks emotional reactivity under stress. Together they form the four temperament quadrants.',
          },
        ]}
      />
    </div>
  );
}

function MBTITab({ mbti }) {
  const dichotomies = [
    { left: 'I', right: 'E', leftName: 'Introvert', rightName: 'Extravert', value: mbti.scores.E, key: 'EI' },
    { left: 'S', right: 'N', leftName: 'Sensing', rightName: 'Intuition', value: mbti.scores.N, key: 'SN' },
    { left: 'T', right: 'F', leftName: 'Thinking', rightName: 'Feeling', value: mbti.scores.F, key: 'TF' },
    { left: 'P', right: 'J', leftName: 'Perceiving', rightName: 'Judging', value: mbti.scores.J, key: 'JP' },
  ];

  return (
    <div>
      <div
        style={{
          background: COLORS.ink,
          color: COLORS.paper,
          padding: 32,
          textAlign: 'center',
          marginBottom: 24,
          position: 'relative',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: COLORS.ochre, fontWeight: 600 }}>
            MBTI-style type
          </span>
        </div>
        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(60px, 14vw, 96px)',
            fontWeight: 500,
            margin: '0',
            letterSpacing: '0.1em',
            color: COLORS.cream,
            fontStyle: 'italic',
          }}
        >
          {mbti.type}
        </h3>
        <p
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            color: COLORS.paper,
            opacity: 0.85,
            margin: '12px auto 0',
            maxWidth: 460,
          }}
        >
          {MBTI_BLURB[mbti.type] || ''}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {dichotomies.map((d) => {
          // value in 1-5 range; map to position 0-100% on bar
          // For E: high value = E; for I: low value = I
          const pct = ((d.value - 1) / 4) * 100;
          const isRight = d.value >= 3;
          return (
            <div key={d.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'Manrope, sans-serif', fontSize: 12 }}>
                <span style={{ color: !isRight ? COLORS.ink : COLORS.muted, fontWeight: !isRight ? 700 : 500 }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginRight: 8, fontStyle: 'italic' }}>{d.left}</span>
                  {d.leftName}
                </span>
                <span style={{ color: isRight ? COLORS.ink : COLORS.muted, fontWeight: isRight ? 700 : 500 }}>
                  {d.rightName}
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginLeft: 8, fontStyle: 'italic' }}>{d.right}</span>
                </span>
              </div>
              <div style={{ height: 8, background: COLORS.paper2, position: 'relative', borderRadius: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '-4px',
                    bottom: '-4px',
                    width: 1,
                    background: COLORS.muted,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(pct, 50)}%`,
                    width: `${Math.abs(pct - 50)}%`,
                    height: '100%',
                    background: COLORS.accent,
                  }}
                />
              </div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
                Score: {d.value.toFixed(2)} (3.0 = neutral) ·
                Preference clarity: {(mbti.clarity[d.key] * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      <Rule />
      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, lineHeight: 1.6, color: COLORS.muted, fontStyle: 'italic' }}>
        This is an MBTI-<em>style</em> mapping derived from your Big Five scores plus the 10 bridge items.
        It correlates with — but is not identical to — the official MBTI instrument.
        Treat it as a familiar handle on your profile, not a clinical type.
      </div>

      <ResultExplanationPanel
        title="What the letters mean"
        intro="This is an MBTI-style translation of your Big Five scores and bridge questions. Each letter points to the side of a preference pair you leaned toward, not a permanent box."
        accent={COLORS.ochre}
        items={[
          {
            title: 'I / E',
            text: 'Introversion and Extraversion describe where your attention and energy tend to go: inward reflection or outward interaction.',
          },
          {
            title: 'S / N',
            text: 'Sensing and Intuition describe whether you lean more toward concrete facts and details or patterns, meanings, and possibilities.',
          },
          {
            title: 'T / F',
            text: 'Thinking and Feeling describe whether decisions tend to be weighed more through impersonal logic or people-centered impact and values.',
          },
          {
            title: 'J / P',
            text: 'Judging and Perceiving describe your preferred relationship to structure: closure, plans, and decisions, or flexibility, openness, and adaptation.',
          },
          {
            title: 'Clarity',
            text: 'A high clarity score means you leaned strongly toward one side. A low clarity score means that preference is closer to balanced or context-dependent.',
          },
        ]}
      />
    </div>
  );
}

function AIInsightsTab({ insights, loading, error, errorDiagnostics, onRegenerate }) {
  const [showDiag, setShowDiag] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: `3px solid ${COLORS.rule}`,
            borderTopColor: COLORS.accent,
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 14 }}>
          The AI coach is synthesizing your results…
        </p>
      </div>
    );
  }

  if (error || !insights) {
    const phaseFromDiag = errorDiagnostics?.attempts?.[errorDiagnostics.attempts.length - 1]?.phase;
    const diagJson = errorDiagnostics ? JSON.stringify(errorDiagnostics, null, 2) : null;

    const handleCopy = async () => {
      const blob = (diagJson || '') + (testResults ? '\n\n--- Connection Test ---\n' + JSON.stringify(testResults, null, 2) : '');
      try {
        await navigator.clipboard.writeText(blob);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = blob;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
        document.body.removeChild(ta);
      }
    };

    const handleTest = async () => {
      setTesting(true);
      setTestResults(null);
      try {
        const r = await runConnectionTest();
        setTestResults(r);
      } catch (e) {
        setTestResults([{ error: e.message }]);
      } finally {
        setTesting(false);
      }
    };

    return (
      <div style={{ padding: '32px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 14, marginBottom: 12 }}>
            AI synthesis failed.
          </p>
          {error && (
            <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.accent, fontSize: 13, fontStyle: 'italic', wordBreak: 'break-word', maxWidth: 540, margin: '0 auto 8px', lineHeight: 1.5 }}>
              {String(error)}
            </p>
          )}
          {phaseFromDiag && (
            <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Failed at phase: <strong style={{ color: COLORS.ink2 }}>{phaseFromDiag}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Button onClick={onRegenerate} variant="accent">↻ Try again</Button>
          <Button onClick={() => setShowDiag(!showDiag)} variant="ghost">
            {showDiag ? '▾ Hide' : '▸ Show'} technical details
          </Button>
          <Button onClick={handleTest} variant="ghost" disabled={testing}>
            {testing ? 'Testing…' : 'Run connection test'}
          </Button>
        </div>

        {showDiag && (
          <div style={{ background: COLORS.cream, border: `1px solid ${COLORS.rule}`, padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.muted }}>
                Diagnostics
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: `1px solid ${COLORS.rule}`,
                  padding: '4px 10px',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 11,
                  color: COLORS.ink2,
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                {copied ? '✓ Copied' : '⧉ Copy all'}
              </button>
            </div>
            <pre
              style={{
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontSize: 11,
                lineHeight: 1.5,
                color: COLORS.ink2,
                background: 'transparent',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 360,
                overflowY: 'auto',
              }}
            >
              {diagJson || 'No diagnostics captured.'}
            </pre>

            {testResults && (
              <>
                <div style={{ height: 1, background: COLORS.rule, margin: '16px 0' }} />
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8 }}>
                  Connection test results
                </div>
                {testResults.map((r, i) => (
                  <div key={i} style={{ marginBottom: 8, padding: 8, background: r.ok ? '#E8F0E5' : '#F5E5E0', fontFamily: 'ui-monospace, monospace', fontSize: 11, color: COLORS.ink2 }}>
                    <strong>{r.model || 'unknown'}</strong>
                    {' — '}
                    {r.ok ? `✓ ${r.status} OK` : `✗ ${r.status || ''} ${r.errorName || ''} ${r.errorMessage || ''}`}
                    {' '}({r.durationMs}ms)
                    {r.bodyPreview && (
                      <div style={{ marginTop: 4, opacity: 0.7, wordBreak: 'break-word' }}>
                        {r.bodyPreview.slice(0, 150)}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Portrait */}
      <div style={{ marginBottom: 32 }}>
        <Pill color={COLORS.accent}>Integrated portrait</Pill>
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 22,
            fontStyle: 'italic',
            lineHeight: 1.5,
            color: COLORS.ink,
            margin: '16px 0 0',
            fontWeight: 400,
          }}
        >
          {insights.portrait}
        </p>
      </div>

      <Rule />

      {/* Strengths */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 26, fontWeight: 500, color: COLORS.ink, margin: '0 0 16px' }}>
          What you bring
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {insights.strengths.map((s, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${COLORS.sage}`, paddingLeft: 16 }}>
              <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: '0 0 4px', letterSpacing: '0.02em' }}>
                {s.title}
              </h4>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Blindspots */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 26, fontWeight: 500, color: COLORS.ink, margin: '0 0 16px' }}>
          Growth edges
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {insights.blindspots.map((b, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${COLORS.accent}`, paddingLeft: 16 }}>
              <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: '0 0 4px', letterSpacing: '0.02em' }}>
                {b.title}
              </h4>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      <div style={{ marginBottom: 32, background: COLORS.cream, padding: 24, border: `1px solid ${COLORS.rule}` }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 500, color: COLORS.ink, margin: '0 0 16px' }}>
          How this profile shows up
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'At work', text: insights.patterns?.work },
            { label: 'In close relationships', text: insights.patterns?.relationships },
            { label: 'Under stress', text: insights.patterns?.stress },
          ].map((p, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.muted, fontWeight: 600, marginBottom: 4 }}>
                {p.label}
              </div>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Habits */}
      <div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 26, fontWeight: 500, color: COLORS.ink, margin: '0 0 16px' }}>
          One habit per trait
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.habits.map((h, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '12px 16px',
                background: COLORS.cream,
                borderLeft: `3px solid ${TRAIT_META[h.trait]?.color || COLORS.muted}`,
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TRAIT_META[h.trait]?.color || COLORS.muted, minWidth: 80 }}>
                {TRAIT_META[h.trait]?.short || '·'}
              </span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, lineHeight: 1.6, color: COLORS.ink2 }}>
                {h.habit}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Rule />
      <div style={{ textAlign: 'center' }}>
        <Button onClick={onRegenerate} variant="ghost" style={{ fontSize: 12 }}>
          ↻ Regenerate synthesis
        </Button>
      </div>
    </div>
  );
}

function ReflectionTab({ context }) {
  const questions = [
    'Which trait result feels most accurate?',
    'Which one surprises you?',
    'Which trait helps you most in family, work, or ministry?',
    'Which trait creates the most friction in your closest relationships?',
    'What is one habit that could help you balance your strongest tendency?',
    'When you read your AI synthesis, what part stings (and might be worth listening to)?',
  ];
  return (
    <div>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 32, fontStyle: 'italic' }}>
        Sit with these for a few minutes. Even better — talk one through with someone who knows you well.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {questions.map((q, i) => (
          <div key={i}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 32,
                  fontStyle: 'italic',
                  color: COLORS.accent,
                  fontVariantNumeric: 'oldstyle-nums',
                  fontWeight: 500,
                  lineHeight: 1,
                  minWidth: 36,
                }}
              >
                {i + 1}
              </span>
              <p
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 20,
                  lineHeight: 1.4,
                  color: COLORS.ink,
                  margin: 0,
                  fontWeight: 400,
                  paddingTop: 4,
                }}
              >
                {q}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsScreen({ results, insights, aiLoading, aiError, aiErrorDiagnostics, context, onRegenerate, onRestart, onPrint }) {
  const [tab, setTab] = useState('bigfive');
  const tabs = [
    { key: 'bigfive', label: 'Big Five' },
    { key: 'temperament', label: 'Temperament' },
    { key: 'mbti', label: 'MBTI-style' },
    { key: 'ai', label: 'AI synthesis' },
    { key: 'reflect', label: 'Reflection' },
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <Pill>Your assessment</Pill>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(36px, 6vw, 52px)',
            fontWeight: 500,
            color: COLORS.ink,
            margin: '12px 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          {context.name ? `${context.name},` : 'Here\'s the read,'}
        </h1>
        <p style={{ fontFamily: 'Manrope, sans-serif', color: COLORS.muted, fontSize: 15 }}>
          {context.name ? 'here\'s your assessment.' : 'across three frameworks.'}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: `1px solid ${COLORS.rule}`,
          marginBottom: 32,
          overflowX: 'auto',
          paddingBottom: 0,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.key ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              fontFamily: 'Manrope, sans-serif',
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? COLORS.ink : COLORS.muted,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        {tab === 'bigfive' && <BigFiveTab bigFive={results.bigFive} />}
        {tab === 'temperament' && <TemperamentTab temperament={results.temperament} />}
        {tab === 'mbti' && <MBTITab mbti={results.mbti} />}
        {tab === 'ai' && (
          <AIInsightsTab
            insights={insights}
            loading={aiLoading}
            error={aiError}
            errorDiagnostics={aiErrorDiagnostics}
            onRegenerate={onRegenerate}
          />
        )}
        {tab === 'reflect' && <ReflectionTab context={context} />}
      </div>

      <Rule thick />

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Button onClick={onPrint} variant="ghost">↓ Open printable view</Button>
        <Button onClick={onRestart} variant="ghost">Take it again</Button>
      </div>

      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: COLORS.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 40, lineHeight: 1.6 }}>
        Reminder — this is a self-reflection tool, not a validated psychometric instrument.
        Don't use it for hiring, clinical diagnosis, or judging anyone's character.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════

export default function PersonalityAssessment() {
  const [stage, setStage] = useState('loading'); // loading | welcome | context | quiz | review | computing | results
  const [hasDraft, setHasDraft] = useState(false);
  const [context, setContext] = useState({ name: '', audience: '', note: '' });
  const [answers, setAnswers] = useState({});
  const [page, setPage] = useState(0);
  const [results, setResults] = useState(null);
  const [insights, setInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiErrorDiagnostics, setAiErrorDiagnostics] = useState(null);
  const [computePhase, setComputePhase] = useState('scoring');
  const [computeError, setComputeError] = useState(null);

  // Inject font on mount
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement('link');
      link.href = FONT_HREF;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    // Inject keyframes for spinner
    if (!document.getElementById('pa-keyframes')) {
      const style = document.createElement('style');
      style.id = 'pa-keyframes';
      style.textContent = `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          button { display: none !important; }
          body { background: white !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Check for draft on mount
  useEffect(() => {
    (async () => {
      const d = await loadDraft();
      if (d && Object.keys(d.answers || {}).length > 0) {
        setHasDraft(true);
      }
      setStage('welcome');
    })();
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (stage === 'context' || stage === 'quiz' || stage === 'review') {
      saveDraft({ context, answers, page, stage });
    }
  }, [context, answers, page, stage]);

  const setAnswer = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleResume = async () => {
    const d = await loadDraft();
    if (d) {
      setContext(d.context || { name: '', audience: '', note: '' });
      setAnswers(d.answers || {});
      setPage(d.page || 0);
      setStage(d.stage || 'context');
    }
  };

  const handleDiscard = async () => {
    await clearDraft();
    setHasDraft(false);
    setAnswers({});
    setContext({ name: '', audience: '', note: '' });
    setPage(0);
  };

  const handleSubmit = async () => {
    setStage('computing');
    setComputePhase('scoring');
    setComputeError(null);

    // Score everything
    await new Promise((r) => setTimeout(r, 600)); // brief beat
    const bigFive = calcBigFive(answers);
    const temperament = calcTemperament(bigFive);
    const mbti = calcMBTI(bigFive, answers);
    const computed = { bigFive, temperament, mbti };
    setResults(computed);

    // AI synthesis
    setComputePhase('ai');
    setAiLoading(true);
    try {
      const ins = await generateAIInsights({ context, ...computed });
      setInsights(ins);
      setAiError(null);
      setAiErrorDiagnostics(null);
    } catch (e) {
      setAiError(e.message || 'AI request failed');
      setAiErrorDiagnostics(e.diagnostics || null);
      setInsights(null);
    } finally {
      setAiLoading(false);
      setStage('results');
      await clearDraft();
    }
  };

  const handleRegenerate = async () => {
    if (!results) return;
    setAiLoading(true);
    setAiError(null);
    setAiErrorDiagnostics(null);
    try {
      const ins = await generateAIInsights({ context, ...results });
      setInsights(ins);
    } catch (e) {
      setAiError(e.message || 'AI request failed');
      setAiErrorDiagnostics(e.diagnostics || null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRestart = async () => {
    await clearDraft();
    setAnswers({});
    setContext({ name: '', audience: '', note: '' });
    setPage(0);
    setResults(null);
    setInsights(null);
    setHasDraft(false);
    setStage('welcome');
  };

  const handlePrint = () => {
    if (!results) return;
    const { bigFive, temperament, mbti } = results;
    const name = (context.name || '').replace(/[<>]/g, '');
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const traitRows = Object.entries(bigFive).map(([k, v]) => {
      const meta = TRAIT_META[k];
      const lvl = levelOf(v);
      const desc = v >= 3.41 ? TRAIT_DESCRIPTIONS[k].high : v >= 2.61 ? TRAIT_DESCRIPTIONS[k].mid : TRAIT_DESCRIPTIONS[k].low;
      const pct = (v / 5) * 100;
      return `
        <div class="trait-row" style="border-left: 3px solid ${meta.color};">
          <div class="trait-head">
            <span class="trait-name">${meta.label}</span>
            <span class="trait-score" style="color: ${meta.color};">${v.toFixed(2)} <span class="trait-level">${lvl.label}</span></span>
          </div>
          <div class="bar"><div class="fill" style="width:${pct}%; background:${meta.color};"></div></div>
          <p class="trait-desc">${desc}</p>
        </div>`;
    }).join('');

    const dichotomies = [
      { left: 'I', right: 'E', leftName: 'Introvert', rightName: 'Extravert', value: mbti.scores.E, key: 'EI' },
      { left: 'S', right: 'N', leftName: 'Sensing', rightName: 'Intuition', value: mbti.scores.N, key: 'SN' },
      { left: 'T', right: 'F', leftName: 'Thinking', rightName: 'Feeling', value: mbti.scores.F, key: 'TF' },
      { left: 'P', right: 'J', leftName: 'Perceiving', rightName: 'Judging', value: mbti.scores.J, key: 'JP' },
    ];
    const mbtiBars = dichotomies.map(d => {
      const pct = ((d.value - 1) / 4) * 100;
      const isRight = d.value >= 3;
      return `
        <div class="mbti-row">
          <div class="mbti-labels">
            <span class="${!isRight ? 'active' : ''}"><em>${d.left}</em> ${d.leftName}</span>
            <span class="${isRight ? 'active' : ''}">${d.rightName} <em>${d.right}</em></span>
          </div>
          <div class="bar mbti-bar">
            <div class="midline"></div>
            <div class="fill" style="left:${Math.min(pct, 50)}%; width:${Math.abs(pct - 50)}%; background:${COLORS.accent};"></div>
          </div>
          <div class="mbti-meta">Score ${d.value.toFixed(2)} · Clarity ${(mbti.clarity[d.key] * 100).toFixed(0)}%</div>
        </div>`;
    }).join('');

    let aiHTML = '';
    if (insights) {
      const strengthsHTML = insights.strengths.map(s => `
        <div class="ai-item" style="border-left-color:${COLORS.sage};">
          <strong>${s.title}</strong><p>${s.description}</p>
        </div>`).join('');
      const blindspotsHTML = insights.blindspots.map(b => `
        <div class="ai-item" style="border-left-color:${COLORS.accent};">
          <strong>${b.title}</strong><p>${b.description}</p>
        </div>`).join('');
      const habitsHTML = insights.habits.map(h => `
        <div class="habit-row" style="border-left-color:${TRAIT_META[h.trait]?.color || COLORS.muted};">
          <span class="habit-trait" style="color:${TRAIT_META[h.trait]?.color || COLORS.muted};">${TRAIT_META[h.trait]?.label || h.trait}</span>
          <span class="habit-text">${h.habit}</span>
        </div>`).join('');
      aiHTML = `
        <section class="page-break">
          <h2>AI Synthesis</h2>
          <div class="portrait">${insights.portrait}</div>
          <h3>What you bring</h3>
          ${strengthsHTML}
          <h3>Growth edges</h3>
          ${blindspotsHTML}
          <div class="patterns">
            <h3>How this profile shows up</h3>
            <div class="pattern-row"><span class="pattern-label">At work</span><p>${insights.patterns?.work || ''}</p></div>
            <div class="pattern-row"><span class="pattern-label">In close relationships</span><p>${insights.patterns?.relationships || ''}</p></div>
            <div class="pattern-row"><span class="pattern-label">Under stress</span><p>${insights.patterns?.stress || ''}</p></div>
          </div>
          <h3>One habit per trait</h3>
          ${habitsHTML}
        </section>`;
    }

    const reflectionQuestions = [
      'Which trait result feels most accurate?',
      'Which one surprises you?',
      'Which trait helps you most in family, work, or ministry?',
      'Which trait creates the most friction in your closest relationships?',
      'What is one habit that could help you balance your strongest tendency?',
      'When you read your AI synthesis, what part stings (and might be worth listening to)?',
    ];

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${name ? name + "'s" : 'My'} Personality Assessment</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Manrope', -apple-system, sans-serif;
    color: ${COLORS.ink};
    background: ${COLORS.paper};
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 32px;
    line-height: 1.6;
  }
  h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    font-size: 48px;
    letter-spacing: -0.01em;
    margin: 0 0 4px;
    color: ${COLORS.ink};
  }
  h2 {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    font-size: 32px;
    margin: 32px 0 16px;
    color: ${COLORS.ink};
    border-bottom: 1px solid ${COLORS.rule};
    padding-bottom: 8px;
  }
  h3 {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    font-size: 22px;
    margin: 24px 0 12px;
    color: ${COLORS.ink};
  }
  .meta {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${COLORS.muted};
    font-weight: 600;
    margin-bottom: 24px;
  }
  .trait-row { padding: 16px; margin-bottom: 12px; background: ${COLORS.cream}; border: 1px solid ${COLORS.rule}; }
  .trait-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .trait-name { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 20px; font-weight: 500; }
  .trait-score { font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 500; }
  .trait-level { font-family: 'Manrope', sans-serif; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: ${COLORS.muted}; margin-left: 8px; font-weight: 600; }
  .bar { height: 4px; background: ${COLORS.paper2}; position: relative; margin-bottom: 8px; }
  .fill { position: absolute; height: 100%; top: 0; left: 0; }
  .trait-desc { font-size: 13px; color: ${COLORS.ink2}; margin: 0; }
  .temperament-card { text-align: center; padding: 24px; background: ${COLORS.cream}; border: 1px solid ${COLORS.rule}; margin-bottom: 24px; }
  .temperament-name { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 40px; font-weight: 500; margin: 8px 0; }
  .temperament-meta { font-size: 12px; color: ${COLORS.muted}; margin-top: 12px; }
  .mbti-card { text-align: center; padding: 32px; background: ${COLORS.ink}; color: ${COLORS.cream}; margin-bottom: 24px; }
  .mbti-type { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 72px; letter-spacing: 0.1em; margin: 8px 0; }
  .mbti-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: ${COLORS.ochre}; font-weight: 600; }
  .mbti-blurb { font-size: 13px; opacity: 0.85; margin-top: 8px; }
  .mbti-row { margin-bottom: 16px; }
  .mbti-labels { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: ${COLORS.muted}; }
  .mbti-labels .active { color: ${COLORS.ink}; font-weight: 700; }
  .mbti-labels em { font-family: 'Fraunces', Georgia, serif; font-size: 16px; }
  .mbti-bar { height: 8px; }
  .midline { position: absolute; left: 50%; top: -4px; bottom: -4px; width: 1px; background: ${COLORS.muted}; }
  .mbti-meta { font-size: 11px; color: ${COLORS.muted}; margin-top: 4px; }
  .portrait { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 20px; line-height: 1.5; margin: 16px 0 24px; }
  .ai-item { padding: 0 0 0 16px; border-left: 2px solid; margin-bottom: 14px; }
  .ai-item strong { font-size: 13px; font-weight: 700; display: block; margin-bottom: 4px; }
  .ai-item p { font-size: 13px; margin: 0; color: ${COLORS.ink2}; }
  .patterns { background: ${COLORS.cream}; padding: 20px; border: 1px solid ${COLORS.rule}; margin: 16px 0; }
  .pattern-row { margin-bottom: 12px; }
  .pattern-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: ${COLORS.muted}; font-weight: 600; display: block; margin-bottom: 4px; }
  .pattern-row p { font-size: 13px; margin: 0; color: ${COLORS.ink2}; }
  .habit-row { padding: 10px 14px; margin-bottom: 8px; background: ${COLORS.cream}; border-left: 3px solid; display: flex; gap: 16px; align-items: baseline; }
  .habit-trait { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; min-width: 110px; }
  .habit-text { font-size: 13px; color: ${COLORS.ink2}; flex: 1; }
  .reflection-q { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
  .reflection-num { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 28px; color: ${COLORS.accent}; min-width: 36px; line-height: 1; padding-top: 4px; }
  .reflection-text { font-family: 'Fraunces', Georgia, serif; font-size: 17px; line-height: 1.4; }
  .disclaimer { font-size: 10px; font-style: italic; color: ${COLORS.muted}; text-align: center; border-top: 1px solid ${COLORS.rule}; padding-top: 24px; margin-top: 48px; }
  .print-btn { position: fixed; top: 16px; right: 16px; background: ${COLORS.accent}; color: ${COLORS.cream}; padding: 12px 20px; border: none; font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; z-index: 1000; border-radius: 2px; }
  @media print {
    .print-btn { display: none; }
    body { padding: 24px; max-width: none; }
    .page-break { page-break-before: always; }
    h2 { page-break-after: avoid; }
  }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">↓ Save as PDF</button>
<div class="meta">${dateStr} · Personality Assessment</div>
<h1>${name ? name + ',' : 'Your read,'}</h1>
<p style="color: ${COLORS.muted}; font-size: 15px; margin: 0 0 24px;">across three frameworks.</p>

<section>
  <h2>Big Five</h2>
  ${traitRows}
</section>

<section class="page-break">
  <h2>Four Temperaments</h2>
  <div class="temperament-card">
    <div class="meta" style="color: ${COLORS.sage}; margin: 0;">Primary temperament</div>
    <div class="temperament-name">${temperament.primary}</div>
    <p style="font-size: 14px; color: ${COLORS.ink2}; max-width: 480px; margin: 0 auto;">${TEMPERAMENT_BLURB[temperament.primary]}</p>
    <div class="temperament-meta">
      Profile clarity: <strong style="color: ${COLORS.ink2};">${temperament.clarity}</strong>
      ${temperament.secondary !== temperament.primary ? ` · Secondary lean: <strong style="color: ${COLORS.ink2};">${temperament.secondary}</strong>` : ''}
    </div>
    <div class="temperament-meta">E = ${temperament.E.toFixed(2)} · N = ${temperament.N.toFixed(2)}</div>
  </div>
</section>

<section class="page-break">
  <h2>MBTI-style Type</h2>
  <div class="mbti-card">
    <div class="mbti-label">MBTI-style type</div>
    <div class="mbti-type">${mbti.type}</div>
    <div class="mbti-blurb">${MBTI_BLURB[mbti.type] || ''}</div>
  </div>
  ${mbtiBars}
  <p style="font-size: 12px; font-style: italic; color: ${COLORS.muted}; margin-top: 16px;">
    This is an MBTI-style mapping derived from your Big Five plus 10 bridge items. It correlates with — but is not identical to — the official MBTI instrument.
  </p>
</section>

${aiHTML}

<section class="page-break">
  <h2>Reflection Questions</h2>
  <p style="color: ${COLORS.muted}; font-size: 13px; font-style: italic; margin-bottom: 24px;">Sit with these for a few minutes. Even better — talk one through with someone who knows you well.</p>
  ${reflectionQuestions.map((q, i) => `
    <div class="reflection-q">
      <span class="reflection-num">${i + 1}</span>
      <p class="reflection-text">${q}</p>
    </div>`).join('')}
</section>

<p class="disclaimer">
  This is a self-reflection tool, not a validated psychometric instrument.<br>
  Don't use it for hiring, clinical diagnosis, or judging anyone's character.
</p>

</body></html>`;

    // Render the printable view as an in-page overlay using an iframe.
    // This avoids popup blockers entirely and works inside the artifact sandbox.
    const existing = document.getElementById('pa-print-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pa-print-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      z-index: 99999; display: flex; flex-direction: column;
      padding: 0; margin: 0;
    `;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      background: ${COLORS.ink}; color: ${COLORS.cream};
      padding: 12px 20px; display: flex; gap: 12px; justify-content: space-between;
      align-items: center; font-family: 'Manrope', sans-serif;
    `;
    toolbar.innerHTML = `
      <span style="font-size: 13px; letter-spacing: 0.05em;">Printable view — use your browser's Print dialog (Cmd/Ctrl+P) and choose "Save as PDF"</span>
      <div style="display:flex; gap: 8px;">
        <button id="pa-print-btn" style="background:${COLORS.accent}; color:${COLORS.cream}; border:none; padding:8px 16px; font-family:Manrope,sans-serif; font-weight:600; font-size:13px; cursor:pointer; border-radius:2px;">Print / Save PDF</button>
        <button id="pa-close-btn" style="background:transparent; color:${COLORS.cream}; border:1px solid ${COLORS.cream}80; padding:8px 16px; font-family:Manrope,sans-serif; font-weight:600; font-size:13px; cursor:pointer; border-radius:2px;">Close</button>
      </div>
    `;
    overlay.appendChild(toolbar);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `flex: 1; width: 100%; border: none; background: ${COLORS.paper};`;
    overlay.appendChild(iframe);

    document.body.appendChild(overlay);

    // Write the HTML into the iframe's document
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Wire up buttons
    document.getElementById('pa-print-btn').onclick = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        alert('Press Cmd+P (Mac) or Ctrl+P (Windows) to save as PDF.');
      }
    };
    document.getElementById('pa-close-btn').onclick = () => overlay.remove();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.paper,
        backgroundImage: `radial-gradient(circle at 20% 10%, ${COLORS.paper2} 0%, transparent 40%), radial-gradient(circle at 80% 90%, ${COLORS.paper2} 0%, transparent 40%)`,
        color: COLORS.ink,
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {stage === 'loading' && (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${COLORS.rule}`,
              borderTopColor: COLORS.accent,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      {stage === 'welcome' && (
        <WelcomeScreen
          hasDraft={hasDraft}
          onBegin={() => setStage('context')}
          onResume={handleResume}
          onDiscard={async () => { await handleDiscard(); }}
        />
      )}
      {stage === 'context' && (
        <ContextScreen
          context={context}
          setContext={setContext}
          onNext={() => { setPage(0); setStage('quiz'); }}
          onBack={() => setStage('welcome')}
        />
      )}
      {stage === 'quiz' && (
        <QuestionnaireScreen
          page={page}
          answers={answers}
          setAnswer={setAnswer}
          onNext={() => {
            if (page < TOTAL_PAGES - 1) setPage(page + 1);
            else setStage('review');
          }}
          onBack={() => {
            if (page === 0) setStage('context');
            else setPage(page - 1);
          }}
          onJumpHome={() => setStage('welcome')}
        />
      )}
      {stage === 'review' && (
        <ReviewScreen
          answers={answers}
          onSubmit={handleSubmit}
          onEdit={() => { setPage(TOTAL_PAGES - 1); setStage('quiz'); }}
          onBack={() => setStage('quiz')}
        />
      )}
      {stage === 'computing' && (
        <LoadingScreen
          phase={computePhase}
          error={computeError}
          onRetry={() => handleSubmit()}
          onSkipAI={() => setStage('results')}
        />
      )}
      {stage === 'results' && results && (
        <ResultsScreen
          results={results}
          insights={insights}
          aiLoading={aiLoading}
          aiError={aiError}
          aiErrorDiagnostics={aiErrorDiagnostics}
          context={context}
          onRegenerate={handleRegenerate}
          onRestart={handleRestart}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}
