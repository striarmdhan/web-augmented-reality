import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept } from '../utils.js';

export async function playPart1() {
    // Pengecekan guard yang ketat
    if (state.isPlaying || (state.currentPart !== 0 && state.currentPart !== 1) || state.isTransitioning) {
        console.log('⏹️ [Part 1] Dibatalkan: Sedang memutar part lain atau bukan urutannya.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 1;
    state.isTransitioning = true;
    console.log('🔒 [Part 1] Marker LOCKED - Hanya Marker 1 yang aktif');
    
    hideAllContainersExcept(null);
    
    // Cari layar mana yang mungkin masih menyala secara aman
    // (Untuk Part 1, biasanya layar sebelumnya kosong, tapi ini buat jaga-jaga kalau user Replay)
    const allContainers = [dom.containerPart2, dom.containerPart3]; 
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 1] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => { 
            await startPart1Videos(); 
        });
    } else {
        await startPart1Videos();
    }
}

async function startPart1Videos() {
    console.log('🎬 [Part 1] Memulai pemutaran video...');
    state.currentPart = 1;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 1 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    // Pastikan video mulai dari 0
    videos.part1.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part1.map(v => v.play().catch(e => console.error('❌ [Part 1] Video play error:', e)));
    await Promise.all(playPromises);
    console.log('📹 [Part 1] Semua video berhasil berjalan.');
    
    // Jeda sedikit agar layar tidak berkedip, lalu fade in
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart1) fadeInContainer(dom.containerPart1, 400);
    
    try {
        if (state.audioEnabled && dom.soundV1) {
            dom.soundV1.pause();
            dom.soundV1.currentTime = 0;
            dom.soundV1.volume = 0;
            await dom.soundV1.play();
            fadeAudioIn(dom.soundV1, 400);
            console.log('🔊 [Part 1] Audio menyala dan sinkron!');
        } else {
            console.warn('⚠️ [Part 1] Audio belum diizinkan / tidak ditemukan.');
        }
    } catch (e) { 
        console.error('❌ [Part 1] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    // ANTI DELAY: Langsung tutup layar saat AUDIO selesai (bukan video)
    if (dom.soundV1) {
        dom.soundV1.onended = () => {
            console.log('✅ [Part 1] Audio habis! Menutup adegan secepatnya...');
            state.isPlaying = false;
            state.part1Finished = true;
            
            // Animasi fade-out super cepat (250ms) agar tidak ngelag
            if (dom.containerPart1) {
                fadeOutContainer(dom.containerPart1, 250, () => {
                    videos.part1.forEach(v => { v.pause(); v.currentTime = 0; });
                    console.log('🧹 [Part 1] Layar dibersihkan dan video dimatikan.');
                });
            }
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            console.log('🔓 [Part 1] Marker UNLOCKED - Lanjut ke adegan berikutnya.');
            
            dom.statusBar.textContent = '✅ Part 1 selesai - Tap layar untuk ulang atau scan Marker 2 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart1() {
    if (!dom.target1) return; // Sabuk pengaman

    dom.target1.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 1) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 1) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.currentPart > 1) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            if (dom.containerPart1) dom.containerPart1.setAttribute('visible', false);
            return;
        }
        
        if (!state.part1Finished && state.currentPart === 0 && !state.isPlaying && !state.isTransitioning) {
            console.log('🎯 [Part 1] Marker 1 Terdeteksi!');
            state.activeMarkerDetection = 1;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            // Matikan deteksi target lain sementara (jika elemennya ada)
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart1();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (state.part1Finished && state.currentPart === 1 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 1';
            state.lastScannedMarker = 1;
        }
    });
}