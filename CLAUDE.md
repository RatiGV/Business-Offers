# Business Offers - repo rules
- Never create a new repository; all work goes into this repo.
- Each site lives in its own subfolder.
- When creating a new site subfolder, always copy into it:
  - root `.gitignore`
  - `.templates/.htaccess`, `.templates/.user.ini`, `.templates/php.ini` (exact copies)
- Partner logos: always use the partner company's existing official logo, copied from the provided reference website (never redraw or recreate it).
- Header smartacademy.ge link: use an external-link (redirect) icon after the text, never a dot; icon uses `currentColor` so it matches the button's text color in each design.
- Lead form: every site gets the form from `.templates/lead-form/` placed right above the "როგორ ვისარგებლო" (#how) section: `section.html` -> index.html, `form.css` -> appended to style.css, `form.js` -> assets/js/form.js (loaded after app.js), `send.php` -> site root with `__COMPANY__` replaced by the partner company name. Mails go to business@smartacademy.ge, subject "Business Offer Request - Name Surname - Company - Course".
