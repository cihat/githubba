import { useEffect, useRef, useState } from 'react';
import { ErrorState } from './components/ErrorState';
import { LoadingBar } from './components/LoadingBar';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Navigation } from './components/Navigation';
import { OfflineState } from './components/OfflineState';
import { RepositoryStack } from './components/RepositoryStack';
import { SettingsPopup } from './components/SettingsPopup';
import { useGitHub } from './hooks/use-github';
import { useOnlineStatus } from './hooks/use-online-status';
import { Analytics } from '@vercel/analytics/react';
import { FeedType } from './types';

export function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<string>();
  const [selectedFeedType, setSelectedFeedType] = useState<FeedType>('random');
  const [isInitialized, setIsInitialized] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    const savedToken = localStorage.getItem('github_token');
    const savedFeedType = localStorage.getItem('feed_type') as FeedType;
    
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
    if (savedToken) {
      setSelectedToken(savedToken);
    }
    if (savedFeedType) {
      setSelectedFeedType(savedFeedType);
    }
    setIsInitialized(true);
  }, []);

  const {
    repositories,
    isLoading,
    isFetchingMore,
    fetchMore,
    error,
    refresh,
    isRefetching,
  } = useGitHub({
    language: selectedLanguage,
    token: selectedToken,
    enabled: isInitialized,
    feedType: selectedFeedType,
  });

  // Remove useInfiniteScroll since RepositoryList will handle loading more
  // const scrollContainerRef = useInfiniteScroll({
  //   onLoadMore: fetchMore,
  //   isLoading: isLoading || isFetchingMore,
  // });

  // Create a simple ref for the container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSaveSettings = (language: string, token: string, feedType: FeedType) => {
    setSelectedLanguage(language);
    setSelectedToken(token);
    setSelectedFeedType(feedType);
    localStorage.setItem('preferred_language', language);
    localStorage.setItem('github_token', token);
    localStorage.setItem('feed_type', feedType);
  };

  const getErrorMessage = (error: unknown) => {
    if (!error) return undefined;
    return error instanceof Error ? error.message : String(error);
  };

  // Wrapper function to prevent multiple calls
  const handleLoadMore = () => {
    if (!isFetchingMore && !isLoading) {
      fetchMore();
    }
  };

  return (
    <div className='h-screen relative flex flex-col bg-white dark:bg-zinc-900 dark:bg-gradient-to-b dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white overflow-hidden'>
      {(isFetchingMore || isLoading || isRefetching) && <LoadingBar />}
      
      {showSettings && (
        <SettingsPopup
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialLanguage={selectedLanguage}
          initialToken={selectedToken}
          initialFeedType={selectedFeedType}
          error={getErrorMessage(error)}
          onRefresh={refresh}
        />
      )}
      
      <Navigation
        onSettingsClick={() => setShowSettings(true)}
        onRefreshClick={refresh}
        isDataLoading={isFetchingMore || isLoading || isRefetching}
      />
      
      {!isOnline ? (
        <OfflineState />
      ) : isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorState error={error.toString()} />
      ) : (
        <RepositoryStack
          repositories={repositories}
          scrollContainerRef={scrollContainerRef}
          onLoadMore={handleLoadMore}
        />
      )}
      
      <Analytics />
    </div>
  );
}
