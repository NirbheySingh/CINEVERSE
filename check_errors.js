const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Click on the first Tickets button
  await page.waitForSelector('.group button');
  console.log('Found tickets button, clicking...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ticketBtn = btns.find(b => b.textContent.includes('Tickets'));
    if (ticketBtn) ticketBtn.click();
  });

  await page.waitForTimeout(2000);
  console.log('After clicking tickets');
  
  await browser.close();
})();
