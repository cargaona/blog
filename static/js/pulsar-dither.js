(function() {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.id = 'pulsar-canvas';
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl', { 
        alpha: true, 
        antialias: false,
        preserveDrawingBuffer: false 
    });

    if (!gl) {
        console.log('WebGL not supported, skipping background');
        canvas.remove();
        return;
    }

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform int u_dark;

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                               -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        // Layered noise for soft blobby shapes
        float fbm(vec2 p, float time) {
            float value = 0.0;
            float amplitude = 0.6;
            float frequency = 1.0;
            
            // Add time-based morphing to each layer
            for (int i = 0; i < 5; i++) {
                float t = time * (0.3 + float(i) * 0.1);
                vec2 offset = vec2(sin(t * 0.9), cos(t * 1.1)) * 0.7;
                value += amplitude * snoise(p * frequency + offset);
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            return value;
        }

        // Bayer 8x8 dither for smoother gradients
        float dither8x8(vec2 pos) {
            int x = int(mod(pos.x, 8.0));
            int y = int(mod(pos.y, 8.0));
            int index = x + y * 8;
            
            // Bayer 8x8 matrix values (normalized)
            float v;
            if (index == 0) v = 0.0; else if (index == 1) v = 32.0;
            else if (index == 2) v = 8.0; else if (index == 3) v = 40.0;
            else if (index == 4) v = 2.0; else if (index == 5) v = 34.0;
            else if (index == 6) v = 10.0; else if (index == 7) v = 42.0;
            else if (index == 8) v = 48.0; else if (index == 9) v = 16.0;
            else if (index == 10) v = 56.0; else if (index == 11) v = 24.0;
            else if (index == 12) v = 50.0; else if (index == 13) v = 18.0;
            else if (index == 14) v = 58.0; else if (index == 15) v = 26.0;
            else if (index == 16) v = 12.0; else if (index == 17) v = 44.0;
            else if (index == 18) v = 4.0; else if (index == 19) v = 36.0;
            else if (index == 20) v = 14.0; else if (index == 21) v = 46.0;
            else if (index == 22) v = 6.0; else if (index == 23) v = 38.0;
            else if (index == 24) v = 60.0; else if (index == 25) v = 28.0;
            else if (index == 26) v = 52.0; else if (index == 27) v = 20.0;
            else if (index == 28) v = 62.0; else if (index == 29) v = 30.0;
            else if (index == 30) v = 54.0; else if (index == 31) v = 22.0;
            else if (index == 32) v = 3.0; else if (index == 33) v = 35.0;
            else if (index == 34) v = 11.0; else if (index == 35) v = 43.0;
            else if (index == 36) v = 1.0; else if (index == 37) v = 33.0;
            else if (index == 38) v = 9.0; else if (index == 39) v = 41.0;
            else if (index == 40) v = 51.0; else if (index == 41) v = 19.0;
            else if (index == 42) v = 59.0; else if (index == 43) v = 27.0;
            else if (index == 44) v = 49.0; else if (index == 45) v = 17.0;
            else if (index == 46) v = 57.0; else if (index == 47) v = 25.0;
            else if (index == 48) v = 15.0; else if (index == 49) v = 47.0;
            else if (index == 50) v = 7.0; else if (index == 51) v = 39.0;
            else if (index == 52) v = 13.0; else if (index == 53) v = 45.0;
            else if (index == 54) v = 5.0; else if (index == 55) v = 37.0;
            else if (index == 56) v = 63.0; else if (index == 57) v = 31.0;
            else if (index == 58) v = 55.0; else if (index == 59) v = 23.0;
            else if (index == 60) v = 61.0; else if (index == 61) v = 29.0;
            else if (index == 62) v = 53.0; else v = 21.0;
            
            return v / 64.0;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            
            // Adjust aspect ratio
            float aspect = u_resolution.x / u_resolution.y;
            vec2 p = uv;
            p.x *= aspect;
            p *= 2.5; // Scale for blob size
            
            // Morphing time - a bit faster for more visible movement
            float time = u_time * 0.35;
            
            // Get noise value - creates soft blobby shapes
            float n = fbm(p, time);
            
            // Normalize to 0-1 range and create soft blobs
            n = n * 0.5 + 0.5;
            
            // Create soft gradient shapes
            float blob = smoothstep(0.3, 0.7, n);
            
            // Add some variation with second layer
            float n2 = fbm(p * 1.5 + 3.0, time * 0.8);
            n2 = n2 * 0.5 + 0.5;
            float blob2 = smoothstep(0.35, 0.65, n2);
            
            // Combine layers
            float combined = mix(blob, blob2, 0.4);
            
            // Dithering - creates the stippled gradient effect
            // Scale down coordinates for chunkier/larger dither dots
            float dither = dither8x8(gl_FragCoord.xy * 0.4);
            float dithered = combined > dither ? 1.0 : 0.0;
            
            // Colors
            float isDark = float(u_dark);
            vec3 fg = mix(vec3(0.15, 0.15, 0.18), vec3(0.9, 0.9, 0.95), isDark);
            
            // Output with more visible alpha
            float alpha = dithered * 0.22;
            
            gl_FragColor = vec4(fg * dithered, alpha);
        }
    `;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
        canvas.remove();
        return;
    }

    const program = createProgram(vertexShader, fragmentShader);
    if (!program) {
        canvas.remove();
        return;
    }

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const darkLocation = gl.getUniformLocation(program, 'u_dark');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]), gl.STATIC_DRAW);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';

    function getDarkMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 1;
        }
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const rgb = bodyBg.match(/\d+/g);
        if (rgb) {
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            return brightness < 128 ? 1 : 0;
        }
        return 0;
    }

    let darkMode = getDarkMode();
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        darkMode = e.matches ? 1 : 0;
    });

    let lastFrame = 0;
    const fpsInterval = 1000 / 20; // 20fps

    function render(timestamp) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const elapsed = timestamp - lastFrame;
        if (elapsed < fpsInterval) {
            requestAnimationFrame(render);
            return;
        }
        lastFrame = timestamp - (elapsed % fpsInterval);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, timestamp * 0.001);
        gl.uniform1i(darkLocation, darkMode);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();
