setTimeout(() => {
    // === CONFIGURATION KEYS ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const REDIRECT_DELAY = 65;

    // === STATE VARIABLES ===
    let tabProtectionEnabled = false; 
    let redirectEnabled = false;      
    let timeoutHandle = null;         

    // === DOM ELEMENTS (Using IDs from the corrected HTML) ===
    
    // Tab Protection UI (Close tab prevention)
    const toggleSwitch = document.getElementById('protection-toggle-switch'); // Container ID
    const switchIcon = document.getElementById('switch-icon-protection');     // Icon ID
    const statusText = document.getElementById('protection-status');          
    
    // Redirect/Blur UI
    const redirectToggleBtn = document.getElementById('blur-toggle-switch');  // Container ID
    const redirectSwitchIcon = document.getElementById('switch-icon-redirect'); // Icon ID
    const overlay = document.getElementById('offscreen-overlay');                       
    
    // === UI UPDATE FUNCTIONS ===

    function updateProtectionUI() {
        if (tabProtectionEnabled) {
            const closepreventionwarning = 'closepreventionwarning'; 
            if (localStorage.getItem(closepreventionwarning) === null) {
                showModal('NOTE: If redirect is on, it will still redirect, it will not prevent');


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

    function updateRedirectUI() {
        if (!redirectToggleBtn) return;
        
        if (redirectEnabled) {
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
    
    // === TOGGLE FUNCTIONS ===

    window.toggleTabProtection = function() {
        tabProtectionEnabled = !tabProtectionEnabled; 
        localStorage.setItem(STORAGE_KEY_PROTECTION, tabProtectionEnabled);
        updateProtectionUI();
        console.log(`[TOGGLE] Tab Protection is now ${tabProtectionEnabled ? 'Enabled' : 'Disabled'}`);
    }

    window.toggleRedirect = function() {
        redirectEnabled = !redirectEnabled;
        localStorage.setItem(STORAGE_KEY_REDIRECT, redirectEnabled);
        updateRedirectUI();
        console.log(`[TOGGLE] Redirect/Blur is now ${redirectEnabled ? 'Enabled' : 'Disabled'}`);
    }

    // === CORE REDIRECT/OVERLAY LOGIC ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) {
            console.error('[ERROR] Overlay element (id="overlay") not found.');
            return;
        }

        if (showContent) {
            overlay.style.display = 'none';
        } else {
            overlay.style.display = 'flex'; 
        }
    }

    function redirect() {
        clearTimeout(timeoutHandle);
          if(tabProtectionEnabled){
            tabProtectionEnabled = false
          }
          window.location.replace("https://www.google.com");
    }

    // === EVENT LISTENERS ===

    window.addEventListener('beforeunload', function(e) {
        if (tabProtectionEnabled) { 
            e.preventDefault(); 
            e.returnValue = ''; 
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            if (redirectEnabled) {
                timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
            } else {
                toggleContentVisibility(false);
            }
        } else {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
                console.log('[VISIBILITY VISIBLE] Redirect cleared.');
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
                console.log('[KEYPRESS] E pressed, dismissing overlay.');
                toggleContentVisibility(true);
                event.preventDefault();
            }
            if (event.key === ' ') {
          if(tabProtectionEnabled){
            tabProtectionEnabled = false;
          }
          window.location.replace("https://google.com/");
                event.preventDefault();
            }
        }
    });
// Function to load the theme attribute early (runs immediately upon script parsing)
(function loadInitialThemeAttribute() {
    // Read the saved theme from storage (defaults to 'light')
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the theme attribute to <html> immediately for color loading
    document.documentElement.setAttribute('data-theme', savedTheme);
})();


    // === DOM ELEMENTS (Accessed safely inside DOMContentLoaded) ===
    const themeSwitchContainer = document.getElementById('theme-toggle-switch');
    const themeIcon = document.getElementById('switch-icon-theme'); 
    const themeStatusSpan = document.getElementById('theme-status'); 

    /**
     * Applies the theme, SAVES the state, and updates the switch UI (position/text).
     * @param {string} theme - 'light' or 'dark'.
     */
    function applyTheme(theme) {
        // 1. CORE SAVING LOGIC
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme); 
        
        // 2. UI Synchronization Logic
        if (theme === 'dark') {
            // Set Dark Mode UI
            if (themeSwitchContainer) themeSwitchContainer.classList.add('switch-on');
            if (themeIcon) {
                // Sun icon path for Dark mode
                themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
            }
            if (themeStatusSpan) themeStatusSpan.textContent = 'Dark Mode';
        } else {
            // Set Light Mode UI
            if (themeSwitchContainer) themeSwitchContainer.classList.remove('switch-on');
            if (themeIcon) {
                // Moon icon path for Light mode
                themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
            }
            if (themeStatusSpan) themeStatusSpan.textContent = 'Light Mode';
        }
    }

    /**
     * Toggles the theme state when the button is clicked.
     * This function is globally available for HTML: onclick="toggleTheme()"
     */
    window.toggleTheme = function() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        let newTheme;

        // Use IF statement to determine the next theme
        if (currentTheme === 'light') {
            newTheme = 'dark';
        } else {
            newTheme = 'light';
        }
        
        // Apply the new theme (which saves the state and updates the UI)
        applyTheme(newTheme);
    }

    // === INITIAL UI SETUP (Runs once on load) ===
    
    // We get the theme state again and call applyTheme to synchronize the SWITCH UI
    const initialThemeState = localStorage.getItem('theme') || 'light';
    applyTheme(initialThemeState); 
    // === INITIALIZATION LOGIC (Runs after 800ms) ===

    const savedProtectionState = localStorage.getItem(STORAGE_KEY_PROTECTION);
    tabProtectionEnabled = savedProtectionState === 'true'; 

    const savedRedirectState = localStorage.getItem(STORAGE_KEY_REDIRECT);
    redirectEnabled = savedRedirectState === 'true' || savedRedirectState === null; 
    
    updateProtectionUI();
    updateRedirectUI();
    
    console.log(`[INITIALIZED] Protection: ${tabProtectionEnabled}, Redirect: ${redirectEnabled}.`);
    
}, 800);
