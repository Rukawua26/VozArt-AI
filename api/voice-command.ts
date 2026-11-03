import { getProvider, listProviders } from '../server/ai/registry.js';
import { withTimeout } from '../server/ai/utils.js';
import { VoiceCommandSchema } from '../server/ai/schema.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const AI_PROVIDER_TIMEOUT_MS = parseInt(process.env.AI_PROVIDER_TIMEOUT_MS || '15000', 10);

  try {
    const parsed = VoiceCommandSchema.parse(req.body);
    const preferredName = parsed.provider || 'gemini';
    const preferredProvider = getProvider(preferredName);
    if (!preferredProvider) {
      return res.status(400).json({ type: 'ERROR', message: 'El proveedor seleccionado no está disponible.' });
    }
    if (parsed.model && !preferredProvider.models.includes(parsed.model)) {
      return res.status(400).json({ type: 'ERROR', message: 'El modelo seleccionado no está disponible para este proveedor.' });
    }

    const fallbackOrder = [preferredName, ...listProviders().map(p => p.name).filter(n => n !== preferredName)];
    let lastError: unknown;
    let results: any[] | null = null;
    let usedProvider = preferredName;

    for (const name of fallbackOrder) {
      const provider = getProvider(name);
      if (!provider) continue;
      try {
        const r = await withTimeout(
          provider.processCommand(parsed.text, {
            model: name === preferredName ? parsed.model : undefined,
            context: parsed.context,
            sessionId: parsed.sessionId,
          }),
          AI_PROVIDER_TIMEOUT_MS,
          name,
        );
        const nonError = r.filter((a: any) => a.action !== 'ERROR');
        if (nonError.length > 0) {
          results = r;
          usedProvider = name;
          break;
        }
        lastError = (r.find((a: any) => a.action === 'ERROR') as any)?.message || 'Error desconocido';
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (results) {
      return res.status(200).json({ type: 'AI_ACTIONS', actions: results, provider: usedProvider, fallback: usedProvider !== preferredName });
    } else {
      return res.status(200).json({ type: 'ERROR', message: `No se pudo procesar tu comando. ${lastError ? `Error: ${String(lastError)}` : 'Ningún proveedor AI respondió correctamente.' }` });
    }
  } catch (error: any) {
    return res.status(400).json({ type: 'ERROR', message: 'Error al procesar el comando', detail: String(error?.message || error) });
  }
}
