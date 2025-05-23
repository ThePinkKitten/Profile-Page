/*
  Avatar Effect
  - Add avatar hover effect only if avatar exists
*/

// Function to initialize avatar effect
export function initAvatarEffect() {
  const avatarContainer = document.querySelector('.avatarContainer');
  const avatar = document.querySelector('.avatar');
  
  if (avatarContainer && avatar) {
    // 3D rotate effect on mouse move
    avatarContainer.addEventListener('mousemove', (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      avatarContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    avatarContainer.addEventListener('mouseleave', () => {
      avatarContainer.style.transform = 'rotateY(0) rotateX(0)';
    });
    
    // Cat ears appear on hover
    avatarContainer.addEventListener('mouseenter', () => {
      // Create cat ears if they don't exist
      if (!document.querySelector('.cat-ear-left')) {
        // Create left ear
        const leftEar = document.createElement('div');
        leftEar.className = 'cat-ear cat-ear-left';
        
        // Create right ear
        const rightEar = document.createElement('div');
        rightEar.className = 'cat-ear cat-ear-right';
        
        // Add ears to container
        avatarContainer.appendChild(leftEar);
        avatarContainer.appendChild(rightEar);
      }
      
      // Show the ears
      document.querySelectorAll('.cat-ear').forEach(ear => {
        ear.style.opacity = '1';
      });
      
      // Add a meow sound with 30% probability
      if (Math.random() < 0.3) {
        const meow = new Audio('https://assets.mixkit.co/active_storage/sfx/2244/2244-preview.mp3');
        meow.volume = 0.2;
        meow.play();
      }
    });
    
    // Hide ears when not hovering
    avatarContainer.addEventListener('mouseleave', () => {
      document.querySelectorAll('.cat-ear').forEach(ear => {
        ear.style.opacity = '0';
      });
    });
    
    // Happy bounce on click
    avatarContainer.addEventListener('click', () => {
      avatar.classList.add('avatar-bounce');
      setTimeout(() => {
        avatar.classList.remove('avatar-bounce');
      }, 1000);
      
      // Always meow on click
      const meow = new Audio('https://assets.mixkit.co/active_storage/sfx/2244/2244-preview.mp3');
      meow.volume = 0.2;
      meow.play();
    });
  }
} 