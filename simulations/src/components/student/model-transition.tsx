'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, Download } from 'lucide-react';

interface ModelTransitionProps {
  completedModel: string;
  nextModel: string;
  answers: Record<string, any>;
  onContinue: () => void;
  onBack: () => void;
}

export function ModelTransition({ completedModel, nextModel, answers, onContinue, onBack }: ModelTransitionProps) {
  const summaryData = [
    {
      exercise: 'Customer Needs',
      key: 'customer-needs',
      insight: 'Performance runners want comfort + sustainability in one shoe',
      data: 'Top need: All-day comfort with eco-materials',
    },
    {
      exercise: 'Cost Analysis',
      key: 'cost-willingness',
      insight: 'Premium pricing acceptable for performance + sustainability',
      data: 'Price range: $140-$180 with 20-25% eco-premium',
    },
    {
      exercise: 'Purchase Convenience',
      key: 'convenience-purchase',
      insight: 'Direct-to-consumer preferred with try-before-buy options',
      data: '65% prefer Allbirds.com, 30-day returns essential',
    },
    {
      exercise: 'Communication Channels',
      key: 'communication-channels',
      insight: 'Social proof through running community influences purchase',
      data: 'Instagram influencers + running podcasts most effective',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exercises
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                {completedModel} Complete
              </Badge>
            </div>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Summary
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Completion Celebration */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Excellent Work! 🎉</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You've successfully completed the <strong>{completedModel}</strong> analysis. Review your insights below, then continue to the{' '}
            <strong>{nextModel}</strong> to build on this foundation.
          </p>
        </div>

        {/* Summary Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{completedModel} Summary</CardTitle>
            <CardDescription>Your key insights and data points from this model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Exercise</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Key Insight</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Supporting Data</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="font-medium text-gray-900">{row.exercise}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{row.insight}</td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="text-xs">
                          {row.data}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Implications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Strategic Implications</CardTitle>
            <CardDescription>What these insights mean for Allbirds' strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Key Opportunities</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Premium positioning justified by sustainability + performance
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Direct-to-consumer model aligns with customer preferences
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Strong community-driven marketing potential
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Critical Success Factors</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Must deliver on both comfort and sustainability promises
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Seamless online experience with easy returns
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Authentic influencer partnerships in running community
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready for the Next Challenge?</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Now that you understand your customers, let's dive into the <strong>{nextModel}</strong>
                to identify specific market segments and craft your positioning strategy.
              </p>
              <Button onClick={onContinue} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Continue to {nextModel}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
