import paramiko
import os
from supabase import create_client, Client
from stat import S_ISDIR

# --- 1. DATOS DE CONEXIÓN HETZNER ---
HETZNER_HOST = "u529624-sub1.your-storagebox.de"
HETZNER_USER = "u529624-sub1"
HETZNER_PASS = "Gandola2026!"
HETZNER_PORT = 23

# --- 2. RUTA BASE ---
BASE_PATH = "DJPOOLS/JAN"

# --- 3. DATOS SUPABASE ---
SUPABASE_URL = "https://mnfcbeasyebrgxhfitiv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZmNiZWFzeWVicmd4aGZpdGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQyNjI1NiwiZXhwIjoyMDg0MDAyMjU2fQ.s732yKfkPR-RUsHSB8THwKbqxDlvjAcDXHRNwL3RlFo"

# --- INICIO ---
if "PEGAR_" in SUPABASE_KEY:
    print("🛑 ERROR: Faltan las claves de Supabase (Líneas 18-19).")
    exit()

try:
    print("🔹 Configurando Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Error Supabase: {e}")
    exit()

def get_sftp_client():
    try:
        transport = paramiko.Transport((HETZNER_HOST, HETZNER_PORT))
        transport.connect(username=HETZNER_USER, password=HETZNER_PASS)
        return paramiko.SFTPClient.from_transport(transport)
    except Exception as e:
        print(f"❌ Error SFTP: {e}")
        return None

def process_remote_sync():
    print(f"📡 Conectando al servidor {HETZNER_HOST}...")
    sftp = get_sftp_client()
    if not sftp: return

    print(f"✅ Conectado. Buscando en: '{BASE_PATH}'")
    updates = []
    
    try:
        # 1. Obtener lista de días
        try:
            days_found = sftp.listdir(BASE_PATH)
            print(f"🗓️  Días encontrados: {days_found}")
        except FileNotFoundError:
            print(f"❌ No existe la ruta base: {BASE_PATH}")
            return

        # 2. Recorrer cada día SIN usar chdir (Ruta absoluta)
        for day in days_found:
            # Construimos la ruta completa desde la entrada
            day_full_path = f"{BASE_PATH}/{day}"
            
            print(f"\n📂 Intentando leer día: {day}")
            
            try:
                # Obtenemos los atributos para ver si es carpeta
                # Esto a veces falla si 'day' no es una carpeta real, así que lo protegemos
                pool_items = sftp.listdir_attr(day_full_path)
            except Exception as e:
                print(f"   ⚠️ Saltando '{day}' (No se pudo leer o no es carpeta): {e}")
                continue # <--- ESTO EVITA QUE SE ROMPA EL SCRIPT

            # Si entramos, buscamos los POOLS (DJCity, Beatport...)
            found_in_day = 0
            for item in pool_items:
                if S_ISDIR(item.st_mode):
                    pool_name = item.filename
                    if pool_name.startswith('.'): continue
                    
                    # Ruta completa al Pool
                    pool_full_path = f"{day_full_path}/{pool_name}"
                    
                    try:
                        files = sftp.listdir(pool_full_path)
                        for file in files:
                            if file.lower().endswith(('.mp3', '.wav', '.zip', '.rar')):
                                track_data = {
                                    "filename": file,
                                    "pool_origin": pool_name,
                                    "file_path": f"{pool_full_path}/{file}",
                                    "created_at": "now()"
                                }
                                updates.append(track_data)
                                found_in_day += 1
                    except Exception as e:
                        print(f"      ⚠️ Error leyendo pool {pool_name}: {e}")

            print(f"   ✅ Día {day} procesado. Tracks encontrados: {found_in_day}")

        sftp.close()

        # --- SUBIDA A BASE DE DATOS ---
        if not updates:
            print("\n❌ Finalizado sin encontrar archivos MP3.")
            return

        print(f"\n✨ ¡TOTAL RECOLECTADO! {len(updates)} archivos.")
        print(f"🔍 Ejemplo: {updates[0]['filename']} | Pool: {updates[0]['pool_origin']}")
        
        confirm = input("\n🚀 ¿Subir a Supabase? (y/n): ")
        if confirm.lower() == 'y':
            batch_size = 100
            for i in range(0, len(updates), batch_size):
                batch = updates[i:i + batch_size]
                try:
                    supabase.table('tracks').upsert(batch).execute()
                    print(f"   ✅ Lote {i} - {i+len(batch)} subido.")
                except Exception as e:
                    print(f"   🔥 Error en subida: {e}")
            print("\n🏁 ¡ÉXITO TOTAL! Base de datos actualizada.")
        else:
            print("🛑 Cancelado.")

    except Exception as e:
        print(f"🔥 Error crítico: {e}")

if __name__ == "__main__":
    process_remote_sync()