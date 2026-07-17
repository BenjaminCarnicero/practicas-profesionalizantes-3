// main.mjs
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { getDatabaseConnection } from './database.mjs';
import { checkPermission } from './auth.mjs';
import { 
    default_handler, 
    register_handler,
    delete_user_handler,
    create_group_handler,
    delete_group_handler,
    assign_group_handler, 
    remove_group_handler, 
    update_group_handler 
} from './handlers.mjs';

// Leemos la configuración inicial
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// conexion a base de datos
getDatabaseConnection();

// Función auxiliar para simular el login manual de la v2
function login(input) {
    const userdata = { username: 'admin', password: '1234' };
    if (input.username === userdata.username && input.password === userdata.password) {
        return { status: true, result: input.username, description: null };
    }
    return { status: false, result: null, description: 'INVALID_USER_PASS' };
}

// Handler para el login (simulado)
async function login_handler(request, response) {
    const url = new URL(request.url, `http://${config.server.ip}`);
    const input = Object.fromEntries(url.searchParams);
    const output = login(input);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

// Mapeo de rutas para el router (Todos los ABM requeridos)
const router = new Map();

// Vistas y Auth Básica
router.set('/', default_handler);
router.set('/login', login_handler);

// ABM Usuarios
router.set('/register', register_handler);       // Alta usuario (POST)
router.set('/delete-user', delete_user_handler); // Baja usuario (DELETE / POST)

// ABM Grupos
router.set('/create-group', create_group_handler); // Alta grupo (POST)
router.set('/delete-group', delete_group_handler); // Baja grupo (DELETE / POST)

// ABM Relaciones (Miembros de grupos)
router.set('/assign-group', assign_group_handler); // Asignar (POST)
router.set('/remove-group', remove_group_handler); // Remover (POST / GET)
router.set('/update-group', update_group_handler); // Modificar (POST)


// Despachador central de peticiones
async function request_dispatcher(request, response) {
    const url = new URL(request.url, `http://${config.server.ip}`);
    const path = url.pathname;
    const method = request.method;

    //Simulación de usuario para el peaje
    const username = url.searchParams.get('user') || 'guest';

    try {
        // Peaje de verificación de permisos
        if (path !== '/' && path !== '/login') {
            const hasPermission = checkPermission(username, path, method);

            if (!hasPermission) {
                response.writeHead(403, { 'Content-Type': 'application/json' });
                return response.end(JSON.stringify({ 
                    status: false, 
                    error: 'Acceso denegado', 
                    message: `El usuario ${username} no tiene permiso para ${path} [${method}]` 
                }));
            }
        }

        // Ejecución del Handler correspondiente
        const handler = router.get(path);

        if (handler) {
            await handler(request, response);
        } else {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: false, error: 'Ruta no encontrada' }));
        }

    } catch (error) {
        console.error("Error en el dispatcher central:", error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ status: false, error: 'Error interno del servidor' }));
    }
}

// Inicialización del servidor
createServer(request_dispatcher).listen(config.server.port, config.server.ip, () => {
    console.log(`Servidor v2 corregido corriendo en http://${config.server.ip}:${config.server.port}`);
});