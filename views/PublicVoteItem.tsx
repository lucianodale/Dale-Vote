
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { VotingItem, Vote } from '../types';
import { db } from '../services/db';

interface PublicVoteItemProps {
  items: VotingItem[];
  onVote: (vote: Vote) => void;
}

const PublicVoteItem: React.FC<PublicVoteItemProps> = ({ items, onVote }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);

  const [step, setStep] = useState<'info' | 'form' | 'verification' | 'success'>('info');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return <div className="text-center py-20 font-bold text-gray-400 uppercase tracking-widest">Votação não encontrada.</div>;

  const handleStartVote = () => setStep('form');

  const formatPhone = (phone: string) => {
    // Remove tudo que não for número
    const numbers = phone.replace(/\D/g, '');
    // Se não tiver código do país (assumindo Brasil e tamanho de celular com DDD), adiciona +55
    if (numbers.length >= 10 && numbers.length <= 11) {
      return `+55${numbers}`;
    }
    // Se já parecer ter código do país
    return `+${numbers}`;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    const formattedPhone = formatPhone(formData.phone);

    try {
      const { success, error: sendError } = await db.sendSmsOtp(formattedPhone);
      
      if (success) {
        setFormData(prev => ({ ...prev, phone: formattedPhone })); // Salva o número formatado
        setStep('verification');
      } else {
        setError(sendError || "Erro ao enviar SMS. Verifique o número.");
      }
    } catch (err) {
      setError("Falha na comunicação com o servidor.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const { success, error: verifyError } = await db.verifySmsOtp(formData.phone, verificationCode);
      
      if (success) {
        const newVote: Vote = {
          id: Math.random().toString(36).substr(2, 9),
          itemId: item.id,
          voterName: formData.fullName,
          voterEmail: formData.email,
          voterPhone: formData.phone,
          isVerified: true,
          createdAt: Date.now()
        };
        onVote(newVote);
        setStep('success');
      } else {
        setError(verifyError || "Código inválido. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao validar código.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fadeIn">
      {step === 'info' && (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white aspect-square md:aspect-auto h-[500px]">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover grayscale-[0.1]" />
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-red-600 font-extrabold text-xs uppercase tracking-[0.3em]">DaleVote! Auditoria</span>
              <h1 className="text-5xl font-black text-black leading-tight">{item.title}</h1>
              <div className="h-1.5 w-24 bg-red-600 rounded-full"></div>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">{item.description}</p>
            <div className="pt-4">
              <button 
                onClick={handleStartVote}
                className="w-full bg-black text-white py-6 rounded-3xl font-black hover:bg-gray-900 shadow-2xl shadow-gray-200 transition-all flex items-center justify-center gap-4 text-xl"
              >
                Votar Agora <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-gray-400 px-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs font-bold uppercase tracking-widest">Protocolo de Segurança Ativo</p>
            </div>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="max-w-lg mx-auto bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-black">Identificação</h2>
            <p className="text-gray-500 font-medium">Insira seus dados para validar sua escolha.</p>
          </div>
          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="relative">
              <input required type="text" placeholder="Nome Completo" className="w-full pl-12 pr-6 py-5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <input required type="email" placeholder="E-mail" className="w-full pl-12 pr-6 py-5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <input required type="tel" placeholder="WhatsApp (DDD + Número)" className="w-full pl-12 pr-6 py-5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={isSending} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2">
              {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enviar Código SMS"}
            </button>
          </form>
        </div>
      )}

      {step === 'verification' && (
        <div className="max-w-lg mx-auto bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 space-y-10 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <MessageSquare className="text-red-600 w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-black">Validar SMS</h2>
            <p className="text-gray-500 font-medium leading-relaxed">Enviamos um código para o número <br/><span className="text-black font-bold">{formData.phone}</span></p>
          </div>
          <div className="space-y-8">
            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6} 
              className="w-full text-center text-4xl font-black tracking-[0.6em] px-4 py-8 rounded-[2rem] border-2 border-gray-100 outline-none focus:ring-4 focus:ring-red-50 focus:border-red-600 transition-all bg-gray-50" 
              value={verificationCode} 
              onChange={e => setVerificationCode(e.target.value)} 
            />
            
            {error && (
              <div className="text-red-600 text-xs font-bold uppercase animate-fadeIn">
                {error}
              </div>
            )}

            <button onClick={handleVerify} disabled={verificationCode.length < 4 || isVerifying} className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-3">
              {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmar Voto"}
            </button>
            
            <div className="space-y-2">
               <button onClick={handleSubmitForm} disabled={isSending} className="text-xs font-bold text-gray-400 uppercase cursor-pointer hover:text-red-600 transition-colors bg-transparent border-none">
                 {isSending ? "Enviando..." : "Reenviar código"}
               </button>
               <br />
               <button onClick={() => setStep('form')} className="text-[10px] font-bold text-gray-300 uppercase hover:text-black transition-colors">
                 Corrigir número
               </button>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="max-w-xl mx-auto bg-white p-14 rounded-[4rem] shadow-2xl border border-gray-100 text-center space-y-10">
          <div className="w-32 h-32 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-200">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-black">Voto Registrado!</h2>
            <p className="text-gray-500 text-xl font-medium leading-relaxed">
              Obrigado, <span className="text-red-600 font-bold">{formData.fullName.split(' ')[0]}</span>. Sua participação no projeto <span className="text-black font-bold">"{item.title}"</span> foi processada com sucesso.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-black text-white py-5 rounded-2xl font-black hover:bg-gray-900 transition-all">Voltar ao Início</button>
        </div>
      )}
    </div>
  );
};

export default PublicVoteItem;
