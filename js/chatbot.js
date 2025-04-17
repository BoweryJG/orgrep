// OllieiQ chatbot with animated orb launcher

console.log("OllieiQ chatbot script loaded");

document.addEventListener('DOMContentLoaded', function() {
  // Use the animated orb SVG as the launcher (must exist in HTML with id 'ollie-orb')
  let launcher = document.getElementById('ollie-launcher');
  if (!launcher) {
    launcher = document.createElement('div');
    launcher.id = 'ollie-launcher';
    // Vibrant chatbot SVG icon
    launcher.innerHTML = `
      <div style="position:relative;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='64' height='64'>
          <defs>
            <linearGradient id='chatbotGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stop-color='#7B42F6' />
              <stop offset='100%' stop-color='#00FFC6' />
              <animate attributeName='x1' values='0%;100%;0%' dur='8s' repeatCount='indefinite' />
              <animate attributeName='y1' values='0%;100%;0%' dur='6s' repeatCount='indefinite' />
            </linearGradient>
            <filter id='chatbotGlow' x='-50%' y='-50%' width='200%' height='200%'>
              <feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur' />
              <feComposite in='blur' in2='SourceGraphic' operator='over' />
              <feFlood flood-color='#7B42F6' flood-opacity='.8' result='glow' />
              <feComposite in='glow' in2='blur' operator='in' result='coloredBlur' />
              <feComposite in='SourceGraphic' in2='coloredBlur' operator='over' />
            </filter>
            <radialGradient id='starGlow' cx='50%' cy='50%' r='50%' fx='50%' fy='50%'>
              <stop offset='0%' stop-color='white' stop-opacity='1' />
              <stop offset='100%' stop-color='white' stop-opacity='0' />
              <animate attributeName='fx' values='40%;60%;40%' dur='3s' repeatCount='indefinite' />
              <animate attributeName='fy' values='40%;60%;40%' dur='2s' repeatCount='indefinite' />
            </radialGradient>
          </defs>
          <rect width='200' height='200' fill='#000' opacity='0.01' />
          <g transform='translate(100, 100)' filter='url(#chatbotGlow)'>
            <path d='M-50,-30 L50,-30 C60,-30 70,-20 70,-10 L70,20 C70,30 60,40 50,40 L10,40 L0,60 L-10,40 L-50,40 C-60,40 -70,30 -70,20 L-70,-10 C-70,-20 -60,-30 -50,-30 Z' fill='url(#chatbotGradient)' stroke='#ffffff' stroke-width='2' opacity='0.9'>
              <animate attributeName='opacity' values='0.9;1;0.9' dur='3s' repeatCount='indefinite' />
              <animate attributeName='d' values='M-50,-30 L50,-30 C60,-30 70,-20 70,-10 L70,20 C70,30 60,40 50,40 L10,40 L0,60 L-10,40 L-50,40 C-60,40 -70,30 -70,20 L-70,-10 C-70,-20 -60,-30 -50,-30 Z;M-48,-32 L52,-32 C62,-32 72,-22 72,-12 L72,22 C72,32 62,42 52,42 L12,42 L0,64 L-12,42 L-48,42 C-58,42 -68,32 -68,22 L-68,-12 C-68,-22 -58,-32 -48,-32 Z;M-50,-30 L50,-30 C60,-30 70,-20 70,-10 L70,20 C70,30 60,40 50,40 L10,40 L0,60 L-10,40 L-50,40 C-60,40 -70,30 -70,20 L-70,-10 C-70,-20 -60,-30 -50,-30 Z' dur='5s' repeatCount='indefinite' />
              <animateTransform attributeName='transform' type='scale' values='1;1.02;1' dur='2s' repeatCount='indefinite' />
            </path>
            <circle cx='-25' cy='-5' r='10' fill='#ffffff' opacity='0.9'>
              <animate attributeName='r' values='10;11;10' dur='3s' repeatCount='indefinite' />
              <animate attributeName='opacity' values='0.9;1;0.9' dur='2s' repeatCount='indefinite' />
            </circle>
            <circle cx='25' cy='-5' r='10' fill='#ffffff' opacity='0.9'>
              <animate attributeName='r' values='10;11;10' dur='3s' begin='0.5s' repeatCount='indefinite' />
              <animate attributeName='opacity' values='0.9;1;0.9' dur='2s' begin='0.5s' repeatCount='indefinite' />
            </circle>
            <circle cx='-25' cy='-5' r='5' fill='url(#chatbotGradient)' opacity='0.95'>
              <animate attributeName='r' values='5;6;5' dur='2s' repeatCount='indefinite' />
              <animate attributeName='cx' values='-25;-24;-26;-25' dur='4s' repeatCount='indefinite' />
              <animate attributeName='cy' values='-5;-4;-6;-5' dur='3.5s' repeatCount='indefinite' />
            </circle>
            <circle cx='25' cy='-5' r='5' fill='url(#chatbotGradient)' opacity='0.95'>
              <animate attributeName='r' values='5;6;5' dur='2s' begin='0.5s' repeatCount='indefinite' />
              <animate attributeName='cx' values='25;24;26;25' dur='4s' begin='0.5s' repeatCount='indefinite' />
              <animate attributeName='cy' values='-5;-4;-6;-5' dur='3.5s' begin='0.5s' repeatCount='indefinite' />
            </circle>
            <rect x='-10' y='15' width='20' height='7' rx='3.5' fill='#fff' opacity='0.7'>
              <animate attributeName='width' values='20;22;20' dur='2s' repeatCount='indefinite' />
              <animate attributeName='opacity' values='0.7;1;0.7' dur='1.5s' repeatCount='indefinite' />
            </rect>
          </g>
        </svg>
      </div>
    `;

    launcher.style.background = 'none';
    launcher.style.border = 'none';
    launcher.style.zIndex = '10000';
    launcher.style.display = 'block';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '32px';
    launcher.style.right = '32px';
    launcher.style.width = '64px';
    launcher.style.height = '64px';
    launcher.style.borderRadius = '50%';
    launcher.style.overflow = 'visible';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '32px';
    launcher.style.right = '32px';
    launcher.style.background = 'none';
    launcher.style.border = 'none';
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
