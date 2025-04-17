// podcast-manager.js

document.addEventListener('DOMContentLoaded', () => {
  loadPodcasts();

  document.getElementById('podcast-form').onsubmit = async function(e) {
    e.preventDefault();
    const title = document.getElementById('podcast-title').value.trim();
    const body = document.getElementById('podcast-body').value.trim();
    const errorDiv = document.getElementById('podcast-error');
    errorDiv.textContent = '';
    if (!title || !body) {
      errorDiv.textContent = 'Title and description are required.';
      return;
    }
    // For now, just append to the list (mock, replace with Supabase logic later)
    const episode = { title, body };
    appendPodcast(episode);
    document.getElementById('podcast-form').reset();
  };
});

function appendPodcast(episode) {
  const list = document.getElementById('podcast-list');
  const div = document.createElement('div');
  div.className = 'podcast-item';
  div.innerHTML = `<div class="podcast-title">${episode.title}</div><div class="podcast-body">${episode.body}</div>`;
  list.prepend(div);
}

function loadPodcasts() {
  // Placeholder for loading from Supabase
  // For now, just show a mock episode
  appendPodcast({ title: 'Welcome to the Podcast Manager!', body: 'This is a sample podcast episode. Connect to Supabase to see real data.' });
}
