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

// Check if a resource exists before attempting to load it
function checkResourceExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(response => response.ok)
    .catch(() => false);
}

// Function to optimize avatar and background GIFs
export function optimizeAvatarGif() {
  // Xác định đường dẫn chính xác dựa trên URL hiện tại
  const currentPath = window.location.pathname;
  const isInPagesDirectory = currentPath.includes('/pages/');
  const backgroundPath = isInPagesDirectory ? 
    '../Assets/Image/Background/background.gif' : 
    'Assets/Image/Background/background.gif';
  
  // Check if background.gif exists
  checkResourceExists(backgroundPath)
    .then(exists => {
      if (!exists) {
        console.warn('Background GIF not found. Using fallback or hiding related elements.');
        // You could add fallback logic here if needed
      }
    });
}