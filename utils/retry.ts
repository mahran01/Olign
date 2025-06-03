export async function retryOperation(
    operation: () => Promise<any>,
    retries: number = 3,
    delay: number = 1000
): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === retries) {
                throw new Error(`Operation failed after ${retries} attempts: ${error}`);
            }
            console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Retries the given async operation with exponential backoff + full jitter.
 *
 * @param operation - function that returns a Promise<T>
 * @param name - name of the operation for debug
 * @param retries - how many times to retry before giving up
 * @param baseDelay - initial backoff in ms
 * @param maxDelay - maximum backoff in ms
 */
export async function retryWithJitter<T>(
    operation: () => Promise<T>,
    {
        name = '',
        retries = 5,
        baseDelay = 1000,
        maxDelay = 10000,
    } = {}
): Promise<T> {

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (err) {
            if (attempt === retries) {
                // last attempt, rethrow
                throw new Error(`Operation failed after ${retries} attempts: ${err}`);
            }
            // full jitter: random between 0 and cap
            const expo = baseDelay * 2 ** attempt;
            const delay = Math.min(maxDelay, expo) * Math.random();
            console.warn(`Attempt ${attempt} failed, retrying ${name ? `operation ${name}` : ''} in ${Math.round(delay)}ms…`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    // unreachable
    throw new Error('retryWithJitter: unexpected exit');
}