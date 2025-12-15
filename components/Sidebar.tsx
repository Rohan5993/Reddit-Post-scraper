import React from 'react';
import { LayoutGrid, Bookmark, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: 'feed' | 'saved';
  onTabChange: (tab: 'feed' | 'saved') => void;
  savedCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, savedCount }) => {
  
  const NavItem = ({ 
    id, 
    icon: Icon, 
    label, 
    count 
  }: { 
    id: 'feed' | 'saved', 
    icon: any, 
    label: string, 
    count?: number 
  }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => onTabChange(id)}
        className={`w-full flex items-center justify-between px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-primary-900 text-white shadow-md' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
          <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{label}</span>
        </div>
        {count !== undefined && count > 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isActive 
              ? 'bg-primary-800 text-primary-100' 
              : 'bg-slate-200 text-slate-600'
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo Area */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-900 flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">CurateFlow</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
          Menu
        </div>
        <NavItem id="feed" icon={LayoutGrid} label="Content Feed" />
        <NavItem id="saved" icon={Bookmark} label="Saved Library" count={savedCount} />
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <div className="mt-4 flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                 <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">Alex Designer</p>
                <p className="text-xs text-slate-400 truncate">Pro Plan</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
