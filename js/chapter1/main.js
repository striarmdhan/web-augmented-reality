import { state, dom, allVideos } from "./state.js";

// AREA IMPORT FUNGSI PART
import { playPart1, initPart1 } from './parts/part1.js';
import { playPart2, initPart2 } from './parts/part2.js';
import { playPart3, initPart3, resumePart3 } from './parts/part3.js';
import { playPart4, initPart4 } from './parts/part4.js';
import { playPart5, initPart5 } from './parts/part5.js';
import { playPart6, initPart6 } from './parts/part6.js';
import { playPart7, initPart7 } from './parts/part7.js';

import { initNextButton, hideNextButton } from './nextButton.js';

// 1. DYNAMIC CACHE BUSTING
const cacheBuster = Date.now();
console.log("🔄 Cache buster applied:", cacheBuster);

// BAGIAN 1 - SETTING PATH KE SUB-FOLDER
// Part 1
document.getElementById("vid-laut").src = `./compressed_ultra-videos/chapter1/part1/LAUT-v1.mp4?t=${cacheBuster}`;
document.getElementById("vid-batu").src = `./compressed_ultra-videos/chapter1/part1/BATU SEAWEED-v1.mp4?t=${cacheBuster}`;
document.getElementById("vid-gelembung").src = `./compressed_ultra-videos/chapter1/part1/GELEMBUNG-v1.mp4?t=${cacheBuster}`;
document.getElementById("vid-kapal").src = `./compressed_ultra-videos/chapter1/part1/KAPAL SELAM-v1.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot").src = `./compressed_ultra-videos/chapter1/part1/MASCOT-v1.mp4?t=${cacheBuster}`;

// Part 2
document.getElementById("vid-batu2").src = `./compressed_ultra-videos/chapter1/part2/BATU SEAWEED-v2.mp4?t=${cacheBuster}`;
document.getElementById("vid-gelembung2").src = `./compressed_ultra-videos/chapter1/part2/GELEMBUNG-v2.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot2").src = `./compressed_ultra-videos/chapter1/part2/MASCOT-v2.mp4?t=${cacheBuster}`;
document.getElementById("vid-gosok").src = `./compressed_ultra-videos/chapter1/part2/GOSOK GIGI-v2.mp4?t=${cacheBuster}`;
document.getElementById("vid-orang").src = `./compressed_ultra-videos/chapter1/part2/ORANG-v2.mp4?t=${cacheBuster}`;
document.getElementById("vid-text2").src = `./compressed_ultra-videos/chapter1/part2/TEXT_v2.mp4?t=${cacheBuster}`;

// Part 3
document.getElementById("vid-kapal3").src = `./compressed_ultra-videos/chapter1/part3/KAPAL SELAM-v3.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot3").src = `./compressed_ultra-videos/chapter1/part3/MASCOT-v3.mp4?t=${cacheBuster}`;
document.getElementById("vid-sikat").src = `./compressed_ultra-videos/chapter1/part3/SIKAT GIGI-v3.mp4?t=${cacheBuster}`;

// Part 4
document.getElementById("vid-kapal4").src = `./compressed_ultra-videos/chapter1/part4/KAPAL SELAM-v4.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot4").src = `./compressed_ultra-videos/chapter1/part4/MASCOT-v4.mp4?t=${cacheBuster}`;
document.getElementById("vid-sikat4").src = `./compressed_ultra-videos/chapter1/part4/SIKAT GIGI-v4.mp4?t=${cacheBuster}`;

// Part 5
document.getElementById("vid-orang5").src = `./compressed_ultra-videos/chapter1/part5/ORANG-v5.mp4?t=${cacheBuster}`;
document.getElementById("vid-tangan").src = `./compressed_ultra-videos/chapter1/part5/TANGAN-v5.mp4?t=${cacheBuster}`;

// Part 6
document.getElementById("vid-kapal6").src = `./compressed_ultra-videos/chapter1/part6/KAPAL SELAM-v6.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot2-6").src = `./compressed_ultra-videos/chapter1/part6/mascot2.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot6").src = `./compressed_ultra-videos/chapter1/part6/ORANG MASCOT-v6.mp4?t=${cacheBuster}`;

