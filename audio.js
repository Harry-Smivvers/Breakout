// ─── Audio ─────────────────────────────────────────────────────────────────
let _actx = null, _noiseBuf = null;

function audio() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
    const len = Math.ceil(_actx.sampleRate * 0.5);
    _noiseBuf = _actx.createBuffer(1, len, _actx.sampleRate);
    const d = _noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (_actx.state === 'suspended') _actx.resume();
  return _actx;
}

function mkOsc(ctx, type, freq, t) {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.setValueAtTime(freq, t); return o;
}
function mkEnv(ctx, peak, attack, decay, t) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}
function mkNoise(ctx, t, dur) {
  const s = ctx.createBufferSource();
  s.buffer = _noiseBuf; s.start(t); s.stop(t + dur); return s;
}
function distCurve(amt) {
  const n = 256, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = (Math.PI + amt) * x / (Math.PI + amt * Math.abs(x));
  }
  return c;
}

const snd = {
  brick() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const n = mkNoise(ctx, t, 0.07);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 1.8;
      const ng = mkEnv(ctx, 0.20, 0.002, 0.065, t);
      n.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      const o = mkOsc(ctx, 'square', 560, t);
      o.frequency.exponentialRampToValueAtTime(160, t + 0.09);
      const og = mkEnv(ctx, 0.18, 0.001, 0.09, t);
      o.connect(og); og.connect(ctx.destination);
      o.start(t); o.stop(t + 0.10);
    } catch(e) {}
  },
  wall() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o = mkOsc(ctx, 'sine', 1400, t);
      o.frequency.exponentialRampToValueAtTime(700, t + 0.05);
      const g = mkEnv(ctx, 0.14, 0.001, 0.05, t);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.06);
      const o2 = mkOsc(ctx, 'sine', 120, t);
      const g2 = mkEnv(ctx, 0.12, 0.001, 0.02, t);
      o2.connect(g2); g2.connect(ctx.destination);
      o2.start(t); o2.stop(t + 0.025);
    } catch(e) {}
  },
  paddle() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o1 = mkOsc(ctx, 'sine', 200, t);
      o1.frequency.exponentialRampToValueAtTime(65, t + 0.14);
      const g1 = mkEnv(ctx, 0.40, 0.002, 0.13, t);
      o1.connect(g1); g1.connect(ctx.destination);
      o1.start(t); o1.stop(t + 0.15);
      const o2 = mkOsc(ctx, 'triangle', 1100, t);
      const g2 = mkEnv(ctx, 0.12, 0.001, 0.025, t);
      o2.connect(g2); g2.connect(ctx.destination);
      o2.start(t); o2.stop(t + 0.03);
      const nm = mkNoise(ctx, t, 0.03);
      const nf = ctx.createBiquadFilter();
      nf.type = 'highpass'; nf.frequency.value = 2000;
      const ng = mkEnv(ctx, 0.10, 0.001, 0.025, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    } catch(e) {}
  },
  lost() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      [[0, 392], [0.16, 294], [0.32, 196]].forEach(([dt, freq]) => {
        const o = mkOsc(ctx, 'sawtooth', freq, t + dt);
        const ws = ctx.createWaveShaper(); ws.curve = distCurve(25);
        const gn = mkEnv(ctx, 0.28, 0.008, 0.13, t + dt);
        o.connect(ws); ws.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.18);
      });
      const nm = mkNoise(ctx, t + 0.48, 0.25);
      const nf = ctx.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.setValueAtTime(3000, t + 0.48);
      nf.frequency.exponentialRampToValueAtTime(100, t + 0.73);
      const ng = mkEnv(ctx, 0.18, 0.01, 0.22, t + 0.48);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    } catch(e) {}
  },
  powerup() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      [0, 0.10, 0.20].forEach((dt, i) => {
        const freq = [523, 659, 784][i];
        const o = mkOsc(ctx, 'sine', freq, t + dt);
        const gn = mkEnv(ctx, 0.22, 0.01, 0.09, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.12);
      });
    } catch(e) {}
  },
  grow() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      [0, 0.09, 0.18, 0.27, 0.36].forEach((dt, i) => {
        const freq = [261, 329, 392, 523, 659][i];
        const o = mkOsc(ctx, 'triangle', freq, t + dt);
        const gn = mkEnv(ctx, 0.28, 0.01, 0.10, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.14);
      });
    } catch(e) {}
  },
  shrink() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      [0, 0.10, 0.20].forEach((dt, i) => {
        const freq = [392, 261, 174][i];
        const o = mkOsc(ctx, 'triangle', freq, t + dt);
        const gn = mkEnv(ctx, 0.22, 0.01, 0.09, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.12);
      });
    } catch(e) {}
  },
  fireStart() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o = mkOsc(ctx, 'sawtooth', 80, t);
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.35);
      const ws = ctx.createWaveShaper(); ws.curve = distCurve(18);
      const gn = mkEnv(ctx, 0.30, 0.005, 0.30, t);
      o.connect(ws); ws.connect(gn); gn.connect(ctx.destination);
      o.start(t); o.stop(t + 0.38);
      const nm = mkNoise(ctx, t + 0.28, 0.18);
      const nf = ctx.createBiquadFilter();
      nf.type = 'highpass'; nf.frequency.value = 1800;
      const ng = mkEnv(ctx, 0.22, 0.005, 0.12, t + 0.28);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      [0.32, 0.40, 0.48].forEach((dt, i) => {
        const freq = [880, 1100, 1400][i];
        const o2 = mkOsc(ctx, 'sine', freq, t + dt);
        const g2 = mkEnv(ctx, 0.15, 0.003, 0.06, t + dt);
        o2.connect(g2); g2.connect(ctx.destination);
        o2.start(t + dt); o2.stop(t + dt + 0.08);
      });
    } catch(e) {}
  },
  levelComplete() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const melody = [
        [0.00, 523, 0.18], [0.12, 659, 0.18], [0.24, 784, 0.18],
        [0.36, 1047, 0.30], [0.60, 880, 0.16], [0.72, 1047, 0.16],
        [0.84, 1175, 0.50],
        [1.10, 784, 0.16], [1.22, 880, 0.16], [1.34, 1047, 0.16],
        [1.46, 1319, 0.80]
      ];
      melody.forEach(([dt, freq, dur]) => {
        const o = mkOsc(ctx, 'triangle', freq, t + dt);
        const gn = mkEnv(ctx, 0.26, 0.01, dur, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + dur + 0.05);
      });
      [[0.00, 131], [0.36, 174], [0.84, 196], [1.46, 196]].forEach(([dt, freq]) => {
        const o = mkOsc(ctx, 'sawtooth', freq, t + dt);
        const ws = ctx.createWaveShaper(); ws.curve = distCurve(8);
        const gn = mkEnv(ctx, 0.14, 0.02, 0.28, t + dt);
        o.connect(ws); ws.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.35);
      });
      [0.36, 0.48, 0.60, 0.72, 1.10, 1.22, 1.34, 1.46, 1.58, 1.70].forEach((dt, i) => {
        const freqs = [2093, 1760, 2637, 2093, 2349, 1976, 2637, 2093, 2794, 2349];
        const o = mkOsc(ctx, 'sine', freqs[i], t + dt);
        const gn = mkEnv(ctx, 0.11, 0.004, 0.10, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.13);
      });
      [0.00, 0.36, 0.84, 1.46].forEach(dt => {
        const nm = mkNoise(ctx, t + dt, 0.06);
        const nf = ctx.createBiquadFilter();
        nf.type = 'bandpass'; nf.frequency.value = 1200; nf.Q.value = 1.5;
        const ng = mkEnv(ctx, 0.12, 0.002, 0.055, t + dt);
        nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      });
      [1047, 1319, 1568].forEach((freq, i) => {
        const o = mkOsc(ctx, 'sine', freq, t + 1.46);
        const gn = mkEnv(ctx, 0.13 - i * 0.02, 0.03, 0.80, t + 1.46);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + 1.46); o.stop(t + 2.40);
      });
    } catch(e) {}
  },
  wallAppear() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o1 = mkOsc(ctx, 'sawtooth', 55, t);
      o1.frequency.exponentialRampToValueAtTime(110, t + 0.18);
      const ws = ctx.createWaveShaper(); ws.curve = distCurve(20);
      const g1 = mkEnv(ctx, 0.35, 0.005, 0.22, t);
      o1.connect(ws); ws.connect(g1); g1.connect(ctx.destination);
      o1.start(t); o1.stop(t + 0.28);
      const nm = mkNoise(ctx, t, 0.30);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.setValueAtTime(400, t);
      nf.frequency.exponentialRampToValueAtTime(2400, t + 0.28);
      nf.Q.value = 2.5;
      const ng = mkEnv(ctx, 0.22, 0.01, 0.22, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      [[0.18, 277], [0.24, 370], [0.30, 554]].forEach(([dt, freq]) => {
        const o = mkOsc(ctx, 'sine', freq, t + dt);
        const gn = mkEnv(ctx, 0.14, 0.01, 0.14, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.18);
      });
    } catch(e) {}
  },
  wallDisappear() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const nm = mkNoise(ctx, t, 0.35);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.setValueAtTime(2000, t);
      nf.frequency.exponentialRampToValueAtTime(120, t + 0.32);
      nf.Q.value = 1.8;
      const ng = mkEnv(ctx, 0.20, 0.005, 0.28, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      [[0.00, 370], [0.10, 277], [0.22, 185]].forEach(([dt, freq]) => {
        const o = mkOsc(ctx, 'triangle', freq, t + dt);
        const gn = mkEnv(ctx, 0.16, 0.005, 0.12, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.16);
      });
    } catch(e) {}
  },
  ballPop() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o = mkOsc(ctx, 'sine', 520, t);
      o.frequency.exponentialRampToValueAtTime(80, t + 0.12);
      const gn = mkEnv(ctx, 0.28, 0.002, 0.10, t);
      o.connect(gn); gn.connect(ctx.destination);
      o.start(t); o.stop(t + 0.14);
      const nm = mkNoise(ctx, t, 0.06);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.value = 900;
      const ng = mkEnv(ctx, 0.18, 0.001, 0.05, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    } catch(e) {}
  },
  pillCatch() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      [[0, 440], [0.07, 660], [0.14, 880]].forEach(([dt, freq]) => {
        const o = mkOsc(ctx, 'sine', freq, t + dt);
        const gn = mkEnv(ctx, 0.20, 0.005, 0.22, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.26);
      });
      const nm = mkNoise(ctx, t, 0.30);
      const nf = ctx.createBiquadFilter();
      nf.type = 'highpass'; nf.frequency.value = 1400;
      const ng = mkEnv(ctx, 0.16, 0.01, 0.26, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    } catch(e) {}
  },
  rocketLaunch() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o = mkOsc(ctx, 'sawtooth', 110, t);
      o.frequency.exponentialRampToValueAtTime(520, t + 0.18);
      const g1 = mkEnv(ctx, 0.38, 0.003, 0.16, t);
      o.connect(g1); g1.connect(ctx.destination);
      o.start(t); o.stop(t + 0.20);
      const nm = mkNoise(ctx, t, 0.22);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.value = 1100; nf.Q.value = 0.9;
      const ng = mkEnv(ctx, 0.20, 0.005, 0.18, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    } catch(e) {}
  },
  healthCatch() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      [[0, 523], [0.10, 659], [0.20, 784], [0.30, 1047]].forEach(([dt, freq]) => {
        const o = mkOsc(ctx, 'sine', freq, t + dt);
        const gn = mkEnv(ctx, 0.22, 0.005, 0.18, t + dt);
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.22);
      });
      const o2 = mkOsc(ctx, 'triangle', 1047, t + 0.30);
      const g2 = mkEnv(ctx, 0.15, 0.005, 0.35, t + 0.30);
      o2.connect(g2); g2.connect(ctx.destination);
      o2.start(t + 0.30); o2.stop(t + 0.68);
    } catch(e) {}
  },
  rocketExplode() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const o = mkOsc(ctx, 'sine', 55, t);
      o.frequency.exponentialRampToValueAtTime(18, t + 0.70);
      const g1 = mkEnv(ctx, 1.0, 0.001, 0.65, t);
      o.connect(g1); g1.connect(ctx.destination);
      o.start(t); o.stop(t + 0.75);
      const nm = mkNoise(ctx, t, 0.70);
      const nf = ctx.createBiquadFilter();
      nf.type = 'lowpass'; nf.frequency.value = 4000;
      const ng = mkEnv(ctx, 0.80, 0.001, 0.62, t);
      nm.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      const o2 = mkOsc(ctx, 'square', 200, t);
      o2.frequency.exponentialRampToValueAtTime(35, t + 0.15);
      const g2 = mkEnv(ctx, 0.50, 0.001, 0.13, t);
      o2.connect(g2); g2.connect(ctx.destination);
      o2.start(t); o2.stop(t + 0.17);
    } catch(e) {}
  }
};
