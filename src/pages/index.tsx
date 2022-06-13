import { NextPage } from "next";

export const RootIndexPage: NextPage = () => {
	return (
		<div className="w-full min-h-screen bg-neutral-900 flex items-center justify-center p-16">
			<img
				alt="Mascot"
				src="https://img3.gelbooru.com/images/79/ad/79ad37d4c25fa0ddf1c231f42449bfa5.jpg"
				referrerPolicy="no-referrer"
				className="max-h-[calc(100vh-8rem)]"
			/>
		</div>
	);
};

export default RootIndexPage;
