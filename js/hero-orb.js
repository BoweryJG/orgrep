document.addEventListener('DOMContentLoaded', function() {
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
  const parentRadius = 40;
  const childRadius = 18;
  const childPoints = 32;
  const childAmp = 0.3;
  const childGradIds = [
    "childGrad0", "childGrad1", "childGrad2", "childGrad3", "childGrad4"
  ];

  // Get references to elements - ensure they exist
  const svg = document.getElementById('orbSVG');
  const particlesGroup = document.getElementById('particles');
  const childrenGroup = document.getElementById('children');
  const parentOrb = document.getElementById('parentOrb');
  const orbTextContainer = document.getElementById('orb-text-container');

  if (!svg || !particlesGroup || !childrenGroup || !parentOrb || !orbTextContainer) {
    console.error("Hero Orb Animation: Required SVG or text elements not found.");
    return; // Stop script if elements are missing
  }

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
    // Adjust scale calculation for hero section - make orb significantly larger
    const scale = minDim / (maxReach * 1.3); // Further decreased divisor for larger orb
    const size = maxReach * 2 * scale;
    
    svg.setAttribute('width', vw);
    svg.setAttribute('height', vh);
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    // Update parentCenter so it's always in the middle of the viewport
    window.parentCenterBase = window.parentCenter = {x: vw/2, y: vh/2}; // Center in viewport
    window.orbScale = scale;
  }
  adjustSVGSize();
  window.addEventListener('resize', adjustSVGSize);

  const childOrbs = [];

  // --- Orb State Management ---
  const orbStates = [];

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
  // Children: varied directions and speeds
  for (let i = 0; i < childCount; i++) {
    // Angle: spread from vertical to diagonal, with some randomness
    const angle = Math.PI / 2 + (i - (childCount - 1) / 2) * (Math.PI / 8) + (Math.random() - 0.5) * (Math.PI / 12);
    orbMorphDirections.push(angle);
    // Speed: slower for inner, slightly faster for outer (but all slow)
    orbMorphSpeeds.push(0.014 + i * 0.004 + Math.random() * 0.003);
  }
  // Parent orb state
  orbStates.push(makeOrbState());
  // Children orb states
  for (let i = 0; i < childCount; i++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", `url(#${childGradIds[i]})`);
    path.setAttribute("opacity", "0.95");
    childrenGroup.appendChild(path);
    childOrbs.push(path);
    orbStates.push(makeOrbState());
  }

  // --- Scroll/Drag Gravity Effect ---
  let lastWheelTime = 0;
  window.addEventListener('wheel', (e) => {
    // e.deltaY: positive for down, negative for up
    const now = performance.now();
    const dt = Math.max(1, now - lastWheelTime);
    lastWheelTime = now;
    // Velocity: stronger for faster scrolls, but overall effect is much softer
    const velocity = Math.max(-80, Math.min(80, e.deltaY / dt * 120));
    // Set dragTarget for all orbs, each along its own morph direction
    orbStates.forEach((state, i) => {
      // Project drag along this orb's unique direction
      const angle = orbMorphDirections[i];
      state.dragTarget += Math.sin(angle) * velocity * 1.8 + Math.cos(angle) * velocity * 0.7;
    });
    // Prevent page scroll only if the target isn't scrollable itself
    if (!e.target.closest || !e.target.closest('.scrollable-content')) {
        // e.preventDefault(); // Commented out: Allow normal page scroll
    }
  }, { passive: true }); // Changed to passive: true for better scroll performance

  // --- Animation Interpolation Helpers ---
  function approach(current, target, speed) {
    return current + (target - current) * speed;
  }
  function dampedSpring(current, target, velocity, stiffness, damping) {
    // Simple spring physics for wobble
    const force = (target - current) * stiffness;
    velocity += force;
    velocity *= damping;
    current += velocity;
    return [current, velocity];
  }

  // --- Cosmic particle system ---
  let particles = [];

  function animateParticles() {
    // Update and render particles
    particles = particles.filter(p => p.life > 0);
    particlesGroup.innerHTML = ''; // Clear previous particles
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
        r: 0.8 + Math.random() * 0.6, // smaller particles
        life: 0.4, // shorter lifespan
        decay: 0.035 + Math.random() * 0.02, // faster decay
        color: particleColor,
        opacity: 0.45 // more subtle
      });
    }
  }

  function animate() {
    // Animate parent gradient (fluid, spectrum, multi-stop)
    const parentStops = [
      { id: "p0", phase: 0 },
      { id: "p1", phase: Math.PI * 0.5 },
      { id: "p2", phase: Math.PI },
      { id: "p3", phase: Math.PI * 1.5 }
    ];
    const now = performance.now();
    const baseHue = (now * 0.01) % 360;
    for (let i = 0; i < parentStops.length; i++) {
      // Each stop cycles hue with a phase offset for a symphony effect
      const stop = parentStops[i];
      const hue = (baseHue + 60 * Math.sin(now * 0.00015 + stop.phase)) % 360;
      const sat = 80 + 10 * Math.sin(now * 0.0002 + stop.phase);
      const light = 60 + 10 * Math.cos(now * 0.00018 + stop.phase);
      const pStopEl = document.getElementById(stop.id);
      if (pStopEl) pStopEl.setAttribute("stop-color", hslToHex(hue, sat, light));
    }

    // --- Animate orb morph states (drag gravity, squash, mouseDir, wobble) ---
    for (let i = 0; i < orbStates.length; i++) {
      const state = orbStates[i];
      // Each orb has a unique springiness and damping (slower for parent, varied for children)
      const spring = 0.045 * (1 + orbMorphSpeeds[i]); // lower = slower
      const damping = 0.90 - orbMorphSpeeds[i] * 0.33; // higher = longer wobble
      [state.drag, state.dragV] = dampedSpring(state.drag, state.dragTarget, state.dragV, spring, damping);
      // Wobble on release (slower phase for more dissolution)
      if (Math.abs(state.dragTarget) < 0.1 && Math.abs(state.drag) > 0.1) {
        state.wobble += 0.04 + orbMorphSpeeds[i] * 0.9; // slower, unique for each orb
        state.drag += Math.sin(state.wobble) * Math.max(0, Math.abs(state.drag) * 0.13 * (1 + orbMorphSpeeds[i]));
      } else if (Math.abs(state.dragTarget) < 0.1) {
        state.wobble = 0; // reset when at rest
      }
      // Decay dragTarget very slowly for beautiful dissolution
      state.dragTarget = approach(state.dragTarget, 0, 0.018 + orbMorphSpeeds[i] * 0.6);
      // (Squash & mouseDir to be handled in next steps)
    }

    // --- Parent orb ---
    const parentState = orbStates[0];
    const parentMorphT = now * 0.0004;
    const parentDrag = parentState.drag;
    // Morph: drag stretches along its direction, so project drag
    const parentAngle = orbMorphDirections[0];
    const parentDx = Math.cos(parentAngle) * parentDrag;
    const parentDy = Math.sin(parentAngle) * parentDrag;
    const scale = window.orbScale || 1;

    // --- Animate parent orb's position with slow, organic drift ---
    const {vw, vh} = window.viewportSize || {vw: 800, vh: 800};
    // Center in viewport, allow significantly reduced drift
    const driftFactor = 0.01; // Reduced drift amplitude
    const px = window.parentCenterBase.x + Math.sin(now * 0.00011) * vw * driftFactor + Math.cos(now * 0.00007) * vw * driftFactor;
    const py = window.parentCenterBase.y + Math.cos(now * 0.00009) * vh * driftFactor + Math.sin(now * 0.00016) * vh * driftFactor;
    window.parentCenter = {x: px, y: py};

    const parentR = (parentRadius + parentDrag * 0.15) * scale;
    const parentAmp = (1 + Math.abs(parentDrag) * 0.008) * scale;
    const parentPath = generateSuperSmoothBlob(px + parentDx * scale, py + parentDy * scale, parentR, 64, parentMorphT, parentAmp);
    parentOrb.setAttribute('d', parentPath);

    // --- Update Text Container Position & Scale ---
    if (orbTextContainer) {
      const textX = px + parentDx * scale;
      const textY = py + parentDy * scale;
      // Apply scale and translate to center the text within the orb
      orbTextContainer.style.transform = `translate(${textX}px, ${textY}px) translate(-50%, -50%) scale(${scale})`;
    }

    // --- Children ---
    childrenGroup.innerHTML = ''; // Clear previous children paths
    for (let i = 0; i < childCount; i++) {
      const state = orbStates[i + 1];
      // Animate dynamic color family for each orb
      const fam = getDynamicColorFamily(i, now);
      const tcol = 0.5 + 0.5 * Math.sin(now * 0.0005 + i);
      const c0s0El = document.getElementById(`c${i}s0`);
      const c0s1El = document.getElementById(`c${i}s1`);
      if (c0s0El) c0s0El.setAttribute("stop-color", lerpColor(fam[0], fam[1], tcol));
      if (c0s1El) c0s1El.setAttribute("stop-color", lerpColor(fam[1], fam[0], tcol));

      // --- Animate dynamic, space-filling child orbits ---
      const baseAngle = (now * 0.00022 + i * (2 * Math.PI / childCount));
      const parentCurrentR = (parentRadius + state.drag * 0.15) * scale; // Use current parent radius
      
      // Max allowed: from edge of parent to edge of screen (relative to parent center)
      const minEdgeDist = Math.min(
        window.parentCenter.x,
        vw - window.parentCenter.x,
        window.parentCenter.y,
        vh - window.parentCenter.y
      );
      const maxChildOrbit = Math.max(40 * scale, minEdgeDist - parentCurrentR - childRadius * scale - 16 * scale);
      
      // Animate orbit radius: base + unique slow sine + unique noise
      const orbitPhase = now * (0.00012 + 0.00007 * i) + i * 1.13;
      const orbitWobble = Math.sin(orbitPhase) * 0.18 + Math.cos(orbitPhase * 0.7) * 0.09;
      const minOrbit = parentCurrentR + childRadius * scale + 12 * scale;
      // Reduced base distance (30 instead of 60) to bring children closer
      let rawOrbit = (parentCurrentR + 30 * scale + (i * 0.71 + 1.4) * maxChildOrbit / childCount) * (0.7 + 0.23 * orbitWobble);
      const orbitRadius = Math.max(rawOrbit, minOrbit);
      
      const ellipseA = orbitRadius * 1.3 * (0.97 + 0.07 * Math.sin(now * 0.00013 + i));
      const ellipseB = orbitRadius * 1.1 * (0.97 + 0.07 * Math.cos(now * 0.00016 + i * 2));
      const angle = baseAngle + Math.sin(now * 0.00009 + i * 1.7) * 0.22;
      const dragAngle = orbMorphDirections[i + 1];
      const dx = Math.cos(dragAngle) * state.drag;
      const dy = Math.sin(dragAngle) * state.drag;
      
      // Child position relative to parent center
      const childRelX = Math.cos(angle) * ellipseA + dx * scale;
      const childRelY = Math.sin(angle) * ellipseB + dy * scale;
      
      const x = window.parentCenter.x + childRelX;
      const y = window.parentCenter.y + childRelY;
      
      const cR = (childRadius + state.drag * 0.08) * scale;
      const cAmp = (childAmp + Math.abs(state.drag) * 0.006) * scale;
      const morphT = now * 0.0005 + i * 10;
      
      // Generate path using absolute viewport coordinates
      const childPath = generateSuperSmoothBlob(x, y, cR, childPoints, morphT, cAmp, i);
      
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
    // Animate and render particles
    animateParticles();
    requestAnimationFrame(animate);
  }

  // Start animation
  animate();
});
