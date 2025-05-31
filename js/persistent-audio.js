/*
  Persistent Audio Player
  - Manages background music across page navigation
  - Remembers playback state using sessionStorage
  - Handles browser autoplay restrictions
*/

// Audio elements
let audioPlayer = null;
let audioButton = null;
let musicProgress = null;
let progressContainer = null;
let isInitialized = false;
let autoPlayAttemptCount = 0;
const MAX_AUTOPLAY_ATTEMPTS = 3;
let saveStateIntervalId = null;

// Storage keys for persistent audio state
const AUDIO_IS_PLAYING = 'audio_isPlaying';
const AUDIO_CURRENT_TIME = 'audio_currentTime';
const AUDIO_VOLUME = 'audio_volume';
const AUDIO_IS_MUTED = 'audio_isMuted';

// User interaction events to unlock audio playback
const USER_INTERACTION_EVENTS = ['click', 'keydown', 'touchstart', 'mousemove', 'scroll'];

// Actual song duration (2 minutes 30 seconds)
const ACTUAL_SONG_DURATION = 150;

/**
 * Initialize the persistent audio player
 * This function sets up the audio player that persists across page navigation
 */
export function initPersistentAudio() {
  // Ensure initialization happens only once
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('[Persistent Audio] Initializing');
  
  setupAudioElements();
  
  // Listen for tab visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Save audio state on page unload
  window.addEventListener('beforeunload', saveAudioState);
  
  // Save audio state periodically, but less frequently (every 5 seconds)
  saveStateIntervalId = setInterval(saveAudioState, 5000);
  
  // Register user interaction events to unlock audio
  registerUserInteractionEvents();
  
  // Ensure music plays when the page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAudioAndPlay);
  } else {
    loadAudioAndPlay();
  }
}

/**
 * Register events that can trigger audio playback after user interaction
 * Required to overcome browser autoplay restrictions
 */
function registerUserInteractionEvents() {
  // Add a single event listener to the document for all interaction events
  let hasInteracted = false;
  
  USER_INTERACTION_EVENTS.forEach(eventType => {
    document.addEventListener(eventType, function interactionHandler(e) {
      if (!hasInteracted && isAudioPaused()) {
        hasInteracted = true;
        console.log('[Persistent Audio] User interaction detected - playing music');
        playAudio();
        
        // Clean up all event listeners once user has interacted
        USER_INTERACTION_EVENTS.forEach(evt => {
          document.removeEventListener(evt, interactionHandler);
        });
      }
    }, { once: true });
  });
  
  // Ensure audio plays after sidebar loads (if needed)
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (isAudioPaused() && sessionStorage.getItem(AUDIO_IS_MUTED) !== 'true') {
        playAudio();
      }
    });
  }
}

/**
 * Handle visibility change events when user returns to tab
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // Kiểm tra nếu nhạc đang tạm dừng và người dùng không mute trước đó
    const shouldPlay = isAudioPaused() && 
                       sessionStorage.getItem(AUDIO_IS_PLAYING) === 'true' && 
                       sessionStorage.getItem(AUDIO_IS_MUTED) !== 'true';
                       
    if (shouldPlay) {
      playAudio();
    }
  } else if (document.visibilityState === 'hidden') {
    // Lưu trạng thái khi chuyển sang tab khác
    saveAudioState();
  }
}

/**
 * Check if audio player is currently paused
 * Quick utility function to check audio player state
 * @returns {boolean} True if audio is paused or not available
 */
function isAudioPaused() {
  return !audioPlayer || audioPlayer.paused;
}

/**
 * Load audio state from storage and attempt to play
 * This is called after the page loads or when returning to the tab
 */
function loadAudioAndPlay() {
  // Reset attempt counter
  autoPlayAttemptCount = 0;
  
  // Tải trạng thái âm thanh từ bộ nhớ
  loadAudioState();
  
  // Kiểm tra và phát lại sau khi trang tải hoàn tất (chỉ phát khi cần thiết)
  // Không cần gọi attemptAutoPlay() vì loadAudioState đã xử lý việc phát nhạc khi cần
}

