import { useRef, useCallback } from "react";

// Pre-compile regex pattern - now handles commands and values separately
const PATH_COMMAND_REGEX = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/g;

interface ParsedPath {
	commands: string[];
	values: number[][];
}

const pathCache = new Map<string, ParsedPath>();

function parsePath(path: string): ParsedPath {
	if (typeof path !== "string") return { commands: [], values: [] };

	const cached = pathCache.get(path);
	if (cached) return cached;

	const matches = Array.from(path.matchAll(PATH_COMMAND_REGEX) || []);
	const commands = matches.map((match) => match[1]);
	const values = matches.map((match) =>
		match[2]
			.trim()
			.split(/[,\s]+/)
			.filter(Boolean)
			.map(Number),
	);

	const parsed = { commands, values };

	if (pathCache.size > 100) {
		const entries = Array.from(pathCache.keys());
		for (const entry of entries.slice(0, 50)) {
			pathCache.delete(entry);
		}
	}

	pathCache.set(path, parsed);
	return parsed;
}

function interpolatePath(
	pathAData: ParsedPath,
	pathBData: ParsedPath,
	progress: number,
): string {
	const { commands: commandsA, values: valuesA } = pathAData;
	const { values: valuesB } = pathBData;

	let result = "";

	for (let i = 0; i < commandsA.length; i++) {
		const numsA = valuesA[i];
		const numsB = valuesB[i] || numsA;

		// Build the interpolated values string
		const interpolatedValues = numsA
			.map((numA, j) => {
				const numB = numsB[j] || numA;
				const interpolatedValue = numA + (numB - numA) * progress;
				return interpolatedValue.toFixed(2);
			})
			.join(" ");

		// Use template literal to combine command and values
		result += `${commandsA[i]} ${interpolatedValues}`;
	}

	return result;
}

export function useAnimatedPath(
	initialPath: string,
	targetPath: string,
	duration: number,
) {
	const pathRef = useRef({ current: initialPath });
	const frameRef = useRef<number>();
	const startTimeRef = useRef<number>();

	const initialPathData = useRef(parsePath(initialPath));
	const targetPathData = useRef(parsePath(targetPath));

	const animate = useCallback(
		(timestamp: number) => {
			if (!startTimeRef.current) {
				startTimeRef.current = timestamp;
			}

			const elapsed = timestamp - startTimeRef.current;
			const progress = Math.min(elapsed / duration, 1);

			pathRef.current.current = interpolatePath(
				initialPathData.current,
				targetPathData.current,
				progress,
			);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(animate);
			}
		},
		[duration],
	);

	if (pathRef.current.current !== targetPath) {
		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
		}

		startTimeRef.current = undefined;
		initialPathData.current = parsePath(initialPath);
		targetPathData.current = parsePath(targetPath);
		frameRef.current = requestAnimationFrame(animate);
	}

	return pathRef.current.current;
}
