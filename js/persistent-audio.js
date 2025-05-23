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
  
  musicProgress.style.transition = 'width 0.15s ease';
}

function loadAudioState() {
  const isPlaying = sessionStorage.getItem(AUDIO_IS_PLAYING) === 'true';
  const currentTime = parseFloat(sessionStorage.getItem(AUDIO_CURRENT_TIME) || '0');
  const volume = parseFloat(sessionStorage.getItem(AUDIO_VOLUME) || '1');
  
  console.log('[Persistent Audio] Đang tải trạng thái:', { isPlaying, currentTime, volume });
  
  if (!audioPlayer) return;
  
  audioPlayer.volume = volume;
  
  if (!isNaN(currentTime) && currentTime > 0) {
    audioPlayer.currentTime = currentTime;
  }
  
  if (isPlaying) {
    playAudio();
  } else {
    pauseAudio(false); 
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
  
  const playPromise = audioPlayer.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      audioButton.innerHTML = '<i class="fas fa-pause"></i>';
      audioButton.classList.add('playing');
      saveAudioState();
    }).catch(error => {
      console.error('[Persistent Audio] Lỗi khi phát nhạc:', error);
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
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    musicProgress.style.width = progressPercent + '%';
  }
} 