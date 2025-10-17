import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  House,
  FileText,
  Globe,
  GitBranch,
  Clock,
  SignOut,
  MagnifyingGlass,
  Bell,
  Envelope,
  User
} from '@phosphor-icons/react';

type NavItem = {
  name: string;
  icon: any;
  path: string;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: House, path: 'dashboard' },
  { name: 'Content', icon: FileText, path: 'content' },
  { name: 'Sites', icon: Globe, path: 'sites' },
  { name: 'Mappings', icon: GitBranch, path: 'mappings' },
  { name: 'Jobs', icon: Clock, path: 'jobs' },
];

type LayoutProps = {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center h-20 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">DataSync</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${isActive
                  ? 'text-emerald-700 bg-emerald-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-600' : ''}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-3 mb-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate tracking-tight">
                {profile?.email?.split('@')[0]}
              </div>
              <div className="text-xs text-gray-500 font-normal truncate">{profile?.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-red-200 hover:border-red-300"
          >
            <SignOut className="w-4 h-4" weight="bold" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" weight="bold" />
              <input
                type="text"
                placeholder="Search task"
                className="w-full pl-10 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded shadow-sm">
                ⌘ F
              </kbd>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 ml-6">
            <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
              <Envelope className="w-5 h-5" weight="bold" />
            </button>
            <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5" weight="bold" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105">
              <User className="w-5 h-5 text-white" weight="bold" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${isActive
                    ? 'text-emerald-700'
                    : 'text-gray-500'
                    }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
