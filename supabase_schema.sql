-- FIX: Add missing 'folder' column
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS folder TEXT;

-- (Optional) If you haven't created the table yet, use the full definition below:
/*
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    file_path TEXT NOT NULL,
    folder TEXT,  -- This was missing
    bpm INTEGER,
    key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.tracks FOR SELECT TO public USING (true);
*/
