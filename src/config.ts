// src/config.ts

// Si estamos en producción (online), usa la URL de la nube.
// Si estamos en desarrollo (tu PC), usa localhost.
// CAMBIAREMOS LA URL DE RENDER EN EL PASO 2
export const API_URL = import.meta.env.PROD 
  ? 'https://TU-BACKEND-EN-RENDER.onrender.com' 
  : 'http://localhost:3001';