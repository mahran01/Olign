import { z } from 'zod';

export const zDateInput = z.date(); // accepts Date objects
export const zDateInputOptional = z.date().optional().nullable();

export const zDateISO = zDateInput.transform((d) => d.toISOString());
export const zDateISOOptional = zDateInputOptional.transform((d) => d ? d.toISOString() : null);

export const zISODate = z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid datetime',
}).transform((val) => new Date(val));

export const zISODateOptional = z.string().optional().nullable().refine(
    (val) => val == null || !isNaN(Date.parse(val)),
    { message: 'Invalid datetime' }
).transform((val) => (val ? new Date(val) : null));