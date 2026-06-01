import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart5() {
    // 1. Pengecekan guard ketat
    if (state.isPlaying || !state.part4Finished || (state.currentPart !== 4 && state.currentPart !== 5) || state.isTransitioning) {
        console.log('⏹️ [Part 5] Dibatalkan: Sedang play, Part 4 belum, atau bukan urutannya.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 5;
    state.isTransitioning = true;
    console.log('🔒 [Part 5] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart5);
    
    // 2. Transisi mulus dari layar sebelumnya
    const allContainers = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart6, dom.containerPart7];
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 5] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => {
            await startPart5Videos();
        });
    } else {
        await startPart5Videos();
    }
}

async function startPart5Videos() {
    console.log('🎬 [Part 5] Memulai pemutaran video...');
    const wasVisible = isContainerVisible(dom.containerPart5);
    state.currentPart = 5;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 5 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part5.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part5.map(v => v.play().catch(e => console.error('❌ [Part 5] Video play error:', e)));
    await Promise.all(playPromises);
    
    // 3. TEKNIK FREEZE FRAME (Mencegah black screen di akhir video)
    videos.part5.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause(); 
                this.removeEventListener('timeupdate', preventBlackScreen); 
                console.log('🧊 [Part 5] Video dibekukan sebelum tamat!');
            }
        });
    });
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart5 && !wasVisible) fadeInContainer(dom.containerPart5, 400);
    else if (dom.containerPart5) dom.containerPart5.setAttribute('visible', true);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled && dom.soundV5) {
            dom.soundV5.pause();
            dom.soundV5.currentTime = 0;
            dom.soundV5.volume = 0;
            await dom.soundV5.play();
            fadeAudioIn(dom.soundV5, 400);
        } else {
             console.warn('⚠️ [Part 5] Audio belum diizinkan / tidak ditemukan.');
        }
    } catch (e) { console.error('❌ [Part 5] Audio error:', e); }
    
    state.isTransitioning = false;
    
    // 4. SUTRADARA AUDIO (Saat audio habis: video FREEZE, container tetap terlihat)
    if (dom.soundV5) {
        dom.soundV5.onended = () => {
            console.log('✅ [Part 5] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part5Finished = true;
            
            if (dom.containerPart5) {
                // Memudarkan layar selama 250 milidetik
                fadeOutContainer(dom.containerPart5, 250, () => {
                    // Setelah layar benar-benar hilang (transparan 100%),
                    // barulah kita matikan videonya dan reset ke detik 0
                    videos.part5.forEach(v => { 
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
            
            dom.statusBar.textContent = '✅ Part 5 selesai - Tap untuk ulang atau scan Marker 6 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart5() {
    if (!dom.target5) return;

    dom.target5.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 5) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 5) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.currentPart > 5) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            if (dom.containerPart5) dom.containerPart5.setAttribute('visible', false);
            return;
        }
        
        if (state.part4Finished && !state.part5Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 5;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            // Matikan target lain sementara
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart5();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
        } else if (!state.part4Finished) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 4 dulu';
        } else if (state.part5Finished && state.currentPart === 5 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 5';
            state.lastScannedMarker = 5;
        }
    });
}