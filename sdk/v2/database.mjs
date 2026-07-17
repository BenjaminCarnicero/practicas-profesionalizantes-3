import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
const dbPath = resolve(config.database.path);

let dbInstance = null;

export function getDatabaseConnection() {
    if (!dbInstance) {
        dbInstance = new DatabaseSync(dbPath);
    }
    return dbInstance;
}