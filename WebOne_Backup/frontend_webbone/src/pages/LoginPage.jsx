import { useState } from 'react';
import api from '../utils/api';
import { replace, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      if (res.data.user && res.data.user.role) {
        localStorage.setItem('role', res.data.user.role);
      }
      console.log('Login ok, token:', res.data.token);
      navigate('/dashboard', {replace: true});
    } catch (err) {
     setError('Credenziali errate. Riprova.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            RailPulse
          </h1>
          <p className="text-slate-500 mt-2">Enter your credentials to access the dashboard</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <form onSubmit={handleLogin} className="p-6">
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
            >
              Sign In
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </form>
        </div>
        
        <div className="text-center mt-6 text-sm text-slate-500">
          © 2025 Adts S.R.L. All rights reserved.
        </div>
      </div>
    </div>
  );
}
