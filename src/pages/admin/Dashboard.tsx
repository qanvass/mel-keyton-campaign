import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    Users, DollarSign, ShoppingBag,
    Calendar, Bell, CheckCircle2, RefreshCw,
    ExternalLink, TrendingUp, FileText, Camera,
    MapPin, Scale, Clock, Package, AlertTriangle, ChevronDown, ChevronUp,
    Shield, Target, ChevronRight, Newspaper, Rss, Globe
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

// ── Types ──
type Volunteer = { id: string; name: string; email: string; phone: string; interest: string; message: string; created_at: string };
type SwagOrder = { id: string; name: string; email: string; item: string; option: string; status: string; created_at: string };
type Donation = { id: string; name: string; email: string; amount_cents: number; status: string; created_at: string };
type Invoice = { id: string; amount: number; status: 'pending' | 'overdue'; due_date: string; issued_at: string; paid_at: string | null; payment_method: string; notes: string; created_at: string };
type NewsItem = { title: string; link: string; published: string; snippet: string };

// ── RSS Feed URLs (Google Alerts Atom) ──
const RSS_FEEDS = {
    keyton: 'https://www.google.com/alerts/feeds/12566919281479520878/10724402205772116966',
    opposition: 'https://www.google.com/alerts/feeds/12566919281479520878/3292011947878664262',
};
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

