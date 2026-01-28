
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { basename, join } from 'path';
import * as fs from 'fs';
import NodeID3 from 'node-id3';
import { createClient } from '@supabase/supabase-js';

// Load credentials from Environment Variables
const STORAGE_CONFIG = {
    user: process.env.STORAGE_USER,
    pass: process.env.STORAGE_PASS,
    host: process.env.STORAGE_HOST || "u529624-sub1.your-storagebox.de"
};

// --- SECURITY: SUPABASE CLIENT ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ CRITICAL: Missing Supabase credentials in Environment Variables");
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

// Cache branding buffer to avoid reading FS on every request
let BRAND_COVER_BUFFER: Buffer | null = null;

try {
    const possiblePaths = [
        join(process.cwd(), 'public', 'images', 'brand_cover.png'),
        join(process.cwd(), 'images', 'brand_cover.png'),
        '/var/task/public/images/brand_cover.png'
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            BRAND_COVER_BUFFER = fs.readFileSync(p);
            console.log(`✅ Default Cover Art loaded from: ${p}`);
            break;
        }
    }
} catch (err) {
    console.error("⚠️ Could not load default cover art on startup:", err);
}

// ========================================
// 🎨 FLAC METADATA PICTURE BLOCK BUILDER
// ========================================
function createFlacPictureBlock(imageBuffer: Buffer): Buffer {
    // FLAC PICTURE block structure:
    // - Picture type (4 bytes): 3 = Front cover
    // - MIME type length (4 bytes) + MIME string
    // - Description length (4 bytes) + Description string
    // - Width, Height, Color depth, Colors used (4 bytes each)
    // - Picture data length (4 bytes) + Picture data

    const mimeType = Buffer.from('image/png', 'utf8');
    const description = Buffer.from('Cover', 'utf8');

    // Create the picture block data
    const blockData = Buffer.alloc(
        4 + // picture type
        4 + mimeType.length + // mime
        4 + description.length + // description
        4 + 4 + 4 + 4 + // width, height, depth, colors
        4 + imageBuffer.length // picture data
    );

    let offset = 0;

    // Picture type: 3 = Front cover
    blockData.writeUInt32BE(3, offset); offset += 4;

    // MIME type
    blockData.writeUInt32BE(mimeType.length, offset); offset += 4;
    mimeType.copy(blockData, offset); offset += mimeType.length;

    // Description
    blockData.writeUInt32BE(description.length, offset); offset += 4;
    description.copy(blockData, offset); offset += description.length;

    // Width, Height (0 = unknown), Color depth (24bit), Colors used (0)
    blockData.writeUInt32BE(0, offset); offset += 4; // width
    blockData.writeUInt32BE(0, offset); offset += 4; // height
    blockData.writeUInt32BE(24, offset); offset += 4; // color depth
    blockData.writeUInt32BE(0, offset); offset += 4; // colors used

    // Picture data
    blockData.writeUInt32BE(imageBuffer.length, offset); offset += 4;
    imageBuffer.copy(blockData, offset);

    // Create the metadata block header
    // Block type 6 = PICTURE, with last-metadata-block flag = 0
    const header = Buffer.alloc(4);
    header.writeUInt8(6, 0); // Block type 6 = PICTURE (not last block)
    header.writeUInt8((blockData.length >> 16) & 0xFF, 1);
    header.writeUInt8((blockData.length >> 8) & 0xFF, 2);
    header.writeUInt8(blockData.length & 0xFF, 3);

    return Buffer.concat([header, blockData]);
}

