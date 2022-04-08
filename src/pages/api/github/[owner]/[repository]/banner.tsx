/* eslint-disable @next/next/no-head-element */
/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-no-comment-textnodes */
import { NextApiRequest, NextApiResponse } from "next";
import ms from "ms";

import { createPageImage  } from "../../../../../lib/puppeteer";

function github (path: string) {
	const credentials = `${process.env["GITHUB_USERNAME"]}:${process.env["GITHUB_TOKEN"]}`;

	return fetch(`https://api.github.com/${path}`, {
		headers: {
			Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
			"User-Agent": "raphtalia.ariesclark.com"
		}
	}).then((response) => response.json());
}

const getRelativeDuration = (date: string) => ms(Date.now() - new Date(date).getTime(), { long: true });

export default async function (request: NextApiRequest, response: NextApiResponse) {
	const fullRepositoryName = `${request.query.owner}/${request.query.repository}`;
	
	const repository = await github(`repos/${fullRepositoryName}`);
	const commits: Array<any> = await github(`repos/${fullRepositoryName}/commits`);
	const validCommits = commits.filter(({ commit }: any) => !commit.message.toLowerCase().includes("merge branch")).slice(0, 8);
	
	response.setHeader("Cache-Control", "public, max-age=3600, immutable");

	await createPageImage({
		width: 1250,
		height: 500
	}, response, (<html>
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
		</head>
		<body className="w-screen h-screen overflow-hidden bg-black text-neutral-100">
			<div className="flex flex-col w-screen h-screen overflow-hidden">
				<div className={`absolute flex flex-col ${validCommits.length >= 8 ? "justify-between" : "justify-start"} w-full h-screen p-4 overflow-hidden filter gap-y-2`}>
					{validCommits.map(({ sha, commit, author }: any) => (
						<div key={sha} className="flex flex-col font-mono whitespace-nowrap">
							<div className="flex space-x-2 ">
								<img className="h-5 my-auto rounded-full" src={author.avatar_url}/>
								<div className="space-x-2">
									<span className="text-green-500 ">{author.login}</span>
									<span className="text-amber-200">{getRelativeDuration(commit.author.date)} ago</span>
									<span className="text-sm text-neutral-500">({sha})</span>
								</div>
							</div>
							<span className="">{commit.message.length >= 128 
								? `${commit.message.slice(0, 128)}...` 
								: commit.message
							}</span>
						</div>
					))
					}
				</div>
				<div className="absolute top-0 right-0 p-4">
					<span className="text-xs leading-4 text-neutral-400">
						» raphtalia.ariesclark.com
					</span>
				</div>
				<div className="z-10 flex h-full space-y-2" style={{ background: "radial-gradient(circle at center, rgba(0, 0, 0) 0, transparent 100%)" }}>
					<div className="flex flex-col m-auto">
						<h1 className="text-6xl font-medium text-center">{repository.full_name}</h1>
						<span className="max-w-md mx-auto text-2xl text-center">{repository.description}</span>
					</div>
				</div>
			</div>
		</body>
	</html>));
}