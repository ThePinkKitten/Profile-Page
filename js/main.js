/*
  Main Script
  - Initialize essential components and features
  - Load non-critical features asynchronously
*/

// Import necessary modules
import { initSidebar, highlightActiveSection } from './sidebar.js';
import { initModal } from './modal.js';
import { optimizeAvatarGif } from './optimize-images.js';
import { initPersistentAudio } from './persistent-audio.js';

// Initialize reset functions
const resetFunctions = {}; 

document.addEventListener('DOMContentLoaded', async () => {
  // Preload background image - điều chỉnh đường dẫn dựa trên URL hiện tại
  const currentPath = window.location.pathname;
  const isInPagesDirectory = currentPath.includes('/pages/');
  const backgroundPath = isInPagesDirectory ? 
    '../Assets/Image/Background/background.gif' : 
    'Assets/Image/Background/background.gif';
  
  const bgImage = new Image();
  bgImage.src = backgroundPath;
  bgImage.onload = () => console.log('Background image loaded successfully');
  
  // Optimize avatar GIF
  optimizeAvatarGif();
  
  // Initialize sidebar
  initSidebar();
  
  // Initialize persistent audio player with sessionStorage
  initPersistentAudio();
  highlightActiveSection();  // Initialize modal
  initModal();
  
  // Force background image to be displayed using the backgroundPath already defined
  document.body.style.backgroundImage = `url('${backgroundPath}')`;
  
  const loadingOverlay = document.querySelector('.loading-overlay');
  const hasVisitedBefore = sessionStorage.getItem('hasVisited');
  
  await Promise.all([
    ...Array.from(document.querySelectorAll('img.critical')).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });
    }),
    ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => {
      return new Promise((resolve) => {
        if (link.sheet) {
          resolve();
        } else {
          link.onload = () => resolve();
          link.onerror = () => resolve();
        }
      });
    }),
    !hasVisitedBefore ? new Promise(resolve => setTimeout(resolve, 2000)) : Promise.resolve()
  ]);
  if (!hasVisitedBefore) {
    sessionStorage.setItem('hasVisited', 'true');
  }
  
  // Hide loading overlay after all critical resources have finished loading
  loadingOverlay.classList.add('hide');
  
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.style.opacity = '1';
  }

  // Load non-critical features after the main content is displayed
  loadNonCriticalFeatures();
});

// Function to load non-critical features
async function loadNonCriticalFeatures() {
  const [
    { initAvatarEffect },
    { initTypingAnimation, resetTyping },
    { initSocialLinks, resetLinksAnimation },
    { initImageOptimization }
  ] = await Promise.all([
    import('./avatar.js'),
    import('./typing.js'),
    import('./social-links.js'),
    import('./optimize-images.js')
  ]);
  
  // Initialize non-critical features
  initImageOptimization();
  initAvatarEffect();
  initTypingAnimation();
  initSocialLinks();
  
  resetFunctions.resetLinksAnimation = resetLinksAnimation;
  resetFunctions.resetTyping = resetTyping;
  
  window.resetLinksAnimation = resetLinksAnimation;
  window.resetTyping = resetTyping;
}


