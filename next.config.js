/** @type {import("next").NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	rewrites: async () => ({
		afterFiles: [
			{
				source: "/:path*",
				destination: "/api/:path*"
			}
		]
	})
};

module.exports = nextConfig;
