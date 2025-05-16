const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Configuración de la base de datos
const pool = mysql.createPool({
    host: '172.17.131.12',
    user: 'root',
    database: 'vuelos',
    password: 'M12-Traveller',
    port: 3306
});

const corsOptions = {
    origin: ['http://localhost:4200', 'http://172.17.22.103:4200', 'http://172.17.40.7:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Vuelos y Destinos',
            version: '1.0.0',
            description: 'Documentación de la API para gestionar vuelos y destinos'
        },
        servers: [
            {
                url: `http://172.17.40.7:${port}`,
                description: 'Servidor local'
            }
        ],
        tags: [
            {
                name: 'Destinos',
                description: 'Operaciones relacionadas con la tabla "destinos"'
            },
            {
                name: 'Vuelos',
                description: 'Operaciones relacionadas con la tabla "vuelos"'
            }
        ]
    },
    apis: [__filename]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /destinos:
 *   get:
 *     tags: [Destinos]
 *     summary: Obtener todos los destinos
 *     responses:
 *       200:
 *         description: Lista de destinos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_destino:
 *                     type: integer
 *                   pais:
 *                     type: string
 *                   ciudad:
 *                     type: string
 */
app.get('/destinos', (req, res) => {
    pool.query('SELECT * FROM destinos', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

/**
 * @swagger
 * /destinos/{id}:
 *   get:
 *     tags: [Destinos]
 *     summary: Obtener un destino por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del destino
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_destino:
 *                   type: integer
 *                 pais:
 *                   type: string
 *                 ciudad:
 *                   type: string
 */
app.get('/destinos/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM destinos WHERE id_destino = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Destino no encontrado' });
        }
        res.json(results[0]);
    });
});

/**
 * @swagger
 * /destinos:
 *   post:
 *     tags: [Destinos]
 *     summary: Crear un nuevo destino
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_destino:
 *                 type: integer
 *               pais:
 *                 type: string
 *               ciudad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Destino creado correctamente
 */
app.post('/destinos', (req, res) => {
    const { pais, ciudad } = req.body;
    const query = 'INSERT INTO destinos (pais, ciudad) VALUES (?, ?)';
    pool.query(query, [pais, ciudad], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Destino creado correctamente', id: result.insertId });
    });
});

/**
 * @swagger
 * /destinos/{id}:
 *   put:
 *     tags: [Destinos]
 *     summary: Actualizar un destino existente
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pais:
 *                 type: string
 *               ciudad:
 *                 type: string
 *     responses:
 *       200:
 *         description: Destino actualizado correctamente
 */
app.put('/destinos/:id', (req, res) => {
    const { id } = req.params;
    const { pais, ciudad } = req.body;
    const query = 'UPDATE destinos SET pais = ?, ciudad = ? WHERE id_destino = ?';
    pool.query(query, [pais, ciudad, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Destino actualizado correctamente' });
    });
});

/**
 * @swagger
 * /destinos/{id}:
 *   delete:
 *     tags: [Destinos]
 *     summary: Eliminar un destino
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Destino eliminado correctamente
 */
app.delete('/destinos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM destinos WHERE id_destino = ?';
    pool.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Destino eliminado correctamente' });
    });
});

/**
 * @swagger
 * /vuelos:
 *   get:
 *     tags: [Vuelos]
 *     summary: Obtener todos los vuelos
 *     responses:
 *       200:
 *         description: Lista de vuelos
 */
app.get('/vuelos', (req, res) => {
    const query = `
        SELECT 
            v.id_vuelo,
            origen.pais as origen_pais,
            origen.ciudad as origen_ciudad,
            destino.pais as destino_pais,
            destino.ciudad as destino_ciudad,
            v.dia,
            v.hora,
            v.imagen_url
        FROM vuelos v
        JOIN destinos origen ON v.id_origen = origen.id_destino
        JOIN destinos destino ON v.id_destino = destino.id_destino
    `;
    
    pool.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

/**
 * @swagger
 * /vuelos/{id}:
 *   get:
 *     tags: [Vuelos]
 *     summary: Obtener un vuelo por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del vuelo
 */
app.get('/vuelos/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM vuelos WHERE id_vuelo = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Vuelo no encontrado' });
        }
        res.json(results[0]);
    });
});

/**
 * @swagger
 * /vuelos:
 *   post:
 *     tags: [Vuelos]
 *     summary: Crear un nuevo vuelo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_vuelo:
 *                 type: integer
 *               id_origen:
 *                 type: integer
 *               id_destino:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vuelo creado correctamente
 */
app.post('/vuelos', (req, res) => {
    const { id_origen, id_destino, dia, hora, imagen_url } = req.body;
    const query = 'INSERT INTO vuelos (id_origen, id_destino, dia, hora, imagen_url) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [id_origen, id_destino, dia, hora, imagen_url], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Vuelo creado correctamente', id: result.insertId });
    });
});

/**
 * @swagger
 * /vuelos/{id}:
 *   put:
 *     tags: [Vuelos]
 *     summary: Actualizar un vuelo existente
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_origen:
 *                 type: integer
 *               id_destino:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vuelo actualizado correctamente
 */
app.put('/vuelos/:id', (req, res) => {
    const { id } = req.params;
    const { id_origen, id_destino } = req.body;
    const query = 'UPDATE vuelos SET id_origen = ?, id_destino = ? WHERE id_vuelo = ?';
    pool.query(query, [id_origen, id_destino, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Vuelo actualizado correctamente' });
    });
});

/**
 * @swagger
 * /vuelos/{id}:
 *   delete:
 *     tags: [Vuelos]
 *     summary: Eliminar un vuelo
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vuelo eliminado correctamente
 */
app.delete('/vuelos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM vuelos WHERE id_vuelo = ?';
    pool.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Vuelo eliminado correctamente' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://172.17.40.7:${port}`);
    console.log(`Documentación Swagger disponible en http://172.17.40.7:${port}/api-docs`);
});
