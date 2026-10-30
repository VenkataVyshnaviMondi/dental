# Dental website

A responsive four-page dental website in light blue, white and light grey. Built with plain HTML, CSS and JavaScript.

## Run locally

Install Node.js 18 or newer, then run:

```sh
npm start
```

Open http://localhost:4173. The preview server binds to 127.0.0.1. The HTML files can also be hosted on any static web host.

## Pages and features

- Home: white-tooth hero, interactive care benefits, circular service links and automatic testimonials.
- Services: six treatment cards linking to Contact with the treatment selected.
- About: clinic information, six illustrative comparison sliders with a desktop scroll-stack effect, and doctor cards.
- Contact: eight-field appointment request form, sample telephone link and Visakhapatnam Google Maps link.
- Shared navigation, floating appointment shortcut, keyboard support, mobile layouts and reduced-motion support.

## Edit and rebuild

Edit the content in `templates/`, then regenerate the four root HTML pages:

```sh
node scripts/build-pages.mjs
```

Shared header and homepage content come from `templates/homepage.html`. The other templates contain Contact, About, testimonials and the floating appointment shortcut. Styles and behavior live in `styles.css` and `app.js`.

## Appointment form and sample content

The form creates a downloadable request draft. It does not send, store or confirm appointments. Connect a real booking provider before using it for clinic appointments.

The telephone number is a sample. The location points to Visakhapatnam rather than a confirmed clinic street address. Doctor names, portraits, reviews and treatment comparisons are illustrative. Replace them with verified clinic details and authorised content before launch.

## Deploy to Vercel

Import the repository with Framework Preset **Other**. The included `vercel.json` builds with `npm run build` and serves only `dist/`. The local `server.mjs` is for previewing on your computer; Vercel does not need a Node function for this website.

After updating these files in your Git repository, redeploy the latest commit. The `/services`, `/about` and `/contact` routes and their `.html` equivalents are supported.

## Checks

```sh
npm test
```

Optional browser checks: `node tests/pages.mjs` and `node tests/testimonials.mjs` (require Playwright and Microsoft Edge).
