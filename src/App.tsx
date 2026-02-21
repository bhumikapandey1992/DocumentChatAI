import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface, ThinkingStep } from './components/ChatInterface';
import { UploadZone } from './components/UploadZone';
import { SourcesPanel } from './components/SourcesPanel';
import { Document, Message, Source } from './types';
import { GoogleGenAI } from "@google/genai";
import { AnimatePresence } from 'motion/react';

const INITIAL_DOCS: Document[] = [
  {
    id: '1',
    name: 'Product_Requirements_v2.pdf',
    size: '2.4 MB',
    type: 'pdf',
    uploadDate: '2024-03-20'
  },
  {
    id: '2',
    name: 'Marketing_Strategy_2024.docx',
    size: '1.1 MB',
    type: 'docx',
    uploadDate: '2024-03-18'
  }
];

export default function App() {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCS);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<ThinkingStep>(null);
  const [currentSources, setCurrentSources] = useState<Source[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const handleUpload = (files: File[]) => {
    const newDocs: Document[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.split('.').pop() || 'txt',
      uploadDate: new Date().toISOString().split('T')[0]
    }));
    setDocuments(prev => [...newDocs, ...prev]);
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
      // Random delay between words for natural feel
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
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
    setCurrentSources([]); // Clear sources for new query

    try {
      // Step 1: Analyzing
      setThinkingStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Retrieving
      setThinkingStep('retrieving');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Generating (Call API)
      setThinkingStep('generating');
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Context: You are an AI assistant helping a user with their document named "${selectedDoc.name}".
        User question: ${content}
        
        Provide a helpful, concise answer based on the document context.`,
      });

      const aiResponse = response.text || "I'm sorry, I couldn't process that request.";
      
      setThinkingStep(null);
      setIsLoading(false);

      // Create placeholder message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Mock sources for demonstration
      const mockSources: Source[] = [
        {
          id: Math.random().toString(),
          documentName: selectedDoc.name,
          page: Math.floor(Math.random() * 10) + 1,
          snippet: "This is a relevant snippet from the document that supports the AI's answer. It contains key information about the user's query."
        }
      ];

      // Start streaming effect
      await simulateStreaming(assistantMessageId, aiResponse);
      
      // Update with sources once streaming is done
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, sources: mockSources } : msg
      ));
      setCurrentSources(mockSources);

    } catch (error) {
      console.error("Error calling Gemini:", error);
      setThinkingStep(null);
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error while processing your request. Please try again.",
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