/**
 * Set up audio player elements and event listeners
 * Initializes controls and progress bar functionality
 */
function setupAudioElements() {
  audioButton = document.getElementById('audioButton');
  audioPlayer = document.getElementById('bgMusic');
  musicProgress = document.getElementById('musicProgress');
  progressContainer = document.querySelector('.progress-container');

  if (!audioButton || !audioPlayer || !musicProgress || !progressContainer) {
    console.error('[Persistent Audio] Audio elements not found');
    return;
  }
  // Play/pause button click event - lưu handler để có thể xóa sau này
  const audioButtonHandler = (e) => {
    e.stopPropagation();
    toggleAudio();
  };
  audioButton.addEventListener('click', audioButtonHandler);
  audioButton._clickHandler = audioButtonHandler; // Lưu tham chiếu để dọn dẹp

  // Progress bar click event for seeking
  progressContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    
    const progressRect = this.getBoundingClientRect();
    const clickPosition = e.clientX - progressRect.left;
    const percentageClicked = clickPosition / progressRect.width;
    
    if (audioPlayer.duration) {
      const seekTime = percentageClicked * audioPlayer.duration;
      audioPlayer.currentTime = seekTime;
      updateProgressBar();
    }
  });
  // Update progress bar during playback
  audioPlayer.addEventListener('timeupdate', updateProgressBar);
    // Handle song end - lưu handler để có thể xóa sau này
  const audioEndedHandler = () => {
    audioPlayer.currentTime = 0;
    musicProgress.style.width = '0%';
    playAudio();
  };
  audioPlayer.addEventListener('ended', audioEndedHandler);
  audioPlayer._endedHandler = audioEndedHandler; // Lưu tham chiếu để dọn dẹp
  
  // Smooth animation for progress bar
  musicProgress.style.transition = 'width 0.15s ease';
}

/**
 * Load audio state from session storage
 * Restores volume, playback position, and play/pause state
 */
function loadAudioState() {
  const currentTime = parseFloat(sessionStorage.getItem(AUDIO_CURRENT_TIME) || '0');
  const volume = parseFloat(sessionStorage.getItem(AUDIO_VOLUME) || '0.5');
  const wasPlaying = sessionStorage.getItem(AUDIO_IS_PLAYING) === 'true';
  const wasMuted = sessionStorage.getItem(AUDIO_IS_MUTED) === 'true';
  
  console.log('[Persistent Audio] Loading state:', { currentTime, volume, wasPlaying, wasMuted });
  if (!audioPlayer) return;
  
  // Set volume and playback position
  audioPlayer.volume = volume;
  
  if (!isNaN(currentTime) && currentTime > 0 && currentTime < ACTUAL_SONG_DURATION) {
    audioPlayer.currentTime = currentTime;
  } else {
    audioPlayer.currentTime = 0;
  }
  
  // Remove old metadata event listeners
  cleanupMetadataListeners();
  
  // Add event listener for when audio metadata has loaded
  const metadataListener = handleMetadataLoaded;
  
  // Store listener reference for later cleanup
  audioPlayer._loadedMetadataListeners = [metadataListener];
  audioPlayer.addEventListener('loadedmetadata', metadataListener);
  
  // Chỉ đăng ký sự kiện "pause" nếu chưa đăng ký
  if (!audioPlayer._pauseListenerRegistered) {
    audioPlayer.addEventListener('pause', () => {
      // Xử lý khi trình duyệt chặn autoplay (chỉ khi bắt đầu phát - currentTime = 0)
      if (audioPlayer.currentTime === 0 && !wasMuted) {
        console.log('[Persistent Audio] Autoplay may have been blocked by browser');
        
        // Chỉ thử lại trong giới hạn cho phép và không phải người dùng chủ động tắt
        if (autoPlayAttemptCount < MAX_AUTOPLAY_ATTEMPTS) {
          autoPlayAttemptCount++;
          console.log(`[Persistent Audio] Retry attempt ${autoPlayAttemptCount}/${MAX_AUTOPLAY_ATTEMPTS}`);
          
          // Chỉ thử lại một lần duy nhất sau khoảng thời gian ngắn
          if (autoPlayAttemptCount === MAX_AUTOPLAY_ATTEMPTS) {
            console.log('[Persistent Audio] Last attempt to play audio');
          }
          
          setTimeout(() => {
            if (isAudioPaused() && sessionStorage.getItem(AUDIO_IS_MUTED) !== 'true') {
              const playPromise = audioPlayer.play();
              if (playPromise) {
                playPromise.catch(() => {
                  console.log('[Persistent Audio] Browser consistently blocking autoplay - waiting for user interaction');
                });
              }
            }
          }, 500 * autoPlayAttemptCount); // Thời gian chờ tăng dần
        }
      }
    });
    
    audioPlayer._pauseListenerRegistered = true;
  }

  // Chỉ thử phát nhạc ngay lập tức nếu metadata đã sẵn sàng và người dùng không mute
  if (audioPlayer.duration && wasPlaying && !wasMuted) {
    // Giảm số lần gọi hàm autoplay riêng biệt
    const playPromise = audioPlayer.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log('[Persistent Audio] Playback restored successfully');
        updatePlayButtonState(true);
      }).catch(() => {
        console.log('[Persistent Audio] Could not restore playback automatically');
      });
    }
  }
}

