import { RefObject, useEffect, useState, useCallback, useRef } from 'react';
import { Repository, RepositoryCard } from './RepositoryCard';
import SwipeCard from './SwipeCard';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { openLink } from '../lib/utils';

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
const CARD_TRANSITION_DURATION = 300;

interface RepositoryListProps {
  repositories: Repository[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onLoadMore?: () => void; // Callback for loading more repositories
}

export function RepositoryList({ repositories, scrollContainerRef, onLoadMore }: RepositoryListProps) {
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasRequestedMore, setHasRequestedMore] = useState(false);

  // Animation timer refs for cleanup
  const animationTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const prevLengthRef = useRef(repositories.length);

  useEffect(() => {
    if (!swipeHint.show) return;

    const currentStep = ANIMATION_SEQUENCE[swipeHint.sequenceIndex];

    setSwipeHint(prev => ({
      ...prev,
      direction: currentStep.direction as 'left' | 'right' | null
    }));

    hintTimerRef.current = window.setTimeout(() => {
      setSwipeHint(prev => ({
        ...prev,
        sequenceIndex: (prev.sequenceIndex + 1) % ANIMATION_SEQUENCE.length
      }));
    }, currentStep.duration);

    return () => {
      if (hintTimerRef.current) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [swipeHint.show, swipeHint.sequenceIndex]);

  // Check if we need to load more repositories
  useEffect(() => {
    const remainingCards = repositories.length - currentIndex;
    const shouldLoadMore = remainingCards <= 5 && !hasRequestedMore && onLoadMore;
    
    if (shouldLoadMore) {
      setHasRequestedMore(true);
      onLoadMore();
    }
  }, [currentIndex, repositories.length, hasRequestedMore, onLoadMore]);

  // Reset the request flag when new repositories are added (but only if significantly more added)
  useEffect(() => {
    // Only reset if we got significantly more repositories (indicates successful fetch)
    if (repositories.length > prevLengthRef.current + 5) {
      setHasRequestedMore(false);
    }
    
    prevLengthRef.current = repositories.length;
  }, [repositories.length]);
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current);
      }
      if (hintTimerRef.current) {
        window.clearTimeout(hintTimerRef.current);
      }
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const triggerAnimation = useCallback((type: 'like' | 'dislike', onComplete?: () => void) => {
    // Clear any existing animation timer
    if (animationTimerRef.current) {
      window.clearTimeout(animationTimerRef.current);
    }

    setAnimation({ type, show: true });

    animationTimerRef.current = window.setTimeout(() => {
      setAnimation({ type: null, show: false });
      onComplete?.();
      animationTimerRef.current = null;
    }, ANIMATION_DURATION);
  }, []);

  const advanceToNextCard = useCallback(() => {
    if (currentIndex >= repositories.length - 1) return;

    setIsTransitioning(true);
    
    transitionTimerRef.current = window.setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, CARD_TRANSITION_DURATION);
  }, [currentIndex, repositories.length]);

  const handleSwipe = useCallback((direction: string, repository: Repository, index: number) => {
    // Only handle swipes for the current card
    if (index !== currentIndex) return;
    
    setSwipeHint({ show: false, direction: null, sequenceIndex: 0 });

    if (direction === 'left') {
      handleLeftSwipe(repository, index);
    } else if (direction === 'right') {
      handleRightSwipe(repository, index);
    }
  }, [currentIndex]);

  const handleLeftSwipe = useCallback((repository: Repository, index: number) => {
    console.log('Swiped left on repository:', repository.id);

    triggerAnimation('dislike', () => {
      advanceToNextCard();
    });
  }, [triggerAnimation, advanceToNextCard]);

  const handleRightSwipe = useCallback((repository: Repository, index: number) => {
    console.log('Swiped right on repository:', repository.id);

    openLink(repository.html_url);

    triggerAnimation('like', () => {
      advanceToNextCard();
    });
  }, [triggerAnimation, advanceToNextCard]);

  const getHintClassName = useCallback((index: number) => {
    if (!swipeHint.show || index !== currentIndex) return '';

    if (swipeHint.direction === 'left') return 'swipe-hint-left';
    if (swipeHint.direction === 'right') return 'swipe-hint-right';
    return '';
  }, [swipeHint.show, swipeHint.direction, currentIndex]);

  // Get visible cards (current and next few)
  const getVisibleCards = () => {
    const visibleCount = 3; // Show current + 2 behind
    return repositories.slice(currentIndex, currentIndex + visibleCount);
  };

  if (currentIndex >= repositories.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Done! 🎉</h2>
          <p className="text-gray-600">You've reviewed all repositories.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className='flex-1 relative overflow-hidden'
    >
      <AnimationOverlay animation={animation} />
      <SwipeDirectionIndicators show={swipeHint.show} direction={swipeHint.direction} />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 h-full relative">
          <CardStack
            cards={getVisibleCards()}
            currentIndex={currentIndex}
            swipeHint={swipeHint}
            handleSwipe={handleSwipe}
            getHintClassName={getHintClassName}
            isTransitioning={isTransitioning}
          />
        </div>
      </div>
    </div>
  );
}

