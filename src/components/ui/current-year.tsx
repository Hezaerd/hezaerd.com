"use client";

import { useEffect, useState } from "react";

export function CurrentYear() {
	const [currentYear, setCurrentYear] = useState<number | null>(null);

	useEffect(() => {
		setCurrentYear(new Date().getFullYear());
	}, []);

	return <>{currentYear || "2025"}</>;
}
