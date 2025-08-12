'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Bot, Lightbulb, Target, Copy, Sparkles, Edit3, Save, RotateCcw } from 'lucide-react';
import type { Exercise, StudentProgress } from '@/types';

interface ExerciseWorkflowProps {
  exercise: Exercise;
  progress: StudentProgress;
  onProgressUpdate: (progress: Partial<StudentProgress>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExerciseWorkflow({ exercise, progress, onProgressUpdate, onNext, onBack }: ExerciseWorkflowProps) {
  const [studentPrompt, setStudentPrompt] = useState(exercise.examplePrompt);
  const [aiResponse, setAiResponse] = useState('');
  const [editedAiResponse, setEditedAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [promptAttempts, setPromptAttempts] = useState(0);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const maxAttempts = 3;

  useEffect(() => {
    setShowAiResponse(false);
    setAiResponse('');
    setEditedAiResponse('');
    setPromptAttempts(0);
    setPromptHistory([]);
    setStudentPrompt(exercise.examplePrompt);
  }, [exercise.id]);

  const handleAskAI = async () => {
    if (promptAttempts >= maxAttempts) {
      return;
    }

    setIsGenerating(true);
    setShowAiResponse(true);

    const newAttempts = promptAttempts + 1;
    setPromptAttempts(newAttempts);
    setPromptHistory((prev) => [...prev, studentPrompt]);

    // Simulate AI response delay
    setTimeout(() => {
      const mockResponses: Record<string, string> = {
        'customer-needs': `Based on market research and Allbirds' eco-conscious customer base, here are the top 5 customer needs for their new performance running shoe:

1. **All-day comfort & cushioning** - Lightweight, responsive foam that supports long-distance running while maintaining the comfort Allbirds is known for.

2. **Sustainable materials** - 100% natural or recycled materials (eucalyptus, merino wool, sugarcane) that align with their environmental values.

3. **Breathability & moisture management** - Advanced ventilation to keep feet dry during intense workouts, especially important for performance shoes.

4. **Durability for active use** - Enhanced wear resistance for trails, pavement, and varied terrain while maintaining eco-friendly construction.

5. **Versatile style** - Clean, minimalist design that transitions from workout to casual wear, fitting the modern lifestyle.

*Key Insight: Performance and sustainability are equally important - customers won't compromise on either.*`,

        'cost-willingness': `Based on competitor analysis and consumer surveys in the sustainable athletic footwear market:

**Price Range Analysis:** $140-$180
- **Entry point:** $140 (competitive with mainstream performance shoes)
- **Premium ceiling:** $180 (justified by sustainability + performance)
- **Sweet spot:** $160 (optimal value perception)

**Eco-Premium Breakdown:**
- Standard performance shoe baseline: $120-140
- Sustainability premium: 20-25% ($24-35 additional)
- Performance technology premium: 10-15% ($12-21 additional)

**Competitive Landscape:**
- Nike Pegasus: $130 | Adidas Ultraboost: $180 | Brooks Ghost: $140
- Allbirds Tree Runners (casual): $98
- Veja V-10 (sustainable): $150

**Strategic Recommendation:** Launch at $160 to signal premium quality while remaining accessible to eco-conscious athletes who prioritize both performance and values.`,

        'convenience-purchase': `Purchase and delivery preferences analysis for Allbirds performance running shoe buyers:

**Channel Preference Breakdown:**

**1. Allbirds.com - 65% of target purchases**
- **Why:** Full brand story, sustainability details, material transparency
- **Expectations:** Free shipping $75+, carbon-neutral delivery, detailed sizing guides
- **Behavior:** Research extensively, read reviews, watch product videos

**2. Premium sporting goods retailers - 20%**
- **Partners:** REI, Dick's Sporting Goods, specialty running stores
- **Critical for:** "Try-before-buy" experience with performance shoes
- **Customer journey:** Test fit in-store → often purchase online for convenience

**3. Amazon - 15% (growing convenience segment)**
- **Driver:** Prime 2-day delivery, familiar checkout experience
- **Trade-off:** Less brand engagement, more price/review focused
- **Strategy:** Important for reach but requires strong brand presence

**Key Convenience Requirements:**
✅ 30-day free returns/exchanges (non-negotiable for online shoe sales)
✅ Size exchange program for first-time Allbirds buyers  
✅ Virtual fit technology or comprehensive sizing guides
✅ Sustainable packaging that customers can reuse or recycle
✅ Real-time inventory visibility across channels`,

        'communication-channels': `Most effective marketing channels and messaging strategy for eco-conscious runners:

**Multi-Channel Strategy & Budget Allocation:**

**1. Social Media Influencers - 40% of discovery budget**
- **Platform focus:** Instagram (60%), TikTok (40%)
- **Target:** Micro-influencers (10K-100K) in running/sustainability niches
- **Message hook:** "Run your best race while running clean - performance meets planet"
- **Content types:** Training videos, sustainability behind-the-scenes, performance testing
- **Success metrics:** Engagement rate, click-through to product pages

**2. Running Community Media - 30% of influence budget**
- **Channels:** Podcasts (The Running Podcast, Marathon Training Academy), blogs (Runner's World, Outside Magazine)
- **Message hook:** "Finally, a performance shoe that matches your values"
- **Strategy:** Sponsored content + product seeding to hosts/writers
- **Content:** Technical deep-dives, athlete testimonials, sustainability certifications

**3. Email & App Marketing - 25% of conversion budget**
- **Audience:** Existing Allbirds customers + running newsletter subscribers
- **Message hook:** "Your next PR starts here: pre-order the carbon-neutral running shoe"
- **Content:** Early access, exclusive colorways, performance data, training tips
- **Timing:** Pre-launch sequence, seasonal training cycles

**4. Event Marketing - 5% but high impact**
- **Strategy:** Marathon expo booths, post-race recovery lounges, running club partnerships
- **Message:** "Test the difference sustainable performance makes"
- **Activation:** Free shoe trials, sustainability education, community building

**Unified Campaign Theme:** "Run Clean" - Performance without environmental compromise`,

        'synthesis-4cs': `## 4Cs STRATEGIC FRAMEWORK SYNTHESIS
### ALLBIRDS PERFORMANCE RUNNING SHOE LAUNCH

| **Framework** | **Strategic Insight** | **Key Data Points** | **Implementation Priority** |
|---------------|----------------------|-------------------|---------------------------|
| **CUSTOMER** | Performance runners demand both athletic excellence AND environmental responsibility - no compromise | • Top 5 needs identified: comfort, sustainability, breathability, durability, style<br>• Equal priority on performance + eco-values<br>• Target: eco-conscious athletes | **HIGH** - Foundation for all decisions |
| **COST** | Premium pricing strategy viable due to dual value proposition and target demographic willingness to pay for values alignment | • Optimal range: $140-$180<br>• Recommended launch: $160<br>• 20-25% eco-premium acceptable<br>• Competitive with performance leaders | **HIGH** - Revenue model validation |
| **CONVENIENCE** | Direct-to-consumer strength with strategic retail partnerships for trial experiences | • 65% prefer Allbirds.com<br>• 20% need in-store trial<br>• 30-day returns essential<br>• Multi-channel inventory sync required | **MEDIUM** - Operational excellence |
| **COMMUNICATION** | Community-driven, authenticity-focused marketing through running influencers and specialized media | • Social influencers: 40% discovery<br>• Running media: 30% influence<br>• Email/app: 25% conversion<br>• "Run Clean" messaging resonates | **MEDIUM** - Brand building |

### 🎯 **STRATEGIC IMPLICATIONS FOR NEXT PHASE (STP):**

**✅ VALIDATED MARKET OPPORTUNITIES:**
- Premium sustainable performance segment exists and is underserved
- Direct-to-consumer model aligns with customer preferences  
- Clear differentiation space between pure performance and pure sustainability brands
- Community-driven marketing approach matches target behavior

**⚠️ CRITICAL SUCCESS FACTORS:**
- Must deliver authentic performance credentials to running community
- Sustainability claims need third-party verification and transparency
- Seamless omnichannel experience with robust return/exchange program
- Influencer partnerships must feel authentic, not transactional

**📈 NEXT STEPS - STP MODEL FOCUS:**
1. **Segmentation:** Use customer insights to identify distinct runner segments
2. **Targeting:** Prioritize segments based on size, growth, and strategic fit
3. **Positioning:** Craft compelling value proposition that leverages unique dual-benefit positioning

**🔄 FEEDBACK LOOP:** These 4Cs insights will inform STP decisions, which will then refine the 4Ps tactical execution.`,
      };

      const response =
        mockResponses[exercise.id] ||
        `AI response for ${exercise.title} would appear here based on your prompt. This response would be contextually relevant to the specific exercise and build upon previous insights from completed exercises.`;
      setAiResponse(response);
      setEditedAiResponse(response);
      setIsGenerating(false);
    }, 2000);
  };

  const handleEditResponse = () => {
    setIsEditingResponse(true);
  };

  const handleSaveEdit = () => {
    setAiResponse(editedAiResponse);
    setIsEditingResponse(false);
  };

  const handleCancelEdit = () => {
    setEditedAiResponse(aiResponse);
    setIsEditingResponse(false);
  };

  const handleSaveAndNext = () => {
    // Save the current exercise answers
    onProgressUpdate({
      answers: {
        ...progress.answers,
        [exercise.id]: {
          prompt: studentPrompt,
          aiResponse: editedAiResponse || aiResponse,
          finalAnswer: '', // Removed final answer requirement
        },
      },
      completedExercises: [...progress.completedExercises, exercise.id],
    });

    onNext();
  };

  const canProceed = showAiResponse && (aiResponse || editedAiResponse);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Badge variant="outline">{exercise.model}</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Step {exercise.modelStep} of {exercise.totalSteps}
              </div>
              <div className="w-32">
                <Progress value={(exercise.modelStep / exercise.totalSteps) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">{exercise.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{exercise.instructions}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Guidelines & Boundaries
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {exercise.guidelines.map((guideline, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Copy className="w-4 h-4 mr-2 text-green-600" />
                  Example Prompt
                </CardTitle>
                <CardDescription>You can copy this prompt or modify it for your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-800 italic">"{exercise.examplePrompt}"</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={() => setStudentPrompt(exercise.examplePrompt)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Input
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expected Output Example</CardTitle>
                <CardDescription>Reference for what a good response looks like</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{exercise.expectedOutput}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Student Interaction */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Your AI Prompt</CardTitle>
                    <CardDescription>Write or edit your prompt to ask AI for insights</CardDescription>
                  </div>
                  <Badge variant={promptAttempts >= maxAttempts ? 'destructive' : 'secondary'}>
                    {promptAttempts}/{maxAttempts} attempts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={studentPrompt}
                  onChange={(e) => setStudentPrompt(e.target.value)}
                  placeholder="Enter your AI prompt here..."
                  className="min-h-[120px] resize-none"
                />
                <Button
                  onClick={handleAskAI}
                  disabled={isGenerating || !studentPrompt.trim() || promptAttempts >= maxAttempts}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating Response...
                    </>
                  ) : promptAttempts >= maxAttempts ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Max Attempts Reached
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Ask AI ({maxAttempts - promptAttempts} left)
                    </>
                  )}
                </Button>

                {promptHistory.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Previous Prompts:</h5>
                    <div className="space-y-2">
                      {promptHistory.map((prompt, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                          <span className="font-medium">Attempt {index + 1}:</span> {prompt.substring(0, 100)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {showAiResponse && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Bot className="w-5 h-5 mr-2 text-blue-600" />
                      AI Response
                    </CardTitle>
                    {!isGenerating && aiResponse && (
                      <Button variant="outline" size="sm" onClick={isEditingResponse ? handleCancelEdit : handleEditResponse}>
                        {isEditingResponse ? (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Response
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {isEditingResponse ? 'Edit the AI response if needed for accuracy' : 'AI-generated response based on your prompt'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="space-y-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ) : isEditingResponse ? (
                    /* Added editable textarea for AI response */
                    <div className="space-y-4">
                      <Textarea
                        value={editedAiResponse}
                        onChange={(e) => setEditedAiResponse(e.target.value)}
                        className="min-h-[200px] resize-none font-mono text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{aiResponse}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showAiResponse && !isEditingResponse && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {canProceed ? <span className="text-green-600">✓ Ready to proceed to next exercise</span> : <span>Generate AI response to continue</span>}
                    </div>
                    <Button onClick={handleSaveAndNext} disabled={!canProceed} className="bg-green-600 hover:bg-green-700">
                      Next Exercise
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
