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
  
  loadAudioState();
  
  window.addEventListener('beforeunload', saveAudioState);
  
  setInterval(saveAudioState, 1000);
  
  // Thêm event listeners để phát nhạc sau tương tác đầu tiên của người dùng
  document.addEventListener('click', () => {
    if (audioPlayer && audioPlayer.paused) {
      playAudio();
    }
  }, { once: true });
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
    playAudio();
  });
  
  musicProgress.style.transition = 'width 0.15s ease';
}

function loadAudioState() {
  const currentTime = parseFloat(sessionStorage.getItem(AUDIO_CURRENT_TIME) || '0');
  const volume = parseFloat(sessionStorage.getItem(AUDIO_VOLUME) || '0.5');
  
  console.log('[Persistent Audio] Đang tải trạng thái:', { autoPlay: true, currentTime, volume });
  
  if (!audioPlayer) return;
  
  audioPlayer.volume = volume;
  
  if (!isNaN(currentTime) && currentTime > 0) {
    audioPlayer.currentTime = currentTime;
  }
  
  // Thêm event listener khi metadata của audio đã load xong
  audioPlayer.addEventListener('loadedmetadata', () => {
    const minutes = Math.floor(audioPlayer.duration / 60);
    const seconds = Math.floor(audioPlayer.duration % 60);
    console.log(`[Persistent Audio] Bài hát đã tải, thời lượng: ${minutes}:${seconds < 10 ? '0' + seconds : seconds} (${audioPlayer.duration}s)`);
    
    // Thử phát nhạc khi metadata đã sẵn sàng
    attemptAutoPlay();
  });
  
  // Sự kiện khi trình duyệt chặn tự động phát
  audioPlayer.addEventListener('autoplay', () => {
    console.log('[Persistent Audio] Autoplay đã sẵn sàng');
  });
  
  // Bắt lỗi khi autoplay bị chặn
  audioPlayer.addEventListener('pause', () => {
    if (audioPlayer.currentTime === 0) {
      console.log('[Persistent Audio] Autoplay có thể đã bị chặn bởi trình duyệt');
    }
  });

  // Thử phát nhạc ngay lập tức
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
  
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      audioButton.innerHTML = '<i class="fas fa-pause"></i>';
      audioButton.classList.add('playing');
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Lỗi khi phát nhạc:', error);
      
      // Nếu lỗi là do người dùng chưa tương tác, thêm trình lắng nghe sự kiện
      const unlockAudio = () => {
        const playAgain = audioPlayer.play();
        if (playAgain) {
          playAgain.catch(e => console.error('[Persistent Audio] Lỗi phát lại:', e));
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
      
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('keydown', unlockAudio, { once: true });
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
    // Xác định độ dài thực của bài (Mice on Venus - chính xác 3 phút)
    const actualSongDuration = 155; // 155 giây (2 phút 35 giây)
    
    // Sử dụng thời gian thực tế thay vì audioPlayer.duration nếu duration lớn hơn
    const duration = (audioPlayer.duration > actualSongDuration) ? actualSongDuration : audioPlayer.duration;
    
    // Tính toán phần trăm tiến trình dựa trên thời gian thực
    const progressPercent = (audioPlayer.currentTime / duration) * 100;
    
    // Giới hạn tối đa là 100%
    const clampedProgress = Math.min(progressPercent, 100);
    
    musicProgress.style.width = clampedProgress + '%';
    
    // Reset thanh khi kết thúc bài
    if (audioPlayer.currentTime >= duration - 1) {
      // Nếu gần hết bài, đảm bảo thanh hiển thị đầy đủ
      musicProgress.style.width = '100%';
    }
  }
}

// Hàm cố gắng phát nhạc tự động với nhiều chiến lược
function attemptAutoPlay() {
  if (!audioPlayer) return;
  
  // Phát nhạc trực tiếp với âm lượng ban đầu (không giảm âm lượng)
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('[Persistent Audio] Tự động phát nhạc thành công');
      
      // Cập nhật giao diện
      audioButton.innerHTML = '<i class="fas fa-pause"></i>';
      audioButton.classList.add('playing');
      
    }).catch(error => {
      console.error('[Persistent Audio] Tự động phát bị chặn:', error);
      
      // Thêm click listener vào document để phát nhạc sau tương tác người dùng đầu tiên
      const playAfterInteraction = function() {
        playAudio();
        document.removeEventListener('click', playAfterInteraction);
        document.removeEventListener('keydown', playAfterInteraction);
        document.removeEventListener('touchstart', playAfterInteraction);
      };
      
      document.addEventListener('click', playAfterInteraction, { once: true });
      document.addEventListener('keydown', playAfterInteraction, { once: true });
      document.addEventListener('touchstart', playAfterInteraction, { once: true });
    });
  }
}