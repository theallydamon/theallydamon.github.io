/* ===== Shared contact form + email-reveal helpers =====
   Used by creator.html and SMM.html.

   CONTACT_ENDPOINT reuses the same Google Apps Script Web App that already
   captures media kit leads (see the KIT_ENDPOINT constant in creator.html).
   That script lives in Ally's Google account, not in this repo, so it can't
   be inspected or edited from here.

   Ally: if messages aren't showing up the way you expect, open the Apps
   Script tied to this URL (from the Google Sheet it logs to: Extensions >
   Apps Script) and check two things — that it writes the `type` field
   somewhere so you can tell partnership / SMM / media-kit leads apart in
   the sheet, and that its "send me an email" step doesn't only fire for
   kit-shaped submissions. Submitting is fire-and-forget (mode: "no-cors"),
   so the page can never actually confirm the script ran; it always shows
   success once the request is sent, same as the media kit form already does.
*/
const CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfycbyHK0iLFi-CPVd0xA6vY0Kz7T_hVb4gDAhZ3D92K_8kSHAp43xIKTbl6aYPEuUZ6bAJ/exec";

function initContactForm(opts) {
  const form = document.getElementById(opts.formId);
  if (!form) return;
  const errorBox = document.getElementById(opts.errorId);
  const wrap = document.getElementById(opts.wrapId);
  const success = document.getElementById(opts.successId);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (errorBox) errorBox.hidden = true;

    /* Honeypot: hidden from people, bots tend to fill it in. If it has a
       value, treat the submission as spam and silently drop it. */
    if (form.company_website && form.company_website.value.trim() !== "") return;

    const name = form.name.value.trim();
    const brand = form.brand.value.trim();
    const email = form.email.value.trim();
    const message = form.campaign ? form.campaign.value.trim() : "";

    if (!name || !brand || !email) {
      if (errorBox) { errorBox.textContent = "Please fill in your name, " + opts.brandLabel + " and email."; errorBox.hidden = false; }
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorBox) { errorBox.textContent = "That email doesn't look right, please check it."; errorBox.hidden = false; }
      return;
    }

    const data = { type: opts.type, name: name, brand: brand, email: email, campaign: message };

    fetch(CONTACT_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).catch(function () { /* fire-and-forget: still show success below */ });

    if (wrap) wrap.hidden = true;
    if (success) success.hidden = false;
  });
}

/* Rebuilds an email address (and its mailto link) only once a real browser
   runs this script, so the address never sits in the page's raw HTML for a
   scraper to lift. Visitors see and can click it completely normally. */
function revealEmail(id, user, domain, subject) {
  const el = document.getElementById(id);
  if (!el) return;
  const address = user + "@" + domain;
  el.textContent = address;
  el.setAttribute("href", "mailto:" + address + (subject ? ("?subject=" + encodeURIComponent(subject)) : ""));
}