// ── GlassCard Component ──
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white/40 backdrop-blur-md border border-white/20 rounded-[32px] p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/50 ${className}`}>
        {children}
    </div>
);

// ══════════════════════════════════════════════
// ══ GA Ethics CCDR Deadlines (SB 199 – Quarterly)
// ══════════════════════════════════════════════
const getCCDRDeadlines = () => {
    const now = new Date();
    const deadlines = [
        { date: new Date(2026, 3, 1), label: 'PFDS Filing', desc: 'Personal Financial Disclosure Statement — No grace period', grace: null },
        { date: new Date(2026, 3, 30), label: 'Q1 CCDR', desc: 'Covers Jan 1 – Mar 31, 2026', grace: new Date(2026, 4, 7) },
        { date: new Date(2026, 4, 19), label: '🗳️ PRIMARY', desc: 'GA Primary Election — Polls open 7 AM – 7 PM', grace: null },
        { date: new Date(2026, 5, 16), label: 'Primary Runoff', desc: 'If triggered — runoff election day', grace: null },
        { date: new Date(2026, 6, 31), label: 'Q2 CCDR', desc: 'Covers Apr 1 – Jun 30, 2026', grace: new Date(2026, 7, 7) },
        { date: new Date(2026, 9, 20), label: 'Q3 CCDR', desc: 'Covers Jul 1 – Sep 30, 2026', grace: new Date(2026, 9, 27) },
        { date: new Date(2026, 10, 3), label: '🗳️ GENERAL', desc: 'GA General Election Day', grace: null },
        { date: new Date(2027, 0, 31), label: 'Q4 CCDR', desc: 'Covers Oct 1 – Dec 31, 2026', grace: new Date(2027, 1, 8) },
    ];
    return deadlines.map(d => ({
        ...d,
        isPast: now > d.date,
        daysUntil: Math.ceil((d.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        dateStr: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isElection: d.label.includes('🗳️'),
    }));
};

// ══════════════════════════════════════════════
// ══ District 28 Demographics
// ══════════════════════════════════════════════
const districtData = {
    totalPopulation: '~190,000',
    eligibleVoters: '~144,565',
    medianAge: 37.4,
    demographics: [
        { label: 'Black/African American', pct: 54.1, color: '#1B3A2D' },
        { label: 'White', pct: 25.3, color: '#94a3b8' },
        { label: 'Hispanic/Latino', pct: 14.3, color: '#FFD966' },
        { label: 'Other', pct: 6.3, color: '#CBD5E1' },
    ],
    areas: ['South Fulton', 'Douglasville', 'Eastern Douglas Co.', 'Cobb Co. (partial)'],
};

// ══════════════════════════════════════════════
// ══ Keyton Campaign Calendar Events
// ══════════════════════════════════════════════
const keytonEvents = [
    { date: 'Mar 12', label: 'South Fulton Meet & Greet', type: 'event', status: 'Active', url: '/' },
    { date: 'Mar 15', label: 'Douglasville Door-Knock', type: 'canvass', status: 'Prep', url: 'https://qanvass.com' },
    { date: 'Mar 20', label: 'Smyrna Small Biz Tour', type: 'event', status: 'Upcoming', url: '/' },
    { date: 'Mar 25', label: 'Fundraiser — Union City', type: 'fundraise', status: 'Upcoming', url: '/' },
    { date: 'Mar 28', label: 'Mableton Community Meet & Greet', type: 'event', status: 'Upcoming', url: '/' },
    { date: 'Apr 1', label: 'PFDS Filing Deadline', type: 'deadline', status: 'Due', url: 'https://ethics.ga.gov/campaign-finance/' },
    { date: 'Apr 5', label: 'Post-Session Fundraising Blitz', type: 'fundraise', status: 'Upcoming', url: '/' },
    { date: 'Apr 12', label: 'Youth Voter Registration Drive', type: 'canvass', status: 'Upcoming', url: 'https://registertovote.sos.ga.gov/' },
    { date: 'Apr 30', label: 'Q1 CCDR Filing Due', type: 'deadline', status: 'Due', url: 'https://ethics.ga.gov/campaign-finance/' },
    { date: 'May 19', label: '🗳️ PRIMARY ELECTION DAY', type: 'election', status: 'Target', url: 'https://mvp.sos.ga.gov/' },
];

// ══════════════════════════════════════════════
// ══ Opposition Intel: Donzella James (D) – Incumbent SD-28
// ══════════════════════════════════════════════
const oppositionEvents = [
    { date: 'Jan 12 – Apr 2', label: '2026 Legislative Session (Capitol)', type: 'session', intel: 'In Session Daily', url: 'https://www.legis.ga.gov/' },
    { date: 'Jan 28', label: '"Saving Lives Day" — Public Safety Press Conf.', type: 'press', intel: 'Policy Push', url: 'https://www.legis.ga.gov/members/senate' },
    { date: 'Feb 2', label: 'City of Mableton Day at Capitol', type: 'constituent', intel: 'Voter Density', url: 'https://www.legis.ga.gov/' },
    { date: 'Feb 7', label: '"Operation Winter Warmth" — South Fulton', type: 'community', intel: 'Community Build', url: 'https://www.legis.ga.gov/members/senate' },
    { date: 'Feb 10', label: 'HOA/COA/POA Day Press Conference', type: 'press', intel: 'Property Advocacy', url: 'https://www.legis.ga.gov/members/senate' },
    { date: 'Mar 10', label: 'HOA Day @ Capitol', type: 'constituent', intel: 'Constituent Focus', url: 'https://www.legis.ga.gov/' },
    { date: 'Mar 18', label: 'Health Committee Meeting', type: 'committee', intel: 'Policy Push', url: 'https://www.legis.ga.gov/committees/senate' },
    { date: 'Mar 25', label: 'Mableton Community Mtg', type: 'community', intel: 'Voter Density', url: 'https://www.legis.ga.gov/members/senate' },
    { date: 'Recurring', label: 'Health & Human Services Committee (AM)', type: 'committee', intel: 'Standing', url: 'https://www.legis.ga.gov/committees/senate' },
    { date: 'Recurring', label: 'Education Committee Meetings (AM)', type: 'committee', intel: 'Standing', url: 'https://www.legis.ga.gov/committees/senate' },
    { date: 'Post Apr 2', label: 'Sine Die — Fundraising Window Opens', type: 'fundraise', intel: 'Fundraising', url: 'https://ethics.ga.gov/campaign-finance/' },
];

// ══════════════════════════════════════════════
// ══ Swag Inventory
// ══════════════════════════════════════════════
const swagInventory = [
    { item: 'Yard Signs (18x24)', stock: 500, reorderUrl: 'https://www.signs.com/yard-signs/', price: '$2.50/ea', icon: '🪧' },
    { item: 'Campaign Buttons (1")', stock: 1000, reorderUrl: 'https://www.24hourwristbands.com/custom-buttons', price: '$1.99/ea', icon: '📌' },
    { item: 'Bulk Stickers (1000 qty)', stock: 3, reorderUrl: 'https://www.stickergiant.com', price: '$54.80/lot', icon: '🏷️' },
    { item: 'T-Shirts (Keyton D28)', stock: 200, reorderUrl: 'https://www.customink.com', price: '$8.50/ea', icon: '👕' },
];

// ══════════════════════════════════════════════
// ══ MAIN COMPONENT
// ══════════════════════════════════════════════
export default function Dashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [orders, setOrders] = useState<SwagOrder[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [totalDue, setTotalDue] = useState<number>(0);
    const [invoiceCount, setInvoiceCount] = useState<number>(0);
    const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [profilePhoto, setProfilePhoto] = useState<string | null>('/mel keyton.png');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [callTimeSeconds, setCallTimeSeconds] = useState(0);
    const [callTimeRunning, setCallTimeRunning] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
    const [keytonNews, setKeytonNews] = useState<NewsItem[]>([]);
    const [oppositionNews, setOppositionNews] = useState<NewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);

    // ── API: Fetch all dashboard data ──
    const fetchDashboardData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userSessionToken = session?.access_token || '';

            let invTotal = 0;
            let invCount = 0;
            let invList: Invoice[] = [];

            if (userSessionToken) {
                try {
                    const res = await fetch(
                        "https://cvflfjrftnteuzfpeiut.supabase.co/functions/v1/invoices-api",
                        { headers: { Authorization: `Bearer ${userSessionToken}` } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        invList = data.invoices || [];
                        invTotal = data.total_due || 0;
                        invCount = data.count || 0;
                    }
                } catch (err) {
                    console.error("Failed to fetch invoices", err);
                }
            }

            const [vols, ords, dons] = await Promise.all([
                supabase.from('volunteers').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('swag_orders').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(5),
            ]);

            setVolunteers(vols.data || []);
            setOrders(ords.data || []);
            setDonations(dons.data || []);
            setInvoices(invList);
            setTotalDue(invTotal);
            setInvoiceCount(invCount);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── RSS Feed Parser ──
    const fetchNewsFeeds = async () => {
        setNewsLoading(true);
        const parseAtomFeed = (xml: string): NewsItem[] => {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xml, 'text/xml');
                const entries = doc.querySelectorAll('entry');
                const items: NewsItem[] = [];
                entries.forEach((entry) => {
                    const title = entry.querySelector('title')?.textContent || '';
                    const link = entry.querySelector('link')?.getAttribute('href') || '';
                    const published = entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || '';
                    const content = entry.querySelector('content')?.textContent || '';
                    // Strip HTML tags for snippet
                    const div = document.createElement('div');
                    div.innerHTML = content;
                    const snippet = div.textContent?.slice(0, 200) || '';
                    if (title) items.push({ title: title.replace(/<[^>]+>/g, ''), link, published, snippet });
                });
                return items.slice(0, 5);
            } catch { return []; }
        };
        try {
            const [keytonRes, oppRes] = await Promise.allSettled([
                fetch(`${CORS_PROXY}${encodeURIComponent(RSS_FEEDS.keyton)}`),
                fetch(`${CORS_PROXY}${encodeURIComponent(RSS_FEEDS.opposition)}`),
            ]);
            if (keytonRes.status === 'fulfilled' && keytonRes.value.ok) {
                const json = await keytonRes.value.json();
                setKeytonNews(parseAtomFeed(json.contents || ''));
            }
            if (oppRes.status === 'fulfilled' && oppRes.value.ok) {
                const json = await oppRes.value.json();
                setOppositionNews(parseAtomFeed(json.contents || ''));
            }
        } catch (err) {
            console.error('Failed to fetch news feeds:', err);
        } finally {
            setNewsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchNewsFeeds();
        const saved = localStorage.getItem('campaign_profile_photo');
        if (saved) setProfilePhoto(saved);
    }, []);

    // ── Media Call Timer ──
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (callTimeRunning) {
            interval = setInterval(() => setCallTimeSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [callTimeRunning]);

    const formatCallTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ── Photo Upload Handler ──
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const ext = file.name.split('.').pop();
                const fileName = `candidate-profile-${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from('campaign-assets').upload(fileName, file, { upsert: true });
                if (!error) {
                    const { data: urlData } = supabase.storage.from('campaign-assets').getPublicUrl(fileName);
                    if (urlData?.publicUrl) {
                        setProfilePhoto(urlData.publicUrl);
                        localStorage.setItem('campaign_profile_photo', urlData.publicUrl);
                        setUploadingPhoto(false);
                        return;
                    }
                }
            }
            const reader = new FileReader();
            reader.onload = (ev) => { const u = ev.target?.result as string; setProfilePhoto(u); localStorage.setItem('campaign_profile_photo', u); };
            reader.readAsDataURL(file);
        } catch {
            const reader = new FileReader();
            reader.onload = (ev) => { const u = ev.target?.result as string; setProfilePhoto(u); localStorage.setItem('campaign_profile_photo', u); };
            reader.readAsDataURL(file);
        } finally { setUploadingPhoto(false); }
    };

    const formatDate = (ds: string) => new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const chartData = [
        { day: 'S', value: Math.max(volunteers.length * 8, 40) },
        { day: 'M', value: Math.max(orders.length * 15, 120) },
        { day: 'T', value: Math.max(donations.length * 12, 80) },
        { day: 'W', value: 150 },
        { day: 'T', value: Math.max(invoiceCount * 30, 90) },
        { day: 'F', value: 180 },
        { day: 'S', value: 50 },
    ];

    const totalDonationCents = donations.reduce((sum, d) => sum + (d.amount_cents || 0), 0);
    const ccdrDeadlines = getCCDRDeadlines();
    const nextDeadline = ccdrDeadlines.find(d => !d.isPast);

    const navItems = ['Dashboard', 'Fundraising', 'Outreach', 'Volunteers', 'Swag', 'Reports', 'Calendar'];
    const navRoutes: Record<string, string> = {
        'Dashboard': '/admin/dashboard', 'Fundraising': '/admin/donations',
        'Outreach': '/admin/donations', 'Volunteers': '/admin/volunteers', 'Swag': '/admin/orders',
        'Reports': '/admin/donations', 'Calendar': '/admin/dashboard',
    };

    const now = new Date();
    const priorityActions = [
        { text: `Review digital ad copy for Cobb County`, date: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 08:30`, done: invoiceCount === 0 },
        { text: `Meet with major donors for GA-28`, date: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 08:30`, done: volunteers.length === 0 },
        { text: nextDeadline ? `Finalize ${nextDeadline.label} filing` : 'All filings up to date ✓', date: nextDeadline ? nextDeadline.dateStr : '', done: !nextDeadline },
        { text: `Finalize T-shirt order for canvassers (Swag)`, date: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 10:30`, done: orders.length === 0 },
        { text: 'Update voter targeting GA-28 list', date: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 16:30`, done: false },
    ];

    const toggleAccordion = (id: string) => setExpandedAccordion(expandedAccordion === id ? null : id);

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F2E9] bg-gradient-to-br from-[#F5F2E9] via-[#FFF9E6] to-[#F2EADA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-[#FFD966] border-t-transparent animate-spin" />
                    <p className="text-sm font-medium text-slate-500 tracking-wide">Loading Campaign HQ...</p>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#F5F2E9] bg-gradient-to-br from-[#F5F2E9] via-[#FFF9E6] to-[#F2EADA] p-4 md:p-8 text-slate-800"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

            {/* ── Compliance Bar ── */}
            {nextDeadline && (
                <div className="bg-black text-white px-6 md:px-8 py-3 rounded-full mb-6 flex flex-wrap justify-between items-center shadow-xl gap-2">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-[#FFD966] w-5 h-5 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-bold uppercase tracking-tight">Next Ethics Deadline: {nextDeadline.dateStr} ({nextDeadline.label})</span>
                    </div>
                    <div className="text-xs opacity-60 font-mono">{nextDeadline.daysUntil} Days Remaining</div>
                </div>
            )}

            {/* ── Top Nav ── */}
            <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div className="text-2xl font-bold tracking-tight">K4S <span className="font-light text-slate-400">GA-28</span></div>
                <nav className="flex gap-1 bg-black/5 p-1 rounded-full backdrop-blur-sm overflow-x-auto">
                    {navItems.map(item => (
                        <button key={item} onClick={() => { setActiveNav(item); if (item !== 'Dashboard' && item !== 'Calendar') navigate(navRoutes[item]); }}
                            className={`px-4 md:px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${activeNav === item ? 'bg-black text-white shadow-lg' : 'hover:bg-white/50 text-slate-600'}`}>{item}</button>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <button onClick={fetchDashboardData} className="p-2 rounded-full hover:bg-white/50 transition-colors cursor-pointer" title="Refresh"><RefreshCw className="w-5 h-5 opacity-60" /></button>
                    <button className="p-2 rounded-full hover:bg-white/50 transition-colors relative cursor-pointer">
                        <Bell className="w-5 h-5 opacity-60" />
                        {invoiceCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">{invoiceCount}</span>}
                    </button>
                    {/* Qanvass Globe Button */}
                    <a href="https://qanvass.com" target="_blank" rel="noreferrer" title="Qanvass — Campaign Canvassing App"
                        className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#4A7C5C] via-[#1B3A2D] to-[#0D1F17] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group overflow-hidden"
                        style={{ boxShadow: '0 0 15px rgba(75, 124, 92, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)' }}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                        <Globe className="w-5 h-5 text-[#FFD966] relative z-10 group-hover:animate-spin" style={{ animationDuration: '3s' }} />
                    </a>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3A2D] to-[#2D5A3E] border-2 border-white/60 flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : 'MK'}
                    </div>
                </div>
            </header>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-[1600px] mx-auto">

                {/* ═══════ ROW 0: Welcome + 4 Progress Bars + 3 Hero Stats ═══════ */}
                <div className="col-span-12">
                    <h1 className="text-3xl md:text-4xl font-semibold mb-5 text-slate-900">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3A2D] to-[#4A7C5C]">Keyton</span>
                    </h1>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        {/* 4 Progress Bars */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-[0.15em] opacity-50 font-bold">Voter Contacted</span>
                                <div className="w-36 h-9 bg-black rounded-full flex items-center overflow-hidden relative">
                                    <div className="h-full bg-gradient-to-r from-[#1B3A2D] to-[#4A7C5C] rounded-full transition-all duration-1000" style={{ width: '25%' }} />
                                    <span className="absolute inset-0 flex items-center px-4 text-white text-sm font-bold">25%</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-[0.15em] opacity-50 font-bold">Grassroots Donations</span>
                                <div className="w-36 h-9 bg-[#FFD966] rounded-full flex items-center overflow-hidden relative">
                                    <div className="h-full bg-[#F5C842] rounded-full transition-all duration-1000" style={{ width: '15%' }} />
                                    <span className="absolute inset-0 flex items-center px-4 text-black text-sm font-bold">15%</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-[0.15em] opacity-50 font-bold">Town Hall Prep</span>
                                <div className="w-36 h-9 bg-[#FFD966] rounded-full flex items-center overflow-hidden relative">
                                    <div className="h-full bg-[#D4A843] rounded-full transition-all duration-1000" style={{ width: '60%' }} />
                                    <span className="absolute inset-0 flex items-center px-4 text-black text-sm font-bold">60%</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-[0.15em] opacity-50 font-bold">Ad Impression Goal</span>
                                <div className="w-36 h-9 bg-black/10 rounded-full flex items-center overflow-hidden relative">
                                    <div className="h-full bg-slate-300 rounded-full transition-all duration-1000" style={{ width: '10%' }} />
                                    <span className="absolute inset-0 flex items-center px-4 text-slate-700 text-sm font-bold">10%</span>
                                </div>
                            </div>
                        </div>
                        {/* 3 Hero Stats */}
                        <div className="flex gap-6 items-start">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 opacity-30" />
                                <div className="flex flex-col"><span className="text-3xl font-black text-slate-900">${(totalDonationCents / 100).toFixed(0)}</span><span className="text-[10px] uppercase opacity-40 tracking-wider">Total Raised</span></div>
                            </div>
                            <div className="w-px h-12 bg-black/10" />
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 opacity-30" />
                                <div className="flex flex-col"><span className="text-3xl font-black text-slate-900">{volunteers.length}</span><span className="text-[10px] uppercase opacity-40 tracking-wider">Volunteers Recruited</span></div>
                            </div>
                            <div className="w-px h-12 bg-black/10" />
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 opacity-30" />
                                <div className="flex flex-col"><span className="text-3xl font-black text-slate-900">{orders.length}</span><span className="text-[10px] uppercase opacity-40 tracking-wider">Swag Orders</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════
                    BATTLE-VIEW: DUAL CALENDARS (Full-Width Row)
                ══════════════════════════════════════════════════════ */}
                <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* ── Keyton's Ops Calendar (Gold) ── */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-[32px] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                                <Target className="w-5 h-5 text-[#FFD966]" /> Keyton Strategic Ops
                            </h3>
                            <span className="text-[10px] opacity-40 uppercase tracking-[0.15em] font-bold">2026 Calendar</span>
                        </div>
                        <div className="space-y-2">
                            {keytonEvents.map((evt, i) => (
                                <a key={i} href={evt.url} target="_blank" rel="noreferrer"
                                    className={`block p-3 rounded-2xl flex justify-between items-center group cursor-pointer transition-all duration-200 hover:translate-x-1 hover:shadow-md no-underline ${evt.type === 'election' ? 'bg-[#FFD966]/30 border border-[#FFD966]/40 hover:bg-[#FFD966]/40' :
                                        evt.type === 'deadline' ? 'bg-amber-50/50 border border-amber-200/30 hover:bg-amber-50/80' :
                                            'bg-black/5 hover:bg-black/10'
                                        }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${evt.type === 'election' ? 'bg-[#FFD966]' :
                                            evt.type === 'deadline' ? 'bg-amber-500' :
                                                evt.type === 'fundraise' ? 'bg-[#1B3A2D]' :
                                                    evt.type === 'canvass' ? 'bg-emerald-500' :
                                                        'bg-slate-400'
                                            }`} />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold opacity-50">{evt.date}</p>
                                            <p className={`text-sm font-semibold ${evt.type === 'election' ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>{evt.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${evt.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                            evt.status === 'Prep' ? 'bg-amber-100 text-amber-700' :
                                                evt.status === 'Due' ? 'bg-red-100 text-red-700' :
                                                    evt.status === 'Target' ? 'bg-[#FFD966] text-black' :
                                                        'bg-black/5 text-slate-500'
                                            }`}>{evt.status}</span>
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" />
                                    </div>
                                </a>
                            ))}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-black/5">
                            {[
                                { c: 'bg-emerald-500', l: 'Canvass' },
                                { c: 'bg-[#1B3A2D]', l: 'Fundraise' },
                                { c: 'bg-slate-400', l: 'Event' },
                                { c: 'bg-amber-500', l: 'Deadline' },
                                { c: 'bg-[#FFD966]', l: 'Election' },
                            ].map(leg => (
                                <span key={leg.l} className="flex items-center gap-1 text-[9px] opacity-50">
                                    <span className={`w-2 h-2 rounded-full ${leg.c}`} />{leg.l}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Opposition Tracker: Donzella James (Dark Glass) ── */}
                    <div className="bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl text-white">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-base font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-400" /> Opposition: Donzella James
                            </h3>
                            <span className="text-[10px] opacity-30 uppercase tracking-[0.15em] font-bold">SD-28 Incumbent (D)</span>
                        </div>
                        {/* Incumbent Profile Mini */}
                        <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-red-900/60 border border-red-400/30 flex items-center justify-center text-xs font-bold text-red-300">DJ</div>
                            <div>
                                <p className="text-sm font-semibold">Sen. Donzella James</p>
                                <p className="text-[10px] opacity-40">District 35 → Redistricted to SD-28 · Committee: Health, Education</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {oppositionEvents.map((evt, i) => (
                                <a key={i} href={evt.url} target="_blank" rel="noreferrer"
                                    className={`block p-3 rounded-2xl flex justify-between items-center group cursor-pointer transition-all duration-200 hover:translate-x-1 no-underline ${evt.type === 'session' ? 'bg-red-500/10 border border-red-400/10 hover:bg-red-500/15' :
                                        'bg-white/5 hover:bg-white/10'
                                        }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${evt.type === 'session' ? 'bg-red-400 animate-pulse' :
                                            evt.type === 'press' ? 'bg-amber-400' :
                                                evt.type === 'community' ? 'bg-blue-400' :
                                                    evt.type === 'committee' ? 'bg-slate-400' :
                                                        evt.type === 'constituent' ? 'bg-purple-400' :
                                                            'bg-slate-500'
                                            }`} />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold opacity-40">{evt.date}</p>
                                            <p className="text-sm font-medium opacity-90">{evt.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">{evt.intel}</span>
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />
                                    </div>
                                </a>
                            ))}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/5">
                            {[
                                { c: 'bg-red-400', l: 'Session' },
                                { c: 'bg-amber-400', l: 'Press' },
                                { c: 'bg-blue-400', l: 'Community' },
                                { c: 'bg-purple-400', l: 'Constituent' },
                                { c: 'bg-slate-400', l: 'Committee' },
                            ].map(leg => (
                                <span key={leg.l} className="flex items-center gap-1 text-[9px] opacity-30">
                                    <span className={`w-2 h-2 rounded-full ${leg.c}`} />{leg.l}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════
                    NEWS INTELLIGENCE: Live RSS Feeds (Full-Width Row)
                ══════════════════════════════════════════════════════ */}
                <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* ── Keyton News Feed (Gold Glass) ── */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-[32px] p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                                <Rss className="w-4 h-4 text-[#FFD966]" /> Keyton in the News
                            </h3>
                            <button onClick={fetchNewsFeeds} className="text-[9px] bg-black/5 px-2 py-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer opacity-50 hover:opacity-80 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                        </div>
                        {newsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-[#FFD966] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : keytonNews.length > 0 ? (
                            <div className="space-y-2">
                                {keytonNews.map((item, i) => (
                                    <a key={i} href={item.link} target="_blank" rel="noreferrer"
                                        className="block p-3 bg-black/5 rounded-2xl hover:bg-[#FFD966]/15 transition-all group cursor-pointer">
                                        <div className="flex items-start gap-2">
                                            <Newspaper className="w-4 h-4 text-[#B8941F] mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 group-hover:text-[#1B3A2D] transition-colors line-clamp-2">{item.title}</p>
                                                {item.snippet && <p className="text-[10px] opacity-40 mt-1 line-clamp-2">{item.snippet}</p>}
                                                {item.published && (
                                                    <p className="text-[9px] opacity-30 mt-1 font-mono">
                                                        {new Date(item.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 mt-1" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs opacity-40">No recent news coverage</p>
                                <p className="text-[10px] opacity-25 mt-1">Google Alerts will appear here when published</p>
                            </div>
                        )}
                    </div>

                    {/* ── Opposition News Feed (Dark Glass) ── */}
                    <div className="bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 shadow-xl text-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Rss className="w-4 h-4 text-red-400" /> Opposition News
                            </h3>
                            <span className="text-[9px] opacity-30 uppercase tracking-wider">Donzella James</span>
                        </div>
                        {newsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : oppositionNews.length > 0 ? (
                            <div className="space-y-2">
                                {oppositionNews.map((item, i) => (
                                    <a key={i} href={item.link} target="_blank" rel="noreferrer"
                                        className="block p-3 bg-white/5 rounded-2xl hover:bg-red-500/10 transition-all group cursor-pointer">
                                        <div className="flex items-start gap-2">
                                            <Newspaper className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold opacity-90 group-hover:opacity-100 transition-colors line-clamp-2">{item.title}</p>
                                                {item.snippet && <p className="text-[10px] opacity-30 mt-1 line-clamp-2">{item.snippet}</p>}
                                                {item.published && (
                                                    <p className="text-[9px] opacity-20 mt-1 font-mono">
                                                        {new Date(item.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity flex-shrink-0 mt-1" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-10" />
                                <p className="text-xs opacity-30">No recent opposition coverage</p>
                                <p className="text-[10px] opacity-15 mt-1">Google Alerts will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════ ROW 2: Profile (3) + Charts/Invoices (6) + Actions (3) ═══════ */}

                {/* ── Column 1: Profile + Demographics + Ethics (3 cols) ── */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-5">
                    {/* Profile Card */}
                    <GlassCard className="flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#1B3A2D] to-[#4A7C5C] overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {uploadingPhoto ? <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : profilePhoto ? <img src={profilePhoto} alt="Candidate" className="w-full h-full object-cover" />
                                        : 'MK'}
                            </div>
                            <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Candidate Keyton</h2>
                        <p className="text-xs opacity-50 mb-4">GA Senate, District 28</p>
                        <div className="bg-black/5 rounded-2xl p-3 w-full flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900">${(totalDonationCents / 100).toFixed(0)}</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-wide">Total Raised</span>
                        </div>
                    </GlassCard>

                    {/* D28 Demographics */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-[24px] border border-white/20 overflow-hidden">
                        <button onClick={() => toggleAccordion('demographics')} className="w-full flex justify-between items-center p-4 cursor-pointer hover:bg-white/20 transition-colors">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-800"><MapPin className="w-4 h-4 text-[#1B3A2D]" /> D28 Demographics</span>
                            {expandedAccordion === 'demographics' ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                        </button>
                        {expandedAccordion === 'demographics' && (
                            <div className="px-4 pb-4 space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-white/40 rounded-xl p-2 text-center"><p className="opacity-50 uppercase text-[9px] font-bold">Population</p><p className="font-bold text-slate-900">{districtData.totalPopulation}</p></div>
                                    <div className="bg-white/40 rounded-xl p-2 text-center"><p className="opacity-50 uppercase text-[9px] font-bold">Eligible Voters</p><p className="font-bold text-slate-900">{districtData.eligibleVoters}</p></div>
                                    <div className="bg-white/40 rounded-xl p-2 text-center"><p className="opacity-50 uppercase text-[9px] font-bold">Median Age</p><p className="font-bold text-slate-900">{districtData.medianAge}</p></div>
                                </div>
                                <div className="space-y-2">
                                    {districtData.demographics.map(d => (
                                        <div key={d.label} className="flex items-center gap-2">
                                            <span className="text-[10px] w-20 opacity-60 truncate">{d.label}</span>
                                            <div className="flex-1 h-4 bg-black/5 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.pct}%`, backgroundColor: d.color }} /></div>
                                            <span className="text-[10px] font-bold w-8 text-right">{d.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase opacity-40 font-bold mb-1 tracking-wider">Key Areas</p>
                                    <div className="flex flex-wrap gap-1">{districtData.areas.map(a => <span key={a} className="text-[10px] bg-[#1B3A2D]/10 text-[#1B3A2D] px-2 py-0.5 rounded-full font-medium">{a}</span>)}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GA Ethics / CCDR (SB 199 Quarterly) */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-[24px] border border-white/20 overflow-hidden">
                        <button onClick={() => toggleAccordion('ethics')} className="w-full flex justify-between items-center p-4 cursor-pointer hover:bg-white/20 transition-colors">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-800"><Scale className="w-4 h-4 text-[#1B3A2D]" /> CCDR / SB 199</span>
                            {expandedAccordion === 'ethics' ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                        </button>
                        {expandedAccordion === 'ethics' && (
                            <div className="px-4 pb-4 space-y-1.5">
                                <p className="text-[9px] opacity-40 mb-1">Quarterly Schedule per SB 199 (eff. Jan 1, 2026)</p>
                                {ccdrDeadlines.map((d, i) => (
                                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${d.isPast ? 'opacity-40' : d.isElection ? 'bg-[#FFD966]/15 border border-[#FFD966]/20' : 'bg-white/40'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.isPast ? 'bg-emerald-400' :
                                            d.isElection ? 'bg-[#FFD966]' :
                                                d.daysUntil <= 30 ? 'bg-red-500 animate-pulse' :
                                                    'bg-amber-400'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 truncate">{d.label}</p>
                                            <p className="text-[9px] opacity-40 truncate">{d.desc}</p>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <span className={`font-mono text-[10px] font-bold ${d.isPast ? 'text-emerald-600' : d.daysUntil <= 30 ? 'text-red-600' : 'text-slate-500'}`}>
                                                {d.isPast ? '✓' : `${d.daysUntil}d`}
                                            </span>
                                            <span className="text-[8px] opacity-30">{d.dateStr}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col">
                        {[
                            { title: 'Volunteer List', route: '/admin/volunteers', icon: Users },
                            { title: 'Swag Orders', route: '/admin/orders', icon: ShoppingBag },
                            { title: 'Donation Records', route: '/admin/donations', icon: DollarSign },
                            { title: 'Campaign Site', route: 'https://keytonforsenate.com', icon: ExternalLink, external: true },
                        ].map(link => (
                            <button key={link.title} onClick={() => link.external ? window.open(link.route, '_blank') : navigate(link.route)}
                                className="flex justify-between items-center p-3 border-b border-black/5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity text-left group">
                                <span className="flex items-center gap-2 text-sm font-medium"><link.icon className="w-4 h-4 opacity-50 group-hover:opacity-80" />{link.title}</span>
                                <span className="text-xs opacity-40 group-hover:opacity-70">→</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Column 2: Charts + Invoices + Volunteers (6 cols) ── */}
                <div className="col-span-12 md:col-span-6 flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Voter Outreach Chart */}
                        <GlassCard>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-sm text-slate-900">Voter Outreach</h3>
                                <span className="bg-[#FFD966]/30 p-1 rounded-lg"><TrendingUp className="w-4 h-4 text-[#B8941F]" /></span>
                            </div>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-3xl font-bold text-slate-900">{volunteers.length + orders.length + donations.length}</span>
                                <span className="text-xs opacity-50 pb-1">Weekly Actions</span>
                            </div>
                            <div className="h-28">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} barSize={18}>
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ background: '#2A2A2A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>{chartData.map((_e, i) => <Cell key={`c-${i}`} fill={i === 5 ? '#FFD966' : '#1B3A2D'} />)}</Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Media Call Time */}
                        <GlassCard className="flex flex-col justify-between">
                            <h3 className="font-bold text-sm text-center text-slate-900 flex items-center justify-center gap-2"><Clock className="w-4 h-4" /> Media Call Time</h3>
                            <div className="relative flex justify-center py-4">
                                <div className={`w-24 h-24 rounded-full border-4 border-dashed flex items-center justify-center transition-colors ${callTimeRunning ? 'border-[#FFD966] bg-[#FFD966]/10' : 'border-black/10 bg-white/20'}`}>
                                    <span className="text-xl font-mono font-bold text-slate-900">{formatCallTime(callTimeSeconds)}</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-3">
                                <button onClick={() => setCallTimeRunning(!callTimeRunning)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${callTimeRunning ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-black text-white hover:bg-slate-800'}`}>
                                    {callTimeRunning ? '⏸ Pause' : '▶ Start'}
                                </button>
                                <button onClick={() => { setCallTimeRunning(false); setCallTimeSeconds(0); }} className="px-3 py-2 bg-white/50 rounded-full text-xs font-medium hover:bg-white/70 transition-colors cursor-pointer">Reset</button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Invoices */}
                    <GlassCard>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Invoices
                                {invoiceCount > 0 && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{invoiceCount}</span>}
                            </h3>
                            <span className="text-xs text-slate-500">Total Due: <span className={`font-bold ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>${(totalDue / 100).toFixed(2)}</span></span>
                        </div>
                        {invoices.length > 0 ? (
                            <div className="space-y-2">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="flex items-center gap-3 p-3 bg-white/30 rounded-2xl hover:bg-white/50 transition-colors">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-[#1B3A2D]"
                                            checked={selectedInvoices.has(inv.id)}
                                            onChange={(e) => { const ns = new Set(selectedInvoices); e.target.checked ? ns.add(inv.id) : ns.delete(inv.id); setSelectedInvoices(ns); }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 truncate">{inv.notes}</p>
                                            <p className="text-[10px] opacity-50">Due {formatDate(inv.due_date)}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">${(inv.amount / 100).toFixed(2)}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                                        <a href="https://square.link/u/f9RADHpy" target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-black text-white text-[10px] font-bold rounded-full hover:bg-slate-800 transition-colors whitespace-nowrap">Pay</a>
                                    </div>
                                ))}
                                {selectedInvoices.size > 0 && (
                                    <div className="flex justify-between items-center mt-3 p-3 bg-[#FFD966]/20 rounded-2xl border border-[#FFD966]/30">
                                        <div><p className="text-[10px] opacity-50 uppercase font-bold">Selected Total</p><p className="text-lg font-bold text-slate-900">${(invoices.filter(i => selectedInvoices.has(i.id)).reduce((s, i) => s + i.amount, 0) / 100).toFixed(2)}</p></div>
                                        <a href="https://square.link/u/f9RADHpy" target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-black text-[#FFD966] font-bold rounded-full text-xs hover:bg-slate-800 transition-colors">Pay Selected ({selectedInvoices.size})</a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50/50 border-2 border-dashed border-emerald-200 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                                <p className="text-sm font-medium text-slate-600">All invoices cleared</p>
                                <p className="text-xs opacity-40 mt-1">No outstanding payments</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* Recent Volunteers */}
                    <GlassCard>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold">Recent Volunteers</span>
                            <Calendar className="w-4 h-4 opacity-40" />
                        </div>
                        {volunteers.length > 0 ? (
                            <div className="space-y-2">
                                {volunteers.slice(0, 3).map((vol, i) => (
                                    <div key={vol.id} className={`${i === 0 ? 'bg-black text-white' : 'bg-white/40 text-slate-800'} p-3 rounded-2xl flex justify-between items-center transition-all hover:scale-[1.01]`}>
                                        <div>
                                            <p className={`text-[10px] ${i === 0 ? 'opacity-50' : 'opacity-40'}`}>{formatDate(vol.created_at)}</p>
                                            <p className="font-medium text-sm">{vol.name}</p>
                                            <p className={`text-xs ${i === 0 ? 'opacity-40' : 'opacity-30'}`}>{vol.interest}</p>
                                        </div>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-[#FFD966] text-black border-2 border-black' : 'bg-slate-200 text-slate-500 border-2 border-white'}`}>{vol.name.charAt(0)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-black text-white p-4 rounded-2xl flex justify-between items-center">
                                <div><p className="text-xs opacity-60">No volunteers yet</p><p className="font-medium text-sm">Share your site to recruit</p></div>
                                <Users className="w-5 h-5 opacity-40" />
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* ── Column 3: Volunteer Pipeline + Actions + Swag (3 cols) ── */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-5">
                    {/* Volunteer Pipeline */}
                    <GlassCard>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-sm text-slate-900">Volunteer Pipeline</h3>
                            <span className="text-xs opacity-50">18%<span className="text-[10px] opacity-60 ml-1">45% trained</span></span>
                        </div>
                        <div className="flex justify-between">
                            {[
                                { label: 'Signed Up', pct: 30, color: '#1B3A2D' },
                                { label: 'Trained', pct: 25, color: '#FFD966' },
                                { label: 'Active', pct: 18, color: '#4A7C5C' },
                            ].map(stage => (
                                <div key={stage.label} className="flex flex-col items-center gap-1">
                                    <div className="relative w-14 h-14">
                                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                                            <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                                            <circle cx="28" cy="28" r="22" fill="none" stroke={stage.color} strokeWidth="5"
                                                strokeDasharray={`${stage.pct * 1.38} 138`} strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{stage.pct}%</span>
                                    </div>
                                    <span className="text-[9px] font-medium opacity-50 bg-black/5 px-2 py-0.5 rounded-full">{stage.label}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Priority Campaign Actions */}
                    <div className="bg-[#2A2A2A] text-white rounded-[32px] p-5 shadow-xl flex flex-col gap-2.5">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-sm">Priority Campaign Actions</h3>
                            <span className="text-xs opacity-40">{priorityActions.filter(a => a.done).length}/{priorityActions.length}</span>
                        </div>
                        {priorityActions.map((action, i) => (
                            <div key={i} className="flex items-start gap-3 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${action.done ? 'bg-[#FFD966] border-[#FFD966]' : 'border-white/20 group-hover:border-[#FFD966]/50'}`}>
                                    {action.done && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`text-[11px] leading-relaxed block ${action.done ? 'opacity-40 line-through' : 'opacity-90'}`}>{action.text}</span>
                                    {action.date && <span className="text-[9px] opacity-30 block mt-0.5">{action.date}</span>}
                                </div>
                                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${action.done ? 'text-[#FFD966]' : 'opacity-20'}`} />
                            </div>
                        ))}
                    </div>

                    {/* Swag Inventory */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-[24px] border border-white/20 overflow-hidden">
                        <button onClick={() => toggleAccordion('swag')} className="w-full flex justify-between items-center p-4 cursor-pointer hover:bg-white/20 transition-colors">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-800"><Package className="w-4 h-4 text-[#1B3A2D]" /> Swag Inventory</span>
                            {expandedAccordion === 'swag' ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                        </button>
                        {expandedAccordion === 'swag' && (
                            <div className="px-4 pb-4 space-y-2">
                                {swagInventory.map(item => (
                                    <div key={item.item} className="flex items-center gap-2 p-2 bg-white/30 rounded-xl hover:bg-white/50 transition-colors">
                                        <span className="text-base">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold text-slate-800 truncate">{item.item}</p>
                                            <p className="text-[9px] opacity-50">{item.price} · {item.stock} in stock</p>
                                        </div>
                                        <a href={item.reorderUrl} target="_blank" rel="noreferrer" className="text-[9px] bg-[#FFD966] text-black font-bold px-2 py-1 rounded-full hover:bg-[#F5C842] transition-colors whitespace-nowrap">Reorder</a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    {orders.length > 0 && (
                        <GlassCard>
                            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Latest Orders</h3>
                            {orders.slice(0, 3).map(order => (
                                <div key={order.id} className="flex items-center justify-between gap-2 py-2 border-b border-black/5 last:border-0">
                                    <div className="min-w-0"><p className="text-xs font-medium text-slate-800 truncate">{order.name}</p><p className="text-[10px] opacity-50">{order.item}</p></div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.status || 'pending'}</span>
                                </div>
                            ))}
                        </GlassCard>
                    )}
                </div>

            </div>
        </div>
    );
}
