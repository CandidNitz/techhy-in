// techhy.in — site scripts
// This file must stay same-origin (assets/main.js) to satisfy the
// "script-src 'self'" Content-Security-Policy set in index.html.

(function () {
  'use strict';

  // ---- Footer year ----
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---- Coupon copy buttons ----
  document.querySelectorAll('.coupon-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-copy');
      var original = btn.innerHTML;
      navigator.clipboard.writeText(code).then(function () {
        btn.textContent = 'copied!';
        setTimeout(function () {
          btn.innerHTML = original;
        }, 1500);
      }).catch(function () {
        // Clipboard API unavailable — no-op, code is still visible on the button
      });
    });
  });

  // ---- Email signup forms (Formspree) ----
  // Replace FORMSPREE_ENDPOINT with your real Formspree form endpoint,
  // e.g. "https://formspree.io/f/abcdwxyz" (create one for free at
  // https://formspree.io — no code needed, just sign up and add a form).
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xojgjbyn';

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function wireSignupForm(formId, msgId) {
    var form = document.getElementById(formId);
    var msg = document.getElementById(msgId);
    if (!form || !msg) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('input[type="email"]');
      var email = (emailInput.value || '').trim();
      var button = form.querySelector('button[type="submit"]');

      msg.textContent = '';
      msg.removeAttribute('data-state');

      if (!isValidEmail(email)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.setAttribute('data-state', 'error');
        emailInput.focus();
        return;
      }

      var originalButtonText = button.textContent;
      button.disabled = true;
      button.textContent = 'Sending…';

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          source: form.getAttribute('data-form-name') || 'unknown',
          page: window.location.href
        })
      })
        .then(function (response) {
          if (response.ok) {
            msg.textContent = "You're on the list — thanks!";
            msg.setAttribute('data-state', 'success');
            form.reset();
          } else {
            return response.json().then(function (data) {
              var errorText = (data && data.errors && data.errors.length)
                ? data.errors.map(function (err) { return err.message; }).join(', ')
                : 'Something went wrong. Please try again.';
              msg.textContent = errorText;
              msg.setAttribute('data-state', 'error');
            });
          }
        })
        .catch(function () {
          msg.textContent = 'Network error — please try again in a moment.';
          msg.setAttribute('data-state', 'error');
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = originalButtonText;
        });
    });
  }

  wireSignupForm('newsletter-form', 'newsletter-msg');
  wireSignupForm('footer-newsletter-form', 'footer-newsletter-msg');
})();
