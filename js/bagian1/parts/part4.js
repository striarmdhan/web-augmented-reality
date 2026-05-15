import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart4() {
    if (state.isPlaying || state.isTransitioning) return;
    
    state.isMarkerLocked = true;
    state.lockedMarker = 4;
    hideAllContainersExcept(null);
    state.isTransitioning = true;
    
    if (dom.containerPart3.getAttribute('visible') === 'true') {
        fadeOutContainer(dom.containerPart3, 400, async () => {
            await startPart4Videos();
        });
    } else {
        const previousContainer = [dom.containerPart1, dom.containerPart2, dom.containerPart5].find(c => c.getAttribute('visible') === 'true');
        if (previousContainer) {
            fadeOutContainer(previousContainer, 400, async () => { await startPart4Videos(); });
        } else {
            await startPart4Videos();
        }
    }
}

async function startPart4Videos() {
    state.currentPart = 4;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 4 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part4.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part4.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart4, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled) {
            dom.soundV4.pause();
            dom.soundV4.currentTime = 0;
            dom.soundV4.volume = 0;
            await dom.soundV4.play();
            fadeAudioIn(dom.soundV4, 400);
        }
    } catch (e) { console.error('❌ Audio v4 error:', e); }
    
    state.isTransitioning = false;
    
    Promise.all(videos.part4.map(v => new Promise(resolve => { v.onended = resolve; }))).then(() => {
        state.isPlaying = false;
        state.part4Finished = true;
        fadeAudioOut(dom.soundV4, 400);
        
        fadeOutContainer(dom.containerPart4, 400, () => {
            videos.part4.forEach(v => { v.pause(); v.currentTime = 0; });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        
        dom.statusBar.textContent = '✅ Part 4 selesai - Tap untuk ulang atau scan Marker 5 🎯';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart4() {
    dom.target4.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 4) return;
        if (state.isMarkerLocked && state.lockedMarker !== 4) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        if (state.currentPart > 4) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            dom.containerPart4.setAttribute('visible', false);
            return;
        }
        
        if (state.part3Finished && !state.part4Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 4;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart4();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
        } else if (!state.part3Finished || state.part3Paused) {
            dom.statusBar.textContent = '⚠️ Selesaikan Part 3 dulu';
        } else if (state.part4Finished && state.currentPart === 4 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 4';
            state.lastScannedMarker = 4;
        }
    });
}