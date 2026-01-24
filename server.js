cat > ~/dj_dashboard/server.js <<EOF
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // NECESARIO PARA EL STREAMING SEGURO

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
    console.log(\`✅ ¡ÉXITO! \${db.length} archivos cargados en memoria.\`);
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
    const secureUrl = \`https://\${STORAGE_CONFIG.user}:\${STORAGE_CONFIG.pass}@\${STORAGE_CONFIG.host}\${encodedPath}\`;

    try {
        // 3. El servidor pide el archivo a Hetzner
        const response = await axios({
            method: 'get',
            url: secureUrl,
            responseType: 'stream' // Importante: lo bajamos como flujo de datos
        });

        // 4. Se lo pasamos al usuario (Pipe)
        // Ponemos las cabeceras correctas para que sea un archivo de audio
        res.setHeader('Content-Type', 'audio/mpeg');
        response.data.pipe(res);

    } catch (error) {
        console.error("❌ Error al reproducir:", trackPath);
        res.status(404).send("No se pudo acceder al archivo en la nube.");
    }
});

// --- ENCENDER ---
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`\n🚀 SERVIDOR SEGURO ONLINE EN PUERTO \${PORT}\`);
});
EOF