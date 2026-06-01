export const state = {
    videosLoaded: 0,
    videosBuffered: 0,
    allReady: false,
    allFullyBuffered: false,
    audioEnabled: false,
    currentPart: 0,
    isPlaying: false,
    isTransitioning: false,
    part1Finished: false,
    part2Finished: false,
    part3Finished: false,
    part3Paused: false,
    part4Finished: false,
    part5Finished: false,
    part6Finished: false,
    part7Finished: false,
    lastScannedMarker: 0,
    isMarkerLocked: false,
    lockedMarker: null,
    activeMarkerDetection: null,
    markerIgnoreUntil: 0,
    MARKER_IGNORE_DURATION: 1000
};

export const dom = {
    statusBar: document.getElementById('statusBar'),
    resetButton: document.getElementById('resetButton'),
    arScene: document.getElementById('arScene'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingProgress: document.getElementById('loadingProgress'),
    loadingMessage: document.getElementById('loadingMessage'),
    loadingDetail: document.getElementById('loadingDetail'),
    startButton: document.getElementById('startButton'),
    
    containerPart1: document.querySelector('#video-container-part1'),
    containerPart2: document.querySelector('#video-container-part2'),
    containerPart3: document.querySelector('#video-container-part3'),
    containerPart4: document.querySelector('#video-container-part4'),
    containerPart5: document.querySelector('#video-container-part5'),
    containerPart6: document.querySelector('#video-container-part6'),
    containerPart7: document.querySelector('#video-container-part7'),
    
    target1: document.getElementById('target1'),
    target2: document.getElementById('target2'),
    target3: document.getElementById('target3'),
    target4: document.getElementById('target4'),
    target5: document.getElementById('target5'),
    target6: document.getElementById('target6'),
    target7: document.getElementById('target7'),
    
    soundV1: document.getElementById('sound-v1'),
    soundV2: document.getElementById('sound-v2'),
    soundV3: document.getElementById('sound-v3'),
    soundV4: document.getElementById('sound-v4'),
    soundV5: document.getElementById('sound-v5'),
    soundV6: document.getElementById('sound-v6'),
    soundV7: document.getElementById('sound-v7')
};

export const videos = {
    part1: [
        document.getElementById('vid-laut'), document.getElementById('vid-kapal'),
        document.getElementById('vid-batu'), document.getElementById('vid-gelembung'),
        document.getElementById('vid-mascot')
    ],
    part2: [
        document.getElementById('vid-batu2'), document.getElementById('vid-gelembung2'),
        document.getElementById('vid-mascot2'), document.getElementById('vid-gosok'),
        document.getElementById('vid-orang')
    ],
    part3: [
        document.getElementById('vid-kapal3'), document.getElementById('vid-mascot3'),
        document.getElementById('vid-sikat')
    ],
    part4: [
        document.getElementById('vid-kapal4'), document.getElementById('vid-mascot4'),
        document.getElementById('vid-sikat4')
    ],
    part5: [
        document.getElementById('vid-orang5'), document.getElementById('vid-tangan')
    ],
    part6: [
        document.getElementById('vid-kapal6'), document.getElementById('vid-mascot2-6'),
        document.getElementById('vid-mascot6')
    ],
    part7: [
        document.getElementById('vid-coral7'), document.getElementById('vid-laut7'),
        document.getElementById('vid-mascot7'), document.getElementById('vid-orang7')
    ]
};

export const allVideos = [
    ...videos.part1, ...videos.part2, ...videos.part3, 
    ...videos.part4, ...videos.part5, ...videos.part6, ...videos.part7
];