interface AnimationOverlayProps {
  animation: AnimationState;
}

function AnimationOverlay({ animation }: AnimationOverlayProps) {
  if (!animation.show) return null;

  const animationConfig = {
    like: {
      icon: Heart,
      size: 120,
      color: "#FF4B91",
      fillColor: "#FF4B91",
      strokeWidth: 1.5
    },
    dislike: {
      icon: X,
      size: 120,
      color: "#FF4B4B",
      fillColor: "none",
      strokeWidth: 3
    }
  };

  const config = animationConfig[animation.type!];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-pulse scale-in-center">
        <IconComponent
          size={config.size}
          color={config.color}
          fill={config.fillColor}
          strokeWidth={config.strokeWidth}
        />
      </div>
    </div>
  );
}

interface SwipeDirectionIndicatorsProps {
  show: boolean;
  direction: 'left' | 'right' | null;
}

function SwipeDirectionIndicators({ show, direction }: SwipeDirectionIndicatorsProps) {
  if (!show) return null;

  const indicatorConfig = {
    left: {
      component: ChevronLeft,
      position: "left-4",
      active: direction === 'left'
    },
    right: {
      component: ChevronRight,
      position: "right-4",
      active: direction === 'right'
    }
  };

  return (
    <>
      {Object.entries(indicatorConfig).map(([side, config]) => {
        const IconComponent = config.component;
        return (
          <div
            key={side}
            className={`fixed ${config.position} top-1/2 transform -translate-y-1/2 z-40 pointer-events-none`}
          >
            <div className={`transition-opacity duration-500 ${config.active ? 'opacity-100' : 'opacity-30'}`}>
              <IconComponent size={48} className="text-gray-600 animate-pulse" />
            </div>
          </div>
        );
      })}
    </>
  );
}

interface CardStackProps {
  cards: Repository[];
  currentIndex: number;
  swipeHint: SwipeHintState;
  handleSwipe: (direction: string, repository: Repository, index: number) => void;
  getHintClassName: (index: number) => string;
  isTransitioning: boolean;
}

function CardStack({
  cards,
  currentIndex,
  swipeHint,
  handleSwipe,
  getHintClassName,
  isTransitioning
}: CardStackProps) {
  return (
    <div className="relative h-full flex items-center">
      {cards.map((repository, stackIndex) => {
        const actualIndex = currentIndex + stackIndex;
        const isTopCard = stackIndex === 0;
        const zIndex = cards.length - stackIndex;
        
        // Calculate card positioning and scaling
        const scale = 1 - (stackIndex * 0.05);
        const yOffset = stackIndex * 8;
        const opacity = 1 - (stackIndex * 0.3);

        return (
          <div
            key={repository.id}
            className="absolute inset-0 flex items-center transition-all duration-300 ease-out"
            style={{
              zIndex,
              transform: `translateY(${yOffset}px) scale(${scale})`,
              opacity: isTransitioning && isTopCard ? 0 : opacity,
            }}
          >
            <SwipeCard
              className={`swipe w-full ${!isTopCard ? 'pointer-events-none' : ''}`}
              preventSwipe={['up', 'down']}
              onSwipe={(dir: string) => handleSwipe(dir, repository, actualIndex)}
            >
              <div className={`w-full h-[calc(100vh-120px)] relative ${getHintClassName(actualIndex)}`}>
                <RepositoryCard repository={repository} />

                {/* Swipe Instruction Text - only on top card */}
                {isTopCard && swipeHint.show && (
                  <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
                    <div className="bg-white/70 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                      <p className="text-center text-gray-700 text-sm">
                        Swipe card left or right
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SwipeCard>
          </div>
        );
      })}
    </div>
  );
}
