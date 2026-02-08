import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import ChatWindow from "./components/ChatWindow";
import { BookOpen, Sparkles } from "lucide-react";

function App() {
  const [isReady, setIsReady] = useState(false);

  const handleUploadSuccess = (data) => {
    console.log("Ingestion result:", data);
    setIsReady(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Powered Learning</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Lernia<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload your documents and chat with them in seconds. Unlock the
            knowledge hidden in your PDFs.
          </p>
        </header>

        {/* Main Content */}
        <main className="w-full space-y-12 animate-in fade-in duration-1000 delay-300">
          <section>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          <section className="flex justify-center">
            <ChatWindow isReady={isReady} />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-slate-200 text-center w-full max-w-2xl text-slate-400 text-sm">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Lernia Knowledge Base</span>
          </div>
          <p>© 2026 Lernia AI Project. Built with Google Gemini & ChromaDB.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
