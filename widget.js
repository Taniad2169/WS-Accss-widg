(function() {
    'use strict';

    // Create the widget container if it does not exist
    if (!document.getElementById('ada-widget-container')) {
        const adaDiv = document.createElement('div');
        adaDiv.id = 'ada-widget-container';
        document.body.appendChild(adaDiv);
    }

    // All styles from your widget
    const styleContent = `
        #ada-widget-btn {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0066cc, #004499);
            color: white;
            border: 2px solid white;
            font-size: 22px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 999999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        }
        #ada-widget-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
        #ada-panel {
            position: fixed;
            bottom: 85px;
            right: 20px;
            width: 320px;
            max-height: 70vh;
            background: white;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 999998;
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        #ada-panel.active {
            display: flex;
            animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .ada-header {
            background: linear-gradient(135deg, #0066cc, #004499);
            color: white;
            padding: 15px;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .ada-close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }
        .ada-close-btn:hover { background: rgba(255, 255, 255, 0.2); }
        .ada-content { padding: 20px; overflow-y: auto; max-height: calc(70vh - 60px); }
        .ada-section { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .ada-section:last-child { border-bottom: none; }
        .ada-title {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ada-title::before {
            content: '';
            width: 4px;
            height: 14px;
            background: #0066cc;
            border-radius: 2px;
        }
        .ada-control {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
        }
        .ada-label { font-size: 13px; color: #444; flex: 1; }
        .ada-toggle {
            position: relative;
            width: 44px;
            height: 22px;
            background: #ccc;
            border-radius: 11px;
            cursor: pointer;
            transition: background 0.3s;
            flex-shrink: 0;
        }
        .ada-toggle.active { background: #0066cc; }
        .ada-toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .ada-toggle.active::after { transform: translateX(22px); }
        .ada-slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #ddd;
            outline: none;
            -webkit-appearance: none;
            margin: 8px 0;
            cursor: pointer;
        }
        .ada-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #0066cc;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .ada-range-labels {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
        .ada-action-btn {
            padding: 10px 15px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            transition: background 0.3s;
            flex: 1;
        }
        .ada-action-btn:hover { background: #004499; }
        .ada-action-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
        }
        .ada-btn-group {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        .ada-reset-btn {
            width: 100%;
            padding: 12px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
        }
        .ada-reset-btn:hover { background: #d32f2f; }
        .ada-compliance {
            background: #f8f9fa;
            border-left: 3px solid #0066cc;
            padding: 10px 12px;
            margin: 15px 0;
            border-radius: 0 5px 5px 0;
            font-size: 12px;
            color: #555;
            line-height: 1.5;
        }
        .ada-compliance strong { color: #0066cc; }
        .ada-reading-guide {
            position: fixed;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(255, 0, 0, 0.7);
            pointer-events: none;
            z-index: 999997;
            display: none;
        }
        .ada-reading-guide.active { display: block; }
        body.ada-high-contrast {
            background-color: #000000;
            color: #ffffff;
        }
        body.ada-high-contrast *:not(#ada-widget-btn):not(#ada-panel):not(#ada-panel *):not(.ada-reading-guide) {
            background-color: #000000;
            color: #ffffff;
            border-color: #ffffff;
        }
        body.ada-high-contrast a:not(.ada-action-btn):not(.ada-reset-btn) {
            color: #ffff00;
            text-decoration: underline;
            background-color: transparent;
        }
        body.ada-grayscale *:not(#ada-widget-btn):not(#ada-panel):not(#ada-panel *) { filter: grayscale(100%); }
        body.ada-invert *:not(#ada-widget-btn):not(#ada-panel):not(#ada-panel *) { filter: invert(1) hue-rotate(180deg); }
        body.ada-highlight-links a:not(.ada-action-btn):not(.ada-reset-btn) {
            background-color: #ffff00;
            color: #000000;
            text-decoration: underline;
            padding: 2px 4px;
            border-radius: 2px;
        }
        body.ada-readable-font,
        body.ada-readable-font * {
            font-family: Arial, Helvetica, sans-serif;
        }
        body.ada-text-spacing p,
        body.ada-text-spacing li,
        body.ada-text-spacing div,
        body.ada-text-spacing span {
            letter-spacing: 0.12em;
            word-spacing: 0.16em;
            line-height: 1.8;
        }
        body.ada-hide-images img,
        body.ada-hide-images picture,
        body.ada-hide-images video {
            visibility: hidden;
            opacity: 0;
            height: 0;
        }
        @media (max-width: 768px) {
            #ada-panel {
                right: 10px;
                left: 10px;
                width: auto;
                bottom: 75px;
            }
            #ada-widget-btn {
                width: 45px;
                height: 45px;
                font-size: 20px;
                right: 15px;
                bottom: 20px;
            }
        }
    `;

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styleContent;
    document.head.appendChild(styleEl);

    // Widget HTML
    const html = `
        <button id="ada-widget-btn" aria-label="Accessibility Menu">♿</button>
        <div id="ada-panel">
            <div class="ada-header">
                <span>Accessibility Settings</span>
                <button class="ada-close-btn">×</button>
            </div>
            <div class="ada-content">
                <div class="ada-compliance">
                    <strong>ADA Compliant:</strong> WCAG 2.1 AA standards
                </div>
                <div class="ada-section">
                    <div class="ada-title">Page Zoom</div>
                    <input type="range" class="ada-slider" id="zoom-slider" min="100" max="300" value="100" step="10">
                    <div class="ada-range-labels">
                        <span>100%</span>
                        <span id="zoom-value">100%</span>
                        <span>300%</span>
                    </div>
                </div>
                <div class="ada-section">
                    <div class="ada-title">Text Adjustments</div>
                    <div class="ada-control">
                        <span class="ada-label">Text Size</span>
                        <input type="range" class="ada-slider" id="text-slider" min="80" max="200" value="100" step="10">
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Line Height</span>
                        <input type="range" class="ada-slider" id="line-slider" min="100" max="250" value="150" step="10">
                    </div>
                </div>
                <div class="ada-section">
                    <div class="ada-title">Visual</div>
                    <div class="ada-control">
                        <span class="ada-label">High Contrast</span>
                        <div class="ada-toggle" data-feature="high-contrast"></div>
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Grayscale</span>
                        <div class="ada-toggle" data-feature="grayscale"></div>
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Invert Colors</span>
                        <div class="ada-toggle" data-feature="invert"></div>
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Highlight Links</span>
                        <div class="ada-toggle" data-feature="highlight-links"></div>
                    </div>
                </div>
                <div class="ada-section">
                    <div class="ada-title">Content</div>
                    <div class="ada-control">
                        <span class="ada-label">Readable Font</span>
                        <div class="ada-toggle" data-feature="readable-font"></div>
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Text Spacing</span>
                        <div class="ada-toggle" data-feature="text-spacing"></div>
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Hide Images</span>
                        <div class="ada-toggle" data-feature="hide-images"></div>
                    </div>
                    <div class="ada-control">
                        <span class="ada-label">Reading Guide</span>
                        <div class="ada-toggle" data-feature="reading-guide"></div>
                    </div>
                </div>
                <div class="ada-section">
                    <div class="ada-title">Read Aloud</div>
                    <div class="ada-control">
                        <span class="ada-label">Enable Speech</span>
                        <div class="ada-toggle" data-feature="read-aloud"></div>
                    </div>
                    <div class="ada-btn-group">
                        <button class="ada-action-btn" id="read-start" disabled>Start</button>
                        <button class="ada-action-btn" id="read-pause" disabled>Pause</button>
                        <button class="ada-action-btn" id="read-stop" disabled>Stop</button>
                    </div>
                </div>
                <button class="ada-reset-btn" id="reset-all">Reset All Settings</button>
            </div>
        </div>
        <div class="ada-reading-guide"></div>
    `;

    document.getElementById('ada-widget-container').innerHTML = html;

    // State
    const state = {
        zoom: 100,
        textSize: 100,
        lineHeight: 150,
        highContrast: false,
        grayscale: false,
        invert: false,
        highlightLinks: false,
        readableFont: false,
        textSpacing: false,
        hideImages: false,
        readingGuide: false,
        readAloud: false
    };

    let speech = null;
    let isSpeaking = false;

    // Elements
    const btn = document.getElementById('ada-widget-btn');
    const panel = document.getElementById('ada-panel');
    const closeBtn = document.querySelector('.ada-close-btn');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    const textSlider = document.getElementById('text-slider');
    const lineSlider = document.getElementById('line-slider');
    const toggles = document.querySelectorAll('.ada-toggle');
    const readStart = document.getElementById('read-start');
    const readPause = document.getElementById('read-pause');
    const readStop = document.getElementById('read-stop');
    const resetBtn = document.getElementById('reset-all');
    const guide = document.querySelector('.ada-reading-guide');

    // Toggle panel
    btn.addEventListener('click', () => {
        panel.classList.toggle('active');
    });
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
    });

    // Zoom
    zoomSlider.addEventListener('input', (e) => {
        state.zoom = parseInt(e.target.value);
        zoomValue.textContent = state.zoom + '%';
        document.body.style.zoom = state.zoom / 100;
        saveState();
    });

    // Text size
    textSlider.addEventListener('input', (e) => {
        state.textSize = parseInt(e.target.value);
        document.documentElement.style.fontSize = state.textSize + '%';
        saveState();
    });

    // Line height
    lineSlider.addEventListener('input', (e) => {
        state.lineHeight = parseInt(e.target.value);
        document.body.style.lineHeight = state.lineHeight / 100;
        saveState();
    });

    // Toggles
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const feature = this.dataset.feature;
            const key = feature.replace(/-([a-z])/g, g => g[1].toUpperCase());
            state[key] = !state[key];
            this.classList.toggle('active', state[key]);
            applyState();
            saveState();
        });
    });

    function applyState() {
        document.body.classList.toggle('ada-high-contrast', state.highContrast);
        document.body.classList.toggle('ada-grayscale', state.grayscale);
        document.body.classList.toggle('ada-invert', state.invert);
        document.body.classList.toggle('ada-highlight-links', state.highlightLinks);
        document.body.classList.toggle('ada-readable-font', state.readableFont);
        document.body.classList.toggle('ada-text-spacing', state.textSpacing);
        document.body.classList.toggle('ada-hide-images', state.hideImages);
        guide.classList.toggle('active', state.readingGuide);
        readStart.disabled = !state.readAloud;
        readPause.disabled = !state.readAloud;
        readStop.disabled = !state.readAloud;
        if (!state.readAloud) stopSpeech();
    }

    // Read aloud
    readStart.addEventListener('click', () => {
        if (!state.readAloud) return;
        const text = document.body.innerText.substring(0, 3000);
        speech = new SpeechSynthesisUtterance(text);
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
        isSpeaking = true;
    });
    readPause.addEventListener('click', () => {
        if (isSpeaking) window.speechSynthesis.pause();
    });
    readStop.addEventListener('click', stopSpeech);
    function stopSpeech() {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        speech = null;
    }

    // Reading guide
    document.addEventListener('mousemove', (e) => {
        if (state.readingGuide) {
            guide.style.top = e.clientY + 'px';
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        if (confirm('Reset all settings?')) {
            state.zoom = 100;
            state.textSize = 100;
            state.lineHeight = 150;
            state.highContrast = false;
            state.grayscale = false;
            state.invert = false;
            state.highlightLinks = false;
            state.readableFont = false;
            state.textSpacing = false;
            state.hideImages = false;
            state.readingGuide = false;
            state.readAloud = false;

            document.body.style.zoom = 1;
            document.documentElement.style.fontSize = '100%';
            document.body.style.lineHeight = 1.5;
            zoomSlider.value = 100;
            zoomValue.textContent = '100%';
            textSlider.value = 100;
            lineSlider.value = 150;
            toggles.forEach(t => t.classList.remove('active'));
            applyState();
            saveState();
            stopSpeech();
        }
    });

    // Storage
    function saveState() {
        try {
            localStorage.setItem('adaWidget', JSON.stringify(state));
        } catch (e) { }
    }
    function loadState() {
        try {
            const saved = localStorage.getItem('adaWidget');
            if (saved) {
                Object.assign(state, JSON.parse(saved));
                document.body.style.zoom = state.zoom / 100;
                zoomSlider.value = state.zoom;
                zoomValue.textContent = state.zoom + '%';
                document.documentElement.style.fontSize = state.textSize + '%';
                textSlider.value = state.textSize;
                document.body.style.lineHeight = state.lineHeight / 100;
                lineSlider.value = state.lineHeight;
                toggles.forEach(toggle => {
                    const feature = toggle.dataset.feature;
                    const key = feature.replace(/-([a-z])/g, g => g[1].toUpperCase());
                    toggle.classList.toggle('active', state[key]);
                });
                applyState();
            }
        } catch (e) { }
    }
    loadState();
    console.log('✅ ADA Widget Loaded');
})();
