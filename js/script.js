// --- Orb Animation Code ---
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

const orbAnimationConfig = {
    childCount: 5,
    colorFamilies: [
        ["#B3D8FF", "#0A192F"],
        ["#C6FFD9", "#145A32"],
        ["#FFB3C9", "#7B1F3A"],
        ["#E0D1FF", "#311B4F"],
        ["#FFF5B3", "#4B3800"]
    ],
    parentCenter: {x: 400, y: 400},
    parentRadius: 100,
    childRadius: 36,
    childPoints: 48,
    childAmp: 0.5,
    childGradIds: [
        "childGrad0", "childGrad1", "childGrad2", "childGrad3", "childGrad4"
    ],
    childrenGroup: null, // Will be assigned in DOMContentLoaded
    childOrbs: []      // Will be assigned in DOMContentLoaded
};

function animateOrb() {

  const { parentCenter, parentRadius, childCount, childGradIds, colorFamilies, childRadius, childPoints, childAmp, childrenGroup, childOrbs } = orbAnimationConfig;

  // Check if elements are ready
  if (!childrenGroup || !document.getElementById('parentOrb')) {
      requestAnimationFrame(animateOrb); // Try again next frame if not ready
      return;
  }

  const parentStops = [
    { id: "p0", phase: 0 },
    { id: "p1", phase: Math.PI * 0.5 },
    { id: "p2", phase: Math.PI },
    { id: "p3", phase: Math.PI * 1.5 }
  ];
  const baseHue = (performance.now() * 0.01) % 360;
  for (let i = 0; i < parentStops.length; i++) {
    const stop = parentStops[i];
    const stopElement = document.getElementById(stop.id);
    if (stopElement) {
        const hue = (baseHue + 60 * Math.sin(performance.now() * 0.00015 + stop.phase)) % 360;
        const sat = 80 + 10 * Math.sin(performance.now() * 0.0002 + stop.phase);
        const light = 60 + 10 * Math.cos(performance.now() * 0.00018 + stop.phase);
        stopElement.setAttribute("stop-color", hslToHex(hue, sat, light));
    }
  }

  const now = performance.now();
  const t = now * 0.0004;
  const parentPath = generateSuperSmoothBlob(parentCenter.x, parentCenter.y, parentRadius, 64, t, 1);
  const parentOrbElement = document.getElementById('parentOrb');
  if (parentOrbElement) {
      parentOrbElement.setAttribute('d', parentPath);
  }

  for (let i = 0; i < childCount; i++) {
    const fam = colorFamilies[i];
    const gradStartElement = document.getElementById(`c${i}s0`);
    const gradEndElement = document.getElementById(`c${i}s1`);
    if (gradStartElement && gradEndElement) {
        const tcol = 0.5 + 0.5 * Math.sin(now * 0.0005 + i);
        gradStartElement.setAttribute("stop-color", lerpColor(fam[0], fam[1], tcol));
        gradEndElement.setAttribute("stop-color", lerpColor(fam[1], fam[0], tcol));
    }

    const angle = (now * 0.0003 + i * (2 * Math.PI / childCount));
    // Adjust orbit radius calculation if needed, ensure parentRadius is correct
    const orbitRadius = parentRadius + 120 + i * 40;
    const x = parentCenter.x + Math.cos(angle) * orbitRadius;
    const y = parentCenter.y + Math.sin(angle) * orbitRadius;
    const morphT = now * 0.0005 + i * 10;
    const childPath = generateSuperSmoothBlob(x, y, childRadius, childPoints, morphT, childAmp, i);

    if(childOrbs[i]) {
        childOrbs[i].setAttribute("d", childPath);
    }
  }
  requestAnimationFrame(animateOrb);
}

