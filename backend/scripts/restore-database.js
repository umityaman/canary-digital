#!/usr/bin/env node
"use strict";
/**
 * PostgreSQL Database Restore Script
 *
 * Kullanım:
 * npx ts-node scripts/restore-database.ts <backup-file-name.sql>
 *
 * Örnek:
 * npx ts-node scripts/restore-database.ts backup-2025-10-12T10-30-00.sql
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
    if (fs_1.default.existsSync(BACKUP_DIR)) {
        const files = fs_1.default.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql'));
        files.forEach(f => console.log(`  - ${f}`));
    }
    process.exit(1);
}
async function restoreBackup() {
    try {
        const backupFile = path_1.default.join(BACKUP_DIR, backupFileName);
        if (!fs_1.default.existsSync(backupFile)) {
            console.error(`Backup dosyasi bulunamadi: ${backupFile}`);
            process.exit(1);
        }
        console.log('DIKKAT: Bu islem mevcut database tamamen degistirecek!');
        console.log(`Restore baslatiliyor: ${backupFileName}`);
        // psql komutu ile restore
        const command = `psql "${DATABASE_URL}" < "${backupFile}"`;
        await execAsync(command);
        console.log('Database basariyla restore edildi!');
    }
    catch (error) {
        console.error('❌ Restore hatası:', error.message);
        process.exit(1);
    }
}
// Restore'u çalıştır
restoreBackup();
