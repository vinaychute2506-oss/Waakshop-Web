// WAAK E-Commerce API Service Layer
// Connects storefront components to the WAAK Commerce API (Port 9000)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9000';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('waak_customer_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    async register(payload: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) {
      const data = await request<{ token: string; customer: any }>('/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      localStorage.setItem('waak_customer_token', data.token);
      localStorage.setItem('waak_customer_data', JSON.stringify(data.customer));
      return data;
    },

    async login(payload: { email: string; password: string }) {
      const data = await request<{ token: string; customer: any }>('/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      localStorage.setItem('waak_customer_token', data.token);
      localStorage.setItem('waak_customer_data', JSON.stringify(data.customer));
      return data;
    },

    async me() {
      const data = await request<{ customer: any }>('/auth/customer/me');
      localStorage.setItem('waak_customer_data', JSON.stringify(data.customer));
      return data.customer;
    },

    logout() {
      localStorage.removeItem('waak_customer_token');
      localStorage.removeItem('waak_customer_data');
    },

    getCurrentUser() {
      try {
        const saved = localStorage.getItem('waak_customer_data');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    },
  },

  // Customer Profile & Addresses
  customer: {
    async getProfile() {
      return request<{ customer: any }>('/store/customers/me');
    },
    async updateProfile(payload: { first_name?: string; last_name?: string; phone?: string }) {
      return request<{ customer: any }>('/store/customers/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    async getAddresses() {
      return request<{ addresses: any[] }>('/store/customers/me/addresses');
    },
    async addAddress(address: any) {
      return request<{ address: any }>('/store/customers/me/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
    },
    async deleteAddress(id: string) {
      return request<{ success: boolean }>(`/store/customers/me/addresses/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Products
  products: {
    async list(params?: { category?: string; occasion?: string; sort?: string }) {
      const q = new URLSearchParams();
      if (params?.category) q.append('category', params.category);
      if (params?.occasion) q.append('occasion', params.occasion);
      if (params?.sort) q.append('sort', params.sort);
      return request<{ products: any[]; count: number }>(`/store/products?${q.toString()}`);
    },
    async get(id: string) {
      return request<{ product: any }>(`/store/products/${id}`);
    },
  },

  // Cart
  cart: {
    async createCart() {
      const data = await request<{ cart: any }>('/store/carts', { method: 'POST' });
      localStorage.setItem('waak_backend_cart_id', data.cart.id);
      return data.cart;
    },

    async getCart(cartId?: string) {
      const id = cartId || localStorage.getItem('waak_backend_cart_id');
      if (!id) return this.createCart();
      try {
        const data = await request<{ cart: any }>(`/store/carts/${id}`);
        return data.cart;
      } catch {
        return this.createCart();
      }
    },

    async addItem(cartId: string, productId: string, size: string, quantity = 1) {
      const data = await request<{ cart: any }>(`/store/carts/${cartId}/line-items`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, size, quantity }),
      });
      return data.cart;
    },

    async updateQuantity(cartId: string, lineId: string, quantity: number) {
      const data = await request<{ cart: any }>(`/store/carts/${cartId}/line-items/${lineId}`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      });
      return data.cart;
    },

    async removeItem(cartId: string, lineId: string) {
      const data = await request<{ cart: any }>(`/store/carts/${cartId}/line-items/${lineId}`, {
        method: 'DELETE',
      });
      return data.cart;
    },
  },

  // Checkout & Payments
  checkout: {
    async createCheckout(cartId: string, email: string, shippingAddress: any) {
      return request<{
        order_id: string;
        display_id: string;
        razorpay_order_id: string;
        razorpay_key_id: string;
        amount: number;
        currency: string;
        total: number;
        customer: any;
      }>(`/store/carts/${cartId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ email, shipping_address: shippingAddress }),
      });
    },

    async verifyPayment(orderId: string, razorpayOrderId: string, razorpayPaymentId: string, signature?: string) {
      return request<{ success: boolean; order: any }>('/store/payment/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: signature || 'mock_test_signature',
        }),
      });
    },
  },

  // Orders
  orders: {
    async get(id: string) {
      return request<{ order: any }>(`/store/orders/${id}`);
    },
    async getHistory() {
      return request<{ orders: any[] }>('/store/orders/customer/history');
    },
    async cancel(id: string) {
      return request<{ success: boolean; message: string }>(`/store/orders/${id}/cancel`, {
        method: 'POST',
      });
    },
  },

  // Wishlist
  wishlist: {
    async get() {
      return request<{ wishlist: any[] }>('/store/wishlist');
    },
    async add(productId: string) {
      return request<{ success: boolean }>(`/store/wishlist`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      });
    },
    async remove(productId: string) {
      return request<{ success: boolean }>(`/store/wishlist/${productId}`, {
        method: 'DELETE',
      });
    },
  },

  // Newsletter
  newsletter: {
    async subscribe(email: string, source: string = 'footer') {
      return request<{ success: boolean; message: string; duplicate?: boolean }>('/store/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email, source }),
      });
    },
    async unsubscribe(email: string) {
      return request<{ success: boolean; message: string; updated: boolean }>('/store/newsletter/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  },
};
