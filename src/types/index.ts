export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  avatar?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  expiry_date: string;
  supplier: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  cashier_id: string;
  cashier_name: string;
  timestamp: string;
  payment_method: 'cash' | 'card' | 'debt' | 'momo' | 'airtel_money';
  receipt_number: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  expiringItems: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: string;
  new_values?: string;
  created_at: string;
}