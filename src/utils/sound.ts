import notificationSoundUrl from '../assets/notification1.mp3';

let audioCtx: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;

export const unlockAudio = async () => {
  if (audioCtx) return;
  audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
  try {
    const res = await fetch(notificationSoundUrl);
    const arrayBuffer = await res.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    // audio preload failed silently
  }
};

export const playNotificationSound = async () => {
  if (audioCtx && audioBuffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
    return;
  }

  try {
    const audio = new Audio(notificationSoundUrl);
    audio.volume = 0.5;
    await audio.play();
  } catch {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Order!", {
        body: "You have a new order",
        icon: "/logo.png",
      });
    }
  }
};