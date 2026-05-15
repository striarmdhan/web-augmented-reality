// CHROMAKEY Shaders - Ultra Clean
AFRAME.registerShader('chromakey-advanced', {
    schema: { src: {type: 'map'} },
    init: function(data) {
        const videoTexture = new THREE.VideoTexture(data.src);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.generateMipmaps = false;
        videoTexture.wrapS = THREE.ClampToEdgeWrapping;
        videoTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.material = new THREE.ShaderMaterial({
            uniforms: { tex: {value: videoTexture} },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tex;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tex, vUv);
                    float greenDominance = color.g - max(color.r, color.b);
                    float isGreen = 0.0;
                    if (color.g > 0.4 && color.g > color.r * 1.2 && color.g > color.b * 1.2) isGreen = 1.0;
                    if (color.g > 0.6 && greenDominance > 0.2) isGreen = 1.0;
                    if (greenDominance > 0.15 && color.g > 0.35) isGreen = 1.0;
                    
                    float alpha = 1.0 - isGreen;
                    if (greenDominance > 0.1 && greenDominance < 0.25 && color.g > 0.3) {
                        float smoothFactor = smoothstep(0.1, 0.25, greenDominance);
                        alpha = 1.0 - smoothFactor;
                    }
                    
                    vec3 finalColor = color.rgb;
                    if (alpha > 0.1 && alpha < 0.9 && greenDominance > 0.05) {
                        float despillStrength = (1.0 - alpha) * 0.7;
                        finalColor.g = mix(finalColor.g, (finalColor.r + finalColor.b) * 0.5, despillStrength);
                    }
                    if (alpha > 0.5 && greenDominance > 0.05) finalColor.g *= 0.9;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }
});

AFRAME.registerShader('chromakey-gentle', {
    schema: { src: {type: 'map'} },
    init: function(data) {
        const videoTexture = new THREE.VideoTexture(data.src);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.generateMipmaps = false;
        videoTexture.wrapS = THREE.ClampToEdgeWrapping;
        videoTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.material = new THREE.ShaderMaterial({
            uniforms: { tex: {value: videoTexture} },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tex;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tex, vUv);
                    float greenDominance = color.g - max(color.r, color.b);
                    float isGreen = 0.0;
                    if (color.g > 0.5 && color.g > color.r * 1.4 && color.g > color.b * 1.4) isGreen = 1.0;
                    if (color.g > 0.7 && greenDominance > 0.3) isGreen = 1.0;
                    if (greenDominance > 0.2 && color.g > 0.45) isGreen = 1.0;
                    
                    float alpha = 1.0 - isGreen;
                    if (greenDominance > 0.15 && greenDominance < 0.3 && color.g > 0.4) {
                        float smoothFactor = smoothstep(0.15, 0.3, greenDominance);
                        alpha = 1.0 - smoothFactor;
                    }
                    
                    vec3 finalColor = color.rgb;
                    if (alpha > 0.2 && alpha < 0.9 && greenDominance > 0.1) {
                        float despillStrength = (1.0 - alpha) * 0.5;
                        finalColor.g = mix(finalColor.g, (finalColor.r + finalColor.b) * 0.5, despillStrength);
                    }
                    if (alpha > 0.6 && greenDominance > 0.08) finalColor.g *= 0.95;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }
});

AFRAME.registerShader('chromakey-bubble', {
    schema: { src: {type: 'map'} },
    init: function(data) {
        const videoTexture = new THREE.VideoTexture(data.src);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.generateMipmaps = false;
        videoTexture.wrapS = THREE.ClampToEdgeWrapping;
        videoTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                tex: {value: videoTexture},
                brightness: {value: 1.3}
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tex;
                uniform float brightness;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tex, vUv);
                    float greenDominance = color.g - max(color.r, color.b);
                    float isGreen = 0.0;
                    if (color.g > 0.6 && color.g > color.r * 1.5 && color.g > color.b * 1.5) isGreen = 1.0;
                    if (color.g > 0.75 && greenDominance > 0.35) isGreen = 1.0;
                    
                    float alpha = 1.0 - isGreen;
                    if (greenDominance > 0.25 && greenDominance < 0.4 && color.g > 0.5) {
                        float smoothFactor = smoothstep(0.25, 0.4, greenDominance);
                        alpha = 1.0 - smoothFactor;
                    }
                    
                    vec3 finalColor = color.rgb;
                    if (alpha > 0.3 && alpha < 0.85 && greenDominance > 0.15) {
                        float despillStrength = (1.0 - alpha) * 0.3;
                        finalColor.g = mix(finalColor.g, (finalColor.r + finalColor.b) * 0.5, despillStrength);
                    }
                    if (alpha > 0.1) {
                        finalColor *= brightness;
                        finalColor = clamp(finalColor, 0.0, 1.0);
                    }
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
    }
});

// CHROMAKEY Shader - Khusus Blue Screen
AFRAME.registerShader('chromakey-blue', {
    schema: { src: {type: 'map'} },
    init: function(data) {
        const videoTexture = new THREE.VideoTexture(data.src);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.generateMipmaps = false;
        videoTexture.wrapS = THREE.ClampToEdgeWrapping;
        videoTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.material = new THREE.ShaderMaterial({
            uniforms: { tex: {value: videoTexture} },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tex;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tex, vUv);
                    
                    // Hitung dominasi warna BIRU (Blue Dominance)
                    float blueDominance = color.b - max(color.r, color.g);
                    float isBlue = 0.0;
                    
                    // Deteksi warna biru
                    if (color.b > 0.4 && color.b > color.r * 1.2 && color.b > color.g * 1.2) isBlue = 1.0;
                    if (color.b > 0.6 && blueDominance > 0.2) isBlue = 1.0;
                    if (blueDominance > 0.15 && color.b > 0.35) isBlue = 1.0;
                    
                    float alpha = 1.0 - isBlue;
                    
                    // Transisi halus untuk area semi-transparan
                    if (blueDominance > 0.1 && blueDominance < 0.25 && color.b > 0.3) {
                        float smoothFactor = smoothstep(0.1, 0.25, blueDominance);
                        alpha = 1.0 - smoothFactor;
                    }
                    
                    // Despill (Menghilangkan pantulan cahaya biru di tepian objek)
                    vec3 finalColor = color.rgb;
                    if (alpha > 0.1 && alpha < 0.9 && blueDominance > 0.05) {
                        float despillStrength = (1.0 - alpha) * 0.7;
                        // Campurkan warna biru dengan rata-rata merah & hijau agar menjadi warna netral
                        finalColor.b = mix(finalColor.b, (finalColor.r + finalColor.g) * 0.5, despillStrength);
                    }
                    
                    if (alpha > 0.5 && blueDominance > 0.05) finalColor.b *= 0.9;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }
});

AFRAME.registerComponent('smooth-tracking', {
    schema: { smoothing: {type: 'number', default: 0.7} },
    init: function() {
        this.targetPosition = new THREE.Vector3();
        this.targetRotation = new THREE.Euler();
    },
    tick: function() {
        const obj = this.el.object3D;
        this.targetPosition.lerp(obj.position, 1 - this.data.smoothing);
        obj.position.copy(this.targetPosition);
        this.targetRotation.x += (obj.rotation.x - this.targetRotation.x) * (1 - this.data.smoothing);
        this.targetRotation.y += (obj.rotation.y - this.targetRotation.y) * (1 - this.data.smoothing);
        this.targetRotation.z += (obj.rotation.z - this.targetRotation.z) * (1 - this.data.smoothing);
        obj.rotation.copy(this.targetRotation);
    }
});

// Setup Smooth Tracking secara global
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 1; i <= 7; i++) {
        const target = document.getElementById(`target${i}`);
        if (target) target.setAttribute('smooth-tracking', 'smoothing: 0.7');
    }
});