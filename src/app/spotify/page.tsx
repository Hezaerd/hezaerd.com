"use client";

import {
	Check,
	ChevronDown,
	Copy,
	ExternalLink,
	ListMusic,
	Music,
	Search,
	Settings,
	User,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SPOTIFY_SCOPE_CATEGORIES = [
	{
		id: "user",
		label: "User Profile & Data",
		icon: User,
		description: "Access user account information",
		scopes: [
			{
				id: "user-read-private",
				label: "Read user profile",
				description: "Access user subscription details, country, etc.",
			},
			{
				id: "user-read-email",
				label: "Read user email",
				description: "Access user email address",
			},
		],
	},
	{
		id: "playback",
		label: "Playback & Currently Playing",
		icon: Music,
		description: "Control and monitor music playback",
		scopes: [
			{
				id: "user-read-currently-playing",
				label: "Read currently playing",
				description: "Read currently playing track",
			},
			{
				id: "user-read-playback-state",
				label: "Read playback state",
				description: "Read playback state and devices",
			},
			{
				id: "user-modify-playback-state",
				label: "Control playback",
				description: "Play, pause, skip tracks, control volume",
			},
		],
	},
	{
		id: "playlists",
		label: "Playlists",
		icon: ListMusic,
		description: "Access and modify playlists",
		scopes: [
			{
				id: "playlist-read-private",
				label: "Read private playlists",
				description: "Access private playlists",
			},
			{
				id: "playlist-read-collaborative",
				label: "Read collaborative playlists",
				description: "Access collaborative playlists",
			},
			{
				id: "playlist-modify-public",
				label: "Modify public playlists",
				description: "Create and modify public playlists",
			},
			{
				id: "playlist-modify-private",
				label: "Modify private playlists",
				description: "Create and modify private playlists",
			},
		],
	},
	{
		id: "history",
		label: "Listening History & Top Items",
		icon: Settings,
		description: "Access listening history and preferences",
		scopes: [
			{
				id: "user-read-recently-played",
				label: "Read recently played",
				description: "Read recently played tracks",
			},
			{
				id: "user-top-read",
				label: "Read top tracks/artists",
				description: "Read top tracks and artists",
			},
		],
	},
];

// Flatten for search functionality
const SPOTIFY_SCOPES = SPOTIFY_SCOPE_CATEGORIES.flatMap(
	(category) => category.scopes,
);

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

export default function SpotifyHelperPage() {
	const clientIdInputId = useId();
	const clientSecretInputId = useId();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [selectedScopes, setSelectedScopes] = useState<string[]>([
		"user-read-currently-playing",
		"user-read-recently-played",
		"user-top-read",
	]);
	const [clientId, setClientId] = useState("");
	const [clientSecret, setClientSecret] = useState("");
	const [tokens, setTokens] = useState<TokenResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isMac, setIsMac] = useState(false);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(["playback", "history"]), // Default expanded categories
	);

	const exchangeCodeForTokens = useCallback(
		async (code: string) => {
			setLoading(true);
			setError(null);

			try {
				const requestBody = {
					code,
					redirect_uri: `${window.location.origin}/spotify`,
					client_id: clientId,
					client_secret: clientSecret,
				};

				const response = await fetch("/api/spotify/token", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(requestBody),
				});

				if (!response.ok) {
					throw new Error(`Failed to exchange code: ${response.status}`);
				}

				const tokenData = await response.json();
				setTokens(tokenData);

				window.history.replaceState(
					{},
					document.title,
					window.location.pathname,
				);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to exchange code for tokens",
				);
			} finally {
				setLoading(false);
			}
		},
		[clientId, clientSecret],
	);

	// Detect operating system
	useEffect(() => {
		const platform = navigator.platform.toLowerCase();
		const userAgent = navigator.userAgent.toLowerCase();
		setIsMac(platform.includes("mac") || userAgent.includes("mac"));
	}, []);

	// Keyboard shortcut to focus search
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const error = urlParams.get("error");

		if (error) {
			setError(`OAuth error: ${error}`);
			window.history.replaceState({}, document.title, window.location.pathname);
		} else if (code) {
			exchangeCodeForTokens(code);
		}
	}, [exchangeCodeForTokens]);

	// Filter categories and scopes based on search term
	const filteredCategories = searchTerm
		? SPOTIFY_SCOPE_CATEGORIES.map((category) => ({
				...category,
				scopes: category.scopes.filter(
					(scope) =>
						scope.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
						scope.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase()) ||
						scope.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
						category.label.toLowerCase().includes(searchTerm.toLowerCase()),
				),
			})).filter((category) => category.scopes.length > 0)
		: SPOTIFY_SCOPE_CATEGORIES;

	const filteredScopes = SPOTIFY_SCOPES.filter(
		(scope) =>
			scope.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
			scope.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			scope.id.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const toggleCategory = (categoryId: string) => {
		setExpandedCategories((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(categoryId)) {
				newSet.delete(categoryId);
			} else {
				newSet.add(categoryId);
			}
			return newSet;
		});
	};

	const selectAllInCategory = (
		category: (typeof SPOTIFY_SCOPE_CATEGORIES)[0],
	) => {
		const categoryScopes = category.scopes.map((s) => s.id);
		const allSelected = categoryScopes.every((id) =>
			selectedScopes.includes(id),
		);

		if (allSelected) {
			// Deselect all in category
			setSelectedScopes((prev) =>
				prev.filter((id) => !categoryScopes.includes(id)),
			);
		} else {
			// Select all in category
			setSelectedScopes((prev) => [...new Set([...prev, ...categoryScopes])]);
		}
	};

	const toggleScope = (scopeId: string) => {
		setSelectedScopes((prev) =>
			prev.includes(scopeId)
				? prev.filter((id) => id !== scopeId)
				: [...prev, scopeId],
		);
	};

	const generateAuthUrl = () => {
		if (!clientId.trim()) {
			setError("Please enter your Spotify Client ID");
			return;
		}

		if (!clientSecret.trim()) {
			setError("Please enter your Spotify Client Secret");
			return;
		}

		const redirectUri = `${window.location.origin}/spotify`;

		const params = new URLSearchParams({
			client_id: clientId,
			response_type: "code",
			redirect_uri: redirectUri,
			scope: selectedScopes.join(" "),
			show_dialog: "true",
		});

		const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

		window.location.href = authUrl;
	};

	const copyRefreshToken = async () => {
		if (tokens?.refresh_token) {
			await navigator.clipboard.writeText(tokens.refresh_token);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const resetFlow = () => {
		setTokens(null);
		setError(null);
		setLoading(false);
	};

	return (
		<div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
						Spotify OAuth Helper
					</h1>
					<p className="text-muted-foreground text-lg">
						Generate Spotify refresh tokens with custom scopes
					</p>
				</div>

				{/* Error Display */}
				{error && (
					<Card className="mb-8 border-red-500/20 bg-red-500/10">
						<CardContent className="p-6">
							<p className="text-red-400 font-medium">Error: {error}</p>
							<Button onClick={resetFlow} variant="outline" className="mt-4">
								Try Again
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Success - Display Tokens */}
				{tokens && !loading && (
					<Card className="mb-8 border-green-500/20 bg-green-500/10">
						<CardHeader>
							<CardTitle className="text-green-400 flex items-center gap-2">
								<Check className="w-5 h-5" />
								Success! Your tokens are ready
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="text-sm font-medium text-green-400 block mb-2">
									Refresh Token (save this in your .env file):
								</div>
								<div className="flex items-center gap-2">
									<code className="flex-1 p-3 bg-muted border rounded text-sm font-mono break-all">
										{tokens.refresh_token}
									</code>
									<Button
										onClick={copyRefreshToken}
										variant="outline"
										size="sm"
										className="shrink-0"
									>
										{copied ? (
											<Check className="w-4 h-4" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<div className="font-medium text-green-400 block mb-1">
										Access Token:
									</div>
									<code className="block p-2 bg-muted border rounded text-xs font-mono break-all">
										{tokens.access_token.substring(0, 50)}...
									</code>
								</div>
								<div>
									<div className="font-medium text-green-400 block mb-1">
										Expires In:
									</div>
									<p className="p-2 bg-muted border rounded text-sm">
										{tokens.expires_in} seconds
									</p>
								</div>
							</div>

							<div>
								<div className="font-medium text-green-400 block mb-1">
									Granted Scopes:
								</div>
								<div className="flex flex-wrap gap-2">
									{tokens.scope.split(" ").map((scope) => (
										<Badge key={scope} variant="secondary" className="text-xs">
											{scope}
										</Badge>
									))}
								</div>
							</div>

							<Button onClick={resetFlow} variant="outline" className="w-full">
								Generate Another Token
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Loading State */}
				{loading && (
					<Card className="mb-8">
						<CardContent className="p-8 text-center">
							<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
							<p className="text-muted-foreground">
								Exchanging authorization code for tokens...
							</p>
						</CardContent>
					</Card>
				)}

				{/* Main Form - Only show if no tokens and not loading */}
				{!tokens && !loading && (
					<Card>
						<CardHeader>
							<CardTitle>Spotify OAuth Setup</CardTitle>
							<p className="text-muted-foreground">
								Enter your Spotify app credentials and select the permissions
								you need
							</p>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Credentials Section */}
							<div className="space-y-4 p-4 border rounded-lg bg-muted/50">
								<h3 className="font-medium">Spotify App Credentials</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor={clientIdInputId}
											className="text-sm font-medium block mb-2"
										>
											Client ID
										</label>
										<input
											id={clientIdInputId}
											type="text"
											value={clientId}
											onChange={(e) => setClientId(e.target.value)}
											placeholder="Enter your Spotify Client ID"
											className="w-full p-3 border rounded-md bg-background text-foreground"
										/>
									</div>
									<div>
										<label
											htmlFor={clientSecretInputId}
											className="text-sm font-medium block mb-2"
										>
											Client Secret
										</label>
										<input
											id={clientSecretInputId}
											type="password"
											value={clientSecret}
											onChange={(e) => setClientSecret(e.target.value)}
											placeholder="Enter your Spotify Client Secret"
											className="w-full p-3 border rounded-md bg-background text-foreground"
										/>
									</div>
								</div>
								<p className="text-xs text-muted-foreground">
									Your credentials are processed client-side only and never
									stored on our servers.
								</p>
							</div>

							{/* Scope Search Bar */}
							<div className="space-y-4">
								<h3 className="font-medium">OAuth Scopes</h3>
								<div className="relative group max-w-md mx-auto">
									<Search
										className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300 ease-in-out ${
											isSearchFocused || searchTerm
												? "text-primary scale-110"
												: "text-muted-foreground group-hover:text-foreground"
										}`}
									/>
									<input
										type="text"
										placeholder="Search scopes by name, description, or permission..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onFocus={() => setIsSearchFocused(true)}
										onBlur={() => setIsSearchFocused(false)}
										ref={searchInputRef}
										className={`w-full pl-10 pr-20 py-3 text-sm bg-background border rounded-lg placeholder:text-muted-foreground transition-all duration-300 ease-in-out transform ${
											isSearchFocused
												? "scale-105 border-primary shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
												: "border-border hover:border-foreground/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
										}`}
									/>
									<div
										className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-muted px-2 py-1 rounded border flex items-center gap-1 transition-all duration-300 ease-in-out ${
											isSearchFocused
												? "text-primary border-primary/50 shadow-sm scale-105"
												: "text-muted-foreground border-border group-hover:text-foreground group-hover:border-foreground/30"
										}`}
									>
										<kbd className="font-mono">{isMac ? "⌘" : "Ctrl"} K</kbd>
									</div>
								</div>
								{searchTerm && (
									<div className="text-sm text-muted-foreground">
										{filteredCategories.length === 0 ? (
											<span>No scopes found matching "{searchTerm}"</span>
										) : (
											<span>
												Showing {filteredScopes.length} of{" "}
												{SPOTIFY_SCOPES.length} scopes across{" "}
												{filteredCategories.length} categories
												{filteredScopes.length < SPOTIFY_SCOPES.length &&
													` for "${searchTerm}"`}
											</span>
										)}
									</div>
								)}
							</div>

							{/* Categorized Scopes */}
							<div className="space-y-4">
								{filteredCategories.map((category) => {
									const Icon = category.icon;
									const isExpanded =
										expandedCategories.has(category.id) || searchTerm;
									const categorySelectedCount = category.scopes.filter(
										(scope) => selectedScopes.includes(scope.id),
									).length;

									return (
										<Card key={category.id} className="overflow-hidden">
											<button
												type="button"
												onClick={() => toggleCategory(category.id)}
												className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
												disabled={!!searchTerm}
											>
												<div className="flex items-center gap-3">
													<Icon className="w-5 h-5 text-primary" />
													<div className="text-left">
														<h3 className="font-medium flex items-center gap-2">
															{category.label}
															{categorySelectedCount > 0 && (
																<Badge variant="secondary" className="text-xs">
																	{categorySelectedCount} selected
																</Badge>
															)}
														</h3>
														<p className="text-sm text-muted-foreground">
															{category.description}
														</p>
													</div>
												</div>
												{!searchTerm && (
													<ChevronDown
														className={`w-4 h-4 transition-transform ${
															isExpanded ? "rotate-180" : ""
														}`}
													/>
												)}
											</button>

											{isExpanded && (
												<div className="border-t bg-muted/20">
													<div className="px-4 py-2 border-b border-border/50 flex justify-between items-center">
														<span className="text-xs font-medium text-muted-foreground">
															{category.scopes.length} permissions
														</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																selectAllInCategory(category);
															}}
															className="h-6 px-2 text-xs"
														>
															{category.scopes.every((scope) =>
																selectedScopes.includes(scope.id),
															)
																? "Deselect All"
																: "Select All"}
														</Button>
													</div>
													<div className="p-4 space-y-3">
														{category.scopes.map((scope) => (
															<label
																key={scope.id}
																className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-background ${
																	selectedScopes.includes(scope.id)
																		? "border-primary bg-primary/5"
																		: "border-border hover:border-primary/50"
																}`}
															>
																<input
																	type="checkbox"
																	checked={selectedScopes.includes(scope.id)}
																	onChange={() => toggleScope(scope.id)}
																	className="mt-1"
																/>
																<div className="flex-1 min-w-0">
																	<h4 className="font-medium text-sm">
																		{scope.label}
																	</h4>
																	<p className="text-xs text-muted-foreground mt-1">
																		{scope.description}
																	</p>
																	<code className="text-xs text-muted-foreground/70 block mt-1">
																		{scope.id}
																	</code>
																</div>
															</label>
														))}
													</div>
												</div>
											)}
										</Card>
									);
								})}
							</div>

							<div className="pt-4 border-t">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="font-medium">
											Selected Scopes ({selectedScopes.length})
										</h3>
										<p className="text-sm text-muted-foreground">
											These permissions will be requested from Spotify
										</p>
									</div>
								</div>

								<div className="flex flex-wrap gap-2 mb-6">
									{selectedScopes.map((scope) => (
										<Badge key={scope} variant="default" className="text-xs">
											{scope}
											<button
												type="button"
												onClick={() => toggleScope(scope)}
												className="ml-2 hover:bg-primary-foreground/20 rounded"
											>
												×
											</button>
										</Badge>
									))}
								</div>

								<Button
									onClick={() => {
										generateAuthUrl();
									}}
									className="w-full"
									size="lg"
									disabled={
										selectedScopes.length === 0 ||
										!clientId.trim() ||
										!clientSecret.trim()
									}
								>
									<ExternalLink className="w-4 h-4 mr-2" />
									Authorize with Spotify
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Instructions */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle className="text-lg">Setup Instructions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div>
							<h4 className="font-medium mb-2">1. Create a Spotify App:</h4>
							<p className="text-muted-foreground mb-2">
								Go to{" "}
								<a
									href="https://developer.spotify.com/dashboard"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary underline"
								>
									Spotify Developer Dashboard
								</a>{" "}
								and create a new app to get your Client ID and Secret.
							</p>
						</div>

						<div>
							<h4 className="font-medium mb-2">2. Configure Redirect URI:</h4>
							<p className="text-muted-foreground">
								In your Spotify app settings, add{" "}
								<code className="bg-muted px-1 rounded">
									{process.env.NEXT_PUBLIC_APP_URL}/spotify
								</code>{" "}
								as a redirect URI.
							</p>
						</div>

						<div>
							<h4 className="font-medium mb-2">3. Usage:</h4>
							<p className="text-muted-foreground">
								After authorization, save the refresh token in your environment
								variables as{" "}
								<code className="bg-muted px-1 rounded">
									SPOTIFY_REFRESH_TOKEN
								</code>
								. This token doesn't expire and can be used to get new access
								tokens programmatically.
							</p>
						</div>

						<div>
							<h4 className="font-medium mb-2">4. Security:</h4>
							<p className="text-muted-foreground">
								Your credentials are processed securely and never stored or
								logged on the server. Always keep your Client Secret private.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
