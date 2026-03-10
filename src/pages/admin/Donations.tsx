import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

type Donation = { id: string; name: string; email: string; amount_cents: number; status: string; created_at: string };

export default function Donations() {
    const navigate = useNavigate();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalDonated, setTotalDonated] = useState(0);

    const fetchDonations = async () => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            let fetched = data || [];

            // Manually inject the Wheelcall LLC in-kind donation
            const inKindDonation: Donation = {
                id: 'manually-injected-quasar',
                name: 'Wheelcall LLC (Quasar Alexander) - CEO',
                email: 'quasar@wheelcall.com',
                amount_cents: 55000,
                status: 'completed (in-kind)',
                created_at: new Date().toISOString()
            };

            fetched = [inKindDonation, ...fetched];
            setDonations(fetched);

            // Calculate total from completed donations (including in-kind)
            const total = fetched
                .filter(d => d.status.includes('completed') || d.status === 'succeeded')
                .reduce((sum, d) => sum + d.amount_cents, 0);
            setTotalDonated(total);
        } catch (err) {
            console.error('Error fetching donations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

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
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-dark-green transition-colors mb-2 cursor-pointer group">
                        <i className="ri-arrow-left-line group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-display text-dark-green">Donations History</h1>
                    <p className="text-gray-500 mt-2">Track contributors who have chipped in to the campaign.</p>
                </div>
                <div className="bg-lime/20 border border-lime px-6 py-4 rounded-xl text-right">
                    <p className="text-sm font-bold text-dark-green/70 uppercase tracking-widest mb-1">Total Raised</p>
                    <p className="text-3xl font-display text-dark-green">${(totalDonated / 100).toFixed(2)}</p>
                </div>
            </header>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-dark-green">All Donations ({donations.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Donor</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {donations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        No donations found.
                                    </td>
                                </tr>
                            ) : (
                                donations.map((donation, index) => (
                                    <motion.tr
                                        key={donation.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {donation.name}
                                            <div className="font-normal text-xs text-gray-500 mt-1">
                                                <a href={`mailto:${donation.email}`} className="hover:text-dark-green">{donation.email}</a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-dark-green text-lg">
                                                ${(donation.amount_cents / 100).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded uppercase ${['completed', 'succeeded', 'paid'].includes(donation.status?.toLowerCase())
                                                ? 'bg-lime/20 text-dark-green'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {donation.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                            {formatDate(donation.created_at)}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
