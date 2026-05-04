const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

export function getProvider() {
  return (process.env.AI_PROVIDER || process.env.LLM_PROVIDER || 'openai').toLowerCase();
}

export function getModel() {
  return getProvider() === 'anthropic'
    ? process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL
    : process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
}

function safeText(value, max = 400) {
  return String(value || '').replace(/[^\x20-\x7E\n]/g, '').slice(0, max);
}

function levelOf(score) {
  if (score == null) return 'unknown';
  if (score >= 4.21) return 'Very high';
  if (score >= 3.41) return 'High';
  if (score >= 2.61) return 'Moderate';
  if (score >= 1.81) return 'Low';
  return 'Very low';
}

export function buildPrompt({ context = {}, bigFive = {}, temperament = {}, mbti = {} }) {
  const audience = safeText(context.audience) || 'mixed';
  const note = safeText(context.note);
  const scoresLine = Object.entries(bigFive)
    .map(([key, value]) => `${key}=${Number(value).toFixed(2)} (${levelOf(value)})`)
    .join('; ');

  return `You are a personality coach. Synthesize this self-assessment.

Big Five: ${scoresLine}
Temperament: ${safeText(temperament.primary)} (clarity: ${safeText(temperament.clarity)}, secondary: ${safeText(temperament.secondary)})
MBTI-style: ${safeText(mbti.type)}
Audience: ${audience}${note ? `\nTheir note: ${note}` : ''}

Return ONLY a valid JSON object, no markdown fences, no preamble. Begin with { and end with }. Schema:

{"portrait":"2 sentences, second person, integrated read across frameworks, specific","strengths":[{"title":"3-5 words","description":"1 sentence with concrete example"}],"blindspots":[{"title":"3-5 words","description":"1 sentence on growth edge"}],"patterns":{"work":"1 sentence","relationships":"1 sentence","stress":"1 sentence"},"habits":[{"trait":"openness","habit":"1 sentence"}]}

Provide exactly 3 strengths, 3 blindspots, and 5 habits. The 5 habits must use trait values: openness, conscientiousness, extraversion, agreeableness, neuroticism (one each). Reference actual score patterns. Warm, direct, no horoscope cliches.`;
}

export function extractJsonObject(text) {
  let cleaned = String(text || '').replace(/```(?:json)?\s*|\s*```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) cleaned = cleaned.slice(first, last + 1);
  return JSON.parse(cleaned);
}

export function extractText(provider, data) {
  if (provider === 'openai') {
    if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
    return (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((content) => content && content.type === 'output_text')
      .map((content) => content.text || '')
      .join('\n');
  }
  return (data.content || [])
    .filter((block) => block && block.type === 'text')
    .map((block) => block.text || '')
    .join('\n');
}

async function callOpenAI({ prompt, maxTokens }) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('Missing OPENAI_API_KEY environment variable.');
    error.statusCode = 500;
    throw error;
  }
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: getModel(),
      input: prompt,
      max_output_tokens: maxTokens,
      reasoning: { effort: process.env.OPENAI_REASONING_EFFORT || 'low' },
    }),
  });
  const rawText = await response.text();
  if (!response.ok) {
    const error = new Error(`OpenAI HTTP ${response.status}: ${rawText.slice(0, 500)}`);
    error.statusCode = response.status;
    throw error;
  }
  return JSON.parse(rawText);
}

async function callAnthropic({ prompt, maxTokens }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = new Error('Missing ANTHROPIC_API_KEY environment variable.');
    error.statusCode = 500;
    throw error;
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: getModel(),
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const rawText = await response.text();
  if (!response.ok) {
    const error = new Error(`Anthropic HTTP ${response.status}: ${rawText.slice(0, 500)}`);
    error.statusCode = response.status;
    throw error;
  }
  return JSON.parse(rawText);
}

export async function callConfiguredModel({ prompt, maxTokens = 1000 }) {
  const provider = getProvider();
  if (provider === 'openai') return { provider, data: await callOpenAI({ prompt, maxTokens }) };
  if (provider === 'anthropic') return { provider, data: await callAnthropic({ prompt, maxTokens }) };
  const error = new Error(`Unsupported AI_PROVIDER "${provider}". Use "openai" or "anthropic".`);
  error.statusCode = 500;
  throw error;
}
