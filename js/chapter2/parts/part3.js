import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart3() {
    if (state.isPlaying || !state.part2Finished || (state.currentPart !== 2 && state.currentPart !== 3) || state.isTransitioning) {
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 3;
    state.isTransitioning = true;
    
    hideAllContainersExcept(null);
    fadeAudioOut(dom.soundV2, 300);
    
    await new Promise(r => setTimeout(r, 100));
    
    state.currentPart = 3;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 3 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    dom.statusBar.classList.remove('finished');
    
    videos.part3.forEach(v => { 
        v.pause(); 
        v.currentTime = 0; 
    });
    
    const playPromises = videos.part3.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart3, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (state.audioEnabled) {
            dom.soundV3.pause();
            dom.soundV3.currentTime = 0;
            dom.soundV3.volume = 0;
            await dom.soundV3.play();
            fadeAudioIn(dom.soundV3, 400);
        }
    } catch (e) { 
        console.error('❌ Audio v2 error:', e); 
    }
    
    state.isTransitioning = false;
    
    Promise.all(videos.part3.map(v => new Promise(resolve => { 
        v.onended = resolve; 
    }))).then(() => {
        state.isPlaying = false;
        state.part3Finished = true;
        fadeAudioOut(dom.soundV3, 400);
        
        fadeOutContainer(dom.containerPart3, 400, () => {
            videos.part3.forEach(v => { 
                v.pause(); 
                v.currentTime = 0; 
            });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        
        dom.statusBar.textContent = '✅ Part 3 selesai - Tap untuk ulang atau scan Marker 3 🎯';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart3() {
    dom.target3.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 3) return;
        if (state.isMarkerLocked && state.lockedMarker !== 3) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        if (state.currentPart > 3) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            dom.containerPart3.setAttribute('visible', false);
            return;
        }
        
        if (state.part2Finished && !state.part3Finished && !state.isPlaying && !state.isTransitioning) {
                state.activeMarkerDetection = 3;
                state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
                
                dom.target1.setAttribute('mindar-image-target', 'enabled: false');
                dom.target2.setAttribute('mindar-image-target', 'enabled: false');
                // dom.target4.setAttribute('mindar-image-target', 'enabled: false');
                // dom.target5.setAttribute('mindar-image-target', 'enabled: false');
                // dom.target6.setAttribute('mindar-image-target', 'enabled: false');
                // dom.target7.setAttribute('mindar-image-target', 'enabled: false');
                
                playPart3();
                
                setTimeout(() => {
                    if (!state.isPlaying) {
                        dom.target1.setAttribute('mindar-image-target', 'enabled: true');
                        dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                        // dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                        // dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                        // dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                        // dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                        state.activeMarkerDetection = null;
                    }
                }, state.MARKER_IGNORE_DURATION);
        } else if (!state.part2Finished) {
            dom.statusBar.textContent = '⚠️ Scan Marker 1 dulu untuk Part 1';
        } else if (state.part3Finished && state.currentPart === 3 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap untuk ulang Part 3';
            state.lastScannedMarker = 3;
        }
    });
}