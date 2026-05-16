import { state, dom, videos } from '../state.js';
import { fadeInContainer, fadeOutContainer, fadeAudioIn, fadeAudioOut, hideAllContainersExcept } from '../utils.js';

export async function playPart1() {
    if (state.isPlaying || (state.currentPart !== 0 && state.currentPart !== 1)) {
        console.log('⏹️ Already playing or not at start');
        return;
    }
    
    state.isMarkerLocked = true;
    state.lockedMarker = 1;
    console.log('🔒 Marker LOCKED - Only Marker 1 active');
    
    hideAllContainersExcept(null);
    
    console.log('🎬 Starting Part 1 - 5 videos overlay');
    state.currentPart = 1;
    state.isPlaying = true;
    
    dom.statusBar.textContent = '✅ Part 1 Playing! 🔊';
    dom.statusBar.classList.add('tracking');
    
    videos.part1.forEach(v => {
        v.pause();
        v.currentTime = 0;
    });
    
    console.log('📹 Starting videos first...');
    const playPromises = videos.part1.map(v => v.play().catch(e => console.error('Video play error:', e)));
    await Promise.all(playPromises);
    
    await new Promise(r => setTimeout(r, 150));
    fadeInContainer(dom.containerPart1, 400);
    await new Promise(r => setTimeout(r, 50));
    
    try {
        if (!state.audioEnabled) {
            console.warn('⚠️ Audio not enabled yet, skipping audio playback');
        } else {
            dom.soundV1.pause();
            dom.soundV1.currentTime = 0;
            dom.soundV1.volume = 0;
            await dom.soundV1.play();
            fadeAudioIn(dom.soundV1, 400);
            console.log('✅ Audio v1 playing (synced)!');
        }
    } catch (e) {
        console.error('❌ Audio v1 error:', e);
    }
    
    Promise.all(videos.part1.map(v => new Promise(resolve => {
        v.onended = resolve;
    }))).then(() => {
        console.log('✅ Part 1 finished!');
        state.isPlaying = false;
        state.part1Finished = true;
        fadeAudioOut(dom.soundV1, 400);
        
        fadeOutContainer(dom.containerPart1, 400, () => {
            videos.part1.forEach(v => {
                v.pause();
                v.currentTime = 0;
            });
        });
        
        state.isMarkerLocked = false;
        state.lockedMarker = null;
        console.log('🔓 Marker UNLOCKED - All markers active');
        
        dom.statusBar.textContent = '✅ Part 1 selesai - Tap layar untuk ulang atau scan Marker 2 🎯';
        dom.statusBar.classList.remove('tracking');
        dom.statusBar.classList.add('finished');
    });
}

export function initPart1() {
    dom.target1.addEventListener('targetFound', () => {
        const now = Date.now();
        if (now < state.markerIgnoreUntil && state.activeMarkerDetection !== 1) return;
        if (state.isMarkerLocked && state.lockedMarker !== 1) {
            dom.statusBar.textContent = `⚠️ Tunggu Part ${state.lockedMarker} selesai dulu`;
            return;
        }
        if (state.currentPart > 1) {
            dom.statusBar.textContent = '🚫 Tidak bisa balik ke Part sebelumnya! Tekan Reset jika perlu.';
            dom.containerPart1.setAttribute('visible', false);
            return;
        }
        
        if (!state.part1Finished && state.currentPart === 0 && !state.isPlaying) {
            state.activeMarkerDetection = 1;
            state.markerIgnoreUntil = now + state.MARKER_IGNORE_DURATION;
            
            dom.target2.setAttribute('mindar-image-target', 'enabled: false');
            dom.target3.setAttribute('mindar-image-target', 'enabled: false');
            // dom.target4.setAttribute('mindar-image-target', 'enabled: false');
            // dom.target5.setAttribute('mindar-image-target', 'enabled: false');
            // dom.target6.setAttribute('mindar-image-target', 'enabled: false');
            // dom.target7.setAttribute('mindar-image-target', 'enabled: false');
            
            playPart1();
            
            setTimeout(() => {
                if (!state.isPlaying) {
                    dom.target2.setAttribute('mindar-image-target', 'enabled: true');
                    dom.target3.setAttribute('mindar-image-target', 'enabled: true');
                    // dom.target4.setAttribute('mindar-image-target', 'enabled: true');
                    // dom.target5.setAttribute('mindar-image-target', 'enabled: true');
                    // dom.target6.setAttribute('mindar-image-target', 'enabled: true');
                    // dom.target7.setAttribute('mindar-image-target', 'enabled: true');
                    state.activeMarkerDetection = null;
                }
            }, state.MARKER_IGNORE_DURATION);
        } else if (state.part1Finished && state.currentPart === 1 && !state.isPlaying) {
            dom.statusBar.textContent = '⚠️ Tap layar untuk ulang Part 1';
            state.lastScannedMarker = 1;
        }
    });
}