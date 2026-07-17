import { getDatabaseConnection } from './database.mjs';

// Modelo de usuarios

export function dbInsertarUsuario(username, password) {
    const db = getDatabaseConnection();
    const query = db.prepare('INSERT INTO user (username, password) VALUES (?, ?)');
    const result = query.run(username, password);
    return { id: result.lastInsertRowid };
}

export function dbObtenerUsuarioPorId(id) {
    const db = getDatabaseConnection();
    const query = db.prepare('SELECT id, username FROM user WHERE id = ?');
    return query.get(id);
}

export function dbEliminarUsuario(id) {
    const db = getDatabaseConnection();
    const query = db.prepare('DELETE FROM user WHERE id = ?');
    const result = query.run(id);
    return result.changes; // Retorna cantidad de filas afectadas
}


// El modelo de grupos

export function dbCrearGrupo(name) {
    const db = getDatabaseConnection();
    const query = db.prepare('INSERT INTO "group" (name) VALUES (?)');
    const result = query.run(name);
    return { id: result.lastInsertRowid };
}

export function dbEliminarGrupo(id) {
    const db = getDatabaseConnection();
    const query = db.prepare('DELETE FROM "group" WHERE id = ?');
    const result = query.run(id);
    return result.changes;
}


// Modelo de miembros (se asignan a grupos)

export function dbAsignarUsuarioAGrupo(id_user, id_group) {
    const db = getDatabaseConnection();
    const query = db.prepare('INSERT INTO members (id_user, id_group) VALUES (?, ?)');
    const result = query.run(id_user, id_group);
    return result.changes;
}

export function dbQuitarUsuarioDeGrupo(id_user, id_group) {
    const db = getDatabaseConnection();
    const query = db.prepare('DELETE FROM members WHERE id_user = ? AND id_group = ?');
    const result = query.run(id_user, id_group);
    return result.changes;
}

export function dbActualizarGrupoDeUsuario(id_user, old_id_group, new_id_group) {
    const db = getDatabaseConnection();
    const query = db.prepare('UPDATE members SET id_group = ? WHERE id_user = ? AND id_group = ?');
    const result = query.run(new_id_group, id_user, old_id_group);
    return result.changes;
}