import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Eye, 
  EyeOff, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Laptop,
  Lock,
  Armchair,
  Coffee,
  VolumeX,
  Wifi,
  Clock,
  ShieldCheck,
  Utensils,
  Monitor,
  Cpu,
  Layers,
  BookOpen,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Laptop', label: '💻 Laptop / Personal Desk' },
  { value: 'Lock', label: '🔒 Lock / Personal Locker' },
  { value: 'Armchair', label: '💺 Armchair / Revolving Chair' },
  { value: 'Coffee', label: '☕ Coffee / Pantry Area' },
  { value: 'VolumeX', label: '🔇 Silent AC / Soundproofing' },
  { value: 'Wifi', label: '📶 Wi-Fi 7 Mesh' },
  { value: 'Clock', label: '⏰ 24/7 Access / Biometrics' },
  { value: 'ShieldCheck', label: '🛡️ CCTV & Safety' },
  { value: 'Utensils', label: '🍽️ Dining / Cafeteria' },
  { value: 'Monitor', label: '🖥️ Workstation / Monitor' },
  { value: 'Cpu', label: '⚡ Tech / RFID Dock' },
  { value: 'Layers', label: '📚 Seat / Pod Booking' },
  { value: 'BookOpen', label: '📖 Books Archive' },
  { value: 'Sparkles', label: '✨ Premium Facility' }
];

