import { RefObject, useEffect, useState } from 'react';
import { Repository, RepositoryCard } from './RepositoryCard';
import SwipeCard from './SwipeCard';

interface RepositoryListProps {
  repositories: Repository[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export function RepositoryList(props: RepositoryListProps) {
  const { repositories, scrollContainerRef } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSwipe = (dir: string, repo: Repository, index: number) => {
    if (dir === 'left') {
      console.log('swiped left');
      console.log('repo >>', repo);

      setTimeout(() => {
        setCurrentIndex(index + 1);
      }, 300);

    } else if (dir === 'right') {
      console.log('swiped right');
      console.log('repo >>', repo);

      setTimeout(() => {
        setCurrentIndex(index + 1);
      }, 300);
    }
  }

  // Effect to handle auto-scrolling
  useEffect(() => {
    if (scrollContainerRef.current && currentIndex < repositories.length) {
      const nextCard = document.getElementById(`repo-card-${currentIndex}`);
      if (nextCard) {
        nextCard.scrollIntoView({ behavior: 'instant'  });
      }
    }
  }, [currentIndex, repositories.length, scrollContainerRef]);

  return (
    <div
      ref={scrollContainerRef}
      className='flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide'
    >
      <div className="flex flex-col items-center">
        {repositories.map((repository, index) => (
          <SwipeCard
            key={repository.id}
            className='swipe w-full'
            preventSwipe={['up', 'down']}
            onSwipe={(dir: string) => onSwipe(dir, repository, index)}
          >
            <div
              id={`repo-card-${index}`}
              className='snap-start min-h-[calc(100dvh-60px)] h-[calc(100dvh-60px)] flex items-center py-6'
            >
              <div className='w-full max-w-3xl mx-auto px-4 sm:px-6 h-full'>
                <RepositoryCard repository={repository} />
              </div>
            </div>
          </SwipeCard>
        ))}
      </div>
    </div>
  );
}
