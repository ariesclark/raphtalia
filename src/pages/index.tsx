/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-sync-scripts */
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { funky as highlighterStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";

const providers = ["GitHub"] as const;
type Provider = typeof providers[number];

interface CopyableSectionProps { name: string, content: string }

const CopyableSection: React.VFC<CopyableSectionProps> = ({ name, content }) => (
	<div className="flex flex-col space-y-2">
		<div className="flex space-x-4">
			<span>{name}</span>
			<button
				onClick={() => navigator.clipboard.writeText(content)} 
				className="px-2 text-sm border border-neutral-700 bg-neutral-800"
			>copy</button>
		</div>
		<div className="w-full p-4 bg-black border border-neutral-700">
			<pre className="break-words whitespace-normal">{content}</pre>
		</div>
	</div>
);

interface InputProps {
	label: string,
	hint?: string | React.ReactElement,
	value: string,
	onChange: (value: string) => void
	validate?: (value: string) => boolean,
	rootClassName?: string
}

const Input: React.VFC<InputProps> = (props) => {
	const { onChange, validate } = props;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const [errored, setErrored] = useState<boolean>(false);

	const onChangeInternal = useCallback((value: string) => {
		console.log(value );

		if (validate) setErrored(!validate(value));

		onChange(value);
	}, [validate, onChange]);

	return (
		<div className={`group flex flex-col w-full space-y-2 flex-grow overflow-hidden ${props.rootClassName}`}>
			<label className="flex space-x-2">
				<span className="whitespace-nowrap">{props.label}</span>
				{props.hint && <span className="mt-auto text-sm text-neutral-500 whitespace-nowrap">{props.hint}</span>}
			</label>
			<div className={`flex p-2 border bg-neutral-800 ${errored ? "border-red-400" : "border-neutral-700 group-focus:border-white"}`}>
				<input
					value={props.value}
					onChange={(event) => onChangeInternal(event.target.value)}
					className="w-full bg-transparent outline-none appearance-none"
				/>
			</div>
		</div>
	);
};

interface CheckboxProps {
	label?: string,
	value: boolean,
	onChange: (value: boolean) => void
}

const Checkbox: React.VFC<CheckboxProps> = (props) => (
	<div className="flex flex-col space-y-2">
		<label className="flex h-6 space-x-2">
			{props.label && <span className="whitespace-nowrap">{props.label}</span>}
		</label>
		<div className="flex">
			<input
				checked={props.value}
				onChange={(event) => props.onChange(event.target.checked)}
				type="checkbox"
				className="my-1 h-8 w-8 border outline-none appearance-none flex before:m-auto before:text-sm before:content-['✖'] checked:before:content-['✔'] bg-neutral-800 border-neutral-700"
			/>
		</div>
	</div>
);

interface SelectProps {
	label: string,
	value: string,
	onChange: (value: string) => void,
	options: string[]
}

const Select: React.VFC<SelectProps> = (props) => (
	<div className="flex flex-col w-64 space-y-2">
		<label>{props.label}</label>
		<select
			value={props.value}
			onChange={(event) => props.onChange(event.target.value)}
			className="p-2 border outline-none appearance-none border-neutral-700 bg-neutral-800 focus:border-white"
		>
			{props.options.map((value) => (
				<option key={value}>{value}</option>
			))}
		</select>
	</div>
);

interface ImplProps {
	onChange: (value: string) => void
}

import debounce from "lodash.debounce";

const providerImpl: {[K in Provider]: React.VFC<ImplProps>} = {
	GitHub: (props) => {
		const { onChange } = props;
		const [repository, setRepository] = useState<string>("tailwindcss/tailwindcss");
		
		const [imageUrl, setImageURL] = useState<string>("https://github.com/tailwindlabs/tailwindcss/raw/master/.github/logo-dark.svg");
		const [imageHeight, setImageHeight] = useState<number>(64);

		const [title, setTitle] = useState<string>("");
		const [showTitle, setShowTitle] = useState<boolean>(false);

		const [subtitle, setSubtitle] = useState<string>("");
		const [showSubtitle, setShowSubtitle] = useState<boolean>(true);
		
		useEffect(() => {
			const query = new URLSearchParams();
			if (imageUrl) query.set("image", imageUrl);
			if (imageUrl) query.set("imageHeight", imageHeight.toString(10));

			query.set("title", showTitle ? (title || "default") : "null");
			if (query.get("title") === "default") query.delete("title");
			
			query.set("subtitle", showSubtitle ? (subtitle || "default") : "null");
			if (query.get("subtitle") === "default") query.delete("subtitle");

			query.sort();

			onChange(`${repository}/banner?${query.toString()}`);
		}, [
			onChange, 
			repository, 
			imageUrl, imageHeight,
			title, showTitle,
			subtitle, showSubtitle
		]);
		
		return (
			<div className="flex flex-col space-y-4">
				<div className="flex">
					<Input
						rootClassName="flex-grow" 
						label="Repository"
						hint="ex: tailwindcss/tailwindcss"
						value={repository} 
						onChange={(value) => setRepository(value.trim())}
						validate={(value) => value.includes("/")}
					/>
				</div>
				<div className="flex gap-4">
					<Input 
						rootClassName="flex-grow" 
						label="Image URL" 
						hint="default: none" 
						value={imageUrl} onChange={(value) => setImageURL(value.trim())}
					/>
					<Input 
						rootClassName="flex-grow" 
						label="Image Height" 
						hint="default: 64px" 
						value={imageHeight.toString(10)} onChange={(value) => setImageHeight(Number.parseInt(value))}
					/>
				</div>
				<div className="flex flex-col w-full gap-4 pb-2 lg:flex-row">
					<div className="flex w-full gap-4">
						<Input
							rootClassName="flex-grow" 
							label="Title" 
							hint="default: repository name"
							value={title} 
							onChange={(value) => setTitle(value)}
						/>
						<Checkbox value={showTitle} onChange={setShowTitle}/>
					</div>
					<div className="flex w-full gap-4">
						<Input
							rootClassName="flex-grow" 
							label="Subtitle" 
							hint="default: repository description" 
							value={subtitle} 
							onChange={(value) => setSubtitle(value)}
						/>
						<Checkbox value={showSubtitle} onChange={setShowSubtitle}/>
					</div>
				</div>
				<div className="flex gap-4 pt-4 border-t border-neutral-600">
					<div className="flex flex-col w-full gap-4">
						<Input
							value=""
							onChange={() => {/* */}}
							label="GitHub username"
							hint="optional"
						/>
						<Input
							value=""
							onChange={() => {/* */}}
							label="Access token"
							hint="optional"
						/>
					</div>
					<p className="w-full text-neutral-400">
						Your username and access token are encrypted in your browser using a public key.
						Access tokens are used for authenticating to GitHub and letting you view private repositories.
						<br/><br/>
						If you don&apos;t trust providing your access token, consider forking the repository and hosting this yourself.
					</p>
				</div>
			</div>
		);
	}
};

export const RootIndexPage: NextPage = () => {
	const [provider, setProvider] = useState<Provider>("GitHub");
	const ProviderImpl = providerImpl[provider];

	const [url, setUrl] = useState<string>("");
	const fullUrl = `https://raphtalia.ariesclark.com/${url}`;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const onChangeDebounced = useCallback(debounce((value) => setUrl(`${provider.toLowerCase()}/${value}`), 500), []);
	
	return (<>
		<Head>
			<script src="https://cdn.tailwindcss.com"/>
			<style>{`
			body {
				font-family: Verdana, Geneva, DejaVu Sans, sans-serif;
			}
		`}</style>
			<title>Raphtalia - An image generator / data aggregator?</title>
			<meta property="og:title" content="Raphtalia" />
			<meta property="og:description" content="An image generator / data aggregator?" />
			<meta property="og:image" content="https://raphtalia.ariesclark.com/github/tailwindcss/tailwindcss/banner?image=https%3A%2F%2Fgithub.com%2Ftailwindlabs%2Ftailwindcss%2Fraw%2Fmaster%2F.github%2Flogo-dark.svg&imageHeight=64&title=null" />
			<meta name="twitter:card" content="summary_large_image"/>
			<meta name="twitter:site" content="@ariesrclark"/>
		</Head>
		<div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
			<div className="flex p-4 space-x-2 border-b border-neutral-700">
				<img alt="Best girl" className="h-24" src="/RaphNom.png"/>
				<div className="flex flex-col">
					<h1 className="text-4xl font-bold">Raphtalia</h1>
					<span className="text-neutral-300">An image generator / data aggregator?</span>
					<div className="flex mt-3 space-x-4 text-xs text-neutral-400">
						<Link href="https://github.com/ariesclark/raphtalia">
							<a className="hover:text-white hover:before:content-['»_'] hover:after:content-['_«']" target="_blank">
								View source code
							</a>
						</Link>
						<Link href="https://ariesclark.com">
							<a className="hover:text-white hover:before:content-['»_'] hover:after:content-['_«']" target="_blank">
								Visit personal website
							</a>
						</Link>
					</div>
				</div>
			</div>
			<div className="flex flex-grow">
				<div className="flex flex-col w-full h-full">
					<div className="flex flex-col gap-4 p-4 pb-6 border-b border-neutral-700">
						<Select
							label="Select provider"
							value={provider}
							onChange={(value) => setProvider(value as any)} 
							options={providers as unknown as string[]}
						/>
					</div>
					<div className="p-4">
						<ProviderImpl onChange={onChangeDebounced}/>
					</div>
				</div>
				<div className="w-full border-l border-neutral-700">
					<div className="">
						<img alt="Image preview" src={url}/>
					</div>
					<div className="flex flex-col p-4 space-y-4 border-t border-neutral-700">
						<CopyableSection name="Plain URL" content={fullUrl}/>
						<CopyableSection name="Markdown" content={`![${provider} image](${fullUrl})`}/>
					</div>
				</div>
			</div>
		</div>
	</>);
};

export default RootIndexPage;