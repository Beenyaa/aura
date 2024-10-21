import { useState, useEffect } from "react";

export function useAnimatedPath(
	initialPath: string,
	targetPath: string,
	duration: number,
) {
	const [currentPath, setCurrentPath] = useState(initialPath);

	useEffect(() => {
		let startTime: number | null = null;
		let animationFrame: number;

		const animate = (time: number) => {
			if (startTime === null) startTime = time;
			const elapsedTime = time - startTime;
			const progress = Math.min(elapsedTime / duration, 1);

			const interpolatedPath = interpolatePath(
				initialPath,
				targetPath,
				progress,
			);
			setCurrentPath(interpolatedPath);

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(animationFrame);
	}, [initialPath, targetPath, duration]);

	return currentPath;
}

function interpolatePath(pathA: string, pathB: string, progress: number) {
	// This is a simplified interpolation. You might need a more sophisticated
	// interpolation method for complex paths.
	const commandsA = pathA.match(/[A-Z][^A-Z]*/g) || [];
	const commandsB = pathB.match(/[A-Z][^A-Z]*/g) || [];

	return commandsA
		.map((cmdA, i) => {
			const cmdB = commandsB[i] || cmdA;
			const numbersA = cmdA.slice(1).split(/[ ,]+/).map(Number);
			const numbersB = cmdB.slice(1).split(/[ ,]+/).map(Number);

			const interpolatedNumbers = numbersA.map((numA, j) => {
				const numB = numbersB[j] || numA;
				return numA + (numB - numA) * progress;
			});

			return cmdA[0] + interpolatedNumbers.join(" ");
		})
		.join("");
}
