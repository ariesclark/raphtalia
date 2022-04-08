/* eslint-disable require-atomic-updates */
import { NextApiResponse } from "next";
import { JSXElementConstructor, ReactElement } from "react";
import { renderToString } from "react-dom/server";

async function getBrowser () {
	if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
		const { default: chromium } = await import("chrome-aws-lambda");

		return chromium.puppeteer.launch({
			args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath,
			headless: true,
			ignoreHTTPSErrors: true
		});
	} else {
		const { default: puppeteer } = await import("puppeteer");
		return puppeteer.launch({ headless: true });
	}
}

export interface CreatePageImageOptions {
	width: number, height: number
}

export async function createPageImage (options: CreatePageImageOptions, response: NextApiResponse, element: ReactElement<any>, head?: ReactElement<any>) {
	const browser = await getBrowser();
	const page = await browser.newPage();

	await page.setContent(renderToString(<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<script src="https://cdn.tailwindcss.com"/>
			<style>{`
				body: {
					font-family: Verdana, Geneva, DejaVu Sans, sans-serif;
					-webkit-font-smoothing: antialiased;
					-moz-osx-font-smoothing: grayscale;
					text-rendering: optimizeLegibility;
				}
			`}</style>
			{head}
		</head>
		{element}
	</html>));

	await page.setViewport({
		width: options.width, 
		height: options.height
	});

	response.setHeader("Content-Type", "image/png");
	response.send(await page.screenshot({ type: "png", encoding: "binary" }));

	await page.close();
}