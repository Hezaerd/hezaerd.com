"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { ContributionDay, GitHubContributions } from "@/types/github";

interface CommitGraphProps {
	contributions: GitHubContributions;
	className?: string;
}

interface TooltipData {
	date: string;
	count: number;
	level: number;
}

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CommitGraph({
	contributions,
	className = "",
}: CommitGraphProps) {
	const [tooltip, setTooltip] = useState<TooltipData | null>(null);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

	const handleMouseEnter = (day: ContributionDay, event: React.MouseEvent) => {
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		setTooltip({
			date: day.date,
			count: day.count,
			level: day.level,
		});
		setTooltipPosition({
			x: rect.left + rect.width / 2,
			y: rect.top - 10,
		});
	};

	const handleMouseLeave = () => {
		setTooltip(null);
	};

	const getContributionColor = (level: number): string => {
		const colors = {
			0: "bg-muted", // No contributions
			1: "bg-green-200 dark:bg-green-900", // Low
			2: "bg-green-300 dark:bg-green-700", // Medium-low
			3: "bg-green-400 dark:bg-green-600", // Medium-high
			4: "bg-green-500 dark:bg-green-500", // High
		};
		return colors[level as keyof typeof colors] || colors[0];
	};

	const formatTooltipDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatContributionText = (count: number): string => {
		if (count === 0) return "No contributions";
		if (count === 1) return "1 contribution";
		return `${count} contributions`;
	};

	// Generate month labels
	const monthLabels = [];
	const firstWeekDate = new Date(
		contributions.weeks[0]?.firstDay || new Date(),
	);

	for (let i = 0; i < 12; i++) {
		const date = new Date(firstWeekDate);
		date.setMonth(date.getMonth() + i);
		monthLabels.push({
			month: MONTHS[date.getMonth()],
			x: ((i * 53) / 12) * 12, // Approximate positioning
		});
	}

	return (
		<div className={`relative ${className}`}>
			<div className="mb-4">
				<div className="flex items-center justify-between mb-2">
					<h4 className="text-sm font-medium text-muted-foreground">
						{contributions.totalContributions.toLocaleString()} contributions in
						the last year
					</h4>
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<span>Less</span>
						<div className="flex gap-1">
							{[0, 1, 2, 3, 4].map((level) => (
								<div
									key={level}
									className={`w-2.5 h-2.5 rounded-sm ${getContributionColor(level)}`}
								/>
							))}
						</div>
						<span>More</span>
					</div>
				</div>
			</div>

			<div className="relative">
				{/* Month labels */}
				<div className="flex justify-between mb-2 text-xs text-muted-foreground">
					{monthLabels.slice(0, 12).map((month, index) => (
						<span key={index} className="text-center">
							{month.month}
						</span>
					))}
				</div>

				{/* Main graph container */}
				<div className="flex gap-1">
					{/* Day labels */}
					<div className="flex flex-col gap-1 mr-2">
						{DAYS.map((day, index) => (
							<div
								key={day}
								className={`text-xs text-muted-foreground h-2.5 flex items-center ${
									index % 2 === 0 ? "opacity-100" : "opacity-0"
								}`}
							>
								{day}
							</div>
						))}
					</div>

					{/* Contribution grid */}
					<div className="flex gap-1 overflow-x-auto">
						{contributions.weeks.map((week, weekIndex) => (
							<div key={weekIndex} className="flex flex-col gap-1">
								{week.contributionDays.map((day, dayIndex) => (
									<motion.div
										key={`${weekIndex}-${dayIndex}`}
										className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-primary ${getContributionColor(
											day.level,
										)}`}
										whileHover={{ scale: 1.2 }}
										onMouseEnter={(e) => handleMouseEnter(day, e)}
										onMouseLeave={handleMouseLeave}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{
											duration: 0.2,
											delay: (weekIndex * 7 + dayIndex) * 0.001, // Staggered animation
										}}
									/>
								))}
							</div>
						))}
					</div>
				</div>

				{/* Tooltip */}
				{tooltip && (
					<motion.div
						className="fixed z-50 px-3 py-2 text-xs bg-popover border border-border rounded-md shadow-lg pointer-events-none"
						style={{
							left: tooltipPosition.x,
							top: tooltipPosition.y,
							transform: "translateX(-50%) translateY(-100%)",
						}}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
					>
						<div className="font-medium text-popover-foreground">
							{formatContributionText(tooltip.count)}
						</div>
						<div className="text-muted-foreground">
							{formatTooltipDate(tooltip.date)}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
