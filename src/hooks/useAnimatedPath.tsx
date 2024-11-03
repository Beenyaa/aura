import { useRef, useCallback } from "react";

// Pre-compile regex pattern
const PATH_COMMAND_REGEX = /[A-Z][^A-Z]*/g;

interface ParsedPath {
	commands: string[];
	numbers: number[][];
}

// Use regular Map instead of WeakMap for string keys
const pathCache = new Map<string, ParsedPath>();

function parsePath(path: string): ParsedPath {
	if (typeof path !== "string") return { commands: [], numbers: [] };

	const cached = pathCache.get(path);
	if (cached) return cached;

	const commands = path.match(PATH_COMMAND_REGEX) || [];
	const numbers = commands.map((cmd) =>
		cmd.slice(1).trim().split(/[ ,]+/).map(Number),
	);

	const parsed = { commands, numbers };

	// Limit cache size to prevent memory leaks
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
	const { commands: commandsA, numbers: numbersA } = pathAData;
	const { numbers: numbersB } = pathBData;

	let result = "";

	for (let i = 0; i < commandsA.length; i++) {
		const cmdA = commandsA[i];
		const numsA = numbersA[i];
		const numsB = numbersB[i] || numsA;

		result += cmdA[0];

		for (let j = 0; j < numsA.length; j++) {
			const numA = numsA[j];
			const numB = numsB[j] || numA;
			result += (j === 0 ? "" : " ") + (numA + (numB - numA) * progress);
		}
	}

	return result;
}

export function useAnimatedPath(
	initialPath: string,
	targetPath: string,
	duration: number,
) {
	// Use refs to avoid recreating objects on each render
	const pathRef = useRef({ current: initialPath });
	const frameRef = useRef<number>();
	const startTimeRef = useRef<number>();

	// Parse paths once and cache them
	const initialPathData = useRef(parsePath(initialPath));
	const targetPathData = useRef(parsePath(targetPath));

	// Create a stable callback for the animation frame
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

	// Clean up animation when paths change
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
