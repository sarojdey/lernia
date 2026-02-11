import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import ChatWindow from "./components/ChatWindow";
import { BookOpen, Command } from "lucide-react";

function App() {
  const [isReady, setIsReady] = useState(false);

  const handleUploadSuccess = (data) => {
    console.log("Ingestion result:", data);
    setIsReady(true);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-neutral-800 selection:text-white flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-4xl mx-auto px-6 py-6 flex flex-col h-full">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/5 border border-white/10 rounded-md">
              <Command className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-neutral-100">
                Lernia
              </h1>
              <p className="text-xs text-neutral-500">Document Intelligence</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {/* min-h-0 is critical here. It stops the flex child from overflowing the screen. */}
        <main className="flex-1 flex flex-col w-full py-4 gap-4 min-h-0">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <ChatWindow isReady={isReady} />
        </main>

        {/* Footer */}
        <footer className="pt-4 pb-2 text-xs text-neutral-600 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lernia Knowledge Base</span>
          </div>
          <p>© 2026 Lernia AI.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;