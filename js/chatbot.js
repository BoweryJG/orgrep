// OllieiQ chatbot with animated orb launcher

console.log("OllieiQ chatbot script loaded");

document.addEventListener('DOMContentLoaded', function() {
  // Use the animated orb SVG as the launcher (must exist in HTML with id 'ollie-orb')
  let launcher = document.getElementById('ollie-launcher');
  if (!launcher) {
    launcher = document.createElement('div');
    launcher.id = 'ollie-launcher';
    // Elegant chat bubble SVG icon
    launcher.innerHTML = `
      <svg viewBox="0 0 32 32">
        <path d="M16 5c-6.075 0-11 3.807-11 8.5 0 2.222 1.182 4.236 3.137 5.74-.13.77-.567 2.44-1.364 4.021-.191.393.241.795.623.623 2.099-.948 4.003-2.009 4.003-2.009.998.188 2.049.292 3.188.292 6.075 0 11-3.807 11-8.5S22.075 5 16 5z" />
      </svg>
    `;
    // DEBUG: Make launcher impossible to miss
    // Use the animated orb SVG as the launcher, exactly as in animated-orb.svg
    // Use the animated orb SVG, scaled to 72x72px, no overflow
    launcher.innerHTML = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" width="160" height="160" style="display:block; position:absolute; top:-40px; left:-40px; pointer-events:none;">
<defs>
  <radialGradient id="grad1" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
    <animate attributeName="fx" values="50%;45%;55%;48%;52%;50%" dur="27s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8" />
    <animate attributeName="fy" values="50%;55%;45%;52%;48%;50%" dur="31s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8" />
    <stop offset="0%" stop-color="#00E5FF">
      <animate attributeName="stop-color"
        values="#00E5FF; #00FFAA; #AAFF00; #FFAA00; #FF00AA; #AA00FF; #0055FF; #00E5FF"
        dur="120s" repeatCount="indefinite" />
    </stop>
    <stop offset="85%" stop-color="#5B3CFF">
      <animate attributeName="stop-color"
        values="#5B3CFF; #0055FF; #00E5FF; #00FFAA; #AAFF00; #FFAA00; #FF00AA; #AA00FF; #5B3CFF"
        dur="100s" repeatCount="indefinite" />
      <animate attributeName="offset"
        values="85%;75%;80%;85%"
        dur="35s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8" />
    </stop>
  </radialGradient>
  <path id="parentOrb" d="M200,160 C236,160 265,180 265,210 C265,240 236,270 200,270 C164,270 135,240 135,210 C135,180 164,160 200,160 Z">
    <animate attributeName="d"
      values="M200,160 C236,160 265,180 265,210 C265,240 236,270 200,270 C164,270 135,240 135,210 C135,180 164,160 200,160 Z;
              
              M190,140 C235,130 260,155 270,195 C280,235 260,260 225,275 C190,290 140,275 125,235 C110,195 145,150 190,140 Z;
              
              M200,130 C240,140 270,170 260,220 C250,270 215,290 180,280 C145,270 110,240 120,200 C130,160 160,120 200,130 Z;
              
              M210,150 C245,160 275,190 270,230 C265,270 235,290 195,285 C155,280 120,255 115,215 C110,175 140,150 180,145 C185,145 205,147 210,150 Z;
              
              M180,140 C220,130 260,150 275,190 C290,230 270,270 230,285 C190,300 140,285 115,245 C90,205 100,155 140,140 C150,136 170,135 180,140 Z;
              
              M200,160 C236,160 265,180 265,210 C265,240 236,270 200,270 C164,270 135,240 135,210 C135,180 164,160 200,160 Z"
      dur="80s" repeatCount="indefinite" calcMode="spline"
      keySplines="0.8 0.2 0.2 0.8; 0.8 0.2 0.2 0.8; 0.8 0.2 0.2 0.8; 0.8 0.2 0.2 0.8; 0.8 0.2 0.2 0.8" />
  </path>
  <filter id="emotionalGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="15" result="blur1">
      <animate attributeName="stdDeviation" values="15;18;15;12;15" dur="25s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8" />
    </feGaussianBlur>
    <feGaussianBlur stdDeviation="25" result="blur2">
      <animate attributeName="stdDeviation" values="25;20;30;25" dur="27s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8; 0.6 0.2 0.4 0.8" />
    </feGaussianBlur>
    <feBlend mode="screen" in="blur1" in2="blur2" result="blendedGlow" />
    <feComposite in="SourceGraphic" in2="blendedGlow" operator="over" />
  </filter>
</defs>
<g>
  <use href="#parentOrb" fill="url(#grad1)" filter="url(#emotionalGlow)">
    <animateTransform attributeName="transform"
                      type="rotate"
                      from="0 200 200"
                      to="360 200 200"
                      dur="240s"
                      repeatCount="indefinite"
                      additive="sum" />
  </use>
  <animateTransform attributeName="transform"
                    type="translate"
                    values="0,0; 8,-10; 15,-5; 12,8; 4,12; 0,0"
                    dur="60s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6"
                    additive="sum" />
  <animateTransform attributeName="transform"
                    type="scale"
                    values="1;1.02;0.99;1.01;1"
                    dur="40s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6; 0.6 0.4 0.4 0.6"
                    additive="sum" />
</g>
</svg>`;

    launcher.style.background = 'none';
    launcher.style.border = 'none';
    launcher.style.zIndex = '10000';
    launcher.style.display = 'block';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '32px';
    launcher.style.right = '32px';
    launcher.style.width = '80px';
    launcher.style.height = '80px';
    launcher.style.borderRadius = '50%';
    launcher.style.overflow = 'visible';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '32px';
    launcher.style.right = '32px';
    launcher.style.background = 'none';
    launcher.style.border = '2px dashed #0ff'; // TEMP: outline for debugging, remove after
    launcher.style.boxShadow = 'none';
    launcher.style.cursor = 'pointer';
    launcher.style.padding = '0';
    launcher.style.margin = '0';
    launcher.style.overflow = 'hidden';

    document.body.appendChild(launcher);
  }

  // Create chatbot window
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window hidden';
  chatWindow.innerHTML = `
    <div class="chatbot-header">OllieiQ <span class="chatbot-close">×</span></div>
    <div class="chatbot-messages"></div>
    <form class="chatbot-form">
      <input type="text" id="ollie-chat-input" name="ollie-chat-input" class="chatbot-input" placeholder="Type a message..." autocomplete="off" required />
      <button type="submit" class="stunning-btn">Send</button>
    </form>
  `;
  document.body.appendChild(chatWindow);

  // Show/hide logic
  launcher.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
  });
  chatWindow.querySelector('.chatbot-close').onclick = () => {
    chatWindow.classList.add('hidden');
  };

  // Supabase Edge Function handler
  const form = chatWindow.querySelector('.chatbot-form');
  const messages = chatWindow.querySelector('.chatbot-messages');
  form.onsubmit = function(e) {
    e.preventDefault();
    const input = chatWindow.querySelector('.chatbot-input');
    const userMsg = input.value.trim();
    if (!userMsg) return;
    messages.innerHTML += `<div class='chatbot-msg user'>${userMsg}</div>`;
    input.value = '';
    // Show loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chatbot-msg bot';
    loadingMsg.textContent = 'Thinking...';
    messages.appendChild(loadingMsg);
    messages.scrollTop = messages.scrollHeight;
    // Call Supabase Edge Function
    fetch('https://cbopynuvhcymbumjnvay.functions.supabase.co/openai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU'
      },
      body: JSON.stringify({ message: userMsg })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Backend response:", data); // Debug log
      loadingMsg.remove();
      if (data.reply) {
        messages.innerHTML += `<div class='chatbot-msg bot'>${data.reply}</div>`;
      } else if (data.error) {
        messages.innerHTML += `<div class='chatbot-msg bot'>Error: ${data.error}</div>`;
      } else {
        messages.innerHTML += `<div class='chatbot-msg bot'>Unknown error.</div>`;
      }
      messages.scrollTop = messages.scrollHeight;
    })
    .catch((err) => {
      loadingMsg.textContent = 'Sorry, there was an error.';
      messages.scrollTop = messages.scrollHeight;
      console.error("Fetch error:", err);
    });
  };
});
