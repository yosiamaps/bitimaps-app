import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-password', {
        body: { password },
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || 'Password yang Anda masukkan salah. Coba lagi.');
        setPassword('');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <img src="/logo.png" alt="BITIMAPS Logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-zinc-100">BITIMAPS</h1>
            <p className="text-zinc-400 mt-2">Masukkan password untuk melanjutkan</p>
        </div>
        <form 
          onSubmit={handleSubmit} 
          className={`bg-zinc-900 p-8 rounded-2xl shadow-2xl shadow-black/30 ${error ? 'animate-shake' : ''}`}
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Password"
                required
                disabled={loading}
                className={`w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-3 px-4 border transition-colors duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-zinc-700 focus:ring-lime-500'
                }`}
              />
            </div>
             {error && (
              <p className="text-red-500 text-sm text-center animate-expand-fade-in">{error}</p>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-lime-500 disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;