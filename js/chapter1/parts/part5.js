import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart5() {
    if (state.isPlaying || state.isTransitioning) return;
    
    state.isMarkerLocked = true;
    state.lockedMarker = 5;
    hideAllContainersExcept(null);
    state.isTransitioning = true;
    
    const previousContainer = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4].find(c => c.getAttribute('visible') === 'true');
    if (previousContainer) {
        fadeOutContainer(previousContainer, 400, async () => { await startPart5Videos(); });
    } else {
        await startPart5Videos();
    }
}

async function startPart5Videos() {
    state.currentPart = 5;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 5 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part5.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part5.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart5, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled) {
            dom.soundV5.pause();
            dom.soundV5.currentTime = 0;
            dom.soundV5.volume = 0;
            await dom.soundV5.play();
            fadeAudioIn(dom.soundV5, 400);
        }
    } catch (e) { console.error('❌ Audio v5 error:', e); }
    
    state.isTransitioning = false;
    
    Promise.all(videos.part5.map(v => new Promise(resolve => { v.onended = resolve; }))).then(() => {
        state.isPlaying = false;
        state.part5Finished = true;
        fadeAudioOut(dom.soundV5, 400);
        
        fadeOutContainer(dom.containerPart5, 400, () => {
            videos.part5.forEach(v => { v.pause(); v.currentTime = 0; });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        
        dom.statusBar.textContent = '✅ Part 5 selesai - Tap untuk ulang atau scan Marker 6 🎯';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart5() {
    dom.target5.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 5) return;
        if (state.isMarkerLocked && state.lockedMarker !== 5) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        if (state.currentPart > 5) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            dom.containerPart5.setAttribute('visible', false);
            return;
        }
        
        if (state.part4Finished && !state.part5Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 5;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart5();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target7.setAttribute('mindar-image-target', 'enabled: true');
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