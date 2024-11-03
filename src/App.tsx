import { useState, useEffect, useCallback, useMemo } from "react";
import TrackBlobs from "./components/track-blobs";
import ThemeSwitch from "./components/theme-switch";

const App = () => {
	const [images, setImages] = useState(["so-much-fun.jpeg", "mbdtf.webp"]);
	const allImages = useMemo(
		() => [
			"igor.webp",
			"blond.jpeg",
			"call-me-if-you-get-lost.jpeg",
			"jeffery.webp",
			"long-live-asap.webp",
			"mbdtf.webp",
			"so-much-fun.jpeg",
			"stankonia.webp",
		],
		[],
	);

	const getRandomImage = useCallback(
		(excludeImages: string[]) => {
			const availableImages = allImages.filter(
				(img) => !excludeImages.includes(img),
			);
			const randomIndex = Math.floor(Math.random() * availableImages.length);
			return availableImages[randomIndex];
		},
		[allImages],
	);

	const changeImage = useCallback(() => {
		setImages((prevImages) => {
			const newImage1 = getRandomImage(prevImages);
			const newImage2 = getRandomImage([...prevImages, newImage1]);
			return [newImage1, newImage2];
		});
	}, [getRandomImage]);

	useEffect(() => {
		let rafId: number;
		let lastChange = 0;
		const interval = 3000;

		const animate = (timestamp: number) => {
			if (timestamp - lastChange >= interval) {
				changeImage();
				lastChange = timestamp;
			}
			rafId = requestAnimationFrame(animate);
		};

		rafId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(rafId);
	}, [changeImage]);

	return (
		<div className="relative bg-[--color-bg] w-full h-screen inset-0 flex items-center justify-center">
			<div className="absolute top-0 right-0 z-10 p-4">
				<ThemeSwitch />
			</div>
			<div
				style={{
					backdropFilter: "blur(10px)",
					zIndex: 100,
					position: "relative",
					width: "60%",
					height: "60%",
					maxWidth: "600px",
					maxHeight: "600px",
				}}
			>
				<TrackBlobs
					baseTrackImagePath={images[0]}
					mixinTrackImagePath={images[1]}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
					}}
				/>
			</div>
		</div>
	);
};

export default App;
