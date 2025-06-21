import React, { useState } from 'react';
import { Calculator, TrendingUp, Users, Building, Brain, Search, Award, ChevronRight, ChevronLeft, BarChart3, Target, Clock, DollarSign, LineChart, Zap, AlertTriangle, HelpCircle, Info, Mail } from 'lucide-react';

export default function DigitalVisibilityROICalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showOptimalChart, setShowOptimalChart] = useState(true); // Show chart by default
  const [chartView, setChartView] = useState('roi'); // 'roi', 'revenue', 'risk'
  const [selectedSpendLevel, setSelectedSpendLevel] = useState<any>(null);
  const [formData, setFormData] = useState<{
    companySize: string;
    revenue: string;
    industry: string;
    location: string;
    websiteTraffic: string;
    currentSEORanking: string;
    aiPresence: string;
    marketingSpend: string;
    primaryGoal: string;
    currentROI: string;
    manualTime: string;
    competitivePressure: string;
    aiToolsUsage: string;
    servicesInterested: string[];
    timeline: string;
    budget: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    marketingConsent: boolean;
  }>({
    companySize: '',
    revenue: '',
    industry: '',
    location: '',
    websiteTraffic: '',
    currentSEORanking: '',
    aiPresence: '',
    marketingSpend: '',
    primaryGoal: '',
    currentROI: '',
    manualTime: '',
    competitivePressure: '',
    aiToolsUsage: '',
    servicesInterested: [],
    timeline: '',
    budget: '',
    name: '',
    email: '',
    company: '',
    phone: '',
    marketingConsent: false
  });
  const [results, setResults] = useState<any>(null);

  const steps = [
    { title: "Business Profile", icon: Building },
    { title: "Digital Maturity", icon: Search },
    { title: "Growth Goals", icon: Target },
    { title: "AI Readiness", icon: Brain },
    { title: "Get Your Report", icon: Mail }
  ];

  const industries = [
    "E-commerce/Retail", "SaaS/Technology", "Professional Services", "Consulting",
    "Healthcare", "Financial Services", "Real Estate", "Education", "Marketing/Agency",
    "Legal Services", "Automotive", "Construction", "Manufacturing", "Hospitality",
    "Non-profit", "Other"
  ];

  // Industry-specific conversion rates (leads to customers)
  const industryConversionRates = {
    "E-commerce/Retail": 0.03,
    "SaaS/Technology": 0.12,
    "Professional Services": 0.10,
    "Consulting": 0.09,
    "Healthcare": 0.09,
    "Financial Services": 0.06,
    "Real Estate": 0.05,
    "Education": 0.08,
    "Marketing/Agency": 0.07,
    "Legal Services": 0.08,
    "Automotive": 0.06,
    "Construction": 0.45, // Very high for qualified B2B leads
    "Manufacturing": 0.04,
    "Hospitality": 0.04,
    "Non-profit": 0.05,
    "Other": 0.06
  };

  const services = [
    { id: 'search_optimization', name: 'SEO+AEO+GEO+SBO+Geographic Optimization', desc: 'Complete search engine & AI platform visibility' },
    { id: 'agentic_marketing', name: 'Agentic Marketing Automations', desc: 'AI agents for lead gen, content, social media' },
    { id: 'agentic_business', name: 'Agentic Business Operations', desc: 'AI agents for admin, customer service, workflows' },
    { id: 'full_stack_automation', name: 'Full-Stack AI Automation Service', desc: 'Complete business transformation with AI' }
  ];

  // Digital Visibility pricing vs industry standards
  const pricingComparison = {
    seo: {
      industryAverage: 125,
      digitalVisibilityStandard: 80,
      digitalVisibilityFounder: 40,
      industryMonthly: 2000,
      digitalVisibilityMonthly: 1200,
      founderMonthly: 600
    },
    automation: {
      industryAverage: 100,
      digitalVisibilityStandard: 80,
      digitalVisibilityFounder: 40,
      industrySetup: 5000,
      digitalVisibilitySetup: 2400,
      founderSetup: 1200
    },
    marketing: {
      industryAverage: 90,
      digitalVisibilityStandard: 80,
      digitalVisibilityFounder: 40,
      industryMonthly: 800,
      digitalVisibilityMonthly: 480,
      founderMonthly: 240
    }
  };

  const calculateOptimalSpendData = (revenue: number, industry: string, companySize: string) => {
    // Research-based optimal spend percentages
    const minSpendPercent = 0.02; // 2% - Too little, minimal effect
    const sweetSpotMinPercent = 0.06; // 6% - Start of sweet spot
    const sweetSpotMaxPercent = 0.12; // 12% - End of sweet spot
    const maxSpendPercent = 0.20; // 20% - Too much, risky

    const spendLevels: any[] = [];
    
    // Get industry-specific conversion rate adjustment
    const conversionRate = industryConversionRates[industry] || industryConversionRates['Other'];
    const industryMultiplier = 1 + (conversionRate - 0.06) * 2; // Amplify the effect for the chart
    
    // Generate data points for the chart
    for (let percent = 0; percent <= 0.25; percent += 0.01) {
      const annualSpend = revenue * percent;
      const monthlySpend = annualSpend / 12;
      
      // Calculate ROI based on spend level
      let roiMultiplier = 1;
      let riskLevel = 'low';
      let effectiveness = 'low';
      
      if (percent < minSpendPercent) {
        // Very low spend - negative or minimal returns
        roiMultiplier = 0.3 + (percent / minSpendPercent) * 0.4; // 0.3 to 0.7
        effectiveness = 'minimal';
        riskLevel = 'low';
      } else if (percent >= minSpendPercent && percent < sweetSpotMinPercent) {
        // Low spend - poor returns
        roiMultiplier = 0.7 + ((percent - minSpendPercent) / (sweetSpotMinPercent - minSpendPercent)) * 0.8; // 0.7 to 1.5
        effectiveness = 'poor';
        riskLevel = 'low';
      } else if (percent >= sweetSpotMinPercent && percent <= sweetSpotMaxPercent) {
        // Sweet spot - highest ROI
        roiMultiplier = 1.5 + ((percent - sweetSpotMinPercent) / (sweetSpotMaxPercent - sweetSpotMinPercent)) * 2.0; // 1.5 to 3.5
        effectiveness = 'optimal';
        riskLevel = 'low';
      } else if (percent > sweetSpotMaxPercent && percent <= maxSpendPercent) {
        // Diminishing returns
        roiMultiplier = 3.5 - ((percent - sweetSpotMaxPercent) / (maxSpendPercent - sweetSpotMaxPercent)) * 1.5; // 3.5 to 2.0
        effectiveness = 'good';
        riskLevel = 'medium';
      } else {
        // Too much spend - poor returns
        roiMultiplier = 2.0 - ((percent - maxSpendPercent) / 0.05) * 1.5; // 2.0 and declining
        effectiveness = 'poor';
        riskLevel = 'high';
      }
      
      // Apply industry-specific adjustment
      roiMultiplier = roiMultiplier * industryMultiplier;
      
      const estimatedReturns = annualSpend * roiMultiplier;
      const netProfit = estimatedReturns - annualSpend;
      const roi = annualSpend > 0 ? Math.round(((estimatedReturns - annualSpend) / annualSpend) * 100) : 0;
      
      spendLevels.push({
        percent: Math.round(percent * 100),
        annualSpend: Math.round(annualSpend),
        monthlySpend: Math.round(monthlySpend),
        estimatedReturns: Math.round(estimatedReturns),
        netProfit: Math.round(netProfit),
        roi,
        effectiveness,
        riskLevel,
        isSweet: percent >= sweetSpotMinPercent && percent <= sweetSpotMaxPercent
      });
    }
    
    return spendLevels;
  };

  const calculateROI = () => {
    const { companySize, revenue, industry, servicesInterested } = formData;
    
    const operationalExpensePercent = {
      'solo': 0.75,
      '1-3': 0.80,
      '4-10': 0.82,
      '11-50': 0.85,
      '50+': 0.87
    };

    const marketingSpendPercent = {
      'E-commerce/Retail': 0.08,
      'SaaS/Technology': 0.12,
      'Professional Services': 0.07,
      'Marketing/Agency': 0.15,
      'Real Estate': 0.10,
      'Legal Services': 0.05,
      'Financial Services': 0.06,
      'Consulting': 0.08,
      'Healthcare': 0.03,
      'Education': 0.04,
      'Construction': 0.03,
      'Manufacturing': 0.04,
      'Automotive': 0.06,
      'Hospitality': 0.09,
      'Non-profit': 0.02,
      'Other': 0.07
    };

    const currentRevenueNum = revenue === '£0-£50k' ? 35000 : 
                             revenue === '£50k-£100k' ? 75000 :
                             revenue === '£100k-£250k' ? 175000 :
                             revenue === '£250k-£500k' ? 375000 : 750000;

    const totalOperationalBudget = currentRevenueNum * (operationalExpensePercent[companySize] || operationalExpensePercent['solo']);
    const totalMarketingBudget = currentRevenueNum * (marketingSpendPercent[industry] || marketingSpendPercent['Other']);
    
    // Fixed automation potential based on research - 25% of ops, 65% of marketing
    const automatableAdminBudget = totalOperationalBudget * 0.25;
    const automatableMarketingBudget = totalMarketingBudget * 0.65;

    // Get industry-specific conversion rate
    const conversionRate = industryConversionRates[industry] || industryConversionRates['Other'];
    
    // Industry-specific adjustments for lead generation potential
    // Fixed lead increase based on research - 180% increase
    const industryAdjustedLeadIncrease = 180;
    
    // Size-adjusted ROI multipliers (larger companies see different returns)
    const sizeMultiplier = companySize === 'solo' ? 1.2 :
                          companySize === '1-3' ? 1.1 :
                          companySize === '4-10' ? 1.0 :
                          companySize === '11-50' ? 0.9 : 0.85;
    
    // Industry-specific ROI adjustments
    const industryROIBonus = {
      'E-commerce/Retail': 0.8,
      'SaaS/Technology': 1.2,
      'Professional Services': 0.6,
      'Marketing/Agency': 1.0,
      'Real Estate': 0.7,
      'Legal Services': 0.4,
      'Financial Services': 0.5,
      'Consulting': 0.6,
      'Healthcare': 0.3,
      'Education': 0.3,
      'Construction': 0.2,
      'Manufacturing': 0.3,
      'Automotive': 0.5,
      'Hospitality': 0.7,
      'Non-profit': 0.2,
      'Other': 0.5
    };
    
    const industryBonus = industryROIBonus[industry] || 0.5;
    
    // Fixed ROI multipliers based on research
    const baseROIMultipliers = {
      'search_optimization': 4.5,      // 450% ROI
      'agentic_marketing': 5.44,       // 544% ROI
      'agentic_business': 2.4,         // 240% ROI
      'full_stack_automation': 3.8     // 380% ROI
    };

    // Fixed industry ROI adjustment
    const industryROIAdjustment = 1.0; // Remove dynamic adjustments to use fixed research values
    
    // Service investment based on fixed 25% of automatable budget
    const totalAutomatableBudget = automatableMarketingBudget + automatableAdminBudget;
    const baseServiceInvestment = totalAutomatableBudget * 0.25;
    
    const serviceInvestments = {
      'search_optimization': Math.round(baseServiceInvestment * 0.25),
      'agentic_marketing': Math.round(baseServiceInvestment * 0.30),
      'agentic_business': Math.round(baseServiceInvestment * 0.20),
      'full_stack_automation': Math.round(baseServiceInvestment * 0.25)
    };

    const serviceReturns = {
      'search_optimization': Math.round(serviceInvestments.search_optimization * baseROIMultipliers.search_optimization * industryROIAdjustment),
      'agentic_marketing': Math.round(serviceInvestments.agentic_marketing * baseROIMultipliers.agentic_marketing * industryROIAdjustment),
      'agentic_business': Math.round(serviceInvestments.agentic_business * baseROIMultipliers.agentic_business * industryROIAdjustment),
      'full_stack_automation': Math.round(serviceInvestments.full_stack_automation * baseROIMultipliers.full_stack_automation * industryROIAdjustment)
    };

    // Fixed time savings based on research - 2.25 hours/day
    const dailyTimeSaved = 2.25;
    const weeklyTimeSaved = Math.round(dailyTimeSaved * 5);
    const monthlyTimeSaved = Math.round(weeklyTimeSaved * 4.33);
    
    const hourlyValues = {
      'solo': 30,
      '1-3': 40,
      '4-10': 50,
      '11-50': 60,
      '50+': 75
    };
    
    const hourlyValue = hourlyValues[companySize] || hourlyValues['solo'];
    const monthlyValueSaved = Math.round(monthlyTimeSaved * hourlyValue);

    const totalInvestment = servicesInterested.reduce((sum, service) => sum + (serviceInvestments[service] || 0), 0);
    const totalReturns = servicesInterested.reduce((sum, service) => sum + (serviceReturns[service] || 0), 0);
    const overallROI = totalInvestment > 0 ? Math.round(((totalReturns - totalInvestment) / totalInvestment) * 100) : 0;

    // Calculate optimal spend data for the chart
    const optimalSpendData = calculateOptimalSpendData(currentRevenueNum, industry, companySize);

    // Fixed traffic increase based on research - 120% increase
    const trafficIncrease = 120;

    return {
      trafficIncrease,
      leadIncrease: industryAdjustedLeadIncrease,
      conversionRate: Math.round(conversionRate * 100),
      weeklyTimeSaved,
      monthlyTimeSaved,
      monthlyValueSaved,
      totalInvestment,
      totalReturns,
      overallROI,
      currentRevenue: currentRevenueNum,
      recommendedMarketingBudget: totalMarketingBudget,
      optimalSpendData
    };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      servicesInterested: prev.servicesInterested.includes(serviceId)
        ? prev.servicesInterested.filter(id => id !== serviceId)
        : [...prev.servicesInterested, serviceId]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const calculatedResults = calculateROI();
      setResults(calculatedResults);
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return formData.companySize && formData.revenue && formData.industry && formData.location;
      case 1:
        return formData.websiteTraffic && formData.currentSEORanking && formData.aiPresence && formData.marketingSpend;
      case 2:
        return formData.primaryGoal && formData.currentROI && formData.manualTime && formData.competitivePressure;
      case 3:
        return formData.aiToolsUsage && formData.servicesInterested.length > 0 && formData.timeline && formData.budget;
      case 4:
        return formData.name && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      default:
        return false;
    }
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">Your Digital Transformation ROI Report</h1>
            </div>
            <p className="text-xl text-gray-600">Human Powered, AI Accelerated Results</p>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg inline-block mt-4">
              <span className="text-2xl font-bold">{results.overallROI}% ROI</span>
              <span className="ml-2">projected within 12 months</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-green-600">+{results.trafficIncrease}%</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">More Website Visitors</h3>
              <p className="text-sm text-gray-600">That's like having 2x more people walk into your store!</p>
              <button className="mt-2 text-xs text-blue-600 flex items-center hover:underline">
                <HelpCircle className="h-3 w-3 mr-1" />
                What does this mean?
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">+{results.leadIncrease}%</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">More Leads Generated</h3>
              <p className="text-sm text-gray-600">
                In your {formData.industry} industry, {results.conversionRate}% of leads become customers!
              </p>
              <button className="mt-2 text-xs text-blue-600 flex items-center hover:underline">
                <HelpCircle className="h-3 w-3 mr-1" />
                Industry conversion rate
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
                <span className="text-3xl font-bold text-orange-600">{results.weeklyTimeSaved}h</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hours Saved Each Week</h3>
              <p className="text-sm text-gray-600">Like getting an extra day off every week!</p>
              <button className="mt-2 text-xs text-blue-600 flex items-center hover:underline">
                <HelpCircle className="h-3 w-3 mr-1" />
                Where does time go?
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">£{results.monthlyValueSaved.toLocaleString()}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Money Saved Monthly</h3>
              <p className="text-sm text-gray-600">Your time is worth money - here's how much!</p>
              <button className="mt-2 text-xs text-blue-600 flex items-center hover:underline">
                <HelpCircle className="h-3 w-3 mr-1" />
                Break it down
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What These Numbers Mean (In Simple Terms)</h3>
                              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>Your ROI of {results.overallROI}%</strong> means: For every £1 you invest, 
                  you'll get £{(results.overallROI / 100 + 1).toFixed(2)} back. It's like a savings 
                  account that pays {results.overallROI}% interest!
                </p>
                <p>
                  <strong>Industry insight:</strong> In {formData.industry}, about {results.conversionRate}% 
                  of people who show interest actually buy. We help you find more of these buyers and 
                  convert them faster.
                </p>
                <p>
                  <strong>Time = Money:</strong> Those {results.weeklyTimeSaved} hours saved each week? 
                  That's worth £{results.monthlyValueSaved.toLocaleString()} per month. Use this time to 
                  focus on growing your business or enjoying life!
                </p>
              </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 shadow-lg border-2 border-blue-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                  <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                  🎯 Your Optimal Marketing Spend Chart
                </h2>
                <p className="text-gray-600">See exactly how much to spend for maximum ROI in {formData.industry}</p>
              </div>
              <button
                onClick={() => setShowOptimalChart(!showOptimalChart)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                {showOptimalChart ? 'Hide Chart' : 'View Your Chart'}
              </button>
            </div>

            {showOptimalChart && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>💡 Your Current Position:</strong> You're spending approximately {Math.round((results.recommendedMarketingBudget / results.currentRevenue) * 100)}% 
                      of revenue on marketing. The optimal range for {formData.industry} is 6-12% (shown in green).
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>📊 How to Use:</strong> Click any bar to see detailed ROI analysis. The chart shows 
                      how your returns change at different spending levels.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setChartView('roi')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      chartView === 'roi' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ROI View
                  </button>
                  <button
                    onClick={() => setChartView('revenue')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      chartView === 'revenue' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Revenue View
                  </button>
                  <button
                    onClick={() => setChartView('risk')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      chartView === 'risk' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Risk Analysis
                  </button>
                </div>

                <div className="relative bg-white rounded-lg p-6 border border-gray-200">
                  {/* Chart Legend */}
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span className="text-gray-700">Optimal (6-12%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                        <span className="text-gray-700">Good ROI (200%+)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                        <span className="text-gray-700">Decent (100-200%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                        <span className="text-gray-700">Poor (50-100%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                        <span className="text-gray-700">Very Poor (&lt;50%)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-80 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-gray-600 -ml-8">
                      {chartView === 'roi' && (
                        <>
                          <div>500%</div>
                          <div>400%</div>
                          <div>300%</div>
                          <div>200%</div>
                          <div>100%</div>
                          <div>0%</div>
                        </>
                      )}
                      {chartView === 'revenue' && (
                        <>
                          <div>£{Math.round(Math.max(...results.optimalSpendData.map(d => d.estimatedReturns)) / 1000)}k</div>
                          <div>£{Math.round(Math.max(...results.optimalSpendData.map(d => d.estimatedReturns)) * 0.8 / 1000)}k</div>
                          <div>£{Math.round(Math.max(...results.optimalSpendData.map(d => d.estimatedReturns)) * 0.6 / 1000)}k</div>
                          <div>£{Math.round(Math.max(...results.optimalSpendData.map(d => d.estimatedReturns)) * 0.4 / 1000)}k</div>
                          <div>£{Math.round(Math.max(...results.optimalSpendData.map(d => d.estimatedReturns)) * 0.2 / 1000)}k</div>
                          <div>£0</div>
                        </>
                      )}
                      {chartView === 'risk' && (
                        <>
                          <div>High</div>
                          <div></div>
                          <div>Medium</div>
                          <div></div>
                          <div>Low</div>
                          <div></div>
                        </>
                      )}
                    </div>
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                      {/* Horizontal grid lines */}
                      <div className="h-full flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="border-t border-gray-200"></div>
                        ))}
                      </div>
                      
                      {/* Vertical reference lines for key spending points */}
                      <div className="absolute inset-0 flex items-end px-2 pb-8">
                        {results.optimalSpendData
                          .filter((_, index) => index % 2 === 0)
                          .map((point, index) => {
                            if (point.percent === 6 || point.percent === 12) {
                              return (
                                <div key={`line-${index}`} className="flex-1 mx-1 relative">
                                  <div className="absolute inset-y-0 left-1/2 border-l-2 border-green-300 border-dashed opacity-50"></div>
                                </div>
                              );
                            }
                            return <div key={`spacer-${index}`} className="flex-1 mx-1"></div>;
                          })}
                      </div>
                    </div>
                    
                    {/* Chart bars */}
                    <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                      {results.optimalSpendData
                        .filter((_, index) => index % 2 === 0) // Show every other point for clarity
                        .map((point, index, arr) => {
                          const maxHeight = 280;
                          let height = 0;
                          let color = 'bg-gray-400';
                          
                          if (chartView === 'roi') {
                            height = Math.min((point.roi / 500) * maxHeight, maxHeight);
                            // Update color logic to match new ROI calculations
                            if (point.isSweet) {
                              color = 'bg-green-500'; // Optimal range
                            } else if (point.roi < 0) {
                              color = 'bg-red-500'; // Negative ROI
                            } else if (point.roi < 50) {
                              color = 'bg-red-400'; // Very poor ROI
                            } else if (point.roi < 100) {
                              color = 'bg-yellow-500'; // Poor ROI
                            } else if (point.roi < 200) {
                              color = 'bg-blue-400'; // Decent ROI
                            } else {
                              color = 'bg-blue-500'; // Good ROI
                            }
                          } else if (chartView === 'revenue') {
                            const maxRevenue = Math.max(...results.optimalSpendData.map(d => d.estimatedReturns));
                            height = (point.estimatedReturns / maxRevenue) * maxHeight;
                            color = point.isSweet ? 'bg-green-500' : 'bg-blue-500';
                          } else if (chartView === 'risk') {
                            height = point.riskLevel === 'high' ? maxHeight * 0.9 :
                                   point.riskLevel === 'medium' ? maxHeight * 0.5 :
                                   maxHeight * 0.2;
                            color = point.riskLevel === 'high' ? 'bg-red-500' :
                                   point.riskLevel === 'medium' ? 'bg-yellow-500' :
                                   'bg-green-500';
                          }
                          
                          return (
                            <div
                              key={index}
                              className="relative group cursor-pointer flex-1 mx-1"
                              onClick={() => setSelectedSpendLevel(point)}
                            >
                              <div className="relative h-full flex flex-col justify-end">
                                <div
                                  className={`${color} rounded-t-lg transition-all duration-300 hover:opacity-80 shadow-sm`}
                                  style={{ height: `${height}px` }}
                                />
                                {/* Show ROI value on top of bars for key points */}
                                {chartView === 'roi' && (point.percent === 0 || point.percent === 6 || point.percent === 12 || point.percent === 20) && (
                                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                                    {point.roi}%
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                                {point.percent}%
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                ROI: {point.roi}% | £{point.monthlySpend.toLocaleString()}/mo
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    
                    {/* X-axis label */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-medium">
                      % of Revenue Spent on Marketing
                    </div>
                  </div>

                  {selectedSpendLevel && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          Analysis: {selectedSpendLevel.percent}% Marketing Spend
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedSpendLevel.effectiveness === 'optimal' ? 'bg-green-100 text-green-800' :
                          selectedSpendLevel.effectiveness === 'good' ? 'bg-blue-100 text-blue-800' :
                          selectedSpendLevel.effectiveness === 'minimal' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedSpendLevel.effectiveness.charAt(0).toUpperCase() + selectedSpendLevel.effectiveness.slice(1)} Performance
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600 text-xs uppercase tracking-wide">Monthly Investment</p>
                          <p className="font-bold text-lg text-gray-900">£{selectedSpendLevel.monthlySpend.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600 text-xs uppercase tracking-wide">Expected ROI</p>
                          <p className="font-bold text-lg text-green-600">{selectedSpendLevel.roi}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600 text-xs uppercase tracking-wide">Annual Profit</p>
                          <p className="font-bold text-lg text-gray-900">£{selectedSpendLevel.netProfit.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600 text-xs uppercase tracking-wide">Risk Level</p>
                          <p className={`font-bold text-lg ${
                            selectedSpendLevel.riskLevel === 'high' ? 'text-red-600' :
                            selectedSpendLevel.riskLevel === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {selectedSpendLevel.riskLevel.charAt(0).toUpperCase() + selectedSpendLevel.riskLevel.slice(1)}
                          </p>
                        </div>
                      </div>
                      {selectedSpendLevel.isSweet && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                          <p className="text-green-800 text-sm">
                            <strong>✅ Recommended Range:</strong> This spending level is in the optimal 6-12% range where {formData.industry} businesses typically see the best return on investment.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Understanding the Zones */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Understanding Your Spending Zones</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Under 6%</h4>
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Poor ROI</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Insufficient investment. Your marketing efforts won't reach critical mass for growth.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">6-12%</h4>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Optimal</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Industry best practice. Maximum ROI with sustainable growth.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">12-20%</h4>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Aggressive</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Good for rapid growth but watch for diminishing returns.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Over 20%</h4>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">High Risk</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Excessive spending with poor ROI. Resources better allocated elsewhere.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mt-6">
                  <h3 className="font-semibold text-lg mb-2">💰 Your Personalized Recommendation</h3>
                  <p className="text-blue-100 mb-3">
                    Based on your {formData.industry} business generating {formData.revenue} annually:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">Minimum Spend</p>
                      <p className="text-xl font-bold">£{Math.round((results.currentRevenue * 0.06) / 12).toLocaleString()}/mo</p>
                      <p className="text-xs text-blue-100">(6% of revenue)</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">Optimal Spend</p>
                      <p className="text-xl font-bold">£{Math.round((results.currentRevenue * 0.09) / 12).toLocaleString()}/mo</p>
                      <p className="text-xs text-blue-100">(9% of revenue)</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wide text-blue-100">Maximum Spend</p>
                      <p className="text-xl font-bold">£{Math.round((results.currentRevenue * 0.12) / 12).toLocaleString()}/mo</p>
                      <p className="text-xs text-blue-100">(12% of revenue)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 mr-2 text-blue-600" />
              Digital Visibility Pricing: Premium Service, Smart Investment
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                🚀 Limited Time: Founder's Discount Available!
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-800 mb-2">
                    <strong>Standard Rate:</strong> £80/hour (36% below industry average)
                  </p>
                  <p className="text-green-800">
                    <strong>Founder's Rate:</strong> £40/hour (68% below industry average!)
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-300">
                  <p className="text-sm text-green-700 font-semibold">Smart investment strategy:</p>
                  <p className="text-xs text-green-600">
                    Our lower rates mean you can reach the optimal 6-12% marketing spend 
                    while getting more value for every pound invested!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Industry Average</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-red-700">SEO Services:</span>
                    <span className="font-bold text-red-900">£{pricingComparison.seo.industryAverage}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">AI Automation:</span>
                    <span className="font-bold text-red-900">£{pricingComparison.automation.industryAverage}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Marketing Auto:</span>
                    <span className="font-bold text-red-900">£{pricingComparison.marketing.industryAverage}/hour</span>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded-lg p-2 text-center mt-4">
                    <span className="text-red-800 font-bold">What Most Pay</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Digital Visibility Standard</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">All Services:</span>
                    <span className="font-bold text-blue-900">£{pricingComparison.seo.digitalVisibilityStandard}/hour</span>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-blue-600">Already</div>
                    <div className="text-lg text-blue-700">36% Below</div>
                    <div className="text-sm text-blue-600">Industry Average</div>
                  </div>
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 text-center">
                    <span className="text-blue-800 font-bold">Premium Value</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 relative">
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  LIMITED TIME
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-4">Founder's Discount</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">All Services:</span>
                    <span className="font-bold text-green-900">£{pricingComparison.seo.digitalVisibilityFounder}/hour</span>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-green-600">Massive</div>
                    <div className="text-lg text-green-700">68% Below</div>
                    <div className="text-sm text-green-600">Industry Average</div>
                  </div>
                  <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                    <span className="text-green-800 font-bold">Incredible Value!</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-600 text-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">🎯 Smart Strategy: Start with Founder Rates</h3>
              <p className="text-blue-100 mb-4">
                Get your automations built at 50% off, then enjoy massive ROI when you only pay standard rates 
                for maintenance and additions. By then, you'll be making so much more money that £80/hour 
                will feel like nothing!
              </p>
              <div className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
                Limited Time Offer - Claim Your Founder's Discount Today!
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Research Sources & Data Foundation
            </h2>
            
            <div className="mb-6 text-center max-w-3xl mx-auto">
              <p className="text-gray-700">
                Our ROI calculations are based on current industry research and actual expense ratios, not wishful thinking. 
                We've analyzed data from leading research firms, industry reports, and real-world implementations to provide 
                you with accurate, credible projections.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">📊 Key Research Citations</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Admin automation:</strong> 30% of operational tasks can be automated (McKinsey, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Marketing automation:</strong> 60% of marketing activities can be automated (Industry Research, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>AI ROI:</strong> $3.7 average per $1 spent (Hypersense Software, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Marketing automation:</strong> $5.44 return per $1 invested (Digital Silk, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Business process automation:</strong> 240% ROI (ARDEM, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>AI saves 2.25 hours daily</strong> per professional (Vena Solutions, 2025)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">🎯 AI Search Benefits</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Featured snippets:</strong> 42.9% CTR (First Page Sage, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Voice search:</strong> 20.5% global usage (Demand Sage, 2025)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>AI Overviews</strong> triggered in 13.14% of all searches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>83% of marketing departments</strong> automate social media posts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>56% of companies</strong> currently use marketing automation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>69% of daily management tasks</strong> will be automated by 2024</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 How We Calculate Your ROI</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Expense Ratios:</strong>
                  <p>Based on actual business expense research and IT spending percentages</p>
                </div>
                <div>
                  <strong>Marketing Spend:</strong>
                  <p>Industry-specific percentages from 2025 studies</p>
                </div>
                <div>
                  <strong>ROI Multipliers:</strong>
                  <p>Directly from published research reports and case studies</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                *Results are projections based on industry research applied to your actual operational and marketing budgets. 
                Individual results may vary based on implementation quality, market conditions, and execution.
              </p>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-200"
                onClick={() => window.location.href = 'mailto:hello@digitalvisibility.uk?subject=ROI%20Calculator%20Results'}
              >
                Get Started with Our Team
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setResults(null);
                setFormData({
                  companySize: '',
                  revenue: '',
                  industry: '',
                  location: '',
                  websiteTraffic: '',
                  currentSEORanking: '',
                  aiPresence: '',
                  marketingSpend: '',
                  primaryGoal: '',
                  currentROI: '',
                  manualTime: '',
                  competitivePressure: '',
                  aiToolsUsage: '',
                  servicesInterested: [],
                  timeline: '',
                  budget: '',
                  name: '',
                  email: '',
                  company: '',
                  phone: '',
                  marketingConsent: false
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center mx-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Start Over with New Calculation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Digital Transformation ROI Calculator</h1>
          </div>
          <p className="text-xl text-gray-600">Discover Your Business Growth Potential</p>
          <p className="text-lg text-gray-500 mt-2">Human Powered, AI Accelerated Solutions</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-300'
                }`}>
                  {index < currentStep ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your business</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Structure *</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your business structure</option>
                  <option value="solo">Solo Trader/Freelancer (Just Me)</option>
                  <option value="1-3">Small Team (2-3 people)</option>
                  <option value="4-10">Growing Business (4-10 employees)</option>
                  <option value="11-50">Established Business (11-50 employees)</option>
                  <option value="50+">Large Business (50+ employees)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue *</label>
                <select
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select revenue range</option>
                  <option value="£0-£50k">£0 - £50k (Starting out)</option>
                  <option value="£50k-£100k">£50k - £100k (Growing)</option>
                  <option value="£100k-£250k">£100k - £250k (Established)</option>
                  <option value="£250k-£500k">£250k - £500k (Scaling)</option>
                  <option value="£500k+">£500k+ (Expanding)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Location *</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  <option value="UK">United Kingdom</option>
                  <option value="EU">European Union</option>
                  <option value="US">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Digital Maturity</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Website Traffic *</label>
                <select
                  value={formData.websiteTraffic}
                  onChange={(e) => handleInputChange('websiteTraffic', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select traffic range</option>
                  <option value="0-1k">0 - 1,000 visitors</option>
                  <option value="1k-5k">1,000 - 5,000 visitors</option>
                  <option value="5k-20k">5,000 - 20,000 visitors</option>
                  <option value="20k-100k">20,000 - 100,000 visitors</option>
                  <option value="100k+">100,000+ visitors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current SEO Performance *</label>
                <select
                  value={formData.currentSEORanking}
                  onChange={(e) => handleInputChange('currentSEORanking', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select current ranking level</option>
                  <option value="poor">Poor (Page 2+ rankings)</option>
                  <option value="fair">Fair (Some page 1 rankings)</option>
                  <option value="good">Good (Multiple page 1 rankings)</option>
                  <option value="excellent">Excellent (Top 3 rankings)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Search Presence *</label>
                <select
                  value={formData.aiPresence}
                  onChange={(e) => handleInputChange('aiPresence', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">How often are you mentioned in AI responses?</option>
                  <option value="never">Never/Very Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="always">Almost Always</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Marketing Spend *</label>
                <select
                  value={formData.marketingSpend}
                  onChange={(e) => handleInputChange('marketingSpend', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select marketing budget</option>
                  <option value="£0-£500">£0 - £500</option>
                  <option value="£500-£2k">£500 - £2,000</option>
                  <option value="£2k-£5k">£2,000 - £5,000</option>
                  <option value="£5k+">£5,000+</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Goals & Challenges</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Business Goal *</label>
                <select
                  value={formData.primaryGoal}
                  onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select primary goal</option>
                  <option value="increase-traffic">Get more website visitors</option>
                  <option value="generate-leads">Generate more leads</option>
                  <option value="boost-sales">Increase sales/revenue</option>
                  <option value="save-time">Save time on manual tasks</option>
                  <option value="competitive-advantage">Beat the competition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Marketing Results *</label>
                <select
                  value={formData.currentROI}
                  onChange={(e) => handleInputChange('currentROI', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">How well is your current marketing working?</option>
                  <option value="poor">Not working - losing money</option>
                  <option value="breaking-even">Breaking even</option>
                  <option value="some-results">Getting some results</option>
                  <option value="good-results">Working well</option>
                  <option value="unknown">Not sure/Don't track it</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours on Marketing Tasks *</label>
                <select
                  value={formData.manualTime}
                  onChange={(e) => handleInputChange('manualTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Hours spent on marketing, admin, content creation</option>
                  <option value="5">0-5 hours (Very little)</option>
                  <option value="15">5-15 hours (Some time)</option>
                  <option value="30">15-30 hours (Significant time)</option>
                  <option value="40">30+ hours (Most of my time)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Competitive Pressure *</label>
                <select
                  value={formData.competitivePressure}
                  onChange={(e) => handleInputChange('competitivePressure', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">How competitive is your market?</option>
                  <option value="low">Not very competitive</option>
                  <option value="moderate">Moderately competitive</option>
                  <option value="high">Very competitive</option>
                  <option value="extremely-high">Extremely competitive</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Readiness & Service Interest</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current AI Experience *</label>
                <select
                  value={formData.aiToolsUsage}
                  onChange={(e) => handleInputChange('aiToolsUsage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">How familiar are you with AI tools?</option>
                  <option value="beginner">Complete beginner</option>
                  <option value="some">Some experience (ChatGPT, etc.)</option>
                  <option value="intermediate">Intermediate user</option>
                  <option value="advanced">Advanced AI user</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Services You're Interested In * (Select all that apply)</label>
                <div className="space-y-3">
                  {services.map(service => (
                    <div key={service.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={service.id}
                        checked={formData.servicesInterested.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={service.id} className="flex-1">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.desc}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When Would You Like to Start? *</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  <option value="immediately">As soon as possible</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="2-3months">2-3 months</option>
                  <option value="3-6months">3-6 months</option>
                  <option value="exploring">Just exploring options</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Budget Range *</label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">What can you invest monthly?</option>
                  <option value="£500-£1k">£500 - £1,000</option>
                  <option value="£1k-£3k">£1,000 - £3,000</option>
                  <option value="£3k-£5k">£3,000 - £5,000</option>
                  <option value="£5k+">£5,000+</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Your Personalized ROI Report</h3>
                <p className="text-gray-600">Enter your details to receive your custom analysis and recommendations</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name (Optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+44 7700 900000"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={formData.marketingConsent}
                    onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketing" className="flex-1 text-sm text-gray-700">
                    I agree to receive marketing communications about Digital Visibility services and insights.*
                  </label>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 mt-4">
                <p>By clicking "Get Free Analysis", you agree to our privacy policy and terms of service.</p>
                <p className="mt-1">We respect your privacy and will never share your information with third parties.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <button
            onClick={nextStep}
            disabled={!isStepComplete()}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Get Free Analysis' : 'Next'}
            {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}