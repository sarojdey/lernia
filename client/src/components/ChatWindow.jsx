import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
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
          text: "I'm sorry, I encountered an error. Please try again.",
          role: "bot",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 italic text-sm text-slate-500">
        {!isReady
          ? "Upload a document above to start chatting"
          : "Chatting with your document"}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        ref={scrollRef}
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
            <Bot className="w-12 h-12" />
            <p className="text-sm font-medium">
              Ask me anything about the uploaded PDF
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
          >
            <div
              className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${msg.role === "user" ? "bg-indigo-600" : "bg-slate-100"}`}
              >
                {msg.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                } ${msg.isError ? "bg-rose-50 text-rose-600 border-rose-100" : ""}`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex max-w-[85%] flex-row items-start gap-3">
              <div className="p-2 rounded-xl shrink-0 bg-slate-100">
                <Bot className="w-5 h-5 text-slate-600" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-slate-100"
      >
        <div className="relative flex items-center">
          <input
            disabled={!isReady || loading}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              !isReady
                ? "Please upload a document first..."
                : "Ask a question..."
            }
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isReady || loading || !input.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
