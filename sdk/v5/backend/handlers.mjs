import { authenticate, createUser } from './database.mjs';

// Estruxtura de sesion
export class UserSession {
    constructor(username) {
        this.username = username;
        this.status = 'enabled';
        this.createdAt = new Date();
    }

    isActive() {
        return this.status === 'enabled';
    }

    invalidate() {
        this.status = 'disabled';
    }
}

// El mapa de sesiones vive en esta capa lógica
export const userSessions = new Map();

// Función de control de flujo para login (en memoria + validación DB)
export function login(username, password) {
    const isAuthenticated = authenticate(username, password);

    if (isAuthenticated) {
        let previousSession = userSessions.get(username);

        if (previousSession == null) {
            let newSession = new UserSession(username);
            userSessions.set(username, newSession);
            return newSession;
        } else {
            if (previousSession.status === 'disabled') {
                previousSession.status = 'enabled';
            }
            return previousSession;
        }
    } else {
        return null;
    }
}

// Handler de Login
export async function login_handler(request, response) {
    if (request.method === "POST") {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            try {
                const input = JSON.parse(body);
                const output = login(input.username, input.password);

                if (output) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(output));
                } else {
                    response.writeHead(401, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: 'Credenciales inválidas' }));
                }
            } catch (err) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
            }
        });
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
    }
}

// Handler de Registro
export async function register_handler(request, response) {
    try {
        // Llama a createUser
        const output = await createUser('test_user_' + Date.now(), '123456789');
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    } catch (err) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: err.message }));
    }
}

// Handler de showMessage
export function show_message_handler(request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Mensaje procesado" }));
}

// Handler de log
export function log_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'MethodNotAllowed', detail: 'Las funciones RPC deben llamarse por POST.' }));
        return;
    }
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: true, message: "¡Éxito! El endpoint log se ejecutó correctamente en modo RPC." }));
}

// Handler de sayHello
export function say_hello_handler(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'MethodNotAllowed', detail: 'Las funciones RPC deben llamarse por POST.' }));
        return;
    }
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: true, message: "El autorizador falló" }));
}