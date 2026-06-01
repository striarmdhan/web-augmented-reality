import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart7() {
    // Pengecekan guard
    if (state.isPlaying || !state.part6Finished || (state.currentPart !== 6 && state.currentPart !== 7) || state.isTransitioning) {
        console.log('⏹️ [Part 7] Dibatalkan: Sedang play, Part 6 belum selesai, atau urutan salah.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 7;
    state.isTransitioning = true;
    console.log('🔒 [Part 7] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart7);
    
    // Cari layar sebelumnya yang mungkin masih menyala secara aman
    const allContainers = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart6]; 
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 7] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => { 
            await startPart7Videos(); 
        });
    } else {
        await startPart7Videos();
    }
}

async function startPart7Videos() {
    console.log('🎬 [Part 7] Memulai pemutaran video...');
    const wasVisible = isContainerVisible(dom.containerPart7);
    state.currentPart = 7;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 7 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    // Reset video ke awal
    videos.part7.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part7.map(v => v.play().catch(e => console.error('❌ [Part 7] Video play error:', e)));
    await Promise.all(playPromises);
    console.log('📹 [Part 7] Semua video berjalan.');
    
    // FREEZE FRAME
    videos.part7.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause();
                this.removeEventListener('timeupdate', preventBlackScreen);
            }
        });
    });
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart7 && !wasVisible) fadeInContainer(dom.containerPart7, 400);
    else if (dom.containerPart7) dom.containerPart7.setAttribute('visible', true);
    
    try {
        if (state.audioEnabled && dom.soundV7) {
            dom.soundV7.pause();
            dom.soundV7.currentTime = 0;
            dom.soundV7.volume = 0;
            await dom.soundV7.play();
            fadeAudioIn(dom.soundV7, 400);
            console.log('🔊 [Part 7] Audio sinkron!');
        } else {
            console.warn('⚠️ [Part 7] Audio tidak jalan/tidak ada.');
        }
    } catch (e) { 
        console.error('❌ [Part 7] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    if (dom.soundV7) {
        dom.soundV7.onended = () => {
            console.log('✅ [Part 7] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part7Finished = true;
            
            if (dom.containerPart7) {
                // Memudarkan layar selama 250 milidetik
                fadeOutContainer(dom.containerPart7, 250, () => {
                    // Setelah layar benar-benar hilang (transparan 100%),
                    // barulah kita matikan videonya dan reset ke detik 0
                    videos.part7.forEach(v => { 
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
            console.log('🔓 [Part 7] Marker UNLOCKED');
            
            dom.statusBar.textContent = '✅ Part 7 selesai! Tap layar untuk ulang atau tekan Reset 🔄';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart7() {
    if (!dom.target7) return; // Sabuk pengaman

    dom.target7.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 7) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 7) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        // Catatan: Tidak ada cek "currentPart > 7" karena Part 7 adalah part terakhir
        
        if (state.part6Finished && !state.part7Finished && !state.isPlaying && !state.isTransitioning) {
            console.log('🎯 [Part 7] Marker 7 Terdeteksi!');
            state.activeMarkerDetection = 7;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            // Matikan deteksi marker sebelumnya
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart7();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (!state.part6Finished) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 6 dulu';
        } else if (state.part7Finished && state.currentPart === 7 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 7';
            state.lastScannedMarker = 7;
        }
    });
}