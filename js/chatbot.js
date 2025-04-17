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
      <svg viewBox="0 0 200 200" width="64" height="64" style="display:block; margin:0 auto;">
        <g filter="url(#chatbotGlow)">
          <path d="M50,70 L150,70 C160,70 170,80 170,90 L170,120 C170,130 160,140 150,140 L110,140 L100,160 L90,140 L50,140 C40,140 30,130 30,120 L30,90 C30,80 40,70 50,70 Z" fill="url(#chatbotGradient)" stroke="#fff" stroke-width="2" opacity="0.95"/>
          <circle cx="75" cy="100" r="12" fill="#fff" opacity="0.9"/>
          <circle cx="125" cy="100" r="12" fill="#fff" opacity="0.9"/>
          <circle cx="75" cy="100" r="6" fill="url(#chatbotGradient)" opacity="0.95"/>
          <circle cx="125" cy="100" r="6" fill="url(#chatbotGradient)" opacity="0.95"/>
        </g>
      </svg>
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
