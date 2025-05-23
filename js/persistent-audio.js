// Audio elements
let audioPlayer = null;
let audioButton = null;
let musicProgress = null;
let progressContainer = null;
let audioUpdateInterval = null;

const AUDIO_IS_PLAYING = 'audio_isPlaying';
const AUDIO_CURRENT_TIME = 'audio_currentTime';
const AUDIO_VOLUME = 'audio_volume';

export function initPersistentAudio() {
  console.log('[Persistent Audio] Initializing');
  
  setupAudioElements();
  
  // Sự kiện visibilitychange giúp phát nhạc khi người dùng quay lại tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && audioPlayer && audioPlayer.paused) {
      playAudio();
    }
  });
  
  // Sự kiện DOMContentLoaded đảm bảo phát nhạc khi trang đã tải xong
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadAudioAndPlay());
  } else {
    loadAudioAndPlay();
  }
  
  // Lưu trạng thái âm thanh khi tắt trang
  window.addEventListener('beforeunload', saveAudioState);
  
  // Lưu trạng thái âm thanh định kỳ
  setInterval(saveAudioState, 1000);
  
  // Thêm nhiều event listeners để phát nhạc sau tương tác đầu tiên của người dùng
  ['click', 'keydown', 'touchstart', 'mousemove'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      if (audioPlayer && audioPlayer.paused) {
        playAudio();
      }
    }, { once: true });
  });
  
  // Đảm bảo âm thanh được phát sau khi tải sidebar
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (audioPlayer && audioPlayer.paused) {
        setTimeout(playAudio, 100);
      }
    });
  }
}

