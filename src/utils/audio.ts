/**
 * Audio synthesis engine for CozyDesk using Web Audio API
 */

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;
let rainGainNode: GainNode | null = null;
let rainSource: AudioBufferSourceNode | null = null;
let loFiInterval: number | null = null;
let isLoFiPlaying = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioClass) {
      audioCtx = new AudioClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean): void {
  isAudioMuted = muted;
  if (muted && isLoFiPlaying) {
    stopLoFi();
  }
  if (muted && rainGainNode && audioCtx) {
    rainGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  }
}

export function getIsAudioMuted(): boolean {
  return isAudioMuted;
}

export function playChime(
  freq = 440,
  type: OscillatorType = 'sine',
  duration = 0.18,
  volume = 0.08
): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Gracefully handle browser autoplay policies
  }
}

export function playWinFanfare(): void {
  if (isAudioMuted) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playChime(freq, 'triangle', 0.25, 0.12);
    }, idx * 90);
  });
}

export function playLampFlickerSound(turningOn: boolean): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Vintage tactile switch mechanical click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(turningOn ? 280 : 180, now);
    clickOsc.frequency.exponentialRampToValueAtTime(turningOn ? 440 : 90, now + 0.05);
    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    if (turningOn) {
      // Filament warmth and electrical stutter ticks
      const sparks = [0.08, 0.16, 0.26, 0.42];
      sparks.forEach((delay, idx) => {
        setTimeout(() => {
          if (isAudioMuted) return;
          try {
            const actx = getAudioContext();
            if (!actx) return;
            const t = actx.currentTime;
            const sparkOsc = actx.createOscillator();
            const sparkGain = actx.createGain();
            sparkOsc.type = 'sine';
            sparkOsc.frequency.setValueAtTime(400 + idx * 90, t);
            sparkGain.gain.setValueAtTime(0.045 - idx * 0.007, t);
            sparkGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
            sparkOsc.connect(sparkGain);
            sparkGain.connect(actx.destination);
            sparkOsc.start(t);
            sparkOsc.stop(t + 0.04);
          } catch {}
        }, delay * 1000);
      });
    } else {
      // Filament dying discharge decay
      setTimeout(() => {
        if (isAudioMuted) return;
        try {
          const actx = getAudioContext();
          if (!actx) return;
          const t = actx.currentTime;
          const hum = actx.createOscillator();
          const humGain = actx.createGain();
          hum.type = 'sine';
          hum.frequency.setValueAtTime(160, t);
          hum.frequency.exponentialRampToValueAtTime(45, t + 0.14);
          humGain.gain.setValueAtTime(0.05, t);
          humGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          hum.connect(humGain);
          humGain.connect(actx.destination);
          hum.start(t);
          hum.stop(t + 0.14);
        } catch {}
      }, 40);
    }
  } catch {}
}

export function playWaterSipSound(): void {
  playCoffeeSipSound();
}

export function playDropSound(): void {
  playWaterTrickleSound();
}

/**
 * Procedural Mechanical Keyboard & Switch Click Generator
 */
export function playMechanicalClick(
  variant: 'key' | 'switch' | 'toggle' | 'subtle' = 'key',
  volume = 0.07
): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (variant === 'switch') {
      // Dual-action rocker switch metallic latch
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.04);
      gain1.gain.setValueAtTime(volume * 1.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.04);

      setTimeout(() => {
        if (isAudioMuted) return;
        const actx = getAudioContext();
        if (!actx) return;
        const t = actx.currentTime;
        const osc2 = actx.createOscillator();
        const gain2 = actx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(680, t);
        osc2.frequency.exponentialRampToValueAtTime(220, t + 0.03);
        gain2.gain.setValueAtTime(volume * 0.9, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc2.connect(gain2);
        gain2.connect(actx.destination);
        osc2.start(t);
        osc2.stop(t + 0.03);
      }, 12);
      return;
    }

    if (variant === 'toggle') {
      // Tactile microswitch latch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.035);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
      return;
    }

    if (variant === 'subtle') {
      // Soft micro click for UI tabs & chips
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);
      gain.gain.setValueAtTime(volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
      return;
    }

    // Default 'key': Snappy mechanical keyboard switch (transient click + bottom-out clack)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.03);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    // Filtered noise burst for tactile switch snap
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.Q.setValueAtTime(3, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
    noiseSource.start(now);
    noiseSource.stop(now + 0.015);
  } catch {}
}

