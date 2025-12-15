import React from 'react';
import { ContentItem, SavedItem, RedditArticle, NewsletterHighlight } from '../types';
import { MessageCircle, ThumbsUp, Bookmark, Sparkles, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';

interface ContentCardProps {
  item: ContentItem | SavedItem;
  isSaved: boolean;
  onToggleSave: (item: ContentItem | SavedItem) => void;
  // Only for saved items
  onGenerate?: (item: SavedItem, platform: any) => void;
  variant?: 'feed' | 'saved';
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  item, 
  isSaved, 
  onToggleSave, 
  onGenerate,
  variant = 'feed' 
}) => {
  
  const isReddit = item.type === 'reddit';
  const redditData = isReddit ? (item as RedditArticle) : null;
  const newsletterData = !isReddit ? (item as NewsletterHighlight) : null;

  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">
      
      {/* Header: Source Badge & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
          isReddit 
            ? 'bg-orange-50 text-orange-700' 
            : 'bg-purple-50 text-purple-700'
        }`}>
          {isReddit ? <MessageCircle size={12} /> : <Mail size={12} />}
          {item.source_name}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item);
          }}
          className={`p-2 rounded-full transition-colors ${
            isSaved 
              ? 'bg-primary-50 text-primary-600' 
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
          aria-label="Save item"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-3 leading-tight line-clamp-2 group-hover:text-primary-900 transition-colors">
            {item.title}
          </h3>
        </a>

        <div className="text-slate-500 text-sm leading-relaxed mb-4">
          {isReddit ? (
            <p className="line-clamp-3">{redditData?.snippet}</p>
          ) : (
            <div>
              <p className="mb-2 line-clamp-2">{newsletterData?.content}</p>
              {newsletterData?.key_points && (
                <ul className="space-y-1 mt-2">
                  {newsletterData.key_points.slice(0, 2).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span className="line-clamp-1">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Metrics & Actions */}
      <div className="pt-4 mt-auto border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          {isReddit && (
            <>
              <div className="flex items-center gap-1">
                <ThumbsUp size={14} />
                {redditData?.upvotes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                {redditData?.comments}
              </div>
            </>
          )}
          {!isReddit && (
            <span className="flex items-center gap-1">
               {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {variant === 'feed' ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-600 transition-colors">
            <ExternalLink size={16} />
          </a>
        ) : (
          /* Saved View Actions */
          <div className="flex gap-2">
            <div className="relative group/dropdown">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-semibold rounded-lg transition-colors">
                    <Sparkles size={14} />
                    Generate
                </button>
                {/* Dropdown for Generation Options */}
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 hidden group-hover/dropdown:block z-10 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-2">Transform to</div>
                    <button onClick={() => onGenerate?.(item as SavedItem, 'twitter')} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <span>🐦</span> Twitter Thread
                    </button>
                    <button onClick={() => onGenerate?.(item as SavedItem, 'linkedin')} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <span>💼</span> LinkedIn Post
                    </button>
                    <button onClick={() => onGenerate?.(item as SavedItem, 'email')} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <span>✉️</span> Email Subject
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;