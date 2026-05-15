import { state, dom, allVideos } from "./state.js";

// AREA IMPORT FUNGSI PART
import { playPart1, initPart1 } from './parts/part1.js';


const cacheBuster = Date.now();
console.log("🔄 Cache buster applied:", cacheBuster);

// Part 1
document.getElementById("vid-bakteri").src = `./compressed_ultra/bagian2/part1/bagian 2 - part1 - bakteri.mp4?t=${cacheBuster}`;
document.getElementById("vid-balon-bebek").src = `./compressed_ultra/bagian2/part1/bagian 2 - part1 - balon bebek.mp4?t=${cacheBuster}`;
document.getElementById("vid-kolam-renang").src = `./compressed_ultra/bagian2/part1/bagian 2 - part1 - kolam renang.mp4?t=${cacheBuster}`;
document.getElementById("vid-mascot").src = `./compressed_ultra/bagian2/part1/bagian 2 - part1 - mascot.mp4?t=${cacheBuster}`;
document.getElementById("vid-muntah").src = `./compressed_ultra/bagian2/part1/bagian 2 - part1 - muntah.mp4?t=${cacheBuster}`;
document.getElementById("vid-orang-gigi").src = `./compressed_ultra/bagian2/part1/bagian 2 - part1 - orang gigi.mp4?t=${cacheBuster}`;


// FORCE LOAD AUDIO & VIDEO
[dom.soundV1].forEach((s) => {
    s.load(); s.preload = "auto";
});

allVideos.forEach((v) => {
    v.load(); v.preload = "auto";
});

// SESUAIKAN JUMLAH VIDEO DARI SELURUH PART (SAAT INI 6 UTK PART 1)
const totalVideos = 6;

allVideos.forEach((video, index) => {
    video.addEventListener("loadeddata", () => {
        state.videosLoaded++; 
        const dots = "●".repeat(state.videosLoaded) + "○".repeat(totalVideos - state.videosLoaded);
        dom.loadingProgress.textContent = dots;
    });

    video.addEventListener("canplaythrough", () => {
        state.videosBuffered++;
        // SESUAIKAN JUMLAH VIDEO DARI SELURUH PART (SAAT INI 6 UTK PART 1)
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

dom.startButton.addEventListener("click", async () => {
    if (!state.allFullyBuffered) return;

    try {
        const sounds = [dom.soundV1];
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

    initPart1(); 
    // initPart2(); initPart3(); initPart4(); initPart5(); initPart6(); initPart7();
});

export function replayPart(partNumber) {
    if (partNumber !== state.currentPart) {
        dom.statusBar.textContent = "⚠️ Tidak bisa kembali ke Part sebelumnya";
        state.lastScannedMarker = 0;
        return;
    }

    state.lastScannedMarker = 0;
    const playActions = { 1: playPart1 };
    const stateKeys = { 1: 'part1Finished' };

    const stateKey = stateKeys[partNumber];
    const wasFinished = state[stateKey];
    state[stateKey] = false;
    
    // if(partNumber === 3) state.part4Finished = false; 
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
    const allContainers = [ dom.containerPart1 ];
    allContainers.forEach((c) => c.setAttribute("visible", false));

    allVideos.forEach((v) => { v.pause(); v.currentTime = 0; });

    state.currentPart = 0;
    state.part1Finished = false; 
    state.isPlaying = false;
    state.lastScannedMarker = 0;

    dom.statusBar.classList.remove("finished");
    dom.statusBar.textContent = "Mencari marker...";
}

const handleInteraction = (e) => {
    if (e.type === "touchend") e.preventDefault();
    if (!state.isPlaying) {
        if (state.lastScannedMarker > 0 && state.lastScannedMarker === state.currentPart) {
            replayPart(state.lastScannedMarker);
        } else if (state.currentPart >= 1 && state.currentPart <= 7 && state[`part${state.currentPart}Finished`]) {
            replayPart(state.currentPart);
        } 
        // else if (state.part7Finished && state.currentPart === 0) {
        //     restartFromBeginning();
        // }
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