/**
 * Organic Paper Rustle & Crinkle Synthesizer
 */
export function playPaperRustleSound(
  variant: 'lift' | 'drop' | 'scribble' | 'flutter' = 'lift',
  volume = 0.08
): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = variant === 'drop' ? 0.07 : variant === 'scribble' ? 0.14 : 0.11;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const noise = Math.random() * 2 - 1;
      const envelope =
        variant === 'lift'
          ? Math.sin(progress * Math.PI) * (1 - progress * 0.3)
          : variant === 'drop'
          ? Math.exp(-progress * 5)
          : variant === 'scribble'
          ? Math.sin(progress * Math.PI * 4) * Math.exp(-progress * 2)
          : Math.sin(progress * Math.PI);
      data[i] = noise * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Highpass filter for crisp paper fibers
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(variant === 'scribble' ? 3400 : 2600, now);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(variant === 'drop' ? 3200 : 4800, now);
    bandpass.Q.setValueAtTime(1.5, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);
  } catch {}
}

/**
 * Wooden / Solid Desk Mat Thud
 */
export function playWoodThudSound(pitch = 180, volume = 0.07): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}

/**
 * Ceramic Coffee Mug Clink / Table Contact
 */
export function playCeramicClinkSound(volume = 0.07): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Resonant porcelain frequencies
    const freqs = [1420, 2180];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume * (idx === 0 ? 1 : 0.6), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    });

    // Subsurface wood contact
    playWoodThudSound(190, volume * 0.8);
  } catch {}
}

/**
 * Desk Dragging Surface Friction (Felt Mat sliding)
 */
let lastSlideTime = 0;
export function playDeskSlideSound(volume = 0.025): void {
  if (isAudioMuted) return;
  const nowMs = Date.now();
  if (nowMs - lastSlideTime < 85) return; // Rate-limit to prevent audio stutter
  lastSlideTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.055;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);
  } catch {}
}

/**
 * Soft Ambient Item Hums (Cassette Tape, Steam, Equipment)
 */
export function playSoftHum(
  variant: 'cassette' | 'steam' | 'electronic' = 'electronic',
  duration = 0.4,
  volume = 0.035
): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (variant === 'steam') {
      // Warm coffee vapor hiss
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2100, now);
      filter.Q.setValueAtTime(1.2, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
      source.stop(now + duration);
      return;
    }

    if (variant === 'cassette') {
      // Tape capstan motor spin & magnetic head engagement
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(145, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(90, now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
      return;
    }

    // Default 'electronic' hum (smooth 60Hz/120Hz transformer tone)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    gain.gain.setValueAtTime(volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch {}
}

/**
 * Corkboard Bulletin Pushpin Tack Sound
 */
export function playPinTackSound(volume = 0.08): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Metallic pin entry
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);

    // Cork fiber penetration
    playPaperRustleSound('drop', volume * 0.7);
  } catch {}
}

/**
 * Corkboard Emoji Reaction Rubber Stamp Thud
 */
export function playStampSound(volume = 0.09): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.055);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);

    setTimeout(() => {
      playPaperRustleSound('drop', volume * 0.6);
    }, 15);
  } catch {}
}

/**
 * Coffee Mug Sip & Swirl
 */
export function playCoffeeSipSound(): void {
  if (isAudioMuted) return;
  playCeramicClinkSound(0.05);
  playChime(340, 'sine', 0.09, 0.06);
  setTimeout(() => {
    playChime(460, 'sine', 0.12, 0.05);
    playSoftHum('steam', 0.25, 0.03);
  }, 70);
}

/**
 * Fresh Coffee Pour & Brew Stream
 */
export function playCoffeePourSound(volume = 0.07): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.65;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const p = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.frequency.exponentialRampToValueAtTime(1150, now + duration);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);

    // Subtle liquid bubbling pitches
    const bubblePitches = [380, 520, 680, 840];
    bubblePitches.forEach((freq, idx) => {
      setTimeout(() => {
        playChime(freq, 'sine', 0.06, 0.03);
      }, 100 + idx * 120);
    });
  } catch {}
}

/**
 * Metal Spoon Stirring in Ceramic Mug
 */
