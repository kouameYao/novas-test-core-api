/**
 * Database configuration for Prisma
 * Prisma uses DATABASE_URL environment variable
 * Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
 */
export const getDatabaseUrl = (): string => {
  // If DATABASE_URL is explicitly set, use it
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Otherwise, construct it from individual environment variables
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const username = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const database = process.env.DB_DATABASE || 'novascend_bank_api';

  return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
};
