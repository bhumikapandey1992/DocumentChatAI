import React, { useState } from 'react';
import { BookOpen, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Source } from '../types';
import { cn } from '../lib/utils';

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  return (
    <aside className="w-[320px] h-full border-l border-zinc-200 bg-[#FCFCFD] flex flex-col">
      <div className="p-6 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Sources</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {sources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-12 h-12 bg-white border border-zinc-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <BookOpen className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Citations and source snippets will appear here when the AI answers.
              </p>
            </motion.div>
          ) : (
            sources.map((source, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  backgroundColor: highlightedId === source.id ? '#ffffff' : '#ffffff',
                  borderColor: highlightedId === source.id ? '#c4b5fd' : '#f4f4f5'
                }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 30,
                  delay: index * 0.05 
                }}
                key={source.id}
                onClick={() => setHighlightedId(highlightedId === source.id ? null : source.id)}
                className={cn(
                  "border rounded-xl p-4 shadow-sm transition-all group cursor-pointer relative overflow-hidden",
                  highlightedId === source.id ? "ring-2 ring-indigo-500/10" : "hover:border-indigo-100 hover:shadow-md"
                )}
              >
                {highlightedId === source.id && (
                  <motion.div 
                    layoutId="highlight-bar"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"
                  />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded transition-colors",
                    highlightedId === source.id ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                  )}>
                    Source {index + 1}
                  </span>
                  <ExternalLink className={cn(
                    "w-3 h-3 transition-colors",
                    highlightedId === source.id ? "text-indigo-500" : "text-zinc-300 group-hover:text-indigo-400"
                  )} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-zinc-900 truncate">
                    {source.documentName}
                  </span>
                  {source.page && (
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      • Page {source.page}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-xs leading-relaxed transition-colors",
                  highlightedId === source.id ? "text-zinc-900 font-medium" : "text-zinc-500 italic"
                )}>
                  "{source.snippet}"
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-end">
                  <button className={cn(
                    "text-[10px] font-bold flex items-center gap-1 transition-colors uppercase tracking-widest",
                    highlightedId === source.id ? "text-indigo-600" : "text-zinc-400 group-hover:text-indigo-600"
                  )}>
                    {highlightedId === source.id ? 'Referenced' : 'View full context'} 
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