export function playSpoonStirSound(volume = 0.06): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Rhythmic spoon clinks against ceramic wall
    const clinks = [
      { delay: 0, freq: 1780 },
      { delay: 110, freq: 2150 },
      { delay: 230, freq: 1920 },
      { delay: 360, freq: 1680 },
    ];

    clinks.forEach(({ delay, freq }, idx) => {
      setTimeout(() => {
        if (isAudioMuted) return;
        const actx = getAudioContext();
        if (!actx) return;
        const t = actx.currentTime;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.04);
        gain.gain.setValueAtTime(volume * (idx % 2 === 0 ? 0.9 : 0.6), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      }, delay);
    });

    // Gentle liquid vortex swirl noise
    playSoftHum('steam', 0.45, 0.02);
  } catch {}
}

/**
 * Sugar Cube Plop & Dissolve Fizz
 */
export function playSugarPlopSound(volume = 0.06): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.06);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);

    // Micro effervescence
    setTimeout(() => {
      playSoftHum('steam', 0.2, 0.02);
    }, 60);
  } catch {}
}

/**
 * Succulent Water Droplets & Moisture Trickle
 */
export function playWaterTrickleSound(): void {
  if (isAudioMuted) return;
  playChime(760, 'sine', 0.07, 0.07);
  setTimeout(() => playChime(920, 'sine', 0.09, 0.06), 45);
  setTimeout(() => playChime(1120, 'sine', 0.11, 0.04), 95);
  setTimeout(() => playPaperRustleSound('flutter', 0.04), 80);
}

/**
 * Organic Foliage / Succulent Leaf Rustle Sound
 */
export function playLeafRustleSound(volume = 0.06): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.16;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.2);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2200, now);
    bandpass.Q.setValueAtTime(1.2, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);

    // Subtle gentle chime harmonic on foliage contact
    setTimeout(() => {
      playChime(620 + Math.random() * 120, 'sine', 0.08, volume * 0.35);
    }, 30);
  } catch {}
}

/**
 * Fine Aerosol Plant Mister Spray Spritz Sound
 */
export function playPlantMistSound(volume = 0.06): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.24;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = progress < 0.15 ? progress / 0.15 : Math.exp(-(progress - 0.15) * 4);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(3200, now);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(4800, now);
    bandpass.frequency.exponentialRampToValueAtTime(2800, now + duration);
    bandpass.Q.setValueAtTime(1.4, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.9, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);

    setTimeout(() => {
      playChime(1080, 'sine', 0.06, volume * 0.4);
      setTimeout(() => playChime(1340, 'sine', 0.05, volume * 0.3), 35);
    }, 60);
  } catch {}
}

/**
 * Retro Pixel Grid Dot / Pencil / Eraser Sound
 */
export function playPixelDotSound(colorIdx = 0, isEraser = false, volume = 0.05): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (isEraser) {
      const duration = 0.04;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + duration);
      return;
    }

    const pentatonicScale = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.0, // A5
      1046.5, // C6
      1174.66, // D6
      1318.51, // E6
    ];
    const freq = pentatonicScale[Math.abs(colorIdx) % pentatonicScale.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.035);

    gain.gain.setValueAtTime(volume * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.038);
  } catch {}
}

/**
 * Cassette Deck Transport Engage Click
 */
export function playCassetteClick(): void {
  if (isAudioMuted) return;
  playMechanicalClick('switch', 0.09);
  setTimeout(() => {
    playSoftHum('cassette', 0.35, 0.05);
  }, 50);
}

/**
 * Pixel Pet 8-Bit Chiptune Voice & Blip
 */
export function play8BitChirp(mood: 'happy' | 'eat' | 'pet' | 'chirp' = 'happy'): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs =
      mood === 'eat'
        ? [380, 520, 680]
        : mood === 'pet'
        ? [650, 780, 920, 1100]
        : mood === 'chirp'
        ? [880, 1320]
        : [587, 740, 880];

    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (isAudioMuted) return;
        const actx = getAudioContext();
        if (!actx) return;
        const t = actx.currentTime;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      }, idx * 55);
    });
  } catch {}
}

/**
 * Intelligent Tactile Pickup Sound per Widget Type
 */
export function playItemPickupSound(widgetId: string): void {
  if (isAudioMuted) return;
  if (widgetId.includes('sticky')) {
    playPaperRustleSound('lift', 0.09);
  } else if (widgetId.includes('coffee')) {
    playCeramicClinkSound(0.05);
  } else if (widgetId.includes('plant')) {
    playWoodThudSound(210, 0.06);
  } else if (widgetId.includes('lamp')) {
    playWoodThudSound(140, 0.08);
  } else if (widgetId.includes('boombox') || widgetId.includes('tictactoe')) {
    playMechanicalClick('toggle', 0.06);
  } else if (widgetId.includes('pet')) {
    play8BitChirp('chirp');
  } else {
    playWoodThudSound(180, 0.05);
  }
}

