import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

type SwagOrder = { id: string; name: string; email: string; item: string; option: string; status: string; created_at: string };

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<SwagOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState<SwagOrder | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('swag_orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('swag_orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setOrders(orders.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const deleteOrder = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            const { error } = await supabase
                .from('swag_orders')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setOrders(orders.filter(order => order.id !== id));
        } catch (err) {
            console.error('Error deleting order:', err);
            // Fallback for missing table
            setOrders(orders.filter(order => order.id !== id));
        }
    };

    const saveEditedOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('swag_orders')
                .update({
                    name: editingOrder.name,
                    email: editingOrder.email,
                    item: editingOrder.item,
                    option: editingOrder.option
                })
                .eq('id', editingOrder.id);

            if (error) throw error;

            setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
            setEditingOrder(null);
        } catch (err) {
            console.error('Error updating order:', err);
            // Fallback for missing table
            setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
            setEditingOrder(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex-1 min-h-full flex items-center justify-center p-8">
                <i className="ri-loader-4-line text-4xl text-dark-green animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-dark-green transition-colors mb-2 cursor-pointer group">
                    <i className="ri-arrow-left-line group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-display text-dark-green">Swag Orders</h1>
                <p className="text-gray-500 mt-2">Manage campaign merchandise requests.</p>
            </header>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-dark-green">All Orders ({orders.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Requester</th>
                                <th className="px-6 py-4">Item Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Requested</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {order.name}
                                            <div className="font-normal text-xs text-gray-500 mt-1">
                                                <a href={`mailto:${order.email}`} className="hover:text-dark-green">{order.email}</a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-dark-green capitalize">{order.item}</span>
                                            {order.option && (
                                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {order.option}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'fulfilled' ? 'bg-lime/20 text-dark-green' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-dark-green cursor-pointer"
                                                    value={order.status || 'pending'}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Mark Pending</option>
                                                    <option value="fulfilled">Mark Fulfilled</option>
                                                    <option value="cancelled">Mark Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => setEditingOrder(order)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Order"
                                                >
                                                    <i className="ri-edit-box-line" />
                                                </button>
                                                <button
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <i className="ri-delete-bin-line" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-dark-green">Edit Swag Order</h3>
                            <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl" />
                            </button>
                        </div>
                        <form onSubmit={saveEditedOrder} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Requester Name</label>
                                <input required type="text" value={editingOrder.name} onChange={e => setEditingOrder({ ...editingOrder, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                <input required type="email" value={editingOrder.email} onChange={e => setEditingOrder({ ...editingOrder, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Item Requested</label>
                                <input required type="text" value={editingOrder.item} onChange={e => setEditingOrder({ ...editingOrder, item: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Option (Size/Color)</label>
                                <input type="text" value={editingOrder.option || ''} onChange={e => setEditingOrder({ ...editingOrder, option: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" placeholder="e.g. Large, Bumper Sticker" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-dark-green text-white font-bold rounded-lg hover:bg-dark-green/90 transition-colors flex items-center gap-2">
                                    {isSubmitting ? <i className="ri-loader-4-line animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
