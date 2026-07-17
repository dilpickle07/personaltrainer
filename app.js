const form = document.getElementById('profile-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const profile = Object.fromEntries(formData.entries());
    const equipment = formData.getAll('equipment');

    const summary = document.createElement('p');
    summary.textContent = `Profile captured for ${profile.name || 'your client'} with ${equipment.length} equipment options selected.`;
    summary.style.marginTop = '1rem';
    summary.style.color = '#2f6fed';

    form.appendChild(summary);
  });
}