/**
 * Intelligent Tactile Drop & Settle Sound per Widget Type
 */
export function playItemDropSound(widgetId: string): void {
  if (isAudioMuted) return;
  if (widgetId.includes('sticky')) {
    playPaperRustleSound('drop', 0.08);
  } else if (widgetId.includes('coffee')) {
    playCeramicClinkSound(0.08);
  } else if (widgetId.includes('plant')) {
    playWoodThudSound(170, 0.09);
  } else if (widgetId.includes('lamp')) {
    playWoodThudSound(115, 0.1);
  } else if (widgetId.includes('boombox')) {
    playWoodThudSound(160, 0.08);
  } else if (widgetId.includes('tictactoe') || widgetId.includes('pomodoro')) {
    playWoodThudSound(190, 0.07);
  } else if (widgetId.includes('pet')) {
    playMechanicalClick('subtle', 0.06);
  } else {
    playWoodThudSound(180, 0.06);
  }
}

let lastHoverTime = 0;

/**
 * Soft, low-volume hover sound effect for interactive desk widgets
 */
export function playWidgetHoverSound(
  targetOrVolume: string | number = 'general',
  volumeOrPitch?: number,
  customFreq?: number
): void {
  if (isAudioMuted) return;
  const nowMs = Date.now();
  if (nowMs - lastHoverTime < 65) return; // Prevent audio flutter/stutter
  lastHoverTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  const isNumericFirstArg = typeof targetOrVolume === 'number';
  const widgetId = isNumericFirstArg ? 'general' : targetOrVolume;
  const volume = isNumericFirstArg ? targetOrVolume : (volumeOrPitch ?? 0.02);
  const explicitPitch = isNumericFirstArg ? volumeOrPitch : customFreq;

  try {
    const now = ctx.currentTime;

    // Harmonious, soft, warm pitch tuned to the widget's tactile aesthetic
    let baseFreq = explicitPitch ?? 587.33; // D5 - warm neutral chime
    if (!explicitPitch) {
      if (widgetId?.includes('sticky')) {
        baseFreq = 659.25; // E5 - delicate paper note
      } else if (widgetId?.includes('coffee')) {
        baseFreq = 783.99; // G5 - soft ceramic harmonic
      } else if (widgetId?.includes('plant')) {
        baseFreq = 523.25; // C5 - organic chime
      } else if (widgetId?.includes('lamp')) {
        baseFreq = 698.46; // F5 - gentle filament warmth
      } else if (widgetId?.includes('pet')) {
        baseFreq = 880.00; // A5 - cute micro-chirp
      } else if (widgetId?.includes('pomodoro') || widgetId?.includes('clock')) {
        baseFreq = 587.33; // D5 - gentle clock harmonic
      } else if (widgetId?.includes('boombox') || widgetId?.includes('tictactoe')) {
        baseFreq = 622.25; // Eb5 - retro tech tone
      } else if (widgetId?.includes('window') || widgetId?.includes('sky')) {
        baseFreq = 739.99; // F#5 - ethereal starlight tone
      }
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.06, now + 0.04);

    // Soft, smooth attack (6ms) prevents click/pop artifacts, fast exponential decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.048);
  } catch {}
}

export const playHoverSound = playWidgetHoverSound;

// Lo-Fi Tracks Library with Authentic Jazz / Neo-Soul Chords and Melodies
export interface LoFiTrackData {
  key: string;
  name: string;
  bpm: number;
  genre: string;
  chords: number[][];
  melodyNotes: number[];
}

