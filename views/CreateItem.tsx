
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Globe, Lock } from 'lucide-react';
import { VotingItem } from '../types';

interface CreateItemProps {
  onSave: (item: VotingItem) => void;
}

const CreateItem: React.FC<CreateItemProps> = ({ onSave }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isPublished: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: VotingItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      isPublished: formData.isPublished,
      createdAt: Date.now()
    };
    onSave(newItem);
    navigate('/admin');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>

      <div>
        <h1 className="text-3xl font-bold text-black">Nova Votação</h1>
        <p className="text-gray-500 mt-1">Configure o item e defina a visibilidade inicial.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Título</label>
          <input
            required
            type="text"
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all font-medium"
            placeholder="Ex: Novo Projeto de Identidade"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Imagem (URL)</label>
          <div className="relative">
            <input
              required
              type="url"
              className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all font-medium"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Descrição</label>
          <textarea
            required
            rows={4}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all resize-none font-medium"
            placeholder="Detalhes para os votantes..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isPublished}
                onChange={e => setFormData({...formData, isPublished: e.target.checked})}
              />
              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-black flex items-center gap-1.5">
                {formData.isPublished ? <Globe className="w-3.5 h-3.5 text-red-600" /> : <Lock className="w-3.5 h-3.5 text-gray-400" />}
                Publicar Imediatamente
              </span>
              <span className="text-[11px] text-gray-500">Visível para todos na galeria principal.</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" /> Criar Registro
        </button>
      </form>
    </div>
  );
};

export default CreateItem;
