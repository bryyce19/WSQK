// app.js
const STREAM_URL = 'https://media-ssl.musicradio.com/WSQK';

const audio = document.getElementById('audio');
const btnPlay = document.getElementById('btn-play');
const btnRewind = document.getElementById('btn-rewind');
const btnForward = document.getElementById('btn-forward');
const progress = document.getElementById('progress');
const status = document.getElementById('status');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const artImg = document.getElementById('art-img');
const installBtn = document.getElementById('installBtn');

let isPlaying = false;
let deferredPrompt = null;

// Initialize audio
audio.src = STREAM_URL;
audio.preload = 'none';
audio.crossOrigin = "anonymous";
audio.volume = 1.0;
progress.value = 0;
status.textContent = 'Stopped';

// --- Play/Pause ---
async function togglePlay() {
  if (!isPlaying) {
    try {
      await audio.play();
      isPlaying = true;
      btnPlay.textContent = '▮▮';
      status.textContent = 'Playing';
      setMediaSession();
    } catch (err) {
      console.warn('Playback blocked:', err);
    }
  } else {
    audio.pause();
    isPlaying = false;
    btnPlay.textContent = '▶';
    status.textContent = 'Paused';
  }
}
btnPlay.addEventListener('click', togglePlay);

// Rewind / forward 15s
btnRewind.addEventListener('click', () => {
  try { audio.currentTime = Math.max(0, audio.currentTime - 15); } catch(e){}
});
btnForward.addEventListener('click', () => {
  try { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 15); } catch(e){}
});

// Progress animation for streams
audio.addEventListener('timeupdate', () => {
  if (audio.duration && isFinite(audio.duration)) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  } else {
    progress.value = (progress.value + 0.3) % 100;
  }
});

// Update UI on pause/play
audio.addEventListener('pause', () => {
  isPlaying = false;
  btnPlay.textContent = '▶';
  status.textContent = 'Paused';
});
audio.addEventListener('play', () => {
  isPlaying = true;
  btnPlay.textContent = '▮▮';
  status.textContent = 'Playing';
});

// Media Session API
function setMediaSession() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: titleEl.textContent || 'Stranger Things Radio',
      artist: subtitleEl.textContent || 'WSQK',
      album: 'Live Stream',
      artwork: [
        { src: artImg.src, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => audio.currentTime -= 10);
    navigator.mediaSession.setActionHandler('seekforward', () => audio.currentTime += 10);
  }
}

// Artwork click = toggle playback
document.getElementById('artwork').addEventListener('click', togglePlay);

// Install prompt (Android/desktop)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  } else {
    alert("To install: Safari → Share → Add to Home Screen");
  }
});
