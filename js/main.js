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

document.addEventListener('DOMContentLoaded', async () => {  // Preload background image
  const bgImage = new Image();
  bgImage.src = '../Assets/Image/Background/background.gif';
  bgImage.onload = () => console.log('Background image loaded successfully');
  
  // Optimize avatar GIF
  optimizeAvatarGif();
    // Initialize sidebar
  initSidebar();
  // Initialize persistent audio player with sessionStorage
  initPersistentAudio();
  highlightActiveSection();  initModal();
    // Force background image to be displayed
  document.body.style.backgroundImage = `url('../Assets/Image/Background/background.gif')`;
  
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

  // Tải các tính năng không quan trọng sau khi đã hiển thị trang chính
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
  ]);  initImageOptimization();
  initAvatarEffect();
  initTypingAnimation();
  initSocialLinks();
  
  resetFunctions.resetLinksAnimation = resetLinksAnimation;
  resetFunctions.resetTyping = resetTyping;
  
  window.resetLinksAnimation = resetLinksAnimation;
  window.resetTyping = resetTyping;
}


