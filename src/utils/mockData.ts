import { Product, Sale, User, AuditLog } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@supermarket.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@supermarket.com',
    role: 'manager'
  },
  {
    id: '3',
    name: 'Mike Cashier',
    email: 'cashier@supermarket.com',
    role: 'cashier'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Milk 1L',
    barcode: '1234567890123',
    category: 'Dairy',
    price: 3.99,
    stock: 25,
    minStock: 10,
    expiryDate: '2025-02-15',
    supplier: 'Fresh Farms',
    description: 'Premium organic whole milk',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    barcode: '2345678901234',
    category: 'Bakery',
    price: 2.49,
    stock: 8,
    minStock: 15,
    expiryDate: '2025-01-25',
    supplier: 'City Bakery',
    description: 'Fresh whole wheat bread loaf',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bananas 1kg',
    barcode: '3456789012345',
    category: 'Produce',
    price: 1.99,
    stock: 50,
    minStock: 20,
    expiryDate: '2025-01-20',
    supplier: 'Tropical Fruits',
    description: 'Fresh yellow bananas',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Chicken Breast 500g',
    barcode: '4567890123456',
    category: 'Meat',
    price: 8.99,
    stock: 30,
    minStock: 10,
    expiryDate: '2025-01-22',
    supplier: 'Premium Poultry',
    description: 'Fresh chicken breast fillets',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    name: 'Pasta Sauce 500ml',
    barcode: '5678901234567',
    category: 'Pantry',
    price: 2.99,
    stock: 40,
    minStock: 12,
    expiryDate: '2025-08-15',
    supplier: 'Italian Foods',
    description: 'Traditional marinara pasta sauce',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    items: [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[2], quantity: 1 }
    ],
    total: 9.97,
    cashierId: '3',
    cashierName: 'Mike Cashier',
    timestamp: '2025-01-18T10:30:00Z',
    paymentMethod: 'card',
    receiptNumber: 'RCP-001'
  },
  {
    id: '2',
    items: [
      { product: mockProducts[1], quantity: 1 },
      { product: mockProducts[4], quantity: 2 }
    ],
    total: 8.47,
    cashierId: '3',
    cashierName: 'Mike Cashier',
    timestamp: '2025-01-18T11:15:00Z',
    paymentMethod: 'cash',
    receiptNumber: 'RCP-002'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Admin',
    action: 'PRODUCT_CREATED',
    details: 'Created new product: Organic Milk 1L',
    timestamp: '2025-01-18T09:00:00Z'
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Cashier',
    action: 'SALE_COMPLETED',
    details: 'Completed sale #RCP-001 for $9.97',
    timestamp: '2025-01-18T10:30:00Z'
  },
  {
    id: '3',
    userId: '2',
    userName: 'Sarah Manager',
    action: 'INVENTORY_UPDATED',
    details: 'Updated stock for Whole Wheat Bread',
    timestamp: '2025-01-18T14:20:00Z'
  }
];