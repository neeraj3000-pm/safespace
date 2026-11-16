// Smoke test all 3 personas at 375px and 1280px. Usage: BASE=https://your-app.vercel.app node scripts/smoke-test.js
const { chromium } = require('playwright');
const OUT = (process.env.OUT || '/tmp') + '/';
const BASE = process.env.BASE || 'http://localhost:3000';
const errors = [];
(async () => {
  const browser = await chromium.launch();

  for (const [label, vp] of [['m', { width: 375, height: 812 }], ['d', { width: 1280, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(label + ' ' + e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(label + ' console: ' + m.text()));
    const shot = async (n) => {
      await page.waitForTimeout(500);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > vp.width) errors.push(`${label} ${n}: horizontal overflow ${sw}`);
      await page.screenshot({ path: `${OUT}${label}-${n}.png`, fullPage: true });
    };
    const persona = async (name) => {
      await page.goto(BASE + '/start');
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Try a demo persona' }).click();
      await page.getByRole('button', { name: new RegExp(name) }).click();
      await page.waitForURL(/check-in/);
    };
    const throughCheckin = async () => {
      await page.getByRole('button', { name: 'Next' }).click();
      if (label === 'm') await shot('checkin-2');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Find my next step' }).click();
    };

    await page.goto(BASE + '/'); await shot('landing');

    // Riya: full journey with low felt-heard + switch
    await persona('Riya');
    await shot('checkin-1');
    await throughCheckin();
    await page.waitForURL(/understood/); await shot('understood');
    await page.getByRole('button', { name: /show my next step/ }).click();
    await page.waitForURL(/next-step/); await page.waitForTimeout(1500); await shot('nextstep-riya');
    await page.getByRole('button', { name: 'Book session' }).first().click();
    await page.waitForURL(/\/book$/);
    await page.getByRole('switch').waitFor();
    if ((await page.getByRole('switch').getAttribute('aria-checked')) !== 'true') errors.push(label + ': consent toggle not on by default');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator('textarea').first().fill('They would like to talk about exam stress and late-night worry.');
    await page.getByRole('button', { name: 'Done' }).click();
    await shot('book');
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await page.waitForURL(/booked/); await shot('booked');
    await page.getByRole('link', { name: /See what .* sees/ }).click();
    await page.waitForURL(/expert\/brief/);
    await page.getByText('Expert view (demo)').waitFor();
    if (!(await page.getByText('late-night worry').count())) errors.push(label + ': edited brief not shown in expert view');
    await shot('expert-view');
    await page.goBack(); await page.waitForURL(/booked/);
    await page.getByRole('button', { name: /Fast-forward/ }).click();
    await page.waitForURL(/feedback/); await shot('feedback');
    await page.getByRole('radio', { name: /2: Not really/ }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('radio', { name: /style didn't suit/ }).click();
    await shot('switch-reason');
    await page.getByRole('button', { name: 'Find me a better fit' }).click();
    await page.getByText("Here's who we'd suggest next").waitFor(); await shot('switch-next');
    await page.getByRole('button', { name: /free intro call/ }).click();
    await page.waitForURL(/\/book$/);
    await page.getByText("Your new expert will know what you've shared").waitFor();
    await page.getByText('Exactly what').waitFor();
    await page.waitForTimeout(800); await shot('book-handover');
    await page.getByRole('button', { name: 'Confirm free intro call' }).click();
    await page.waitForURL(/booked/); await shot('booked-intro');
    await page.getByRole('link', { name: /See what .* sees/ }).click();
    await page.getByText('Handover from another expert').waitFor(); await shot('expert-view-handover');

    // Arjun: edit a chip
    await persona('Arjun');
    await throughCheckin();
    await page.waitForURL(/understood/);
    await page.getByRole('button', { name: '+ Add a topic' }).click();
    await page.getByRole('button', { name: 'sleep', exact: true }).click();
    await shot('understood-arjun');
    await page.getByRole('button', { name: /show my next step/ }).click();
    await page.waitForURL(/next-step/); await page.getByRole('button', { name: 'Book session' }).first().waitFor(); await shot('nextstep-arjun');
    // Opt out of sharing: booking still works and nothing is shared.
    await page.getByRole('button', { name: 'Book session' }).first().click();
    await page.waitForURL(/\/book$/);
    await page.getByRole('switch').click();
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await page.waitForURL(/booked/);
    await page.getByText('You chose not to share a summary').waitFor();

    // Crisis
    await persona('Crisis');
    await throughCheckin();
    await page.waitForURL(/help-now/); await shot('helpnow');

    await page.goto(BASE + '/insights'); await page.waitForTimeout(1200); await shot('insights');
    await ctx.close();
  }
  await browser.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'ALL OK');
})().catch((e) => { console.error('FAIL', e.message.slice(0,200)); console.error(errors.join('\n')); process.exit(1); });
