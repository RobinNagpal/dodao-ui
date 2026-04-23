import Link from 'next/link';
import { EtfInvestor, EtfInvestorGoal, EtfInvestorGoalEtf, EtfInvestorProfile } from '@/types/etf/etf-analysis-types';

function ProfileGrid({ profile }: { profile: EtfInvestorProfile }): JSX.Element {
  const items: Array<{ label: string; value: string }> = [
    { label: 'Investment horizon', value: profile.investmentHorizon },
    { label: 'Risk tolerance', value: profile.riskTolerance },
    { label: 'Primary goal', value: profile.primaryGoal },
    { label: 'Income need', value: profile.incomeNeed },
    { label: 'Tax sensitivity', value: profile.taxSensitivity },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      {items.map((item) => (
        <div key={item.label} className="bg-[#111827] border border-[#374151] rounded-md px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">{item.label}</p>
          <p className="text-sm text-white font-semibold mt-0.5">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function BulletList({ title, items, accent }: { title: string; items: string[]; accent: 'neutral' | 'warning' }): JSX.Element {
  const titleColor = accent === 'warning' ? 'text-red-300' : 'text-gray-300';
  return (
    <div>
      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${titleColor}`}>{title}</h3>
      <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm text-[#E5E7EB]">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EtfRecommendationCard({ etf }: { etf: EtfInvestorGoalEtf }): JSX.Element {
  return (
    <div className="bg-[#111827] border border-[#374151] rounded-md p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/etfs/${etf.exchange}/${etf.symbol}`} className="inline-flex items-center gap-1 text-white hover:text-[#FBBF24] transition-colors">
          <span className="text-xs font-bold bg-[#4F46E5] text-white px-1.5 py-0.5 rounded">{etf.symbol}</span>
          <span className="text-xs text-gray-400">· {etf.exchange}</span>
        </Link>
      </div>
      <p className="text-sm text-white font-medium leading-snug">{etf.name}</p>
      <p className="text-xs text-gray-300 leading-relaxed">{etf.why}</p>
    </div>
  );
}

interface EtfInvestorGoalDetailViewProps {
  investor: EtfInvestor;
  goal: EtfInvestorGoal;
}

export default function EtfInvestorGoalDetailView({ investor, goal }: EtfInvestorGoalDetailViewProps): JSX.Element {
  return (
    <article className="text-[#E5E7EB]">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{investor.name}</p>
      <h1 className="text-3xl font-bold text-white mb-3">{goal.name}</h1>
      <p className="text-base text-[#E5E7EB] mb-6">{goal.shortDescription}</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Investor profile</h2>
        <ProfileGrid profile={goal.profile} />
        <div className="bg-[#111827] border border-[#374151] rounded-md px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Typical investor</p>
          <p className="text-sm text-white mt-0.5 leading-relaxed">{goal.profile.typicalInvestor}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Analysis angle</h2>
        <p className="text-sm text-[#E5E7EB] leading-relaxed">{goal.analysisAngle}</p>
      </section>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <BulletList title="Key considerations" items={goal.keyConsiderations} accent="neutral" />
        <BulletList title="Red flags" items={goal.redFlags} accent="warning" />
      </section>

      <section className="bg-[#1F2937] border border-[#374151] rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Recommended ETFs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {goal.etfs.map((etf) => (
            <EtfRecommendationCard key={`${etf.exchange}-${etf.symbol}`} etf={etf} />
          ))}
        </div>
      </section>
    </article>
  );
}
