import { NextApiRequest, NextApiResponse } from "next";
import { PDFOptions } from "puppeteer";

import { omit } from "../../../../lib/omit";
import { doPuppeteer } from "../../../../lib/puppeteer";
import { parseDomain, tryJsonParse } from "../../../../lib/url";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const url = parseDomain(req.query.domain as string);
	const options = omit(tryJsonParse<PDFOptions>(req.query.options, {}), ["path", "timeout"]);

	res.setHeader("Cache-Control", "public, max-age=86400");
	res.setHeader("Content-Type", "application/pdf");

	await doPuppeteer(
		async (page) => {
			res.write(await page.pdf(options));
			res.end();
		},
		{ url }
	);
};