/**
 * Clean up metadata event listeners to prevent memory leaks
 */
function cleanupMetadataListeners() {
  if (!audioPlayer) return;
  
  const oldLoadedMetadataListeners = audioPlayer._loadedMetadataListeners || [];
  oldLoadedMetadataListeners.forEach(listener => {
    audioPlayer.removeEventListener('loadedmetadata', listener);
  });
}

/**
 * Handle audio metadata loaded event
 * Logs duration and attempts playback
 */
function handleMetadataLoaded() {
  const minutes = Math.floor(audioPlayer.duration / 60);
  const seconds = Math.floor(audioPlayer.duration % 60);
  console.log(`[Persistent Audio] Song loaded, duration: ${minutes}:${seconds < 10 ? '0' + seconds : seconds} (${audioPlayer.duration}s)`);
  
  // Try to play music when metadata is ready
  attemptAutoPlay();
}

/**
 * Save current audio state to session storage
 * Preserves playback position, volume and play/pause state
 */
function saveAudioState() {
  if (!audioPlayer) return;
  
  const isPlaying = !audioPlayer.paused;
  const wasMuted = sessionStorage.getItem(AUDIO_IS_MUTED) === 'true';
  
  // Luôn lưu trạng thái mute
  if (!isPlaying && !wasMuted) {
    // Chỉ lưu trạng thái mute mới nếu người dùng chủ động tắt nhạc
    sessionStorage.setItem(AUDIO_IS_MUTED, 'false');
  }
  
  // Lưu các trạng thái khác
  sessionStorage.setItem(AUDIO_IS_PLAYING, isPlaying.toString());
  sessionStorage.setItem(AUDIO_CURRENT_TIME, audioPlayer.currentTime.toString());
  sessionStorage.setItem(AUDIO_VOLUME, audioPlayer.volume.toString());
}

/**
 * Toggle audio between playing and paused states
 */
