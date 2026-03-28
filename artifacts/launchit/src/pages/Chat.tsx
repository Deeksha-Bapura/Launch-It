import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ProgressTracker } from "@/components/ProgressTracker";
import { MessageBubble } from "@/components/MessageBubble";
import { InputBar } from "@/components/InputBar";
import { useAppContext } from "@/context/AppContext";
import { useSendMessage, useGenerateDocument } from "@workspace/api-client-react";
import { FileText, Calculator, BarChart3, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, setMessages, 
    sessionData, setSessionData,
    currentStep, setCurrentStep,
    suggestDocuments, setSuggestDocuments,
    addDocument
  } = useAppContext();

  const sendMessageMutation = useSendMessage();
  const generateDocMutation = useGenerateDocument();

  // Seed opening message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hey! Tell me a bit about what you sell or do — even just one sentence is enough. Something like 'I bake cakes and sell them to neighbors' or 'I do people's nails at home.' I'll take it from there."
        }
      ]);
    }
  }, [messages.length, setMessages]);

  // Auto-scroll
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
        data: {
          messages: newMessages,
          sessionData
        }
      });

      setMessages([...newMessages, { role: "assistant", content: response.reply }]);
      
      if (response.detectedBusinessType) {
        setSessionData(prev => ({ ...prev, detectedBusinessType: response.detectedBusinessType }));
        if (currentStep < 2) setCurrentStep(2);
      }
      
      if (response.suggestDocuments) {
        setSuggestDocuments(true);
        if (currentStep < 3) setCurrentStep(3);
      }

      // Simple heuristic for moving to step 5 based on interaction length
      if (newMessages.length > 5 && currentStep < 5) {
        setCurrentStep(5);
      }

    } catch (error) {
      console.error("Failed to send message", error);
      toast({
        title: "Error sending message",
        description: "Please try again.",
        variant: "destructive"
      });
      // Remove the optimistic user message if failed
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
      
      toast({
        title: "Document generated!",
        description: "You can view it in the Documents tab.",
      });
      
      setLocation("/documents");
    } catch (error) {
      toast({
        title: "Error generating document",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const isGenerating = generateDocMutation.isPending;

  return (
    <Layout>
      <ProgressTracker currentStep={currentStep} />
      
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
                <button 
                  onClick={() => handleGenerateDoc("invoice")}
                  disabled={isGenerating}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all active:scale-95 disabled:opacity-50"
                >
                  <div className="bg-primary/10 p-2 rounded-xl text-primary"><FileText className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold text-foreground">Invoice Template</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Bill your customers</div>
                  </div>
                </button>
                <button 
                  onClick={() => handleGenerateDoc("profit_loss")}
                  disabled={isGenerating}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-emerald-500/50 hover:bg-emerald-50 text-left transition-all active:scale-95 disabled:opacity-50"
                >
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><BarChart3 className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold text-foreground">P&L Tracker</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Track your money</div>
                  </div>
                </button>
                <button 
                  onClick={() => handleGenerateDoc("pricing")}
                  disabled={isGenerating}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-blue-500/50 hover:bg-blue-50 text-left transition-all active:scale-95 disabled:opacity-50"
                >
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Calculator className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold text-foreground">Pricing Calculator</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Know what to charge</div>
                  </div>
                </button>
                <button 
                  onClick={() => handleGenerateDoc("social_post")}
                  disabled={isGenerating}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-purple-500/50 hover:bg-purple-50 text-left transition-all active:scale-95 disabled:opacity-50"
                >
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
    </Layout>
  );
}
