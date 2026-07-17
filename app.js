const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  const isLight = theme === 'light';

  if (isLight) {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }

  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

if (themeToggle) {
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  });
}

const form = document.getElementById('profile-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const profile = Object.fromEntries(formData.entries());
    const equipment = formData.getAll('equipment');

    const summary = document.createElement('p');
    summary.className = 'form-summary';
    summary.textContent = `Profile captured for ${profile.name || 'your client'} with ${equipment.length} equipment options selected.`;

    form.appendChild(summary);
  });
}
