import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = path.join(root, 'templates', 'homepage.html');
await mkdir(path.dirname(templatePath), { recursive:true });
let template;
try { template = await readFile(templatePath, 'utf8'); }
catch { template = await readFile(path.join(root, 'index.html'), 'utf8'); await writeFile(templatePath, template); }
const section = id => template.match(new RegExp(`<section id="${id}"[\\s\\S]*?<\\/section>`))[0];
const head = template.slice(0, template.indexOf('<body>'));
const symbols = template.match(/<svg class="svg-library"[\s\S]*?<\/svg>/)[0];
let header = template.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
let mobile = template.match(/<nav id="mobile-navigation"[\s\S]*?<\/nav>/)[0];
let footer = template.match(/<footer id="contact"[\s\S]*?<\/footer>/)[0];
const dialog = template.match(/<dialog id="privacy-dialog"[\s\S]*?<\/dialog>/)[0];
const floatingBooking = await readFile(path.join(root,'templates','booking-launcher.html'),'utf8');

function links(html) {
  return html.replace(/href="#home"/g,'href="index.html"')
    .replace(/href="#services"/g,'href="services.html"')
    .replace(/href="#about"/g,'href="about.html"')
    .replace(/href="#contact"/g,'href="contact.html"')
    .replace(/href="#appointment"/g,'href="contact.html#booking-form"')
    .replace(/href="#(general-dentistry|dental-implants|root-canal|cosmetic-dentistry|teeth-whitening|kids-dental-care)"/g,'href="services.html#$1"');
}
header = links(header.replace(/\s*<a href="#home" class="nav-link active" aria-current="page">Home<\/a>/,''));
mobile = links(mobile.replace('<a href="#home">Home</a>',''));
footer = links(footer.replace(/id="contact"/, 'id="site-footer"').replace('<a href="#home">Home</a>',''));

