// database.mjs
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// La variable db queda interna en este módulo para que la usen las consultas SQL
let db = null; 

// la funcion connect_db ahora asigna a la variable interna
export function connect_db(path) {
    const dbPath = resolve(path);
    try {
        db = new DatabaseSync(dbPath);
        return db;
    } catch (err) {
        throw new Error("Error al conectar a la base de datos: " + err.message);
    }
}

export function createHashSHA256(cadena) {
    return createHash('sha256').update(cadena).digest('hex');
}


export function authenticate(username, password) {
    const loginPasswordHash = createHashSHA256(password);
    const sql = "SELECT count(*) as total FROM `user` WHERE username=? AND password=?";

    try {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, loginPasswordHash);
        return (row.total === 1);
    } catch (err) {
        throw err;
    }
}


export function authorize(username, endpointPath) {
    const sql = `
        SELECT count(*) as total
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN user u ON m.id_user = u.id
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ? 
          AND e.path = ?
    `;

    try {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, endpointPath);
        return row.total > 0;
    } catch (err) {
        console.error("Error consultando permisos:", err);
        throw err;
    }
}


export async function createUser(username, password) {
    const securePassword = createHashSHA256(password);
    const sql = "INSERT INTO user (username, password) VALUES (?, ?) RETURNING id";

    try {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, securePassword);
        return {
            id: row.id,
            username: username,
            password: securePassword
        };
    } catch (err) {
        throw err;
    }
}