import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layout, 
  Stethoscope, 
  GraduationCap, 
  HeartPulse, 
  WifiOff, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Save, 
  DollarSign, 
  CheckCircle2,
  Presentation as PresentationIcon,
  ArrowRight
} from 'lucide-react';

const slides = [
  {
    id: 'intro',
    title: 'Living Hope Digital Management System (LHDMS)',
    subtitle: 'Transforming Community Healthcare Through Digital Innovation',
    content: 'A custom-built, enterprise-grade digital platform developed to modernize Living Hope’s operational ecosystem by replacing fragmented paper-based processes with a secure, intelligent, and fully centralized digital solution.',
    icon: <PresentationIcon className="w-16 h-16 text-blue-600" />,
    gradient: 'from-blue-600 to-indigo-700',
    type: 'title'
  },
  {
    id: 'problem',
    title: 'The Foundation of Impact',
    subtitle: 'Why Digital Matters',
    content: 'In community healthcare, accurate data is not optional — it is the foundation of effective care, donor compliance, and sustainable impact.',
    points: [
      'Replace fragmented paper processes',
      'Secure & intelligent data handling',
      'Centralized operational ecosystem',
      'Real-time decision making'
    ],
    icon: <Layout className="w-12 h-12 text-blue-500" />,
    type: 'content'
  },
  {
    id: 'hct',
    title: 'HCT Module',
    subtitle: 'HIV Counseling & Testing',
    content: 'A digitized testing and patient tracking environment designed to improve accuracy and follow-up efficiency.',
    features: [
      'Real-time capture of facility testing data',
      'Record HIV outcomes & TB testing',
      'Track ARV counseling referrals',
      'Validation-driven accuracy'
    ],
    benefit: 'Reduces human error and ensures reliable healthcare reporting.',
    icon: <HeartPulse className="w-12 h-12 text-red-500" />,
    color: 'bg-red-50',
    type: 'module'
  },
  {
    id: 'lse',
    title: 'LSE Module',
    subtitle: 'Life Skills Education',
    content: 'A centralized education engagement management system for youth development programs.',
    features: [
      'Student registration & attendance tracking',
      'Club management (Afternoon & Holiday)',
      'Regional & grade-level participation analytics',
      'Engagement trend monitoring'
    ],
    benefit: 'Provides measurable insights into community reach and participation.',
    icon: <GraduationCap className="w-12 h-12 text-emerald-500" />,
    color: 'bg-emerald-50',
    type: 'module'
  },
  {
    id: 'hcc',
    title: 'HCC Module',
    subtitle: 'Health Care Centre',
    content: 'Comprehensive healthcare management platform for HIV and community patient care.',
    features: [
      'Admissions & discharge management',
      'Wound care & treatment tracking',
      'IPU day monitoring (Government integration)',
      'Clinical outcome tracking'
    ],
    benefit: 'Creates a fully centralized ecosystem for continuity of care.',
    icon: <Stethoscope className="w-12 h-12 text-blue-500" />,
    color: 'bg-blue-50',
    type: 'module'
  },
  {
    id: 'tech-offline',
    title: 'Offline-First Infrastructure',
    subtitle: 'Engineering for the Field',
    content: 'Built specifically for operations in low-connectivity environments.',
    capabilities: [
      'Uninterrupted data capture without internet',
      'Secure local storage',
      'Automatic sync when connectivity returns'
    ],
    advantage: 'Ensures reliable service delivery even in remote underserved areas.',
    icon: <WifiOff className="w-12 h-12 text-amber-500" />,
    type: 'feature'
  },
  {
    id: 'tech-analytics',
    title: 'Analytics & Reporting',
    subtitle: 'Intelligence at your Fingertips',
    content: 'Management gains instant visibility into operational performance.',
    features: [
      'Real-time admin dashboard',
      'Automated Excel reporting (donor-ready)',
      'Transform weeks of work into minutes',
      'Proactive resource allocation'
    ],
    icon: <BarChart3 className="w-12 h-12 text-indigo-500" />,
    type: 'feature'
  },
  {
    id: 'impact',
    title: 'Operational & Financial Impact',
    subtitle: 'Beyond Software: Real Value',
    content: 'Dramatically reduces repetitive administrative work and saves thousands of staff hours annually.',
    impacts: [
      { label: 'Admin Costs', text: 'Saves thousands of staff hours by eliminating duplicate entry.' },
      { label: 'Donor Compliance', text: 'Protects funding through high-quality, auditable datasets.' },
      { label: 'Resource Efficiency', text: 'Smarter allocation through real-time operational visibility.' }
    ],
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    type: 'impact'
  },
  {
    id: 'value',
    title: 'Market Value',
    subtitle: 'A Professional Investment',
    content: 'The LHDMS is a fully customized enterprise management platform.',
    cost: 'R250,000 – R800,000+',
    details: [
      'Full-stack software development',
      'Database engineering',
      'Offline sync infrastructure',
      'Automated reporting systems'
    ],
    maintenance: 'Additional maintenance: R50k - R200k/year',
    icon: <DollarSign className="w-12 h-12 text-green-600" />,
    type: 'value'
  },
  {
    id: 'closing',
    title: 'Ready for the Future',
    subtitle: 'LHDMS: Scalable. Accountable. Digital.',
    content: 'Positioning Living Hope for a more efficient, accountable, and digitally empowered future.',
    icon: <CheckCircle2 className="w-20 h-20 text-blue-600" />,
    type: 'closing'
  }
];

