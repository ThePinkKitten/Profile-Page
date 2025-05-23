/*
  Avatar Effect
  - Add avatar hover effect only if avatar exists
*/

// Function to initialize avatar effect
export function initAvatarEffect() {
  const avatar = document.querySelector('.avatarContainer');
  if (avatar) {
    avatar.addEventListener('mousemove', (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      avatar.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    avatar.addEventListener('mouseleave', () => {
      avatar.style.transform = 'rotateY(0) rotateX(0)';
    });
  }
} 