import React, { useState, useEffect } from 'react';
import { DollarSign, Package, AlertTriangle, TrendingUp, Calendar, Users, CreditCard, Smartphone, Phone } from 'lucide-react';
import StatsCard from './StatsCard';
import { DashboardStats } from '../../types';
import { dashboardAPI, salesAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalProducts: 0,
    lowStockItems: 0,
    expiringItems: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0
  });

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [salesByPayment, setSalesByPayment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data
      const [
        statsResponse,
        recentSalesResponse,
        lowStockResponse,
        expiringResponse,
        dailySummaryResponse,
        salesByPaymentResponse
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentSales(5),
        dashboardAPI.getLowStock(),
        dashboardAPI.getExpiring(),
        salesAPI.getDailySummary(),
        dashboardAPI.getSalesByPayment(30)
      ]);

      setStats(statsResponse.data.data);
      setRecentSales(recentSalesResponse.data.data);
      setLowStockProducts(lowStockResponse.data.data);
      setExpiringProducts(expiringResponse.data.data);
      setDailySummary(dailySummaryResponse.data.data);
      setSalesByPayment(salesByPaymentResponse.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sales"
          value={formatCurrency(stats.totalSales)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringItems}
          icon={TrendingUp}
          color="red"
        />
      </div>

      {/* Sales Overview and Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold">{formatCurrency(stats.todaySales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold">{formatCurrency(stats.weekSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">{formatCurrency(stats.monthSales)}</span>
            </div>
          </div>
        </div>

        {/* Today's Sales by Payment Method */}
        {dailySummary && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Payment Methods</h3>
            <div className="space-y-3">
              {[
                { method: 'cash', amount: dailySummary.cash_sales },
                { method: 'card', amount: dailySummary.card_sales },
                { method: 'momo', amount: dailySummary.momo_sales },
                { method: 'airtel_money', amount: dailySummary.airtel_money_sales },
                { method: 'debt', amount: dailySummary.debt_sales }
              ].filter(item => item.amount > 0).map(item => {
                const Icon = getPaymentMethodIcon(item.method);
                return (
                  <div key={item.method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{getPaymentMethodLabel(item.method)}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.amount)}</span>
                  </div>
                );
              })}
              {dailySummary.total_sales === 0 && (
                <p className="text-gray-500 text-sm">No sales today</p>
              )}
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.stock} left</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Low Stock
                </span>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-gray-500 text-sm">All products are well stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Expiring Products and Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiring Soon</h3>
          <div className="space-y-3">
            {expiringProducts.slice(0, 5).map(product => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Expires: {formatDate(product.expiry_date)}</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  Expiring
                </span>
              </div>
            ))}
            {expiringProducts.length === 0 && (
              <p className="text-gray-500 text-sm">No products expiring soon</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {recentSales.map(sale => (
              <div key={sale.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{sale.receipt_number}</p>
                  <p className="text-sm text-gray-500">
                    {sale.cashier_name} • {new Date(sale.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(sale.total)}</p>
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const Icon = getPaymentMethodIcon(sale.payment_method);
                      return <Icon className="w-3 h-3 text-gray-400" />;
                    })()}
                    <span className="text-xs text-gray-500 capitalize">
                      {getPaymentMethodLabel(sale.payment_method)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-gray-500 text-sm">No recent sales</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Payment Methods Summary */}
      {salesByPayment.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Last 30 Days - Payment Methods</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {salesByPayment.map(payment => {
                const Icon = getPaymentMethodIcon(payment.payment_method);
                return (
                  <div key={payment.payment_method} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(payment.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.count} transactions
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;