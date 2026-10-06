import React from 'react';
import { 
  ShieldCheck, 
  VolumeX, 
  BookOpen, 
  Clock, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export default function RulesPage() {
  const sections = [
    {
      icon: VolumeX,
      title: 'Noise & Acoustic Discipline Policy',
      rules: [
        'Silent Reading Zones (Zone A & Focus Cubicles) require absolute silence at all times (<40 dB).',
        'Mobile phones must remain on strict vibration/silent mode. Voice calls must be taken exclusively in exterior phone booths or terrace lobbies.',
        'Headphones are mandatory for all laptop audio, lectures, and online classes.',
        'Whispered conversations are permitted solely inside soundproof group discussion suites.'
      ]
    },
    {
      icon: BookOpen,
      title: 'Book Issue, Loan & Circulation Rules',
      rules: [
        'Members must check out physical books via the RFID automated circulation kiosk or circulation desk before leaving the premises.',
        'Loan periods: 14 days (Basic), 21 days (Scholar), and 30 days (Executive). Up to 2 automated online renewals are allowed if no reservations exist.',
        'A standard overdue fine of ₹10 per day applies to late returns past the grace period.',
        'Any physical marking, underlining, page tearing, or moisture damage will incur a replacement fee.'
      ]
    },
    {
      icon: Clock,
      title: 'Operating Hours & 24/7 Access Etiquette',
      rules: [
        'General public & basic member hours: 07:00 AM to 11:00 PM daily.',
        'Scholar and Executive 24/7 night access requires physical verification via Digital RFID Card or Member App QR scan.',
        'Loitering, sleeping on desks, or leaving personal belongings unattended for more than 45 minutes is prohibited.',
        'Personal belongings left unattended after hours will be safely moved to the Lost & Found locker.'
      ]
    },
    {
      icon: Wifi,
      title: 'Digital Commons & Internet Usage Policy',
      rules: [
        'Brain Dock Gigabit Wi-Fi 7 network is dedicated to research, coding, academic studies, and professional development.',
        'Torrenting, peer-to-peer downloading of pirated media, and accessing malicious content will result in immediate network revocation.',
        'Members are responsible for maintaining firewall and anti-malware safeguards on their connected devices.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Community Standards
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Library Rules & <span className="text-gradient-dark-purple">Code of Conduct</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Our rules exist to preserve an atmosphere of deep concentration, mutual respect, and academic sanctuary for all members.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="space-y-8">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-purple-50">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{sec.title}</h3>
                </div>

                <div className="space-y-3 pt-2">
                  {sec.rules.map((rule, rIdx) => (
                    <div key={rIdx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
