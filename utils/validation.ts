// -------------------------
// VALIDATION UTILS
// -------------------------
import { useCallback } from 'react';
import { z } from 'zod';

export const validate = <T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> => {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.error(result.error.flatten());
        throw new Error('Validation failed');
    }
    return result.data;
};

export const validateArray = <T extends z.ZodTypeAny>(schema: T, data: unknown[]): z.infer<T>[] => {
    const result = z.array(schema).safeParse(data);
    if (!result.success) {
        console.error(result.error.format());
        throw new Error('Array validation failed');
    }
    return result.data;
};

// Reusable hook for validation in forms or APIs
export const useZodValidator = <T extends z.ZodTypeAny>(schema: T) => {
    return useCallback(
        (data: unknown): z.infer<T> => {
            const result = schema.safeParse(data);
            if (!result.success) {
                console.error(result.error.flatten());
                throw new Error('Validation failed');
            }
            return result.data;
        },
        [schema]
    );
};