export const LOFI_TRACKS: Record<string, LoFiTrackData> = {
  tokyo: {
    key: 'tokyo',
    name: 'TOKYO RAIN',
    bpm: 74,
    genre: 'Neo-Soul Lo-Fi',
    chords: [
      // D#m9 (Eb2, Eb4, Gb4, Bb4, Db5, F5)
      [155.56, 311.13, 369.99, 466.16, 554.37, 698.46],
      // Bmaj7 (B1, B3, D#4, F#4, A#4, D#5)
      [123.47, 246.94, 311.13, 369.99, 466.16, 622.25],
      // C#9 (C#2, C#4, F4, G#4, B4, D#5)
      [138.59, 277.18, 349.23, 415.3, 493.88, 622.25],
      // A#m7 (A#1, A#3, C#4, F4, G#4, C#5)
      [116.54, 233.08, 277.18, 349.23, 415.3, 554.37],
    ],
    melodyNotes: [698.46, 622.25, 554.37, 466.16, 369.99, 311.13],
  },
  study: {
    key: 'study',
    name: 'COZY STUDY BEATS',
    bpm: 80,
    genre: 'Classic ChillHop',
    chords: [
      // Fmaj9 (F2, F4, A4, C5, E5, G5)
      [174.61, 349.23, 440.0, 523.25, 659.25, 783.99],
      // Am9 (A1, A3, E4, G4, B4, E5)
      [110.0, 220.0, 329.63, 392.0, 493.88, 659.25],
      // Dm9 (D2, D4, F4, A4, C5, E5)
      [146.83, 293.66, 349.23, 440.0, 523.25, 659.25],
      // Bbmaj9 (Bb1, Bb3, F4, A4, C5, F5)
      [116.54, 233.08, 349.23, 440.0, 523.25, 698.46],
    ],
    melodyNotes: [783.99, 659.25, 587.33, 523.25, 440.0, 349.23],
  },
  midnight: {
    key: 'midnight',
    name: '3 AM SLEEPY TAPES',
    bpm: 68,
    genre: 'Late Night Tape',
    chords: [
      // Abmaj7 (Ab1, Ab3, Eb4, G4, C5)
      [103.83, 207.65, 311.13, 392.0, 523.25],
      // Gm7 (G1, G3, D4, F4, Bb4)
      [98.0, 196.0, 293.66, 349.23, 466.16],
      // Fm9 (F1, F3, C4, Eb4, G4, C5)
      [87.31, 174.61, 261.63, 311.13, 392.0, 523.25],
      // Bbm9 (Bb1, Bb3, Db4, F4, Ab4, C5)
      [116.54, 233.08, 277.18, 349.23, 415.3, 523.25],
    ],
    melodyNotes: [523.25, 466.16, 415.3, 349.23, 311.13],
  },
  cafe: {
    key: 'cafe',
    name: 'RAINY CAFE BOSSA',
    bpm: 84,
    genre: 'Coffeehouse Bossa',
    chords: [
      // Dm7 (D2, D4, F4, A4, C5)
      [146.83, 293.66, 349.23, 440.0, 523.25],
      // G13 (G1, G3, F4, B4, E5)
      [98.0, 196.0, 349.23, 493.88, 659.25],
      // Cmaj9 (C2, C4, E4, G4, B4, D5)
      [130.81, 261.63, 329.63, 392.0, 493.88, 587.33],
      // A7b13 (A1, A3, G4, C#5, F5)
      [110.0, 220.0, 392.0, 554.37, 698.46],
    ],
    melodyNotes: [659.25, 587.33, 523.25, 440.0, 392.0, 329.63],
  },
  nostalgia: {
    key: 'nostalgia',
    name: 'CASSETTE MEMORIES',
    bpm: 76,
    genre: 'Vintage Tape Wobble',
    chords: [
      // Gmaj9 (G1, G3, D4, F#4, A4, D5)
      [98.0, 196.0, 293.66, 369.99, 440.0, 587.33],
      // Em9 (E1, E3, D4, G4, B4, F#5)
      [82.41, 164.81, 293.66, 392.0, 493.88, 739.99],
      // Cmaj9 (C2, C4, E4, G4, B4, D5)
      [130.81, 261.63, 329.63, 392.0, 493.88, 587.33],
      // D9sus4 (D2, D4, G4, A4, C5, E5)
      [146.83, 293.66, 392.0, 440.0, 523.25, 659.25],
    ],
    melodyNotes: [587.33, 493.88, 440.0, 392.0, 329.63],
  },
  stargaze: {
    key: 'stargaze',
    name: 'STARGAZING AMBIENT',
    bpm: 64,
    genre: 'Celestial Dreams',
    chords: [
      // F#maj7 (F#1, F#3, C#4, F4, A#4, C#5)
      [92.5, 185.0, 277.18, 349.23, 466.16, 554.37],
      // D#m7 (D#1, D#3, A#3, C#4, F#4, A#4)
      [77.78, 155.56, 233.08, 277.18, 369.99, 466.16],
      // Bmaj9 (B1, B3, F#4, A#4, C#5, F#5)
      [123.47, 246.94, 369.99, 466.16, 554.37, 739.99],
      // C#sus (C#2, C#4, G#4, B4, D#5, G#5)
      [138.59, 277.18, 415.3, 493.88, 622.25, 830.61],
    ],
    melodyNotes: [739.99, 622.25, 554.37, 466.16, 369.99],
  },
};

