import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart7() {
    if (state.isPlaying || state.isTransitioning) return;
    
    state.isMarkerLocked = true;
    state.lockedMarker = 7;
    hideAllContainersExcept(null);
    state.isTransitioning = true;
    
    const previousContainer = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart6].find(c => c.getAttribute('visible') === 'true');
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
    
    const playPromises = videos.part7.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart7, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled) {
            dom.soundV7.pause();
            dom.soundV7.currentTime = 0;
            dom.soundV7.volume = 0;
            await dom.soundV7.play();
            fadeAudioIn(dom.soundV7, 400);
        }
    } catch (e) { console.error('❌ Audio v7 error:', e); }
    
    state.isTransitioning = false;
    
    Promise.all(videos.part7.map(v => new Promise(resolve => { v.onended = resolve; }))).then(() => {
        state.isPlaying = false;
        state.part7Finished = true;
        fadeAudioOut(dom.soundV7, 400);
        
        fadeOutContainer(dom.containerPart7, 400, () => {
            videos.part7.forEach(v => { v.pause(); v.currentTime = 0; });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        
        dom.statusBar.textContent = '✅ Part 7 selesai! Tap untuk ulang atau tekan Reset 🔄';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart7() {
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
            
            dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart7();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target6.setAttribute('mindar-image-target', 'enabled: true');
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