function loadAudioAndPlay() {
  loadAudioState();
  
  // Thử phát nhạc sau một khoảng thời gian ngắn để đảm bảo trang đã tải xong
  setTimeout(() => {
    if (audioPlayer && audioPlayer.paused) {
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

  audioButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

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

  audioPlayer.addEventListener('timeupdate', updateProgressBar);
  
  // Thêm event listener cho việc kết thúc bài hát
  audioPlayer.addEventListener('ended', () => {
    // Khi bài hát kết thúc, reset về đầu và phát lại
    audioPlayer.currentTime = 0;
    musicProgress.style.width = '0%';
    playAudio();
  });
  
  // Thêm event listener cho khi thời gian của bài hát thay đổi quá lớn
  audioPlayer.addEventListener('timeupdate', () => {
    const actualSongDuration = 135; // 2 phút 15 giây
    if (audioPlayer.currentTime > actualSongDuration) {
      audioPlayer.currentTime = 0;
      musicProgress.style.width = '0%';
      playAudio();
    }
  });
  
  musicProgress.style.transition = 'width 0.15s ease';
}

function loadAudioState() {
  const currentTime = parseFloat(sessionStorage.getItem(AUDIO_CURRENT_TIME) || '0');
  const volume = parseFloat(sessionStorage.getItem(AUDIO_VOLUME) || '0.5');
  const wasPlaying = sessionStorage.getItem(AUDIO_IS_PLAYING) === 'true';
  
  console.log('[Persistent Audio] Đang tải trạng thái:', { autoPlay: true, currentTime, volume, wasPlaying });
  
  if (!audioPlayer) return;
  
  // Đặt âm lượng
  audioPlayer.volume = volume;
  
  // Đặt thời gian phát
  if (!isNaN(currentTime) && currentTime > 0) {
    audioPlayer.currentTime = currentTime;
  }
  
  // Xóa event listener cũ nếu có
  const oldLoadedMetadataListeners = audioPlayer._loadedMetadataListeners || [];
  oldLoadedMetadataListeners.forEach(listener => {
    audioPlayer.removeEventListener('loadedmetadata', listener);
  });
  
  // Tạo listener mới
  const metadataListener = () => {
    const minutes = Math.floor(audioPlayer.duration / 60);
    const seconds = Math.floor(audioPlayer.duration % 60);
    console.log(`[Persistent Audio] Bài hát đã tải, thời lượng: ${minutes}:${seconds < 10 ? '0' + seconds : seconds} (${audioPlayer.duration}s)`);
    
    // Thử phát nhạc khi metadata đã sẵn sàng
    attemptAutoPlay();
  };
  
  // Lưu listener để có thể xóa sau này
  audioPlayer._loadedMetadataListeners = [metadataListener];
  
  // Thêm event listener khi metadata của audio đã load xong
  audioPlayer.addEventListener('loadedmetadata', metadataListener);
  
  // Sự kiện khi trình duyệt chặn tự động phát
  audioPlayer.addEventListener('autoplay', () => {
    console.log('[Persistent Audio] Autoplay đã sẵn sàng');
  });
  
  // Bắt lỗi khi autoplay bị chặn
  audioPlayer.addEventListener('pause', () => {
    if (audioPlayer.currentTime === 0) {
      console.log('[Persistent Audio] Autoplay có thể đã bị chặn bởi trình duyệt');
      
      // Thử phát lại sau khi bị trình duyệt chặn
      setTimeout(() => {
        if (audioPlayer && audioPlayer.paused) {
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
  
  // Đặt thuộc tính muted = false để đảm bảo âm thanh không bị tắt
  audioPlayer.muted = false;
  
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Phát nhạc thành công');
      audioButton.innerHTML = '<i class="fas fa-pause"></i>';
      audioButton.classList.add('playing');
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Lỗi khi phát nhạc:', error);
      
      // Nếu lỗi là do người dùng chưa tương tác, thêm nhiều loại trình lắng nghe sự kiện
      const unlockAudio = () => {
        console.log('[Persistent Audio] Đã phát hiện tương tác người dùng, thử phát lại');
        const playAgain = audioPlayer.play();
        if (playAgain) {
          playAgain.then(() => {
            console.log('[Persistent Audio] Phát lại sau tương tác thành công');
            audioButton.innerHTML = '<i class="fas fa-pause"></i>';
            audioButton.classList.add('playing');
          }).catch(e => {
            console.error('[Persistent Audio] Lỗi phát lại:', e);
          });
        }
        
        // Xóa tất cả event listeners
        ['click', 'touchstart', 'keydown', 'mousemove', 'scroll'].forEach(evt => {
          document.removeEventListener(evt, unlockAudio);
        });
      };
      
      // Thêm nhiều event listeners với once: true
      ['click', 'touchstart', 'keydown', 'mousemove', 'scroll'].forEach(evt => {
        document.addEventListener(evt, unlockAudio, { once: true });
      });
      
      // Thử phát lại sau 1 giây
      setTimeout(() => {
        if (audioPlayer && audioPlayer.paused) {
          playAudio();
        }
      }, 1000);
    });
  }
}

function pauseAudio(saveState = true) {
  if (!audioPlayer || !audioButton) return;
  
  audioPlayer.pause();
  audioButton.innerHTML = '<i class="fas fa-play"></i>';
  audioButton.classList.remove('playing');
  
  if (saveState) {
    saveAudioState();
  }
}

function updateProgressBar() {
  if (!audioPlayer || !musicProgress) return;
  
  if (audioPlayer.duration) {
    // Xác định độ dài thực của bài (Mice on Venus - chính xác 2 phút 15 giây)
    const actualSongDuration = 135; // 135 giây (2 phút 15 giây)
    
    // Nếu phát hiện thời gian hiện tại vượt quá thời gian thực của bài
    if (audioPlayer.currentTime >= actualSongDuration) {
      // Reset lại thời gian chạy về 0 và phát lại
      audioPlayer.currentTime = 0;
      playAudio();
      musicProgress.style.width = '0%';
      return;
    }
    
    // Luôn sử dụng thời gian thực tế
    const duration = actualSongDuration;
    
    // Tính toán phần trăm tiến trình dựa trên thời gian thực
    const progressPercent = (audioPlayer.currentTime / duration) * 100;
    
    // Giới hạn tối đa là 100%
    const clampedProgress = Math.min(progressPercent, 100);
    
    musicProgress.style.width = clampedProgress + '%';
    
    // Nếu gần kết thúc bài
    if (audioPlayer.currentTime >= duration - 1) {
      // Đảm bảo thanh hiển thị đầy đủ
      musicProgress.style.width = '100%';
    }
  }
}

// Hàm cố gắng phát nhạc tự động với nhiều chiến lược và buộc phát nhạc
function attemptAutoPlay() {
  if (!audioPlayer) return;
  
  console.log('[Persistent Audio] Đang cố gắng tự động phát nhạc...');
  
  // Đảm bảo media session metadata được đặt
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Mice on Venus',
      artist: 'C418',
      album: 'Minecraft Volume Alpha',
    });
  }
  
  // Phát nhạc trực tiếp với âm lượng ban đầu
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Tự động phát nhạc thành công');
      
      // Cập nhật giao diện
      audioButton.innerHTML = '<i class="fas fa-pause"></i>';
      audioButton.classList.add('playing');
      
      // Lưu trạng thái đang phát
      saveAudioState();
      
    }).catch(error => {
      console.error('[Persistent Audio] Tự động phát bị chặn:', error);
      
      // Thêm nhiều loại event listener để đảm bảo âm thanh được phát sau tương tác đầu tiên
      const playAfterInteraction = function() {
        console.log('[Persistent Audio] Tương tác người dùng phát hiện - phát nhạc');
        playAudio();
        document.removeEventListener('click', playAfterInteraction);
        document.removeEventListener('keydown', playAfterInteraction);
        document.removeEventListener('touchstart', playAfterInteraction);
        document.removeEventListener('mousemove', playAfterInteraction);
        document.removeEventListener('scroll', playAfterInteraction);
      };
      
      // Thêm nhiều event để tăng khả năng phát nhạc thành công
      document.addEventListener('click', playAfterInteraction, { once: true });
      document.addEventListener('keydown', playAfterInteraction, { once: true });
      document.addEventListener('touchstart', playAfterInteraction, { once: true });
      document.addEventListener('mousemove', playAfterInteraction, { once: true });
      document.addEventListener('scroll', playAfterInteraction, { once: true });
      
      // Thử phát lại sau một khoảng thời gian ngắn
      setTimeout(() => {
        if (audioPlayer && audioPlayer.paused) {
          playAudio();
        }
      }, 1000);
    });
  }
}