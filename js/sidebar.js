/*
  Sidebar
  - Initialize sidebar functionality
  - Initialize audio player
  - Highlight active section
*/
let isSidebarOpen = false;

// Function to initialize sidebar
export function initSidebar() {
  isSidebarOpen = sessionStorage.getItem('sidebarOpen') === 'true';
  
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');

  if (!sidebarToggle || !sidebar) return;

  // Function to toggle sidebar
  function toggleSidebar(open) {
    isSidebarOpen = open;
    sessionStorage.setItem('sidebarOpen', open);
    
    if (open) {
      sidebar.classList.add('active');
      sidebarToggle.querySelector('i').classList.remove('fa-bars');
      sidebarToggle.querySelector('i').classList.add('fa-times');
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      sidebar.classList.remove('active');
      sidebarToggle.querySelector('i').classList.remove('fa-times');
      sidebarToggle.querySelector('i').classList.add('fa-bars');
      document.body.style.overflow = '';
    }
  }

  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleSidebar(false);
      }
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        document.body.style.overflow = '';
        if (!isSidebarOpen) {
          sidebar.style.transform = 'translateX(-250px)';
        }
      }
    }, 250);
  });

  const hasVisitedBefore = sessionStorage.getItem('hasVisited');
  if (hasVisitedBefore && isSidebarOpen) {
    toggleSidebar(true);
  } else {
    toggleSidebar(false);
  }

  sidebarToggle.addEventListener('click', () => {
    toggleSidebar(!isSidebarOpen);
  });

  document.addEventListener('click', (e) => {
    if (isSidebarOpen && 
      !sidebar.contains(e.target) && 
      !sidebarToggle.contains(e.target) &&
      window.innerWidth <= 768) {
      toggleSidebar(false);
    }
  });

  if (sidebarLinks.length > 0) {
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href.includes('#') && !href.startsWith('#')) {
          const [pagePath, anchor] = href.split('#');
          if (window.location.pathname.endsWith(pagePath)) {
            e.preventDefault();
            const targetElement = document.querySelector(`#${anchor}`);
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 50,
                behavior: 'smooth'
              });
            }
          }
        }
        
        sidebarLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
}

// Function to initialize audio player
export function initAudioPlayer() {
  const audioButton = document.getElementById('audioButton');
  const bgMusic = document.getElementById('bgMusic');
  const musicProgress = document.getElementById('musicProgress');
  const progressContainer = document.querySelector('.progress-container');

  if (!audioButton || !bgMusic || !musicProgress || !progressContainer) return;

  let isPlaying = false;
  const isMobile = () => window.innerWidth <= 600;

  // Update progress bar transition animation
  musicProgress.style.transition = 'width 0.15s ease';

  // Function to update progress bar
  function updateProgressBar() {
    if (bgMusic.duration) {
      const progressPercent = (bgMusic.currentTime / bgMusic.duration) * 100;
      musicProgress.style.width = progressPercent + '%';
    }
    if (isPlaying) {
      requestAnimationFrame(updateProgressBar);
    }
  }

  audioButton.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (isPlaying) {
      bgMusic.pause();
      audioButton.innerHTML = '<i class="fas fa-play"></i>';
      audioButton.classList.remove('playing');
    } else {
      bgMusic.play();
      audioButton.innerHTML = '<i class="fas fa-pause"></i>';
      audioButton.classList.add('playing');
      requestAnimationFrame(updateProgressBar);
    }
    isPlaying = !isPlaying;
  });

  window.addEventListener('resize', () => {
    const mobile = isMobile();
    if (mobile) {
      progressContainer.style.width = '90px';
    } else {
      progressContainer.style.width = '100px';
    }
  });

  progressContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    
    const progressRect = this.getBoundingClientRect();
    const clickPosition = e.clientX - progressRect.left;
    const percentageClicked = clickPosition / progressRect.width;
    
    if (bgMusic.duration) {
      const seekTime = percentageClicked * bgMusic.duration;
      bgMusic.currentTime = seekTime;
      musicProgress.style.width = (percentageClicked * 100) + '%';
    }
  });
}

// Function to highlight active section
export function highlightActiveSection() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    document.querySelectorAll('.section').forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        sidebarLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  });
} 