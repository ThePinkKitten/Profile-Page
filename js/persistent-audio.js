// Audio elements
let audioPlayer = null;
let audioButton = null;
let musicProgress = null;
let progressContainer = null;
let audioUpdateInterval = null;
let isInitialized = false;

const AUDIO_IS_PLAYING = 'audio_isPlaying';
const AUDIO_CURRENT_TIME = 'audio_currentTime';
const AUDIO_VOLUME = 'audio_volume';

// Các loại sự kiện người dùng để mở khóa audio
const USER_INTERACTION_EVENTS = ['click', 'keydown', 'touchstart', 'mousemove', 'scroll'];

// Thời lượng thực tế của bài hát (2 phút 30 giây)
const ACTUAL_SONG_DURATION = 150; 

export function initPersistentAudio() {
  // Đảm bảo chỉ khởi tạo một lần
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('[Persistent Audio] Initializing');
  
  setupAudioElements();
  
  // Lắng nghe sự kiện khi người dùng quay lại tab
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Lưu trạng thái âm thanh khi tắt trang và định kỳ
  window.addEventListener('beforeunload', saveAudioState);
  setInterval(saveAudioState, 1000);
  
  // Đăng ký một lần duy nhất cho tất cả các sự kiện người dùng
  registerUserInteractionEvents();
  
  // Đảm bảo phát nhạc khi trang đã tải xong
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAudioAndPlay);
  } else {
    loadAudioAndPlay();
  }
}

// Đăng ký các sự kiện tương tác người dùng để phát nhạc
function registerUserInteractionEvents() {
  USER_INTERACTION_EVENTS.forEach(eventType => {
    document.addEventListener(eventType, handleFirstUserInteraction, { once: true });
  });
  
  // Đảm bảo âm thanh được phát sau khi tải sidebar
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (isAudioPaused()) {
        setTimeout(playAudio, 100);
      }
    });
  }
}

// Xử lý tương tác người dùng đầu tiên
function handleFirstUserInteraction() {
  if (isAudioPaused()) {
    console.log('[Persistent Audio] Tương tác người dùng phát hiện - phát nhạc');
    playAudio();
  }
  
  // Xóa các event listener khác vì đã xử lý tương tác đầu tiên
  USER_INTERACTION_EVENTS.forEach(eventType => {
    document.removeEventListener(eventType, handleFirstUserInteraction);
  });
}

// Xử lý khi người dùng quay lại tab
function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && isAudioPaused()) {
    playAudio();
  }
}

// Kiểm tra nhanh xem audio có đang tạm dừng không
function isAudioPaused() {
  return audioPlayer && audioPlayer.paused;
}

function loadAudioAndPlay() {
  loadAudioState();
  
  // Thử phát nhạc sau một khoảng thời gian ngắn để đảm bảo trang đã tải xong
  setTimeout(() => {
    if (isAudioPaused()) {
      attemptAutoPlay();
    }
  }, 500);
}

function setupAudioElements() {
  audioButton = document.getElementById('audioButton');
  audioPlayer = document.getElementById('bgMusic');
  musicProgress = document.getElementById('musicProgress');
  progressContainer = document.querySelector('.progress-container');

  if (!audioButton || !audioPlayer || !musicProgress || !progressContainer) {
    console.error('[Persistent Audio] Không tìm thấy phần tử audio');
    return;
  }

  // Sự kiện cho nút bấm phát/dừng
  audioButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  // Sự kiện cho thanh tiến trình
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

  // Cập nhật thanh tiến trình
  audioPlayer.addEventListener('timeupdate', updateProgressBar);
  
  // Xử lý khi bài hát kết thúc
  audioPlayer.addEventListener('ended', () => {
    audioPlayer.currentTime = 0;
    musicProgress.style.width = '0%';
    playAudio();
  });
  
  // Hiệu ứng chuyển động mềm cho thanh tiến trình
  musicProgress.style.transition = 'width 0.15s ease';
}

function loadAudioState() {
  const currentTime = parseFloat(sessionStorage.getItem(AUDIO_CURRENT_TIME) || '0');
  const volume = parseFloat(sessionStorage.getItem(AUDIO_VOLUME) || '0.5');
  const wasPlaying = sessionStorage.getItem(AUDIO_IS_PLAYING) === 'true';
  
  console.log('[Persistent Audio] Đang tải trạng thái:', { autoPlay: true, currentTime, volume, wasPlaying });
  
  if (!audioPlayer) return;
  
  // Đặt âm lượng và thời gian phát
  audioPlayer.volume = volume;
  
  if (!isNaN(currentTime) && currentTime > 0) {
    audioPlayer.currentTime = currentTime;
  }
  
  // Xóa event listener cũ nếu có
  cleanupMetadataListeners();
  
  // Thêm event listener khi metadata của audio đã load xong
  const metadataListener = handleMetadataLoaded;
  
  // Lưu listener để có thể xóa sau này
  audioPlayer._loadedMetadataListeners = [metadataListener];
  audioPlayer.addEventListener('loadedmetadata', metadataListener);
  
  // Bắt lỗi khi autoplay bị chặn
  audioPlayer.addEventListener('pause', () => {
    if (audioPlayer.currentTime === 0) {
      console.log('[Persistent Audio] Autoplay có thể đã bị chặn bởi trình duyệt');
      
      // Thử phát lại sau khi bị trình duyệt chặn
      setTimeout(() => {
        if (isAudioPaused()) {
          attemptAutoPlay();
        }
      }, 1000);
    }
  });

  // Thử phát nhạc ngay lập tức nếu metadata đã sẵn sàng
  if (audioPlayer.duration) {
    attemptAutoPlay();
  }
}

