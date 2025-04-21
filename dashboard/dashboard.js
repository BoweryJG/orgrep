// Dashboard JS: Fetch, render, animate
// --- Supabase config ---
const SUPABASE_URL = 'https://cbopynuvhcymbumjnvay.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// Supabase client initialized

// --- DOM Elements ---
const stateFilter = document.getElementById('state-filter');
const procedureFilter = document.getElementById('procedure-filter');
const priceFilter = document.getElementById('price-filter');
const priceValue = document.getElementById('price-value');
const ctaBtn = document.getElementById('cta-btn');
const leadModal = document.getElementById('lead-modal');
const closeModal = document.querySelector('.close-modal');
const leadForm = document.getElementById('lead-form');
const downloadReport = document.getElementById('download-report');

// --- Modal logic ---
ctaBtn.addEventListener('click', () => leadModal.classList.add('active'));
closeModal.addEventListener('click', () => leadModal.classList.remove('active'));
window.addEventListener('click', e => {
  if (e.target === leadModal) leadModal.classList.remove('active');
});

// --- Price filter display ---
priceFilter.addEventListener('input', () => {
  priceValue.textContent = `$${priceFilter.value}`;
});

// --- Populate filters from Supabase ---
async function fetchFilters() {
  // Fetch unique states from contacts table
  const { data: contacts, error: contactsError } = await supabase.from('contacts').select('state, procedure');
  if (contactsError) {
    console.error('Error fetching contacts:', contactsError);
    return;
  }
  // Extract unique states and procedures
  const uniqueStates = [...new Set(contacts.map(c => c.state).filter(Boolean))];
  const uniqueProcedures = [...new Set(contacts.map(c => c.procedure).filter(Boolean))];

  stateFilter.innerHTML = '<option value="">All States</option>' +
    uniqueStates.map(state => `<option value="${state}">${state}</option>`).join('');
  procedureFilter.innerHTML = '<option value="">All Procedures</option>' +
    uniqueProcedures.map(proc => `<option value="${proc}">${proc}</option>`).join('');
}
fetchFilters();

// --- Fetch and render dashboard data ---
async function fetchDashboardData() {
  // Fetch all contacts as dashboard data for now
  const { data, error } = await supabase.from('contacts').select('*');
  if (error) {
    console.error('Error fetching contacts (dashboard data):', error);
    return;
  }
  console.log('Contacts (dashboard data):', data);
  // TODO: Render charts/maps using the fetched data
}
fetchDashboardData();

// --- Chart.js Example Setup ---
const growthCtx = document.getElementById('growthChart').getContext('2d');
const priceCtx = document.getElementById('priceChart').getContext('2d');
const adSpendCtx = document.getElementById('adSpendChart').getContext('2d');

const growthChart = new Chart(growthCtx, {
  type: 'line',
  data: {
    labels: [], // TODO: Fill with time periods
    datasets: [{
      label: 'Growth Rate',
      data: [], // TODO: Fill with growth data
      borderColor: '#00ffc6',
      backgroundColor: 'rgba(0,255,198,0.1)',
      tension: 0.3
    }]
  },
  options: { responsive: true }
});

const priceChart = new Chart(priceCtx, {
  type: 'bar',
  data: {
    labels: [], // TODO: Fill with procedures
    datasets: [{
      label: 'Avg Price',
      data: [], // TODO: Fill with price data
      backgroundColor: '#7b42f6'
    }]
  },
  options: { responsive: true }
});

const adSpendChart = new Chart(adSpendCtx, {
  type: 'bar',
  data: {
    labels: [], // TODO: Fill with regions
    datasets: [{
      label: 'Ad Spend',
      data: [], // TODO: Fill with ad spend data
      backgroundColor: '#ffd740'
    }]
  },
  options: { responsive: true }
});

// --- SEM/SEO Widgets Placeholder ---
document.getElementById('google-trends-widget').innerHTML = '<em>Google Trends Widget Here</em>';
document.getElementById('seo-keywords').innerHTML = '<em>SEO Keywords & Recommendations Here</em>';

// --- Lead form submission ---
leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  // TODO: Post form data to Supabase leads table
  leadModal.classList.remove('active');
  alert('Thank you! We will be in touch.');
});

downloadReport.addEventListener('click', () => {
  // TODO: Generate and download PDF report
  alert('PDF report generation coming soon!');
});

// --- Animated Map Placeholder ---
document.getElementById('animated-map').innerHTML = '<em>Animated US Map Coming Soon</em>';
