import paramiko

# --- TUS DATOS (Ya configurados) ---
HOST = "u529624-sub1.your-storagebox.de"
USER = "u529624-sub1"
PASS = "Gandola2026!"
PORT = 23

def explore():
    print(f"🔦 Conectando a {HOST}...")
    try:
        transport = paramiko.Transport((HOST, PORT))
        transport.connect(username=USER, password=PASS)
        sftp = paramiko.SFTPClient.from_transport(transport)
        print("✅ Conexión exitosa. Listando contenido de la raíz (/):")
        
        # 1. Mirar qué hay en la entrada principal
        root_files = sftp.listdir('/')
        print(f"📁 CARPETAS EN LA RAÍZ: {root_files}")

        # 2. Vamos a buscar variantes de 'DJPOOLS'
        target_folder = None
        for f in root_files:
            if f.lower() == "djpools":
                target_folder = f
                break
        
        if target_folder:
            print(f"\n✅ Encontré la carpeta '{target_folder}'. Vamos a ver qué hay dentro:")
            path_level_2 = f"/{target_folder}"
            files_level_2 = sftp.listdir(path_level_2)
            print(f"📂 DENTRO DE {path_level_2}: {files_level_2}")
            
            # 3. Si vemos algo parecido a 'JAN' o 'Jan', miramos dentro
            for f2 in files_level_2:
                if "jan" in f2.lower():
                    path_level_3 = f"/{target_folder}/{f2}"
                    print(f"\n   ➡️ Mirando dentro de {path_level_3}:")
                    try:
                        files_level_3 = sftp.listdir(path_level_3)
                        print(f"      {files_level_3}")
                    except:
                        print("      (Está vacío o no es carpeta)")

        else:
            print("\n❌ No veo ninguna carpeta que se llame 'DJPOOLS' (ni en mayúsculas ni minúsculas).")

        sftp.close()

    except Exception as e:
        print(f"🔥 Error: {e}")

if __name__ == "__main__":
    explore()