import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

type Volunteer = { id: string; name: string; email: string; phone: string; interest: string; message: string; created_at: string };
type SwagOrder = { id: string; name: string; email: string; item: string; option: string; status: string; created_at: string };
type Donation = { id: string; name: string; email: string; amount_cents: number; status: string; created_at: string };

export default function Dashboard() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [orders, setOrders] = useState<SwagOrder[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [vols, ords, dons] = await Promise.all([
                supabase.from('volunteers').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('swag_orders').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(5),
            ]);

            setVolunteers(vols.data || []);
            setOrders(ords.data || []);
            setDonations(dons.data || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 min-h-full flex items-center justify-center">
                <i className="ri-loader-4-line text-4xl text-dark-green animate-spin" />
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display text-dark-green mb-2">Campaign Overview</h1>
                    <p className="text-gray-500">Real-time metrics from the District 28 campaign trail.</p>
                </div>
                <button onClick={fetchDashboardData} className="text-sm font-bold text-dark-green hover:text-lime transition-colors flex items-center gap-2">
                    <i className="ri-refresh-line" /> Refresh Data
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime/20 text-dark-green rounded-xl flex items-center justify-center text-xl">
                        <i className="ri-team-fill" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">New Volunteers</p>
                        <p className="text-3xl font-display text-dark-green">{volunteers.length}+</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-dark-green/10 text-dark-green rounded-xl flex items-center justify-center text-xl">
                        <i className="ri-shirt-fill" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Recent Orders</p>
                        <p className="text-3xl font-display text-dark-green">{orders.length}</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-dark-green p-6 rounded-2xl shadow-sm border border-dark-green flex items-center gap-4">
                    <div className="w-12 h-12 bg-lime/20 text-lime rounded-xl flex items-center justify-center text-xl">
                        <i className="ri-money-dollar-circle-fill" />
                    </div>
                    <div>
                        <p className="text-sm text-white/70 font-medium tracking-wide uppercase">Recent Donations</p>
                        <p className="text-3xl font-display text-lime">{donations.length}</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Volunteers */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-dark-green">Recent Volunteers</h2>
                        <i className="ri-arrow-right-line text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-100">
                        {volunteers.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">No volunteers yet.</p>
                        ) : (
                            volunteers.map((vol) => (
                                <div key={vol.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900">{vol.name}</h3>
                                        <span className="text-xs text-gray-400">{formatDate(vol.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2"><i className="ri-mail-line mr-1 text-gray-400" /> {vol.email} {vol.phone && <><span className="mx-2 text-gray-300">|</span> <i className="ri-phone-line mr-1 text-gray-400" /> {vol.phone}</>}</p>
                                    <span className="inline-block px-2 py-1 bg-lime/10 text-dark-green text-xs font-bold rounded">Interest: {vol.interest}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Recent Orders */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-dark-green">Recent Swag Orders</h2>
                        <i className="ri-arrow-right-line text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">No orders yet.</p>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900">{order.name}</h3>
                                        <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2"><i className="ri-mail-line mr-1 text-gray-400" /> {order.email}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-dark-green">{order.item} <span className="text-gray-400 ml-1">({order.option})</span></span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-lime/20 text-dark-green'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
