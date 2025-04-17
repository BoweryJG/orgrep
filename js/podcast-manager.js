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
    try {
      document.getElementById('podcast-form').querySelector('button[type="submit"]').disabled = true;
      const { data, error } = await supabase.from('podcasts').insert([{ title, body }]);
      if (error) throw error;
      await loadPodcasts();
      document.getElementById('podcast-form').reset();
    } catch (err) {
      errorDiv.textContent = err.message || 'Error adding podcast episode.';
    } finally {
      document.getElementById('podcast-form').querySelector('button[type="submit"]').disabled = false;
    }
  };
});

async function loadPodcasts() {
  const list = document.getElementById('podcast-list');
  list.innerHTML = '<div style="color:#aaa;">Loading...</div>';
  try {
    const { data, error } = await supabase.from('podcasts').select('*').order('id', { ascending: false });
    if (error) throw error;
    list.innerHTML = '';
    if (!data.length) {
      list.innerHTML = '<div style="color:#aaa;">No podcast episodes yet.</div>';
    }
    data.forEach(episode => appendPodcast(episode));
  } catch (err) {
    list.innerHTML = `<div style='color:#ff6b6b;'>${err.message || 'Error loading podcast episodes.'}</div>`;
  }
}

function appendPodcast(episode) {
  const list = document.getElementById('podcast-list');
  const div = document.createElement('div');
  div.className = 'podcast-item';
  div.innerHTML = `
    <div class="podcast-title">${episode.title}</div>
    <div class="podcast-body">${episode.body}</div>
    <div style="margin-top:0.5rem;">
      <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em; margin-right:0.5em;" onclick="editPodcast(${episode.id})">Edit</button>
      <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em; background:#ff6b6b;" onclick="deletePodcast(${episode.id})">Delete</button>
    </div>
  `;
  list.appendChild(div);
}

window.deletePodcast = async function(id) {
  if (!confirm('Delete this podcast episode?')) return;
  try {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw error;
    await loadPodcasts();
  } catch (err) {
    alert(err.message || 'Error deleting podcast episode.');
  }
}

window.editPodcast = async function(id) {
  const list = document.getElementById('podcast-list');
  const div = Array.from(list.children).find(el => el.innerHTML.includes(`editPodcast(${id})`));
  if (!div) return;
  // Fetch episode details
  const { data, error } = await supabase.from('podcasts').select('*').eq('id', id).single();
  if (error) return alert('Could not load podcast episode for editing.');
  div.innerHTML = `
    <form onsubmit="return false;" style="display:flex; flex-direction:column; gap:0.5em;">
      <input type="text" value="${data.title.replace(/"/g,'&quot;')}" id="edit-title-${id}" style="padding:0.5em; border-radius:6px; border:none;" />
      <textarea id="edit-body-${id}" rows="4" style="padding:0.5em; border-radius:6px; border:none;">${data.body}</textarea>
      <div style="display:flex; gap:0.5em;">
        <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em;" onclick="saveEditPodcast(${id})">Save</button>
        <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em; background:#aaa;" onclick="loadPodcasts()">Cancel</button>
      </div>
      <div id="edit-error-${id}" style="color:#ff6b6b;"></div>
    </form>
  `;
}

window.saveEditPodcast = async function(id) {
  const title = document.getElementById(`edit-title-${id}`).value.trim();
  const body = document.getElementById(`edit-body-${id}`).value.trim();
  const errorDiv = document.getElementById(`edit-error-${id}`);
  if (!title || !body) {
    errorDiv.textContent = 'Title and description are required.';
    return;
  }
  try {
    const { error } = await supabase.from('podcasts').update({ title, body }).eq('id', id);
    if (error) throw error;
    await loadPodcasts();
  } catch (err) {
    errorDiv.textContent = err.message || 'Error saving changes.';
  }
}

