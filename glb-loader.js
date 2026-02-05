// glb-loader.js - Gestisce il download e la decompressione del modello da GitHub
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

/**
 * Scarica e decomprime il file GLB da GitHub Releases
 * @param {string} zipUrl - URL del file .zip su GitHub Releases
 * @param {Function} onProgress - Callback per aggiornare il progresso (0-100)
 * @returns {Promise<string>} URL blob del file GLB decompresso
 */
export async function loadGLBFromZip(zipUrl, onProgress = () => {}) {
    try {
        // 1. Scarica il file zip
        onProgress(10, 'Scaricamento file zip...');
        
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error(`Errore nel download: ${response.status} ${response.statusText}`);
        }

        // Monitora il progresso del download
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            if (total) {
                const percent = 10 + ((loaded / total) * 40); // 10-50% per il download
                onProgress(percent, `Download: ${Math.round((loaded / total) * 100)}%`);
            }
        }

        // Combina i chunks
        const blob = new Blob(chunks);
        
        // 2. Decomprime il file
        onProgress(55, 'Decompressione file...');
        
        const zip = await JSZip.loadAsync(blob);
        
        // Trova il file .glb nello zip
        const glbFileName = Object.keys(zip.files).find(name => 
            name.toLowerCase().endsWith('.glb')
        );
        
        if (!glbFileName) {
            throw new Error('File GLB non trovato nello zip');
        }
        
        onProgress(70, 'Estrazione modello 3D...');
        const glbBlob = await zip.file(glbFileName).async('blob');
        
        // 3. Crea URL blob
        const glbUrl = URL.createObjectURL(glbBlob);
        
        onProgress(100, 'Modello pronto!');
        console.log('✅ Modello GLB caricato con successo');
        
        return glbUrl;
        
    } catch (error) {
        console.error('❌ Errore nel caricamento del modello:', error);
        throw error;
    }
}

/**
 * Verifica se siamo in sviluppo locale
 */
export function isLocalDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
}
