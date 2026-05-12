// auth.mjs

/**
 * Verifica si un usuario pertenece a un grupo que tiene acceso a un endpoint específico.
 * Cruza: user -> members -> group -> access -> endpoint
 */
// auth.mjs
export function checkPermission(db, username, path, method) {
    // Quitamos "e.method = ?" de la consulta para que el peaje sea más flexible
    const sql = `
        SELECT 1 FROM user u
        JOIN members m ON u.id = m.id_user
        JOIN "group" g ON m.id_group = g.id
        JOIN access a ON g.id = a.id_group
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ? AND e.path = ?
    `;

    return new Promise((resolve, reject) => {
        // Ahora solo pasamos username y path
        db.get(sql, [username, path], (err, row) => {
            if (err) {
                console.error("Error en SQL de permisos:", err);
                return reject(err);
            }
            resolve(!!row);
        });
    });
}

// Función para obtener los grupos de un usuario (útil para auditoría)
export function getUserGroups(db, username) {
    const sql = `
        SELECT g.name FROM "group" g
        JOIN members m ON g.id = m.group_id
        JOIN user u ON m.user_id = u.id
        WHERE u.username = ?
    `;
    return new Promise((resolve, reject) => {
        db.all(sql, [username], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.name));
        });
    });
}