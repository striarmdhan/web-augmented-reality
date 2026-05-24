import { dom } from './state.js';

export function fadeOutContainer(container, duration, callback) {
    container.setAttribute('animation', {
        property: 'scale',
        from: '1 1 1',
        to: '0.8 0.8 0.8',
        dur: duration,
        easing: 'easeInQuad'
    });
    
    container.setAttribute('animation__opacity', {
        property: 'opacity',
        from: 1,
        to: 0,
        dur: duration,
        easing: 'easeInQuad'
    });
    
    setTimeout(() => {
        container.setAttribute('visible', false);
        container.removeAttribute('animation');
        container.removeAttribute('animation__opacity');
        if (callback) callback();
    }, duration);
}

export function fadeInContainer(container, duration) {
    container.setAttribute('visible', true);
    container.setAttribute('scale', '0.8 0.8 0.8');
    container.setAttribute('opacity', 0);
    
    container.setAttribute('animation', {
        property: 'scale',
        from: '0.8 0.8 0.8',
        to: '1 1 1',
        dur: duration,
        easing: 'easeOutQuad'
    });
    
    container.setAttribute('animation__opacity', {
        property: 'opacity',
        from: 0,
        to: 1,
        dur: duration,
        easing: 'easeOutQuad'
    });
    
    setTimeout(() => {
        container.removeAttribute('animation');
        container.removeAttribute('animation__opacity');
    }, duration);
}

export function fadeAudioIn(audio, duration) {
    const steps = 30;
    const stepDuration = duration / steps;
    const volumeStep = 1.0 / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(currentStep * volumeStep, 1.0);
        
        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            audio.volume = 1.0;
        }
    }, stepDuration);
}

export function fadeAudioOut(audio, duration) {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = 1.0 / steps;
    let currentStep = steps;
    
    const fadeInterval = setInterval(() => {
        currentStep--;
        audio.volume = Math.max(currentStep * volumeStep, 0);
        
        if (currentStep <= 0) {
            clearInterval(fadeInterval);
            audio.volume = 0;
            audio.pause();
        }
    }, stepDuration);
}

export function hideAllContainersExcept(exceptContainer) {
    const allContainers = [
        dom.containerPart1, dom.containerPart2, dom.containerPart3,
        dom.containerPart4, dom.containerPart5, dom.containerPart6, dom.containerPart7
    ];
    allContainers.forEach(container => {
        if (container !== exceptContainer) {
            container.setAttribute('visible', false);
        }
    });
}

// Helper: cek apakah container A-Frame sedang terlihat (visible attribute = true)
export function isContainerVisible(container) {
    if (!container) return false;
    const v = container.getAttribute('visible');
    return v === true || v === 'true';
}