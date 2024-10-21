import React, { useMemo, useEffect, useState } from "react";
import { useAnimatedPath } from "../hooks/useAnimatedPath";

interface Props {
	baseTrackImagePath: string;
	mixinTrackImagePath: string;
	style: React.CSSProperties;
}

const TrackBlobs = React.memo(
	({ baseTrackImagePath, mixinTrackImagePath, style }: Props) => {
		const pathValues = useMemo(
			() => [
				"M43.1,-75.3C57,-66.7,70.3,-57.4,79.1,-44.8C87.9,-32.1,92.4,-16.1,92.7,0.1C92.9,16.4,89,32.7,80.1,45.4C71.3,58.1,57.6,67,43.4,75C29.3,83,14.6,90,-0.4,90.6C-15.3,91.3,-30.7,85.5,-43.4,76.7C-56.2,67.8,-66.3,56,-74.7,42.7C-83,29.4,-89.4,14.7,-89.6,-0.1C-89.8,-14.9,-83.7,-29.9,-75.9,-44C-68.1,-58.2,-58.6,-71.6,-45.7,-80.8C-32.7,-90,-16.4,-95,-0.9,-93.5C14.6,-91.9,29.2,-83.9,43.1,-75.3Z",
				"M54.3,-67.9C71.5,-56.2,87.4,-42.5,92.2,-25.5C97,-8.4,90.7,11.9,82.4,30.5C74.2,49.1,63.9,66,48.4,75.9C32.9,85.8,12.1,88.6,-7.6,85.3C-27.4,82,-46.1,72.5,-59.9,58.6C-73.7,44.7,-82.6,26.3,-82.6,8.4C-82.5,-9.4,-73.5,-26.7,-62.5,-41.8C-51.5,-56.9,-38.5,-69.8,-23.2,-75.7C-7.9,-81.5,9.6,-80.3,25.8,-75.1C42,-69.9,57,-79.7,54.3,-67.9Z",
			],
			[],
		);

		const [currentPaths, setCurrentPaths] = useState(pathValues);
		const [targetPaths, setTargetPaths] = useState(pathValues);

		const animatedPath1 = useAnimatedPath(
			currentPaths[0],
			targetPaths[0],
			10000,
		);
		const animatedPath2 = useAnimatedPath(
			currentPaths[1],
			targetPaths[1],
			10000,
		);

		useEffect(() => {
			const nextPaths = pathValues.map(
				(_, i) => pathValues[(i + 1) % pathValues.length],
			);
			setTargetPaths(nextPaths);
		}, [pathValues]);

		useEffect(() => {
			const timer = setInterval(() => {
				setCurrentPaths(targetPaths);
				setTargetPaths((prevPaths) =>
					prevPaths.map(
						(_, i) =>
							pathValues[
								(pathValues.indexOf(prevPaths[i]) + 1) % pathValues.length
							],
					),
				);
			}, 10000);

			return () => clearInterval(timer);
		}, [pathValues, targetPaths]);

		const masks = useMemo(() => {
			return [animatedPath1, animatedPath2].map((path, index) => (
				<mask key={`blobMask-${index}`} id={`blobMask${index}`}>
					<path
						className={`blob-path blob-path-${index}`}
						fill="white"
						d={path}
					/>
				</mask>
			));
		}, [animatedPath1, animatedPath2]);

		const blobs = useMemo(() => {
			const images = [baseTrackImagePath, mixinTrackImagePath];
			return images.map((path, index) => (
				<g
					key={`blob-${path}`}
					transform={index === 0 ? "translate(-48, -38)" : "translate(48, 38)"}
				>
					<image
						href={path}
						x="-100"
						y="-100"
						width="180"
						height="180"
						preserveAspectRatio="xMidYMid slice"
						mask={`url(#blobMask${index})`}
						className="blob-image"
					/>
				</g>
			));
		}, [baseTrackImagePath, mixinTrackImagePath]);

		return (
			<svg
				viewBox="-200 -200 400 400"
				xmlns="http://www.w3.org/2000/svg"
				style={style}
			>
				<title>Track Blobs</title>
				<defs>
					<filter id="blendFilter">
						<feGaussianBlur
							in="SourceGraphic"
							stdDeviation="10"
							result="blur"
						/>
						<feColorMatrix
							in="blur"
							type="matrix"
							values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
							result="goo"
						/>
						<feComposite in="SourceGraphic" in2="goo" operator="atop" />
					</filter>
					<filter id="blurFilter">
						<feGaussianBlur in="SourceGraphic" stdDeviation="6" />
					</filter>
					<filter id="blendOverlap">
						<feBlend mode="multiply" in="SourceGraphic" in2="blur" />
					</filter>

					{masks}
				</defs>
				<g filter="url(#blendFilter)">{blobs}</g>
			</svg>
		);
	},
);

export default TrackBlobs;
