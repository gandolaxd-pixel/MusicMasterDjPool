import paramiko

# --- TUS DATOS ---
HOST = "u529624-sub1.your-storagebox.de"
USER = "u529624-sub1"
PASS = "Gandola2026!"
PORT = 23

def explore_home():
    print(f"🔦 Conectando a {HOST}...")
    try:
        transport = paramiko.Transport((HOST, PORT))
        transport.connect(username=USER, password=PASS)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        # 1. Averiguar dónde estamos realmente
        current_path = sftp.getcwd()
        print(f"📍 He aterrizado en la carpeta: '{current_path}'")
        
        # 2. Listar lo que hay AQUÍ MISMO (sin usar /)
        print("\n📦 CONTENIDO DE ESTA CARPETA:")
        try:
            files = sftp.listdir('.') # El punto significa "aquí"
            for f in files:
                print(f"   - {f}")
                
            # 3. Si vemos DJPOOLS, intentamos entrar
            if "DJPOOLS" in files:
                 print("\n🔎 ¡Veo DJPOOLS! Intentando entrar...")
                 try:
                     subfiles = sftp.listdir('DJPOOLS')
                     print(f"   Dentro de DJPOOLS hay: {subfiles}")
                 except:
                     print("   (No pude entrar a DJPOOLS)")

        except Exception as e:
            print(f"   ❌ No me dejan ver los archivos: {e}")

        sftp.close()

    except Exception as e:
        print(f"🔥 Error de conexión: {e}")

if __name__ == "__main__":
    explore_home()