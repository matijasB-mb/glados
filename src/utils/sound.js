/**
 * Web Audio API alert sounds — no external files needed.
 * All functions are silent on error (AudioContext may be blocked by browser).
 */

function ctx() {
  return new (window.AudioContext || window.webkitAudioContext)()
}

function tone(audioCtx, freq, startTime, duration, volume = 0.4, type = 'sine') {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, audioCtx.currentTime + startTime)
  gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration)
  osc.start(audioCtx.currentTime + startTime)
  osc.stop(audioCtx.currentTime + startTime + duration + 0.05)
}

/** Three ascending tones — new order alert for restaurant */
export function playOrderAlert() {
  try {
    const ac = ctx()
    tone(ac, 660,  0,    0.25)
    tone(ac, 880,  0.15, 0.25)
    tone(ac, 1100, 0.3,  0.45)
  } catch {}
}

/** Two tones — order ready alert for courier */
export function playReadyAlert() {
  try {
    const ac = ctx()
    tone(ac, 440, 0,   0.3)
    tone(ac, 550, 0.2, 0.4)
  } catch {}
}
