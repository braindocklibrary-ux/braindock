import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Wifi, 
  BookOpen, 
  VolumeX, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MembershipPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const plans = [
    {
      code: 'PLAN-FIRST50',
      name: 'First 50 Students Special',
      price: 849,
      cycle: 'Monthly',
      popular: true,
      badge: 'FIRST 50 ADMISSIONS OFFER',
      desc: 'Exclusive inaugural discount rate reserved strictly for the first 50 student admissions.',
      benefits: [
        'Personal Reserved Study Desk',
        'Ergonomic Revolving Executive Chair',
        'Dedicated Personal Locker',
        'Pantry Area Access & RO Purified Water',
        '24/7 Silent AC Reading Sanctuary Access',
        'Smart Biometric (Fingerprint & Face) Door Security',
        '1 Gbps Ultra-Fast Optical Wi-Fi Mesh',
        'Personal Desk Power Sockets & LED Lighting',
        'Digital OPAC & E-Library Privileges'
      ],
      notIncluded: []
    },
    {
      code: 'PLAN-REGULAR',
      name: 'Standard Student Membership',
      price: 999,
      cycle: 'Monthly',
      popular: false,
      badge: '51ST ADMISSION ONWARDS',
      desc: 'Standard fee applicable for students joining after the first 50 seats with 100% identical facilities.',
      benefits: [
        'Personal Reserved Study Desk',
        'Ergonomic Revolving Executive Chair',
        'Dedicated Personal Locker',
        'Pantry Area Access & RO Purified Water',
        '24/7 Silent AC Reading Sanctuary Access',
        'Smart Biometric (Fingerprint & Face) Door Security',
        '1 Gbps Ultra-Fast Optical Wi-Fi Mesh',
        'Personal Desk Power Sockets & LED Lighting',
        'Digital OPAC & E-Library Privileges'
      ],
      notIncluded: []
    }
  ];

  const handleSubscribe = (plan) => {
    // If not in a session, direct to Student Portal
    const studentSession = localStorage.getItem('bdl_student_session');
    if (!studentSession && !user) {
      navigate('/student-portal');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleConfirmPayment = () => {
    if (updateProfile) {
      updateProfile({
        membershipPlan: selectedPlan.name,
        membershipStatus: 'Active'
      });
    }
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedPlan(null);
      navigate('/student-portal');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Membership Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Invest in Your <span className="text-gradient-dark-purple">Intellectual Growth</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Transparent pricing with no hidden charges. All plans include automated digital membership cards, zero queues, and gigabit fiber connectivity.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
          {plans.map(plan => (
            <div 
              key={plan.code}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative bg-white ${
                plan.popular 
                  ? 'border-2 border-purple-700 shadow-xl ring-4 ring-purple-50 transform lg:-translate-y-2' 
                  : 'shadow-md border border-slate-200 hover:border-purple-300'
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1 ${
                  plan.popular ? 'bg-gradient-to-r from-purple-700 to-indigo-600' : 'bg-slate-700'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  <span>{plan.badge}</span>
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    {plan.cycle} Plan
                  </span>
                  {plan.popular && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Save ₹150/mo
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹{plan.price}</span>
                  <span className="text-xs ml-2 text-slate-500 font-medium">/ {plan.cycle.toLowerCase()}</span>
                </div>
                
                <p className="text-xs mt-3 leading-relaxed text-slate-600">
                  {plan.desc}
                </p>

                {/* Included Benefits */}
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-purple-900">
                    100% Facilities Included
                  </p>
                  {plan.benefits.map((b, i) => (
                    <div key={i} className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{b}</span>
                    </div>
                  ))}

                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <div className="pt-2 space-y-2 opacity-50">
                      {plan.notIncluded.map((n, i) => (
                        <div key={i} className="flex items-start space-x-2.5">
                          <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-through text-slate-500">{n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleSubscribe(plan)}
                className={`mt-8 w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                  plan.popular 
                    ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                Choose {plan.name} (₹{plan.price})
              </button>
            </div>
          ))}
        </div>

        {/* Payment / Subscription Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-purple-100 text-slate-800 space-y-6">
              {paymentSuccess ? (
                <div className="text-center space-y-3 py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Membership Upgraded!</h3>
                  <p className="text-xs text-slate-600">Your digital smart pass has been updated. Redirecting to your member portal...</p>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-xs uppercase font-bold text-purple-700">Checkout</span>
                    <h3 className="text-2xl font-bold text-slate-900">Subscribe to {selectedPlan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Amount Due: <strong className="text-slate-900 text-sm">₹{selectedPlan.price}</strong> ({selectedPlan.cycle})</p>
                  </div>

                  <div className="space-y-3 bg-purple-50 p-4 rounded-2xl border border-purple-100 text-xs">
                    <p className="font-bold text-purple-950">Select Payment Method</p>
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-purple-200 cursor-pointer">
                      <input type="radio" name="paymentMethod" defaultChecked className="text-purple-600 focus:ring-purple-500" />
                      <span className="font-semibold text-slate-800">UPI / QR (Google Pay, PhonePe, Paytm)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-purple-200 cursor-pointer">
                      <input type="radio" name="paymentMethod" className="text-purple-600 focus:ring-purple-500" />
                      <span className="font-semibold text-slate-800">Credit / Debit Card / Net Banking</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedPlan(null)}
                      className="w-1/2 py-3 rounded-2xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleConfirmPayment}
                      className="w-1/2 py-3 rounded-2xl font-bold text-xs bg-purple-700 hover:bg-purple-600 text-white shadow-purple-glow"
                    >
                      Pay ₹{selectedPlan.price}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