export default function PitchPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const slide = slides[currentSlide];

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-5xl mb-8 flex gap-1 h-1">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`flex-1 transition-all duration-300 rounded-full ${idx <= currentSlide ? 'bg-blue-500' : 'bg-slate-700'}`} 
          />
        ))}
      </div>

      <div className="w-full max-w-5xl aspect-video bg-white rounded-3xl shadow-2xl overflow-hidden relative group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="h-full"
          >
            {slide.type === 'title' ? (
              <div className={`h-full bg-gradient-to-br ${slide.gradient} text-white flex flex-col items-center justify-center text-center p-12`}>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white p-6 rounded-3xl mb-8 shadow-xl"
                >
                  {slide.icon}
                </motion.div>
                <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight max-w-3xl">
                  {slide.title}
                </h1>
                <p className="text-xl text-blue-100 font-medium tracking-wide mb-12 border-l-4 border-blue-400 pl-4 py-2">
                  {slide.subtitle}
                </p>
                <p className="text-lg text-blue-50/80 max-w-2xl leading-relaxed">
                  {slide.content}
                </p>
              </div>
            ) : slide.type === 'module' ? (
              <div className="h-full flex flex-col md:flex-row">
                <div className={`w-full md:w-1/2 ${slide.color} flex items-center justify-center p-12`}>
                   <div className="bg-white p-8 rounded-full shadow-lg">
                      {slide.icon}
                   </div>
                </div>
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                  <div className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">{slide.title}</div>
                  <h2 className="text-4xl font-black text-slate-800 mb-6">{slide.subtitle}</h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">{slide.content}</p>
                  <div className="space-y-4 mb-8">
                    {slide.features?.map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-500 italic">"{slide.benefit}"</p>
                  </div>
                </div>
              </div>
            ) : slide.type === 'impact' ? (
              <div className="h-full p-12 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                   {slide.icon}
                   <div>
                    <h2 className="text-3xl font-black text-slate-800">{slide.title}</h2>
                    <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">{slide.subtitle}</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                  {slide.impacts?.map((imp, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-black mb-4">
                        {i + 1}
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">{imp.label}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{imp.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-blue-600 rounded-2xl text-white flex items-center justify-between">
                   <span className="font-bold tracking-wide">Transforming weeks into minutes.</span>
                   <Zap className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            ) : slide.type === 'value' ? (
              <div className="h-full p-12 flex flex-col items-center justify-center text-center">
                 <div className="bg-green-50 p-6 rounded-full mb-8">
                    {slide.icon}
                 </div>
                 <h2 className="text-4xl font-black text-slate-800 mb-2">{slide.title}</h2>
                 <p className="text-slate-600 text-lg mb-8">{slide.subtitle}</p>
                 
                 <div className="bg-slate-900 text-white p-8 rounded-3xl w-full max-w-xl mb-8 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign className="w-12 h-12" /></div>
                    <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Estimated Market Value</div>
                    <div className="text-5xl font-black text-green-400 mb-4">{slide.cost}</div>
                    <div className="grid grid-cols-2 gap-2 text-left text-xs text-slate-300">
                      {slide.details?.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />
                          {d}
                        </div>
                      ))}
                    </div>
                 </div>
                 <p className="text-sm text-slate-500 font-medium">
                   Current Operational Impact: <span className="text-blue-600 font-bold">Unmeasurable ROI</span> through digital efficiency.
                 </p>
              </div>
            ) : slide.type === 'closing' ? (
              <div className="h-full flex items-center justify-center text-center p-12 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
                  <div className="grid grid-cols-8 gap-4 rotate-12 scale-150">
                    {Array.from({length: 32}).map((_, i) => (
                      <CheckCircle2 key={i} className="w-12 h-12 text-blue-500" />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {slide.icon}
                  </motion.div>
                  <h2 className="text-5xl font-black text-slate-800 mt-8 mb-4">{slide.title}</h2>
                  <p className="text-2xl text-blue-600 font-bold mb-12">{slide.subtitle}</p>
                  <button 
                    onClick={() => setCurrentSlide(0)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all group"
                  >
                    Start Over
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full p-12 flex flex-col items-center justify-center text-center">
                {slide.icon}
                <h2 className="text-4xl font-black text-slate-800 mt-8 mb-4">{slide.title}</h2>
                <p className="text-blue-600 font-bold uppercase tracking-widest mb-6">{slide.subtitle}</p>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed mb-8">{slide.content}</p>
                
                {slide.points && (
                  <div className="grid grid-cols-2 gap-4">
                    {slide.points.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        {p}
                      </div>
                    ))}
                  </div>
                )}

                {slide.capabilities && (
                  <div className="space-y-4 text-left w-full max-w-md">
                     {slide.capabilities.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                           <Zap className="w-5 h-5 text-amber-500" />
                           <span className="font-bold text-slate-700">{c}</span>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-start p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="w-12 h-12 bg-white/80 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-800 hover:bg-white disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="w-12 h-12 bg-white/80 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-800 hover:bg-white disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mt-8 text-slate-500 font-medium text-sm flex items-center gap-4">
        <span>Slide {currentSlide + 1} of {slides.length}</span>
        <div className="w-px h-4 bg-slate-700" />
        <span className="text-slate-400">Use arrow keys or click to navigate</span>
      </div>
    </div>
  );
}
