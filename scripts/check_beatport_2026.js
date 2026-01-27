
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const STORAGE_USER = process.env.HETZNER_USER || 'u529624-sub1';
const STORAGE_PASS = process.env.HETZNER_PASS || 'Gandola2026!';
const STORAGE_HOST = process.env.HETZNER_HOST || 'u529624-sub1.your-storagebox.de';

async function check2026() {
    console.log("🔍 Checking availability of /BEATPORT2026...");
    const url = `https://${STORAGE_HOST}/BEATPORT2026/`;
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log("✅ FolderExists: /BEATPORT2026");
        // console.log(response.data); // Too verbose
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log("❌ FolderNotFound: /BEATPORT2026 does not exist.");
        } else {
            console.log("❌ Error: ", error.message);
        }
    }
}

check2026();
