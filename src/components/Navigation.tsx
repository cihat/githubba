import { RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { Logo } from './Logo';
import Logo from '../../public/githubba.svg'

interface NavigationProps {
  onSettingsClick: () => void;
  onRefreshClick: () => void;
  isDataLoading: boolean;
}

export function Navigation(props: NavigationProps) {
  const { onSettingsClick, onRefreshClick, isDataLoading } = props;

  return (
    <nav className='px-4 sm:px-6 py-2 flex justify-between flex-row bg-gray-50 dark:bg-white/5 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 z-50'>
      <div className='flex-1 flex justify-between max-w-2xl mx-auto items-center gap-2'>
        <Link
          to='/'
          className='flex items-center gap-2 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors'
        >
          {/* <Logo className='size-8' /> */}
          <img src={Logo} alt="" className='size-8' />
          <span className='text-base font-medium'>githubba</span>
        </Link>
        <div className='flex items-center gap-2'>
          <button
            onClick={onSettingsClick}
            className='p-2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors'
          >
            <Settings className='w-5 h-5' />
          </button>
          <button
            onClick={onRefreshClick}
            className='p-2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors'
            disabled={isDataLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isDataLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}
