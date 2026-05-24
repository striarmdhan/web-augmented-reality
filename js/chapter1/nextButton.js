// Logika tombol "Next" untuk pindah dari Chapter 1 ke Chapter 2.
// - Muncul otomatis saat Part 7 selesai (alur normal).
// - Saat TEST_MODE aktif: muncul beberapa detik setelah scene siap, supaya bisa dites
//   tanpa harus menyelesaikan ke-7 part dulu.
// - Mendukung tap (touch) dan klik (mouse), dengan log untuk verifikasi.

import { state, dom } from './state.js';

const NEXT_DESTINATION = './chapter2.html';
const TEST_AUTO_SHOW_DELAY_MS = 1200;

const tapDebug = document.getElementById('tapDebug');
let tapCount = 0;

function logTap(label) {
    tapCount++;
    console.log(`👉 [NextButton] ${label} (#${tapCount})`);
    if (tapDebug) {
        tapDebug.textContent = `${label} #${tapCount}`;
        tapDebug.classList.add('show');
        clearTimeout(logTap._t);
        logTap._t = setTimeout(() => tapDebug.classList.remove('show'), 1500);
    }
}

export function showNextButton(reason = 'manual') {
    const btn = document.getElementById('nextButton');
    if (!btn) {
        console.warn('⚠️ [NextButton] Element #nextButton tidak ditemukan.');
        return;
    }
    if (btn.classList.contains('visible')) return;
    btn.classList.add('visible');
    console.log(`✨ [NextButton] Ditampilkan (alasan: ${reason})`);
}

export function hideNextButton() {
    const btn = document.getElementById('nextButton');
    if (!btn) return;
    btn.classList.remove('visible');
}

function navigateNext() {
    console.log('➡️ [NextButton] Navigasi ke', NEXT_DESTINATION);
    // beri waktu animasi tap-flash terlihat
    setTimeout(() => { window.location.href = NEXT_DESTINATION; }, 150);
}

function bindTapHandlers() {
    const btn = document.getElementById('nextButton');
    if (!btn) {
        console.warn('⚠️ [NextButton] Element #nextButton tidak ditemukan saat bind.');
        return;
    }

    let pressed = false;

    const flash = () => {
        btn.classList.add('tap-flash');
        setTimeout(() => btn.classList.remove('tap-flash'), 200);
    };

    // Touch (mobile)
    btn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        pressed = true;
        logTap('touchstart');
    }, { passive: true });

    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!pressed) return;
        pressed = false;
        logTap('touchend → navigate');
        flash();
        navigateNext();
    }, { passive: false });

    btn.addEventListener('touchcancel', () => { pressed = false; });

    // Mouse / pointer (desktop & tap pengganti)
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Cegah dobel-trigger ketika touchend juga jalan (touch device akan langsung navigate dari touchend)
        if (pressed) return;
        logTap('click → navigate');
        flash();
        navigateNext();
    });

    // Keyboard a11y (Enter / Space)
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            logTap(`key:${e.key} → navigate`);
            flash();
            navigateNext();
        }
    });

    console.log('✅ [NextButton] Tap handler terpasang. Test sekarang.');
}

function watchForPart7Finished() {
    // Polling ringan: cek setiap 500ms apakah part7 sudah selesai dan
    // semua bagian non-playing (alur normal selesai).
    const interval = setInterval(() => {
        if (state.part7Finished && !state.isPlaying && !state.isTransitioning) {
            showNextButton('part7Finished');
            clearInterval(interval);
        }
    }, 500);
}

export function initNextButton() {
    bindTapHandlers();
    watchForPart7Finished();

    // Mode testing: tampilkan otomatis setelah scene siap supaya bisa dites
    // tappability-nya tanpa harus menyelesaikan semua part.
    if (state.TEST_MODE) {
        const trigger = () => setTimeout(() => showNextButton('TEST_MODE'), TEST_AUTO_SHOW_DELAY_MS);
        if (dom.arScene && dom.arScene.classList.contains('ready')) {
            trigger();
        } else if (dom.startButton) {
            dom.startButton.addEventListener('click', trigger, { once: true });
        } else {
            trigger();
        }
    }
}
