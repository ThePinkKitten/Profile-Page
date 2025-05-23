/*
  Image Optimization
  - Lazy load images that are not critical
*/

// Function to initialize image optimization
export function initImageOptimization() {
  const lazyImages = document.querySelectorAll('img:not(.critical)');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      if (!img.dataset.src && img.src) {
        img.dataset.src = img.src;
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      }
      
      imageObserver.observe(img);
    });
  } else {
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }
}

// Empty function to avoid errors in main.js
export function optimizeAvatarGif() {
  // Do nothing - keep the original GIF
} 