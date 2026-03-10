import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/config';

interface DonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DONATION_TIERS = [25, 50, 100, 250, 500, 1000];

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
    const [amount, setAmount] = useState<number | 'custom' | ''>('');
    const [customAmount, setCustomAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAmount = amount === 'custom' ? Number(customAmount) : amount;

        if (!finalAmount || finalAmount < 1) {
            setError('Minimum donation is $1');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalAmount })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize checkout');
            }

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-dark-green px-6 py-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <i className="ri-close-line text-xl" />
                            </button>
                            <h3 className="text-2xl font-display mb-1">Chip In for Mel</h3>
                            <p className="text-white/80 text-sm">
                                Your contribution goes directly to the Mel Keyton campaign to protect family wealth and build a stronger District 28.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <form onSubmit={handleDonate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                        Select Amount
                                    </label>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        {DONATION_TIERS.map((tier) => (
                                            <button
                                                key={tier}
                                                type="button"
                                                onClick={() => {
                                                    setAmount(tier);
                                                    setCustomAmount('');
                                                    setError(null);
                                                }}
                                                className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${amount === tier
                                                    ? 'border-lime bg-lime text-dark-green'
                                                    : 'border-gray-200 text-gray-700 hover:border-lime/50'
                                                    }`}
                                            >
                                                ${tier}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="Other Amount"
                                            value={customAmount}
                                            onChange={(e) => {
                                                setAmount('custom');
                                                setCustomAmount(e.target.value);
                                                setError(null);
                                            }}
                                            onFocus={() => {
                                                setAmount('custom');
                                                setError(null);
                                            }}
                                            className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 font-bold transition-colors focus:outline-none ${amount === 'custom' ? 'border-lime focus:border-lime' : 'border-gray-200 focus:border-lime/50'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-start gap-2">
                                        <i className="ri-error-warning-fill mt-0.5" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !amount || (amount === 'custom' && !customAmount)}
                                    className="w-full py-4 bg-dark-green text-white font-bold rounded-xl hover:bg-dark-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <i className="ri-loader-4-line animate-spin text-xl" />
                                    ) : (
                                        <>
                                            <i className="ri-secure-payment-line text-lg" />
                                            Proceed to Secure Checkout
                                        </>
                                    )}
                                </button>
                                <div className="text-center">
                                    <span className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                        <i className="ri-lock-fill" /> Payments are securely processed by Stripe
                                    </span>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
