
import React from 'react';
import { Trash2, ExternalLink, Plus, Eye, EyeOff, Copy, Pencil } from 'lucide-react';
import { VotingItem } from '../types';
import { Link } from 'react-router-dom';

interface AdminDashboardProps {
  items: VotingItem[];
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ items, onDelete, onTogglePublish, onDuplicate }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Painel DaleVote!</h1>
          <p className="text-gray-500 mt-1">Gerenciamento centralizado de votações.</p>
        </div>
        <Link to="/create" className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 shadow-lg shadow-red-100 flex items-center gap-2 transition-all">
          <Plus className="w-5 h-5" /> Nova Votação
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Item</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Visibilidade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell text-center">Criação</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover grayscale-[0.2]" />
                      <div>
                        <div className="font-bold text-black">{item.title}</div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onTogglePublish(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        item.isPublished 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {item.isPublished ? <><Eye className="w-3.5 h-3.5" /> Público</> : <><EyeOff className="w-3.5 h-3.5" /> Oculto</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell text-center tabular-nums">
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/edit/${item.id}`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"><Pencil className="w-5 h-5" /></Link>
                      <button onClick={() => onDuplicate(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Copy className="w-5 h-5" /></button>
                      <Link to={`/vote/${item.id}`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"><ExternalLink className="w-5 h-5" /></Link>
                      <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
