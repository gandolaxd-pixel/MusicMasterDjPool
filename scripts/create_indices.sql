-- =====================================================
-- ÍNDICES PARA OPTIMIZAR RENDIMIENTO EN dj_tracks
-- =====================================================
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- Estos índices aceleran las búsquedas más comunes

-- 1. Índice para búsqueda por pool_id (muy frecuente)
CREATE INDEX IF NOT EXISTS idx_dj_tracks_pool_id 
ON public.dj_tracks(pool_id);

-- 2. Índice para búsqueda por formato (pack vs file)
CREATE INDEX IF NOT EXISTS idx_dj_tracks_format 
ON public.dj_tracks(format);

-- 3. Índice compuesto para navegación por pool + formato
CREATE INDEX IF NOT EXISTS idx_dj_tracks_pool_format 
ON public.dj_tracks(pool_id, format);

-- 4. Índice para búsqueda por original_folder (navegación de packs)
CREATE INDEX IF NOT EXISTS idx_dj_tracks_original_folder 
ON public.dj_tracks(original_folder);

-- 5. Índice compuesto para búsqueda de archivos dentro de un pack
CREATE INDEX IF NOT EXISTS idx_dj_tracks_folder_format 
ON public.dj_tracks(original_folder, format);

-- 6. Índice para ordenamiento por fecha (latest uploads)
CREATE INDEX IF NOT EXISTS idx_dj_tracks_created_at 
ON public.dj_tracks(created_at DESC);

-- 7. Índice para búsqueda por nombre (búsqueda de tracks)
CREATE INDEX IF NOT EXISTS idx_dj_tracks_name 
ON public.dj_tracks(name);

-- 8. Índice para búsqueda por título
CREATE INDEX IF NOT EXISTS idx_dj_tracks_title 
ON public.dj_tracks(title);

-- 9. Índice para navegación por drop_month y drop_day
CREATE INDEX IF NOT EXISTS idx_dj_tracks_drop_month 
ON public.dj_tracks(drop_month);

CREATE INDEX IF NOT EXISTS idx_dj_tracks_drop_day 
ON public.dj_tracks(drop_day);

-- 10. Índice compuesto para filtros de fecha
CREATE INDEX IF NOT EXISTS idx_dj_tracks_pool_date 
ON public.dj_tracks(pool_id, drop_month, drop_day);

-- 11. Índice para server_path (usado en streaming y upserts)
CREATE INDEX IF NOT EXISTS idx_dj_tracks_server_path 
ON public.dj_tracks(server_path);

-- =====================================================
-- ÍNDICES PARA dj_folders (navegación de carpetas)
-- =====================================================

-- 12. Índice para búsqueda por parent_path
CREATE INDEX IF NOT EXISTS idx_dj_folders_parent_path 
ON public.dj_folders(parent_path);

-- 13. Índice compuesto para listar carpetas
CREATE INDEX IF NOT EXISTS idx_dj_folders_parent_name 
ON public.dj_folders(parent_path, name);

-- =====================================================
-- ÍNDICE GIN PARA BÚSQUEDA DE TEXTO (Opcional - más potente)
-- =====================================================
-- Descomenta si necesitas búsqueda de texto más rápida

-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_dj_tracks_name_gin 
-- ON public.dj_tracks USING gin(name gin_trgm_ops);

-- CREATE INDEX IF NOT EXISTS idx_dj_tracks_title_gin 
-- ON public.dj_tracks USING gin(title gin_trgm_ops);

-- =====================================================
-- VERIFICAR ÍNDICES CREADOS
-- =====================================================
-- Ejecuta esto para ver los índices existentes:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'dj_tracks';
