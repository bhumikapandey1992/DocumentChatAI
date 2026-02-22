import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
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

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await onUpload(files);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md"
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300",
            isDragging
              ? "border-indigo-400 bg-indigo-50 scale-[1.02]"
              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
            uploading && "pointer-events-none"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Uploading documents...</h3>
                <p className="text-sm text-zinc-500">Parsing and indexing your files.</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Upload your documents</h3>
                <p className="text-sm text-zinc-500 mb-5">Drag and drop files here, or click to browse.</p>

                <div className="flex items-center gap-2">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