function toggleAudio() {
  if (!audioPlayer) return;
  
  if (audioPlayer.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

/**
 * Play audio and handle browser autoplay restrictions
 * Uses Promise API to handle success/failure conditions
 */
function playAudio() {
  if (!audioPlayer || !audioButton) return;
  
  console.log('[Persistent Audio] Playing music...');
  
  // Reset mute state when người dùng chủ động phát nhạc
  sessionStorage.setItem(AUDIO_IS_MUTED, 'false');
  
  // Đặt lại bộ đếm thử lại khi người dùng chủ động phát
  autoPlayAttemptCount = 0;
  
  // Lưu trạng thái là đang phát trước khi thử phát
  sessionStorage.setItem(AUDIO_IS_PLAYING, 'true');
  
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Playback started successfully');
      updatePlayButtonState(true);
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Error playing audio:', error);
      
      // Đăng ký sự kiện tương tác người dùng để mở khóa âm thanh
      const unlockAudioCallback = function unlockAudio() {
        console.log('[Persistent Audio] User interaction detected, trying playback once more');
        
        // Xóa tất cả event listener khi được gọi
        USER_INTERACTION_EVENTS.forEach(eventType => {
          document.removeEventListener(eventType, unlockAudioCallback);
        });
        
        // Thử phát lại
        audioPlayer.play().then(() => {
          console.log('[Persistent Audio] Playback after interaction successful');
          updatePlayButtonState(true);
          saveAudioState();
        }).catch(() => {}); // Bỏ qua lỗi nếu vẫn không phát được
      };
      
      // Chỉ đăng ký event listener cho tương tác người dùng một lần
      USER_INTERACTION_EVENTS.forEach(eventType => {
        document.addEventListener(eventType, unlockAudioCallback, { once: true });
      });
    });
  }
}

/**
 * Pause audio playback
 * @param {boolean} saveState - Whether to save the current state to storage
 * @param {boolean} setMuted - Whether to set the muted state (default true for user action)
 */
function pauseAudio(saveState = true, setMuted = true) {
  if (!audioPlayer || !audioButton) return;
  
  audioPlayer.pause();
  updatePlayButtonState(false);
  
  // Chỉ lưu trạng thái mute khi là hành động của người dùng
  if (setMuted) {
    sessionStorage.setItem(AUDIO_IS_MUTED, 'true');
    sessionStorage.setItem(AUDIO_IS_PLAYING, 'false');
  }
  
  if (saveState) {
    saveAudioState();
  }
}

/**
 * Update play/pause button state
 * @param {boolean} isPlaying - Whether audio is currently playing
 */
function updatePlayButtonState(isPlaying) {
  if (!audioButton) return;
  
  if (isPlaying) {
    audioButton.innerHTML = '<i class="fas fa-pause"></i>';
    audioButton.classList.add('playing');
  } else {
    audioButton.innerHTML = '<i class="fas fa-play"></i>';
    audioButton.classList.remove('playing');
  }
}

/**
 * Update progress bar based on current playback position
 * Uses custom song duration for accurate display
 */
function updateProgressBar() {
  if (!audioPlayer || !musicProgress) return;
  
  if (audioPlayer.duration) {
    // If current time exceeds the actual song duration
    if (audioPlayer.currentTime >= ACTUAL_SONG_DURATION) {
      // Reset to beginning and play again
      audioPlayer.currentTime = 0;
      playAudio();
      musicProgress.style.width = '0%';
      return;
    }
    
    // Calculate progress percentage based on actual duration
    const progressPercent = (audioPlayer.currentTime / ACTUAL_SONG_DURATION) * 100;
    
    // Limit to maximum of 100%
    const clampedProgress = Math.min(progressPercent, 100);
    
    musicProgress.style.width = clampedProgress + '%';
    
    // If near the end of the song
    if (audioPlayer.currentTime >= ACTUAL_SONG_DURATION - 1) {
      // Ensure the bar shows as completely full
      musicProgress.style.width = '100%';
    }
  }
}

/**
 * Attempt to autoplay music 
 * Simpler version that just tries once and sets up media session
 */
