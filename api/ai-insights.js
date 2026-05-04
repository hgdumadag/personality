import { buildPrompt, callConfiguredModel, extractJsonObject, extractText, getModel, getProvider } from './_ai.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const diagnostics = { provider: getProvider(), model: getModel(), startedAt: new Date().toISOString(), phases: [] };
  try {
    diagnostics.phases.push('building_prompt');
    const prompt = buildPrompt(request.body || {});
    diagnostics.promptLength = prompt.length;
    diagnostics.phases.push('calling_model');
    const { provider, data } = await callConfiguredModel({ prompt });
    diagnostics.provider = provider;
    diagnostics.contentBlockCount = Array.isArray(data.content) ? data.content.length : undefined;
    diagnostics.outputItemCount = Array.isArray(data.output) ? data.output.length : undefined;
    const text = extractText(provider, data);
    if (!text) throw new Error(`${provider} response did not include text content.`);
    diagnostics.phases.push('parsing_json');
    const insights = extractJsonObject(text);
    diagnostics.phases.push('success');
    return response.status(200).json({ insights, diagnostics });
  } catch (error) {
    diagnostics.phases.push('failed');
    return response.status(error.statusCode || 500).json({ error: error.message || 'AI synthesis failed', diagnostics });
  }
}
