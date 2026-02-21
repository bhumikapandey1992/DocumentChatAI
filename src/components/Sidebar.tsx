import React from 'react';
import { FileText, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Document } from '../types';

interface SidebarProps {
  documents: Document[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
  onUploadClick: () => void;
  onDeleteDoc: (id: string) => void;
}

export function Sidebar({ 
  documents, 
  selectedDocId, 
  onSelectDoc, 
  onUploadClick,
  onDeleteDoc 
}: SidebarProps) {
  return (
    <aside className="w-[260px] h-full border-r border-zinc-200 bg-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">DocuChat AI</h1>
        </div>

        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="px-3 mb-2">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Your Documents
          </h2>
        </div>
        
        <div className="space-y-1">
          {documents.length === 0 ? (
            <div className="px-3 py-4 text-sm text-zinc-400 italic">
              No documents yet
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                  selectedDocId === doc.id 
                    ? "bg-indigo-50/80 text-indigo-700 border-indigo-100" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-100"
                )}
                onClick={() => onSelectDoc(doc.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    selectedDocId === doc.id ? "text-indigo-600" : "text-zinc-400 group-hover:text-indigo-500"
                  )} />
                  <span className="text-sm font-medium truncate">{doc.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoc(doc.id);
                  }}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all",
                    selectedDocId === doc.id ? "hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600" : "hover:bg-zinc-200/50 text-zinc-400 hover:text-red-500"
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">John Doe</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
