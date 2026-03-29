import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ChatMessage, DocumentResponseDocument } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

interface SessionData {
  city?: string;
  detectedBusinessType?: string;
  [key: string]: string | undefined;
}

interface AppContextType {
  documents: DocumentResponseDocument[];
  addDocument: (doc: DocumentResponseDocument) => void;
  clearDocuments: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sessionData: SessionData;
  setSessionData: React.Dispatch<React.SetStateAction<SessionData>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  suggestDocuments: boolean;
  setSuggestDocuments: React.Dispatch<React.SetStateAction<boolean>>;
  userName: string | null;
  businessType: string | null;
  userState: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentResponseDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [suggestDocuments, setSuggestDocuments] = useState<boolean>(false);

  const userName = user?.name ?? null;
  const businessType = user?.businessType ?? null;
  const userState = user?.state ?? null;

  useEffect(() => {
    if (user?.businessType) {
      setSessionData((prev) => ({ ...prev, detectedBusinessType: user.businessType ?? undefined }));
    }
  }, [user?.businessType]);

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
        userName,
        businessType,
        userState,
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
