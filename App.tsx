
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Vote as VoteIcon,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Lock
} from 'lucide-react';
import { VotingItem, Vote } from './types';
import { db } from './services/db';
import AdminDashboard from './views/AdminDashboard';
import CreateItem from './views/CreateItem';
import EditItem from './views/EditItem';
import PublicVoteItem from './views/PublicVoteItem';
import AdminReports from './views/AdminReports';
import Login from './views/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [items, setItems] = useState<VotingItem[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [fetchedItems, fetchedVotes] = await Promise.all([
        db.getItems(),
        db.getVotes()
      ]);
      setItems(fetchedItems);
      setVotes(fetchedVotes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  useEffect(() => {
    db.getSession().then(initialSession => {
      setSession(initialSession);
      setIsLoading(false);
    });

    const { data: { subscription } } = db.onAuthChange((newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, session]);

  const handleLogout = async () => {
    await db.signOut();
  };

  const addItem = async (newItem: VotingItem) => {
    await db.saveItem(newItem);
    await loadData();
  };

  const updateItem = async (id: string, updates: Partial<VotingItem>) => {
    await db.updateItem(id, updates);
    await loadData();
  };

  const deleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta votação?')) {
      await db.deleteItem(id);
      await db.deleteVotesByItem(id);
      await loadData();
    }
  };

  const duplicateItem = async (id: string) => {
    const itemToCopy = items.find(i => i.id === id);
    if (itemToCopy) {
      const newItem: VotingItem = {
        ...itemToCopy,
        id: Math.random().toString(36).substr(2, 9),
        title: `${itemToCopy.title} (Cópia)`,
        isPublished: false,
        createdAt: Date.now()
      };
      await db.saveItem(newItem);
      await loadData();
    }
  };

  const togglePublish = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await db.updateItem(id, { isPublished: !item.isPublished });
      await loadData();
    }
  };

  const registerVote = async (newVote: Vote) => {
    await db.saveVote(newVote);
    await loadData();
  };

  const deleteVote = async (voteId: string) => {
    if (window.confirm('Deseja excluir este registro de voto?')) {
      await db.deleteVote(voteId);
      await loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Validando DaleVote!...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!session;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-red-600 p-2 rounded-xl">
                  <VoteIcon className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-black">
                  DaleVote!
                </span>
              </Link>
              
              <div className="hidden md:flex space-x-8 items-center">
                {isAuthenticated ? (
                  <>
                    <Link to="/admin" className="text-gray-600 hover:text-red-600 font-medium transition-colors">Admin</Link>
                    <Link to="/reports" className="text-gray-600 hover:text-red-600 font-medium transition-colors">Relatórios</Link>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium">
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="text-gray-600 hover:text-red-600 font-medium transition-colors flex items-center gap-1 text-sm uppercase tracking-wide">
                    <Lock className="w-4 h-4" /> Painel
                  </Link>
                )}
              </div>
              
              <div className="flex items-center">
                {isAuthenticated && (
                  <Link to="/create" className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-all flex items-center space-x-2 shadow-lg shadow-red-100">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Criar Votação</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home items={items.filter(i => i.isPublished)} />} />
            <Route path="/login" element={<Login isAuthenticated={isAuthenticated} />} />
            <Route path="/admin" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminDashboard items={items} onDelete={deleteItem} onTogglePublish={togglePublish} onDuplicate={duplicateItem} /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CreateItem onSave={addItem} /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><EditItem items={items} onUpdate={updateItem} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminReports items={items} votes={votes} onDeleteVote={deleteVote} /></ProtectedRoute>} />
            <Route path="/vote/:id" element={<PublicVoteItem items={items} onVote={registerVote} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-10">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className="text-gray-900 font-bold text-sm">DaleVote! &copy; 2026</p>
            <p className="text-gray-500 text-xs">Transparência e Agilidade em Votação Online. Customizado por <span className="text-red-600 font-medium">Dale! Marketing</span></p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

// Fix: Removed duplicate Home component declaration (previously duplicated at line 201 and 250)
const Home: React.FC<{ items: VotingItem[] }> = ({ items }) => {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-4 max-w-2xl mx-auto py-12">
        <h1 className="text-5xl font-extrabold text-black tracking-tight">
          Sua plataforma de <span className="text-red-600">decisões modernas.</span>
        </h1>
        <p className="text-lg text-gray-600">
          DaleVote! oferece segurança, agilidade e resultados em tempo real para suas consultas coletivas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.length > 0 ? (
          items.map(item => (
            <Link key={item.id} to={`/vote/${item.id}`} className="group block">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-red-600 px-2 py-1 rounded-lg">Votação Ativa</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black group-hover:text-red-600 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2 text-sm leading-relaxed">{item.description}</p>
                  <div className="mt-6 flex items-center justify-between text-red-600 font-bold text-sm">
                    <span>Participar Agora</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="text-gray-400 w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-black">Nenhuma votação ativa disponível</h3>
            <p className="text-gray-500 mt-2 text-sm">Aguarde novas publicações.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
