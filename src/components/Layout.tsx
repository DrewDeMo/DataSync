import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, Globe, GitBranch, Clock, LogOut } from 'lucide-react';

type NavItem = {
  name: string;
  icon: any;
  path: string;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: Home, path: 'dashboard' },
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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DS</span>
                </div>
                <span className="ml-3 text-xl font-bold text-slate-900">DataSync</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                {profile?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
