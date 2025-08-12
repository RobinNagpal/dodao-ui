'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Download, Share, RotateCcw, Trophy, FileText } from 'lucide-react';
import { useState } from 'react';

interface FinalOutputProps {
  answers: Record<string, any>;
  onRestart: () => void;
}

export function FinalOutput({ answers, onRestart }: FinalOutputProps) {
  const [reflection, setReflection] = useState('');

  const marketingPlan = {
    '4Cs': {
      customer: 'Performance runners seeking eco-friendly shoes with all-day comfort and sustainable materials',
      cost: '$140-$180 price range with 20-25% premium for sustainability credentials',
      convenience: '65% prefer direct-to-consumer via Allbirds.com with 30-day free returns',
      communication: 'Instagram influencers and running community podcasts with "Run Clean" messaging',
    },
    STP: {
      segmentation: 'Eco-conscious runners (primary), Luxury lifestyle buyers, Outdoor adventurers',
      targeting: 'Eco-conscious runners aged 25-40, urban professionals, high sustainability values',
      positioning: 'The only performance running shoe that delivers elite comfort with 100% sustainable materials',
    },
    '4Ps': {
      product: 'Carbon-neutral running shoe with eucalyptus mesh, sugarcane foam, recyclable components',
      price: '$160 launch price using value-based pricing strategy',
      place: 'Allbirds.com (primary), selective REI partnership, marathon event pop-ups',
      promotion: '"Run Fast. Leave Zero Trace" campaign via social media and running community events',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Marketing Plan Complete</h1>
                <p className="text-sm text-gray-600">Allbirds Performance Running Shoe Strategy</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Completion Celebration */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Congratulations! 🎉</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You've successfully completed the full marketing strategy for Allbirds' new performance running shoe. Your comprehensive plan combines customer
            insights, strategic positioning, and tactical execution.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              15 Exercises Completed
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              3 Marketing Models Mastered
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              AI-Powered Analysis
            </Badge>
          </div>
        </div>

        {/* Marketing Plan Summary */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-blue-600 mr-2" />
              <CardTitle className="text-2xl">Complete Marketing Plan</CardTitle>
            </div>
            <CardDescription className="text-lg">Allbirds Performance Running Shoe Go-to-Market Strategy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 4Cs Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                4Cs of Marketing - Customer Foundation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Customer</h4>
                  <p className="text-sm text-blue-800">{marketingPlan['4Cs'].customer}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Cost</h4>
                  <p className="text-sm text-blue-800">{marketingPlan['4Cs'].cost}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Convenience</h4>
                  <p className="text-sm text-blue-800">{marketingPlan['4Cs'].convenience}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Communication</h4>
                  <p className="text-sm text-blue-800">{marketingPlan['4Cs'].communication}</p>
                </div>
              </div>
            </div>

            {/* STP Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                STP Model - Strategic Focus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Segmentation</h4>
                  <p className="text-sm text-green-800">{marketingPlan.STP.segmentation}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Targeting</h4>
                  <p className="text-sm text-green-800">{marketingPlan.STP.targeting}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Positioning</h4>
                  <p className="text-sm text-green-800">{marketingPlan.STP.positioning}</p>
                </div>
              </div>
            </div>

            {/* 4Ps Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                4Ps of Marketing - Tactical Execution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Product</h4>
                  <p className="text-sm text-purple-800">{marketingPlan['4Ps'].product}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Price</h4>
                  <p className="text-sm text-purple-800">{marketingPlan['4Ps'].price}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Place</h4>
                  <p className="text-sm text-purple-800">{marketingPlan['4Ps'].place}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Promotion</h4>
                  <p className="text-sm text-purple-800">{marketingPlan['4Ps'].promotion}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Success Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Recommended Success Metrics</CardTitle>
            <CardDescription>KPIs to track the success of your marketing strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">$2.5M</div>
                <div className="text-sm text-gray-600">Revenue Target (Year 1)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">15%</div>
                <div className="text-sm text-gray-600">Market Share Goal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">25%</div>
                <div className="text-sm text-gray-600">Customer Acquisition Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reflection Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Your Learning Reflection</CardTitle>
            <CardDescription>Share your thoughts on what you learned through this AI-powered marketing exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on your experience: What insights surprised you? How did AI help your analysis? What would you do differently? What marketing concepts became clearer?"
              className="min-h-[120px] resize-none"
            />
            <div className="mt-4 text-sm text-gray-500">This reflection will be included in your exported summary</div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline" size="lg" onClick={onRestart} className="px-8 bg-transparent">
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Another Case Study
          </Button>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
            <Download className="w-5 h-5 mr-2" />
            Download Complete Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
