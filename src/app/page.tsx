import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileSpreadsheet, Sparkles, ShieldCheck, BarChart3, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {/* PayNet Logo */}
          <Image
            src="/paynet-logo/PayNet_idMP2sqDgs_0.svg"
            alt="PayNet Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-lg font-semibold tracking-tight text-slate-700">Cloud Risk Assessment</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/cra"
            className="text-sm font-medium text-slate-600 hover:text-paynet-blue transition-colors"
          >
            Launch App
          </Link>
          <Link
            href="/cra"
            className="bg-paynet-blue hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-sky-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-paynet-blue px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>Now with AI-Powered Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Automate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-paynet-blue to-paynet-light">Cyber Risk Assessment</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Upload your CRA Excel workbooks, parse complex data instantly, and leverage Gemini AI to analyze responses, identify gaps, and generate mitigation plans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cra"
              className="group bg-slate-900 hover:bg-slate-800 text-white text-lg font-medium px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="text-slate-600 hover:text-slate-900 font-medium px-8 py-4 flex items-center gap-2 transition-colors">
              View Documentation
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<FileSpreadsheet className="w-6 h-6 text-emerald-600" />}
            title="Instant Parsing"
            description="Drag & drop your Excel files. We automatically extract Cloud Solution Details and Assessment responses in seconds."
            color="bg-emerald-50 border-emerald-100"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-violet-600" />}
            title="AI Analysis"
            description="Our AI engine reviews every answer, providing a PASS/FAIL opinion, reasoning, and identifying required actions."
            color="bg-violet-50 border-violet-100"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-amber-600" />}
            title="Auto-Mitigation"
            description="Found a gap? Generate professional mitigation plans and remediation steps with a single click."
            color="bg-amber-50 border-amber-100"
          />
        </div>

        {/* Stats / Trust */}
        <div className="mt-32 border-t border-slate-200 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat label="Questions Processed" value="10k+" />
            <Stat label="Time Saved" value="85%" />
            <Stat label="Accuracy" value="99.9%" />
            <Stat label="Security" value="Enterprise" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            © 2026 PayNet. Built for Security Professionals by CISO R&D team.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={`p-8 rounded-3xl border ${color} hover:shadow-lg transition-all duration-300 cursor-default group`}>
      <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-4xl font-extrabold text-slate-900 mb-2">{value}</div>
      <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
