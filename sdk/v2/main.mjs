import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import sqlite3 from 'sqlite3';
import { resolve } from 'node:path';
import { checkPermission } from './auth.mjs';
import { 
    default_handler, 
    register_handler, 
    assign_group_handler, 
    remove_group_handler, 
    update_group_handler  } from './handlers.mjs';


const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// conexion a base de datos
const db = new sqlite3.Database(resolve(config.database.path));


export function insertarUsuario(db, username, password) {
  const sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [username, password], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}



function login(input) {
  const userdata = { username: 'admin', password: '1234' };
  if (input.username === userdata.username && input.password === userdata.password) {
    return { status: true, result: input.username, description: null };
  }
  return { status: false, result: null, description: 'INVALID_USER_PASS' };
}


async function login_handler(request, response) {
  const url = new URL(request.url, `http://${config.server.ip}`);
  const input = Object.fromEntries(url.searchParams);
  const output = login(input);
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(output));
}



const router = new Map();
router.set('/', (req, res) => default_handler(req, res, config));
router.set('/login', login_handler);
router.set('/register', (req, res) => register_handler(req, res, db, insertarUsuario));
// ... dentro del Map del router:
router.set('/assign-group', (req, res) => assign_group_handler(req, res, db));
router.set('/remove-group', (req, res) => remove_group_handler(req, res, db));
router.set('/update-group', (req, res) => update_group_handler(req, res, db));


async function request_dispatcher(request, response) {
  const url = new URL(request.url, `http://${config.server.ip}`);
  const path = url.pathname;
  const method = request.method;

  // 1. Simulación de usuario (Punto clave para la v2)
  // Como todavía no hay JWT, leemos un usuario de la URL o usamos 'guest'
  const username = url.searchParams.get('user') || 'guest';

  try {
    // 2. Verificación de permisos (El "Peaje")
    // Solo verificamos para rutas que no sean la raíz o el login
    if (path !== '/' && path !== '/login') {
      const hasPermission = await checkPermission(db, username, path, method);

      if (!hasPermission) {
          response.writeHead(403, { 'Content-Type': 'application/json' });
          return response.end(JSON.stringify({ 
              status: false, 
              error: 'Acceso denegado', 
              message: `El usuario ${username} no tiene permiso para ${path} [${method}]` 
          }));
      }
    }

    // 3. Ejecución del Handler (Si pasó el peaje)
    const handler = router.get(path);

    if (handler) {
      await handler(request, response);
    } else {
      response.writeHead(404);
      response.end('Ruta no encontrada');
    }

  } catch (error) {
    console.error("Error en el dispatcher:", error);
    response.writeHead(500);
    response.end('Error interno de servidor');
  }
}




createServer(request_dispatcher).listen(config.server.port, config.server.ip, () => {
  console.log(`Servidor v1 en http://${config.server.ip}:${config.server.port}`);
});