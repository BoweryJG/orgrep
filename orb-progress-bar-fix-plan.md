# Guide Orb & Progress Bar Transition Fix Plan

## Objective
- Ensure the guide orb and progress bar only appear after the correct scroll-triggered animation from the logo orb.
- The guide orb and progress bar should always align to the left edge of the viewport, even on mobile devices.

## Steps

1. **Review and Correct Transition Logic**
   - Check `js/script.js` for the functions controlling the orb transition (`animateOrbToGuideBar`, `animateOrbToLogo`).
   - Ensure the guide orb and progress bar are hidden on page load and only shown after the scroll trigger.

2. **Enforce Left Alignment on All Screen Sizes**
   - Update CSS to ensure `.progress-indicator` and `#guide-orb` are always a fixed distance from the left edge (e.g., `left: 15px`), regardless of screen width.
   - Remove or adjust any media queries that hide or move the progress bar on mobile.
   - Update JS (`alignProgressBarToLogo`) to skip dynamic centering and always use left alignment.

3. **Verify Initial State and Scroll Event Handling**
   - Confirm that the initial state hides both the guide orb and progress bar.
   - Ensure scroll event logic only shows the guide orb after the transition.

4. **Diagram: State Transitions**

```mermaid
stateDiagram-v2
    [*] --> LogoOrbVisible: Page Load
    LogoOrbVisible --> GuideOrbAppearing: Scroll past "evolved" point
    GuideOrbAppearing --> GuideOrbActive: Animation complete
    GuideOrbActive --> LogoOrbReturning: Scroll back to top
    LogoOrbReturning --> LogoOrbVisible: Animation complete

    state LogoOrbVisible {
      [*] --> mini-orb: visible
      guide-orb: hidden
      progressIndicator: hidden
    }
    state GuideOrbAppearing {
      mini-orb: animating out
      guide-orb: animating in
      progressIndicator: appearing
    }
    state GuideOrbActive {
      mini-orb: hidden or static
      guide-orb: visible, tracks section
      progressIndicator: visible, left-aligned
    }
    state LogoOrbReturning {
      guide-orb: animating out
      mini-orb: animating in
      progressIndicator: hiding
    }
```

## Notes
- All alignment and visibility logic should be robust to window resizing and orientation changes.
- Test on both desktop and mobile to ensure consistent left alignment and correct transition behavior.