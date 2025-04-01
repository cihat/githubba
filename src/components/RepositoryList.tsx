import { RefObject, useEffect, useState } from 'react';
import { Repository, RepositoryCard } from './RepositoryCard';
import SwipeCard from './SwipeCard';
import { Heart, X } from 'lucide-react';

interface RepositoryListProps {
  repositories: Repository[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export function RepositoryList(props: RepositoryListProps) {
  const { repositories, scrollContainerRef } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState<{ type: 'like' | 'dislike' | null, show: boolean }>({ 
    type: null, 
    show: false 
  });
  
  const onSwipe = (dir: string, repo: Repository, index: number) => {
    if (dir === 'left') {
      console.log('swiped left');
      console.log('repo >>', repo);
      
      setAnimation({ type: 'dislike', show: true });
      
      setTimeout(() => {
        setAnimation({ type: null, show: false });
        setCurrentIndex(index + 1);
      }, 800);
      
    } else if (dir === 'right') {
      console.log('swiped right');
      console.log('repo >>', repo);
      
      setAnimation({ type: 'like', show: true });
      
      setTimeout(() => {
        setAnimation({ type: null, show: false });
        setCurrentIndex(index + 1);
      }, 800);
    }
  }
  
  useEffect(() => {
    if (scrollContainerRef.current && currentIndex < repositories.length) {
      const nextCard = document.getElementById(`repo-card-${currentIndex}`);
      if (nextCard) {
        nextCard.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [currentIndex, repositories.length, scrollContainerRef]);

  return (
    <div
      ref={scrollContainerRef}
      className='flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide relative'
    >
      {animation.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {animation.type === 'like' ? (
            <div className="animate-pulse scale-in-center">
              <Heart size={120} color="#FF4B91" fill="#FF4B91" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="animate-pulse scale-in-center">
              <X size={120} color="#FF4B4B" strokeWidth={3} />
            </div>
          )}
        </div>
      )}
      
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
