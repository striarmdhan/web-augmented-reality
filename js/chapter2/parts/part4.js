import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart4() {
    // Pengecekan guard
    if (state.isPlaying || !state.part3Finished || (state.currentPart !== 3 && state.currentPart !== 4) || state.isTransitioning) {
        console.log('⏹️ [Part 4] Dibatalkan: Sedang play, Part 3 belum selesai, atau urutan salah.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 4;
    state.isTransitioning = true;
    console.log('🔒 [Part 4] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart4);
    
    // Cari layar sebelumnya yang mungkin masih menyala secara aman (terutama Part 3)
    const allContainers = [dom.containerPart1, dom.containerPart2, dom.containerPart3]; 
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 4] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => { 
            await startPart4Videos(); 
        });
    } else {
        await startPart4Videos();
    }
}

async function startPart4Videos() {
    console.log('🎬 [Part 4] Memulai pemutaran video...');
    const wasVisible = isContainerVisible(dom.containerPart4);
    state.currentPart = 4;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 4 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    // Reset video ke awal
    videos.part4.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part4.map(v => v.play().catch(e => console.error('❌ [Part 4] Video play error:', e)));
    await Promise.all(playPromises);
    console.log('📹 [Part 4] Semua video berjalan.');
    
    // FREEZE FRAME
    videos.part4.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause();
                this.removeEventListener('timeupdate', preventBlackScreen);
            }
        });
    });
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart4 && !wasVisible) fadeInContainer(dom.containerPart4, 400);
    else if (dom.containerPart4) dom.containerPart4.setAttribute('visible', true);
    
    try {
        if (state.audioEnabled && dom.soundV4) {
            dom.soundV4.pause();
            dom.soundV4.currentTime = 0;
            dom.soundV4.volume = 0;
            await dom.soundV4.play();
            fadeAudioIn(dom.soundV4, 400);
            console.log('🔊 [Part 4] Audio sinkron!');
        } else {
            console.warn('⚠️ [Part 4] Audio tidak jalan/tidak ada.');
        }
    } catch (e) { 
        console.error('❌ [Part 4] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    if (dom.soundV4) {
        dom.soundV4.onended = () => {
            console.log('✅ [Part 4] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part4Finished = true;
            
            if (dom.containerPart4) {
                // Memudarkan layar selama 250 milidetik
                fadeOutContainer(dom.containerPart4, 250, () => {
                    // Setelah layar benar-benar hilang (transparan 100%),
                    // barulah kita matikan videonya dan reset ke detik 0
                    videos.part4.forEach(v => { 
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
            console.log('🔓 [Part 4] Marker UNLOCKED');
            
            dom.statusBar.textContent = '✅ Part 4 selesai - Tap layar untuk ulang atau scan Marker 5 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart4() {
    if (!dom.target4) return;

    dom.target4.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 4) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 4) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.currentPart > 4) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            if (dom.containerPart4) dom.containerPart4.setAttribute('visible', false);
            return;
        }
        
        if (state.part3Finished && !state.part4Finished && !state.isPlaying && !state.isTransitioning) {
            console.log('🎯 [Part 4] Marker 4 Terdeteksi!');
            state.activeMarkerDetection = 4;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            // Matikan deteksi marker sebelumnya
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart4();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (!state.part3Finished) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 3 dulu';
        } else if (state.part4Finished && state.currentPart === 4 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 4';
            state.lastScannedMarker = 4;
        }
    });
}