/*
  Sidebar Module
  - Handles sidebar functionality and navigation
  - Manages sidebar state across page loads
  - Highlights active section based on scroll position
*/
let isSidebarOpen = false;

/**
 * Initialize the sidebar functionality
 * Sets up event listeners and restores previous state
 */
export function initSidebar() {
  // Restore sidebar state from session storage
  isSidebarOpen = sessionStorage.getItem('sidebarOpen') === 'true';
  
  // Get DOM elements
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  if (!sidebarToggle || !sidebar) return;
  /**
   * Toggle sidebar state between open and closed
   * @param {boolean} open - Whether to open (true) or close (false) the sidebar
   */
  function toggleSidebar(open) {
    // Update state and persist to session storage
    isSidebarOpen = open;
    sessionStorage.setItem('sidebarOpen', open);
    
    if (open) {
      // Open sidebar
      sidebar.classList.add('active');
      
      // Animate the sidebar toggle icon
      sidebarToggle.classList.add('active');
      setTimeout(() => {
        sidebarToggle.querySelector('i').classList.remove('fa-bars');
        sidebarToggle.querySelector('i').classList.add('fa-times');
      }, 200);
      
      // Push main content to the right - but only if not on the index page
      const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
      if (window.innerWidth > 768 && !isIndexPage) {
        main.style.marginLeft = '280px';
      }
      
      // Prevent body scrolling on mobile
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
      }
      
      // Create staggered animation for nav items
      animateNavItems();
    } else {
      // Close sidebar
      sidebar.classList.remove('active');
      
      // Reset main content position
      main.style.marginLeft = '0';
      
      // Animate the sidebar toggle icon back
      sidebarToggle.classList.remove('active');
      setTimeout(() => {
        sidebarToggle.querySelector('i').classList.remove('fa-times');
        sidebarToggle.querySelector('i').classList.add('fa-bars');
      }, 200);
      
      // Restore body scrolling
      document.body.style.overflow = '';
    }
  }
  
  /**
   * Create staggered animation effect for navigation items
   */
  function animateNavItems() {
    const navItems = document.querySelectorAll('.sidebar-nav ul li');
    navItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        item.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 100 + (index * 50));
    });
  }

  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleSidebar(false);
      }
    });
  });  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
      
      if (window.innerWidth > 768) {
        document.body.style.overflow = '';
        if (isSidebarOpen && !isIndexPage) {
          main.style.marginLeft = '280px';
        } else {
          sidebar.style.transform = 'translateX(-250px)';
          main.style.marginLeft = '0';
        }
      } else {
        // On mobile, don't push content
        main.style.marginLeft = '0';
      }
    }, 250);
  });
  const hasVisitedBefore = sessionStorage.getItem('hasVisited');
  // Apply the correct sidebar state on page load
  if (hasVisitedBefore && isSidebarOpen) {
    toggleSidebar(true);
  } else {
    toggleSidebar(false);
  }
    // Ensure proper initial main content position based on sidebar state and viewport width
  const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  if (isSidebarOpen && window.innerWidth > 768 && !isIndexPage) {
    main.style.marginLeft = '280px';
  } else {
    main.style.marginLeft = '0';
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