import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept } from '../utils.js';

export async function playPart1() {
    // 1. Pengecekan guard yang ketat + status Transisi
    if (state.isPlaying || (state.currentPart !== 0 && state.currentPart !== 1) || state.isTransitioning) {
        console.log('⏹️ [Part 1] Dibatalkan: Sedang play, atau bukan urutannya.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 1;
    state.isTransitioning = true;
    console.log('🔒 [Part 1] Marker LOCKED - Hanya Marker 1 yang aktif');
    
    hideAllContainersExcept(dom.containerPart1);
    
    // 2. Cari layar sebelumnya untuk ditutup secara halus
    const allContainers = [dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart6, dom.containerPart7]; 
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
    const wasVisible = dom.containerPart1 && (dom.containerPart1.getAttribute('visible') === true || dom.containerPart1.getAttribute('visible') === 'true');
    state.currentPart = 1;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 1 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part1.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part1.map(v => v.play().catch(e => console.error('❌ [Part 1] Video play error:', e)));
    await Promise.all(playPromises);
    
    // 3. TEKNIK FREEZE FRAME (Mencegah black screen di akhir video)
    videos.part1.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause(); 
                this.removeEventListener('timeupdate', preventBlackScreen); 
            }
        });
    });
    
    // Jeda agar layar tidak berkedip hitam di awal. Saat replay (container sudah visible),
    // skip fade-in agar tidak ada flash.
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart1 && !wasVisible) fadeInContainer(dom.containerPart1, 400);
    else if (dom.containerPart1) dom.containerPart1.setAttribute('visible', true);
    
    try {
        if (state.audioEnabled && dom.soundV1) {
            dom.soundV1.pause();
            dom.soundV1.currentTime = 0;
            dom.soundV1.volume = 0;
            await dom.soundV1.play();
            fadeAudioIn(dom.soundV1, 400);
        } else {
            console.warn('⚠️ [Part 1] Audio belum diizinkan / tidak ditemukan.');
        }
    } catch (e) { 
        console.error('❌ [Part 1] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    // 4. SUTRADARA AUDIO (Saat audio habis, video FREEZE di frame terakhir, container TETAP terlihat)
    if (dom.soundV1) {
        dom.soundV1.onended = () => {
            console.log('✅ [Part 1] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part1Finished = true;
            
            // Pastikan video benar-benar berhenti di frame terakhir (bukan reset / hide)
            if (dom.containerPart1) {
                // Memudarkan layar selama 250 milidetik
                fadeOutContainer(dom.containerPart1, 250, () => {
                    // Setelah layar benar-benar hilang (transparan 100%),
                    // barulah kita matikan videonya dan reset ke detik 0
                    videos.part1.forEach(v => { 
                        try { 
                            v.pause(); 
                            v.currentTime = 0;
                        } catch (e) {} 
                    });
                        console.log('🧹 Layar dibersihkan dan video dimatikan.');
                });
            }
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            
            dom.statusBar.textContent = '✅ Part 1 selesai - Tap layar untuk ulang atau scan Marker 2 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart1() {
    if (!dom.target1) return;

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
            state.activeMarkerDetection = 1;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            // Matikan deteksi target lain sementara
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart1();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (state.part1Finished && state.currentPart === 1 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 1';
            state.lastScannedMarker = 1;
        }
    });
}