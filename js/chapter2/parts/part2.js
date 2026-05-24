import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart2() {
    // Pengecekan guard
    if (state.isPlaying || !state.part1Finished || (state.currentPart !== 1 && state.currentPart !== 2) || state.isTransitioning) {
        console.log('⏹️ [Part 2] Dibatalkan: Sedang play, Part 1 belum selesai, atau urutan salah.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 2;
    state.isTransitioning = true;
    console.log('🔒 [Part 2] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart2);
    
    // Cari layar mana yang lagi nyala secara aman
    const allContainers = [dom.containerPart1, dom.containerPart3]; 
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
    
    // Reset video ke awal
    videos.part2.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part2.map(v => v.play().catch(e => console.error('❌ [Part 2] Video play error:', e)));
    await Promise.all(playPromises);
    console.log('📹 [Part 2] Semua video berjalan.');
    
    // FREEZE FRAME: pause video ~0.5 detik sebelum tamat agar tidak hitam
    videos.part2.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause();
                this.removeEventListener('timeupdate', preventBlackScreen);
            }
        });
    });
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart2 && !wasVisible) fadeInContainer(dom.containerPart2, 400);
    else if (dom.containerPart2) dom.containerPart2.setAttribute('visible', true);
    
    try {
        if (state.audioEnabled && dom.soundV2) {
            dom.soundV2.pause();
            dom.soundV2.currentTime = 0;
            dom.soundV2.volume = 0;
            await dom.soundV2.play();
            fadeAudioIn(dom.soundV2, 400);
            console.log('🔊 [Part 2] Audio sinkron!');
        } else {
            console.warn('⚠️ [Part 2] Audio tidak jalan/tidak ada.');
        }
    } catch (e) { 
        console.error('❌ [Part 2] Audio error:', e); 
    }
    
    state.isTransitioning = false;
    
    // Saat audio habis: video FREEZE di frame terakhir, container TETAP terlihat
    if (dom.soundV2) {
        dom.soundV2.onended = () => {
            console.log('✅ [Part 2] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part2Finished = true;
            
            videos.part2.forEach(v => { try { v.pause(); } catch (e) {} });
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            console.log('🔓 [Part 2] Marker UNLOCKED');
            
            dom.statusBar.textContent = '✅ Part 2 selesai - Tap layar untuk ulang atau scan Marker 3 🎯';
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
            console.log('🎯 [Part 2] Marker 2 Terdeteksi!');
            state.activeMarkerDetection = 2;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart2();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
            
        } else if (!state.part1Finished) {
            dom.statusBar.textContent = '⚠️ Scan Marker 1 dulu untuk Part 1';
        } else if (state.part2Finished && state.currentPart === 2 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 2';
            state.lastScannedMarker = 2;
        }
    });
}