function attemptAutoPlay() {
  if (!audioPlayer) return;
  
  // Kiểm tra trạng thái mute trước
  const wasMuted = sessionStorage.getItem(AUDIO_IS_MUTED) === 'true';
  
  if (wasMuted) {
    console.log('[Persistent Audio] Autoplay skipped - user has previously muted audio');
    pauseAudio(true, false); // Tạm dừng nhưng không đặt trạng thái mute
    return;
  }
  
  // Set media session metadata for system integration
  setMediaMetadata();
    // Kiểm tra trước khi tăng bộ đếm
  if (autoPlayAttemptCount >= MAX_AUTOPLAY_ATTEMPTS) {
    console.log('[Persistent Audio] Max attempts reached - waiting for user interaction');
    return;
  }

  // Tăng bộ đếm lần thử
  autoPlayAttemptCount++;
  
  console.log(`[Persistent Audio] Attempting to autoplay music... (attempt ${autoPlayAttemptCount}/${MAX_AUTOPLAY_ATTEMPTS})`);
  
  // Cố gắng phát nhạc một cách đơn giản
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Autoplay successful');
      updatePlayButtonState(true);
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Autoplay blocked:', error);
      // Không cần thử lại ở đây - đã được xử lý bởi pause listener
    });
  }
}

/**
 * Set metadata for media session API
 * Enables system media controls integration
 */
function setMediaMetadata() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Mice on Venus',
      artist: 'C418',
      album: 'Minecraft Volume Alpha',
    });
    
    // Thêm các hành động điều khiển phương tiện
    navigator.mediaSession.setActionHandler('play', playAudio);
    navigator.mediaSession.setActionHandler('pause', () => pauseAudio());
    navigator.mediaSession.setActionHandler('stop', () => pauseAudio());
  }
}

/**
 * Reset audio state completely
 * Useful when debugging or when user wants to start fresh
 */
export function resetAudioState() {
  // Pause audio first
  if (audioPlayer && !audioPlayer.paused) {
    audioPlayer.pause();
  }
  
  // Remove all state from session storage
  sessionStorage.removeItem(AUDIO_IS_PLAYING);
  sessionStorage.removeItem(AUDIO_CURRENT_TIME);
  sessionStorage.removeItem(AUDIO_VOLUME);
  sessionStorage.removeItem(AUDIO_IS_MUTED);
  
  // Reset counters and state
  autoPlayAttemptCount = 0;
  
  if (audioPlayer) {
    audioPlayer.currentTime = 0;
    audioPlayer.volume = 0.5;
  }
  
  console.log('[Persistent Audio] State reset complete');
}

/**
 * Clean up all resources, event listeners, and timers
 * Call this when component or page unmounts
 */
export function cleanupPersistentAudio() {
  // Save state one last time
  saveAudioState();
  
  // Clear save state interval
  if (saveStateIntervalId) {
    clearInterval(saveStateIntervalId);
    saveStateIntervalId = null;
  }
  
  // Remove visibility change listener
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  
  // Remove beforeunload listener
  window.removeEventListener('beforeunload', saveAudioState);
  
  // Clean up metadata listeners
  cleanupMetadataListeners();
    // Xóa tất cả event listener tương tác người dùng còn sót lại
  USER_INTERACTION_EVENTS.forEach(eventType => {
    document.removeEventListener(eventType, () => {});
    // Mặc dù chúng ta đã dùng { once: true } nhưng vẫn nên loại bỏ event listener để đảm bảo
  });
    // Remove any media session handlers
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', null);
    navigator.mediaSession.setActionHandler('pause', null);
    navigator.mediaSession.setActionHandler('stop', null);
  }
  
  // Xóa bỏ listener từ elements nếu còn tồn tại
  if (audioPlayer) {
    audioPlayer.removeEventListener('timeupdate', updateProgressBar);
    
    // Xóa bỏ event ended với handler đã lưu
    if (audioPlayer._endedHandler) {
      audioPlayer.removeEventListener('ended', audioPlayer._endedHandler);
      delete audioPlayer._endedHandler;
    }
    
    // Không cần xóa bỏ pause listener vì chúng ta đang theo dõi nó
  }
  
  if (audioButton && audioButton._clickHandler) {
    audioButton.removeEventListener('click', audioButton._clickHandler);
    delete audioButton._clickHandler;
  }
  
  // Reset biến toàn cục
  autoPlayAttemptCount = 0;
  isInitialized = false;
  
  console.log('[Persistent Audio] Cleanup complete');
}