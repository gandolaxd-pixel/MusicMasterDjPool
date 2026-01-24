import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('path');

  if (!rawPath) return NextResponse.json({ error: 'Falta path' }, { status: 400 });

  try {
    const decodedPath = decodeURIComponent(rawPath);
    const storageUrl = `https://u529624-sub1.your-storagebox.de${decodedPath}`;
    
    // Credenciales para el acceso privado
    const auth = Buffer.from('u529624-sub1:Gandola2026!').toString('base64');
    
    const response = await fetch(storageUrl, {
      headers: { 'Authorization': `Basic ${auth}` },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Servidor no responde');

    const html = await response.text();

    // REGEX ULTRA-COMPATIBLE: Busca cualquier enlace que termine en extensiones de audio
    // Captura tanto href="archivo.mp3" como href="/ruta/archivo.mp3"
    const fileRegex = /href="([^"]+\.(mp3|wav|m4a|aiff|zip|rar))"/gi;
    const items = [];
    let match;

    while ((match = fileRegex.exec(html)) !== null) {
      const fullPath = match[1];
      // Nos quedamos solo con el nombre del archivo, eliminando rutas previas
      const fileName = fullPath.split('/').pop() || "";
      
      // Evitamos carpetas superiores (../) y enlaces de ordenamiento (?C=N)
      if (fileName && !fileName.includes('..') && !fileName.includes('?')) {
        items.push({
          name: decodeURIComponent(fileName),
          isDir: false
        });
      }
    }

    // Eliminar duplicados
    const uniqueItems = Array.from(new Map(items.map(item => [item.name, item])).values());

    return NextResponse.json({ items: uniqueItems });
  } catch (error) {
    console.error("Error en API:", error);
    return NextResponse.json({ items: [], error: 'Error de conexión' });
  }
}