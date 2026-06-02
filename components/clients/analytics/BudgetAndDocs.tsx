'use client';

import { Download, FileText, Receipt, Wallet, ArrowDownCircle } from 'lucide-react';

const BudgetAndDocs = ({ data }: { data: any }) => {
  if (!data) return null;

  const { paidAmount = 0, remainingAmount = 0, totalBudget = 0, docs = [] } = data;

  const findDoc = (pattern: string) => docs.find((d: any) => d.title.toLowerCase().includes(pattern.toLowerCase()));
  const scopeDoc = findDoc('scope');
  const invoiceDoc = findDoc('invoice');
  const paymentHistoryDocs = docs.filter((d: any) => d.title.toLowerCase().includes('payment history'));

  const openDoc = (url: string) => window.open(url, '_blank');
  const circumference = +(2 * Math.PI * 80).toFixed(1);

  const paidPercentage = totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 0;
  const remainingPercentage = 100 - paidPercentage;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-6 mt-10">
      {/* Left Cards */}
      <div className="col-span-1 h-full flex flex-col gap-4">
        {/* Scope of Work */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex justify-between items-center flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Scope of Work</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scopeDoc ? `Uploaded ${new Date(scopeDoc.createdAt).toLocaleDateString()}` : `Not generated yet`}
              </p>
            </div>
          </div>
          {scopeDoc
            ? <Download className="w-6 h-6 text-purple-600 dark:text-purple-300 cursor-pointer hover:scale-110 transition-transform" onClick={() => openDoc(scopeDoc.fileUrl)} />
            : <FileText className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          }
        </div>

        {/* Payment History */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex justify-between items-center flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Payment History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paymentHistoryDocs.length > 0 ? `${paymentHistoryDocs.length} receipt${paymentHistoryDocs.length > 1 ? 's' : ''}` : `No receipts yet`}
              </p>
            </div>
          </div>
          {paymentHistoryDocs.length > 0 ? (
            <div className="relative group">
              <ArrowDownCircle className="w-6 h-6 text-blue-600 dark:text-blue-300 cursor-pointer hover:scale-110 transition-transform" />
              <div className="absolute right-0 top-8 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2">
                  {paymentHistoryDocs.map((doc: any) => (
                    <button key={doc.id} onClick={() => openDoc(doc.fileUrl)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Receipt className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          )}
        </div>

        {/* Latest Invoice */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex justify-between items-center flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Latest Invoice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{invoiceDoc ? invoiceDoc.title : "Not generated yet"}</p>
            </div>
          </div>
          {invoiceDoc
            ? <Download className="w-6 h-6 text-green-600 dark:text-green-300 cursor-pointer hover:scale-110 transition-transform" onClick={() => openDoc(invoiceDoc.fileUrl)} />
            : <Wallet className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          }
        </div>
      </div>

      {/* Right — Budget Overview */}
      <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="space-y-5 w-1/2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Overview</h2>
          <div className="space-y-3">
            <div className="bg-purple-600 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Paid amount</p>
                <h3 className="text-2xl font-bold">₹{paidAmount.toLocaleString()}</h3>
              </div>
              <span className="bg-white rounded-full bg-opacity-80 p-1">
                <Receipt className="w-6 h-6 text-purple-600" />
              </span>
            </div>
            <div className="bg-orange-500 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Remaining amount</p>
                <h3 className="text-2xl font-bold">₹{remainingAmount.toLocaleString()}</h3>
              </div>
              <span className="bg-white rounded-full bg-opacity-80 p-1">
                <Wallet className="w-6 h-6 text-orange-500" />
              </span>
            </div>
            <div className="bg-black/90 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Total Budget</p>
                <h3 className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</h3>
              </div>
              <span className="bg-white rounded-full bg-opacity-80 p-1">
                <FileText className="w-6 h-6 text-black/90" />
              </span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" className="dark:stroke-gray-600" />
              <circle
                cx="100" cy="100" r="80" fill="none" stroke="#f97316" strokeWidth="20"
                strokeDasharray={`${(remainingPercentage / 100) * circumference} ${circumference}`}
                strokeLinecap="butt" className="transition-all duration-500 ease-out"
              />
              <circle
                cx="100" cy="100" r="80" fill="none" stroke="#9333ea" strokeWidth="20"
                strokeDasharray={`${(paidPercentage / 100) * circumference} ${circumference}`}
                strokeDashoffset={`${-(remainingPercentage / 100) * circumference}`}
                strokeLinecap="butt" className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{paidPercentage}%</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Paid</span>
            </div>
          </div>
          <div className="ml-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAndDocs;