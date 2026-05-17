import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, hideAllContainersExcept } from '../utils.js';

export async function playPart7() {
    if (state.isPlaying || state.isTransitioning) return;
    
    state.isMarkerLocked = true;
    state.lockedMarker = 7;
    hideAllContainersExcept(null);
    state.isTransitioning = true;
    
    const previousContainer = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart6].find(c => c && c.getAttribute('visible') === 'true');
    if (previousContainer) {
        fadeOutContainer(previousContainer, 400, async () => { await startPart7Videos(); });
    } else {
        await startPart7Videos();
    }
}

async function startPart7Videos() {
    state.currentPart = 7;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 7 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part7.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part7.map(v => v.play().catch(e => console.error('❌ [Part 7] Video play error:', e)));
    await Promise.all(playPromises);
    
    // 👇 BLOK FREEZE FRAME DITAMBAHKAN DI SINI 👇
    videos.part7.forEach(v => {
        v.addEventListener('timeupdate', function preventBlackScreen() {
            // Pastikan duration sudah terbaca dan sisa waktu <= 0.2 detik
            if (this.duration && (this.duration - this.currentTime <= 0.5)) {
                this.pause(); 
                this.removeEventListener('timeupdate', preventBlackScreen); // Cabut pemantau
                console.log('🧊 [Part 7] Video dibekukan di frame terakhir untuk menunggu audio!');
            }
        });
    });
    // 👆 SELESAI BLOK FREEZE FRAME 👆
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart7, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled && dom.soundV7) {
            dom.soundV7.pause();
            dom.soundV7.currentTime = 0;
            dom.soundV7.volume = 0;
            await dom.soundV7.play();
            fadeAudioIn(dom.soundV7, 400);
        }
    } catch (e) { console.error('❌ Audio v7 error:', e); }
    
    state.isTransitioning = false;
    
    // TEKNIK SUTRADARA AUDIO
    if (dom.soundV7) {
        dom.soundV7.onended = () => {
            console.log('✅ [Part 7] Audio habis! Menutup adegan...');
            state.isPlaying = false;
            state.part7Finished = true;
            
            // Fade out layar super cepat (250ms)
            if (dom.containerPart7) {
                fadeOutContainer(dom.containerPart7, 250, () => {
                    videos.part7.forEach(v => { v.pause(); v.currentTime = 0; });
                    console.log('🧹 [Part 7] Layar dibersihkan.');
                });
            }
            
            state.isMarkerLocked = false;
            state.lockedMarker = null;
            
            dom.statusBar.textContent = '✅ Part 7 selesai! Tap untuk ulang atau tekan Reset 🔄';
            dom.statusBar.classList.remove('tracking');
            dom.statusBar.classList.add('finished');
        };
    }
}

export function initPart7() {
    if (!dom.target7) return;
    
    dom.target7.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 7) return;
        if (state.isMarkerLocked && state.lockedMarker !== 7) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        
        if (state.part6Finished && !state.part7Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 7;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
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
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 7';
            state.lastScannedMarker = 7;
        }
    });
}