
import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../services/db';

interface LoginProps {
  isAuthenticated: boolean;
}

const Login: React.FC<LoginProps> = ({ isAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const { error } = await db.signIn(email, password);
      if (error) {
        setErrorMessage(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage('Erro na conexão. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24 animate-fadeIn">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-100 space-y-10">
        <div className="text-center space-y-3">
          <div className="bg-red-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Lock className="text-red-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-black">Acesso Admin</h1>
          <p className="text-gray-500 font-medium">DaleVote! Security Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <div className="relative">
              <input required type="email" placeholder="admin@dalevote.com" className="w-full pl-12 pr-5 py-5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all font-bold" value={email} onChange={e => setEmail(e.target.value)} />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Chave de Acesso</label>
            <div className="relative">
              <input required type="password" placeholder="••••••••" className="w-full pl-12 pr-5 py-5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all font-bold" value={password} onChange={e => setPassword(e.target.value)} />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-fadeIn text-xs font-bold uppercase">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}

          <button type="submit" disabled={isLoggingIn} className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Autenticar <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
