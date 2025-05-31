// Function to initialize avatar effect
export function initAvatarEffect() {
  const avatarContainer = document.querySelector('.avatarContainer');
  const avatar = document.querySelector('.avatar');
  
  if (!avatarContainer || !avatar) return; // Early return if elements don't exist

  // Pre-load audio files for better performance
  const meowSounds = [1, 2, 3].map(index => {
    const audio = new Audio(`Assets/Music/hurt${index}.ogg`);
    audio.preload = 'auto';
    return audio;
  });
  
  // 3D rotation effect on mouse move
  avatarContainer.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    avatarContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });

  avatarContainer.addEventListener('mouseleave', () => {
    avatarContainer.style.transform = 'rotateY(0) rotateX(0)';
  });
  
  // Bounce effect on click with sound
  avatarContainer.addEventListener('click', () => {
    // Apply bounce animation
    avatar.classList.add('avatar-bounce');
    setTimeout(() => avatar.classList.remove('avatar-bounce'), 1000);
    
    // Play random sound
    playRandomMeowSound(meowSounds);
  });
}

// Helper function to play random meow sound
function playRandomMeowSound(sounds) {
  const soundIndex = Math.floor(Math.random() * sounds.length);
  const meow = sounds[soundIndex];
  
  console.log(`[Avatar] Playing sound: Assets/Music/hurt${soundIndex + 1}.ogg`);
  
  // Reset audio position to beginning in case it was already played
  meow.currentTime = 0;
  meow.play().catch(error => console.error('[Avatar] Error playing sound:', error));
}