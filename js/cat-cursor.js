/*
  Cat Cursor Effect
  - Adds a cute cat that follows the cursor
  - Includes playful animations and reactions
*/

export function initCatCursor() {
  // Only initialize on desktop
  if (window.innerWidth < 768) return;
  
  // Create cat element
  const cat = document.createElement('div');
  cat.className = 'cat-cursor';
  cat.innerHTML = '<span class="cat-body">🐈</span><span class="cat-tail">~</span>';
  document.body.appendChild(cat);
  
  // Cat state
  let isResting = false;
  let lastMoveTime = Date.now();
  const restTimeout = 3000; // Rest after 3 seconds of inactivity
  
  // Position variables with some initial offset
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  
  // Handle mouse movement
  document.addEventListener('mousemove', (e) => {
    // Update target position (with offset so cat follows behind cursor)
    targetX = e.clientX - 30;
    targetY = e.clientY + 20;
    
    // If cat was resting, make it active again
    if (isResting) {
      isResting = false;
      cat.classList.remove('resting');
      cat.innerHTML = '<span class="cat-body">🐈</span><span class="cat-tail">~</span>';
    }
    
    // Update last move time
    lastMoveTime = Date.now();
  });
  
  // Animation function
  function animateCat() {
    // Check if cat should be resting
    if (!isResting && Date.now() - lastMoveTime > restTimeout) {
      isResting = true;
      cat.classList.add('resting');
      cat.innerHTML = '<span class="cat-body">😴</span>';
    }
    
    // Smooth follow with easing
    if (!isResting) {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      
      // Apply position
      cat.style.left = `${currentX}px`;
      cat.style.top = `${currentY}px`;
    }
    
    // Continuous animation
    requestAnimationFrame(animateCat);
  }
  
  // Click interaction
  document.addEventListener('click', (e) => {
    if (Math.abs(e.clientX - currentX - 30) < 50 && Math.abs(e.clientY - currentY - 20) < 50) {
      // Click near the cat - make it react
      cat.innerHTML = '<span class="cat-body">😻</span>';
      setTimeout(() => {
        if (!isResting) {
          cat.innerHTML = '<span class="cat-body">🐈</span><span class="cat-tail">~</span>';
        }
      }, 500);
    }
  });
  
  // Start animation loop
  animateCat();
}
