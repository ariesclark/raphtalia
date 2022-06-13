import type { Browser, Page, Viewport } from "puppeteer";

export async function getBrowser(): Promise<Browser> {
	if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
		const { default: chromium } = await import("chrome-aws-lambda");

		return chromium.puppeteer.launch({
			args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath,
			headless: true,
			ignoreHTTPSErrors: true
		}) as unknown as Browser;
	} else {
		const { default: puppeteer } = await import("puppeteer");
		return puppeteer.launch({ headless: true });
	}
}

export type DoPuppeteerFunction = (page: Page) => Promise<void>;
export interface DoPuppeteerOptions {
	url?: URL;
	viewport?: Viewport;
}

export async function doPuppeteer(fn: DoPuppeteerFunction, opts: DoPuppeteerOptions) {
	const browser = await getBrowser();
	const page = await browser.newPage();
	if (opts.url) await page.goto(opts.url.toString());

	await page.setViewport(opts.viewport || { width: 1920, height: 1080 });
	await fn(page);

	await browser.close();
}
