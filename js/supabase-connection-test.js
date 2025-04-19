// Supabase connection test
// Place this in your main HTML page or a JS file that loads on your public site for quick verification

(function() {

  function runTest() {
    if (!window.supabase) {
      setTimeout(runTest, 100);
      return;
    }
    window.supabase.from('blog_posts').select('*').limit(1).then(({ data, error }) => {
      console.log('Supabase connection test:', { data, error });
      const el = document.createElement('div');
      el.style = 'position:fixed;bottom:0;left:0;z-index:9999;background:#fff;color:#222;padding:8px;font-size:14px;border:1px solid #ccc;';
      if (error) {
        el.textContent = 'Supabase ERROR: ' + error.message;
      } else {
        el.textContent = 'Supabase CONNECTED! Example row: ' + JSON.stringify(data);
      }
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 8000);
    });
  }
  runTest();
})();
