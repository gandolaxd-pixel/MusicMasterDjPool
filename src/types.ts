export interface Track {
    id: string;
    title: string;
    artist?: string;
    filename: string;
    file_path: string;
    pool_origin?: string;
    created_at?: string;
    streamUrl?: string;
    // Campos opcionales del VPS o Supabase
    server_path?: string;
    original_folder?: string;
    name?: string; // Algunas tablas usan 'name' en lugar de 'title'
}

export interface User {
    id: string;
    email?: string;
    aud: string;
    created_at: string;
    // Otros campos de Supabase Auth
    app_metadata?: any;
    user_metadata?: any;
}
