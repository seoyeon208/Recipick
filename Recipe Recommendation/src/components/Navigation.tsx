import { ChefHat, Home, PlusCircle, User, LogIn, Users } from 'lucide-react';
import { Logo } from './Logo';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: string | null;
  onLogout?: () => void;
}

export function Navigation({ currentPage, onNavigate, currentUser, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'community', label: '커뮤니티', icon: Users },
  ];

  // 레시피 등록은 로그인 시에만 표시
  if (currentUser) {
    navItems.push({ id: 'post-recipe', label: '레시피 등록', icon: PlusCircle });
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="hover:opacity-80 transition-opacity"
          >
            <Logo />
          </button>

          <nav className="flex items-center gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: '#808000' } : {}}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}

            {/* 로그인 상태에 따라 다른 버튼 표시 */}
            {currentUser ? (
              <div className="relative group">
                <button
                  onClick={() => onNavigate('my-page')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'my-page'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={currentPage === 'my-page' ? { backgroundColor: '#808000' } : {}}
                >
                  <User size={20} />
                  {currentUser}
                </button>
                
                {/* 로그아웃 드롭다운 */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'login'
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={currentPage === 'login' ? { backgroundColor: '#808000' } : {}}
              >
                <LogIn size={20} />
                로그인
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}