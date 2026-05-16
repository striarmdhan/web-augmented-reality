import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart2() {
    if (state.isPlaying || !state.part1Finished || (state.currentPart !== 1 && state.currentPart !== 2) || state.isTransitioning) {
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 2;
    state.isTransitioning = true;
    
    hideAllContainersExcept(null);
    fadeAudioOut(dom.soundV1, 300);
    
    await new Promise(r => setTimeout(r, 100));
    
    state.currentPart = 2;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 2 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part2.forEach(v => { 
        v.pause(); 
        v.currentTime = 0; 
    });
    
    const playPromises = videos.part2.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart2, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled) {
            dom.soundV2.pause();
            dom.soundV2.currentTime = 0;
            dom.soundV2.volume = 0;
            await dom.soundV2.play();
            fadeAudioIn(dom.soundV2, 400);
        }
    } catch (e) { 
        console.error('❌ Audio v2 error:', e); 
    }
    
    state.isTransitioning = false;
    
    Promise.all(videos.part2.map(v => new Promise(resolve => { 
        v.onended = resolve; 
    }))).then(() => {
        state.isPlaying = false;
        state.part2Finished = true;
        fadeAudioOut(dom.soundV2, 400);
        
        fadeOutContainer(dom.containerPart2, 400, () => {
            videos.part2.forEach(v => { 
                v.pause(); 
                v.currentTime = 0; 
            });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        
        dom.statusBar.textContent = '✅ Part 2 selesai - Tap untuk ulang atau scan Marker 3 🎯';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart2() {
    dom.target2.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 2) return;
        if (state.isMarkerLocked && state.lockedMarker !== 2) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        if (state.currentPart > 2) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            dom.containerPart2.setAttribute('visible', false);
            return;
        }
        
        if (state.part1Finished && !state.part2Finished && !state.isPlaying && !state.isTransitioning) {
            state.activeMarkerDetection = 2;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            dom.target1.setAttribute('mindar-image-target', 'enabled: false');
            dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart2();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
        } else if (!state.part1Finished) {
            dom.statusBar.textContent = '⚠️ Scan Marker 1 dulu untuk Part 1';
        } else if (state.part2Finished && state.currentPart === 2 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 2';
            state.lastScannedMarker = 2;
        }
    });
}