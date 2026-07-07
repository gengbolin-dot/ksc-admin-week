const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5177/');
  await page.waitForTimeout(3000);
  // Find and click personal view button in sidebar
  const elements = await page.$$('button');
  for (const el of elements) {
    const text = await el.textContent();
    if (text && text.includes('个人视图')) {
      await el.click();
      break;
    }
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/c/Users/admin/screenshot_personal_view.png', fullPage: true });
  await browser.close();
  console.log('Done');
})();
