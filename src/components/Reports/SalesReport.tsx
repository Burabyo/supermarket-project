import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, DollarSign, CreditCard, Smartphone, Phone, AlertTriangle } from 'lucide-react';
import { salesAPI } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SalesReport: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    cashier_id: ''
  });
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_transactions: 0,
    cash_sales: 0,
    card_sales: 0,
    debt_sales: 0,
    momo_sales: 0,
    airtel_money_sales: 0
  });

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll(filters);
      const salesData = response.data.data;
      setSales(salesData);
      
      // Calculate summary
      const newSummary = salesData.reduce((acc: any, sale: any) => {
        acc.total_sales += sale.total;
        acc.total_transactions += 1;
        acc[`${sale.payment_method}_sales`] += sale.total;
        return acc;
      }, {
        total_sales: 0,
        total_transactions: 0,
        cash_sales: 0,
        card_sales: 0,
        debt_sales: 0,
        momo_sales: 0,
        airtel_money_sales: 0
      });
      
      setSummary(newSummary);
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    const headers = ['Receipt Number', 'Date', 'Cashier', 'Payment Method', 'Customer', 'Total'];
    const csvData = sales.map(sale => [
      sale.receipt_number,
      new Date(sale.created_at).toLocaleString(),
      sale.cashier_name,
      sale.payment_method.replace('_', ' '),
      sale.customer_name || 'N/A',
      sale.total
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${filters.start_date}-to-${filters.end_date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return CreditCard;
      case 'cash': return DollarSign;
      case 'momo': return Smartphone;
      case 'airtel_money': return Phone;
      case 'debt': return AlertTriangle;
      default: return DollarSign;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return 'Card';
      case 'cash': return 'Cash';
      case 'momo': return 'MTN MoMo';
      case 'airtel_money': return 'Airtel Money';
      case 'debt': return 'Debt';
      default: return method;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={filters.payment_method}
              onChange={(e) => handleFilterChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="debt">Debt</option>
              <option value="momo">MTN MoMo</option>
              <option value="airtel_money">Airtel Money</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadSales}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.total_sales)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-xl font-bold text-blue-600">{summary.total_transactions}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {[
          { key: 'cash_sales', label: 'Cash', icon: DollarSign },
          { key: 'card_sales', label: 'Card', icon: CreditCard },
          { key: 'momo_sales', label: 'MoMo', icon: Smartphone },
          { key: 'airtel_money_sales', label: 'Airtel', icon: Phone }
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(summary[key as keyof typeof summary] as number)}
                </p>
              </div>
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No sales found for the selected period
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const Icon = getPaymentMethodIcon(sale.payment_method);
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sale.receipt_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(sale.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sale.cashier_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {getPaymentMethodLabel(sale.payment_method)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.customer_name || 'N/A'}
                          {sale.customer_phone && (
                            <div className="text-xs text-gray-500">{sale.customer_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(sale.total)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;