// ========================================
// 🗑️ STRIP EXISTING ID3/METADATA FROM WAV
// ========================================
function stripWavMetadata(wavBuffer: Buffer): Buffer {
    // WAV structure: RIFF + size(4) + WAVE + chunks...
    // We need to remove 'id3 ', 'ID3 ', 'LIST' (with INFO type), etc.

    const chunksToRemove = ['id3 ', 'ID3 ', 'ID32'];

    let offset = 12; // Start after RIFF header (RIFF + size + WAVE)
    const chunks: { start: number; end: number; id: string }[] = [];

    // Parse all chunks
    while (offset < wavBuffer.length - 8) {
        const chunkId = wavBuffer.slice(offset, offset + 4).toString('ascii');
        const chunkSize = wavBuffer.readUInt32LE(offset + 4);
        const chunkEnd = offset + 8 + chunkSize + (chunkSize % 2); // Include padding

        if (chunksToRemove.includes(chunkId) || chunkId.toLowerCase() === 'id3 ') {
            chunks.push({ start: offset, end: Math.min(chunkEnd, wavBuffer.length), id: chunkId });
        }

        offset = chunkEnd;

        // Safety check
        if (chunkSize === 0 || offset > wavBuffer.length) break;
    }

    // If no metadata chunks found, return original
    if (chunks.length === 0) return wavBuffer;

    console.log(`🗑️ Removing ${chunks.length} existing metadata chunks from WAV`);

    // Remove chunks in reverse order to maintain offsets
    let result = wavBuffer;
    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];
        result = Buffer.concat([
            result.slice(0, chunk.start),
            result.slice(chunk.end)
        ]);
    }

    // Update RIFF size
    const newRiffSize = result.length - 8;
    result.writeUInt32LE(newRiffSize, 4);

    return result;
}

