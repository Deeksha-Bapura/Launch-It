import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

const BASE = "/api";

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: string;
  description?: string | null;
  category?: string | null;
  date: string;
}

const INCOME_CATEGORIES = ["Sales", "Service", "Consulting", "Tip", "Other"];
const EXPENSE_CATEGORIES = ["Supplies", "Food", "Transport", "Marketing", "Equipment", "Rent", "Utilities", "Other"];

function fetchTransactions() {
  return fetch(`${BASE}/transactions`, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

export default function Tracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["transactions"], queryFn: fetchTransactions, enabled: !!user });
  const transactions: Transaction[] = data?.transactions ?? [];

  const addMutation = useMutation({
    mutationFn: (body: object) =>
      fetch(`${BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${r.status}`);
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setAmount("");
      setDescription("");
      setCategory("");
      toast({ title: "Transaction added!" });
    },
    onError: (err: Error) =>
      toast({ title: "Error saving transaction", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`${BASE}/transactions/${id}`, { method: "DELETE", credentials: "include" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const prev = queryClient.getQueryData(["transactions"]);
      queryClient.setQueryData(["transactions"], (old: any) => ({
        ...old,
        transactions: old.transactions.filter((t: Transaction) => t.id !== id),
      }));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(["transactions"], ctx?.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    addMutation.mutate({ type, amount: Number(amount), description, category, date });
  };

  const grouped = transactions.reduce((acc: Record<string, Transaction[]>, tx) => {
    const month = tx.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(tx);
    return acc;
  }, {});

  const currentMonth = format(new Date(), "yyyy-MM");
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalIncome = currentMonthTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = currentMonthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Income & Expense Tracker</h1>
          <p className="text-muted-foreground mt-1">Log your transactions and track your cash flow.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Total Income</span>
            </div>
            <p className="text-xl font-bold text-emerald-700">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Total Expenses</span>
            </div>
            <p className="text-xl font-bold text-red-700">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className={`${netProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} border rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={`w-4 h-4 ${netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`} />
              <span className={`text-xs font-medium ${netProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>Net Profit</span>
            </div>
            <p className={`text-xl font-bold ${netProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              {netProfit < 0 ? "-" : ""}${Math.abs(netProfit).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Transaction
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${type === "income" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${type === "expense" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}
              >
                Expense
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional note"
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {addMutation.isPending ? "Saving..." : "Add Transaction"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="font-bold text-foreground mb-3">Transaction History</h2>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-white border border-border border-dashed rounded-2xl">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No transactions yet. Add your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, txs]) => (
                  <div key={month} className="bg-white border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 bg-muted/30 border-b border-border">
                      <span className="font-semibold text-sm text-foreground">
                        {format(parseISO(`${month}-01`), "MMMM yyyy")}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {txs
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((tx) => (
                          <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500" : "bg-red-500"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {tx.description || tx.category || (tx.type === "income" ? "Income" : "Expense")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(tx.date), "MMM d")} {tx.category ? `· ${tx.category}` : ""}
                              </p>
                            </div>
                            <span className={`font-bold text-sm ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                              {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                            </span>
                            <button
                              onClick={() => deleteMutation.mutate(tx.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
