import React, { useState, useRef, useEffect } from "react";
import { CornerDownLeft, User, Terminal, Loader2 } from "lucide-react";
import axios from "axios";

const ChatWindow = ({ isReady }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !isReady) return;

    const userMessage = { text: input, role: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/chat", {
        query: input,
      });

      const botMessage = {
        text: response.data.answer,
        role: "bot",
        source: response.data.source,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          text: "System fault: Unable to retrieve response.",
          role: "bot",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col flex-1 bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden relative">
      
      {/* Messages Stream */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6"
        ref={scrollRef}
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600">
            <Terminal className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">Awaiting query...</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-4 group">
            <div className="shrink-0 mt-0.5">
              {msg.role === "user" ? (
                <div className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-neutral-300">
                  <User className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-400">
                  {msg.role === "user" ? "You" : "Lernia"}
                </span>
              </div>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.isError ? 'text-red-400' : 'text-neutral-300'}`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="shrink-0 mt-0.5 w-6 h-6 rounded flex items-center justify-center bg-indigo-500/20 text-indigo-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-[#0a0a0a] border-t border-white/5">
        <form
          onSubmit={handleSend}
          className={`relative flex items-center bg-[#141414] border rounded-md transition-colors ${
            !isReady ? 'border-white/5 opacity-50' : 'border-white/10 focus-within:border-neutral-500'
          }`}
        >
          <input
            disabled={!isReady || loading}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!isReady ? "Initialize document first" : "Type a command or question..."}
            className="w-full bg-transparent text-sm text-neutral-200 placeholder-neutral-600 py-2.5 pl-3 pr-10 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isReady || loading || !input.trim()}
            className="absolute right-2 p-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-white/5 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;