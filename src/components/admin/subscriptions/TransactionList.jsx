"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [5, 10, 20, 50];

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-10234",
    userName: "Emma Wilson",
    userEmail: "emmawilson@gmail.com",
    plan: "Ignite",
    amount: "207",
    status: "Completed",
    paymentDate: "2025-05-12",
    expiryDate: "2025-05-12",
  },
  {
    id: "TXN-10234",
    userName: "Emma Wilson",
    userEmail: "emmawilson@gmail.com",
    plan: "Accelerate",
    amount: "447",
    status: "Completed",
    paymentDate: "2025-05-12",
    expiryDate: "2025-05-12",
  },
  {
    id: "TXN-10234",
    userName: "Emma Wilson",
    userEmail: "emmawilson@gmail.com",
    plan: "Ascend",
    amount: "807",
    status: "Completed",
    paymentDate: "2025-05-12",
    expiryDate: "2025-05-12",
  },
  {
    id: "TXN-10234",
    userName: "Emma Wilson",
    userEmail: "emmawilson@gmail.com",
    plan: "Elevate",
    amount: "1287",
    status: "Completed",
    paymentDate: "2025-05-12",
    expiryDate: "2025-05-12",
  },
  {
    id: "TXN-10234",
    userName: "Emma Wilson",
    userEmail: "emmawilson@gmail.com",
    plan: "Ignite",
    amount: "207",
    status: "Completed",
    paymentDate: "2025-05-12",
    expiryDate: "2025-05-12",
  },
];

function TransactionList() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return MOCK_TRANSACTIONS;
    const q = search.toLowerCase();
    return MOCK_TRANSACTIONS.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedTransactions = useMemo(
    () => filteredTransactions.slice(startIndex, endIndex),
    [filteredTransactions, startIndex, endIndex],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Transaction List
      </h1>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by transaction ID, user or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 w-full max-w-full border-gray-200 bg-white rounded-md"
        />
      </div>

      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium">
                Transaction ID
              </TableHead>
              <TableHead className="text-gray-700 font-medium">User</TableHead>
              <TableHead className="text-gray-700 font-medium">Plan</TableHead>
              <TableHead className="text-gray-700 font-medium text-right">
                Amount
              </TableHead>
              <TableHead className="text-gray-700 font-medium">Status</TableHead>
              <TableHead className="text-gray-700 font-medium">
                Payment Date
              </TableHead>
              <TableHead className="text-gray-700 font-medium">
                Expiry Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((txn, i) => (
                <TableRow
                  key={`${txn.id}-${txn.plan}-${startIndex + i}`}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <TableCell className="text-gray-900 font-medium">
                    {txn.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {txn.userName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {txn.userEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{txn.plan}</TableCell>
                  <TableCell className="text-gray-900 text-right font-medium">
                    {txn.amount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md bg-green-100 text-green-700 border-0 font-medium",
                      )}
                    >
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {txn.paymentDate}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {txn.expiryDate}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {startIndex + 1}-{endIndex} of {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-8 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
