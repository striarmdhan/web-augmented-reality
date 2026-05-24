import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart2() {
    // 1. Pengecekan guard yang ketat + status Transisi
    if (state.isPlaying || !state.part1Finished || (state.currentPart !== 1 && state.currentPart !== 2) || state.isTransitioning) {
        console.log('⏹️ [Part 2] Dibatalkan: Sedang play, Part 1 belum, atau bukan urutannya.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 2;
    state.isTransitioning = true;
    console.log('🔒 [Part 2] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart2);
    fadeAudioOut(dom.soundV1, 300);
    
    // 2. Cari layar sebelumnya (Part 1, dll) untuk ditutup secara halus
    const allContainers = [dom.containerPart1, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart6, dom.containerPart7]; 
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 2] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => { 
            await startPart2Videos(); 
        });
    } else {
        await startPart2Videos();
    }
}

async function startPart2Videos() {
    console.log('🎬 [Part 2] Memulai pemutaran video...');
    const wasVisible = isContainerVisible(dom.containerPart2);
    state.currentPart = 2;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 2 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part2.forEach(v => { 
        v.pause(); 
        v.currentTime = 0; 
    });
    
    const playPromises = videos.part2.map(v => v.play().catch(e => console.error('❌ [Part 2] Video play error:', e)));
    await Promise.all(playPromises);
    
    // 3. TEKNIK FREEZE FRAME (Mencegah black screen di akhir video)
    videos.part2.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause(); 
                this.removeEventListener('timeupdate', preventBlackScreen); 
            }
        });
    });
    
    // Jeda sedikit agar layar tidak berkedip hitam di awal, lalu fade in
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart2 && !wasVisible) fadeInContainer(dom.containerPart2, 400);
    else if (dom.containerPart2) dom.containerPart2.setAttribute('visible', true);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled && dom.soundV2) {
            dom.soundV2.pause();
            dom.soundV2.currentTime = 0;
            dom.soundV2.volume = 0;
            await dom.soundV2.play();
            fadeAudioIn(dom.soundV2, 400);
        } else {
             console.warn('⚠️ [Part 2] Audio belum diizinkan / tidak ditemukan.');
        }
    } catch (e) { 
        console.error('❌ [Part 2] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    // 4. SUTRADARA AUDIO (Saat audio habis: video FREEZE di frame terakhir, container TETAP terlihat)
    if (dom.soundV2) {
        dom.soundV2.onended = () => {
            console.log('✅ [Part 2] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part2Finished = true;
            
            videos.part2.forEach(v => { try { v.pause(); } catch (e) {} });
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            
            dom.statusBar.textContent = '✅ Part 2 selesai - Tap untuk ulang atau scan Marker 3 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart2() {
    if (!dom.target2) return;

    dom.target2.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 2) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 2) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.currentPart > 2) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            if (dom.containerPart2) dom.containerPart2.setAttribute('visible', false);
            return;
        }
        
        if (state.part1Finished && !state.part2Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 2;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            // Matikan deteksi target lain sementara
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart2();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (!state.part1Finished) {
            dom.statusBar.textContent = '⚠️ Scan Marker 1 dulu untuk Part 1';
        } else if (state.part2Finished && state.currentPart === 2 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 2';
            state.lastScannedMarker = 2;
        }
    });
}