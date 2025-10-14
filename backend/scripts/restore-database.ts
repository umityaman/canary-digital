#!/usr/bin/env node
/**
 * PostgreSQL Database Restore Script
 * 
 * Kullanım:
 * npx ts-node scripts/restore-database.ts <backup-file-name.sql>
 * 
 * Örnek:
 * npx ts-node scripts/restore-database.ts backup-2025-10-12T10-30-00.sql
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(__dirname, '../backups');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL bulunamadı! .env dosyasını kontrol edin.');
  process.exit(1);
}

const backupFileName = process.argv[2];

if (!backupFileName) {
  console.error('❌ Backup dosya adı belirtilmedi!');
  console.log('Kullanım: npx ts-node scripts/restore-database.ts <backup-file-name.sql>');
  console.log('\nMevcut backuplar:');
  
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql'));
    files.forEach(f => console.log(`  - ${f}`));
  }
  
  process.exit(1);
}

async function restoreBackup() {
  try {
    const backupFile = path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(backupFile)) {
      console.error(`Backup dosyasi bulunamadi: ${backupFile}`);
      process.exit(1);
    }

    console.log('DIKKAT: Bu islem mevcut database tamamen degistirecek!');
    console.log(`Restore baslatiliyor: ${backupFileName}`);

    // psql komutu ile restore
    const command = `psql "${DATABASE_URL}" < "${backupFile}"`;

    await execAsync(command);

    console.log('Database basariyla restore edildi!');

  } catch (error: any) {
    console.error('❌ Restore hatası:', error.message);
    process.exit(1);
  }
}

// Restore'u çalıştır
restoreBackup();
