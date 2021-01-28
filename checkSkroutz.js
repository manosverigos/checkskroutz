const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const preparePageForTests = async (page) => {

	// Pass the User-Agent Test.
	const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
		'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
	await page.setUserAgent(userAgent);
}

async function check(barcode) {

	let url = 'https://www.skroutz.gr/';

	let browser = await puppeteer.launch();
	let page = await browser.newPage();
	await preparePageForTests(page);

	await page.setViewport({
		width: 1980,
		height: 1080,
	});

	const navigationPromise = page.waitForNavigation({
		waitUntil: "domcontentloaded"
	});

	await page.goto(url);

	await page.waitForSelector('#search-bar-input');

	await page.evaluate((barcode) => {
		document.querySelector('#search-bar-input').value = barcode;
	}, barcode);

	await page.keyboard.press('Enter');
	await navigationPromise;
	const timeout = {
		timeout: 3000
	};
	try {
		await page.waitForSelector('.card', timeout);
		await page.click('.card');

		await page.waitForSelector('.current-page', timeout);
		let title = await page.evaluate(() => {
			return document.querySelector('.current-page').textContent
		})


		let prices = await page.evaluate(() => {
			return Array.from(document.querySelectorAll('.pre-blp.content-placeholder >a'), element => element.innerHTML);
		});

		var indices = [];
		let list_length;

		if (prices.length <= 30) {
			list_length = prices.length
		} else {
			list_length = 30
		}

		for (var i = 1; i < list_length + 1; i++) {
			indices.push(i)
		}

		var obj = {};

		for (var i = 0; i < indices.length; i++) {
			obj[indices[i]] = prices[i];
		}

		await browser.close();
		let results = {
			title,
			obj
		}

		return results
	} catch {

		let results = {
			title: 'Δεν βρέθηκε προϊόν',
			obj: undefined
		}
		await browser.close();
		return results;
	}
}

module.exports.check = check;