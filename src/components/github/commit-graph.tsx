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

const SQUARE_SIZE_PX = 16;
const GAP_SIZE_PX = 4;
const CELL_DIMENSION_PX = SQUARE_SIZE_PX + GAP_SIZE_PX;

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
			0: "bg-muted",
			1: "bg-green-200 dark:bg-green-900",
			2: "bg-green-300 dark:bg-green-700",
			3: "bg-green-400 dark:bg-green-600",
			4: "bg-green-500 dark:bg-green-500",
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

	const monthLabels: { month: string; weekIndex: number; leftOffset: number }[] = [];
	const processedMonths = new Set<string>();

	const dayLabelsColumnRenderedWidth = 32 + 8;

	contributions.weeks.forEach((week, weekIndex) => {
		if (week.contributionDays.length > 0) {
			const firstDayDate = new Date(week.contributionDays[0].date);
			const monthKey = `${firstDayDate.getFullYear()}-${firstDayDate.getMonth()}`;

			if (!processedMonths.has(monthKey) && firstDayDate.getDate() <= 7) {
				const leftOffset = dayLabelsColumnRenderedWidth + (weekIndex * CELL_DIMENSION_PX);
				monthLabels.push({
					month: MONTHS[firstDayDate.getMonth()],
					weekIndex: weekIndex,
					leftOffset: leftOffset
				});
				processedMonths.add(monthKey);
			}
		}
	});

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
									className={`w-4 h-4 rounded-sm ${getContributionColor(level)}`}
								/>
							))}
						</div>
						<span>More</span>
					</div>
				</div>
			</div>

			<div className="flex justify-center w-full">
				<div className="relative overflow-x-auto p-1">
					<div
						className="relative mb-2 h-4"
						style={{ marginLeft: dayLabelsColumnRenderedWidth }}
					>
						{monthLabels.map((monthData) => (
							<span
								key={`${monthData.month}-${monthData.weekIndex}`}
								className="absolute text-xs text-muted-foreground whitespace-nowrap"
								style={{
									left: `${monthData.leftOffset - dayLabelsColumnRenderedWidth}px`,
								}}
							>
								{monthData.month}
							</span>
						))}
					</div>

					<div className="flex gap-1">
						<div className="flex flex-col gap-1 w-8 mr-2">
							{DAYS.map((day, index) => (
								<div
									key={day}
									className="text-xs text-muted-foreground h-3 flex items-center justify-end"
								>
									{(index === 1 || index === 3 || index === 5) ? day : ""}
								</div>
							))}
						</div>

						<div className="flex gap-1 min-w-fit">
							{contributions.weeks.map((week, weekIndex) => (
								<div key={week.firstDay} className="flex flex-col gap-1">
									{Array.from({ length: new Date(week.firstDay).getDay() }).map((_, i) => (
										<div key={`empty-${week.firstDay}-${i}`} className="w-3 h-3" />
									))}
									{week.contributionDays.map((day, dayIndex) => (
										<motion.div
											key={day.date}
											className={`w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-primary hover:ring-offset-1 ${getContributionColor(
												day.level,
											)}`}
											whileHover={{ scale: 1.15 }}
											onMouseEnter={(e) => handleMouseEnter(day, e)}
											onMouseLeave={handleMouseLeave}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{
												duration: 0.2,
												delay: (weekIndex * 7 + dayIndex) * 0.001,
											}}
										/>
									))}
									{Array.from({
										length: 7 - (new Date(week.firstDay).getDay() + week.contributionDays.length)
									}).map((_, i) => (
										<div key={`empty-end-${week.firstDay}-${i}`} className="w-3 h-3" />
									))}
								</div>
							))}
						</div>
					</div>

					{tooltip && (
						<motion.div
							className="fixed z-50 px-3 py-2 text-xs bg-popover border border-border rounded-md shadow-lg pointer-events-none max-w-xs"
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
		</div>
	);
}
