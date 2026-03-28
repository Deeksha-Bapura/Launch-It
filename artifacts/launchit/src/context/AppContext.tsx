import { createContext, useContext, useState, ReactNode } from "react";
import type { ChatMessage, DocumentResponseDocument } from "@workspace/api-client-react";

interface AppContextType {
  documents: DocumentResponseDocument[];
  addDocument: (doc: DocumentResponseDocument) => void;
  clearDocuments: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sessionData: Record<string, any>;
  setSessionData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  suggestDocuments: boolean;
  setSuggestDocuments: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentResponseDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [suggestDocuments, setSuggestDocuments] = useState<boolean>(false);

  const addDocument = (doc: DocumentResponseDocument) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const clearDocuments = () => setDocuments([]);

  return (
    <AppContext.Provider
      value={{
        documents,
        addDocument,
        clearDocuments,
        messages,
        setMessages,
        sessionData,
        setSessionData,
        currentStep,
        setCurrentStep,
        suggestDocuments,
        setSuggestDocuments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
