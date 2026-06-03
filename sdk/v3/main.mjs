import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

function default_config() 
{
    const config = 
    {
        server: 
        {
            ip: '127.0.0.1',
            port: 3000,
            default_path: './index.html'
        },
        database: 
        {
            path: './database.db'
        }
    };

    return config;
}

function load_config() 
{
    let config = null;
    try 
    {
        const data = readFileSync('./config.json', 'utf-8');
        config = JSON.parse(data);
        console.log("Configuración cargada correctamente.");
    } 
    catch (error) 
    {
        console.error("Error cargando config.json. Usando valores por defecto.");
        config = default_config();
    }
    return config;
}

const config = load_config();

function connect_db(path) 
{
    const dbPath = resolve(path);
    try 
    {
        const db = new DatabaseSync(dbPath);
        return db;
    } 
    catch (err) 
    {
        throw new Error("Error al conectar a la base de datos: " + err.message);
    }
}


let userSessions = new Map();  //clave-valor: clave: id_user,  valor: sessionObj

class UserSession
{
    constructor(username)
    {
        this.username = username;
        this.status = 'enabled';     // Nace activa tras un login exitoso
        this.createdAt = new Date(); // Almacena la hora de inicio
    }

    isActive() {
        return this.status === 'enabled';
    }

    invalidate() {
        this.status = 'disabled';
    }
}


function authenticate( username, password )
{
    //Debe ir a la base de datos y buscar si existe un registro  username/password que coincide
    //Si es verdadero entonces significa que estoy autenticado, sino no.

    const sql = "SELECT count(*) as total FROM `user` WHERE username=? AND password=?";

    try 
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, password);
            
        return (row.total === 1);
    } 
    catch (err) 
    {
        throw err;
    }
}


function authorize( username, endpointPath )
{
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
        // Pasamos los parametros en orden
        const row = stmt.get(username, endpointPath);

        // Si el conteo es mayor a 0, tiene permiso
        return row.total > 0;
    } catch (err) {
        console.error("Error consultando permisos:", err);
        throw err;
    }
}

// Control de flujo de Sesiones (en memoria)
function login( username, password )
{
    let isAuthenticated = authenticate(username, password);

    if ( isAuthenticated )
    {
        // Buscamos si ya existe una sesión en la memoria para el username
        let previusSession = userSessions.get(username);

        if ( previusSession == null )
        {
            // No hay sesión previa, se crea una nueva instanciando la clase
            let newSession = new UserSession(username);
            userSessions.set(username, newSession);
            return newSession;
        }
        else
        {
            // RE-INGRESO: Ya existía el objeto en memoria, se cambia su estado a enabled
            if ( previusSession.status == 'disabled')
            {
                previusSession.status = 'enabled';
            }
            return previusSession;
        }
    }
    else
    {
        return null; // Credenciales inválidas en la base de datos
    }
}

function logout(username, password)
{
    let isAuthenticated = authenticate(username, password);

    if ( isAuthenticated )
    {
        let currentSession = userSessions.get(username);
        if (currentSession) {
            currentSession.invalidate(); // Metodo de la clase (Separación de responsabilidades)
        }
    }
}

// Lógica de negocio
async function createUser(db, username, password) 
{
    const sql = "INSERT INTO user (username, password) VALUES (?, ?) RETURNING id";

    try 
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, password);

        const result = 
        {
            id: row.id,
            username: username,
            password: password
        };
        
        return result;
    } 
    catch (err) 
    {
        throw err;
    }
}

const db = connect_db(config.database.path);
//const output = await createUser(db, 'test', '123456789');



// Manejadores
async function login_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    
    if ( request.method == "POST" )
    {
       let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', async () => 
        {
            try 
            {
                // Convertimos el string a objeto (asumiendo que envían JSON)
                const input = JSON.parse(body);

                // Procesamos el login
                const output = login(input.username, input.password); //El resultado es nulo o un objeto de sesión

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(output));
            } 
            catch (err) 
            {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
            }
        });
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
  
    
}

function default_handler(request, response)
{
    try 
    {
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } 
    catch (error) 
    {
        response.writeHead(500);
        response.end('Error interno: No se pudo cargar la vista principal.');
    }
}

async function register_handler(request, response)
{
    //Caso GET
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    try 
    {
        const output = await createUser(db, 'test', '123456789');

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    }
    catch (err)
    {
        response.writeHead(500);
        response.end(JSON.stringify({ error: err.message }));
    }
}

function show_message_handler(request, response)
{
    console.log("Petición recibida: Mostrando mensaje en el servidor!");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}

function log_handler(request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: true, message: "¡Éxito! El endpoint log se ejecutó correctamente." }));
}

function say_hello_handler(request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: true, message: "El autorizador falló" }));
}

// Ruteo
let router = new Map();
router.set('/', default_handler);
router.set('/login', login_handler);

router.set('/register', register_handler);
router.set('/showMessage', show_message_handler);

router.set('/log', log_handler);
router.set('/sayHello', say_hello_handler);

async function request_dispatcher(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname; 

    // A. EXCEPCIÓN: Las rutas públicas de entrada (Home '/', '/login' y '/register') 
    // NO necesitan estar logueadas ni tener permisos. Pasan directo.
    if (path === '/' || path === '/login' || path === '/register') {
        const handler = router.get(path);
        if (handler) return await handler(request, response);
    }

    // B. IDENTIFICACIÓN DE PRUEBA: Leemos qué usuario está intentando operar (?user=...)
    const username = url.searchParams.get('user') || 'invitado';

    // autenticacion: filtro de sesion activa en memoria
    // Buscamos en el Map si este usuario inició sesión y tiene un objeto en memoria
    const userSession = userSessions.get(username);

    // Si no encontramos ninguna sesión, o el método isActive() de la clase da false: REBOTE 401
    if (userSession == null || !userSession.isActive()) {
        response.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ 
            status: false, 
            error: "No autenticado", 
            message: `Acceso denegado. El usuario '${username}' debe iniciar sesión antes de ejecutar el endpoint ${path}` 
        }));
        return; //No sigue procesando nada mas
    }

    
    // Autorizacion (Permisos en la Base de Datos con SQLite)
    const pathLimpio = path.substring(1);
    const isAuthorized = authorize(username, pathLimpio);

    // Si pasó el login pero el grupo no tiene asignado este endpoint en las tablas: REBOTE 403
    if (!isAuthorized) {
        response.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ 
            status: false, 
            error: "Acceso denegado", 
            message: `El usuario '${username}' no tiene permisos para ejecutar el endpoint ${path}` 
        }));
        return; 
    }

    // Si pasó los dos peajes (memoria y bd), ejecutamos el handler seguro
    const handler = router.get(path);
    if (handler) {
        return await handler(request, response);
    } else {
        response.writeHead(404);
        response.end('Metodo no encontrado');
    }
}

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);