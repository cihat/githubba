import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import {
  fetchRepositoriesPage,
  MAX_PAGES,
  getSearchCriterias,
} from '../lib/github';
import { InvalidTokenError, OnlyFirst1000ResultsError } from '../lib/errors';
import { RateLimitExceededError } from '../lib/errors';
import type { FeedType, Repository, SearchCriteria } from '../types';

const SEEN_STORAGE_KEY = 'github_seen_repositories';

interface SeenRepositories {
  [key: string]: {
    seenPages: Set<number>;
    totalPages: number | null;
    exhausted: boolean;
  };
}

interface PageParam {
  criteria: SearchCriteria;
  page: number;
}

interface QueryResponse {
  total_count: number;
  items: Array<Repository & { searchCriteria: string }>;
  nextPage: PageParam;
}

interface UseGitHubOptions {
  language?: string;
  token?: string;
  enabled?: boolean;
  feedType?: FeedType;
}

export function useGitHub(params: UseGitHubOptions = {}) {
  const { language, token, enabled = true, feedType = 'random' } = params;

  const seenRef = useRef<SeenRepositories>({});

  const loadSeenRepositories = useCallback((): SeenRepositories => {
    const stored = localStorage.getItem(SEEN_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored, (key, value) => {
      if (key === 'seenPages') {
        return new Set(value);
      }
      return value;
    });
  }, []);

  const saveSeenRepositories = useCallback((seen: SeenRepositories) => {
    localStorage.setItem(
      SEEN_STORAGE_KEY,
      JSON.stringify(seen, (_, value) => {
        if (value instanceof Set) {
          return Array.from(value);
        }
        return value;
      })
    );
  }, []);

  const getNextSearchParams = useCallback(
    (seen: SeenRepositories) => {
      const availableCriterias = getSearchCriterias(feedType)
        .map((criteria) => ({
          ...criteria,
          language: language || undefined,
        }))
        .filter((criteria) => !seen[JSON.stringify(criteria)]?.exhausted);

      if (availableCriterias.length === 0) {
        // If all criterias are exhausted, clear seen data and start over
        localStorage.removeItem(SEEN_STORAGE_KEY);
        return {
          criteria: {
            ...getSearchCriterias(feedType)[0],
            language: language || undefined,
          },
          page: 1,
        };
      }

      const criteria =
        feedType === 'new'
          ? availableCriterias[0]
          : availableCriterias[
          Math.floor(Math.random() * availableCriterias.length)
          ];
      const criteriaKey = JSON.stringify(criteria);
      const seenData = seen[criteriaKey];

      if (!seenData?.totalPages) {
        return { criteria, page: 1 };
      }

      const effectiveTotalPages = Math.min(seenData.totalPages, MAX_PAGES);

      for (let page = 1; page <= effectiveTotalPages; page++) {
        if (!seenData.seenPages.has(page)) {
          return { criteria, page };
        }
      }

      seenData.exhausted = true;
      seen[criteriaKey] = seenData;
      saveSeenRepositories(seen);
      return getNextSearchParams(seen);
    },
    [language, feedType]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    error,
    isRefetching,
  } = useInfiniteQuery<
    QueryResponse,
    Error,
    InfiniteData<QueryResponse>,
    [string, string | undefined],
    PageParam | null
  >({
    queryKey: ['repositories', language],
    initialPageParam: null,
    enabled,
    retry: false,
    queryFn: async () => {
      const seen = (seenRef.current = loadSeenRepositories());

      async function tryFetchWithParams(
        params: PageParam
      ): Promise<QueryResponse> {
        const criteriaKey = JSON.stringify(params.criteria);

        try {
          const response = await fetchRepositoriesPage(params, token);

          if (response.total_count === 0) {
            // If no results found, mark this criteria as exhausted and try next one
            const seenData = seen[criteriaKey] || {
              seenPages: new Set(),
              totalPages: 0,
              exhausted: true,
            };
            seen[criteriaKey] = seenData;
            saveSeenRepositories(seen);

            // Try next criteria recursively until we find results or run out of criteria
            const nextParams = getNextSearchParams(seen);
            return tryFetchWithParams(nextParams);
          }

          const totalPages = Math.min(
            Math.ceil(response.total_count / 10),
            MAX_PAGES
          );

          const seenData = seen[criteriaKey] || {
            seenPages: new Set(),
            totalPages,
            exhausted: false,
          };

          seenData.seenPages.add(params.page);
          seenData.exhausted = seenData.seenPages.size >= totalPages;
          seen[criteriaKey] = seenData;
          saveSeenRepositories(seen);

          return {
            total_count: response.total_count,
            items: response.items.map((repo) => ({
              ...repo,
              searchCriteria: criteriaKey,
            })),
            nextPage: getNextSearchParams(seen),
          };
        } catch (error) {
          if (
            error instanceof RateLimitExceededError ||
            error instanceof OnlyFirst1000ResultsError ||
            error instanceof InvalidTokenError
          ) {
            throw error;
          }

          // For other errors, try next criteria
          const nextParams = getNextSearchParams(seen);
          return tryFetchWithParams(nextParams);
        }
      }

      const initialParams = getNextSearchParams(seen);
      return tryFetchWithParams(initialParams);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const repositories = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    repositories,
    isLoading,
    isFetchingMore: isFetchingNextPage,
    isRefetching: isRefetching,
    error: error ? (error as Error).message : null,
    fetchMore: () => fetchNextPage(),
    refresh: () => {
      localStorage.removeItem(SEEN_STORAGE_KEY);
      refetch();
    },
  };
}
