import { execSync, spawn } from 'node:child_process';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  chmodSync,
  unlinkSync,
  statSync,
} from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import path from 'node:path';
import os from 'node:os';

// --- Configuration ---
const DB_URL = process.env.DATABASE_URL;
const UPLOAD_URL = process.env.BACKUP_UPLOAD_URL;
const UPLOAD_METHOD = process.env.BACKUP_UPLOAD_METHOD || 'PUT';
const MIGRATION_CMD = process.env.MIGRATION_CMD || 'pnpm drizzle-kit migrate';

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const TEMP_BACKUP_PATH = path.join(process.cwd(), `backup-${TIMESTAMP}.sql.gz`);
const BIN_DIR = path.join(process.cwd(), '.bin');

// --- Pre-checks ---

/**
 * Ensures the script is running with Administrative / Sudo privileges
 */
function ensureAdminPrivileges(): void {
  const isWindows = process.platform === 'win32';

  if (!isWindows) {
    if (process.getuid && process.getuid() !== 0) {
      console.error(
        '❌ Error: This script must be run with root/sudo privileges.',
      );
      process.exit(1);
    }
  } else {
    try {
      execSync('net session', { stdio: 'ignore' });
    } catch {
      console.error(
        '❌ Error: This script must be run in an Administrator command prompt.',
      );
      process.exit(1);
    }
  }
}

/**
 * Checks if pg_dump is installed, otherwise downloads static binaries into a local directory
 */
async function ensurePgDumpBinary(): Promise<string> {
  // Check system PATH first
  try {
    execSync('pg_dump --version', { stdio: 'ignore' });
    return 'pg_dump';
  } catch {
    console.log(
      '⚠️ pg_dump not found in system PATH. Checking local binaries...',
    );
  }

  const localPgDumpPath = path.join(
    BIN_DIR,
    process.platform === 'win32' ? 'pg_dump.exe' : 'pg_dump',
  );

  if (existsSync(localPgDumpPath)) {
    return localPgDumpPath;
  }

  console.log('📦 Downloading standalone pg_dump binary...');
  mkdirSync(BIN_DIR, { recursive: true });

  const platform = os.platform();
  const arch = os.arch();

  // URL source for static pg_dump binaries (using standard prebuilt static binaries)
  let downloadUrl = '';
  if (platform === 'linux' && arch === 'x64') {
    downloadUrl =
      'https://github.com/eeacms/postgresql-client/raw/master/bin/linux/x86_64/pg_dump';
  } else {
    throw new Error(
      `Automatic pg_dump download is not configured for platform: ${platform}-${arch}. Please install postgresql-client manually.`,
    );
  }

  const res = await fetch(downloadUrl);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download pg_dump binary from ${downloadUrl}`);
  }

  const fileStream = createWriteStream(localPgDumpPath);
  await pipeline(res.body, fileStream);

  if (platform !== ('win32' as string)) {
    chmodSync(localPgDumpPath, 0o755);
  }

  console.log('✅ pg_dump binary downloaded successfully.');
  return localPgDumpPath;
}

// --- Operational Steps ---

function runMigrations(): void {
  console.log('🔄 Running database migrations...');
  try {
    execSync(MIGRATION_CMD, { stdio: 'inherit', env: process.env });
    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration step failed.');
    throw error;
  }
}

async function createCompressedDump(
  pgDumpBinary: string,
  connectionString: string,
  outputPath: string,
): Promise<void> {
  console.log(`📦 Creating compressed database dump: ${outputPath}`);

  const pgDump = spawn(
    pgDumpBinary,
    ['--dbname=' + connectionString, '--clean', '--if-exists'],
    { stdio: ['ignore', 'pipe', 'inherit'] },
  );

  const gzip = createGzip();
  const outputStream = createWriteStream(outputPath);

  await pipeline(pgDump.stdout, gzip, outputStream);
  console.log('✅ Compressed dump created successfully.');
}

async function uploadBackup(
  filePath: string,
  uploadUrl: string,
): Promise<void> {
  console.log('🚀 Uploading backup to remote endpoint...');
  const fileStats = statSync(filePath);
  const fileStream = createReadStream(filePath);

  const response = await fetch(uploadUrl, {
    method: UPLOAD_METHOD,
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Length': fileStats.size.toString(),
    },
    // @ts-expect-error Node fetch supports ReadableStream in body
    body: fileStream,
    duplex: 'half',
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed with status ${response.status}: ${response.statusText}`,
    );
  }

  console.log('✅ Backup successfully uploaded.');
}

// --- Main Execution ---

async function main(): Promise<void> {
  ensureAdminPrivileges();

  if (!DB_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is required.');
    process.exit(1);
  }

  try {
    const pgDumpExecutable = await ensurePgDumpBinary();

    runMigrations();
    await createCompressedDump(pgDumpExecutable, DB_URL, TEMP_BACKUP_PATH);

    if (UPLOAD_URL) {
      await uploadBackup(TEMP_BACKUP_PATH, UPLOAD_URL);
    } else {
      console.log('⚠️ BACKUP_UPLOAD_URL not set. Skipping upload step.');
    }
  } catch (error) {
    console.error('💥 Database operations failed:', error);
    process.exitCode = 1;
  } finally {
    if (existsSync(TEMP_BACKUP_PATH)) {
      console.log('🧹 Cleaning up temporary backup file...');
      unlinkSync(TEMP_BACKUP_PATH);
    }
  }
}

main();
