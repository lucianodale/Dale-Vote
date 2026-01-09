
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Globe, Lock, Loader2 } from 'lucide-react';
import { VotingItem } from '../types';

interface EditItemProps {
  items: VotingItem[];
  onUpdate: (id: string, updates: Partial<VotingItem>) => Promise<void>;
}

const EditItem: React.FC<EditItemProps> = ({ items, onUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const existingItem = items.find(i => i.id === id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isPublished: false
  });

  useEffect(() => {
    if (existingItem) {
      setFormData({
        title: existingItem.title,
        description: existingItem.description,
        imageUrl: existingItem.imageUrl,
        isPublished: existingItem.isPublished
      });
    }
  }, [existingItem]);

  if (!existingItem) {
    return <div className="text-center py-20 font-bold text-gray-400">Item não encontrado.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate(existingItem.id, {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isPublished: formData.isPublished
      });
      navigate('/admin');
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black">Editar Votação</h1>
          <p className="text-gray-500 mt-1">Atualize as informações do item selecionado.</p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID do Registro</span>
          <p className="text-xs font-mono text-gray-500">{existingItem.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Título</label>
            <input
              required
              type="text"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all font-medium"
              placeholder="Ex: Novo Logotipo"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">URL da Foto</label>
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
              rows={6}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all resize-none font-medium"
              placeholder="Explique os detalhes..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
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
                  Visibilidade Pública
                </span>
                <span className="text-[11px] text-gray-500">Determine se este item aparece na página inicial.</span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
          </button>
        </form>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Visualização</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="h-40 overflow-hidden relative bg-gray-100">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md ${formData.isPublished ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {formData.isPublished ? 'PÚBLICO' : 'OCULTO'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-black truncate">{formData.title || 'Título da Votação'}</h4>
              <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                {formData.description || 'Sua descrição aparecerá aqui.'}
              </p>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <p className="text-[11px] text-red-700 leading-relaxed font-bold">
              Auditoria ativa: Qualquer alteração aqui é registrada no histórico de auditoria do DaleVote!.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
