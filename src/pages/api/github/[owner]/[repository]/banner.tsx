import { NextApiRequest, NextApiResponse } from "next";
import { Endpoints } from "@octokit/types";
import ms from "ms";

import { createPageImage  } from "../../../../../lib/puppeteer";

async function github <T extends keyof Endpoints> (path: string): Promise<Endpoints[T]["response"]["data"]> {
	const credentials = `${process.env["GITHUB_USERNAME"]}:${process.env["GITHUB_TOKEN"]}`;

	return fetch(`https://api.github.com/${path}`, {
		headers: {
			Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
			"User-Agent": "raphtalia.ariesclark.com"
		}
	}).then(async (response) => {
		if (!response.ok) throw await response.json();
		return response.json() as Promise<Endpoints[T]["response"]>;
	});
}


const getRelativeDuration = (date: string) => ms(Date.now() - new Date(date).getTime(), { long: true });

interface RequestQuery {
	owner: string,
	repository: string
	image?: string | null,
	imageHeight?: number,
	title?: string,
	subtitle?: string
}

export default async function (request: NextApiRequest & { query: RequestQuery }, response: NextApiResponse) {
	console.log(request.query)
	const repository = await github<"GET /repos/{owner}/{repo}">(
		`repos/${request.query.owner}/${request.query.repository}`
	).catch((reason) => {
		if (reason.message.toLowerCase().includes("not found")) {
			response.status(404).send("repository not found");
			return;
		}

		console.error("request failed", reason);
		response.status(500).send("internal server error");
	});

	if (!repository) return;
	
	const query: Required<RequestQuery> = {
		owner: request.query.owner,
		repository: request.query.repository,

		image: request.query.image || null,
		imageHeight: request.query.imageHeight || 64,
		title: request.query.title === "null" ? "" : request.query.title || `${request.query.owner}/${request.query.repository}`,
		subtitle: request.query.subtitle === "null" ? "" : repository.description || ""
	};

	const fullRepositoryName = `${query.owner}/${query.repository}`;
	
	const commits = await github<"GET /repos/{owner}/{repo}/commits">(`repos/${fullRepositoryName}/commits`);
	const validCommits = commits.filter(({ commit }) => !commit.message.toLowerCase().includes("merge branch")).slice(0, 8);
	
	response.setHeader("Cache-Control", "public, max-age=3600, immutable");

	await createPageImage({
		width: 1250,
		height: 500
	}, response, (
		<body className="w-screen h-screen overflow-hidden bg-black text-neutral-100">
			<div className="flex flex-col w-screen h-screen overflow-hidden">
				<div className={`absolute flex flex-col ${validCommits.length >= 8 ? "justify-between" : "justify-start"} w-full h-screen p-4 overflow-hidden filter gap-y-2`}>
					{validCommits.map((object) => {
						const { commit, sha } = object;
						
						const commitAuthorName = object.author?.login || commit.author?.name?.toLowerCase().replace(/ /, "") || "unknown";
						const commitAuthorAvatar = object.author?.avatar_url || "https://github.com/identicons/default.png";
						const commitDate = commit.committer?.date;

						return (
							<div key={sha} className="flex flex-col font-mono whitespace-nowrap">
								<div className="flex space-x-2 ">
									<img alt="Preview image" className="h-5 my-auto rounded-full" src={commitAuthorAvatar}/>
									<div className="space-x-2">
										<span className="text-green-500 ">{commitAuthorName}</span>
										<span className="text-amber-200">{commitDate ? `${getRelativeDuration(commitDate)} ago` : "unknown"}</span>
										<span className="text-sm text-neutral-500">({sha})</span>
									</div>
								</div>
								<span className="">
									{commit.message.length >= 128 
										? `${commit.message.slice(0, 128)}...` 
										: commit.message
									}
								</span>
							</div>
						);})
					}
				</div>
				<div className="absolute top-0 right-0 p-4">
					<span className="text-xs leading-4 text-neutral-400">
						» raphtalia.ariesclark.com
					</span>
				</div>
				<div className="z-10 flex h-full space-y-2" style={{ background: "radial-gradient(circle at center, rgba(0, 0, 0) 0, transparent 100%)" }}>
					<div className="flex flex-col m-auto">
						{query.image && <img alt="" className={`mb-4 w-fit mx-auto h-[${query.imageHeight}]`} src={query.image} />}
						{query.title && <h1 className="mb-2 text-6xl font-medium text-center">{query.title}</h1>}
						{query.subtitle && <span className="max-w-md mx-auto text-2xl text-center">{query.subtitle}</span>}
					</div>
				</div>
			</div>
		</body>
	));
}