import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

export function UploadZone({ onUpload, onClose }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    setUploading(true);
    // Simulate upload progress
    setTimeout(() => {
      onUpload(files);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Upload Documents</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400 hover:text-zinc-600" />
          </button>
        </div>

        <div className="p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
              isDragging 
                ? "border-indigo-500 bg-indigo-50/30" 
                : "border-zinc-200 hover:border-indigo-200 hover:bg-zinc-50/50"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.docx,.txt"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-zinc-600 text-center uppercase tracking-widest">
                  Processing...
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm shadow-indigo-100">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-zinc-900 tracking-tight">
                    Drag & Drop Documents
                  </p>
                  <p className="text-sm text-zinc-400 mt-1 font-medium">
                    or click to browse from your computer
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-100 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest shadow-sm">
                    <FileText className="w-3 h-3" /> PDF
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-100 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest shadow-sm">
                    <FileText className="w-3 h-3" /> DOCX
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-100 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest shadow-sm">
                    <FileText className="w-3 h-3" /> TXT
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
