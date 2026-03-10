import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            {/* Full-width content — navigation is handled by the dashboard's top nav tabs */}
            <main className="w-full overflow-x-hidden overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