const renderIconComp = (name) => {
  switch (name) {
    case 'Laptop': return <Laptop className="w-5 h-5" />;
    case 'Lock': return <Lock className="w-5 h-5" />;
    case 'Armchair': return <Armchair className="w-5 h-5" />;
    case 'Coffee': return <Coffee className="w-5 h-5" />;
    case 'VolumeX': return <VolumeX className="w-5 h-5" />;
    case 'Wifi': return <Wifi className="w-5 h-5" />;
    case 'Clock': return <Clock className="w-5 h-5" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
    case 'Utensils': return <Utensils className="w-5 h-5" />;
    case 'Monitor': return <Monitor className="w-5 h-5" />;
    case 'Cpu': return <Cpu className="w-5 h-5" />;
    case 'Layers': return <Layers className="w-5 h-5" />;
    case 'BookOpen': return <BookOpen className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};

export default function ContentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'features';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [messages, setMessages] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Homepage Stats Banner state
  const [statsConfig, setStatsConfig] = useState({
    isVisible: false,
    items: [
      { id: '1', number: '45,000+', label: 'Physical Volumes' },
      { id: '2', number: '12,800+', label: 'Active Members' },
      { id: '3', number: '250+', label: 'Study Seats' },
      { id: '4', number: '1,400+', label: 'Daily Visitors' },
      { id: '5', number: '18,500+', label: 'Research Journals' }
    ]
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [savingStats, setSavingStats] = useState(false);

  // Features Section state (Engineered for Concentration & Clarity)
  const [featuresConfig, setFeaturesConfig] = useState({
    badge: 'The Brain Dock Difference',
    title: 'Engineered for Concentration & Clarity',
    subtitle: 'We removed the noise, slow checkouts, and visual clutter to build a reading ecosystem focused purely on comprehension.',
    items: []
  });
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [newFeatureModal, setNewFeatureModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    title: '',
    tag: '',
    icon: 'Laptop',
    description: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/contact', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setMessages(data.data); })
      .catch(() => {});

    fetch('http://localhost:5000/api/content/faqs')
      .then(res => res.json())
      .then(data => { if (data.success) setFaqs(data.data); })
      .catch(() => {});

    fetchHomepageStats();
    fetchHomepageFeatures();
  }, []);

  const fetchHomepageStats = () => {
    setLoadingStats(true);
    fetch('http://localhost:5000/api/content/homepage-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStatsConfig(data.data);
        }
      })
      .catch(err => console.error('Error fetching stats:', err))
      .finally(() => setLoadingStats(false));
  };

  const fetchHomepageFeatures = () => {
    setLoadingFeatures(true);
    fetch('http://localhost:5000/api/content/features')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFeaturesConfig(data.data);
        }
      })
      .catch(err => console.error('Error fetching features:', err))
      .finally(() => setLoadingFeatures(false));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats operations
  const handleToggleStatsVisibility = async () => {
    const updated = { ...statsConfig, isVisible: !statsConfig.isVisible };
    setStatsConfig(updated);
    await saveStatsToServer(updated);
  };

  const handleStatsItemChange = (index, field, value) => {
    const newItems = [...statsConfig.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setStatsConfig({ ...statsConfig, items: newItems });
  };

  const handleAddStatsItem = () => {
    const newItems = [...statsConfig.items, { id: String(Date.now()), number: '100+', label: 'New Metric' }];
    setStatsConfig({ ...statsConfig, items: newItems });
  };

  const handleRemoveStatsItem = (index) => {
    if (statsConfig.items.length <= 1) {
      alert('Kam se kam ek metric hona chahiye.');
      return;
    }
    const newItems = statsConfig.items.filter((_, i) => i !== index);
    setStatsConfig({ ...statsConfig, items: newItems });
  };

  const saveStatsToServer = async (customConfig = null) => {
    const payload = customConfig || statsConfig;
    setSavingStats(true);
    try {
      const res = await fetch('http://localhost:5000/api/content/homepage-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStatsConfig(data.data);
        showToast(payload.isVisible ? '🟢 Homepage Stats Live!' : '🔴 Homepage Stats Hidden!');
      } else {
        alert(data.message || 'Failed to save stats');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save stats to server.');
    } finally {
      setSavingStats(false);
    }
  };

  // Features operations (Concentration & Clarity)
  const handleFeatureItemChange = (index, field, value) => {
    const newItems = [...featuresConfig.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFeaturesConfig({ ...featuresConfig, items: newItems });
  };

  const handleMoveFeature = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= featuresConfig.items.length) return;
    const newItems = [...featuresConfig.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setFeaturesConfig({ ...featuresConfig, items: newItems });
  };

  const handleDeleteFeature = (id, title) => {
    if (window.confirm(`Kya aap "${title}" facility ko delete karna chahte hain?`)) {
      const newItems = featuresConfig.items.filter(item => item.id !== id);
      setFeaturesConfig({ ...featuresConfig, items: newItems });
      showToast(`🗑️ "${title}" removed from list. Click 'Save All Changes' to apply.`);
    }
  };

  const handleAddFeatureSubmit = (e) => {
    e.preventDefault();
    if (!newFeature.title.trim()) {
      alert('Kripya Facility ka Title enter karein.');
      return;
    }
    const itemToAdd = {
      id: `feat-${Date.now()}`,
      title: newFeature.title.trim(),
      tag: newFeature.tag.trim() || 'Facility',
      icon: newFeature.icon || 'Laptop',
      description: newFeature.description.trim() || 'Premium amenity designed for scholars.'
    };
    setFeaturesConfig(prev => ({
      ...prev,
      items: [...(prev.items || []), itemToAdd]
    }));
    setNewFeature({ title: '', tag: '', icon: 'Laptop', description: '' });
    setNewFeatureModal(false);
    showToast(`✅ Added "${itemToAdd.title}". Click 'Save All Changes' to make it live!`);
  };

  const handleResetFeaturesDefaults = () => {
    if (window.confirm('Kya aap default facilities (Personal Desk, Personal Locker, Revolving Chair, Pantry Area, etc.) restore karna chahte hain?')) {
      const defaults = {
        badge: 'The Brain Dock Difference',
        title: 'Engineered for Concentration & Clarity',
        subtitle: 'We removed the noise, slow checkouts, and visual clutter to build a reading ecosystem focused purely on comprehension.',
        items: [
          {
            id: 'feat-1',
            icon: 'Laptop',
            title: 'Personal Dedicated Desk',
            description: 'Your own fixed study desk reserved 24/7 with personal multi-plug power sockets, soft-reading LED lamp, and partition privacy.',
            tag: 'Personal Desk'
          },
          {
            id: 'feat-2',
            icon: 'Lock',
            title: 'Personal Secure Locker',
            description: 'Spacious individual lock & key locker for safe storage of heavy reference books, laptops, bags, and study notes.',
            tag: 'Personal Locker'
          },
          {
            id: 'feat-3',
            icon: 'Armchair',
            title: 'Ergonomic Revolving Chair',
            description: '360° revolving executive mesh chairs with breathable backrest, adjustable height, and lumbar support for fatigue-free 12+ hour study sessions.',
            tag: 'Revolving Chair'
          },
          {
            id: 'feat-4',
            icon: 'Coffee',
            title: 'Hygienic Pantry Area',
            description: 'Dedicated clean pantry & refreshment lounge equipped with chilled RO drinking water, hot tea/coffee station, dining tables, and microwave.',
            tag: 'Pantry Area'
          },
          {
            id: 'feat-5',
            icon: 'VolumeX',
            title: 'Acoustic Soundproofing & AC',
            description: 'Calibrated acoustic sound-dampening walls, double-glazed glass, and strict whisper policies ensuring pin-drop silence below 40dB.',
            tag: 'Silent Zone'
          },
          {
            id: 'feat-6',
            icon: 'Wifi',
            title: 'Wi-Fi 7 Gigabit High-Speed Mesh',
            description: 'Low-latency symmetrical fiber mesh internet with seamless roaming and unlimited bandwidth for video lectures and research.',
            tag: 'Gigabit Mesh'
          },
          {
            id: 'feat-7',
            icon: 'Clock',
            title: '24/7 Biometric Smart Punch',
            description: 'High-speed fingerprint and smart terminal access for round-the-clock entry with real-time student study hours tracking.',
            tag: '24/7 Access'
          },
          {
            id: 'feat-8',
            icon: 'ShieldCheck',
            title: 'CCTV Surveillance & Safety',
            description: 'Full HD CCTV camera coverage with dedicated campus security, female scholar safety protocols, and emergency assistance.',
            tag: '100% Secure'
          }
        ]
      };
      setFeaturesConfig(defaults);
      saveFeaturesToServer(defaults);
    }
  };

  const saveFeaturesToServer = async (customConfig = null) => {
    const payload = customConfig || featuresConfig;
    setSavingFeatures(true);
    try {
      const res = await fetch('http://localhost:5000/api/content/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setFeaturesConfig(data.data);
        showToast('✨ Concentration & Clarity Features updated successfully on live website!');
      } else {
        alert(data.message || 'Failed to save features');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save features.');
    } finally {
      setSavingFeatures(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Website Content & Controls
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Homepage & Content Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control live facilities, amenities, stats banner, FAQs, and patron contact inquiries.</p>
        </div>

        <a 
          href="http://localhost:5173" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-all self-start sm:self-auto shadow-xs"
        >
          <span>Open Live Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl text-xs font-semibold shadow-xs">
        <button 
          onClick={() => { setActiveTab('features'); setSearchParams({ tab: 'features' }); }} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'features' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Concentration & Clarity Features ({featuresConfig?.items?.length || 0})</span>
        </button>

        <button 
          onClick={() => { setActiveTab('stats'); setSearchParams({ tab: 'stats' }); }} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Homepage Stats Banner</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${statsConfig.isVisible ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-700'}`}>
            {statsConfig.isVisible ? 'LIVE' : 'HIDDEN'}
          </span>
        </button>

        <button 
          onClick={() => { setActiveTab('messages'); setSearchParams({ tab: 'messages' }); }} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact Messages ({messages.length})</span>
        </button>

        <button 
          onClick={() => { setActiveTab('faqs'); setSearchParams({ tab: 'faqs' }); }} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'faqs' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Knowledge Base FAQs ({faqs.length})</span>
        </button>
      </div>

      {/* TAB: FEATURES (ENGINEERED FOR CONCENTRATION & CLARITY) */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          
          {/* Section Heading Settings & Master Actions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Section 02 Controls
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Engineered for Concentration & Clarity — Facilities Editor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personal Desk, Personal Locker, Revolving Chair, Pantry Area aur anya features ko edit, add ya delete karein.
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setNewFeatureModal(true)}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Facility (नया फीचर जोड़ें)</span>
                </button>

                <button
                  onClick={handleResetFeaturesDefaults}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
                  title="Restore default 8 facilities"
                >
                  Reset Defaults
                </button>

                <button
                  onClick={() => saveFeaturesToServer()}
                  disabled={savingFeatures}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingFeatures ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>

            {/* Editable Section Headers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section Badge Text
                </label>
                <input
                  type="text"
                  value={featuresConfig.badge || ''}
                  onChange={(e) => setFeaturesConfig({ ...featuresConfig, badge: e.target.value })}
                  placeholder="The Brain Dock Difference"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Main Section Title
                </label>
                <input
                  type="text"
                  value={featuresConfig.title || ''}
                  onChange={(e) => setFeaturesConfig({ ...featuresConfig, title: e.target.value })}
                  placeholder="Engineered for Concentration & Clarity"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={featuresConfig.subtitle || ''}
                  onChange={(e) => setFeaturesConfig({ ...featuresConfig, subtitle: e.target.value })}
                  placeholder="We removed the noise, slow checkouts, and visual clutter to build a reading ecosystem..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Feature Items Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900">
                Active Facilities & Amenities ({featuresConfig?.items?.length || 0})
              </h4>
              <span className="text-xs text-slate-500">
                Aap up/down arrows se order badal sakte hain aur direct delete/edit kar sakte hain.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(featuresConfig?.items || []).map((feat, idx) => (
                <div 
                  key={feat.id || idx} 
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition-all space-y-3.5 relative"
                >
                  {/* Top Bar: Icon Preview, Reorder & Delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shrink-0">
                        {renderIconComp(feat.icon)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {feat.title || 'Untitled Facility'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveFeature(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveFeature(idx, 1)}
                        disabled={idx === featuresConfig.items.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feat.id, feat.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Facility"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Tag Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Facility Title
                      </label>
                      <input
                        type="text"
                        value={feat.title || ''}
                        onChange={(e) => handleFeatureItemChange(idx, 'title', e.target.value)}
                        placeholder="e.g. Personal Dedicated Desk"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Badge / Tag
                      </label>
                      <input
                        type="text"
                        value={feat.tag || ''}
                        onChange={(e) => handleFeatureItemChange(idx, 'tag', e.target.value)}
                        placeholder="e.g. Personal Desk"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Visual Icon
                    </label>
                    <select
                      value={feat.icon || 'Laptop'}
                      onChange={(e) => handleFeatureItemChange(idx, 'icon', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description / Explanation
                    </label>
                    <textarea
                      rows={2}
                      value={feat.description || ''}
                      onChange={(e) => handleFeatureItemChange(idx, 'description', e.target.value)}
                      placeholder="Enter description..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
              <button
                onClick={() => setNewFeatureModal(true)}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Facility</span>
              </button>

              <button
                onClick={() => saveFeaturesToServer()}
                disabled={savingFeatures}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
              >
                {savingFeatures ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Changes To Website</span>
              </button>
            </div>
          </div>

          {/* Live Website Preview */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-extrabold text-slate-900">Live Preview — Homepage Rendering</h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Yeh preview dikhata hai ki homepage (http://localhost:5173) par cards kaise dikhenge.
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200">
                  {featuresConfig.badge || 'The Brain Dock Difference'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {featuresConfig.title || 'Engineered for Concentration & Clarity'}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {featuresConfig.subtitle || 'We removed the noise...'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(featuresConfig.items || []).map((feat, i) => (
                  <div key={feat.id || i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                          {renderIconComp(feat.icon)}
                        </div>
                        {feat.tag && (
                          <span className="text-[10px] font-bold font-mono tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                            {feat.tag}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{feat.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: ADD NEW FACILITY */}
      {newFeatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add New Library Facility</h3>
                  <p className="text-xs text-slate-500">Add Personal Desk, Locker, Chair, Pantry or custom feature.</p>
                </div>
              </div>
              <button
                onClick={() => setNewFeatureModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFeatureSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Title *
                </label>
                <input
                  type="text"
                  required
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  placeholder="e.g. Ergonomic Revolving Chair"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={newFeature.tag}
                    onChange={(e) => setNewFeature({ ...newFeature, tag: e.target.value })}
                    placeholder="e.g. Revolving Chair"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={newFeature.icon}
                    onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  placeholder="Describe the facility or feature for students..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewFeatureModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: STATS BANNER */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border transition-all ${
            statsConfig.isVisible 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : 'bg-rose-50/60 border-rose-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  statsConfig.isVisible 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {statsConfig.isVisible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Homepage Statistics Banner Visibility
                    </h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      statsConfig.isVisible 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-rose-600 text-white'
                    }`}>
                      {statsConfig.isVisible ? '🟢 LIVE ON HOMEPAGE' : '🔴 CURRENTLY HIDDEN'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {statsConfig.isVisible 
                      ? 'Yeh 5-column numbers banner public website (http://localhost:5173) per dikh raha hai.' 
                      : 'Yeh section abhi public website per HIDE hai. Koi bhi visitor ise nahi dekh sakta.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleToggleStatsVisibility}
                disabled={savingStats}
                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center space-x-2 shrink-0 ${
                  statsConfig.isVisible
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                }`}
              >
                {statsConfig.isVisible ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide From Website (Hide Karein)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show On Website (Live Karein)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Edit Statistics Metrics & Numbers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Yahan se aap har ek box ka number aur title edit ya change kar sakte hain.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddStatsItem}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
                <button
                  onClick={() => saveStatsToServer()}
                  disabled={savingStats}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingStats ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statsConfig.items.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Metric #{idx + 1}
                    </span>
                    {statsConfig.items.length > 1 && (
                      <button
                        onClick={() => handleRemoveStatsItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete this metric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Display Number / Count
                    </label>
                    <input
                      type="text"
                      value={item.number}
                      onChange={(e) => handleStatsItemChange(idx, 'number', e.target.value)}
                      placeholder="e.g. 45,000+"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label / Description
                    </label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleStatsItemChange(idx, 'label', e.target.value)}
                      placeholder="e.g. Physical Volumes"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Patron Messages & Inquiries</h3>
          {messages.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No pending inquiries. All customer messages replied.</p>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{msg.name} ({msg.email})</span>
                    <span className="text-slate-500 font-mono text-[10px]">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-semibold text-purple-800">{msg.subject}</p>
                  <p className="text-xs text-slate-600">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs hover:border-purple-300 transition-all">
              <span className="text-[10px] font-mono text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 font-medium">{faq.category}</span>
              <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
              <p className="text-xs text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
