/*
  Theme
  - Initialize theme switch functionality
*/
let isThemeSwitching = false;

// Function to initialize theme switch
export function initThemeSwitch() {
  const toggleSwitch = document.querySelector('#checkbox');
  const particlesContainer = document.querySelector('#particles-js');
  const loadingOverlay = document.querySelector('.loading-overlay');
  const mainContent = document.querySelector('main') || document.body;

  if (!toggleSwitch) return;

  toggleSwitch.addEventListener('change', switchTheme);

  // Get current theme from sessionStorage
  const currentTheme = sessionStorage.getItem('theme');
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
      toggleSwitch.checked = true;
      if (window.pJSDom && window.pJSDom[0]) {
        window.pJSDom[0].pJS.particles.move.enable = false;
      }
    }
  } else {
    // Set default theme to light if no theme is stored
    document.documentElement.setAttribute('data-theme', 'light');
    toggleSwitch.checked = true;
    sessionStorage.setItem('theme', 'light');
    if (window.pJSDom && window.pJSDom[0]) {
      window.pJSDom[0].pJS.particles.move.enable = false;
    }
  }

  // Function to fade out content
  function fadeOutContent() {
    return new Promise(resolve => {
      if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transition = 'opacity 0.5s ease';
      }
      setTimeout(resolve, 500);
    });
  }
  
  // Function to fade in content
  function fadeInContent() {
    return new Promise(resolve => {
      if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.transition = 'opacity 0.5s ease';
      }
      setTimeout(resolve, 500);
    });
  }
  
  // Function to show loading overlay
  function showLoadingOverlay() {
    return new Promise(resolve => {
      const loadingOverlay = document.querySelector('.loading-overlay');
      loadingOverlay.classList.remove('hide');
      setTimeout(resolve, 1500);
    });
  }
  
  // Function to hide loading overlay
  function hideLoadingOverlay() {
    return new Promise(resolve => {
      const loadingOverlay = document.querySelector('.loading-overlay');
      loadingOverlay.classList.add('hide');
      setTimeout(resolve, 500);
    });
  }
  
  // Function called to switch theme and store in sessionStorage
  async function switchTheme(e) {
    e.preventDefault();
    
    if (isThemeSwitching) return;
    isThemeSwitching = true;
    toggleSwitch.disabled = true;
    
    const isLightMode = e.target.checked;
    
    try {
      await fadeOutContent();
      await showLoadingOverlay();
  
      if (isLightMode) {
        if (particlesContainer) {
          particlesContainer.style.opacity = '0';
        }
        
        if (window.pJSDom && window.pJSDom[0]) {
          window.pJSDom[0].pJS.particles.move.enable = false;
        }
        
        // Apply theme change immediately
        document.documentElement.setAttribute('data-theme', 'light');
        sessionStorage.setItem('theme', 'light');
        
        // Start background image loading in parallel
        const bgLoadPromise = Promise.race([
          new Promise(resolve => {
            const img = new Image();
            img.src = 'Assets/Image/Background/background.gif';
            img.onload = resolve;
          }),
          new Promise(resolve => setTimeout(resolve, 1000)) // Shorter timeout
        ]).catch(() => {
          console.log('Background image loading timeout, continuing anyway');
        });
        
        // Wait for a maximum of 1 second for image to load
        await bgLoadPromise;
      } else {
        // Dark mode transitions faster because no large background image
        document.documentElement.setAttribute('data-theme', 'dark');
        sessionStorage.setItem('theme', 'dark');
        
        if (window.pJSDom && window.pJSDom[0]) {
          window.pJSDom[0].pJS.particles.move.enable = true;
          window.pJSDom[0].pJS.fn.particlesRefresh();
        }
        
        if (particlesContainer) {
          particlesContainer.style.opacity = '1';
        }
      }
      
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLightMode } }));
      
      setTimeout(async () => {
        await hideLoadingOverlay();
        await fadeInContent();
        
        toggleSwitch.checked = isLightMode;
        isThemeSwitching = false;
        toggleSwitch.disabled = false;
      }, 500);
      
    } catch (error) {
      console.error('Error during theme switch:', error);
      const loadingOverlay = document.querySelector('.loading-overlay');
      loadingOverlay.classList.add('hide');
      mainContent.style.opacity = '1';
      isThemeSwitching = false;
      toggleSwitch.disabled = false;
    }
  }
} 