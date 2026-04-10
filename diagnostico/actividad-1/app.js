const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
// Esta linea sirve los archivos de la carpeta 'public' automáticamente
app.use(express.static('public')); 

// Conexión a UniServer
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'planta_reciclaje_db'
});

db.connect(err => {
    if (err) {
        console.error('Error en DB:', err);
        return;
    }
    console.log('Servidor conectado a UniServer (MySQL)');
});

// Ruta para obtener materiales
app.get('/api/materiales', (req, res) => {
    db.query("SELECT * FROM materiales", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Ruta para actualizar stock
app.post('/api/operacion', (req, res) => {
    const { id, cantidad, tipo } = req.body;
    
    db.query("SELECT cantidad FROM materiales WHERE id = ?", [id], (err, result) => {
        if (err || result.length === 0) return res.status(500).send("Error al buscar material");
        
        let stockActual = parseFloat(result[0].cantidad);
        let nuevaCantidad = (tipo === 'compra') ? stockActual + cantidad : stockActual - cantidad;

        if (nuevaCantidad < 0) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        db.query("UPDATE materiales SET cantidad = ? WHERE id = ?", [nuevaCantidad, id], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: "Éxito", nuevaCantidad });
        });
    });
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});