// Part 7
document.getElementById("vid-coral7").src = `./compressed_ultra-videos/chapter1/part7/CORAL-v7.mp4?t=${cacheBuster}`;
document.getElementById("vid-laut7").src = `./compressed_ultra-videos/chapter1/part7/LAUT-v7.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot7").src = `./compressed_ultra-videos/chapter1/part7/MASCOT-v7.mp4?t=${cacheBuster}`;
document.getElementById("vid-orang7").src = `./compressed_ultra-videos/chapter1/part7/ORANG-v7.mp4?t=${cacheBuster}`;

// 2. FORCE LOAD AUDIO & VIDEO
[dom.soundV1, dom.soundV2, dom.soundV3, dom.soundV4, dom.soundV5, dom.soundV6, dom.soundV7].forEach((s) => {
    s.load(); s.preload = "auto";
});

allVideos.forEach((v) => {
    v.load(); v.preload = "auto";
});

const totalVideos = 26;

// 3. LOADING SCREEN SYSTEM
allVideos.forEach((video, index) => {
    video.addEventListener("loadeddata", () => {
        state.videosLoaded++;
        const dots = "●".repeat(state.videosLoaded) + "○".repeat(totalVideos - state.videosLoaded);
        dom.loadingProgress.textContent = dots;
    });

    video.addEventListener("canplaythrough", () => {
        state.videosBuffered++;
        dom.loadingDetail.textContent = state.videosBuffered === totalVideos ? "Siap!" : "Harap bersabar sebentar";

        if (state.videosBuffered >= totalVideos && !state.allFullyBuffered) {
            state.allFullyBuffered = true;
            state.allReady = true;
            dom.loadingMessage.textContent = "Selesai!";
            dom.loadingDetail.textContent = "Silakan mulai pengalaman AR";
            dom.startButton.disabled = false;
            dom.startButton.textContent = "Mulai";
            dom.startButton.style.background = "#4caf50";
            dom.startButton.style.color = "white";
        }
    });
});

// 4. START BUTTON (UNLOCK AUDIO CONTEXT)
dom.startButton.addEventListener("click", async () => {
    if (!state.allFullyBuffered) return;

    try {
        const sounds = [dom.soundV1, dom.soundV2, dom.soundV3, dom.soundV4, dom.soundV5, dom.soundV6, dom.soundV7];
        for (let sound of sounds) {
            sound.muted = true;
            await sound.play();
            sound.pause();
            sound.currentTime = 0;
            sound.muted = false;
        }
        state.audioEnabled = true;
    } catch (e) {
        state.audioEnabled = false;
    }

    dom.loadingOverlay.classList.add("hidden");
    dom.arScene.classList.add("ready");

    initPart1(); initPart2(); initPart3(); initPart4(); initPart5(); initPart6(); initPart7();
    initNextButton();
});

// 5. GLOBAL CONTROL LOGIC
export function replayPart(partNumber) {
    if (partNumber !== state.currentPart) {
        dom.statusBar.textContent = "⚠️ Tidak bisa kembali ke Part sebelumnya";
        state.lastScannedMarker = 0;
        return;
    }

    state.lastScannedMarker = 0;
    const playActions = { 1: playPart1, 2: playPart2, 3: playPart3, 4: playPart4, 5: playPart5, 6: playPart6, 7: playPart7 };
    const stateKeys = { 1: 'part1Finished', 2: 'part2Finished', 3: 'part3Finished', 4: 'part4Finished', 5: 'part5Finished', 6: 'part6Finished', 7: 'part7Finished' };

    const stateKey = stateKeys[partNumber];
    const wasFinished = state[stateKey];
    state[stateKey] = false;
    
    if(partNumber === 3) state.part4Finished = false; 
    if(partNumber === 1) state.currentPart = 0; 

    playActions[partNumber]();

    setTimeout(() => {
        if (!state.isPlaying) {
            state[stateKey] = wasFinished;
            if(partNumber === 1) state.currentPart = 1;
        }
    }, 100);
}

export function restartFromBeginning() {
    const allContainers = [ dom.containerPart1, dom.containerPart2, dom.containerPart3, dom.containerPart4, dom.containerPart5, dom.containerPart6, dom.containerPart7 ];
    allContainers.forEach((c) => c.setAttribute("visible", false));

    allVideos.forEach((v) => { v.pause(); v.currentTime = 0; });

    state.currentPart = 0;
    state.part1Finished = false; state.part2Finished = false; state.part3Finished = false;
    state.part3Paused = false; state.part4Finished = false; state.part5Finished = false;
    state.part6Finished = false; state.part7Finished = false;
    state.isPlaying = false;
    state.lastScannedMarker = 0;

    dom.statusBar.classList.remove("finished");
    dom.statusBar.textContent = "Mencari marker...";

    hideNextButton();
}

// 6. EVENT LISTENERS
const handleInteraction = (e) => {
    if (e.type === "touchend") e.preventDefault();
    if (!state.isPlaying) {
        if (state.currentPart === 3 && state.part3Paused && !state.part3Finished) {
            resumePart3();
        } else if (state.lastScannedMarker > 0 && state.lastScannedMarker === state.currentPart) {
            replayPart(state.lastScannedMarker);
        } else if (state.currentPart >= 1 && state.currentPart <= 7 && state[`part${state.currentPart}Finished`]) {
            replayPart(state.currentPart);
        } else if (state.part7Finished && state.currentPart === 0) {
            restartFromBeginning();
        }
    }
};

dom.arScene.addEventListener("click", handleInteraction);
dom.arScene.addEventListener("touchend", handleInteraction);

const handleReset = (e) => {
    if (e.type === "touchend") e.preventDefault();
    if (confirm("Yakin ingin reset ke Part 1? Semua progress akan hilang.")) restartFromBeginning();
};

dom.resetButton.addEventListener("click", handleReset);
dom.resetButton.addEventListener("touchend", handleReset);