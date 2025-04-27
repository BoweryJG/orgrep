// --- Utility functions ---
function lerp(a, b, t) { return a + (b - a) * t; }
function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return "#" + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}
function lerpColor(a, b, t) {
  const ah = parseInt(a.replace('#', ''), 16), bh = parseInt(b.replace('#', ''), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
}
function generateSuperSmoothBlob(cx, cy, r, points, t, amp=1, phase=0) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const noise =
      Math.sin(angle * 3 + t * 0.7 + phase) * 4 * amp +
      Math.sin(angle * 5 - t * 1.1 + phase) * 2 * amp +
      Math.sin(angle * 2 + t * 1.7 + phase) * 1.2 * amp;
    const rad = r + noise;
    pts.push({
      x: cx + Math.cos(angle) * rad,
      y: cy + Math.sin(angle) * rad
    });
  }
  let d = "";
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    if (i === 0) {
      d += `M${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
    }
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  d += "Z";
  return d;
}

const childCount = 5;
// --- Dynamic Color Families ---
function getDynamicColorFamily(i, now) {
  // Each orb gets a unique base hue, animated over time
  const baseHue = (i * 67 + now * 0.018) % 360;
  const hue2 = (baseHue + 40 + 20 * Math.sin(now * 0.0007 + i)) % 360;
  const sat = 80 + 10 * Math.sin(now * 0.0005 + i);
  const light1 = 60 + 10 * Math.cos(now * 0.0004 + i * 2);
  const light2 = 35 + 15 * Math.sin(now * 0.0006 + i * 3);
  return [hslToHex(baseHue, sat, light1), hslToHex(hue2, sat, light2)];
}
// parentCenter will be set dynamically below
const parentRadius = 100;
const childRadius = 36;
const childPoints = 48;
const childAmp = 0.5;
const childGradIds = [
  "childGrad0", "childGrad1", "childGrad2", "childGrad3", "childGrad4"
];
// --- Dynamically resize SVG to fit all orbs ---
function adjustSVGSize() {
  // Use viewport size for SVG
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Store for later
  window.viewportSize = {vw, vh};
  // Orbit radii: parentRadius + 120 + i*40 (i = 0..childCount-1)
  const maxChildIndex = childCount - 1;
  const maxOrbit = parentRadius + 120 + maxChildIndex * 40;
  const maxReach = maxOrbit + childRadius + 8; // +8 for morphing amplitude margin
  // Fit orbs within the smallest viewport dimension
  const minDim = Math.min(vw, vh);
  const scale = minDim / (maxReach * 2);
  const size = maxReach * 2 * scale;
  const svg = document.getElementById('orbSVG');
  svg.setAttribute('width', vw);
  svg.setAttribute('height', vh);
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  // Update parentCenter so it's always in the middle
  window.parentCenterBase = window.parentCenter = {x: vw/2, y: vh/2};
  window.orbScale = scale;
}

// --- Orb State Management ---
const orbStates = [];
let parentOrb;
let childrenGroup;
let particlesGroup;

// Helper to create default orb state
function makeOrbState() {
  return {
    drag: 0, // vertical drag offset (from scroll)
    dragTarget: 0, // target drag value
    dragV: 0, // velocity for wobble
    squash: 0, // squash from click
    squashTarget: 0,
    squashV: 0,
    mouseDir: 0, // directionality for mouseover (radians)
    mouseDirTarget: 0,
    mouseDirV: 0,
    wobble: 0, // phase for recovery wobble
    lastUpdate: performance.now(),
  };
}
// --- Orb Morph Personalities ---
const orbMorphDirections = [];
const orbMorphSpeeds = [];
// Parent orb: slowest, morphs mostly vertical
orbMorphDirections.push(Math.PI / 2); // 90deg (vertical)
orbMorphSpeeds.push(0.012);

// Child orbs: each gets a distinct morph direction and speed
for (let i = 0; i < childCount; i++) {
  // Spread morph directions around the circle
  const angle = (i * Math.PI * 2) / childCount;
  orbMorphDirections.push(angle);
  // Small speed variations between orbs
  orbMorphSpeeds.push(0.015 + Math.random() * 0.006);
  // Pre-initialize orbit states
  orbStates.push(makeOrbState());
}

// Add a specific state for the parent orb
orbStates.unshift(makeOrbState());

// --- Cosmic particle system ---
let particles = [];

function animateParticles() {
  if (!particlesGroup) return;
  // Update and render particles
  particles = particles.filter(p => p.life > 0);
  particlesGroup.innerHTML = '';
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life -= p.decay;
    p.opacity = Math.max(0, p.life);
    const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("cx", p.x);
    circ.setAttribute("cy", p.y);
    circ.setAttribute("r", p.r * p.opacity);
    circ.setAttribute("fill", p.color);
    circ.setAttribute("opacity", p.opacity * 0.7);
    particlesGroup.appendChild(circ);
  }
}

function emitParticles(x, y, color, count = 3, i = 0, now = 0) {
  for (let j = 0; j < count; j++) {
    // Add a sparkle: random hue offset
    let h = (i * 67 + now * 0.018) % 360 + (Math.random() - 0.5) * 24; // sparkle
    let s = 85 + Math.random() * 10;
    let l = 55 + Math.random() * 20;
    const particleColor = hslToHex(h, s, l);
    const angle = Math.random() * 2 * Math.PI;
    const speed = 0.4 + Math.random() * 0.7; // slower
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    particles.push({
      x, y,
      vx, vy,
      r: 1.1 + Math.random() * 1.2, // much smaller
      life: 0.6, // fades faster
      decay: 0.025 + Math.random() * 0.015, // fades faster
      color: particleColor,
      opacity: 0.45 // more subtle
    });
  }
}

function animate() {
  const now = performance.now();
  // Get parent state
  const parentState = orbStates[0];
  const dt = Math.min(32, now - parentState.lastUpdate) / 1000;
  parentState.lastUpdate = now;

  // === Physics update for all orbs ===
  for (let i = 0; i < orbStates.length; i++) {
    const state = orbStates[i];
    // Spring forces toward target
    const dragForce = (state.dragTarget - state.drag) * 3.0;
    state.dragV += dragForce * dt;
    state.dragV *= 0.94; // dampening
    state.drag += state.dragV * dt;
    // Recovery wobble damping
    state.wobble *= 0.97;
    
    // Squash forces (from clicks)
    const squashForce = (state.squashTarget - state.squash) * 4.0;
    state.squashV += squashForce * dt;
    state.squashV *= 0.8; // strong dampening
    state.squash += state.squashV * dt;
    if (Math.abs(state.squash) < 0.01 && Math.abs(state.squashV) < 0.01) {
      state.squash = 0;
      state.squashV = 0;
      state.squashTarget = 0;
    }
    
    // Mouse direction forces
    const dirForce = (state.mouseDirTarget - state.mouseDir) * 5.0;
    state.mouseDirV += dirForce * dt;
    state.mouseDirV *= 0.85; // strong dampening
    state.mouseDir += state.mouseDirV * dt;
  }

  // === Parent Orb ===
  if (parentOrb) {
    // Always keep parent orb visible and morphing
    const parentMorphT = now * orbMorphSpeeds[0];
    const parentMorphDir = orbMorphDirections[0];
    const amplitude = 1.0 + Math.abs(parentState.drag) * 0.01; // Increase amplitude with drag
    // Generate a blob shape along the morph direction
    const parentBlob = generateSuperSmoothBlob(
      window.parentCenter.x, 
      window.parentCenter.y, 
      parentRadius * window.orbScale * (1 + parentState.squash * 0.1), // Size changes with squash
      64, // Higher detail for parent
      parentMorphT, 
      amplitude,
      parentState.wobble // added wobble phase
    );
    parentOrb.setAttribute("d", parentBlob);
    parentOrb.setAttribute("opacity", 0.95 - Math.abs(parentState.squash) * 0.15); // Fade slightly on squash
  }

  // === Child Orbs ===
  // Clear previous child orbs
  if (childrenGroup) {
    childrenGroup.innerHTML = '';
    for (let i = 0; i < childCount; i++) {
      const state = orbStates[i + 1]; // Skip parent state
      const stateIdx = i + 1;
      
      // Get updated colors
      const fam = getDynamicColorFamily(i, now);
      const tcol = 0.5 + Math.sin(now * 0.0003 + i * 0.4) * 0.5;
      document.getElementById(`c${i}s0`).setAttribute("stop-color", fam[0]);
      document.getElementById(`c${i}s1`).setAttribute("stop-color", fam[1]);
      
      // Calculate position based on orbit with physics perturbation
      // Orbit radius increases with index, adjusted by wobble
      const orbit = parentRadius + 120 + i * 40 + state.wobble * 10;
      const ellipseA = orbit * (1 + state.squash * 0.25);
      const ellipseB = orbit * (1 - state.squash * 0.25);
      // Orbit angle with offset per orb
      const angle = (now * 0.0001 + i * (Math.PI * 0.4)) % (Math.PI * 2);
      // Apply mouse direction offset
      const dragAngle = angle + state.mouseDir;  
      const dx = Math.cos(dragAngle) * state.drag;
      const dy = Math.sin(dragAngle) * state.drag;
      const x = window.parentCenter.x + Math.cos(angle) * ellipseA + dx;
      const y = window.parentCenter.y + Math.sin(angle) * ellipseB + dy;
      const scale = window.orbScale || 1;
      const cR = (childRadius + state.drag * 0.08) * scale;
      const cAmp = (childAmp + Math.abs(state.drag) * 0.006) * scale;
      const morphT = now * 0.0005 + i * 10;
      const childPath = generateSuperSmoothBlob(x * scale + (1 - scale) * window.parentCenter.x, y * scale + (1 - scale) * window.parentCenter.y, cR, childPoints, morphT, cAmp, i);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", childPath);
      path.setAttribute("fill", `url(#${childGradIds[i]})`);
      // Fade out as dragTarget increases, but trigger instant dissolve/appear
      const fadeStart = 40, fadeEnd = 340;
      const fade = Math.min(1, Math.max(0, (fadeEnd - Math.abs(state.dragTarget)) / (fadeEnd - fadeStart)));
      // Track last visible state
      if (state.wasVisible === undefined) state.wasVisible = fade > 0.5;
      // Start dissolving into particles as soon as fade < 0.5
      if (fade < 0.5 && fade > 0.05) {
        const color = lerpColor(fam[0], fam[1], tcol);
        // Emit more particles as fade approaches zero
        const emission = Math.ceil((0.5 - fade) * 12); // up to 6 particles per frame
        emitParticles(x, y, color, emission, i, now);
        path.setAttribute("opacity", fade * 0.95);
      }
      // If orb just became invisible, emit a final burst and hide
      else if (state.wasVisible && fade <= 0.05) {
        const color = lerpColor(fam[0], fam[1], tcol);
        emitParticles(x, y, color, 12, i, now); // big burst
        path.setAttribute("opacity", 0);
        state.wasVisible = false;
      }
      // If orb just became visible, emit appear particles and show
      else if (!state.wasVisible && fade > 0.05) {
        const color = lerpColor(fam[0], fam[1], tcol);
        emitParticles(x, y, color, 9, i, now);
        path.setAttribute("opacity", fade * 0.95);
        state.wasVisible = true;
      } else {
        // Normal fade
        path.setAttribute("opacity", fade * 0.95);
      }
      childrenGroup.appendChild(path);
    }
  }
  
  // Animate and render particles
  animateParticles();
  requestAnimationFrame(animate);
}

// Initialize the SVG size and start animation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  parentOrb = document.getElementById('parentOrb');
  childrenGroup = document.getElementById('children');
  particlesGroup = document.getElementById('particles');
  
  if (parentOrb && childrenGroup && particlesGroup) {
    adjustSVGSize();
    window.addEventListener('resize', adjustSVGSize);
    animate();
  }
});
