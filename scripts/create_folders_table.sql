-- Tabla para indexar carpetas y lograr navegación instantánea (cache de estructura)
-- Esto evita tener que escanear tracks para deducir carpetas.

CREATE TABLE IF NOT EXISTS public.dj_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_path TEXT NOT NULL UNIQUE,      -- Ejemplo: /BEATPORT2025/MONTHS/DECEMBER
    parent_path TEXT,                    -- Ejemplo: /BEATPORT2025/MONTHS
    name TEXT NOT NULL,                  -- Ejemplo: DECEMBER
    depth INTEGER NOT NULL,              -- Ejemplo: 3
    track_count INTEGER DEFAULT 0,       -- Cache de conteo de canciones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsqueda ultra-rápida
CREATE INDEX IF NOT EXISTS idx_dj_folders_parent_path ON public.dj_folders(parent_path);
CREATE INDEX IF NOT EXISTS idx_dj_folders_full_path ON public.dj_folders(full_path);
CREATE INDEX IF NOT EXISTS idx_dj_folders_depth ON public.dj_folders(depth);

-- Policies (RLS)
ALTER TABLE public.dj_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON public.dj_folders FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow service role full access" 
ON public.dj_folders FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);
