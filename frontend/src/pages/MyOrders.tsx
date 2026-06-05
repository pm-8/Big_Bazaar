import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  processing: { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  shipped:    { bg: 'bg-[#889063]/15', text: 'text-[#354024]', dot: 'bg-[#889063]' },
  delivered:  { bg: 'bg-[#354024]/10', text: 'text-[#354024]', dot: 'bg-[#354024]' },
  cancelled:  { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/me');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-[3px] border-[#354024] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#889063] mb-1">History</p>
        <h1 className="text-4xl font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Orders
        </h1>
        <div className="mt-3 w-14 h-1 bg-gradient-to-r from-[#354024] to-[#889063] rounded-full" />
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-4 text-[#889063] bg-white/60 rounded-2xl border border-[#CFBB99]/60">
          <span className="text-5xl">📦</span>
          <p className="text-sm font-semibold tracking-[0.2em] uppercase">No orders placed yet</p>
          <p className="text-xs text-[#CFBB99] font-medium">Your order history will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => {
            const status = order.status?.toLowerCase() ?? 'pending';
            const cfg = statusConfig[status] ?? { bg: 'bg-[#E5D7C4]', text: 'text-[#4C3D19]', dot: 'bg-[#889063]' };

            return (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#CFBB99]/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#354024] via-[#889063] to-[#CFBB99]" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063] mb-0.5">Order ID</p>
                      <h3 className="text-2xl font-bold text-[#4C3D19]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        #{order.id}
                      </h3>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-3.5 py-2 rounded-full ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#CFBB99]/50">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063] mb-1">Date Placed</p>
                      <p className="text-sm font-semibold text-[#4C3D19]">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063] mb-1">Total</p>
                      <p className="text-xl font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        ₹{Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063] mb-1">Ship To</p>
                      <p className="text-sm font-semibold text-[#4C3D19] truncate">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}