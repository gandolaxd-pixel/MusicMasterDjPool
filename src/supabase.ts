import { createClient } from '@supabase/supabase-js'

// Sustituye con tus datos de Supabase
const supabaseUrl = 'https://mnfcbeasyebrgxhfitiv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjYyNTYsImV4cCI6MjA4NDAwMjI1Nn0.a7bHJtuGUMSQkEJXKwN43v9s97t384NUrEMBD49trA8'

export const supabase = createClient(supabaseUrl, supabaseKey)