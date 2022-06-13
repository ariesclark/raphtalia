export function parseDomain(domain: string): URL {
	const url = new URL(`https://${Buffer.from(domain, "base64")}`);
	url.searchParams.sort();
	return url;
}

export function tryJsonParse<T>(query: unknown, defaultValue: T): Partial<T> {
	try {
		return { ...defaultValue, ...JSON.parse(query as string) };
	} catch {
		return defaultValue;
	}
}
