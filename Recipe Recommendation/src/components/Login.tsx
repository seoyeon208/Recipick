// src/components/Login.tsx
import React, { useState } from 'react';
import { recipeApi } from '../api'; // 위에서 만든 api 불러오기

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false); // 로그인 vs 회원가입 모드
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignup) {
        // [회원가입 요청]
        await recipeApi.signup({ username, password, email });
        alert("회원가입 성공! 이제 로그인해주세요.");
        setIsSignup(false); // 로그인 폼으로 전환
      } else {
        // [로그인 요청]
        const response = await recipeApi.login({ username, password });
        // 성공 시 App.tsx로 유저 이름 전달
        onLogin(response.data.user.username);
      }
    } catch (err: any) {
      console.error(err);
      // 서버 에러 메시지 표시
      if (err.response && err.response.data) {
         setError(typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data));
      } else {
        setError("서버 연결에 실패했습니다.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">
          {isSignup ? '회원가입' : '로그인'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label className="block text-gray-700 mb-2 font-medium">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="email@example.com"
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition duration-200"
          >
            {isSignup ? '가입하기' : '로그인하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-gray-500 hover:text-orange-500 underline text-sm"
          >
            {isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;