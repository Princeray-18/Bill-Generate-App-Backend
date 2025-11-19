// test-chrome.js
const puppeteer = require("puppeteer");

async function testChrome() {
  try {
    console.log("Platform:", process.platform);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Puppeteer executable path:", puppeteer.executablePath());

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // No executablePath specified - let Puppeteer find Chrome
    });

    console.log("✅ Browser launched successfully");

    const page = await browser.newPage();
    await page.setContent("<h1>Test PDF</h1>");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    console.log("✅ PDF generated successfully, size:", pdf.length);

    await browser.close();
    console.log("✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testChrome();
