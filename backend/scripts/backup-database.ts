#!/usr/bin/env node
/**
 * Database Backup Script
 * Supports SQLite and PostgreSQL
 * 
 * Kullanım:
 * 1. DATABASE_URL .env'de olmalı
 * 2. npm run backup
 * 3. Backup dosyası backups/ klasörüne kaydedilir
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(__dirname, '../backups');
const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

// Backup klasörünü oluştur
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const isSQLite = DATABASE_URL.startsWith('file:');
    
    if (isSQLite) {
      // SQLite backup
      const dbPath = DATABASE_URL.replace('file:', '');
      const dbFullPath = path.join(__dirname, '../prisma', dbPath.replace('./prisma/', ''));
      const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.db`);

      console.log('🔄 SQLite database backup başlatılıyor...');
      console.log(`📁 Source: ${dbFullPath}`);
      console.log(`📁 Target: ${backupFile}`);

      if (!fs.existsSync(dbFullPath)) {
        console.error(`❌ Database dosyası bulunamadı: ${dbFullPath}`);
        process.exit(1);
      }

      // Dosyayı kopyala
      fs.copyFileSync(dbFullPath, backupFile);

      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ SQLite backup başarılı!`);
      console.log(`📊 Dosya boyutu: ${fileSizeMB} MB`);
      console.log(`📍 Konum: ${backupFile}`);
    } else {
      // PostgreSQL backup
      const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

      console.log('🔄 PostgreSQL database backup başlatılıyor...');
      console.log(`📁 Dosya: ${backupFile}`);

      const command = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;
      await execAsync(command);

      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ PostgreSQL backup başarılı!`);
      console.log(`📊 Dosya boyutu: ${fileSizeMB} MB`);
      console.log(`📍 Konum: ${backupFile}`);
    }

    // Eski backupları temizle (7 günden eski olanlar)
    cleanOldBackups();

  } catch (error: any) {
    console.error('❌ Backup hatası:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime.getTime() < sevenDaysAgo) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Eski backup silindi: ${file}`);
    }
  });
}

// Backup'ı çalıştır
createBackup();
