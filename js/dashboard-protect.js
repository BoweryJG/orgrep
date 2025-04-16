const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpuVmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg2NjYzMDMsImV4cCI6MjAwNDI0MjMwM30.4y6Lk9mTQJ9dGvFz9Kp8F5qJ7Yk5F2w8zQJQ9gBf2bA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const adminEmail = 'jasonwilliamgolden@gmail.com';

async function protectDashboard() {
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
