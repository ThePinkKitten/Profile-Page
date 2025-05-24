/*
  Avatar Effect
  - Add avatar hover effect only if avatar exists
*/

// Function to initialize avatar effect
export function initAvatarEffect() {
  const avatarContainer = document.querySelector('.avatarContainer');
  const avatar = document.querySelector('.avatar');
  
  if (avatarContainer && avatar) {    // 3D rotate effect on mouse move
    avatarContainer.addEventListener('mousemove', (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      avatarContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    avatarContainer.addEventListener('mouseleave', () => {
      avatarContainer.style.transform = 'rotateY(0) rotateX(0)';
    });
      // Happy bounce on click
    avatarContainer.addEventListener('click', () => {
      avatar.classList.add('avatar-bounce');
      setTimeout(() => {
        avatar.classList.remove('avatar-bounce');
      }, 1000);
        // Phát ngẫu nhiên một trong ba âm thanh
      const soundIndex = Math.floor(Math.random() * 3) + 1; // Số ngẫu nhiên 1, 2 hoặc 3
      const soundFile = `Assets/Music/hurt${soundIndex}.ogg`;
      
      console.log(`[Avatar] Phát âm thanh: ${soundFile}`);
      
      const meow = new Audio(soundFile);
      // Giữ nguyên âm lượng gốc của file âm thanh
      meow.play().catch(error => console.error('[Avatar] Lỗi phát âm thanh:', error));
    });
  }
}