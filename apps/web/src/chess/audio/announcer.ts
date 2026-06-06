let voiceEnabled = true;
let voicesReady = false;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang.startsWith("en") && /samantha|google|natural|premium/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0]
  );
}

export function preloadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis || voicesReady) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesReady = true;
    return;
  }
  window.speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      voicesReady = true;
    },
    { once: true },
  );
}

export function setVoiceEnabled(enabled: boolean) {
  voiceEnabled = enabled;
  if (enabled) preloadVoices();
  if (!enabled) window.speechSynthesis?.cancel();
}

export function isVoiceEnabled() {
  return voiceEnabled;
}

export function speak(text: string) {
  if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

  preloadVoices();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;

  const preferred = pickVoice();
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
