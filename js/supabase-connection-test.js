// Supabase connection test
// Place this in your main HTML page or a JS file that loads on your public site for quick verification

(function() {
  const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';
  if (!window.supabase || !window.supabase.createClient) {
    const el = document.createElement('div');
    el.style = 'position:fixed;bottom:0;left:0;z-index:9999;background:#fff;color:#222;padding:8px;font-size:14px;border:1px solid #ccc;';
    el.textContent = 'Supabase library NOT loaded!';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 8000);
    console.error('Supabase library NOT loaded!');
    return;
  }
  // Use a unique variable name to avoid collision
  const testSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  testSupabase.from('blog_posts').select('*').limit(1).then(({ data, error }) => {
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
})();
