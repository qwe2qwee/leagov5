// /utils/auth/retry.ts
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise<void>((resolve) =>
        setTimeout(resolve, delay * attempt)
      );
    }
  }
  throw new Error("Max retries exceeded");
};
