

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
