import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';

// capa de base de datos
import { connect_db, authorize } from './database.mjs';

// controladores y el mapa de sesiones
import { 
    login_handler, 
    register_handler, 
    show_message_handler, 
    log_handler, 
    say_hello_handler, 
    userSessions 
} from './handlers.mjs';

function default_config() {
    return {
        server: {
            ip: '127.0.0.1',
            port: 3000,
            default_path: './index.html'
        },
        database: {
            path: './database.db'
        }
    };
}

function load_config() {
    let config = null;
    try {
        const data = readFileSync('./config.json', 'utf-8');
        config = JSON.parse(data);
        console.log("Configuración cargada correctamente.");
    } catch (error) {
        console.error("Error cargando config.json. Usando valores por defecto.");
        config = default_config();
    }
    return config;
}

const config = load_config();


connect_db(config.database.path);

// Ruteo
let router = new Map();
router.set('/login', login_handler);
router.set('/register', register_handler);
router.set('/showMessage', show_message_handler);
router.set('/log', log_handler);
router.set('/sayHello', say_hello_handler);

async function request_dispatcher(request, response) {
    // Cabeceras CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-api-key, X-API-Version');
    response.setHeader('X-API-Version', '1.0');

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname; 

    // A. Rutas públicas directas
    if (path === '/login' || path === '/register') {
        const handler = router.get(path);
        if (handler) return await handler(request, response);
    }

    // B. Identificación de usuario y validaciones
    const username = request.headers['x-user-id'] || 'invitado';
    const userSession = userSessions.get(username);

    // Autenticación en memoria
    if (userSession == null || !userSession.isActive()) {
        response.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ 
            exception: 'UnauthorizedException', 
            detail: `Acceso denegado. El usuario '${username}' debe iniciar sesión antes de ejecutar el procedimiento ${path}`
        }));
        return; 
    }

    // Autorización en base de datos
    const pathLimpio = path.substring(1);
    const isAuthorized = authorize(username, pathLimpio); // Tu función original

    if (!isAuthorized) {
        response.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ 
            exception: 'ForbiddenAccessException', 
            detail: `El usuario '${username}' no tiene permisos asignados para ejecutar el procedimiento ${path}`
        }));
        return; 
    }

    // Si pasa los la autenticacion y autorizacion, se deriva al controlador correspondiente
    const handler = router.get(path);
    if (handler) {
        return await handler(request, response);
    } else {
        response.writeHead(404);
        response.end('Método no encontrado');
    }
}

function start() {
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);