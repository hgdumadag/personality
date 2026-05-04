import { callConfiguredModel, extractText, getModel, getProvider } from './_ai.js';

export default async function handler(_request, response) {
  const startedAt = Date.now();
  const result = { provider: getProvider(), model: getModel(), startedAt: new Date(startedAt).toISOString() };
  try {
    const { provider, data } = await callConfiguredModel({ prompt: 'Reply with just the word OK.', maxTokens: 50 });
    result.ok = true;
    result.status = 200;
    result.provider = provider;
    result.textPreview = extractText(provider, data).slice(0, 120);
    result.bodyPreview = JSON.stringify(data).slice(0, 300);
  } catch (error) {
    result.ok = false;
    result.status = error.statusCode || 500;
    result.errorName = error.name;
    result.errorMessage = error.message;
  }
  result.durationMs = Date.now() - startedAt;
  return response.status(result.ok ? 200 : result.status).json({ results: [result] });
}
