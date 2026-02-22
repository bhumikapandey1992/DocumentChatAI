import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface, ThinkingStep } from './components/ChatInterface';
import { UploadZone } from './components/UploadZone';
import { SourcesPanel } from './components/SourcesPanel';
import { Document, Message, Source } from './types';
import { AnimatePresence } from 'motion/react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:8000/api';

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<ThinkingStep>(null);
  const [currentSources, setCurrentSources] = useState<Source[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const handleUpload = async (files: File[]) => {
    const uploaded: Document[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      const data: { document_id: number; filename: string } = await response.json();
      uploaded.push({
        id: data.document_id.toString(),
        backendId: data.document_id,
        name: data.filename,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.split('.').pop() || 'txt',
        uploadDate: new Date().toISOString().split('T')[0],
      });
    }

    if (uploaded.length > 0) {
      setDocuments(prev => [...uploaded, ...prev]);
      setSelectedDocId(uploaded[0].id);
      setMessages([]);
      setCurrentSources([]);
    }

    setIsUploadOpen(false);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDocId === id) {
      setSelectedDocId(null);
      setMessages([]);
      setCurrentSources([]);
    }
  };

  const simulateStreaming = async (messageId: string, fullText: string) => {
    setStreamingMessageId(messageId);
    let currentText = "";
    const words = fullText.split(' ');

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, content: currentText } : msg
      ));
      await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 30));
    }
    setStreamingMessageId(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedDoc) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentSources([]);

    try {
      setThinkingStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 400));
      setThinkingStep('retrieving');
      await new Promise(resolve => setTimeout(resolve, 400));
      setThinkingStep('generating');

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: content,
          document_id: selectedDoc.backendId,
          top_k: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data: {
        answer: string;
        sources: Array<{ document_id: number; chunk_id: number; chunk_index: number; content: string }>;
      } = await response.json();

      const mappedSources: Source[] = data.sources.map((source) => ({
        id: source.chunk_id.toString(),
        documentName: selectedDoc.name,
        page: source.chunk_index + 1,
        snippet: source.content,
      }));

      setThinkingStep(null);
      setIsLoading(false);

      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      await simulateStreaming(assistantMessageId, data.answer);

      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId ? { ...msg, sources: mappedSources } : msg
      ));
      setCurrentSources(mappedSources);

    } catch (error) {
      console.error('Error sending message:', error);
      setThinkingStep(null);
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={setSelectedDocId}
        onUploadClick={() => setIsUploadOpen(true)}
        onDeleteDoc={handleDeleteDoc}
      />

      <main className="flex-1 flex overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          thinkingStep={thinkingStep}
          selectedDocName={selectedDoc?.name || null}
          streamingMessageId={streamingMessageId}
        />

        <SourcesPanel sources={currentSources} />
      </main>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadZone
            onUpload={handleUpload}
            onClose={() => setIsUploadOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
