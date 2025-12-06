// ============================================
// ADA ACCESSIBILITY WIDGET - SCRIPT
// script.js - Complete JavaScript File
// ============================================

(function() {
    'use strict';
    
    console.log('🔧 ADA Accessibility Widget Pro v2.0 - Initializing...');
    
    // Configuration
    const CONFIG = {
        storageKey: 'adaWidgetSettings',
        version: '2.0.0',
        features: {
            zoom: { min: 100, max: 300, step: 10 },
            textSize: { min: 80, max: 200, step: 10 },
            lineHeight: { min: 100, max: 250, step: 10 }
        },
        defaultState: {
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
        }
    };
    
    // State management
    let state = { ...CONFIG.defaultState };
    let speechSynthesis = null;
    let currentUtterance = null;
    let isSpeaking = false;
    let isPaused = false;
    
    // DOM Elements (will be set later)
    let elements = {};
    
    // ============================================
    // CORE FUNCTIONS
    // ============================================
    
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only load valid properties
                Object.keys(state).forEach(key => {
                    if (parsed[key] !== undefined) {
                        state[key] = parsed[key];
                    }
                });
                console.log('✅ Loaded saved settings');
            }
        } catch (error) {
            console.warn('⚠️ Could not load saved settings:', error);
        }
    }
    
    function saveState() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
            console.log('💾 Settings saved');
        } catch (error) {
            console.warn('⚠️ Could not save settings:', error);
        }
    }
    
    function applyState() {
        // Apply zoom
        if (elements.zoomSlider && elements.zoomValue) {
            elements.zoomSlider.value = state.zoom;
            elements.zoomValue.textContent = state.zoom + '%';
            document.body.style.zoom = state.zoom / 100;
        }
        
        // Apply text size
        if (elements.textSlider) {
            elements.textSlider.value = state.textSize;
            document.documentElement.style.fontSize = state.textSize + '%';
        }
        
        // Apply line height
        if (elements.lineSlider) {
            elements.lineSlider.value = state.lineHeight;
            document.body.style.lineHeight = (state.lineHeight / 100);
        }
        
        // Apply toggle states
        document.body.classList.toggle('ada-high-contrast', state.highContrast);
        document.body.classList.toggle('ada-grayscale', state.grayscale);
        document.body.classList.toggle('ada-invert', state.invert);
        document.body.classList.toggle('ada-highlight-links', state.highlightLinks);
        document.body.classList.toggle('ada-readable-font', state.readableFont);
        document.body.classList.toggle('ada-text-spacing', state.textSpacing);
        document.body.classList.toggle('ada-hide-images', state.hideImages);
        
        // Reading guide
        if (elements.guide) {
            elements.guide.classList.toggle('active', state.readingGuide);
        }
        
        // Read aloud controls
        if (elements.readStart && elements.readPause && elements.readStop) {
            const isEnabled = state.readAloud;
            elements.readStart.disabled = !isEnabled;
            elements.readPause.disabled = !isEnabled;
            elements.readStop.disabled = !isEnabled;
            
            if (!isEnabled) {
                stopSpeech();
            }
        }
        
        // Update toggle buttons
        if (elements.toggles) {
            elements.toggles.forEach(toggle => {
                const feature = toggle.dataset.feature;
                if (feature) {
                    const key = feature.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    const isActive = state[key] || false;
                    toggle.classList.toggle('active', isActive);
                    toggle.setAttribute('aria-checked', isActive);
                }
            });
        }
    }
    
    // ============================================
    // PANEL CONTROLS
    // ============================================
    
    function openPanel() {
        if (elements.panel) {
            elements.panel.classList.add('active');
            elements.button.setAttribute('aria-expanded', 'true');
            if (elements.closeBtn) {
                setTimeout(() => elements.closeBtn.focus(), 100);
            }
        }
    }
    
    function closePanel() {
        if (elements.panel) {
            elements.panel.classList.remove('active');
            elements.button.setAttribute('aria-expanded', 'false');
            elements.button.focus();
        }
    }
    
    function togglePanel() {
        if (elements.panel.classList.contains('active')) {
            closePanel();
        } else {
            openPanel();
        }
    }
    
    // ============================================
    // RESET FUNCTION
    // ============================================
    
    function resetAll() {
        if (confirm('Reset all accessibility settings to default?')) {
            state = { ...CONFIG.defaultState };
            applyState();
            saveState();
            stopSpeech();
            showNotification('All settings have been reset');
        }
    }
    
    // ============================================
    // READ ALOUD FUNCTIONS
    // ============================================
    
    function startSpeech() {
        if (!state.readAloud) return;
        
        if (isSpeaking && !isPaused) return;
        
        if (isPaused && currentUtterance) {
            speechSynthesis.resume();
            isPaused = false;
            showNotification('Resuming speech');
            return;
        }
        
        // Get text content
        const bodyText = document.body.innerText || '';
        const cleanText = bodyText
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s.,!?;:]/g, '')
            .trim()
            .substring(0, 5000); // Limit length
        
        if (!cleanText) {
            showNotification('No readable text found');
            return;
        }
        
        // Create utterance
        currentUtterance = new SpeechSynthesisUtterance(cleanText);
        currentUtterance.rate = 0.9;
        currentUtterance.pitch = 1;
        currentUtterance.volume = 1;
        
        currentUtterance.onend = function() {
            isSpeaking = false;
            isPaused = false;
            currentUtterance = null;
        };
        
        currentUtterance.onerror = function() {
            isSpeaking = false;
            isPaused = false;
            currentUtterance = null;
            showNotification('Speech error occurred');
        };
        
        speechSynthesis.speak(currentUtterance);
        isSpeaking = true;
        isPaused = false;
        showNotification('Reading page content');
    }
    
    function pauseSpeech() {
        if (isSpeaking && !isPaused) {
            speechSynthesis.pause();
            isPaused = true;
            showNotification('Speech paused');
        }
    }
    
    function stopSpeech() {
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
        isSpeaking = false;
        isPaused = false;
        currentUtterance = null;
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0066cc;
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Add CSS animations if not already present
        if (!document.querySelector('#ada-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ada-notification-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    function setupEventListeners() {
        // Button events
        if (elements.button) {
            elements.button.addEventListener('click', togglePanel);
        }
        
        // Close button
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', closePanel);
        }
        
        // Reset button
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', resetAll);
        }
        
        // Sliders
        if (elements.zoomSlider) {
            elements.zoomSlider.addEventListener('input', function(e) {
                state.zoom = parseInt(e.target.value);
                elements.zoomValue.textContent = state.zoom + '%';
                document.body.style.zoom = state.zoom / 100;
                saveState();
            });
        }
        
        if (elements.textSlider) {
            elements.textSlider.addEventListener('input', function(e) {
                state.textSize = parseInt(e.target.value);
                document.documentElement.style.fontSize = state.textSize + '%';
                saveState();
            });
        }
        
        if (elements.lineSlider) {
            elements.lineSlider.addEventListener('input', function(e) {
                state.lineHeight = parseInt(e.target.value);
                document.body.style.lineHeight = (state.lineHeight / 100);
                saveState();
            });
        }
        
        // Toggle buttons
        if (elements.toggles) {
            elements.toggles.forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const feature = this.dataset.feature;
                    if (!feature) return;
                    
                    const key = feature.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    state[key] = !state[key];
                    
                    // Special handling for read aloud
                    if (key === 'readAloud' && !state[key]) {
                        stopSpeech();
                    }
                    
                    applyState();
                    saveState();
                    
                    // Show feedback for toggles
                    const label = this.closest('.ada-control')?.querySelector('.ada-label')?.textContent || 'Setting';
                    showNotification(`${label}: ${state[key] ? 'ON' : 'OFF'}`);
                });
                
                // Keyboard support
                toggle.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
        }
        
        // Read aloud buttons
        if (elements.readStart) {
            elements.readStart.addEventListener('click', startSpeech);
        }
        
        if (elements.readPause) {
            elements.readPause.addEventListener('click', pauseSpeech);
        }
        
        if (elements.readStop) {
            elements.readStop.addEventListener('click', stopSpeech);
        }
        
        // Reading guide mouse movement
        document.addEventListener('mousemove', function(e) {
            if (state.readingGuide && elements.guide) {
                elements.guide.style.top = e.clientY + 'px';
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Escape closes panel
            if (e.key === 'Escape' && elements.panel?.classList.contains('active')) {
                closePanel();
            }
            
            // Ctrl+Alt+A opens panel
            if (e.ctrlKey && e.altKey && e.key === 'a') {
                e.preventDefault();
                togglePanel();
            }
            
            // Ctrl+Alt+R resets
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                e.preventDefault();
                resetAll();
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (elements.panel?.classList.contains('active') &&
                !elements.panel.contains(e.target) &&
                e.target !== elements.button) {
                closePanel();
            }
        });
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function initialize() {
        console.log('🚀 Starting ADA Widget initialization...');
        
        // Check for SpeechSynthesis support
        speechSynthesis = window.speechSynthesis;
        
        // Gather all elements
        elements = {
            button: document.querySelector('.ada-widget-btn'),
            panel: document.querySelector('.ada-widget-panel'),
            closeBtn: document.querySelector('.ada-close'),
            resetBtn: document.querySelector('.ada-reset'),
            zoomSlider: document.getElementById('adaZoom'),
            zoomValue: document.getElementById('zoomValue'),
            textSlider: document.getElementById('adaTextSize'),
            lineSlider: document.getElementById('adaLineHeight'),
            toggles: document.querySelectorAll('.ada-toggle'),
            readStart: document.getElementById('readStart'),
            readPause: document.getElementById('readPause'),
            readStop: document.getElementById('readStop'),
            guide: document.querySelector('.ada-reading-guide')
        };
        
        // Validate elements
        let missingElements = [];
        Object.entries(elements).forEach(([key, element]) => {
            if (!element && key !== 'toggles' && key !== 'guide') {
                missingElements.push(key);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Missing elements:', missingElements);
        }
        
        // Load and apply saved state
        loadState();
        applyState();
        
        // Set initial ARIA attributes
        if (elements.button) {
            elements.button.setAttribute('aria-expanded', 'false');
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Add version info
        console.log(`✅ ADA Widget v${CONFIG.version} initialized successfully`);
        
        // Show welcome message (first time only)
        const hasVisited = sessionStorage.getItem('adaWidgetWelcome');
        if (!hasVisited) {
            setTimeout(() => {
                showNotification('Accessibility widget loaded - Click the blue button to customize');
                sessionStorage.setItem('adaWidgetWelcome', 'true');
            }, 1000);
        }
    }
    
    // ============================================
    // PUBLIC API (Optional)
    // ============================================
    
    window.ADAWidget = {
        version: CONFIG.version,
        open: openPanel,
        close: closePanel,
        reset: resetAll,
        getState: () => ({ ...state }),
        setState: (newState) => {
            Object.assign(state, newState);
            applyState();
            saveState();
        }
    };
    
    // ============================================
    // START WHEN READY
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();