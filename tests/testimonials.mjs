import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(require.resolve('playwright',{paths:[process.cwd(),path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')]}));
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:960}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:4173/#testimonials',{waitUntil:'networkidle'});
assert.equal(await page.locator('#services + #testimonials + #appointment').count(),1);
assert.equal(await page.locator('.testimonial-card:visible').count(),1);
await page.locator('#testimonials').screenshot({path:'.impeccable/review/testimonials-desktop.png'});
await page.mouse.move(0,0);
await page.waitForTimeout(3300);
assert.equal(await page.locator('.testimonial-card').getAttribute('aria-label'),'Review 2 of 3');
await page.locator('#testimonial-pause').click();
assert.equal(await page.locator('#testimonial-pause').getAttribute('aria-label'),'Resume testimonial slideshow');
await page.locator('[data-review="2"]').click();
assert.equal(await page.locator('.testimonial-card').getAttribute('aria-label'),'Review 3 of 3');
await page.locator('#testimonial-next').click();
assert.equal(await page.locator('.testimonial-card').getAttribute('aria-label'),'Review 1 of 3');
await page.keyboard.press('ArrowLeft');
assert.equal(await page.locator('.testimonial-card').getAttribute('aria-label'),'Review 3 of 3');
await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement.blur());
await page.waitForTimeout(3300);
assert.equal(await page.locator('.testimonial-card').getAttribute('aria-label'),'Review 3 of 3');
for(const width of [320,390,773]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
}
await page.setViewportSize({width:390,height:844});
await page.locator('#testimonials').screenshot({path:'.impeccable/review/testimonials-mobile.png'});
await page.emulateMedia({reducedMotion:'reduce'});
await page.reload({waitUntil:'networkidle'});
assert.equal(await page.locator('#testimonial-pause').getAttribute('aria-label'),'Resume testimonial slideshow');
assert.deepEqual(errors,[]);
await browser.close();console.log('PASS: single card, automatic advance, pause, dots, arrows, keyboard, wraparound, reduced motion, responsive widths; no JavaScript errors.');

