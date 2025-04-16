// Simple floating chatbot widget
// You can expand with real backend integration as needed

document.addEventListener('DOMContentLoaded', function() {
  // Create chatbot button
  const chatBtn = document.createElement('button');
  chatBtn.className = 'stunning-btn chatbot-fab';
  chatBtn.innerText = 'Chat';
  document.body.appendChild(chatBtn);

  // Create chatbot window
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window hidden';
  chatWindow.innerHTML = `
    <div class="chatbot-header">Chatbot <span class="chatbot-close">×</span></div>
    <div class="chatbot-messages"></div>
    <form class="chatbot-form">
      <input type="text" class="chatbot-input" placeholder="Type a message..." autocomplete="off" required />
      <button type="submit" class="stunning-btn">Send</button>
    </form>
  `;
  document.body.appendChild(chatWindow);

  // Show/hide logic
  chatBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
  });
  chatWindow.querySelector('.chatbot-close').onclick = () => {
    chatWindow.classList.add('hidden');
  };

  // Simple echo handler (replace with real backend call)
  const form = chatWindow.querySelector('.chatbot-form');
  const messages = chatWindow.querySelector('.chatbot-messages');
  form.onsubmit = function(e) {
    e.preventDefault();
    const input = chatWindow.querySelector('.chatbot-input');
    const userMsg = input.value.trim();
    if (!userMsg) return;
    messages.innerHTML += `<div class='chatbot-msg user'>${userMsg}</div>`;
    input.value = '';
    setTimeout(() => {
      messages.innerHTML += `<div class='chatbot-msg bot'>You said: ${userMsg}</div>`;
      messages.scrollTop = messages.scrollHeight;
    }, 400);
    messages.scrollTop = messages.scrollHeight;
  };
});
