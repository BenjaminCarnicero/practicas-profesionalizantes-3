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