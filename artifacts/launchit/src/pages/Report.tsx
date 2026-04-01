import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Printer } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval, subMonths, startOfMonth, endOfMonth } from "date-fns";

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: string;
  description?: string | null;
  category?: string | null;
  date: string;
}

function fetchTransactions() {
  return fetch(`${BASE}/transactions`, { credentials: "include" }).then((r) => r.json());
}

const COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function Report() {
  const { data, isLoading } = useQuery({ queryKey: ["transactions"], queryFn: fetchTransactions });
  const transactions: Transaction[] = data?.transactions ?? [];

  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const prevMonth = format(subMonths(now, 1), "yyyy-MM");

  const currentTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const prevTxs = transactions.filter((t) => t.date.startsWith(prevMonth));

  const totalIncome = currentTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = currentTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  const prevIncome = prevTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const prevExpenses = prevTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const prevNet = prevIncome - prevExpenses;

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

  const weeklyData = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart);
    const label = `Wk ${format(weekStart, "d")}`;
    const weekTxs = transactions.filter((t) => {
      const d = parseISO(t.date);
      return d >= weekStart && d <= weekEnd;
    });
    return {
      week: label,
      income: weekTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      expenses: weekTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    };
  });

  const expenseByCategory = currentTxs
    .filter((t) => t.type === "expense")
    .reduce((acc: Record<string, number>, t) => {
      const key = t.category || "Other";
      acc[key] = (acc[key] ?? 0) + Number(t.amount);
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const incomePct = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : null;
  const expensePct = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6" id="report-printable">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Monthly Report</h1>
            <p className="text-muted-foreground mt-1">{format(now, "MMMM yyyy")}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading report...</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Income</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">${totalIncome.toFixed(2)}</p>
                {incomePct !== null && (
                  <p className={`text-xs mt-1 ${incomePct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {incomePct >= 0 ? "+" : ""}{incomePct.toFixed(1)}% vs last month
                  </p>
                )}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-700">${totalExpenses.toFixed(2)}</p>
                {expensePct !== null && (
                  <p className={`text-xs mt-1 ${expensePct <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {expensePct >= 0 ? "+" : ""}{expensePct.toFixed(1)}% vs last month
                  </p>
                )}
              </div>
              <div className={`${netProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} border rounded-2xl p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`} />
                  <span className={`text-xs font-medium ${netProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>Net Profit</span>
                </div>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                  {netProfit < 0 ? "-" : ""}${Math.abs(netProfit).toFixed(2)}
                </p>
                {prevNet !== 0 && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Last month: {prevNet < 0 ? "-" : ""}${Math.abs(prevNet).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4">Income vs Expenses by Week</h2>
              {weeklyData.every((w) => w.income === 0 && w.expenses === 0) ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No data for this month yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData} barGap={4}>
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4">Expense Categories</h2>
              {pieData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No expenses recorded this month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          body > *:not(#report-printable) { display: none !important; }
          #report-printable { display: block !important; }
          nav, footer { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}
