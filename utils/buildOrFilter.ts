export function buildOrFilter(conditions: (string | null | undefined)[]): string | null {
    const validConditions = conditions.filter(Boolean);
    return validConditions.length > 0 ? validConditions.join(',') : null;
}