/* /js/contact.js */

const form     = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const success  = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    // Honeypot check
    if (form._honeypot.value) return;

    setLoading(true);

    // — Replace this block with your real endpoint (Formspree, etc.) —
    await new Promise(r => setTimeout(r, 1000)); // simulate send
    // const res = await fetch('https://formspree.io/f/YOUR_ID', {
    //   method: 'POST',
    //   headers: { 'Accept': 'application/json' },
    //   body: new FormData(form)
    // });

    setLoading(false);
    form.style.display = 'none';
    success.style.display = 'flex';
  });

  // Live validation on blur
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => el.classList.remove('invalid'));
  });
}

function validate() {
  let valid = true;
  form.querySelectorAll('[required]').forEach(el => {
    if (!validateField(el)) valid = false;
  });
  return valid;
}

function validateField(el) {
  const isEmpty = !el.value.trim();
  const isInvalidEmail = el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
  if (isEmpty || isInvalidEmail) {
    el.classList.add('invalid');
    return false;
  }
  el.classList.remove('invalid');
  return true;
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.querySelector('.btn-label').style.display  = loading ? 'none'  : 'inline';
  submitBtn.querySelector('.btn-loading').style.display = loading ? 'inline' : 'none';
}