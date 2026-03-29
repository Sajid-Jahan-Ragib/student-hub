import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function loadEnvFile() {
  const envPath = path.resolve(projectRoot, '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore when .env is not present; process env can still provide values.
  }
}

await loadEnvFile();

const targetArg = (process.argv[2] || 'local').toLowerCase();
const envKeyMap = {
  local: 'DATABASE_URL',
  staging: 'STAGING_DATABASE_URL',
  tunnel: 'TUNNEL_DATABASE_URL',
};
const envKey = envKeyMap[targetArg] || 'DATABASE_URL';
const dbUrl = process.env[envKey];

if (!dbUrl) {
  console.error(`[db-check] Missing ${envKey} in environment.`);
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log(`[db-check] ${targetArg} database connection successful.`);
} catch (error) {
  console.error(`[db-check] ${targetArg} database connection failed:`, error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
