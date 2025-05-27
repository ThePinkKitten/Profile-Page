// filepath: c:\Users\asdsa\Desktop\CV\js\theme.js
/*
  Theme
  - Always uses dark mode only
*/

// Function to initialize theme (dark mode only)
export function initThemeSwitch() {
  const toggleSwitch = document.querySelector('#checkbox');
  const mainContent = document.querySelector('main') || document.body;

  // Hide theme switch as we're only using dark mode
  const themeToggleContainer = document.querySelector('.theme-switch-wrapper');
  if (themeToggleContainer) {
    themeToggleContainer.style.display = 'none';
  }
  
  // Always apply dark theme
  document.documentElement.setAttribute('data-theme', 'dark');
  if (toggleSwitch) toggleSwitch.checked = false;
  sessionStorage.setItem('theme', 'dark');
    // Always set background image
  document.body.style.backgroundImage = `url('../Assets/Image/Background/background.gif')`;
    // Dark theme is the only theme we use
}
