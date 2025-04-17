// blog-manager.js

document.addEventListener('DOMContentLoaded', () => {
  loadBlogs();

  document.getElementById('blog-form').onsubmit = async function(e) {
    e.preventDefault();
    const title = document.getElementById('blog-title').value.trim();
    const body = document.getElementById('blog-body').value.trim();
    const errorDiv = document.getElementById('blog-error');
    errorDiv.textContent = '';
    if (!title || !body) {
      errorDiv.textContent = 'Title and content are required.';
      return;
    }
    try {
      document.getElementById('blog-form').querySelector('button[type="submit"]').disabled = true;
      const { data, error } = await supabase.from('blogs').insert([{ title, body }]);
      if (error) throw error;
      await loadBlogs();
      document.getElementById('blog-form').reset();
    } catch (err) {
      errorDiv.textContent = err.message || 'Error adding blog post.';
    } finally {
      document.getElementById('blog-form').querySelector('button[type="submit"]').disabled = false;
    }
  };
});

async function loadBlogs() {
  const list = document.getElementById('blog-list');
  list.innerHTML = '<div style="color:#aaa;">Loading...</div>';
  try {
    const { data, error } = await supabase.from('blogs').select('*').order('id', { ascending: false });
    if (error) throw error;
    list.innerHTML = '';
    if (!data.length) {
      list.innerHTML = '<div style="color:#aaa;">No blog posts yet.</div>';
    }
    data.forEach(post => appendBlog(post));
  } catch (err) {
    list.innerHTML = `<div style='color:#ff6b6b;'>${err.message || 'Error loading blog posts.'}</div>`;
  }
}

function appendBlog(post) {
  const list = document.getElementById('blog-list');
  const div = document.createElement('div');
  div.className = 'blog-item';
  div.innerHTML = `
    <div class="blog-title">${post.title}</div>
    <div class="blog-body">${post.body}</div>
    <div style="margin-top:0.5rem;">
      <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em; margin-right:0.5em;" onclick="editBlog(${post.id})">Edit</button>
      <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em; background:#ff6b6b;" onclick="deleteBlog(${post.id})">Delete</button>
    </div>
  `;
  list.appendChild(div);
}

window.deleteBlog = async function(id) {
  if (!confirm('Delete this blog post?')) return;
  try {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
    await loadBlogs();
  } catch (err) {
    alert(err.message || 'Error deleting blog post.');
  }
}

window.editBlog = async function(id) {
  const list = document.getElementById('blog-list');
  const div = Array.from(list.children).find(el => el.innerHTML.includes(`editBlog(${id})`));
  if (!div) return;
  // Fetch post details
  const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
  if (error) return alert('Could not load blog post for editing.');
  div.innerHTML = `
    <form onsubmit="return false;" style="display:flex; flex-direction:column; gap:0.5em;">
      <input type="text" value="${data.title.replace(/"/g,'&quot;')}" id="edit-title-${id}" style="padding:0.5em; border-radius:6px; border:none;" />
      <textarea id="edit-body-${id}" rows="4" style="padding:0.5em; border-radius:6px; border:none;">${data.body}</textarea>
      <div style="display:flex; gap:0.5em;">
        <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em;" onclick="saveEditBlog(${id})">Save</button>
        <button class="cta-button" style="font-size:0.9em; padding:0.3em 1em; background:#aaa;" onclick="loadBlogs()">Cancel</button>
      </div>
      <div id="edit-error-${id}" style="color:#ff6b6b;"></div>
    </form>
  `;
}

window.saveEditBlog = async function(id) {
  const title = document.getElementById(`edit-title-${id}`).value.trim();
  const body = document.getElementById(`edit-body-${id}`).value.trim();
  const errorDiv = document.getElementById(`edit-error-${id}`);
  if (!title || !body) {
    errorDiv.textContent = 'Title and content are required.';
    return;
  }
  try {
    const { error } = await supabase.from('blogs').update({ title, body }).eq('id', id);
    if (error) throw error;
    await loadBlogs();
  } catch (err) {
    errorDiv.textContent = err.message || 'Error saving changes.';
  }
}