// ========================================
// 🎨 WAV ID3 CHUNK BUILDER (ID3 in RIFF)
// ========================================
function createWavId3Chunk(imageBuffer: Buffer, filename: string): Buffer {
    // Create ID3 tags
    const tags: NodeID3.Tags = {
        title: filename.replace(/\.[^/.]+$/, ""),
        artist: "MUSIC MASTER DJ POOL",
        album: "VIP MEMBER EXCLUSIVE",
        year: new Date().getFullYear().toString(),
        image: {
            mime: "image/png",
            type: { id: 3, name: "front cover" },
            description: "Cover",
            imageBuffer: imageBuffer
        },
        userDefinedText: [{ description: "WWW", value: "musicmasterpool.com" }]
    };

    const id3Buffer = NodeID3.create(tags);

    // Create ID3 chunk for WAV (RIFF "id3 " chunk)
    const chunkId = Buffer.from('id3 ', 'ascii');
    const chunkSize = Buffer.alloc(4);
    chunkSize.writeUInt32LE(id3Buffer.length, 0);

    // Pad to even length if necessary
    const padding = (id3Buffer.length % 2 === 1) ? Buffer.alloc(1, 0) : Buffer.alloc(0);

    return Buffer.concat([chunkId, chunkSize, id3Buffer, padding]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Range, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // --- AUTHENTICATION CHECK ---
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : (req.query.token as string);

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error('Invalid token');

        // 🔒 CHECK SUBSCRIPTION STATUS
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

        const isActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

        if (!isActive) {
            console.error(`⛔ ALERTA: Usuario ${user.email} intentó descargar sin suscripción activa.`);
            return res.status(403).json({ error: 'Subscription Required: Please upgrade your plan to download.' });
        }

    } catch (error) {
        console.error("Auth/Sub Fail in Vercel:", error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token or subscription' });
    }

    if (!STORAGE_CONFIG.user || !STORAGE_CONFIG.pass) {
        return res.status(500).json({ error: "Server Configuration Error: Missing Storage Credentials" });
    }

    const { path: trackPath, download } = req.query;

    if (!trackPath || typeof trackPath !== 'string') {
        return res.status(400).send("Missing path parameter");
    }

    if (trackPath.includes('..') || trackPath.includes('\0')) {
        return res.status(403).send("Forbidden: Invalid path");
    }

    let cleanPath = trackPath.startsWith('/') ? trackPath : '/' + trackPath;
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(decodeURIComponent(segment))).join('/');
    const secureUrl = `https://${STORAGE_CONFIG.user}:${STORAGE_CONFIG.pass}@${STORAGE_CONFIG.host}${encodedPath}`;

    try {
        const filename = decodeURIComponent(basename(cleanPath));
        const filenameLower = filename.toLowerCase();
        const isMp3 = filenameLower.endsWith('.mp3');
        const isFlac = filenameLower.endsWith('.flac');
        const isWav = filenameLower.endsWith('.wav');
        const isDownload = download === 'true';
        const canInject = BRAND_COVER_BUFFER && isDownload && (isMp3 || isFlac || isWav);

        if (canInject) {
            // 🔍 CHECK FILE SIZE FIRST (Optimize memory & prevent crashes)
            // Perform a fast HEAD request to get Content-Length
            try {
                const headResponse = await axios({
                    method: 'head',
                    url: secureUrl,
                    validateStatus: (status) => status >= 200 && status < 300,
                    timeout: 5000 // Fast timeout for metadata check
                });

                const contentLength = parseInt(headResponse.headers['content-length'] || '0', 10);
                const MAX_INJECTION_SIZE = 50 * 1024 * 1024; // 50MB Limit for Vercel Function Memory

                if (contentLength > MAX_INJECTION_SIZE) {
                    console.log(`⚠️ File too large for injection (${(contentLength / 1024 / 1024).toFixed(2)}MB). Streaming directly.`);
                    // Fallthrough to standard streaming
                    throw new Error("File too large for injection");
                }
            } catch (err) {
                // If HEAD fails or file too big, we just proceed to standard stream
                // This catches the "File too large" error above too
                // We set 'canInject' to false effectively by jumping to standard stream block?? 
                // No, we need to restructure logical flow slightly or use a flag.
                // Let's fallback by throwing an error that we catch below? 
                // actually, the 'if/else' structure makes it hard to 'fallthrough' from here. 
                // Refactoring structure for clarity.

                // FORCE SKIP INJECTION
                // We can't easily GOTO from here, so we'll just re-implement the stream logic or 
                // change the outer if condition. 
                // Better approach: verify size BEFORE entering 'if (canInject)' logic fully.
            }
        }

        // RE-EVALUATE canInject based on size (simulated clean logic):
        let sizeOkForInjection = false;
        if (canInject) {
            try {
                const headResponse = await axios({
                    method: 'head',
                    url: secureUrl,
                    validateStatus: (status) => status >= 200 && status < 300,
                    timeout: 5000
                });
                const contentLength = parseInt(headResponse.headers['content-length'] || '0', 10);
                const MAX_INJECTION_SIZE = 45 * 1024 * 1024; // Safety buffer 45MB

                if (contentLength > 0 && contentLength < MAX_INJECTION_SIZE) {
                    sizeOkForInjection = true;
                } else {
                    console.log(`⚠️ Skipping injection for large file: ${(contentLength / 1024 / 1024).toFixed(2)}MB`);
                }
            } catch (e) {
                console.log("⚠️ Could not verify file size, skipping injection safety check (defaulting to stream)");
                // If we can't get size, safer to skip injection than risk OOM
                sizeOkForInjection = false;
            }
        }

        // For injection, we need the full file in memory
        if (canInject && sizeOkForInjection) {
            console.log(`🎨 Injecting cover art into: ${filename}`);

            // Download the entire file for metadata injection
            const response = await axios({
                method: 'get',
                url: secureUrl,
                responseType: 'arraybuffer',
                timeout: 60000, // 1 minute
                validateStatus: (status) => status >= 200 && status < 300
            });

            let audioBuffer = Buffer.from(response.data);
            const encodedFilename = encodeURIComponent(filename);

            // ========================================
            // 🎵 MP3 INJECTION (Prepend ID3)
            // ========================================
            if (isMp3) {
                const tags: NodeID3.Tags = {
                    title: filename.replace(/\.[^/.]+$/, ""),
                    artist: "MUSIC MASTER DJ POOL",
                    album: "VIP MEMBER EXCLUSIVE",
                    year: new Date().getFullYear().toString(),
                    image: {
                        mime: "image/png",
                        type: { id: 3, name: "front cover" },
                        description: "Cover",
                        imageBuffer: BRAND_COVER_BUFFER!
                    },
                    userDefinedText: [{ description: "WWW", value: "musicmasterpool.com" }]
                };

                // Write tags directly to the buffer
                audioBuffer = NodeID3.write(tags, audioBuffer) as Buffer;

                res.setHeader('Content-Type', 'audio/mpeg');
            }

            // ========================================
            // 🎵 FLAC INJECTION (Insert PICTURE block)
            // ========================================
            else if (isFlac) {
                // FLAC structure: "fLaC" marker + metadata blocks + audio frames
                // We'll insert our PICTURE block after the STREAMINFO block

                const marker = audioBuffer.slice(0, 4).toString('ascii');
                if (marker === 'fLaC') {
                    const pictureBlock = createFlacPictureBlock(BRAND_COVER_BUFFER!);

                    // Find the end of STREAMINFO (first metadata block, always 34 bytes after header)
                    // STREAMINFO header (4 bytes) + STREAMINFO data (34 bytes) = position 42
                    const streaminfoEnd = 4 + 4 + 34; // marker + block header + streaminfo data

                    // Check if the first block is marked as last
                    const firstBlockHeader = audioBuffer.readUInt8(4);
                    const isLastBlock = (firstBlockHeader & 0x80) !== 0;

                    if (isLastBlock) {
                        // Clear the "last block" flag from STREAMINFO
                        audioBuffer.writeUInt8(firstBlockHeader & 0x7F, 4);
                        // Set our PICTURE block as the last block
                        pictureBlock.writeUInt8(pictureBlock.readUInt8(0) | 0x80, 0);
                    }

                    // Insert the picture block after STREAMINFO
                    audioBuffer = Buffer.concat([
                        audioBuffer.slice(0, streaminfoEnd),
                        pictureBlock,
                        audioBuffer.slice(streaminfoEnd)
                    ]);
                }

                res.setHeader('Content-Type', 'audio/flac');
            }

            // ========================================
            // 🎵 WAV INJECTION (Replace existing + Add new)
            // ========================================
            else if (isWav) {
                // WAV RIFF structure: "RIFF" + size + "WAVE" + chunks...
                // First strip any existing ID3 chunks, then add ours

                const riffMarker = audioBuffer.slice(0, 4).toString('ascii');
                if (riffMarker === 'RIFF') {
                    // 1. Remove any existing ID3/metadata chunks
                    audioBuffer = stripWavMetadata(audioBuffer);

                    // 2. Create our branded ID3 chunk
                    const id3Chunk = createWavId3Chunk(BRAND_COVER_BUFFER!, filename);

                    // 3. Update the RIFF size (at offset 4, little-endian)
                    const currentRiffSize = audioBuffer.readUInt32LE(4);
                    const newRiffSize = currentRiffSize + id3Chunk.length;
                    audioBuffer.writeUInt32LE(newRiffSize, 4);

                    // 4. Append our ID3 chunk
                    audioBuffer = Buffer.concat([audioBuffer, id3Chunk]);

                    console.log(`✅ WAV branded with MusicMaster cover: ${filename}`);
                }

                res.setHeader('Content-Type', 'audio/wav');
            }

            // Send the modified file
            res.setHeader('Content-Length', audioBuffer.length);
            res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`);
            res.send(audioBuffer);
            return;


        }

        // ========================================
        // 📁 STANDARD PASS-THROUGH (Streaming/Packs/Large Files)
        // ========================================
        if (!canInject || !sizeOkForInjection) {
            // Logic for standard streaming (fallback)
            const headers: Record<string, string> = {};
            if (req.headers.range) {
                headers['Range'] = req.headers.range as string;
            }

            const response = await axios({
                method: 'get',
                url: secureUrl,
                responseType: 'stream',
                headers: headers,
                validateStatus: (status) => status >= 200 && status < 300
            });

            res.status(response.status);

            if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
            if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
            if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
            res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

            if (isDownload) {
                const encodedFilename = encodeURIComponent(filename);
                res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`);
            }

            response.data.pipe(res);
        }

    } catch (error: any) {
        console.error(`❌ Stream Error: ${error.message}`);
        res.status(404).send("Audio not found.");
    }
}
