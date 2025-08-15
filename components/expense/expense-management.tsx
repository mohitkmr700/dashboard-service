"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Search, Plus } from "lucide-react";
import { ExpenseItem } from "../../lib/types";

// Dummy data for the expense table
const dummyExpenses: ExpenseItem[] = [
  {
    id: "1",
    category: "Rent",
    description: "Monthly apartment rent",
    amount: 8000,
    date: "2025-01-15",
    status: "paid",
    paymentMethod: "Online Transfer",
    notes: "Paid on time"
  },
  {
    id: "2",
    category: "Food",
    description: "Grocery shopping",
    amount: 2500,
    date: "2025-01-10",
    status: "paid",
    paymentMethod: "Credit Card",
    notes: "Weekly groceries"
  },
  {
    id: "3",
    category: "Transportation",
    description: "Petrol for car",
    amount: 1500,
    date: "2025-01-12",
    status: "paid",
    paymentMethod: "Cash",
  },
  {
    id: "4",
    category: "Utilities",
    description: "Electricity bill",
    amount: 1200,
    date: "2025-01-20",
    status: "pending",
    paymentMethod: "Online Transfer",
    notes: "Due on 25th"
  },
  {
    id: "5",
    category: "Entertainment",
    description: "Movie tickets",
    amount: 800,
    date: "2025-01-08",
    status: "paid",
    paymentMethod: "Credit Card",
  },
  {
    id: "6",
    category: "Healthcare",
    description: "Doctor consultation",
    amount: 2000,
    date: "2025-01-18",
    status: "overdue",
    paymentMethod: "Cash",
    notes: "Need to pay by 20th"
  },
  {
    id: "7",
    category: "Shopping",
    description: "New clothes",
    amount: 3500,
    date: "2025-01-14",
    status: "paid",
    paymentMethod: "Credit Card",
  },
  {
    id: "8",
    category: "Education",
    description: "Online course subscription",
    amount: 1800,
    date: "2025-01-22",
    status: "pending",
    paymentMethod: "Online Transfer",
    notes: "Annual subscription"
  }
];

export function ExpenseManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredExpenses = dummyExpenses.filter(expense => {
    const matchesSearch = 
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || expense.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = filteredExpenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">Track and manage your monthly expenses</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.filter(e => e.status === 'paid').length} expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.filter(e => e.status === 'pending').length} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search expenses by category, description, or payment method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("paid")}
              >
                Paid
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "overdue" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("overdue")}
              >
                Overdue
              </Button>
            </div>
          </div>

          {/* Expense Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Payment Method</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-medium">{expense.category}</td>
                    <td className="p-3">{expense.description}</td>
                    <td className="p-3 font-semibold">{formatCurrency(expense.amount)}</td>
                    <td className="p-3">{formatDate(expense.date)}</td>
                    <td className="p-3">{getStatusBadge(expense.status)}</td>
                    <td className="p-3">{expense.paymentMethod}</td>
                    <td className="p-3 max-w-xs truncate">{expense.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expenses found matching your search criteria.</p>
              </div>
            )}
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
