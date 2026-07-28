"use client";

import { useState, useEffect, useRef } from "react";
import { fetchChatHistory, sendChatMessage } from "@/lib/api";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchChatHistory();
      setMessages(data);
    }
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage.message);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", message: "Sorry, I ran into a problem connecting to the server!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)]">
      <header className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assistant</h1>
          <p className="text-sm text-gray-500">Your supportive friend and productivity specialist.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-card border border-border p-4 mb-4 space-y-6 scroll-smooth shadow-inner">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground">
            <Bot className="w-12 h-12 opacity-50" />
            <p>Hey there! I'm your new assistant. How can I help you manage your day?</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`max-w-[80%] rounded px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-muted text-foreground" : "bg-transparent border border-border text-foreground"} [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-4 [&_strong]:font-bold`}>
                <ReactMarkdown>{msg.message}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="max-w-[80%] rounded px-4 py-3 text-sm leading-relaxed bg-transparent border border-border text-foreground italic flex items-center gap-1">
              <span className="animate-pulse">Thinking</span>
              <span className="animate-pulse" style={{ animationDelay: "200ms" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "400ms" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "600ms" }}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your tasks, progress, or advice..."
          className="flex-1 bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-foreground text-background px-4 py-3 flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
