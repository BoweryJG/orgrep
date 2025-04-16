const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpuVmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg2NjYzMDMsImV4cCI6MjAwNDI0MjMwM30.4y6Lk9mTQJ9dGvFz9Kp8F5qJ7Yk5F2w8zQJQ9gBf2bA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const adminEmail = 'jasonwilliamgolden@gmail.com';

document.getElementById('login-form').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById('login-error').textContent = error.message;
  } else {
    window.location.href = '/dashboard/';
  }
};

// Optional: redirect to dashboard if already logged in as admin
supabase.auth.getUser().then(({ data: { user } }) => {
  if (user && user.email === adminEmail) {
    window.location.href = '/dashboard/';
  }
});
