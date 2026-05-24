import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart3() {
    // Pengecekan guard
    if (state.isPlaying || !state.part2Finished || (state.currentPart !== 2 && state.currentPart !== 3) || state.isTransitioning) {
        console.log('⏹️ [Part 3] Dibatalkan: Sedang play, Part 2 belum selesai, atau urutan salah.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 3;
    state.isTransitioning = true;
    console.log('🔒 [Part 3] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart3);
    
    // Cari layar sebelumnya yang mungkin masih menyala secara aman
    const allContainers = [dom.containerPart1, dom.containerPart2]; 
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 3] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => { 
            await startPart3Videos(); 
        });
    } else {
        await startPart3Videos();
    }
}

async function startPart3Videos() {
    console.log('🎬 [Part 3] Memulai pemutaran video...');
    const wasVisible = isContainerVisible(dom.containerPart3);
    state.currentPart = 3;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 3 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    // Reset video ke awal
    videos.part3.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part3.map(v => v.play().catch(e => console.error('❌ [Part 3] Video play error:', e)));
    await Promise.all(playPromises);
    console.log('📹 [Part 3] Semua video berjalan.');
    
    // FREEZE FRAME
    videos.part3.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause();
                this.removeEventListener('timeupdate', preventBlackScreen);
            }
        });
    });
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart3 && !wasVisible) fadeInContainer(dom.containerPart3, 400);
    else if (dom.containerPart3) dom.containerPart3.setAttribute('visible', true);
    
    try {
        if (state.audioEnabled && dom.soundV3) {
            dom.soundV3.pause();
            dom.soundV3.currentTime = 0;
            dom.soundV3.volume = 0;
            await dom.soundV3.play();
            fadeAudioIn(dom.soundV3, 400);
            console.log('🔊 [Part 3] Audio sinkron!');
        } else {
            console.warn('⚠️ [Part 3] Audio tidak jalan/tidak ada.');
        }
    } catch (e) { 
        console.error('❌ [Part 3] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    // Saat audio habis: video FREEZE di frame terakhir, container TETAP terlihat
    if (dom.soundV3) {
        dom.soundV3.onended = () => {
            console.log('✅ [Part 3] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part3Finished = true;
            
            videos.part3.forEach(v => { try { v.pause(); } catch (e) {} });
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            console.log('🔓 [Part 3] Marker UNLOCKED');
            
            dom.statusBar.textContent = '✅ Part 3 selesai - Tap layar untuk ulang atau scan Marker 4 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart3() {
    if (!dom.target3) return;

    dom.target3.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 3) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 3) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.currentPart > 3) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            if (dom.containerPart3) dom.containerPart3.setAttribute('visible', false);
            return;
        }
        
        if (state.part2Finished && !state.part3Finished && !state.isPlaying && !state.isTransitioning) {
            console.log('🎯 [Part 3] Marker 3 Terdeteksi!');
            state.activeMarkerDetection = 3;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart3();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (!state.part2Finished) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 2 dulu';
        } else if (state.part3Finished && state.currentPart === 3 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 3';
            state.lastScannedMarker = 3;
        }
    });
}