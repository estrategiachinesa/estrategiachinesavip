'use client';

/**
 * Triggers clean, professional, and responsive synthesizer sounds using the Web Audio API.
 * This does not rely on external MP3/WAV files, ensuring zero-latency, offline capability,
 * and reliable cross-browser execution.
 */
export function playSignalSound(type: 'active' | 'finished' | 'warning' | 'click' | 'analyze') {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'active') {
      // Futuristic "START!" trade entry alert sound
      // Composed of an ascending high-tech sweep and a solid dual-tone confirmation beep
      
      // 1. High-Tech Ascending Sweep (Laser/Trigger Start effect)
      const sweepOsc = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      sweepOsc.type = 'triangle';
      sweepOsc.frequency.setValueAtTime(350, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C5 to C6 ascending sweep
      
      sweepGain.gain.setValueAtTime(0.01, now);
      sweepGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      sweepOsc.connect(sweepGain);
      sweepGain.connect(ctx.destination);
      sweepOsc.start(now);
      sweepOsc.stop(now + 0.22);

      // 2. Bold Double Confirmation Tone (Start Beeps)
      // First Beep: G5 (783.99 Hz) for base punch
      const beep1 = ctx.createOscillator();
      const beepGain1 = ctx.createGain();
      beep1.type = 'sine';
      beep1.frequency.setValueAtTime(783.99, now + 0.15);
      
      beepGain1.gain.setValueAtTime(0.01, now + 0.15);
      beepGain1.gain.exponentialRampToValueAtTime(0.12, now + 0.16);
      beepGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      beep1.connect(beepGain1);
      beepGain1.connect(ctx.destination);
      beep1.start(now + 0.15);
      beep1.stop(now + 0.35);

      // Second Beep: C6 (1046.50 Hz) for bright start accent
      const beep2 = ctx.createOscillator();
      const beepGain2 = ctx.createGain();
      beep2.type = 'sine';
      beep2.frequency.setValueAtTime(1046.50, now + 0.20);
      
      beepGain2.gain.setValueAtTime(0.01, now + 0.20);
      beepGain2.gain.exponentialRampToValueAtTime(0.15, now + 0.21);
      beepGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      beep2.connect(beepGain2);
      beepGain2.connect(ctx.destination);
      beep2.start(now + 0.20);
      beep2.stop(now + 0.45);

    } else if (type === 'finished') {
      // "WIN" celebratory sound: Triumphant upward cascading major arpeggio
      const notes = [
        { freq: 523.25, time: 0.00, type: 'triangle' }, // C5
        { freq: 659.25, time: 0.06, type: 'triangle' }, // E5
        { freq: 783.99, time: 0.12, type: 'triangle' }, // G5
        { freq: 1046.50, time: 0.18, type: 'sine' },     // C6
        { freq: 1318.51, time: 0.24, type: 'sine' },     // E6
        { freq: 1567.98, time: 0.30, type: 'sine' },     // G6
        { freq: 2093.00, time: 0.36, type: 'sine' }      // C7 (Peak WIN Note!)
      ];
      
      notes.forEach((note, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = note.type as OscillatorType;
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        
        // Fast attack, beautiful decay
        const duration = idx === notes.length - 1 ? 0.8 : 0.4;
        const volume = idx === notes.length - 1 ? 0.15 : 0.08;
        
        gain.gain.setValueAtTime(0.01, now + note.time);
        gain.gain.exponentialRampToValueAtTime(volume, now + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + duration + 0.05);
      });
    } else if (type === 'warning') {
      // Warning / Attention: Dual-tone alarm. Pulsating alerts for news caution.
      const warnNotes = [
        { freq: 587.33, time: 0.00, type: 'triangle' as OscillatorType },
        { freq: 493.88, time: 0.15, type: 'triangle' as OscillatorType }
      ];

      warnNotes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.01, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.12, now + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + 0.3);
      });
    } else if (type === 'click') {
      // Crisp subtle button press feedback pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

    } else if (type === 'analyze') {
      // Dynamic scanning futuristic sweep for "Analyzing" state
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.06, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.35);
      
      gain2.gain.setValueAtTime(0.01, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.04, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.4);
    }
  } catch (error) {
    console.warn('Audio synthesis block/restriction on browser:', error);
  }
}
