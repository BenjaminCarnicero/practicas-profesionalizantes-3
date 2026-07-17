import { getDatabaseConnection } from './database.mjs';

/**
 Verifica si un usuario pertenece a un grupo que tiene acceso a un endpoint específico.
 Cruza: user -> members -> group -> access -> endpoint
 */
export function checkPermission(username, path, method) {
    const db = getDatabaseConnection();

    // Consulta sql
    const sql = `
        SELECT 1 FROM user u
        JOIN members m ON u.id = m.id_user
        JOIN "group" g ON m.id_group = g.id
        JOIN access a ON g.id = a.id_group
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ? AND e.path = ?
    `;

    try {
        const query = db.prepare(sql);
        const row = query.get(username, path);
        return !!row; // Retorna true si encontró coincidencia (permiso concedido), o false si no
    } catch (err) {
        console.error("Error al verificar permisos en la base de datos:", err);
        return false;
    }
}

// Obtiene los nombres de los grupos a los que pertenece un usuario
export function getUserGroups(username) {
    const db = getDatabaseConnection();
    const sql = `
        SELECT g.name FROM "group" g
        JOIN members m ON g.id = m.id_group
        JOIN user u ON m.id_user = u.id
        WHERE u.username = ?
    `;

    try {
        const query = db.prepare(sql);
        const rows = query.all(username);
        return rows.map(r => r.name);
    } catch (err) {
        console.error("Error al obtener grupos de usuario:", err);
        return [];
    }
}