let currentLoFiVolume = 0.14;
let isBeatEnabled = true;
let activeTrackKey = 'tokyo';
let currentStep = 0;
let currentChordIdx = 0;
let loFiTimerId: number | null = null;
let loFiOnBeatCallback: (() => void) | null = null;

export function setLoFiVolume(vol: number): void {
  currentLoFiVolume = Math.max(0.02, Math.min(0.28, vol));
}

export function getLoFiVolume(): number {
  return currentLoFiVolume;
}

export function setLoFiBeatEnabled(enabled: boolean): void {
  isBeatEnabled = enabled;
}

export function getLoFiBeatEnabled(): boolean {
  return isBeatEnabled;
}

// Synthesize Lo-Fi Warm Sub-Kick
function triggerLoFiKick(ctx: AudioContext, time: number, vol: number) {
  if (isAudioMuted || vol <= 0) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, time);

    osc.type = 'sine';
    // Pitch envelope: drops from 125Hz to 44Hz
    osc.frequency.setValueAtTime(125, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.12);

    const kickGain = vol * 1.5;
    gain.gain.setValueAtTime(kickGain, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.17);
  } catch {}
}

// Synthesize Lo-Fi Cassette Tape Snare / Rimshot
function triggerLoFiSnare(ctx: AudioContext, time: number, vol: number) {
  if (isAudioMuted || vol <= 0) return;
  try {
    // Noise buffer for snap
    const bufferSize = Math.floor(ctx.sampleRate * 0.1);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1600, time);
    noiseFilter.Q.setValueAtTime(1.8, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.9, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.1);

    // Subtle body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(185, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.07);

    oscGain.gain.setValueAtTime(vol * 0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.085);
  } catch {}
}

// Synthesize Lo-Fi Dusty Hi-Hat
function triggerLoFiHiHat(ctx: AudioContext, time: number, vol: number, open = false) {
  if (isAudioMuted || vol <= 0) return;
  try {
    const dur = open ? 0.07 : 0.03;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6800, time);

    const gain = ctx.createGain();
    const hatVol = vol * (open ? 0.45 : 0.35);
    gain.gain.setValueAtTime(hatVol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + dur + 0.005);
  } catch {}
}

// Synthesize Vinyl Dust Crackle
function triggerVinylCrackle(ctx: AudioContext, time: number) {
  if (isAudioMuted || Math.random() > 0.4) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200 + Math.random() * 2400, time);

    gain.gain.setValueAtTime(0.008, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.006);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.007);
  } catch {}
}

// Synthesize Warm Electric Piano (Rhodes / Tape Warmth) Chord Strum
function triggerLoFiChordStrum(
  ctx: AudioContext,
  notes: number[],
  time: number,
  vol: number,
  isAccented = false
) {
  if (isAudioMuted || vol <= 0) return;
  const chordFilter = ctx.createBiquadFilter();
  chordFilter.type = 'lowpass';
  chordFilter.frequency.setValueAtTime(1700, time);

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol * (isAccented ? 1.7 : 1.4), time);
  masterGain.connect(ctx.destination);
  chordFilter.connect(masterGain);

  notes.forEach((freq, idx) => {
    const noteTime = time + idx * 0.032; // Slight natural strum spread
    try {
      // Primary mellow sine fundamental
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Subtle vintage tape chorus detune
      const detuneOsc = ctx.createOscillator();
      const detuneGain = ctx.createGain();
      detuneOsc.type = 'triangle';
      detuneOsc.frequency.setValueAtTime(freq + (Math.random() * 1.2 - 0.6), noteTime);

      const decayTime = isAccented ? 2.3 : 1.6;
      gain.gain.setValueAtTime(0.65, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + decayTime);

      detuneGain.gain.setValueAtTime(0.2, noteTime);
      detuneGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + decayTime * 0.7);

      osc.connect(gain);
      detuneOsc.connect(detuneGain);
      gain.connect(chordFilter);
      detuneGain.connect(chordFilter);

      osc.start(noteTime);
      detuneOsc.start(noteTime);
      osc.stop(noteTime + decayTime + 0.05);
      detuneOsc.stop(noteTime + decayTime + 0.05);

      // Sub bass warmth for lowest root note
      if (idx === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq / 2, noteTime);
        bassGain.gain.setValueAtTime(0.5, noteTime);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + decayTime * 1.1);

        bassOsc.connect(bassGain);
        bassGain.connect(chordFilter);
        bassOsc.start(noteTime);
        bassOsc.stop(noteTime + decayTime * 1.1 + 0.05);
      }
    } catch {}
  });
}

