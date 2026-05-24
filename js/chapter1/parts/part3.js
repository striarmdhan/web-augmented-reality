import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept, isContainerVisible } from '../utils.js';

export async function playPart3() {
    // 1. Pengecekan guard ketat
    if (state.isPlaying || !state.part2Finished || (state.currentPart !== 2 && state.currentPart !== 3) || state.isTransitioning) {
        console.log('⏹️ [Part 3] Dibatalkan: Sedang play, Part 2 belum, atau bukan urutannya.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 3;
    state.isTransitioning = true;
    console.log('🔒 [Part 3] Marker LOCKED');
    
    hideAllContainersExcept(dom.containerPart3);
    
    // 2. Transisi mulus dari layar sebelumnya
    const allContainers = [dom.containerPart1, dom.containerPart2, dom.containerPart4, dom.containerPart5, dom.containerPart6, dom.containerPart7];
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
    console.log('🎬 [Part 3] Memulai pemutaran video (Fase 1)...');
    const wasVisible = isContainerVisible(dom.containerPart3);
    state.currentPart = 3;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 3 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part3.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part3.map(v => v.play().catch(e => console.error('❌ [Part 3] Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart3 && !wasVisible) fadeInContainer(dom.containerPart3, 400);
    else if (dom.containerPart3) dom.containerPart3.setAttribute('visible', true);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled && dom.soundV3) {
            dom.soundV3.pause();
            dom.soundV3.currentTime = 0;
            dom.soundV3.volume = 0;
            await dom.soundV3.play();
            fadeAudioIn(dom.soundV3, 400);
        }
    } catch (e) { console.error('❌ [Part 3] Audio error:', e); }
    
    state.isTransitioning = false;
    
    // Auto Pause di 3 detik (Fitur dipertahankan)
    setTimeout(() => {
        console.log('⏸️ [Part 3] Auto-pause di detik ke-3');
        videos.part3.forEach(v => v.pause());
        if (dom.soundV3) dom.soundV3.pause();
        
        state.isPlaying = false;
        state.part3Paused = true; 
        state.isMarkerLocked = false;
        console.log('🔓 [Part 3] Marker UNLOCKED (Menunggu interaksi user)');
        
        dom.statusBar.textContent = '⏸️ Part 3 di-pause - Tap untuk lanjutkan ▶️';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    }, 3000);
}

export async function resumePart3() {
    console.log('▶️ [Part 3] Melanjutkan pemutaran video (Fase 2)...');
    state.isMarkerLocked = true;
    state.lockedMarker = 3;
    state.isPlaying = true;
    state.part3Paused = false;
    
    dom.statusBar.textContent = '✅ Part 3 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    const playPromises = videos.part3.map(v => v.play().catch(e => console.error('❌ [Part 3 Resume] Video play error:', e)));
    await Promise.all(playPromises);
    
    // 3. TEKNIK FREEZE FRAME (Diletakkan di Resume karena di sinilah video akan tamat)
    videos.part3.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause(); 
                this.removeEventListener('timeupdate', preventBlackScreen); 
                console.log('🧊 [Part 3] Video dibekukan sebelum tamat!');
            }
        });
    });
    
    try {
        if (state.audioEnabled && dom.soundV3) await dom.soundV3.play();
    } catch (e) { console.error('❌ [Part 3] Audio resume error:', e); }
    
    // 4. SUTRADARA AUDIO (Saat audio habis: video FREEZE, container tetap terlihat)
    if (dom.soundV3) {
        dom.soundV3.onended = () => {
            console.log('✅ [Part 3] Audio habis! Video frozen di frame terakhir.');
            state.isPlaying = false;
            state.part3Finished = true;
            
            videos.part3.forEach(v => { try { v.pause(); } catch (e) {} });
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            
            dom.statusBar.textContent = '✅ Part 3 selesai - Scan Marker 4 untuk Part 4 🎯';
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
        
        if (state.part2Finished && !state.isPlaying && !state.isTransitioning) {
            if (state.part3Finished && state.currentPart === 3) {
                dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 3';
                state.lastScannedMarker = 3;
            } else if (!state.part3Finished) {
                state.activeMarkerDetection = 3;
                state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
                
                // Matikan target lain sementara
                if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
                if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
                if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: false');
                if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: false');
                if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: false');
                if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: false');
                
                playPart3();
                
                setTimeout(() => {
                    if (!state.isPlaying && !state.part3Paused) {
                        if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                        if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                        if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                        if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                        if (dom.target6) dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                        if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                        state.activeMarkerDetection = null;
                    }
                }, state.MARKER_IGNORE_DURATION);
            }
        } else if (!state.part2Finished) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 2 dulu';
        }
    });
}