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
        <svg viewBox="0 0 48 48" width="48" height="48" style="display:block; margin:0 auto;">
          <circle cx="24" cy="24" r="20" fill="#5B3CFF" stroke="#fff" stroke-width="2"/>
          <ellipse cx="24" cy="30" rx="10" ry="5" fill="#fff" opacity=".13"/>
          <circle cx="17" cy="22" r="2.5" fill="#fff"/>
          <circle cx="31" cy="22" r="2.5" fill="#fff"/>
          <rect x="19" y="28" width="10" height="2.5" rx="1.2" fill="#fff" opacity=".7"/>
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
