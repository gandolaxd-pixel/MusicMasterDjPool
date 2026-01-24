// src/config.ts

export const API_URL = import.meta.env.PROD 
  ? 'https://rotten-sides-smile.loca.lt'  // Para cuando esté publicado en Vercel
  : 'https://rotten-sides-smile.loca.lt'; // Para cuando pruebes en tu PC