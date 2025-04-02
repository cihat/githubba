import { RefObject, useEffect, useState, useCallback } from 'react';
import { Repository, RepositoryCard } from './RepositoryCard';
import SwipeCard from './SwipeCard';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface RepositoryListProps {
  repositories: Repository[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

interface AnimationState {
  type: 'like' | 'dislike' | null;
  show: boolean;
}

interface SwipeHintState {
  show: boolean;
  direction: 'left' | 'right' | null;
  sequenceIndex: number;
}

const ANIMATION_SEQUENCE = [
  { direction: 'right', duration: 1500 },
  { direction: null, duration: 500 },
  { direction: 'left', duration: 1500 },
  { direction: null, duration: 1000 }
];

const ANIMATION_DURATION = 500;

export function RepositoryList({ repositories, scrollContainerRef }: RepositoryListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState<AnimationState>({
    type: null,
    show: false
  });
  const [swipeHint, setSwipeHint] = useState<SwipeHintState>({
    show: true,
    direction: null,
    sequenceIndex: 0
  });

  useEffect(() => {
    if (!scrollContainerRef.current || currentIndex >= repositories.length) return;
    
    const nextCard = document.getElementById(`repo-card-${currentIndex}`);
    if (nextCard) {
      nextCard.scrollIntoView({ behavior: 'instant' });
    }
  }, [currentIndex, repositories.length, scrollContainerRef]);

  useEffect(() => {
    if (!swipeHint.show) return;

    const currentStep = ANIMATION_SEQUENCE[swipeHint.sequenceIndex];
    
    setSwipeHint(prev => ({
      ...prev,
      direction: currentStep.direction as 'left' | 'right' | null
    }));

    const timer = window.setTimeout(() => {
      setSwipeHint(prev => ({
        ...prev,
        sequenceIndex: (prev.sequenceIndex + 1) % ANIMATION_SEQUENCE.length
      }));
    }, currentStep.duration);

    return () => window.clearTimeout(timer);
  }, [swipeHint.show, swipeHint.sequenceIndex]);

  const handleSwipe = useCallback((direction: string, repository: Repository, index: number) => {
    setSwipeHint({ show: false, direction: null, sequenceIndex: 0 });

    if (direction === 'left') {
      handleLeftSwipe(repository, index);
    } else if (direction === 'right') {
      handleRightSwipe(repository, index);
    }
  }, []);

  const handleLeftSwipe = (repository: Repository, index: number) => {
    console.log('Swiped left on repository:', repository.id);
    
    showAnimationAndAdvance('dislike', index);
  };

  const handleRightSwipe = (repository: Repository, index: number) => {
    console.log('Swiped right on repository:', repository.id);
    
    window.open(repository.html_url, '_blank', 'noopener,noreferrer');
    
    showAnimationAndAdvance('like', index);
  };

  const showAnimationAndAdvance = (type: 'like' | 'dislike', index: number) => {
    setAnimation({ type, show: true });
    
    window.setTimeout(() => {
      setAnimation({ type: null, show: false });
      setCurrentIndex(index + 1);
    }, ANIMATION_DURATION);
  };

  const getHintClassName = (index: number) => {
    if (!swipeHint.show || index !== currentIndex) return '';

    if (swipeHint.direction === 'left') return 'swipe-hint-left';
    if (swipeHint.direction === 'right') return 'swipe-hint-right';
    return '';
  };

  return (
    <div
      ref={scrollContainerRef}
      className='flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide relative'
    >
      <AnimationOverlay animation={animation} />
      <SwipeDirectionIndicators show={swipeHint.show} direction={swipeHint.direction} />
      <RepositoryCardList 
        repositories={repositories}
        currentIndex={currentIndex}
        swipeHint={swipeHint}
        handleSwipe={handleSwipe}
        getHintClassName={getHintClassName}
      />
    </div>
  );
}

interface AnimationOverlayProps {
  animation: AnimationState;
}

function AnimationOverlay({ animation }: AnimationOverlayProps) {
  if (!animation.show) return null;
  
  return (
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
  );
}

interface SwipeDirectionIndicatorsProps {
  show: boolean;
  direction: 'left' | 'right' | null;
}

function SwipeDirectionIndicators({ show, direction }: SwipeDirectionIndicatorsProps) {
  if (!show) return null;
  
  return (
    <>
      {/* Left Arrow */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 pointer-events-none">
        <div className={`transition-opacity duration-500 ${direction === 'left' ? 'opacity-100' : 'opacity-30'}`}>
          <ChevronLeft size={48} className="text-gray-600 animate-pulse" />
        </div>
      </div>

      {/* Right Arrow */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 pointer-events-none">
        <div className={`transition-opacity duration-500 ${direction === 'right' ? 'opacity-100' : 'opacity-30'}`}>
          <ChevronRight size={48} className="text-gray-600 animate-pulse" />
        </div>
      </div>
    </>
  );
}

interface RepositoryCardListProps {
  repositories: Repository[];
  currentIndex: number;
  swipeHint: SwipeHintState;
  handleSwipe: (direction: string, repository: Repository, index: number) => void;
  getHintClassName: (index: number) => string;
}

function RepositoryCardList({ 
  repositories, 
  currentIndex, 
  swipeHint, 
  handleSwipe, 
  getHintClassName 
}: RepositoryCardListProps) {
  return (
    <div className="flex flex-col items-center">
      {repositories.map((repository, index) => (
        <SwipeCard
          key={repository.id}
          className="swipe w-full"
          preventSwipe={['up', 'down']}
          onSwipe={(dir: string) => handleSwipe(dir, repository, index)}
        >
          <div
            id={`repo-card-${index}`}
            className='snap-start min-h-[calc(100dvh-60px)] h-[calc(100dvh-60px)] flex items-center py-6'
          >
            <div className={`w-full max-w-3xl mx-auto px-4 sm:px-6 h-full relative ${getHintClassName(index)}`}>
              <RepositoryCard repository={repository} />

              {/* Swipe Instruction Text */}
              {index === currentIndex && swipeHint.show && (
                <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
                  <div className="bg-white/70 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                    <p className="text-center text-gray-700 text-sm">
                      Swipe card left or right
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SwipeCard>
      ))}
    </div>
  );
}
