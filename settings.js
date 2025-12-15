// === CONFIGURATION CONSTANTS (Global Scope) ===
const FADE_DURATION_MS = 300; // 300 milliseconds
const FADE_DURATION_CSS = `${FADE_DURATION_MS / 1000}s`; // Creates "0.3s" for CSS

// --- NEW GLOBAL FLAG ---
let manualExitIntent = false;


// === IMMEDIATE EXECUTION: THEME ATTRIBUTE LOAD & CSS INJECTION ===
(function initializeSetup() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const css = `
        /* ... (CSS remains unchanged) ... */
        #offscreen-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: white; z-index: 99999; display: none;
            flex-direction: column; justify-content: center; align-items: center;
            color: black; font-family: sans-serif; opacity: 1;
            transition: opacity ${FADE_DURATION_CSS} ease-in-out;
        }
        #offscreen-overlay.fade-out { opacity: 0 !important; }
        
        .switch-container.on .switch-thumb { transform: translateX(24px); }
        .switch-container.on #switch-icon-stats { display: none; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();


// === GLOBAL TOGGLE FUNCTIONS (Defined immediately for HTML onclick events to work) ===

window.toggleTabProtection = function() {
    // Current state is considered ON if it's NOT explicitly 'false'
    let tabProtectionEnabled = localStorage.getItem('tabProtectionState') !== 'false'; 
    tabProtectionEnabled = !tabProtectionEnabled; 
    localStorage.setItem('tabProtectionState', tabProtectionEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleRedirect = function() {
    // FIX 2: Correct the logic. Current state should ONLY be 'true' if the stored value is 'true'.
    let redirectEnabled = localStorage.getItem('redirectToggleState') === 'true'; 
    redirectEnabled = !redirectEnabled;
    localStorage.setItem('redirectToggleState', redirectEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.dispatchEvent(new Event('themeToggle'));
}

window.toggleStats = function() {
    const currentState = localStorage.getItem('statsToggleState') === 'true'; 
    const newState = !currentState;
    localStorage.setItem('statsToggleState', newState ? 'true' : 'false');
    document.dispatchEvent(new Event('statsToggle'));
    console.log(`[SETTINGSYNC] Show Stats toggled to: ${newState}`);
};

window.addEventListener('load', () => {

// === MAIN SETUP LOGIC (Runs 700ms after script load) ===
setTimeout(() => {
    
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const STORAGE_KEY_STATS = 'statsToggleState';
    const REDIRECT_DELAY = 65; 
    const REDIRECT_URL = "https://www.google.com";

    // === DOM ELEMENTS ===
    const toggleSwitch = document.getElementById('protection-toggle-switch'); 
    const switchIcon = document.getElementById('switch-icon-protection');    
    const statusText = document.getElementById('protection-status');         
    const redirectToggleBtn = document.getElementById('blur-toggle-switch'); 
    const redirectSwitchIcon = document.getElementById('switch-icon-redirect');
    let overlay = document.getElementById('offscreen-overlay');
    const themeSwitchContainer = document.getElementById('theme-toggle-switch');
    const themeIcon = document.getElementById('switch-icon-theme'); 
    const themeStatusSpan = document.getElementById('theme-status'); 
    const statsToggleContainer = document.getElementById('stats-toggle-switch');
    const statsIcon = document.getElementById('switch-icon-stats');
    const infoBtn = document.getElementById('info-btn'); 
    const modal = document.getElementById('performance-modal');
    const fpsValue = document.getElementById('fps-value');
    const pingValue = document.getElementById('ping-value');

    let timeoutHandle = null;

    // --- Create Overlay Element if it doesn't exist ---
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offscreen-overlay';
        overlay.innerHTML = `<div style="text-align: center;"><h1>Content Hidden</h1><p>Press **E** to dismiss (fades out)</p><p>Press **Space** to immediately redirect</p></div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    } else {
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    }
    
    function handleOverlayTransitionEnd(event) {
        if (event.propertyName === 'opacity' && overlay.classList.contains('fade-out')) {
            overlay.style.display = 'none';
            overlay.classList.remove('fade-out'); 
        }
    }


    // === UI UPDATE FUNCTIONS (Omitted for brevity, assumed correct) ===
    function updateProtectionUI(isEnabled) { 
        if (isEnabled) {
            const closepreventionwarning = 'closepreventionwarning'; 
            if (localStorage.getItem(closepreventionwarning) === null) {
                localStorage.setItem(closepreventionwarning, 'true');
            }
            if(toggleSwitch) toggleSwitch.classList.add('switch-on');
            if(switchIcon) switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
            if(switchIcon) switchIcon.classList.add('text-white');
            if(switchIcon) switchIcon.classList.remove('text-[#bdc3c7]');
            if(statusText) statusText.textContent = 'ACTIVE';
            if(statusText) statusText.classList.add('text-[#3498db]'); 
            if(statusText) statusText.classList.remove('text-white/80');
        } else {
            if(toggleSwitch) toggleSwitch.classList.remove('switch-on');
            if(switchIcon) switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
            if(switchIcon) switchIcon.classList.remove('text-white');
            if(switchIcon) switchIcon.classList.add('text-[#bdc3c7]');
            if(statusText) statusText.textContent = 'DISABLED';
            if(statusText) statusText.classList.remove('text-[#3498db]');
            if(statusText) statusText.classList.add('text-white/80');
        }
    }
    function updateRedirectUI(isEnabled) { 
        if (!redirectToggleBtn) return;
        if (isEnabled) {
            redirectToggleBtn.classList.add('switch-on');
            if(redirectSwitchIcon) redirectSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
            if(redirectSwitchIcon) redirectSwitchIcon.classList.add('text-white');
            if(redirectSwitchIcon) redirectSwitchIcon.classList.remove('text-[#bdc3c7]');
        } else {
            redirectToggleBtn.classList.remove('switch-on');
            if(redirectSwitchIcon) redirectSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
            if(redirectSwitchIcon) redirectSwitchIcon.classList.remove('text-white');
            if(redirectSwitchIcon) redirectSwitchIcon.classList.add('text-[#bdc3c7]');
        }
    }
    function applyThemeUI(theme) { /* ... */ }
    function updateStatsUI(isVisible) { /* ... */ }


    // === CORE OVERLAY LOGIC ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return;

        if (showContent) {
            overlay.classList.add('fade-out');
        } else {
            overlay.classList.remove('fade-out'); 
            overlay.style.display = 'flex'; 
        }
    }

    function redirect(isKeypress = false) {
        clearTimeout(timeoutHandle);
        manualExitIntent = true; 
        window.location.replace(REDIRECT_URL);
    }

    // === EVENT LISTENERS ===

    window.addEventListener('beforeunload', function(e) {
        if (localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true' && !manualExitIntent) { 
            e.preventDefault(); 
            e.returnValue = ''; 
        }
    });

    document.addEventListener('visibilitychange', () => {
        // FIX: The default state for redirect is now OFF (false).
        const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 

        if (document.visibilityState === 'hidden') {
            if (redirectEnabled) {
                timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
            } else {
                toggleContentVisibility(false); // Show overlay (Instant)
            }
        } else {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        }
    });

    window.addEventListener('focus', function () {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (overlay && overlay.style.display === 'flex') {
            if (event.key.toUpperCase() === 'E') {
                toggleContentVisibility(true);
                event.preventDefault();
            }
            if (event.key === ' ') {
                redirect(true);
                event.preventDefault();
            }
        }
    });
    
    // Listen for custom events triggered by the global toggle functions to update the UI
    document.addEventListener('securityToggle', () => {
        // FIX: Use the new logic to determine redirect enabled state (must be explicitly 'true')
        const protEnabled = localStorage.getItem(STORAGE_KEY_PROTECTION) !== 'false';
        const redirEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true';
        updateProtectionUI(protEnabled);
        updateRedirectUI(redirEnabled);
    });
    
    document.addEventListener('themeToggle', () => {
        const theme = localStorage.getItem('theme') || 'light';
        applyThemeUI(theme);
    });
    
    document.addEventListener('statsToggle', () => {
        const statsEnabled = localStorage.getItem(STORAGE_KEY_STATS) === 'true';
        updateStatsUI(statsEnabled);
    });


    // === INITIALIZATION LOGIC (Runs inside setTimeout) ===

    // FIX 1: Protection: Default is ON (true) unless explicitly set to 'false'.
    const savedProtectionState = localStorage.getItem(STORAGE_KEY_PROTECTION) !== 'false'; 
    
    // FIX 1: Redirect: Default is OFF (false) unless explicitly set to 'true'.
    const savedRedirectState = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedStatsState = localStorage.getItem(STORAGE_KEY_STATS) === 'true'; // Default is OFF
    
    // Apply initial UI states
    updateProtectionUI(savedProtectionState);
    updateRedirectUI(savedRedirectState);
    applyThemeUI(savedTheme);
    updateStatsUI(savedStatsState);
    
}, 700);
});