function pageHeader(page) {
  return header.replace(/class="nav-link"/g, 'class="nav-link"').replace(`href="${page}.html" class="nav-link"`, `href="${page}.html" class="nav-link active" aria-current="page"`);
}
function intro(title, text) {
  return `<div class="page-intro"><h1>${title}</h1><p>${text}</p></div>`;
}
function shell(page, title, description, content) {
  const pageHead = head.replace(/<title>.*?<\/title>/, `<title>${title} — Dental</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
    .replace(/\s*<link rel="preload"[^>]*>/,'');
  return `${pageHead}<body class="inner-page ${page}-page"><a class="skip-link" href="#main">Skip to content</a>${symbols}${['services','about'].includes(page) ? '' : `<div class="inner-header">${pageHeader(page)}${mobile}</div>`}<main id="main" class="page-shell">${content}</main>${footer}${floatingBooking}${dialog}</body></html>`;
}

let hero = section('home');
hero = hero.replace(/<header class="site-header">[\s\S]*?<\/header>/, header)
  .replace(/<nav id="mobile-navigation"[\s\S]*?<\/nav>/, mobile);
hero = links(hero);
let homeAppointment = section('appointment');
homeAppointment = homeAppointment.slice(0, homeAppointment.indexOf('<div id="booking-panel"')) + '</section>';
homeAppointment = homeAppointment.replace('href="#booking-form"', 'href="contact.html#booking-form"').replace(' id="booking-toggle" aria-expanded="false" aria-controls="booking-panel"','');
const homeTreatments = [
  ['general-dentistry','General Dentistry','Everyday care for healthy teeth and gums.',6,6],
  ['root-canal','Root Canal Treatment','Thoughtful care to help preserve your natural tooth.',1030,6],
  ['dental-implants','Dental Implants','Explore your options for replacing missing teeth.',518,6],
  ['cosmetic-dentistry','Cosmetic Dentistry','Personalised options for a naturally confident smile.',6,518],
  ['teeth-whitening','Teeth Whitening','Professional advice for a brighter-looking smile.',518,518],
  ['kids-dental-care','Kids Dental Care','Gentle, friendly care for growing smiles.',1030,518]
];
const homeServices = `<section id="services" class="home-services" aria-labelledby="home-services-heading"><div class="home-services-heading"><div><h2 id="home-services-heading">Services for every smile.</h2><p>From everyday check-ups to your next step in dental care.</p></div><a class="text-link" href="services.html">View all services <svg><use href="#arrow"/></svg></a></div><div class="home-services-grid">${homeTreatments.map(([id,title,description,x,y])=>`<a class="home-service-card" href="services.html#${id}"><span class="home-service-photo" aria-hidden="true"><svg viewBox="${x} ${y} 500 500" preserveAspectRatio="xMidYMid slice"><image href="assets/treatments.webp" width="1536" height="1024"/></svg></span><span class="home-service-body"><h3>${title}</h3><p>${description}</p><span class="home-service-link">Explore treatment <svg><use href="#arrow"/></svg></span></span></a>`).join('')}</div></section>`;
// Two service-specific homepage photos, preserving the existing circular crops.
const homeServicesWithPhotos = homeServices.replace(/(<a class="home-service-card" href="services.html#(root-canal|cosmetic-dentistry)">[\s\S]*?<span class="home-service-photo" aria-hidden="true">)[\s\S]*?(<\/span><span class="home-service-body">)/g, (_,start,id,end) => `${start}<svg viewBox="${id === 'root-canal' ? 0 : 887} 0 887 887" preserveAspectRatio="xMidYMid slice"><image href="assets/home-treatment-details.webp" width="1774" height="887"/></svg>${end}`);
const testimonials = await readFile(path.join(root,'templates','testimonials.html'),'utf8');
const home = `${head}<body class="home-page"><a class="skip-link" href="#main">Skip to content</a>${symbols}<main id="main" class="page-shell">${hero}${section('about')}${homeServicesWithPhotos}${testimonials}${homeAppointment}</main>${footer}${floatingBooking}${dialog}</body></html>`;

let services = links(section('services'));
// Keep this page focused on treatment cards; comparisons belong to Our Work.
const serviceCards = [...services.matchAll(/<details class="service"[\s\S]*?<\/details>/g)].map(match => match[0]);
serviceCards.sort((a,b) => homeTreatments.findIndex(t => a.includes(`id="${t[0]}"`)) - homeTreatments.findIndex(t => b.includes(`id="${t[0]}"`)));
services = `<section id="services" class="services-catalog" aria-label="Dental services"><div class="services-card-grid">${serviceCards.join('').replaceAll('</summary>','<span class="service-explore">Explore treatment</span></summary>').replace('>Root Canal</span>','>Root Canal Treatment</span>')}</div></section>`;
services = services.replace(/<details class="service" id="([^"]+)">([\s\S]*?)<\/details>/g, (_,id,body) => {
  const title = homeTreatments.find(t => t[0] === id)[1];
  const value = id === 'root-canal' ? 'Root Canal' : title;
  const surface = body.match(/<summary>([\s\S]*?)<\/summary>/)[1];
  return `<a class="service" id="${id}" href="contact.html?treatment=${encodeURIComponent(value)}#booking-form"><span class="service-surface">${surface}</span></a>`;
});
services = services.replace(/(<a class="service" id="(root-canal|cosmetic-dentistry)"[\s\S]*?<span class="service-image[^"]*" aria-hidden="true">)[\s\S]*?(<\/span><span class="service-copy">)/g, (_,start,id,end) => `${start}<svg viewBox="${id === 'root-canal' ? 0 : 887} 0 887 887" preserveAspectRatio="xMidYMid slice"><image href="assets/home-treatment-details.webp" width="1774" height="887"/></svg>${end}`);
const servicesHero = `<section class="services-hero services-home-style" aria-labelledby="services-title">${pageHeader('services')}${mobile}<div class="services-concept-copy"><p class="section-label">Care for every smile</p><h1 id="services-title">Your smile.<br>Our expertise.</h1><p>Explore dental care for every stage of life.</p><a class="button button-primary" href="contact.html#booking-form">Book an appointment <svg><use href="#arrow"/></svg></a></div></section>`;
let aboutContent = await readFile(path.join(root,'templates','about.html'),'utf8');
aboutContent = aboutContent.replace(/<section class="about-hero"[\s\S]*?<\/section>/, `<section class="services-hero services-home-style about-matched-hero" aria-labelledby="about-title">${pageHeader('about')}${mobile}<div class="services-concept-copy"><p class="section-label">Get to know Dental</p><h1 id="about-title">Your smile,<br>our priority.</h1><p>Experienced care. Thoughtful dentistry. Every smile matters.</p><a class="button button-primary" href="contact.html#booking-form">Book an appointment <svg><use href="#arrow"/></svg></a></div></section>`);
const contactContent = await readFile(path.join(root,'templates','contact.html'),'utf8');
let booking = section('appointment').replace('id="booking-panel" class="booking-panel" hidden','id="booking-panel" class="booking-panel"');
booking = booking.replace('aria-expanded="false"', 'aria-expanded="true"');

await Promise.all([
  writeFile(path.join(root,'index.html'), home),
  writeFile(path.join(root,'services.html'), shell('services','Services','Explore general dentistry, implants, root canal, cosmetic dentistry, teeth whitening and kids dental care.',servicesHero + services)),
  writeFile(path.join(root,'about.html'), shell('about','About us','Get to know Dental: experienced care, modern treatment and a comfortable, hygienic environment.',aboutContent)),
  writeFile(path.join(root,'contact.html'), shell('contact','Contact','Prepare an appointment request and take the next step towards your dental visit.',contactContent))
]);
console.log('Built Home, Services, About and Contact as four separate HTML documents.');
