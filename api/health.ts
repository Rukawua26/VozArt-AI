import { listProviders } from '../server/ai/registry.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const providers = listProviders().map(p => p.name);
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    version: '1.5.0',
    serverTime: Date.now(),
    providers,
  });
}