// Synthesize Dreamy Melodic Celesta / Rhodes Bell Note
function triggerMelodyLead(ctx: AudioContext, freq: number, time: number, vol: number) {
  if (isAudioMuted || vol <= 0) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const leadVol = vol * 0.75;
    gain.gain.setValueAtTime(leadVol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 1.25);
  } catch {}
}

// Main Step Sequencer for Lo-Fi Groove (8 steps per bar = eighth notes)
function runLoFiStep() {
  if (!isLoFiPlaying || isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const track = LOFI_TRACKS[activeTrackKey] || LOFI_TRACKS.tokyo;
  const now = ctx.currentTime;
  const vol = currentLoFiVolume;

  const chords = track.chords;
  const chord = chords[currentChordIdx % chords.length];

  // Beat pulse event on measure start
  if (currentStep === 0 && loFiOnBeatCallback) {
    loFiOnBeatCallback();
  }

  // Chords & Melody pattern across 8 eighth-note steps
  switch (currentStep) {
    case 0:
      // Beat 1: Full rich chord strum + Kick + Vinyl
      triggerLoFiChordStrum(ctx, chord, now, vol, true);
      if (isBeatEnabled) triggerLoFiKick(ctx, now, vol);
      triggerVinylCrackle(ctx, now);
      break;

    case 1:
      // Beat 1.5: Light hi-hat + subtle melodic sparkle
      if (isBeatEnabled) triggerLoFiHiHat(ctx, now, vol, false);
      if (Math.random() > 0.45 && track.melodyNotes.length > 0) {
        const melNote = track.melodyNotes[Math.floor(Math.random() * track.melodyNotes.length)];
        triggerMelodyLead(ctx, melNote, now + 0.05, vol * 0.85);
      }
      break;

    case 2:
      // Beat 2: Warm Snare / Rimshot + Hi-hat
      if (isBeatEnabled) {
        triggerLoFiSnare(ctx, now, vol);
        triggerLoFiHiHat(ctx, now, vol, false);
      }
      triggerVinylCrackle(ctx, now);
      break;

    case 3:
      // Beat 2.5: Soft syncopated chord re-touch or hi-hat
      if (isBeatEnabled) triggerLoFiHiHat(ctx, now, vol, false);
      break;

    case 4:
      // Beat 3: Syncopated Kick + Rhodes chord sustain
      if (isBeatEnabled) {
        triggerLoFiKick(ctx, now, vol * 0.85);
        triggerLoFiHiHat(ctx, now, vol, true); // Open hat
      }
      // Gentle soft chord pulse
      triggerLoFiChordStrum(ctx, chord.slice(1), now, vol * 0.65, false);
      break;

    case 5:
      // Beat 3.5: Hi-hat + top melodic phrase note
      if (isBeatEnabled) triggerLoFiHiHat(ctx, now, vol, false);
      if (track.melodyNotes.length > 0) {
        const melNote = track.melodyNotes[(currentChordIdx + 2) % track.melodyNotes.length];
        triggerMelodyLead(ctx, melNote, now, vol * 0.9);
      }
      break;

    case 6:
      // Beat 4: Snare + Hi-hat
      if (isBeatEnabled) {
        triggerLoFiSnare(ctx, now, vol);
        triggerLoFiHiHat(ctx, now, vol, false);
      }
      triggerVinylCrackle(ctx, now);
      break;

    case 7:
      // Beat 4.5: Pickup leading into the next chord
      if (isBeatEnabled) {
        triggerLoFiHiHat(ctx, now, vol, false);
        // Syncopated ghost kick
        if (Math.random() > 0.4) {
          triggerLoFiKick(ctx, now + 0.08, vol * 0.6);
        }
      }
      break;
  }

  // Advance step (8 steps per chord measure)
  currentStep = (currentStep + 1) % 8;
  if (currentStep === 0) {
    currentChordIdx = (currentChordIdx + 1) % chords.length;
  }
}

export function playLoFiChord(trackKey = 'tokyo', volume?: number): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const track = LOFI_TRACKS[trackKey] || LOFI_TRACKS.tokyo;
  const chords = track.chords;
  const chord = chords[currentChordIdx % chords.length];
  const activeVol = volume !== undefined ? volume : currentLoFiVolume;

  triggerLoFiChordStrum(ctx, chord, ctx.currentTime, activeVol, true);
  if (isBeatEnabled) {
    triggerLoFiKick(ctx, ctx.currentTime, activeVol);
  }
}

