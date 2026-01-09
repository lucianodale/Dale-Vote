
import React, { useMemo } from 'react';
import { VotingItem, Vote } from '../types';
import { BarChart3, Users, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';

interface AdminReportsProps {
  items: VotingItem[];
  votes: Vote[];
  onDeleteVote: (id: string) => void;
}

const AdminReports: React.FC<AdminReportsProps> = ({ items, votes, onDeleteVote }) => {
  const stats = useMemo(() => {
    const verified = votes.filter(v => v.isVerified).length;
    return {
      totalVotes: votes.length,
      verifiedVotes: verified,
      nonVerifiedVotes: votes.length - verified,
      itemsCount: items.length
    };
  }, [votes, items]);

  const exportToCSV = () => {
    if (votes.length === 0) return;
    const headers = ["ID", "Participante", "E-mail", "Telefone", "Item", "Status", "Data"];
    const rows = votes.map(vote => {
      const item = items.find(i => i.id === vote.itemId);
      return [vote.id, `"${vote.voterName}"`, vote.voterEmail, `"${vote.voterPhone}"`, `"${item?.title || 'Removido'}"`, vote.isVerified ? "Verificado" : "Pendente", new Date(vote.createdAt).toLocaleString('pt-BR')];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dalevote_relatorio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">Auditoria DaleVote!</h1>
          <p className="text-gray-500 mt-1">Dados reais, votos auditados.</p>
        </div>
        <button onClick={exportToCSV} disabled={votes.length === 0} className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 disabled:opacity-30 transition-all flex items-center gap-2">
          <Download className="w-5 h-5" /> Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<BarChart3 />} label="Total Acumulado" value={stats.totalVotes} color="black" />
        <StatCard icon={<CheckCircle />} label="Validados SMS" value={stats.verifiedVotes} color="red" />
        <StatCard icon={<AlertCircle />} label="Auditando" value={stats.nonVerifiedVotes} color="gray" />
        <StatCard icon={<Users />} label="Projetos Ativos" value={stats.itemsCount} color="black" />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Participante</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Item Escollhido</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Protocolo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {votes.map(vote => {
                const item = items.find(i => i.id === vote.itemId);
                return (
                  <tr key={vote.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{vote.voterName}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase">{vote.voterPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{item?.title || 'Removido'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${vote.isVerified ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        {vote.isVerified ? 'SMS VALID' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onDeleteVote(vote.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactElement; label: string; value: number; color: 'red' | 'black' | 'gray' }> = ({ icon, label, value, color }) => {
  const styles = {
    red: 'bg-red-600 text-white',
    black: 'bg-black text-white',
    gray: 'bg-gray-100 text-gray-800'
  };
  return (
    <div className={`p-6 rounded-3xl shadow-sm space-y-3 ${styles[color]}`}>
      <div className="flex justify-between items-center opacity-80">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
      </div>
      <div className="text-4xl font-black tabular-nums">{value}</div>
    </div>
  );
};

export default AdminReports;
