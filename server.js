import express from 'express';
import SftpClient from 'ssh2-sftp-client';
import cors from 'cors';
import path from 'path'; // <--- 1. NUEVO IMPORT

const config = {
    host: 'u529624-sub1.your-storagebox.de',
    username: 'u529624-sub1',
    password: 'Gandola2026!', 
    port: 23,
    // Optimizaciones de conexión
    readyTimeout: 20000, 
    keepalive: 1000 
};

const app = express();
app.use(cors());

// Guardamos una conexión global para reutilizarla
let globalSftp = new SftpClient();
let isConnected = false;

async function connectSFTP() {
    if (!isConnected) {
        try {
            console.log("🔌 Estableciendo conexión persistente con Hetzner...");
            await globalSftp.connect(config);
            isConnected = true;
            console.log("⚡ Conexión lista.");
        } catch (err) {
            console.error("🔥 Error de conexión:", err.message);
            isConnected = false;
        }
    }
    return globalSftp;
}

// Mantener la conexión viva
setInterval(async () => {
    if (isConnected) {
        try {
            await globalSftp.list('/DJPOOLS'); // Ping silencioso
        } catch (e) {
            isConnected = false;
        }
    }
}, 10000);

app.get('/stream', async (req, res) => {
    const remotePath = req.query.path;
    const isDownload = req.query.download === 'true'; // <--- 2. DETECTAMOS SI ES DESCARGA

    if (!remotePath) return res.status(400).send('Falta path');

    try {
        const sftp = await connectSFTP();

        // 1. Obtenemos tamaño y nombre
        const fileStats = await sftp.stat(remotePath);
        const filename = path.basename(remotePath); // <--- Extraemos "cancion.mp3" de la ruta

        // 2. Preparamos las cabeceras base
        const headers = {
            'Content-Type': 'audio/mpeg',
            'Content-Length': fileStats.size
        };

        // 3. DECIDIMOS: ¿STREAMING O DESCARGA?
        if (isDownload) {
            // Esto obliga al navegador a bajar el archivo con su nombre original
            headers['Content-Disposition'] = `attachment; filename="${filename}"`;
        } else {
            // Esto permite la reproducción en el navegador
            headers['Content-Disposition'] = 'inline';
            headers['Accept-Ranges'] = 'bytes';
            headers['Cache-Control'] = 'no-cache';
        }

        res.writeHead(200, headers);

        // 4. Enviamos el archivo
        const stream = sftp.createReadStream(remotePath, {
            highWaterMark: 64 * 1024 
        });

        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Error en stream:', err.message);
        });

    } catch (err) {
        console.error('❌ Error general:', err.message);
        res.status(500).send('Error');
        isConnected = false; // Forzamos reconexión la próxima vez
    }
});

app.listen(3001, () => {
    console.log(`🚀 SERVIDOR LISTO (Stream + Descargas) en http://localhost:3001`);
    connectSFTP(); // Conectar nada más arrancar
});