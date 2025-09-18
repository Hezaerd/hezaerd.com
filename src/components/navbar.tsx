"use client";

import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { NAVIGATION_ITEMS, SECTION_IDS } from "@/lib/sections";
import { cn } from "@/lib/utils";

// Custom hook to track active section
function useActiveSection(homeId: string) {
	const [activeSection, setActiveSection] = useState(homeId);

	useEffect(() => {
		const observerOptions = {
			root: null,
			rootMargin: "-20% 0px -60% 0px",
			threshold: 0.1,
		};

		const observerCallback = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const sectionId = entry.target.id;
					setActiveSection(sectionId);
				}
			});
		};

		const observer = new IntersectionObserver(
			observerCallback,
			observerOptions,
		);

		// Observe all sections
		const sections = document.querySelectorAll("section[id]");
		sections.forEach((section) => {
			observer.observe(section);
		});

		return () => {
			sections.forEach((section) => {
				observer.unobserve(section);
			});
		};
	}, []);

	return activeSection;
}

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
	const activeSection = useActiveSection(SECTION_IDS.home);
	const navItemRefs = useRef<{ [key: string]: HTMLElement | null }>({});
	const navListRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		// Check initial scroll position on mount
		handleScroll();

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Update underline position when active section changes
	useEffect(() => {
		const updateUnderlinePosition = () => {
			const activeNavItem = navItemRefs.current[activeSection];
			const navList = navListRef.current;

			if (activeNavItem && navList) {
				const navListRect = navList.getBoundingClientRect();
				const activeItemRect = activeNavItem.getBoundingClientRect();

				const left = activeItemRect.left - navListRect.left;
				const width = activeItemRect.width;

				setUnderlineStyle({
					left: left,
					width: width,
				});
			}
		};

		// Small delay to ensure DOM is updated
		const timeoutId = setTimeout(updateUnderlinePosition, 10);

		return () => clearTimeout(timeoutId);
	}, [activeSection]);

	// Set initial position on mount
	useEffect(() => {
		const setInitialPosition = () => {
			const homeNavItem = navItemRefs.current[SECTION_IDS.home];
			const navList = navListRef.current;

			if (homeNavItem && navList) {
				const navListRect = navList.getBoundingClientRect();
				const homeItemRect = homeNavItem.getBoundingClientRect();

				const left = homeItemRect.left - navListRect.left;
				const width = homeItemRect.width;

				setUnderlineStyle({
					left: left,
					width: width,
				});
			}
		};

		// Wait for next tick to ensure refs are set
		const timeoutId = setTimeout(setInitialPosition, 100);

		return () => clearTimeout(timeoutId);
	}, []);

	const scrollToSection = (href: string) => {
		const element = document.querySelector(href);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
		setIsMobileMenuOpen(false);
	};

	const isActive = (href: string) => {
		return activeSection === href.replace("#", "");
	};

	return (
		<nav
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300",
				isScrolled
					? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg"
					: "bg-transparent",
			)}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex-shrink-0">
						<a
							href={`#${SECTION_IDS.home}`}
							className="text-2xl font-bold text-primary hover:text-primary/80 transition-all duration-300"
						>
							Portfolio
						</a>
					</div>

					{/* Desktop Navigation - Centered */}
					<div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
						<NavigationMenu>
							<NavigationMenuList
								ref={navListRef}
								className="space-x-1 relative"
							>
								{NAVIGATION_ITEMS.map((item) => (
									<NavigationMenuItem key={item.name}>
										<NavigationMenuLink
											ref={(el) => {
												if (el) {
													navItemRefs.current[item.href.replace("#", "")] = el;
												}
											}}
											className={cn(
												navigationMenuTriggerStyle(),
												"bg-transparent hover:bg-accent hover:text-accent-foreground transition-all duration-300",
												isActive(item.href) && "text-primary",
											)}
											onClick={() => scrollToSection(item.href)}
										>
											{item.name}
										</NavigationMenuLink>
									</NavigationMenuItem>
								))}
								<div
									className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
									style={{
										left: `${underlineStyle.left}px`,
										width: `${underlineStyle.width}px`,
										transform: "translateY(-2px)",
									}}
								/>
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					<div className="hidden md:flex items-center gap-3">
						<ThemeToggle />
						<Button
							onClick={() => {
								window.open("mailto:hezaerd@gmail.com", "_blank");
							}}
							className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-all duration-300 shadow-lg hover:shadow-xl"
						>
							Get In Touch
						</Button>
					</div>

					<div className="md:hidden">
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-foreground hover:bg-accent hover:text-accent-foreground"
								>
									<Menu className="h-6 w-6" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-[300px] sm:w-[400px]">
								<SheetHeader>
									<SheetTitle className="text-left">
										<span className="text-2xl font-bold text-primary">
											Portfolio
										</span>
									</SheetTitle>
									<SheetDescription className="text-left">
										Portfolio Navigation
									</SheetDescription>
								</SheetHeader>
								<div className="mt-8 space-y-4">
									{NAVIGATION_ITEMS.map((item) => {
										const Icon = item.icon;
										return (
											<Button
												key={item.name}
												variant="ghost"
												className={cn(
													"w-full justify-start text-left h-12 px-4 hover:bg-accent hover:text-accent-foreground transition-all duration-300 relative",
													isActive(item.href) &&
														"bg-accent text-accent-foreground border-l-2 border-primary",
												)}
												onClick={() => scrollToSection(item.href)}
											>
												<Icon className="mr-3 h-5 w-5" />
												{item.name}
												{isActive(item.href) && (
													<span className="absolute right-3 w-2 h-2 bg-primary rounded-full" />
												)}
											</Button>
										);
									})}
									<div className="pt-6 space-y-4 border-t border-border">
										<div className="flex items-center justify-between py-2 px-4">
											<span className="text-sm font-medium text-foreground">
												Theme
											</span>
											<div className="flex items-center">
												<ThemeToggle />
											</div>
										</div>
										<div className="px-4">
											<Button
												onClick={() => {
													window.open("mailto:hezaerd@gmail.com", "_blank");
												}}
												className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-all duration-300"
											>
												Get In Touch
											</Button>
										</div>
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
}
