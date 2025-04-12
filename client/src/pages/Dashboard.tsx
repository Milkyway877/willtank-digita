import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              WillTank Dashboard
            </h1>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </header>
        
        <main>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username}!</h2>
            <p className="text-gray-300">
              This is your dashboard where you can manage your will documents and other important information.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-bold mb-2">Your Will Documents</h3>
              <p className="text-gray-300 mb-4">
                Access and manage your will documents.
              </p>
              <div className="flex justify-center items-center bg-gray-800/50 rounded-lg p-8 mb-4">
                <p className="text-gray-400 text-center">No documents yet</p>
              </div>
              <button className="w-full py-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-all">
                Create New Will
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
              <p className="text-gray-300 mb-4">
                Common tasks you might want to perform.
              </p>
              <ul className="space-y-2">
                <li>
                  <button className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-left">
                    Update personal information
                  </button>
                </li>
                <li>
                  <button className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-left">
                    Manage beneficiaries
                  </button>
                </li>
                <li>
                  <button className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-left">
                    Assign assets
                  </button>
                </li>
                <li>
                  <button className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-left">
                    Set up notifications
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-bold mb-2">Help & Resources</h3>
              <p className="text-gray-300 mb-4">
                Useful information to help you with your will.
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="block py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all">
                    Will creation guide
                  </a>
                </li>
                <li>
                  <a href="#" className="block py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all">
                    Legal terminology explained
                  </a>
                </li>
                <li>
                  <a href="#" className="block py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all">
                    Frequently asked questions
                  </a>
                </li>
                <li>
                  <a href="#" className="block py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all">
                    Contact support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </main>
        
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} WillTank. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;