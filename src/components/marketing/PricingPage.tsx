import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Star, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { stripeProducts, formatPrice } from '../../stripe-config';
import { useStripe } from '../../hooks/useStripe';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PricingPageProps {
  onSelectPlan: (plan: 'free' | 'startup' | 'agency', priceId?: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const { getCurrentPlan } = useStripe();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const currentPlan = getCurrentPlan();

  // Group products by plan type and billing period
  const groupedProducts = stripeProducts.reduce((acc, product) => {
    const planType = product.name.includes('Agency') ? 'agency' : 'startup';
    const period = product.interval === 'year' ? 'annual' : 'monthly';
    
    if (!acc[planType]) {
      acc[planType] = {};
    }
    acc[planType][period] = product;
    
    return acc;
  }, {} as Record<string, Record<string, any>>);

  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      monthlyPrice: 0, 
      annualPrice: 0,
      period: 'forever',
      description: 'Perfect for trying out Portplank',
      description: 'Perfect for trying out PlankPort',
      users: '1 employee (You)',
      clients: '3 clients',
      features: [
        'Basic task management',
        'Client portal access',
        'Email notifications',
      ],
      cta: 'Get Started Free',
      popular: false,
      stripeProduct: null,
    },
    {
      id: 'startup' as const,
      name: 'Startup',
      monthlyPrice: groupedProducts.startup?.monthly?.price || 9900,
      annualPrice: groupedProducts.startup?.annual?.price || 94800,
      description: 'Great for growing agencies',
      users: '3 employees',
      clients: '20 clients',
      features: [
        'Everything in Free',
        'Advanced task types',
        'Custom branding',
        'File uploads',
        'In-app messaging',
        'Priority support',
      ],
      cta: 'Get Started',
      popular: true,
      stripeProduct: {
        monthly: groupedProducts.startup?.monthly,
        annual: groupedProducts.startup?.annual,
      },
    },
    {
      id: 'agency' as const,
      name: 'Agency',
      monthlyPrice: groupedProducts.agency?.monthly?.price || 29900,
      annualPrice: groupedProducts.agency?.annual?.price || 286800,
      description: 'For established agencies at scale',
      users: '10 employees',
      clients: 'Unlimited clients',
      features: [
        'Everything in Startup',
        'White-label solution',
        'Advanced integrations',
        'Dedicated account manager',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
      stripeProduct: {
        monthly: groupedProducts.agency?.monthly,
        annual: groupedProducts.agency?.annual,
      },
    },
  ];

  const faqs = [
    {
      question: 'Can I change plans at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.',
    },
    {
      question: 'What happens when I exceed my employee limit?',
      answer: 'We\'ll notify you when you\'re approaching your employee limit. You can upgrade your plan or remove inactive employees to stay within your limit.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees ever. You only pay the monthly subscription fee for your chosen plan.',
    },
    {
      question: 'Do you offer annual discounts?',
      answer: 'Yes! Save 20% when you pay annually. Contact our sales team for annual pricing details.',
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'Free plans get community support, Startup gets priority email support, and Agency gets dedicated phone support with SLA.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. Cancel anytime with no penalties. Your account remains active until the end of your billing period.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your agency. Start free and scale as you grow.
          </p>
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                !isAnnual ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isAnnual ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 ${
                  plan.popular
                    ? 'ring-2 ring-blue-600 shadow-xl scale-105'
                    : 'hover:shadow-lg transition-shadow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="info" className="px-4 py-1 bg-blue-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.id === 'free' 
                        ? 'C$0' 
                        : formatPrice(isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice, 'cad')
                      }
                    </span>
                    <span className="text-gray-600 ml-2">
                      {plan.id === 'free' ? '/forever' : '/month'}
                    </span>
                    {plan.id !== 'free' && isAnnual && (
                      <div className="text-sm text-gray-600 mt-1">
                        Billed annually ({formatPrice(plan.annualPrice, 'cad')}/year)
                      </div>
                    )}
                    {plan.id !== 'free' && isAnnual && plan.monthlyPrice && plan.annualPrice && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save {formatPrice((plan.monthlyPrice * 12) - plan.annualPrice, 'cad')}/year
                      </div>
                    )}
                  </div>
                  {plan.id !== 'free' && isAnnual && plan.monthlyPrice && plan.annualPrice && (
                    <div className="text-xs text-gray-500 mb-4 text-center">
                      vs {formatPrice(plan.monthlyPrice, 'cad')}/month when billed monthly
                    </div>
                  )}
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-gray-900">{plan.users}</div>
                    <span className="text-gray-600">Employees</span>
                  </div>
                  <div className="space-y-1 text-sm mt-2">
                    <div className="font-medium text-gray-900">{plan.clients}</div>
                    <span className="text-gray-600">Clients</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (plan.id === 'free') {
                      navigate('/signup');
                    } else if (plan.stripeProduct) {
                      const selectedProduct = isAnnual ? plan.stripeProduct.annual : plan.stripeProduct.monthly;
                      if (selectedProduct) {
                        navigate(`/signup?plan=${plan.id}&price=${selectedProduct.priceId}`);
                      }
                    }
                  }}
                >
                  {plan.id === 'free' ? plan.cta : (
                    <>
                      <CreditCard className="mr-2 w-4 h-4" />
                      {plan.cta}
                    </>
                  )}
                  {plan.id !== 'agency' && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>

                {plan.id === 'free' && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    No credit card required
                  </p>
                )}
                {plan.id !== 'free' && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Start immediately
                  </p>
                )}

                {currentPlan && plan.stripeProduct && (
                  (currentPlan.priceId === plan.stripeProduct.monthly?.priceId || 
                   currentPlan.priceId === plan.stripeProduct.annual?.priceId) && (
                    <div className="mt-3 text-center">
                      <Badge variant="success">Current Plan</Badge>
                    </div>
                  )
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Need something custom?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Large agencies can get custom solutions with dedicated support and integrations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Custom Integrations</h3>
              <p className="text-gray-600 text-sm">Connect with your existing CRM, project management, and analytics tools.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">On-Premise Deployment</h3>
              <p className="text-gray-600 text-sm">Host Portplank on your own infrastructure for maximum control.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
              <p className="text-gray-600 text-sm">Get a dedicated customer success manager and priority support.</p>
            </div>
          </div>
          <Button size="lg">
            Contact Enterprise Sales
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50"
            >
              Start Your Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};