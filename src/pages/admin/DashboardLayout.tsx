import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    const handleLogout = async () => {
        sessionStorage.removeItem('temp_admin_bypass');
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard Data', path: '/admin/dashboard', icon: 'ri-dashboard-3-line' },
        { name: 'Volunteers', path: '/admin/volunteers', icon: 'ri-team-line' },
        { name: 'Swag Orders', path: '/admin/orders', icon: 'ri-shopping-cart-2-line' },
        { name: 'Donations', path: '/admin/donations', icon: 'ri-hand-coin-line' },
    ];

    return (
        <div className="min-h-screen bg-[#f7f9f4] flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-dark-green flex flex-col text-white shadow-xl flex-shrink-0 z-10">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-display text-lime">Mel Keyton</h1>
                    <p className="text-xs text-white/60 tracking-widest uppercase mt-1">Campaign Backoffice</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${isActive
                                    ? 'bg-lime text-dark-green'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <i className={`${item.icon} text-lg`} />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <i className="ri-user-star-line text-lime" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">Staff Admin</p>
                            <p className="text-xs text-white/50 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <i className="ri-logout-box-r-line" />
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
