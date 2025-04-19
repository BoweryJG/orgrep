const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const adminEmail = 'jasonwilliamgolden@gmail.com';

async function protectDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    document.getElementById('dashboard-error').textContent = 'Access denied. Please log in as admin.';
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
    return;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('Dashboard protect:', { user, error });
  if (!user || user.email !== adminEmail) {
    document.getElementById('dashboard-error').textContent = 'Access denied. Please log in as admin.';
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
  } else {
    document.getElementById('dashboard-error').textContent = 'Welcome, ' + user.email;
  }
}

protectDashboard();

function logout() {
  supabase.auth.signOut().then(() => {
    window.location.href = '/login.html';
  });
}

// Optional: Show error if access denied
if (window.location.search.includes('error=access')) {
  document.getElementById('dashboard-error').textContent = 'Access denied. Please log in as admin.';
}
