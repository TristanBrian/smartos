import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, PieChart, FileText, Calendar, Printer } from 'lucide-react';

export default function ReportsBI({ sales, products, activeTenant }) {
  const [dateRange, setDateRange] = useState('TODAY'); // TODAY, 7DAYS, 30DAYS

  // Metrics calculation
  const totalSalesCount = sales.length;
  const grossSalesCents = sales.reduce((sum, s) => sum + s.subtotalCents, 0);
  const totalDiscountCents = sales.reduce((sum, s) => sum + s.discountCents, 0);
  const netSalesCents = sales.reduce((sum, s) => sum + s.grandTotalCents, 0);
  const totalTaxCents = sales.reduce((sum, s) => sum + s.taxCents, 0);

  // Stock Valuation
  const totalCostValuationCents = products.reduce((sum, p) => sum + (p.stockOnHand * p.costPriceCents), 0);
  const totalRetailValuationCents = products.reduce((sum, p) => sum + (p.stockOnHand * p.sellPriceCents), 0);
  const totalPotentialMarginCents = totalRetailValuationCents - totalCostValuationCents;

  // Payment Breakdown
  const mpesaTotalCents = sales.filter(s => s.paymentMethod.startsWith('MPESA')).reduce((sum, s) => sum + s.grandTotalCents, 0);
  const cashTotalCents = sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.grandTotalCents, 0);

  const handleExportCsv = () => {
    const csvRows = [
      ['Receipt Number', 'Timestamp', 'Cashier', 'Subtotal (KSh)', 'Discount (KSh)', 'Grand Total (KSh)', 'Payment Method', 'eTIMS Status'],
      ...sales.map(s => [
        s.receiptNumber,
        new Date(s.timestamp).toLocaleString(),
        s.cashierName,
        (s.subtotalCents / 100).toFixed(2),
        (s.discountCents / 100).toFixed(2),
        (s.grandTotalCents / 100).toFixed(2),
        s.paymentMethod,
        s.etimsStatus
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BiasharaOS_Sales_Report_${activeTenant.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 bi-report-print">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> Business Intelligence & Executive Summary ({activeTenant.name})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time profit margins, stock valuation, payment rail mix, and KRA eTIMS tax reporting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#121824] p-1 rounded-xl border border-[#2A364F]">
            {['TODAY', '7DAYS', '30DAYS'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dateRange === r ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'TODAY' ? 'Today' : r === '7DAYS' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-400" /> Print Executive Summary
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <div className="text-xs text-slate-400 font-medium">Net Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 font-display mt-1">
            KSh {(netSalesCents / 100).toLocaleString('en-KE')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{totalSalesCount} Completed Transactions</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <div className="text-xs text-slate-400 font-medium">M-Pesa Revenue Share</div>
          <div className="text-2xl font-bold text-cyan-400 font-display mt-1">
            KSh {(mpesaTotalCents / 100).toLocaleString('en-KE')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{Math.round((mpesaTotalCents / (netSalesCents || 1)) * 100)}% of total sales</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <div className="text-xs text-slate-400 font-medium">Stock Valuation at Cost</div>
          <div className="text-2xl font-bold text-amber-400 font-display mt-1">
            KSh {(totalCostValuationCents / 100).toLocaleString('en-KE')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Capital invested in physical stock</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-indigo-500/30">
          <div className="text-xs text-slate-400 font-medium">Potential Retail Margin</div>
          <div className="text-2xl font-bold text-indigo-400 font-display mt-1">
            KSh {(totalPotentialMarginCents / 100).toLocaleString('en-KE')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Retail Value: KSh {(totalRetailValuationCents / 100).toLocaleString()}</div>
        </div>
      </div>

      {/* Detailed Revenue & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue & Tax Summary
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between p-2.5 bg-[#121824] rounded-xl border border-[#2A364F]">
              <span>Gross Sales (Pre-discount):</span>
              <span className="font-semibold text-slate-100">KSh {(grossSalesCents / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#121824] rounded-xl border border-[#2A364F]">
              <span>Discounts Granted:</span>
              <span className="font-semibold text-rose-400">- KSh {(totalDiscountCents / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#121824] rounded-xl border border-[#2A364F]">
              <span>KRA VAT Collected (16%):</span>
              <span className="font-semibold text-emerald-400">KSh {(totalTaxCents / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" /> Payment Rail Channel Mix
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>M-Pesa Express & Paybill ({Math.round((mpesaTotalCents / (netSalesCents || 1)) * 100)}%)</span>
                <span className="font-bold text-emerald-400">KSh {(mpesaTotalCents / 100).toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-[#121824] rounded-full overflow-hidden border border-[#2A364F]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.round((mpesaTotalCents / (netSalesCents || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cash Payments ({Math.round((cashTotalCents / (netSalesCents || 1)) * 100)}%)</span>
                <span className="font-bold text-cyan-400">KSh {(cashTotalCents / 100).toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-[#121824] rounded-full overflow-hidden border border-[#2A364F]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                  style={{ width: `${Math.round((cashTotalCents / (netSalesCents || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
