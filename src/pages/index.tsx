/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-sync-scripts */
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { funky as highlighterStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";

const providers = ["GitHub"] as const;
type Provider = typeof providers[number];

interface CopyableSectionProps { name: string, content: string, language: string }

const CopyableSection: React.VFC<CopyableSectionProps> = ({ name, content, language }) => (
	<div className="flex flex-col space-y-2">
		<div className="flex space-x-4">
			<span>{name}</span>
			<button
				onClick={() => navigator.clipboard.writeText(content)} 
				className="px-2 text-sm border border-neutral-700 bg-neutral-800"
			>copy</button>
		</div>
		<div className="w-full p-4 bg-black border border-neutral-700">
			<SyntaxHighlighter wrapLines language={language} style={highlighterStyle} customStyle={{padding: 0, margin: 0}}>
				{content}
			</SyntaxHighlighter>
		</div>
	</div>
);

interface InputProps {
    label: string,
    hint?: string,
    value: string,
    onChange: (value: string) => void
}

const Input: React.VFC<InputProps> = (props) => (
	<div className="flex flex-col w-64 space-y-2">
		<label className="flex space-x-2">
			<span>{props.label}</span>
			{props.hint && <span className="mt-auto text-sm text-neutral-500">{props.hint}</span>}
		</label>
		<input
			value={props.value}
			onChange={(event) => props.onChange(event.target.value)}
			className="p-2 border outline-none appearance-none border-neutral-700 bg-neutral-800 focus:border-white"
		/>
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

const providerImpl: {[K in Provider]: React.VFC<ImplProps>} = {
	GitHub: (props) => {
		const { onChange } = props;
		const [repository, setRepository] = useState<string>("facebook/react");
        
		useEffect(() => {
			onChange(`${repository}/banner`);
		}, [onChange, repository]);
        
		return (
			<div className="">
				<Input label="Repository" hint="ex: facebook/react" value={repository} onChange={(value) => setRepository(value.trim())} />
			</div>
		);
	}
};

export const RootIndexPage: NextPage = () => {
	const [provider, setProvider] = useState<Provider>("GitHub");
	const ProviderImpl = providerImpl[provider];

	const [url, setUrl] = useState<string>("");
	const fullUrl = `https://raphtalia.ariesclark.com/${url}`;
    
	return (<>
		<Head>
			<script src="https://cdn.tailwindcss.com"/>
			<style>{`
            body {
                font-family: Verdana, Geneva, DejaVu Sans, sans-serif;
            }
        `}</style>
		</Head>
		<div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
			<div className="flex p-4 space-x-2 border-b border-neutral-700">
				<img className="h-24" src="/RaphNom.png"/>
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
					<div className="p-4 pb-6 border-b border-neutral-700">
						<Select
							label="Select provider"
							value={provider}
							onChange={(value) => setProvider(value as any)} 
							options={providers as unknown as string[]}
						/>
					</div>
					<div className="p-4">
						<ProviderImpl onChange={(value) => setUrl(`${provider.toLowerCase()}/${value}`)}/>
					</div>
				</div>
				<div className="w-full border-l border-neutral-700">
					<div className="">
						<img src={url}/>
					</div>
					<div className="flex flex-col p-4 space-y-4 border-t border-neutral-700">
						<CopyableSection name="Plain URL" language="js" content={fullUrl}/>
						<CopyableSection name="Markdown" language="markdown" content={`![${provider} image](${fullUrl})`}/>
					</div>
				</div>
			</div>
		</div>
	</>);
};

export default RootIndexPage;