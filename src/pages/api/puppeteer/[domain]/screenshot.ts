import { NextApiRequest, NextApiResponse } from "next";
import { ScreenshotOptions } from "puppeteer";

import { omit } from "../../../../lib/omit";
import { doPuppeteer } from "../../../../lib/puppeteer";
import { parseDomain, tryJsonParse } from "../../../../lib/url";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const url = parseDomain(req.query.domain as string);
	const options = omit(tryJsonParse<ScreenshotOptions>(req.query.options, {}), ["path"]);

	res.setHeader("Cache-Control", "public, max-age=86400");
	res.setHeader("Content-Type", "image/png");

	await doPuppeteer(
		async (page) => {
			res.write(await page.screenshot(options));
			res.end();
		},
		{ url }
	);
};
