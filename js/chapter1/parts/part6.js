import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept } from '../utils.js';

export async function playPart6() {
    // 1. Pengecekan guard ketat (Disamakan dengan struktur Part sebelumnya)
    if (state.isPlaying || !state.part5Finished || (state.currentPart !== 5 && state.currentPart !== 6) || state.isTransitioning) {
        console.log('⏹️ [Part 6] Dibatalkan: Sedang play, Part 5 belum, atau bukan urutannya.');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 6;
    state.isTransitioning = true;
    console.log('🔒 [Part 6] Marker LOCKED');
    
    hideAllContainersExcept(null);
    
    // 2. Transisi mulus dari layar sebelumnya
    const allContainers = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart7];
    const previousContainer = allContainers.find(c => c && c.getAttribute('visible') === 'true');
    
    if (previousContainer) {
        console.log('🔄 [Part 6] Memudarkan adegan sebelumnya...');
        fadeOutContainer(previousContainer, 400, async () => { 
            await startPart6Videos(); 
        });
    } else {
        await startPart6Videos();
    }
}

async function startPart6Videos() {
    console.log('🎬 [Part 6] Memulai pemutaran video...');
    state.currentPart = 6;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 6 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part6.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part6.map(v => v.play().catch(e => console.error('❌ [Part 6] Video play error:', e)));
    await Promise.all(playPromises);
    
    // 3. TEKNIK FREEZE FRAME
    videos.part6.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause(); 
                this.removeEventListener('timeupdate', preventBlackScreen); 
                console.log('🧊 [Part 6] Video dibekukan sebelum tamat!');
            }
        });
    });
    
    await new Promise(r => setTimeout(r, 150));
    if (dom.containerPart6) fadeInContainer(dom.containerPart6, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled && dom.soundV6) {
            dom.soundV6.pause();
            dom.soundV6.currentTime = 0;
            dom.soundV6.volume = 0;
            await dom.soundV6.play();
            fadeAudioIn(dom.soundV6, 400);
        } else {
             console.warn('⚠️ [Part 6] Audio belum diizinkan / tidak ditemukan.');
        }
    } catch (e) { console.error('❌ [Part 6] Audio error:', e); }
    
    state.isTransitioning = false;
    
    // 4. SUTRADARA AUDIO
    if (dom.soundV6) {
        dom.soundV6.onended = () => {
            console.log('✅ [Part 6] Audio habis! Menutup adegan...');
            state.isPlaying = false;
            state.part6Finished = true;
            
            // Fade out layar super cepat
            if (dom.containerPart6) {
                fadeOutContainer(dom.containerPart6, 250, () => {
                    videos.part6.forEach(v => { v.pause(); v.currentTime = 0; });
                    console.log('🧹 [Part 6] Layar dibersihkan.');
                });
            }
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            
            dom.statusBar.textContent = '✅ Part 6 selesai - Tap untuk ulang atau scan Marker 7 🎯';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart6() {
    if (!dom.target6) return;
    
    dom.target6.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 6) return;
        
        if (state.isMarkerLocked && state.lockedMarker !== 6) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.currentPart > 6) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            if (dom.containerPart6) dom.containerPart6.setAttribute('visible', false);
            return;
        }
        
        if (state.part5Finished && !state.part6Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 6;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart6();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    if (dom.target1) dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target2) dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target3) dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target4) dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target5) dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    if (dom.target7) dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
        } else if (!state.part5Finished) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 5 dulu';
        } else if (state.part6Finished && state.currentPart === 6 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 6';
            state.lastScannedMarker = 6;
        }
    });
}