import { readFileSync } from 'node:fs';


export function default_handler(request, response, config) {
    try {
        // config por parametro
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } catch (error) {
        response.writeHead(500);
        response.end('Error interno: No se pudo cargar la vista principal.');
    }
}

export async function register_handler(request, response, db, insertarUsuario) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.end('Método no permitido. Use POST.');
        return;
    }

    let body = '';
    request.on('data', (chunk) => {
        body += chunk.toString();
    });

    request.on('end', async () => {
        try {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');

            if (!username || !password) {
                throw new Error('Faltan datos obligatorios');
            }

            // funcion incersion viene por parametro
            const resultado = await insertarUsuario(db, username, password);

            const output = {
                status: true,
                result: username,
                id: resultado.id,
                description: 'USER_CREATED_BY_POST'
            };

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));

        } catch (error) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ 
                status: false, 
                description: 'ERROR_PROCESSING_POST',
                message: error.message 
            }));
        }
    });
}


// --- ALTA: Vincular usuario a grupo (Tabla members) ---
export async function assign_group_handler(request, response, db) {
    if (request.method !== 'POST') {
        response.writeHead(405);
        return response.end('Método no permitido. Use POST.');
    }

    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', async () => {
        try {
            const params = new URLSearchParams(body);
            const id_user = params.get('id_user');
            const id_group = params.get('id_group');

            const sql = `INSERT INTO members (id_user, id_group) VALUES (?, ?)`;
            
            db.run(sql, [id_user, id_group], function(err) {
                if (err) throw err;
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ status: true, message: 'Usuario asignado al grupo' }));
            });
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: error.message }));
        }
    });
}


// --- BAJA: Quitar usuario de un grupo ---
export async function remove_group_handler(request, response, db) {
    // Usamos GET con parámetros en la URL para la baja rápida
    const url = new URL(request.url, `http://${request.headers.host}`);
    const id_user = url.searchParams.get('id_user');
    const id_group = url.searchParams.get('id_group');

    const sql = `DELETE FROM members WHERE id_user = ? AND id_group = ?`;

    db.run(sql, [id_user, id_group], function(err) {
        if (err) {
            response.writeHead(500);
            return response.end(JSON.stringify({ status: false, error: err.message }));
        }
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, removed_count: this.changes }));
    });
}


// --- MODIFICACIÓN: Actualizar el grupo de un usuario ---
export async function update_group_handler(request, response, db) {
    if (request.method !== 'POST') {
        response.writeHead(405);
        return response.end('Use POST para modificar');
    }

    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', () => {
        const params = new URLSearchParams(body);
        const id_user = params.get('id_user');
        const old_id_group = params.get('old_id_group');
        const new_id_group = params.get('new_id_group');

        const sql = `UPDATE members SET id_group = ? WHERE id_user = ? AND id_group = ?`;

        db.run(sql, [new_id_group, id_user, old_id_group], function(err) {
            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({ status: false, error: err.message }));
            }
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true, updated: this.changes }));
        });
    });
}