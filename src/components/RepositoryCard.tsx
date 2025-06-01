
import {
  CircleDot,
  GitFork,
  GitPullRequest,
  Share2,
  Star,
  Calendar,
  Clock,
} from 'lucide-react';
import { shortNumber } from '../lib/number';
import type { Repository } from "../types";

interface RepositoryCardProps {
  repository: Repository;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const getLanguageColor = () => {
    const colors: { [key: string]: string } = {
      JavaScript: 'bg-yellow-300/80',
      TypeScript: 'bg-blue-400/80',
      Python: 'bg-green-400/80',
      Java: 'bg-orange-400/80',
      'C++': 'bg-pink-400/80',
      Ruby: 'bg-red-400/80',
      Go: 'bg-cyan-400/80',
      Rust: 'bg-orange-500/80',
      PHP: 'bg-indigo-400/80',
      Solidity: 'bg-purple-400/80',
      'C#': 'bg-red-400/80',
      default: 'bg-gray-400/80',
    };
    return colors[repository.language] || colors.default;
  };

  return (
    <div className='grid grid-rows-[minmax(0,1fr)_auto_auto] h-full gap-3 sm:gap-6 select-none'>
      {/* Main card - repository info */}
      <div className='dark:bg-white/[0.03] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-xl border border-gray-200 dark:border-white/[0.06] shadow-md sm:shadow-xl flex flex-col min-h-0 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors noselect'>
        {/* Repository header with owner avatar */}
        <a
          href={repository.html_url}
          target='_blank'
          className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'
        >
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className='w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-gray-300 dark:ring-white/[0.06]'
          />
          <span className='inline-grid overflow-hidden'>
            <span className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-full'>
              {repository.name}
            </span>
            <span className='text-gray-500 dark:text-white/40 text-xs sm:text-sm'>
              by {repository.owner.login}
            </span>
          </span>
        </a>

        {/* Tags section - language and license */}
        <div className='flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4'>
          {repository.language && (
            <div className='flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-white/[0.03] px-2 sm:px-3 py-1 rounded-full border border-gray-300 dark:border-white/[0.06] hover:bg-gray-300 dark:hover:bg-white/[0.06] transition-colors'>
              <span
                className={`w-2 h-2 rounded-full ${getLanguageColor()}`}
              ></span>
              <span className='text-gray-700 dark:text-white/70 text-xs sm:text-sm'>
                {repository.language}
              </span>
            </div>
          )}

          <div className='flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-white/[0.03] px-2 sm:px-3 py-1 rounded-full border border-gray-300 dark:border-white/[0.06] hover:bg-gray-300 dark:hover:bg-white/[0.06] transition-colors'>
            <CircleDot className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-white/40' />
            <span className='text-gray-700 dark:text-white/70 text-xs sm:text-sm'>
              {repository.license?.name || 'No License'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className='text-gray-700 dark:text-white/70 text-sm sm:text-base leading-relaxed line-clamp-3 min-h-0 [overflow-wrap:anywhere]'>
          {repository.description || "No description provided"}
        </p>

        {/* Dates section */}
        <div className='mt-auto pt-3 flex flex-wrap gap-2 sm:gap-3'>
          <div className='flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-white/[0.03] px-2 sm:px-3 py-1 rounded-full border border-gray-300 dark:border-white/[0.06] hover:bg-gray-300 dark:hover:bg-white/[0.06] transition-colors'>
            <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-white/40' />
            <time
              dateTime={repository.created_at}
              className='text-gray-700 dark:text-white/70 text-xs sm:text-sm'
            >
              {new Date(repository.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
          <div className='flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-white/[0.03] px-2 sm:px-3 py-1 rounded-full border border-gray-300 dark:border-white/[0.06] hover:bg-gray-300 dark:hover:bg-white/[0.06] transition-colors'>
            <Clock className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-white/40' />
            <time
              dateTime={repository.updated_at}
              className='text-gray-700 dark:text-white/70 text-xs sm:text-sm'
            >
              {new Date(repository.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div className='bg-gradient-to-r bg-white/5 dark:from-white/[0.03] dark:to-white/[0.02] rounded-xl sm:rounded-2xl p-2 sm:p-3 backdrop-blur-xl border border-gray-200 dark:border-white/[0.06] shadow-md sm:shadow-xl'>
        <div className='grid grid-cols-3 divide-x divide-gray-300 dark:divide-white/[0.06]'>
          <div className='flex flex-col items-center justify-center p-1 sm:p-2'>
            <Star className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-white/50 mb-1' />
            <div className='text-base sm:text-xl font-medium text-gray-900 dark:text-white'>
              {shortNumber(repository.stargazers_count)}
            </div>
            <div className='text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-white/40 font-medium uppercase tracking-wider'>
              Stars
            </div>
          </div>

          <div className='flex flex-col items-center justify-center p-1 sm:p-2'>
            <GitFork className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-white/50 mb-1' />
            <div className='text-base sm:text-xl font-medium text-gray-900 dark:text-white'>
              {shortNumber(repository.forks_count)}
            </div>
            <div className='text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-white/40 font-medium uppercase tracking-wider'>
              Forks
            </div>
          </div>

          <div className='flex flex-col items-center justify-center p-1 sm:p-2'>
            <GitPullRequest className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-white/50 mb-1' />
            <div className='text-base sm:text-xl font-medium text-gray-900 dark:text-white'>
              {shortNumber(repository.watchers_count)}
            </div>
            <div className='text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-white/40 font-medium uppercase tracking-wider'>
              Watchers
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex gap-2 sm:gap-3'>
        <a
          href={repository.html_url}
          target='_blank'
          onClick={(e) => {
            e.preventDefault();
            window.open(repository.html_url, '_blank');
          }}
          className='flex-1 bg-white/5 dark:bg-white/[0.05] text-gray-900 dark:text-white py-3 sm:p-4 rounded-lg sm:rounded-xl 
            font-medium text-sm sm:text-base hover:bg-gray-300 dark:hover:bg-white/[0.08] transition-all 
            flex items-center justify-center gap-1 sm:gap-2 border border-gray-300 dark:border-white/[0.1] 
            hover:border-gray-400 dark:hover:border-white/[0.2] shadow-md sm:shadow-lg backdrop-blur-sm'
        >
          <Star className='w-4 h-4 sm:w-5 sm:h-5' />
          <span>Star Repository</span>
        </a>
        {navigator.share && (
          <button
            onClick={() => {
              navigator
                .share({
                  title: repository.name,
                  text: repository.description,
                  url: repository.html_url,
                })
                .catch((error) => console.log('Error sharing:', error));
            }}
            className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-gray-200 dark:bg-white/[0.03] border border-gray-300 dark:border-white/[0.06] rounded-lg sm:rounded-xl hover:bg-gray-300 dark:hover:bg-white/[0.06] transition-colors group'
          >
            <Share2 className='w-4 h-4 sm:w-5 sm:h-5 text-gray-700 group-hover:text-gray-900 dark:text-white/70 dark:group-hover:text-white transition-colors' />
          </button>
        )}
      </div>
    </div>
  );
}
