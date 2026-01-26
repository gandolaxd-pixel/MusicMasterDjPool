import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static('public'));

// --- CREDENCIALES SECRETAS (Solo el servidor las conoce) ---
const STORAGE_CONFIG = {
    user: "u529624-sub1",
    pass: "Gandola2026!", // ¡Aquí está segura! Nadie la ve en la web.
    host: "u529624-sub1.your-storagebox.de"
};

// --- CARGA DE BASE DE DATOS ---
console.log("⏳ Cargando base de datos musical...");
const dbPath = path.join(__dirname, 'tracks_master.json');
let db = [];

try {
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(rawData);
    console.log(`✅ ¡ÉXITO! ${db.length} archivos cargados en memoria.`);
} catch (error) {
    console.error("❌ ERROR: No encuentro tracks_master.json");
}

// --- API 1: BUSCADOR ---
app.get('/api/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    if (query.length < 2) return res.json([]);

    const results = db.filter(item =>
        item.name && item.name.toLowerCase().includes(query)
    ).slice(0, 100);

    res.json(results);
});

// --- API 2: STREAMING SEGURO (LA MAGIA) 🛡️ ---
app.get('/api/stream', async (req, res) => {
    // 1. Recibimos la ruta del archivo (ej: /Musica/Techno/track.mp3)
    const trackPath = req.query.path;
    if (!trackPath) return res.status(400).send("Falta la ruta");

    // 2. Construimos la URL secreta hacia Hetzner
    // Codificamos la ruta para que los espacios y acentos no rompan el link
    const encodedPath = trackPath.split('/').map(encodeURIComponent).join('/');
    const secureUrl = `https://${STORAGE_CONFIG.user}:${STORAGE_CONFIG.pass}@${STORAGE_CONFIG.host}${encodedPath}`;

    try {
        // 3. El servidor pide el archivo a Hetzner
        // Si el cliente pide un rango (para saltar al minuto X), lo reenviamos
        const headers = {};
        if (req.headers.range) {
            headers['Range'] = req.headers.range;
        }

        const response = await axios({
            method: 'get',
            url: secureUrl,
            responseType: 'stream', // Importante: lo bajamos como flujo de datos
            headers: headers,
            validateStatus: (status) => status >= 200 && status < 300 // Aceptamos 200 y 206
        });

        // 4. Se lo pasamos al usuario (Pipe)
        // Reenviamos las cabeceras clave para que el navegador sepa que puede hacer "seek"
        res.status(response.status); // 200 o 206
        if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
        if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');

        // Si pide descargar, forzamos el nombre de archivo
        if (req.query.download === 'true') {
            const filename = path.basename(trackPath);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        response.data.pipe(res);

    } catch (error) {
        console.error("❌ Error al reproducir:", trackPath);
        res.status(404).send("No se pudo acceder al archivo en la nube.");
    }
});

// --- ENCENDER ---
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SERVIDOR SEGURO ONLINE EN PUERTO ${PORT}`);
});