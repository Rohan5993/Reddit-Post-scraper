import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContentCard from './components/ContentCard';
import GenerationModal from './components/GenerationModal';
import { fetchContent, generateHook } from './services/api';
import { ContentItem, SavedItem, Platform, GeneratedContent } from './types';
import { Search, Loader2, Sparkles, Filter } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');
  
  // Data State
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  
  // Loading States
  const [isScraping, setIsScraping] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>(''); // Granular status text
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedContent | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reddit' | 'newsletter'>('all');

  // --- Actions ---

  const handleScrape = async () => {
    setIsScraping(true);
    setScrapeError(null);
    setLoadingStatus('Starting Workflow...');
    
    try {
      // Pass the callback to update status text in real-time
      const items = await fetchContent((status) => setLoadingStatus(status));
      // Shuffle slightly for visual variety
      setFeedItems(items.sort(() => Math.random() - 0.5));
    } catch (err) {
      setScrapeError('Failed to execute n8n workflow. Please try again.');
    } finally {
      setIsScraping(false);
      setLoadingStatus('');
    }
  };

  const toggleSave = (item: ContentItem | SavedItem) => {
    const isAlreadySaved = savedItems.some(s => s.id === item.id);
    if (isAlreadySaved) {
      setSavedItems(prev => prev.filter(s => s.id !== item.id));
    } else {
      const newItem: SavedItem = { ...item, saved_at: new Date().toISOString() };
      setSavedItems(prev => [newItem, ...prev]);
    }
  };

  const handleGenerate = async (item: SavedItem, platform: Platform) => {
    setModalOpen(true);
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const result = await generateHook(item, platform);
      setGeneratedResult(result);
    } catch (error) {
      console.error(error);
      setModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Filtering Logic for Saved Tab ---
  const filteredSavedItems = savedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- Render Helpers ---

  const renderFeed = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Content Feed</h1>
          <p className="text-slate-500">Discover trending insights from Reddit & Ben's Bites.</p>
        </div>
        <button
          onClick={handleScrape}
          disabled={isScraping}
          className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[220px]"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isScraping ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            <span className="animate-in fade-in">{isScraping ? loadingStatus : 'Scrape Now'}</span>
          </div>
          {/* Shine effect */}
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
      </div>

      {/* Error Message */}
      {scrapeError && (
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 flex items-center gap-2">
           <span className="font-bold">Error:</span> {scrapeError}
        </div>
      )}

      {/* Grid */}
      {feedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {feedItems.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              isSaved={savedItems.some(s => s.id === item.id)}
              onToggleSave={toggleSave}
              variant="feed"
            />
          ))}
        </div>
      ) : (
        !isScraping && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Curate?</h3>
            <p className="text-slate-400 max-w-md">
              Hit the scrape button to trigger the n8n workflow and fetch fresh content from your sources.
            </p>
          </div>
        )
      )}
      
      {/* Loading Skeletons */}
      {isScraping && feedItems.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
                <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-100 rounded mb-3"></div>
              <div className="h-6 w-1/2 bg-slate-100 rounded mb-6"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded"></div>
                <div className="h-3 w-full bg-slate-100 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSaved = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Saved Library</h1>
            <p className="text-slate-500">Manage your collection and generate content.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-64 transition-all"
                />
             </div>
             <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                {(['all', 'reddit', 'newsletter'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      filterType === type 
                        ? 'bg-white text-primary-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {filteredSavedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSavedItems.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                isSaved={true}
                onToggleSave={toggleSave}
                onGenerate={handleGenerate}
                variant="saved"
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Filter className="text-slate-300" />
            </div>
            <p className="text-slate-500">No items found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        savedCount={savedItems.length} 
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'feed' ? renderFeed() : renderSaved()}
        </div>
      </main>

      <GenerationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        isLoading={isGenerating}
        data={generatedResult}
      />
    </div>
  );
};

export default App;