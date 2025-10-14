#!/usr/bin/env node
"use strict";
/**
 * Database Backup Script
 * Supports SQLite and PostgreSQL
 *
 * Kullanım:
 * 1. DATABASE_URL .env'de olmalı
 * 2. npm run backup
 * 3. Backup dosyası backups/ klasörüne kaydedilir
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const BACKUP_DIR = path_1.default.join(__dirname, '../backups');
const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';
// Backup klasörünü oluştur
if (!fs_1.default.existsSync(BACKUP_DIR)) {
    fs_1.default.mkdirSync(BACKUP_DIR, { recursive: true });
}
async function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const isSQLite = DATABASE_URL.startsWith('file:');
        if (isSQLite) {
            // SQLite backup
            const dbPath = DATABASE_URL.replace('file:', '');
            const dbFullPath = path_1.default.join(__dirname, '../prisma', dbPath.replace('./prisma/', ''));
            const backupFile = path_1.default.join(BACKUP_DIR, `backup-${timestamp}.db`);
            console.log('🔄 SQLite database backup başlatılıyor...');
            console.log(`📁 Source: ${dbFullPath}`);
            console.log(`📁 Target: ${backupFile}`);
            if (!fs_1.default.existsSync(dbFullPath)) {
                console.error(`❌ Database dosyası bulunamadı: ${dbFullPath}`);
                process.exit(1);
            }
            // Dosyayı kopyala
            fs_1.default.copyFileSync(dbFullPath, backupFile);
            const stats = fs_1.default.statSync(backupFile);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`✅ SQLite backup başarılı!`);
            console.log(`📊 Dosya boyutu: ${fileSizeMB} MB`);
            console.log(`📍 Konum: ${backupFile}`);
        }
        else {
            // PostgreSQL backup
            const backupFile = path_1.default.join(BACKUP_DIR, `backup-${timestamp}.sql`);
            console.log('🔄 PostgreSQL database backup başlatılıyor...');
            console.log(`📁 Dosya: ${backupFile}`);
            const command = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;
            await execAsync(command);
            const stats = fs_1.default.statSync(backupFile);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`✅ PostgreSQL backup başarılı!`);
            console.log(`📊 Dosya boyutu: ${fileSizeMB} MB`);
            console.log(`📍 Konum: ${backupFile}`);
        }
        // Eski backupları temizle (7 günden eski olanlar)
        cleanOldBackups();
    }
    catch (error) {
        console.error('❌ Backup hatası:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}
function cleanOldBackups() {
    const files = fs_1.default.readdirSync(BACKUP_DIR);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    files.forEach(file => {
        const filePath = path_1.default.join(BACKUP_DIR, file);
        const stats = fs_1.default.statSync(filePath);
        if (stats.mtime.getTime() < sevenDaysAgo) {
            fs_1.default.unlinkSync(filePath);
            console.log(`🗑️  Eski backup silindi: ${file}`);
        }
    });
}
// Backup'ı çalıştır
createBackup();
