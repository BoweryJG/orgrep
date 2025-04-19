// Adds fade-in-on-scroll animation to elements with the class .fade-in-on-scroll
(function() {
  function onScrollFadeIn() {
    var elements = document.querySelectorAll('.fade-in-on-scroll');
    var windowHeight = window.innerHeight;
    elements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 60) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });
  }
  window.addEventListener('scroll', onScrollFadeIn);
  window.addEventListener('resize', onScrollFadeIn);
  document.addEventListener('DOMContentLoaded', onScrollFadeIn);
})();