export function startLoFi(trackKey = 'tokyo', onBeat?: () => void, volume?: number): void {
  stopLoFi();
  isLoFiPlaying = true;
  activeTrackKey = trackKey;
  currentStep = 0;
  currentChordIdx = 0;
  loFiOnBeatCallback = onBeat || null;

  if (volume !== undefined) {
    currentLoFiVolume = volume;
  }

  const track = LOFI_TRACKS[trackKey] || LOFI_TRACKS.tokyo;
  // Step duration for eighth notes: (60 / bpm / 2) * 1000 ms
  const stepMs = Math.round((60 / track.bpm / 2) * 1000);

  // Play initial step immediately
  runLoFiStep();

  // Run rhythmic step sequencer
  loFiInterval = window.setInterval(() => {
    runLoFiStep();
  }, stepMs);
}

export function stopLoFi(): void {
  isLoFiPlaying = false;
  if (loFiInterval !== null) {
    clearInterval(loFiInterval);
    loFiInterval = null;
  }
  if (loFiTimerId !== null) {
    clearTimeout(loFiTimerId);
    loFiTimerId = null;
  }
  loFiOnBeatCallback = null;
}

export function getIsLoFiPlaying(): boolean {
  return isLoFiPlaying;
}

// Generative Rain Sound Generator
export function toggleAmbientRain(enable: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (enable && !isAudioMuted) {
    if (rainSource) return;
    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      // Generate brown/pink noise
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      rainSource = ctx.createBufferSource();
      rainSource.buffer = buffer;
      rainSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      rainGainNode = ctx.createGain();
      rainGainNode.gain.setValueAtTime(0.025, ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(rainGainNode);
      rainGainNode.connect(ctx.destination);

      rainSource.start();
    } catch {
      // safe
    }
  } else {
    if (rainSource) {
      try {
        rainSource.stop();
        rainSource.disconnect();
      } catch {}
      rainSource = null;
      rainGainNode = null;
    }
  }
}

/**
 * Vintage instant camera shutter snap + motorized paper feed sound
 */
export function playCameraShutterSound(volume = 0.08): void {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // First shutter blade snap (click)
    const snap1 = ctx.createOscillator();
    const snap1Gain = ctx.createGain();
    snap1.type = 'triangle';
    snap1.frequency.setValueAtTime(1800, now);
    snap1.frequency.exponentialRampToValueAtTime(320, now + 0.02);
    snap1Gain.gain.setValueAtTime(volume * 0.9, now);
    snap1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    snap1.connect(snap1Gain);
    snap1Gain.connect(ctx.destination);
    snap1.start(now);
    snap1.stop(now + 0.025);

    // Second curtain snap (clack 45ms later)
    const snap2 = ctx.createOscillator();
    const snap2Gain = ctx.createGain();
    snap2.type = 'sine';
    snap2.frequency.setValueAtTime(950, now + 0.045);
    snap2.frequency.exponentialRampToValueAtTime(180, now + 0.075);
    snap2Gain.gain.setValueAtTime(volume * 0.75, now + 0.045);
    snap2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    snap2.connect(snap2Gain);
    snap2Gain.connect(ctx.destination);
    snap2.start(now + 0.045);
    snap2.stop(now + 0.08);

    // Motorized film eject whir
    const motor = ctx.createOscillator();
    const motorGain = ctx.createGain();
    motor.type = 'sawtooth';
    motor.frequency.setValueAtTime(220, now + 0.085);
    motor.frequency.linearRampToValueAtTime(260, now + 0.16);
    motor.frequency.exponentialRampToValueAtTime(120, now + 0.22);
    motorGain.gain.setValueAtTime(volume * 0.25, now + 0.085);
    motorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    const motorFilter = ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(1200, now + 0.085);

    motor.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(ctx.destination);
    motor.start(now + 0.085);
    motor.stop(now + 0.22);
  } catch {
    // safe fallback
  }
}

