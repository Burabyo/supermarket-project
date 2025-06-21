import { User, Product, Sale, AuditLog } from '../types';

export const storage = {
  getUser: (): User | null => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem('currentUser');
  },

  getProducts: (): Product[] => {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  },

  setProducts: (products: Product[]) => {
    localStorage.setItem('products', JSON.stringify(products));
  },

  getSales: (): Sale[] => {
    const sales = localStorage.getItem('sales');
    return sales ? JSON.parse(sales) : [];
  },

  setSales: (sales: Sale[]) => {
    localStorage.setItem('sales', JSON.stringify(sales));
  },

  getAuditLogs: (): AuditLog[] => {
    const logs = localStorage.getItem('auditLogs');
    return logs ? JSON.parse(logs) : [];
  },

  setAuditLogs: (logs: AuditLog[]) => {
    localStorage.setItem('auditLogs', JSON.stringify(logs));
  },

  addAuditLog: (log: Omit<AuditLog, 'id'>) => {
    const logs = storage.getAuditLogs();
    const newLog = {
      ...log,
      id: Date.now().toString()
    };
    logs.unshift(newLog);
    storage.setAuditLogs(logs);
  }
};