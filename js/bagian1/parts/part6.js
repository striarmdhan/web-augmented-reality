import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart6() {
    if (state.isPlaying || state.isTransitioning) return;
    
    state.isMarkerLocked = true;
    state.lockedMarker = 6;
    hideAllContainersExcept(null);
    state.isTransitioning = true;
    
    const previousContainer = [dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart7].find(c => c.getAttribute('visible') === 'true');
    if (previousContainer) {
        fadeOutContainer(previousContainer, 400, async () => { await startPart6Videos(); });
    } else {
        await startPart6Videos();
    }
}

async function startPart6Videos() {
    state.currentPart = 6;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 6 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part6.forEach(v => { v.pause(); v.currentTime = 0; });
    
    const playPromises = videos.part6.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart6, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled) {
            dom.soundV6.pause();
            dom.soundV6.currentTime = 0;
            dom.soundV6.volume = 0;
            await dom.soundV6.play();
            fadeAudioIn(dom.soundV6, 400);
        }
    } catch (e) { console.error('❌ Audio v6 error:', e); }
    
    state.isTransitioning = false;
    
    Promise.all(videos.part6.map(v => new Promise(resolve => { v.onended = resolve; }))).then(() => {
        state.isPlaying = false;
        state.part6Finished = true;
        fadeAudioOut(dom.soundV6, 400);
        
        fadeOutContainer(dom.containerPart6, 400, () => {
            videos.part6.forEach(v => { v.pause(); v.currentTime = 0; });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        
        dom.statusBar.textContent = '✅ Part 6 selesai - Tap untuk ulang atau scan Marker 7 🎯';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart6() {
    dom.target6.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 6) return;
        if (state.isMarkerLocked && state.lockedMarker !== 6) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        if (state.currentPart > 6) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            dom.containerPart6.setAttribute('visible', false);
            return;
        }
        
        if (state.part5Finished && !state.part6Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 6;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart6();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target7.setAttribute('mindar-image-target', 'enabled: true');
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