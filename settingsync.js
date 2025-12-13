/**
 * settingsync.js
 * * Manages security features and dynamically creates the required overlay element and CSS.
 * * This script should be loaded via <script src="settingsync.js"></script>
 */

(function() {
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const REDIRECT_DELAY = 65; // Delay for redirect on tab loss (in milliseconds)
    const REDIRECT_URL = "https://www.google.com"; // <-- CHANGE THIS URL

    let overlay = null;
    let timeoutHandle = null;

    // === SETUP FUNCTIONS (Runs first to create necessary DOM elements and styles) ===

    function createOverlayElement() {
        // Create the overlay div if it doesn't exist
        overlay = document.getElementById('overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'overlay';
            overlay.innerHTML = `
                <div style="text-align: center;">
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    function injectOverlayCSS() {
        const css = `
            #overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: white; /* You can change this color */
                z-index: 99999; /* Ensure it covers everything */
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: black;
                font-family: sans-serif;
            }
            #overlay h1 {
                font-size: 2em;
                margin-bottom: 0.5em;
            }
        `;
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // === CORE SECURITY LOGIC ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return; // Should not happen after setup, but safe check

        if (showContent) {
            overlay.style.display = 'none';
        } else {
            overlay.style.display = 'flex'; 
        }
    }

    function redirect() {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        window.location.replace(REDIRECT_URL); 
    }

    // === EVENT LISTENERS ===

    function initializeListeners() {
        // 1. Tab Close Prevention Listener (onbeforeunload)
        window.addEventListener('beforeunload', function(e) {
            const tabProtectionEnabled = localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true';

            if (tabProtectionEnabled) { 
                e.preventDefault(); 
                e.returnValue = '';
            }
        });

        // 2. Redirect/Overlay Listener (visibilitychange)
        document.addEventListener('visibilitychange', () => {
            // Default ON if not set
            const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true' || localStorage.getItem(STORAGE_KEY_REDIRECT) === null;

            if (document.visibilityState === 'hidden') {
                if (redirectEnabled) {
                    timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
                } else {
                    toggleContentVisibility(false); // Show overlay
                }
            } else {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
            }
        });

        // 3. Additional listener to clear redirect if focus is regained
        window.addEventListener('focus', function () {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        });
        
        // 4. Keypress Listener for 'E' and 'Space'
        document.addEventListener('keydown', (event) => {
            if (overlay && overlay.style.display === 'flex') {
                
                // 'E' key: Dismiss the cover (show content)
                if (event.key.toUpperCase() === 'E') {
                    toggleContentVisibility(true); // Hides the overlay
                    event.preventDefault();
                }
                
                // 'Space' key: Execute immediate redirect
                
                if (event.key === ' ') {
                            if(tabProtectionEnabled){
            tabProtectionEnabled = false
          }
                    redirect(); // Executes immediate redirect
                    event.preventDefault();
                }
            }
        });
    }

    // === ENTRY POINT ===
    // We wait for the DOM to be fully loaded before injecting CSS and elements.
    document.addEventListener('DOMContentLoaded', () => {
        // Run setup functions
        injectOverlayCSS();
        createOverlayElement();
        
        // Start monitoring security events
        initializeListeners();

        console.log('[SETTINGSYNC] Security script is fully active and monitoring.');
    });
    
})();
