
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mnfcbeasyebrgxhfitiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjYyNTYsImV4cCI6MjA4NDAwMjI1Nn0.a7bHJtuGUMSQkEJXKwN43v9s97t384NUrEMBD49trA8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Fetching 1 row to check schema...");
    const { data, error } = await supabase.from('dj_tracks').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else if (data && data.length > 0) {
        console.log("Keys found:", Object.keys(data[0]));
    } else {
        console.log("Table is empty, cannot infer schema from data.");
        // Try inserting a dummy with 'artist' to see specific error error? No.
    }
}

checkSchema();
