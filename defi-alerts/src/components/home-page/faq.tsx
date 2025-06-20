'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What types of alerts can I create?',
    answer:
      'Our system supports various alert types including market-wide opportunities (APY changes, liquidity mining campaigns, new incentives), position health monitoring (liquidation risk, out-of-range positions), idle funds detection, and comparative yield alerts. You can set precise thresholds with decimal precision (e.g., 0.01%) and use various comparison operators (>, <, ≥, ≤, outside range).',
  },
  {
    question: 'Which chains and protocols are supported?',
    answer:
      'We support any EVM or non-EVM chain, L2, side-chain, or roll-up. This includes Ethereum, Polygon, Base, Optimism, Arbitrum, Solana, and more. We cover lending protocols, DEXes/AMMs, perpetuals markets, vaults, restaking platforms, liquid staking, money markets, and bridges.',
  },
  {
    question: 'How do users get notified?',
    answer:
      'Users can receive notifications through multiple channels: Email, SMS, Push, Telegram, Discord, Slack, Webhook, Matrix, PagerDuty, or custom callback URLs. They can control frequency (real-time, batched digest), set severity levels (Info/Warning/Critical), and customize delivery preferences for each alert type.',
  },
  {
    question: 'How does portfolio discovery work?',
    answer:
      'Users can connect their wallet via SIWE (Sign-In With Ethereum) for automatic discovery of all active positions across protocols and chains. We support cross-chain address aliasing (same EOA on multiple chains) and multi-wallet portfolios. Users can also manually add positions by transaction hash or position ID.',
  },
  {
    question: 'What are your scalability and performance metrics?',
    answer:
      'Our system is designed to handle 1M+ active users, 100M+ active alerts, and process 10k+ events/second. We guarantee < 300ms p95 rule evaluation latency and 99.9% delivery success rate. Our architecture uses stateless microservices with horizontal scaling for maximum resilience.',
  },
  {
    question: 'How can I onboard my protocol or integrate with my application?',
    answer:
      'Our onboarding process is streamlined for DeFi teams. We start with a technical discovery call, followed by API integration and customization of your alert parameters. Most protocols are fully onboarded within 2 weeks, with dedicated support throughout the process. For applications, our API and webhook system provides simple integration points.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#f1f1f3]">Frequently Asked Questions</h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[#d1d5da]">
              <button className="w-full py-5 flex justify-between items-center text-left focus:outline-none" onClick={() => toggleFaq(index)}>
                <span className="text-lg font-medium text-[#f1f1f3]">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 text-[#f1f1f3] transition-transform ${openIndex === index ? 'transform rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                <p className="text-[#f1f1f3]/80">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
