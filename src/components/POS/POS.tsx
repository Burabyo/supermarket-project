import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, Receipt, CreditCard, DollarSign, Smartphone, Phone } from 'lucide-react';
import { Product, CartItem, Sale } from '../../types';
import { productsAPI, salesAPI } from '../../services/api';
import { formatCurrency, generateReceiptNumber } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const POS: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt' | 'momo' | 'airtel_money'>('card');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Cannot add more items than available stock!');
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      toast.error('Cannot add more items than available stock!');
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    if (paymentMethod === 'debt' && (!customerInfo.name || !customerInfo.phone)) {
      toast.error('Customer name and phone are required for debt payments');
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        customer_name: customerInfo.name || null,
        customer_phone: customerInfo.phone || null,
        notes: paymentMethod === 'debt' ? 'Debt payment - follow up required' : null
      };

      const response = await salesAPI.create(saleData);
      const saleResult = response.data.data;

      // Create sale object for receipt
      const sale = {
        id: saleResult.id,
        receipt_number: saleResult.receipt_number,
        total: saleResult.total,
        items: cart,
        cashier_name: user!.name,
        timestamp: new Date().toISOString(),
        payment_method: paymentMethod,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone
      };

      setLastSale(sale);
      setShowReceipt(true);
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      
      // Reload products to update stock
      await loadProducts();
      
      toast.success('Sale completed successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to process sale';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const paymentMethods = [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'cash', label: 'Cash', icon: DollarSign },
    { id: 'debt', label: 'Debt', icon: Receipt },
    { id: 'momo', label: 'MTN MoMo', icon: Smartphone },
    { id: 'airtel_money', label: 'Airtel Money', icon: Phone }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      {product.stock <= 0 && (
                        <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mt-1">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Cart ({cart.length})</h2>
          </div>

          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-500">{formatCurrency(item.product.price)} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right ml-4">
                  <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Cart is empty
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-sm ${
                            paymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(paymentMethod === 'debt' || paymentMethod === 'momo' || paymentMethod === 'airtel_money') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name {paymentMethod === 'debt' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number {paymentMethod === 'debt' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={processSale}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Receipt className="w-5 h-5" />
                  <span>{loading ? 'Processing...' : 'Process Sale'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
                <p className="text-gray-600">Transaction Complete</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt #:</span>
                  <span className="font-medium">{lastSale.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(lastSale.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cashier:</span>
                  <span className="font-medium">{lastSale.cashier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium capitalize">{lastSale.payment_method.replace('_', ' ')}</span>
                </div>
                {lastSale.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{lastSale.customer_name}</span>
                  </div>
                )}
                {lastSale.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{lastSale.customer_phone}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <div className="space-y-2">
                  {lastSale.items.map((item: CartItem, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(lastSale.total)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={printReceipt}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;