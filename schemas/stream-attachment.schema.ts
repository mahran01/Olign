import { z } from "zod";

export const StreamCustomAttachmentSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['task'])
});

export type StreamCustomAttachmentType = z.infer<typeof StreamCustomAttachmentSchema>;