function cleanupMetadataListeners() {
  if (!audioPlayer) return;
  
  const oldLoadedMetadataListeners = audioPlayer._loadedMetadataListeners || [];
  oldLoadedMetadataListeners.forEach(listener => {
    audioPlayer.removeEventListener('loadedmetadata', listener);
  });
}

function handleMetadataLoaded() {
  const minutes = Math.floor(audioPlayer.duration / 60);
  const seconds = Math.floor(audioPlayer.duration % 60);
  console.log(`[Persistent Audio] Bài hát đã tải, thời lượng: ${minutes}:${seconds < 10 ? '0' + seconds : seconds} (${audioPlayer.duration}s)`);
  
  // Thử phát nhạc khi metadata đã sẵn sàng
  attemptAutoPlay();
}

function saveAudioState() {
  if (!audioPlayer) return;
  
  const isPlaying = !audioPlayer.paused;
  sessionStorage.setItem(AUDIO_IS_PLAYING, isPlaying.toString());
  sessionStorage.setItem(AUDIO_CURRENT_TIME, audioPlayer.currentTime.toString());
  sessionStorage.setItem(AUDIO_VOLUME, audioPlayer.volume.toString());
}

function toggleAudio() {
  if (!audioPlayer) return;
  
  if (audioPlayer.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function playAudio() {
  if (!audioPlayer || !audioButton) return;
  
  console.log('[Persistent Audio] Đang phát nhạc...');
  
  // Đảm bảo âm thanh không bị tắt
  audioPlayer.muted = false;
  
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Phát nhạc thành công');
      updatePlayButtonState(true);
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Lỗi khi phát nhạc:', error);
      
      // Đăng ký lại các sự kiện người dùng để phát nhạc
      const unlockAudio = () => {
        console.log('[Persistent Audio] Đã phát hiện tương tác người dùng, thử phát lại');
        const playAgain = audioPlayer.play();
        if (playAgain) {
          playAgain.then(() => {
            console.log('[Persistent Audio] Phát lại sau tương tác thành công');
            updatePlayButtonState(true);
          }).catch(e => {
            console.error('[Persistent Audio] Lỗi phát lại:', e);
          });
        }
        
        // Xóa tất cả event listeners
        USER_INTERACTION_EVENTS.forEach(evt => {
          document.removeEventListener(evt, unlockAudio);
        });
      };
      
      // Thêm event listeners với once: true
      USER_INTERACTION_EVENTS.forEach(evt => {
        document.addEventListener(evt, unlockAudio, { once: true });
      });
      
      // Thử phát lại sau 1 giây
      setTimeout(() => {
        if (isAudioPaused()) {
          playAudio();
        }
      }, 1000);
    });
  }
}

function pauseAudio(saveState = true) {
  if (!audioPlayer || !audioButton) return;
  
  audioPlayer.pause();
  updatePlayButtonState(false);
  
  if (saveState) {
    saveAudioState();
  }
}

// Cập nhật trạng thái nút phát/dừng
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

function updateProgressBar() {
  if (!audioPlayer || !musicProgress) return;
  
  if (audioPlayer.duration) {
    // Nếu phát hiện thời gian hiện tại vượt quá thời gian thực của bài
    if (audioPlayer.currentTime >= ACTUAL_SONG_DURATION) {
      // Reset lại thời gian chạy về 0 và phát lại
      audioPlayer.currentTime = 0;
      playAudio();
      musicProgress.style.width = '0%';
      return;
    }
    
    // Tính toán phần trăm tiến trình dựa trên thời gian thực
    const progressPercent = (audioPlayer.currentTime / ACTUAL_SONG_DURATION) * 100;
    
    // Giới hạn tối đa là 100%
    const clampedProgress = Math.min(progressPercent, 100);
    
    musicProgress.style.width = clampedProgress + '%';
    
    // Nếu gần kết thúc bài
    if (audioPlayer.currentTime >= ACTUAL_SONG_DURATION - 1) {
      // Đảm bảo thanh hiển thị đầy đủ
      musicProgress.style.width = '100%';
    }
  }
}

// Hàm cố gắng phát nhạc tự động với nhiều chiến lược
function attemptAutoPlay() {
  if (!audioPlayer) return;
  
  console.log('[Persistent Audio] Đang cố gắng tự động phát nhạc...');
  
  // Đặt media session metadata
  setMediaMetadata();
  
  // Phát nhạc trực tiếp
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Tự động phát nhạc thành công');
      updatePlayButtonState(true);
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Tự động phát bị chặn:', error);
      
      // Thử lại sau khi người dùng tương tác
      USER_INTERACTION_EVENTS.forEach(evt => {
        document.addEventListener(evt, () => {
          if (isAudioPaused()) playAudio();
        }, { once: true });
      });
      
      // Thử phát lại sau một khoảng thời gian ngắn
      setTimeout(() => {
        if (isAudioPaused()) {
          playAudio();
        }
      }, 1000);
    });
  }
}

// Đặt metadata cho media session API
function setMediaMetadata() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Mice on Venus',
      artist: 'C418',
      album: 'Minecraft Volume Alpha',
    });
  }
}