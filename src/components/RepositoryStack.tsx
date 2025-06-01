import { RefObject, useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import { RepositoryCard } from './RepositoryCard';
import SwipeCard from './SwipeCard';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { openLink } from '../lib/utils';
import type { Repository } from '../types';

interface RepositoryListProps {
  repositories: Repository[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onLoadMore?: () => void;
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

const ANIMATION_DURATION = 800;

export function RepositoryStack({ repositories, scrollContainerRef, onLoadMore }: RepositoryListProps) {
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
  const [hasRequestedMore, setHasRequestedMore] = useState(false);

  // Single timer ref for animation cleanup
  const animationTimerRef = useRef<number | null>(null);
  const prevLengthRef = useRef(repositories.length);

  // Swipe hint animation effect
  useEffect(() => {
    if (!swipeHint.show) return;

    const currentStep = ANIMATION_SEQUENCE[swipeHint.sequenceIndex];

    setSwipeHint(prev => ({
      ...prev,
      direction: currentStep.direction as 'left' | 'right' | null
    }));
  }, [swipeHint.show, swipeHint.sequenceIndex]);

  // Load more repositories when needed
  useEffect(() => {
    const remainingCards = repositories.length - currentIndex;
    const shouldLoadMore = remainingCards <= 5 && !hasRequestedMore && onLoadMore;

    if (shouldLoadMore) {
      setHasRequestedMore(true);
      onLoadMore();
    }
  }, [currentIndex, repositories.length, hasRequestedMore, onLoadMore]);

  // Reset load more flag when new repositories are loaded
  useEffect(() => {
    if (repositories.length > prevLengthRef.current + 5) {
      setHasRequestedMore(false);
    }
    prevLengthRef.current = repositories.length;
  }, [repositories.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        window.clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const triggerAnimation = useCallback((type: 'like' | 'dislike', onComplete?: () => void) => {
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

  // Simplified card advancement without unnecessary setTimeout
  const advanceToNextCard = useCallback(() => {
    if (currentIndex >= repositories.length - 1) return;
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, repositories.length]);

  const handleSwipe = useCallback((direction: string, repository: Repository, index: number) => {
    if (index !== currentIndex) return;

    setSwipeHint({ show: false, direction: null, sequenceIndex: 0 });

    if (direction === 'left') {
      handleLeftSwipe(repository);
    } else if (direction === 'right') {
      handleRightSwipe(repository);
    }
  }, [currentIndex]);

  const handleLeftSwipe = useCallback((repository: Repository) => {
    console.log('Swiped left on repository:', repository.id);

    triggerAnimation('dislike', () => {
      advanceToNextCard();
    });
  }, [triggerAnimation, advanceToNextCard]);

  const handleRightSwipe = useCallback((repository: Repository) => {
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

  const visibleCards = useMemo(() => {
    const visibleCount = 3;
    return repositories.slice(currentIndex, currentIndex + visibleCount);
  }, [repositories, currentIndex]);

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
            cards={visibleCards}
            currentIndex={currentIndex}
            swipeHint={swipeHint}
            handleSwipe={handleSwipe}
            getHintClassName={getHintClassName}
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
      size: 140,
      color: "#FF4B91",
      fillColor: "#FF4B91",
      strokeWidth: 1.5,
      bgColor: "rgba(255, 75, 145, 0.15)",
      shadowColor: "rgba(255, 75, 145, 0.4)"
    },
    dislike: {
      icon: X,
      size: 140,
      color: "#FF4B4B",
      fillColor: "none",
      strokeWidth: 3,
      bgColor: "rgba(255, 75, 75, 0.15)",
      shadowColor: "rgba(255, 75, 75, 0.4)"
    }
  };

  const config = animationConfig[animation.type!];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Background overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${config.bgColor} 0%, transparent 70%)`
        }}
      />

      {/* Main animation container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing background circle */}
        <div
          className="absolute w-32 h-32 rounded-full animate-ping opacity-30"
          style={{
            backgroundColor: config.color,
            animationDuration: '0.8s'
          }}
        />

        {/* Glowing ring effect */}
        <div
          className="absolute w-40 h-40 rounded-full animate-pulse"
          style={{
            border: `3px solid ${config.color}`,
            boxShadow: `0 0 30px ${config.shadowColor}, inset 0 0 30px ${config.shadowColor}`,
            animationDuration: '1s'
          }}
        />

        {/* Main icon with enhanced animations */}
        <div className="relative z-10 transform animate-bounce">
          <div className="relative">
            {/* Icon shadow/glow */}
            <div
              className="absolute inset-0 blur-sm opacity-50"
              style={{
                filter: `drop-shadow(0 0 20px ${config.shadowColor})`
              }}
            >
              <IconComponent
                size={config.size}
                color={config.color}
                fill={config.fillColor}
                strokeWidth={config.strokeWidth}
              />
            </div>

            {/* Main icon */}
            <div className="relative animate-pulse">
              <IconComponent
                size={config.size}
                color={config.color}
                fill={config.fillColor}
                strokeWidth={config.strokeWidth}
                style={{
                  filter: `drop-shadow(0 4px 15px ${config.shadowColor})`,
                  transform: 'scale(1)',
                  animation: 'heartbeat 0.8s ease-in-out'
                }}
              />
            </div>
          </div>
        </div>
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
      active: direction === 'left',
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
}

const CardStack = memo(function CardStack({
  cards,
  currentIndex,
  swipeHint,
  handleSwipe,
  getHintClassName
}: CardStackProps) {
  console.log('aliveli');

  return (
    <div className="relative h-full flex items-center">
      {cards.map((repository, stackIndex) => {
        const actualIndex = currentIndex + stackIndex;
        const isTopCard = stackIndex === 0;
        const zIndex = cards.length - stackIndex;

        const scale = Math.max(0.85, 1 - (stackIndex * 0.08));
        const yOffset = stackIndex * 12;
        const xOffset = stackIndex * 4;
        const opacity = isTopCard ? 1 : Math.max(0.6, 1 - (stackIndex * 0.2));
        const brightness = isTopCard ? 1 : Math.max(0.75, 1 - (stackIndex * 0.12));

        return (
          <div
            key={repository.id}
            className="absolute inset-0 flex items-center transition-all duration-700 ease-out"
            style={{
              zIndex,
              transform: `translateY(${yOffset}px) translateX(${xOffset}px) scale(${scale})`,
              opacity,
              filter: `blur(-1px) brightness(${brightness})`,
              transformOrigin: 'center center',
            }}
          >
            <SwipeCard
              className={`swipe w-full ${!isTopCard ? 'pointer-events-none' : ''}`}
              preventSwipe={['up', 'down']}
              onSwipe={(dir: string) => handleSwipe(dir, repository, actualIndex)}
            >
              <div className={`w-full h-[calc(100vh-120px)] relative ${getHintClassName(actualIndex)}`}>
                {stackIndex > 0 && (
                  <div
                    className="absolute inset-0 bg-black rounded-xl pointer-events-none z-10"
                    style={{
                      opacity: Math.min(stackIndex * 0.08, 0.3),
                      backdropFilter: `blur(${Math.min(stackIndex * 0.5, 2)}px)`
                    }}
                  />
                )}

                {isTopCard && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/15 dark:to-black/30 rounded-xl pointer-events-none z-5" />
                )}

                <RepositoryCard repository={repository} />

                {isTopCard && swipeHint.show && (
                  <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-20">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-white/30">
                      <p className="text-center text-gray-800 text-sm font-semibold drop-shadow-sm">
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

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/3 rounded-xl" />
      </div>
    </div>
  );
});
