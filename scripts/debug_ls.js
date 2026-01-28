import axios from 'axios';
import dotenv from 'dotenv';
import { parse } from 'node-html-parser';

dotenv.config();

const HETZNER_HOST = process.env.HETZNER_HOST;
const HETZNER_USER = process.env.HETZNER_USER;
const HETZNER_PASS = process.env.HETZNER_PASS;

const storageUrl = 'https://' + HETZNER_USER + ':' + HETZNER_PASS + '@' + HETZNER_HOST + '/REMIXEN/';

async function listDir() {
    try {
        console.log('Listing directory...');
        const response = await axios.get(storageUrl);
        const root = parse(response.data);
        const folders = root.querySelectorAll('a')
            .map(a => a.getAttribute('href').replace(/\/$/, ''))
            .filter(name => !name.startsWith('.') && !name.startsWith('/') && !name.includes('?'));

        console.log('Folders found in 2025:', folders);
    } catch (e) {
        console.error('Error listing directory:', e.message);
        if (e.response) console.error('Status:', e.response.status);
    }
}
listDir();
