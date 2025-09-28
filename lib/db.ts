import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 10, // maximum number of clients in the pool
  min: 2, // minimum number of clients in the pool
  allowExitOnIdle: true,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Retry logic for database queries
async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Database operation attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

export async function query(text: string, params?: unknown[]) {
  return executeWithRetry(async () => {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      const res = await client.query(text, params);
      return res;
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        params,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  });
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
}