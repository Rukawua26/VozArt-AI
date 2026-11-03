import { z } from 'zod';

export const VoiceCommandSchema = z.object({
  type: z.literal('VOICE_COMMAND'),
  text: z.string().trim().min(1).max(1000),
  provider: z.string().trim().min(1).max(50).optional(),
  model: z.string().trim().min(1).max(100).optional(),
  context: z.string().max(2000).optional(),
  sessionId: z.string().max(80).optional(),
});
