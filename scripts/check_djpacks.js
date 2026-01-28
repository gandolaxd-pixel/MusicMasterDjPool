
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const STORAGE_USER = process.env.HETZNER_USER;
const STORAGE_PASS = process.env.HETZNER_PASS;
const STORAGE_HOST = process.env.HETZNER_HOST;

if (!STORAGE_USER || !STORAGE_PASS || !STORAGE_HOST) {
    console.error("❌ Missing HETZNER_USER, HETZNER_PASS, or HETZNER_HOST in .env");
    process.exit(1);
}

async function checkDJPacks() {
    console.log("🔍 Checking availability of /DJPACKS...");
    const url = `https://${STORAGE_HOST}/DJPACKS/`;
    const auth = Buffer.from(`${STORAGE_USER}:${STORAGE_PASS}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log("✅ FolderExists: /DJPACKS");

        // Also check subfolders
        // Simple string check in HTML response
        if (response.data.includes('2025')) console.log("✅ Subfolder found: 2025");
        if (response.data.includes('2026')) console.log("✅ Subfolder found: 2026");

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log("❌ FolderNotFound: /DJPACKS does not exist.");
        } else {
            console.log("❌ Error: ", error.message);
        }
    }
}

checkDJPacks();
