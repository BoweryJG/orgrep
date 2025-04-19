

const adminEmail = 'jasonwilliamgolden@gmail.com';

document.getElementById('login-form').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById('login-error').textContent = error.message;
  } else if (data && data.session) {
    // Login succeeded, redirect!
    window.location.href = '/dashboard/';
  } else {
    // Fallback: listen for auth state change
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        window.location.href = '/dashboard/';
      }
    });
  }
};

// Optional: redirect to dashboard if already logged in as admin
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email === adminEmail) {
        window.location.href = '/dashboard/';
      }
    });
  }
})();
