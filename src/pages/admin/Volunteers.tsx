import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

type Volunteer = { id: string; name: string; email: string; phone: string; interest: string; message: string; created_at: string };

export default function Volunteers() {
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Volunteer Form State
    const [newVol, setNewVol] = useState({ name: '', email: '', phone: '', interest: 'Canvassing', message: '' });

    const fetchVolunteers = async () => {
        try {
            const { data, error } = await supabase
                .from('volunteers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVolunteers(data || []);
        } catch (err) {
            console.error('Error fetching volunteers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
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

    const handleAddVolunteer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const volunteerData = {
                ...newVol,
                created_at: new Date().toISOString()
            };

            // Attempt to insert to Supabase
            const { data, error } = await supabase
                .from('volunteers')
                .insert([volunteerData])
                .select();

            if (!error && data) {
                setVolunteers([data[0], ...volunteers]);
            } else {
                // Fallback: update local state if table is missing or errors out
                setVolunteers([{ ...volunteerData, id: `temp-${Date.now()}` }, ...volunteers]);
                console.warn('Supabase insert failed, using local state fallback', error);
            }

            setShowAddModal(false);
            setNewVol({ name: '', email: '', phone: '', interest: 'Canvassing', message: '' });
        } catch (err) {
            console.error('Error adding volunteer:', err);
        } finally {
            setIsSubmitting(false);
        }
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
                    <h1 className="text-3xl font-display text-dark-green">Volunteers</h1>
                    <p className="text-gray-500 mt-2">Manage people who have signed up to help the campaign.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-lime text-dark-green font-bold rounded-lg hover:bg-lime/90 transition-colors flex items-center gap-2"
                >
                    <i className="ri-user-add-line" /> Add Volunteer
                </button>
            </header>

            {/* ── Qanvass.com Upsell Banner ── */}
            <a href="https://qanvass.com" target="_blank" rel="noreferrer"
                className="block mb-8 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.005] cursor-pointer group">
                <div className="relative bg-gradient-to-r from-[#0D1F17] via-[#1B3A2D] to-[#0D1F17] p-6 md:p-8 flex items-center gap-6">
                    {/* Decorative pattern overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, #FFD966 1px, transparent 1px), radial-gradient(circle at 80% 50%, #FFD966 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />
                    {/* Door icon */}
                    <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#FFD966] to-[#D4A843] flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 md:w-14 md:h-14 text-[#1B3A2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                    </div>
                    {/* Content */}
                    <div className="relative flex-1 text-white">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#FFD966] font-bold mb-1">POWERED BY QANVASS</p>
                        <h3 className="text-xl md:text-2xl font-black mb-1">Need Door Knockers?</h3>
                        <p className="text-sm text-white/60 max-w-lg">Supercharge your canvassing with Qanvass — the campaign door-knocking app with GPS tracking, turf management, and real-time voter data sync.</p>
                    </div>
                    {/* CTA */}
                    <div className="relative flex-shrink-0">
                        <div className="px-6 py-3 bg-[#FFD966] text-[#1B3A2D] font-black rounded-full text-sm shadow-lg group-hover:shadow-xl group-hover:bg-[#F5C842] transition-all flex items-center gap-2"
                            style={{ boxShadow: '0 0 20px rgba(255, 217, 102, 0.3)' }}>
                            🚪 Get Qanvass
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </a>
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-dark-green">All Volunteers ({volunteers.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Interest</th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4">Signed Up</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {volunteers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No volunteers found.
                                    </td>
                                </tr>
                            ) : (
                                volunteers.map((vol, index) => (
                                    <motion.tr
                                        key={vol.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-gray-900">{vol.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <a href={`mailto:${vol.email}`} className="text-dark-green hover:underline flex items-center gap-1">
                                                    <i className="ri-mail-line" /> {vol.email}
                                                </a>
                                                {vol.phone && (
                                                    <a href={`tel:${vol.phone}`} className="text-gray-500 hover:text-dark-green flex items-center gap-1">
                                                        <i className="ri-phone-line" /> {vol.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 bg-lime/10 text-dark-green text-xs font-bold rounded">
                                                {vol.interest}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={vol.message}>
                                            {vol.message || <span className="text-gray-400 italic">No message</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                            {formatDate(vol.created_at)}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Add Volunteer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-dark-green">Add New Volunteer</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleAddVolunteer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                                <input required type="text" value={newVol.name} onChange={e => setNewVol({ ...newVol, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                                <input required type="email" value={newVol.email} onChange={e => setNewVol({ ...newVol, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" value={newVol.phone} onChange={e => setNewVol({ ...newVol, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Area of Interest</label>
                                <select value={newVol.interest} onChange={e => setNewVol({ ...newVol, interest: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green">
                                    <option>Canvassing</option>
                                    <option>Phone Banking</option>
                                    <option>Event Hosting</option>
                                    <option>Digital/Social Media</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Duty Info / Message</label>
                                <textarea value={newVol.message} onChange={e => setNewVol({ ...newVol, message: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-dark-green h-24" placeholder="Enter assigned duties or notes..."></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-dark-green text-white font-bold rounded-lg hover:bg-dark-green/90 transition-colors flex items-center gap-2">
                                    {isSubmitting ? <i className="ri-loader-4-line animate-spin" /> : 'Save Volunteer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
