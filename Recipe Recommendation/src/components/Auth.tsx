import { useState } from 'react';
import { User, LogIn, Mail, Lock, UserPlus, Search, Key } from 'lucide-react';
import axios from 'axios';

interface AuthProps {
  onLogin: (username: string) => void;
  onCancel?: () => void;
}

type AuthMode = 'login' | 'signup' | 'find-username' | 'find-password';

export function Auth({ onLogin, onCancel }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        // [로그인] 아이디 + 비밀번호 전송
        const response = await axios.post('http://127.0.0.1:8000/api/login/', {
          username,
          password
        });
        
        if (response.status === 200) {
          onLogin(response.data.user.username);
        }
      } 
      else if (mode === 'signup') {
        // [회원가입]
        if (!username || !password || !confirmPassword) {
          setError('필수 정보를 모두 입력해주세요.');
          return;
        }
        if (password !== confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          return;
        }
        if (password.length < 4) {
            setError('비밀번호가 너무 짧습니다.');
            return;
        }

        // 이메일은 선택사항 (입력 안 했으면 빈 값으로 전송)
        await axios.post('http://127.0.0.1:8000/api/signup/', {
          username,
          password,
          email: email || '' 
        });

        alert("회원가입 성공! 로그인 해주세요.");
        setMode('login');
        resetForm();
      } 
      else if (mode === 'find-username' || mode === 'find-password') {
        setError('현재 서버에서 지원하지 않는 기능입니다. 관리자에게 문의하세요.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 401) {
            setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        } else if (err.response.data && typeof err.response.data === 'object') {
            const msg = Object.values(err.response.data).flat().join(' ');
            setError(msg || '오류가 발생했습니다.');
        } else {
            setError('서버 오류가 발생했습니다.');
        }
      } else {
        setError('서버와 연결할 수 없습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 아이콘 영역 */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              {mode === 'login' ? (
                <LogIn size={32} style={{ color: '#808000' }} />
              ) : mode === 'signup' ? (
                <UserPlus size={32} style={{ color: '#808000' }} />
              ) : mode === 'find-username' ? (
                <Search size={32} style={{ color: '#808000' }} />
              ) : (
                <Key size={32} style={{ color: '#808000' }} />
              )}
            </div>
          </div>

          <h2 className="text-center mb-2">
            {mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : mode === 'find-username' ? '아이디 찾기' : '비밀번호 찾기'}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {mode === 'login' ? 'ReciPick에 로그인하세요' : mode === 'signup' ? 'ReciPick에 가입하세요' : mode === 'find-username' ? '아이디를 찾으세요' : '비밀번호를 찾으세요'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. 이메일 입력 (로그인이 아닐 때만 보임) */}
            {mode !== 'login' && (
              <div>
                <label className="block text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  이메일 {mode === 'signup' && '(선택)'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808000]"
                  placeholder="your@email.com"
                  // 찾기 모드일 때는 필수
                  required={['find-username', 'find-password'].includes(mode)}
                />
              </div>
            )}

            {/* 2. 아이디 입력 (찾기 모드가 아닐 때 보임) */}
            {!['find-username', 'find-password'].includes(mode) && (
              <div>
                <label className="block text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  아이디
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808000]"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>
            )}

            {/* 3. 비밀번호 입력 (로그인, 회원가입일 때 보임) */}
            {['login', 'signup'].includes(mode) && (
              <div>
                <label className="block text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808000]"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            )}

            {/* 4. 비밀번호 확인 (회원가입일 때만 보임) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808000]"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 성공 메시지 (찾기 기능용) */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 space-y-2">
                <p>{successMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className="text-[#808000] hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  로그인하러 가기 →
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full text-white py-3 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#808000', fontWeight: 500 }}
            >
              {mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : mode === 'find-username' ? '아이디 찾기' : '이메일로 비밀번호 재설정 링크 받기'}
            </button>
          </form>

          {/* 하단 링크들 (로그인 화면일 때) */}
          {mode === 'login' && (
            <div className="mt-4 text-center space-x-3 text-sm">
              <button
                onClick={() => {
                  setMode('find-username');
                  resetForm();
                }}
                className="text-gray-500 hover:text-[#808000] transition-colors"
              >
                아이디 찾기
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  setMode('find-password');
                  resetForm();
                }}
                className="text-gray-500 hover:text-[#808000] transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                resetForm();
              }}
              className="text-gray-600 hover:text-[#808000] transition-colors text-sm font-medium"
            >
              {mode === 'login' ? '계정이 없으신가요? 회원가입' : mode === 'signup' ? '이미 계정이 있으신가요? 로그인' : '로그인하러 가기'}
            </button>
          </div>

          {onCancel && (
            <div className="mt-4 text-center">
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}