import { useState, useEffect, useCallback } from "react";

const ThemeSwitcher = () => {
	const [darkMode, setDarkMode] = useState(false);

	// Function to update the theme based on user preference
	const updateTheme = useCallback((isDark: boolean) => {
		setDarkMode(isDark);
		document.documentElement.classList.add("theme-transition");
		document.documentElement.setAttribute(
			"data-theme",
			isDark ? "dark" : "light",
		);
		window.setTimeout(() => {
			document.documentElement.classList.remove("theme-transition");
		}, 300);
		localStorage.setItem("darkMode", isDark.toString());
	}, []);

	useEffect(() => {
		// Check localStorage for user preference
		const storedPreference = localStorage.getItem("darkMode");
		if (storedPreference !== null) {
			updateTheme(storedPreference === "true");
		} else {
			// Default to system preference
			const systemPrefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			updateTheme(systemPrefersDark);
		}

		// Listener for system preference changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => updateTheme(e.matches);

		mediaQuery.addEventListener("change", handleChange);

		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [updateTheme]);

	return (
		<button
			type="button"
			onClick={() => updateTheme(!darkMode)}
			className="theme-switch h-10 w-10 rounded-md transition-colors duration-300 relative"
		>
			<svg
				viewBox="0 0 24.00 24.00"
				xmlns="http://www.w3.org/2000/svg"
				aria-labelledby="nightModeIconTitle"
				stroke="var(--color-fg)"
				stroke-width="0.24000000000000005"
				stroke-linecap="square"
				stroke-linejoin="miter"
				fill="none"
				color="var(--color-fg)"
			>
				<g id="SVGRepo_bgCarrier" stroke-width="0" />
				<g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke="var(--color-fg)"
					stroke-width="1.248"
				>
					{" "}
					<title id="nightModeIconTitle">Night Mode</title>{" "}
					<path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"></path>{" "}
					<path d="M15.899 12.899a4 4 0 0 1-4.797-4.797A4.002 4.002 0 0 0 12 16c1.9 0 3.49-1.325 3.899-3.101z"></path>{" "}
					<path d="M12 5V3M12 21v-2"></path>{" "}
					<path d="M5 12H2h3zM22 12h-3 3zM16.95 7.05L19.07 4.93 16.95 7.05zM4.929 19.071L7.05 16.95 4.93 19.07zM16.95 16.95l2.121 2.121-2.121-2.121zM4.929 4.929L7.05 7.05 4.93 4.93z"></path>{" "}
				</g>
				<g id="SVGRepo_iconCarrier">
					{" "}
					<title id="nightModeIconTitle">Night Mode</title>{" "}
					<path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"></path>{" "}
					<path d="M15.899 12.899a4 4 0 0 1-4.797-4.797A4.002 4.002 0 0 0 12 16c1.9 0 3.49-1.325 3.899-3.101z"></path>{" "}
					<path d="M12 5V3M12 21v-2"></path>{" "}
					<path d="M5 12H2h3zM22 12h-3 3zM16.95 7.05L19.07 4.93 16.95 7.05zM4.929 19.071L7.05 16.95 4.93 19.07zM16.95 16.95l2.121 2.121-2.121-2.121zM4.929 4.929L7.05 7.05 4.93 4.93z"></path>{" "}
				</g>
			</svg>
		</button>
	);
};

export default ThemeSwitcher;