// --- Main Site Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Fix: Define navbar so it can be safely used below
    const navbar = document.querySelector('.navbar');
    // Assign DOM elements
    // (migrated to DOMContentLoaded)
    // (migrated to DOMContentLoaded)
    // (migrated to DOMContentLoaded)

    // Align the guide orb and progress bar to the center of the logo orb
    // function alignGuideBarAndOrbToLogo(miniOrb, guideOrb, progressIndicator) {
    //   // Removed: guideOrb logic for static orb
    // }
        if (!miniOrb || !guideOrb || !progressIndicator) return;
        const orbRect = miniOrb.getBoundingClientRect();
        const centerX = orbRect.left + orbRect.width / 2;
        guideOrb.style.position = 'fixed';
        guideOrb.style.left = `${centerX - guideOrb.offsetWidth / 2}px`;
        progressIndicator.style.position = 'fixed';
        progressIndicator.style.left = `${centerX - progressIndicator.offsetWidth / 2}px`;
        progressIndicator.style.top = '0px';
        progressIndicator.style.zIndex = 10002;
    }

    // Show/hide guide bar after scrolling a bit
    function handleGuideBarScrollVisibility(progressIndicator) {
        if (!progressIndicator) return;
        if (window.scrollY > 100) {
            progressIndicator.style.opacity = '1';
            progressIndicator.style.pointerEvents = 'auto';
        } else {
            progressIndicator.style.opacity = '0';
            progressIndicator.style.pointerEvents = 'none';
        }
    }

    // Initial setup
    const miniOrb = document.getElementById('mini-orb');
    // guide-orb and progress bar logic removed for static orb in logo
    if (miniOrb) miniOrb.style.opacity = '1';

    // Scroll trigger logic
    let orbActive = false;
    window.addEventListener('scroll', () => {
        if (!miniOrb || !guideOrb) return;
        if (window.scrollY > 100 && !orbActive) {
            // Animate orb out of logo to left
            miniOrb.style.opacity = '0';
            guideOrb.style.display = 'block';
            guideOrb.style.position = 'fixed';
            guideOrb.style.left = '24px';
            guideOrb.style.top = '24px';
            guideOrb.style.opacity = '1';
            orbActive = true;
        } else if (window.scrollY <= 100 && orbActive) {
            // Animate orb back to logo
            guideOrb.style.display = 'none';
            miniOrb.style.opacity = '1';
            orbActive = false;
        }
    }, { passive: true });

    // On resize, keep guide orb fixed on left if active
    window.addEventListener('resize', () => {
        if (guideOrb && orbActive) {
            guideOrb.style.left = '24px';
            guideOrb.style.top = '24px';
        }
    });

    // If navbar or logo layout changes dynamically (e.g., by JS or menu toggle), re-align
    // (migrated to DOMContentLoaded)
    if (navbar) {
        const observer = new MutationObserver(() => {
            alignGuideBarAndOrbToLogo(miniOrb, guideOrb, progressIndicator);
        });
        observer.observe(navbar, { attributes: true, childList: true, subtree: true });
    }

    // Ensure bar aligns to orb on load
    if (typeof alignGuideBarAndOrbToLogo === 'function') alignGuideBarAndOrbToLogo(miniOrb, guideOrb, progressIndicator);

    // If navbar or logo layout changes dynamically (e.g., by JS or menu toggle), re-align
    // (migrated to DOMContentLoaded)
    if (navbar) {
        const observer = new MutationObserver(() => {
            if (typeof alignGuideBarAndOrbToLogo === 'function') alignGuideBarAndOrbToLogo(miniOrb, guideOrb, progressIndicator);
        });
        observer.observe(navbar, { attributes: true, childList: true, subtree: true });
    }


    // --- Orb Animation Initialization ---
    const orbSVGElement = document.getElementById('orbSVG');
    if (orbSVGElement) {
        orbAnimationConfig.childrenGroup = document.getElementById('children');
        if (orbAnimationConfig.childrenGroup) {
            // Create child orb elements if they don't exist yet (defensive check)
             if (orbAnimationConfig.childOrbs.length === 0) {
                for (let i = 0; i < orbAnimationConfig.childCount; i++) {
                  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  path.setAttribute("fill", `url(#${orbAnimationConfig.childGradIds[i]})`);
                  path.setAttribute("opacity", "0.95");
                  orbAnimationConfig.childrenGroup.appendChild(path);
                  orbAnimationConfig.childOrbs.push(path);
                }
            }
            // Start the orb animation
            animateOrb();
        } else {
             console.error("Orb children group element not found.");
        }
    } else {
         console.error("Orb SVG element not found.");
    }


    // --- Configuration ---
    const CONFIG = {
        numStars: 250,
        numSatelliteParticles: 8,
        numCentralParticles: 40,
        orbitRadii: [160, 220, 280, 180, 250, 200],
        scrollThrottleDelay: 16,
        mouseMoveThrottleDelay: 50,
        ecosystemMouseSensitivity: 0.01,
        satelliteMouseSensitivityFactor: 0.005,
        centralSphereMouseSensitivityFactor: 0.002,
        parallaxSpeed: 0.3,
        scrollPulseTimeout: 150,
        scrollNavTimeout: 800
    };

    // --- DOM Element Caching ---
    const starsContainer = document.getElementById('stars');
    const satelliteElements = document.querySelectorAll('.satellite');
    const satelliteContents = document.querySelectorAll('.satellite-content');
    const centerSphere = document.querySelector('.center-sphere');
    const ecosystem = document.querySelector('.ecosystem');
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieButtons = document.querySelectorAll('.cookie-btn');
    const parallaxElements = document.querySelectorAll('.parallax');
    // (migrated to DOMContentLoaded)
    const progressTracker = document.getElementById('progressTracker');
    const progressTrail = document.getElementById('progressTrail');
    const currentYearSpan = document.getElementById('currentYear');
    const sectionsForScroll = document.querySelectorAll('.section, .hero, .parallax, .footer'); // Sections for progress dots

    // --- Guide Orb & Progress Bar Scroll Logic ---

    // Flash animation for logo orb (mini-orb)
    function triggerLogoOrbFlash() {
    const miniOrb = document.getElementById('mini-orb');
    if (!miniOrb) return;
    miniOrb.classList.add('orb-flash');
    setTimeout(() => {
        miniOrb.classList.remove('orb-flash');
    }, 400); // Duration matches CSS animation
}
    const heroEvolved = document.querySelector('.hero-evolved');
    // (migrated to DOMContentLoaded)
    // (migrated to DOMContentLoaded)
    // (Removed duplicate progressIndicator declaration)

    let guideBarActive = false;
    let orbAnimating = false;

    // Helper: Get the center position of the logo orb in the viewport
    function getMiniOrbCenter(miniOrb) {
        if (!miniOrb) return { x: 0, y: 0 };
        const logo = miniOrb.closest('svg');
        if (!logo) return { x: 0, y: 0 };
        const rect = logo.getBoundingClientRect();
        // SVG viewBox is 24x24, orb is at (12,12) with r=5
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }


    // Scroll trigger logic
    function checkScrollTrigger() {
        if (!heroEvolved) return;
        const rect = heroEvolved.getBoundingClientRect();
        const trigger = rect.top < window.innerHeight * 0.25; // Trigger when "evolved" is 25% from top
        if (trigger && !guideBarActive && !orbAnimating) {
            triggerLogoOrbFlash();
            setTimeout(() => {
                animateOrbToGuideBar();
            }, 400); // Wait for flash to finish before animating
        } else if (!trigger && guideBarActive && !orbAnimating) {
            animateOrbToLogo();
        }
    }

    // Initial state
    if (progressIndicator) progressIndicator.style.display = 'none';
    // if (guideOrb) guideOrb.style.display = 'none'; // guideOrb removed
    if (miniOrb) miniOrb.style.opacity = '1';

    window.addEventListener('scroll', checkScrollTrigger, { passive: true });
    window.addEventListener('resize', checkScrollTrigger);

    // --- Utility Functions ---
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    };

    const getRandom = (min, max) => Math.random() * (max - min) + min;

     // --- Initialization Functions ---

    // Create twinkling stars
    const createStarryBackground = () => {
        if (!starsContainer) return;
        starsContainer.innerHTML = ''; // Clear existing stars
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < CONFIG.numStars; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const size = getRandom(1, 3);
            const brightness = getRandom(0.4, 0.9);

            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.opacity = brightness.toString();
            star.style.left = `${getRandom(0, 100)}%`;
            star.style.top = `${getRandom(0, 100)}%`;
            star.style.animationDelay = `${getRandom(0, 8)}s`;
            star.style.animationDuration = `${getRandom(2, 5)}s`;

            fragment.appendChild(star);
        }
        starsContainer.appendChild(fragment);
    };

     // Enhance satellite content with inner elements and particles
    const enhanceSatellites = () => {
         satelliteContents.forEach(satellite => {
             // Wrap text only if it hasn't been wrapped already
             if (!satellite.querySelector('span')) {
                const text = satellite.textContent.trim();
                satellite.innerHTML = `<span>${text}</span>`; // Keep text wrapped
             } else {
                 // Remove any old particles before adding new ones
                 satellite.querySelectorAll('.satellite-particle').forEach(p => p.remove());
             }

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < CONFIG.numSatelliteParticles; i++) {
                const particle = document.createElement('div');
                particle.classList.add('satellite-particle');
                const size = getRandom(2, 6);
                particle.style.width = `${size}px`;
                particle.style.height = particle.style.width;

                const angle = getRandom(0, Math.PI * 2);
                const radius = getRandom(0, 35);
                const x = Math.cos(angle) * radius + 50;
                const y = Math.sin(angle) * radius + 50;

                particle.style.left = `${x}%`;
                particle.style.top = `${y}%`;
                particle.style.animation = `particlePulsate ${getRandom(2, 5)}s ease-in-out infinite alternate`;
                particle.style.animationDelay = `${getRandom(0, 2)}s`;
                fragment.appendChild(particle);
            }
             satellite.appendChild(fragment);
        });
    };


    // Add particles to the central sphere
    const addCentralParticles = () => {
        if (!centerSphere) return;
         // Clear old particles first
        centerSphere.querySelectorAll('.central-particle').forEach(p => p.remove());

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < CONFIG.numCentralParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('central-particle');
            const size = getRandom(2, 8);
            particle.style.width = `${size}px`;
            particle.style.height = particle.style.width;

            const angle = getRandom(0, Math.PI * 2);
            const radius = getRandom(0, 40);
            const x = Math.cos(angle) * radius + 50;
            const y = Math.sin(angle) * radius + 50;

            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.animation = `particleFloat ${getRandom(10, 25)}s linear infinite alternate`;
            particle.style.animationDelay = `${getRandom(0, 10)}s`;

            fragment.appendChild(particle);
         }
         // Append particles relative to the content div to be above ::after pseudo-element
         const contentDiv = centerSphere.querySelector('.center-sphere-content');
         if (contentDiv) {
            contentDiv.parentNode.insertBefore(fragment, contentDiv); // Insert before content text
         } else {
            centerSphere.appendChild(fragment); // Fallback
         }
    };

    // Create satellite orbit animations dynamically
    const createOrbitAnimations = () => {
        let dynamicCSS = '';
        satelliteElements.forEach((satellite, index) => {
            const orbitRadius = CONFIG.orbitRadii[index % CONFIG.orbitRadii.length];
            const duration = 20 + (index * 5);
            const direction = index % 2 === 0 ? 1 : -1;
            const delay = index * 1.5;
            const startAngle = index * 60;

            // Apply animation via style
            satellite.style.animation = `orbit${index + 1} ${duration}s ${delay}s linear infinite ${direction === -1 ? 'reverse' : ''}`;

            const tiltX = getRandom(70, 85);
            const tiltY = getRandom(-10, 10);
            const tiltZ = getRandom(-10, 10);
             const axisY = getRandom(0.1, 0.5);
             const axisZ = getRandom(0.1, 0.5);

            dynamicCSS += `
                @keyframes orbit${index + 1} {
                    0% {
                        transform:
                            rotate3d(1, ${axisY.toFixed(2)}, ${axisZ.toFixed(2)}, ${tiltX}deg)
                            rotateY(${tiltY}deg)
                            rotateZ(${startAngle}deg)
                            translateX(${orbitRadius}px)
                            rotateZ(-${startAngle}deg);
                    }
                    100% {
                        transform:
                             rotate3d(1, ${axisY.toFixed(2)}, ${axisZ.toFixed(2)}, ${tiltX}deg)
                             rotateY(${tiltY}deg)
                             rotateZ(${startAngle + 360 * direction}deg)
                             translateX(${orbitRadius}px)
                             rotateZ(-${startAngle + 360 * direction}deg);
                    }
                }
            `;
        });

         if (dynamicCSS) {
             const styleSheet = document.createElement("style");
             styleSheet.type = "text/css";
             styleSheet.innerText = dynamicCSS;
             document.head.appendChild(styleSheet);
         }
    };


    // --- Scroll Indicator Logic ---
    let scrollIndicatorCreated = false;
    const createScrollIndicator = () => {
        if (!progressIndicator || scrollIndicatorCreated) return;

         progressIndicator.querySelectorAll('.progress-dot').forEach(dot => dot.remove());

         const windowHeight = window.innerHeight;
         const docHeight = Math.max(
             document.body.scrollHeight, document.documentElement.scrollHeight,
             document.body.offsetHeight, document.documentElement.offsetHeight,
             document.body.clientHeight, document.documentElement.clientHeight
         ) - windowHeight;

         if (docHeight <= 0) return;

         const fragment = document.createDocumentFragment();

         sectionsForScroll.forEach((section, index) => {
             const sectionOffset = section.offsetTop;
             const sectionProgress = (sectionOffset - windowHeight / 2) / docHeight;

             if (sectionProgress >= 0 && sectionProgress <= 1) {
                 const dot = document.createElement('div');
                 dot.classList.add('progress-dot');
                 const sectionId = section.id || `section-${index}`;
                 if (!section.id) section.id = sectionId;
                 dot.dataset.sectionId = sectionId;
                 dot.style.top = `${Math.min(100, Math.max(0, sectionProgress * 100))}%`;

                 const sectionTitleElement = section.querySelector('.section-title, h1, h2'); // Try to find title
                 const sectionTitle = sectionTitleElement ? sectionTitleElement.textContent.split('\n')[0].trim() : // Get first line if multiple
                                     (section.id ? section.id.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) : `Section ${index+1}`);
                 dot.dataset.label = sectionTitle;

                 fragment.appendChild(dot);
             }
         });

         progressIndicator.appendChild(fragment);
         scrollIndicatorCreated = true;
    };

    let progressTrackerTimeout;
     const updateScrollProgress = () => {
         const scrollY = window.scrollY;
         const windowHeight = window.innerHeight;
         const docHeight = Math.max(
             document.body.scrollHeight, document.documentElement.scrollHeight,
             document.body.offsetHeight, document.documentElement.offsetHeight,
             document.body.clientHeight, document.documentElement.clientHeight
         ) - windowHeight;

         if (docHeight <= 0 || !progressTracker) return;

         const scrollProgress = Math.min(1, Math.max(0, scrollY / docHeight));

         progressTracker.style.top = `${scrollProgress * 100}%`;

         clearTimeout(progressTrackerTimeout);
         progressTracker.style.transform = 'translateX(-50%) scale(1.3)';
         progressTracker.style.boxShadow = '0 0 20px var(--scroll-tracker-shadow), 0 0 40px color-mix(in srgb, var(--scroll-tracker-shadow) 50%, transparent)';

         progressTrackerTimeout = setTimeout(() => {
             progressTracker.style.transform = 'translateX(-50%)';
             progressTracker.style.boxShadow = '0 0 15px var(--scroll-tracker-shadow), 0 0 30px var(--scroll-tracker-shadow-faded)';
         }, CONFIG.scrollPulseTimeout);

         if (progressTrail) {
            const trailHeight = scrollProgress * windowHeight * 0.15;
            progressTrail.style.height = `${Math.max(0, trailHeight)}px`;
            progressTrail.style.top = `${scrollProgress * 100}%`;
            progressTrail.style.opacity = scrollProgress > 0.01 ? '0.6' : '0';
          }

         let activeSection = null;
         sectionsForScroll.forEach(section => {
             const sectionTop = section.offsetTop - windowHeight / 2.5;
             const sectionBottom = sectionTop + section.offsetHeight;
             if (scrollY >= sectionTop && scrollY < sectionBottom) {
                 activeSection = section;
             }
         });

         document.querySelectorAll('.progress-dot').forEach(dot => {
             const isActive = activeSection && dot.dataset.sectionId === activeSection.id;
             dot.classList.toggle('active', isActive);
         });

          // --- Parallax Effect ---
          parallaxElements.forEach(parallax => {
             const elementRect = parallax.getBoundingClientRect();
            if (elementRect.top < windowHeight && elementRect.bottom > 0) {
                 const elementCenterY = elementRect.top + elementRect.height / 2;
                 const viewportCenterY = windowHeight / 2;
                 const difference = viewportCenterY - elementCenterY;
                 const yPos = difference * CONFIG.parallaxSpeed;
                parallax.style.backgroundPosition = `center ${yPos}px`;
            }
        });

         // --- Scroll-based Ecosystem Animation ---
         if (ecosystem) {
            const ecosystemRect = ecosystem.getBoundingClientRect();
             if (ecosystemRect.top < windowHeight && ecosystemRect.bottom > 0) {
                 const viewportPosition = (windowHeight - ecosystemRect.top) / (windowHeight + ecosystemRect.height);
                 const scrollRotationDegree = (Math.max(0, Math.min(1, viewportPosition)) - 0.5) * 20;

                 // Get current mouse-based transform if any
                 const currentTransform = ecosystem.style.transform;
                 let mouseRotateX = 0;
                 let mouseRotateY = 0;
                 const mouseRotateMatch = currentTransform.match(/rotateX\(([-\d.]+)deg\) rotateY\(([-\d.]+)deg\)/);
                 if(mouseRotateMatch){
                    // This logic is tricky: assumes mouse rotation is always applied after scroll rotation
                    // Let's simplify: Apply scroll rotation directly, mouse adds on top in handleMouseMove
                    mouseRotateX = parseFloat(mouseRotateMatch[1]) - scrollRotationDegree; // Try to isolate mouse X
                    mouseRotateY = parseFloat(mouseRotateMatch[2]);
                 }

                 // Set the base transform including scroll rotation and any persistent mouse Y rotation
                 ecosystem.style.transform = `perspective(1000px) rotateX(${scrollRotationDegree}deg) rotateY(${mouseRotateY}deg)`;
             }
         }
    };

    const handleDotClick = (event) => {
        const dot = event.target.closest('.progress-dot');
         if (!dot) return;

         const sectionId = dot.dataset.sectionId;
         const section = document.getElementById(sectionId);

         if (section) {
             document.querySelectorAll('.progress-dot').forEach(d => d.classList.remove('active'));
             dot.classList.add('active');

            if(progressTracker) {
                progressTracker.style.transform = 'translateX(-50%) scale(1.5)';
                progressTracker.style.boxShadow = '0 0 25px color-mix(in srgb, var(--scroll-tracker-color) 100%, white), 0 0 50px color-mix(in srgb, var(--scroll-tracker-color) 60%, transparent)';
            }

             section.scrollIntoView({ behavior: 'smooth', block: 'center' });

             setTimeout(() => {
                  if(progressTracker) {
                    progressTracker.style.transform = 'translateX(-50%)';
                    progressTracker.style.boxShadow = '0 0 15px var(--scroll-tracker-shadow), 0 0 30px var(--scroll-tracker-shadow-faded)';
                  }
                  updateScrollProgress();
             }, CONFIG.scrollNavTimeout);
         }
    };

    // --- Mouse Interaction Logic ---
    let ecosystemRectCache = null;
    const handleMouseMove = (event) => {
        if (!ecosystem) return;

        if (!ecosystemRectCache) {
            ecosystemRectCache = ecosystem.getBoundingClientRect();
        }
        const rect = ecosystemRectCache;

         if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;

        const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        const maxDistance = Math.max(rect.width, rect.height) * 0.8;

         if (distance < maxDistance) {
             const rotateY = mouseX * CONFIG.ecosystemMouseSensitivity;
             const rotateX = -mouseY * CONFIG.ecosystemMouseSensitivity;

             // Get current scroll-based X rotation
             const currentTransform = ecosystem.style.transform;
             const scrollRotateMatch = currentTransform.match(/perspective\(1000px\) rotateX\(([-\d.]+)deg\)/);
             let scrollRotateX = 0;
             if (scrollRotateMatch) {
                 scrollRotateX = parseFloat(scrollRotateMatch[1]);
             }

             ecosystem.style.transition = 'transform 0.1s ease-out';
             ecosystem.style.transform = `perspective(1000px) rotateX(${scrollRotateX + rotateX}deg) rotateY(${rotateY}deg)`;

             satelliteElements.forEach((satellite, index) => {
                 const sensitivity = CONFIG.satelliteMouseSensitivityFactor * (index % 3 + 1);
                 satellite.style.marginLeft = `${mouseX * sensitivity}px`;
                 satellite.style.marginTop = `${mouseY * sensitivity}px`;
             });
            if(centerSphere) {
                centerSphere.style.marginLeft = `${mouseX * CONFIG.centralSphereMouseSensitivityFactor}px`;
                centerSphere.style.marginTop = `${mouseY * CONFIG.centralSphereMouseSensitivityFactor}px`;
            }

         } else {
              handleMouseLeave(); // Reset if moved out of range
         }
    };

    const handleMouseLeave = () => {
         if (!ecosystem) return;

         ecosystem.style.transition = 'transform 0.5s ease-out';
         // Reset mouse influence: Re-apply only the scroll-based rotation
         updateScrollProgress(); // This will recalculate and apply the correct scroll rotation

         satelliteElements.forEach(satellite => {
             satellite.style.marginLeft = '0px';
             satellite.style.marginTop = '0px';
             satellite.style.transition = 'margin 0.5s ease-out'; // Smooth return
         });
          if(centerSphere) {
            centerSphere.style.marginLeft = '0px';
            centerSphere.style.marginTop = '0px';
            centerSphere.style.transition = 'margin 0.5s ease-out'; // Smooth return
          }
         ecosystemRectCache = null; // Clear cache
    };


    // --- Event Listeners ---
    const throttledScrollHandler = throttle(updateScrollProgress, CONFIG.scrollThrottleDelay);
    const throttledMouseMoveHandler = throttle(handleMouseMove, CONFIG.mouseMoveThrottleDelay);

    window.addEventListener('scroll', throttledScrollHandler);
    window.addEventListener('resize', throttle(() => {
         ecosystemRectCache = null;
         scrollIndicatorCreated = false;
         createScrollIndicator();
         updateScrollProgress(); // Re-calculate positions after resize
    }, 250));

     if(progressIndicator) {
        progressIndicator.addEventListener('click', handleDotClick);
     }

     if (ecosystem) {
        document.addEventListener('mousemove', throttledMouseMoveHandler);
        document.body.addEventListener('mouseleave', handleMouseLeave);
     }

    // Cookie Banner Logic
    cookieButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (cookieBanner) {
                cookieBanner.style.display = 'none';
                // Add actual cookie setting logic here
                console.log(`Cookie preference: ${btn.textContent.trim()}`);
            }
        });
    });

     // Set current year in footer
     if (currentYearSpan) {
         currentYearSpan.textContent = new Date().getFullYear();
     }


    // --- Initial Setup Calls ---
    createStarryBackground();
    enhanceSatellites();
    createOrbitAnimations();
    addCentralParticles();
    createScrollIndicator();
    updateScrollProgress(); // Initial calculation for scroll/parallax etc.

     // Initial pulse animation for tracker
     setTimeout(() => {
         if(progressTracker) {
            progressTracker.style.transform = 'translateX(-50%) scale(1.5)';
            progressTracker.style.boxShadow = '0 0 25px color-mix(in srgb, var(--scroll-tracker-color) 100%, white), 0 0 50px color-mix(in srgb, var(--scroll-tracker-color) 60%, transparent)';

            setTimeout(() => {
                 if(progressTracker) { // Check again in case it disappeared
                    progressTracker.style.transform = 'translateX(-50%)';
                    progressTracker.style.boxShadow = '0 0 15px var(--scroll-tracker-shadow), 0 0 30px var(--scroll-tracker-shadow-faded)';
                 }
            }, 300);
         }
     }, 500);

}); // End DOMContentLoaded