"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { type ReactNode, useEffect, useState } from "react";

interface PortfolioProviderProps {
	children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000, // 5 minutes
						gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
						retry: 2,
						refetchOnWindowFocus: false,
						refetchOnMount: false, // Don't refetch on mount if we have cached data
						refetchOnReconnect: "always", // Always refetch when reconnecting
						// Use stale-while-revalidate pattern
						networkMode: "offlineFirst",
					},
				},
			}),
	);

	const [persister, setPersister] = useState<
		ReturnType<typeof createSyncStoragePersister> | undefined
	>(undefined);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		// Only create persister after hydration to prevent SSR mismatches
		const newPersister = createSyncStoragePersister({
			storage: window.localStorage,
			key: "hezaerd-portfolio-cache",
			throttleTime: 1000, // Throttle saves to localStorage
		});
		setPersister(newPersister);
		setIsHydrated(true);
	}, []);

	// During SSR and before hydration, use the basic QueryClientProvider
	if (!isHydrated || !persister) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	// After hydration, use PersistQueryClientProvider for cache persistence
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister,
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
				buster: "v1", // Change this to invalidate all cached data
			}}
		>
			{children}
		</PersistQueryClientProvider>
	);
}
