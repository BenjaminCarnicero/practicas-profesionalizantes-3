import { readFileSync } from 'node:fs';
import { 
    dbInsertarUsuario, 
    dbEliminarUsuario,
    dbCrearGrupo, 
    dbEliminarGrupo, 
    dbAsignarUsuarioAGrupo, 
    dbQuitarUsuarioDeGrupo, 
    dbActualizarGrupoDeUsuario,
    dbCrearPermiso,       
    dbEliminarPermiso,    
    dbAsignarPermisoAGrupo, 
    dbQuitarPermisoDeGrupo  
} from './model.mjs';

// Vista principal
export function default_handler(request, response) {
    try {
        const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } catch (error) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: 'No se pudo cargar la vista principal.' }));
    }
}

// Helper para parsear de manera simple el body de peticiones POST/PUT
function parseBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => { body += chunk.toString(); });
        request.on('end', () => resolve(new URLSearchParams(body)));
        request.on('error', err => reject(err));
    });
}

// ABM de usuarios

// Crear usuario
export async function register_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use POST.' }));
    }

    try {
        const params = await parseBody(request);
        const username = params.get('username');
        const password = params.get('password');

        if (!username || !password) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Faltan parámetros: username y password son obligatorios' }));
        }

        const resultado = dbInsertarUsuario(username, password);

        response.writeHead(201, { 'Content-Type': 'application/json' }); // 210 Created es el correcto para alta
        response.end(JSON.stringify({
            status: true,
            result: username,
            id: resultado.id,
            description: 'USER_CREATED_BY_POST'
        }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Eliminar un usuario
export async function delete_user_handler(request, response) {
    if (request.method !== 'DELETE' && request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use DELETE (o POST).' }));
    }

    try {
        let id_user;
        if (request.method === 'POST') {
            const params = await parseBody(request);
            id_user = params.get('id_user');
        } else {
            const url = new URL(request.url, `http://${request.headers.host}`);
            id_user = url.searchParams.get('id_user');
        }

        if (!id_user) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Falta parámetro obligatorio: id_user' }));
        }

        const cambios = dbEliminarUsuario(id_user);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, removed_count: cambios }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}


// ABM de grupos

// Crear un grupo
export async function create_group_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use POST.' }));
    }

    try {
        const params = await parseBody(request);
        const name = params.get('name');

        if (!name) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Falta parámetro obligatorio: name' }));
        }

        const resultado = dbCrearGrupo(name);

        response.writeHead(210, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, id: resultado.id, name }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Eliminar un grupo
export async function delete_group_handler(request, response) {
    if (request.method !== 'DELETE' && request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use DELETE (o POST).' }));
    }

    try {
        let id_group;
        if (request.method === 'POST') {
            const params = await parseBody(request);
            id_group = params.get('id_group');
        } else {
            const url = new URL(request.url, `http://${request.headers.host}`);
            id_group = url.searchParams.get('id_group');
        }

        if (!id_group) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Falta parámetro obligatorio: id_group' }));
        }

        const cambios = dbEliminarGrupo(id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, removed_count: cambios }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}


// Asignacion/gestion de miembros en grupos

// Vincular usuario a grupo (Alta de miembro)
export async function assign_group_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use POST.' }));
    }

    try {
        const params = await parseBody(request);
        const id_user = params.get('id_user');
        const id_group = params.get('id_group');

        if (!id_user || !id_group) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Faltan parámetros obligatorios: id_user e id_group' }));
        }

        dbAsignarUsuarioAGrupo(id_user, id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, message: 'Usuario asignado al grupo con éxito' }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Eliminar usuario de un grupo (Baja de miembro)
export async function remove_group_handler(request, response) {
    // Si es POST, lee del body, sino lee de los Query Params de la URL
    try {
        let id_user, id_group;

        if (request.method === 'POST') {
            const params = await parseBody(request);
            id_user = params.get('id_user');
            id_group = params.get('id_group');
        } else {
            const url = new URL(request.url, `http://${request.headers.host}`);
            id_user = url.searchParams.get('id_user');
            id_group = url.searchParams.get('id_group');
        }

        if (!id_user || !id_group) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Faltan parámetros obligatorios: id_user e id_group' }));
        }

        const cambios = dbQuitarUsuarioDeGrupo(id_user, id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, removed_count: cambios }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Modificar el grupo de un usuario (Modificación)
export async function update_group_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Metodo no permitido. Use POST.' }));
    }

    try {
        const params = await parseBody(request);
        const id_user = params.get('id_user');
        const old_id_group = params.get('old_id_group');
        const new_id_group = params.get('new_id_group');

        if (!id_user || !old_id_group || !new_id_group) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ 
                status: false, 
                error: 'Faltan parámetros obligatorios: id_user, old_id_group y new_id_group' 
            }));
        }

        const cambios = dbActualizarGrupoDeUsuario(id_user, old_id_group, new_id_group);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, updated: cambios }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}


// ABM de Permisos (Endpoints)

// Crear un permiso (endpoint)
export async function create_permission_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Metodo no permitido. Use POST.' }));
    }

    try {
        const params = await parseBody(request);
        const path = params.get('path'); //path de la bd
        const method = params.get('method'); 

        if (!path || !method) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Faltan parámetros obligatorios: path y method' }));
        }

        const resultado = dbCrearPermiso(path, method);

        response.writeHead(210, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, id: resultado.id, path, method }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Eliminar un permiso (endpoint)
export async function delete_permission_handler(request, response) {
    if (request.method !== 'DELETE' && request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use DELETE (o POST).' }));
    }

    try {
        let id_endpoint;
        if (request.method === 'POST') {
            const params = await parseBody(request);
            id_endpoint = params.get('id_endpoint');
        } else {
            const url = new URL(request.url, `http://${request.headers.host}`);
            id_endpoint = url.searchParams.get('id_endpoint');
        }

        if (!id_endpoint) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Falta parámetro obligatorio: id_endpoint' }));
        }

        const cambios = dbEliminarPermiso(id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, removed_count: cambios }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}


// Vinculación de Permisos a grupos (access)
// Asignar permiso a grupo
export async function assign_permission_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ status: false, error: 'Método no permitido. Use POST.' }));
    }

    try {
        const params = await parseBody(request);
        const id_group = params.get('id_group');
        const id_endpoint = params.get('id_endpoint');

        if (!id_group || !id_endpoint) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Faltan parámetros obligatorios: id_group e id_endpoint' }));
        }

        dbAsignarPermisoAGrupo(id_group, id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, message: 'Permiso vinculado al grupo con éxito en tabla access' }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}

// Quitar el permiso de un grupo
export async function remove_permission_handler(request, response) {
    try {
        let id_group, id_endpoint;

        if (request.method === 'POST') {
            const params = await parseBody(request);
            id_group = params.get('id_group');
            id_endpoint = params.get('id_endpoint');
        } else {
            const url = new URL(request.url, `http://${request.headers.host}`);
            id_group = url.searchParams.get('id_group');
            id_endpoint = url.searchParams.get('id_endpoint');
        }

        if (!id_group || !id_endpoint) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify({ status: false, error: 'Faltan parámetros obligatorios: id_group e id_endpoint' }));
        }

        const cambios = dbQuitarPermisoDeGrupo(id_group, id_endpoint);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: true, removed_count: cambios }));
    } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: error.message }));
    }
}