import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ProgressTracker } from "@/components/ProgressTracker";
import { MessageBubble } from "@/components/MessageBubble";
import { InputBar } from "@/components/InputBar";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useSendMessage, useGenerateDocument } from "@workspace/api-client-react";
import { FileText, Calculator, BarChart3, Share2, Loader2, MessageSquare, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

const BASE = "/api";

interface Conversation {
  id: number;
  title: string;
  messages: any[];
  sessionData: Record<string, any>;
  updatedAt: string;
}

function fetchConversations() {
  return fetch(`${BASE}/conversations`, { credentials: "include" }).then((r) => r.ok ? r.json() : { conversations: [] });
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  const {
    messages, setMessages,
    sessionData, setSessionData,
    currentStep, setCurrentStep,
    suggestDocuments, setSuggestDocuments,
    addDocument
  } = useAppContext();

  const sendMessageMutation = useSendMessage();
  const generateDocMutation = useGenerateDocument();

  const { data: convsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled: !!user,
  });

  const conversations: Conversation[] = convsData?.conversations ?? [];

  const saveConversation = async (msgs: any[], sd: Record<string, any>, convId: number | null) => {
    if (!user) return convId;
    try {
      const title = msgs.find((m) => m.role === "user")?.content?.slice(0, 50) || "New Conversation";
      if (!convId) {
        const res = await fetch(`${BASE}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages: msgs, sessionData: sd }),
          credentials: "include",
        });
        const data = await res.json();
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return data.conversation?.id ?? null;
      } else {
        await fetch(`${BASE}/conversations/${convId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: msgs, sessionData: sd }),
          credentials: "include",
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return convId;
      }
    } catch {
      return convId;
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([{
      role: "assistant",
      content: "Hey! Tell me a bit about what you sell or do — even just one sentence is enough. Something like 'I bake cakes and sell them to neighbors' or 'I do people's nails at home.' I'll take it from there."
    }]);
    setSessionData({});
    setCurrentStep(1);
    setSuggestDocuments(false);
    setSidebarOpen(false);
  };

  const loadConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(Array.isArray(conv.messages) ? conv.messages : []);
    setSessionData(typeof conv.sessionData === "object" ? conv.sessionData : {});
    setSuggestDocuments(false);
    setCurrentStep(1);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hey! Tell me a bit about what you sell or do — even just one sentence is enough. Something like 'I bake cakes and sell them to neighbors' or 'I do people's nails at home.' I'll take it from there."
      }]);
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, suggestDocuments, sendMessageMutation.isPending]);

  const handleSendMessage = async (text: string) => {
    const userMsg = { role: "user" as const, content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const response = await sendMessageMutation.mutateAsync({
        data: { messages: newMessages, sessionData }
      });

      const updatedMessages = [...newMessages, { role: "assistant", content: response.reply }];
      setMessages(updatedMessages);

      let updatedSessionData = sessionData;
      if (response.detectedBusinessType) {
        updatedSessionData = { ...sessionData, detectedBusinessType: response.detectedBusinessType };
        setSessionData(updatedSessionData);
        if (currentStep < 2) setCurrentStep(2);

        if (user && response.detectedBusinessType !== "general") {
          await fetch(`${BASE}/auth/me`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessType: response.detectedBusinessType }),
            credentials: "include",
          });
        }
      }

      if (response.suggestDocuments) {
        setSuggestDocuments(true);
        if (currentStep < 3) setCurrentStep(3);
      }

      if (newMessages.length > 5 && currentStep < 5) setCurrentStep(5);

      const newConvId = await saveConversation(updatedMessages, updatedSessionData, activeConvId);
      if (!activeConvId && newConvId) setActiveConvId(newConvId);

    } catch (error) {
      toast({ title: "Error sending message", description: "Please try again.", variant: "destructive" });
      setMessages(messages);
    }
  };

  const handleGenerateDoc = async (type: "invoice" | "profit_loss" | "pricing" | "social_post") => {
    try {
      const response = await generateDocMutation.mutateAsync({
        data: {
          type,
          city: sessionData.city,
          businessName: sessionData.detectedBusinessType
        }
      });

      addDocument(response.document);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      toast({ title: "Document generated!", description: "You can view it in the Documents tab." });
      setLocation("/documents");
    } catch {
      toast({ title: "Error generating document", description: "Please try again later.", variant: "destructive" });
    }
  };

  const isGenerating = generateDocMutation.isPending;

  return (
    <Layout>
      <ProgressTracker currentStep={currentStep} />

      <div className="flex flex-1 overflow-hidden relative">
        {user && (
          <>
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <aside
              className={`
                flex flex-col w-64 flex-shrink-0 border-r border-border bg-white z-20
                transition-all duration-200
                lg:static lg:translate-x-0
                ${sidebarOpen ? "translate-x-0 absolute inset-y-0 left-0 h-full" : "-translate-x-full absolute inset-y-0 left-0 h-full lg:translate-x-0 lg:static"}
              `}
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Conversations</span>
                <button
                  onClick={startNewConversation}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="New conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 px-2">No saved conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors group ${
                        activeConvId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{conv.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(parseISO(conv.updatedAt), "MMM d")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 left-0 z-30 lg:hidden bg-white border border-border rounded-r-lg p-1.5 shadow-sm"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </>
        )}

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 scroll-smooth bg-background"
          >
            <div className="max-w-4xl mx-auto flex flex-col">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role} content={msg.content} />
              ))}

              {sendMessageMutation.isPending && (
                <div className="flex w-full justify-start mb-6">
                  <div className="bg-white border border-border px-5 py-4 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}

              {suggestDocuments && (
                <div className="mt-4 mb-8 p-6 bg-white border border-border rounded-3xl shadow-sm animate-fade-in-up">
                  <h4 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                    <span className="text-2xl">✨</span> Ready to make it official?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Based on our chat, here are some documents I can generate for you right now:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button onClick={() => handleGenerateDoc("invoice")} disabled={isGenerating}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all active:scale-95 disabled:opacity-50">
                      <div className="bg-primary/10 p-2 rounded-xl text-primary"><FileText className="w-5 h-5" /></div>
                      <div>
                        <div className="font-bold text-foreground">Invoice Template</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Bill your customers</div>
                      </div>
                    </button>
                    <button onClick={() => handleGenerateDoc("profit_loss")} disabled={isGenerating}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-emerald-500/50 hover:bg-emerald-50 text-left transition-all active:scale-95 disabled:opacity-50">
                      <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><BarChart3 className="w-5 h-5" /></div>
                      <div>
                        <div className="font-bold text-foreground">P&L Tracker</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Track your money</div>
                      </div>
                    </button>
                    <button onClick={() => handleGenerateDoc("pricing")} disabled={isGenerating}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-blue-500/50 hover:bg-blue-50 text-left transition-all active:scale-95 disabled:opacity-50">
                      <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Calculator className="w-5 h-5" /></div>
                      <div>
                        <div className="font-bold text-foreground">Pricing Calculator</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Know what to charge</div>
                      </div>
                    </button>
                    <button onClick={() => handleGenerateDoc("social_post")} disabled={isGenerating}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-purple-500/50 hover:bg-purple-50 text-left transition-all active:scale-95 disabled:opacity-50">
                      <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Share2 className="w-5 h-5" /></div>
                      <div>
                        <div className="font-bold text-foreground">Social Post</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Promote your business</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <InputBar onSend={handleSendMessage} disabled={sendMessageMutation.isPending || isGenerating} />
        </div>
      </div>
    </Layout>
  );
}
