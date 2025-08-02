import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Zap, Shield, BarChart3, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Users,
      title: 'Client Portal',
      description: 'Give each client their own secure dashboard to track progress and complete tasks.',
    },
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Create custom onboarding workflows with account creation, file uploads, and manual tasks.',
    },
    {
      icon: Clock,
      title: 'Progress Tracking',
      description: 'Real-time visibility into client progress with visual indicators and status updates.',
    },
    {
      icon: MessageSquare,
      title: 'Communication',
      description: 'Built-in messaging system for seamless client-agency communication.',
    },
    {
      icon: Zap,
      title: 'Templates',
      description: 'Build reusable onboarding templates and assign them to new clients instantly.',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track completion rates, identify bottlenecks, and optimize your onboarding process.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Digital Growth Agency',
      quote: 'PlankPort reduced our client onboarding time by 60%. Our clients love the transparency and professional experience.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Mike Chen',
      company: 'Performance Marketing Co.',
      quote: 'PlankPort reduced our client onboarding time by 60%. Our clients love the transparency and professional experience.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Emily Rodriguez',
      company: 'Creative Solutions Agency',
      quote: 'PlankPort\'s template system is a game-changer. We can onboard new clients in minutes instead of hours.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Client Onboarding</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your agency's client onboarding with automated workflows, real-time progress tracking, 
              and professional client portals that impress from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="lg" className="px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Free forever • No credit card required • Setup in 5 minutes
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome back, Sarah!</h3>
                    <p className="text-gray-600">Complete your onboarding tasks to get started</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>2 of 4 completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">Create Facebook Business Account</div>
                          <div className="text-sm text-gray-600">Set up your Facebook Business Manager</div>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">Upload Brand Assets</div>
                          <div className="text-sm text-gray-600">Provide logo and brand materials</div>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <div className="font-medium text-gray-900">Record Introduction Video</div>
                          <div className="text-sm text-gray-600">Create a 2-minute intro video</div>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-500">Set up Google Ads Account</div>
                          <div className="text-sm text-gray-500">Create your Google Ads account</div>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to onboard clients professionally
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From initial contact to campaign launch, Portplank handles every step of your client onboarding process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by 500+ marketing agencies
            </h2>
            <p className="text-xl text-gray-600">
              See what agency owners are saying about Portplank
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Agencies Trust Us</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-blue-100">Businesses Onboarded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">60%</div>
              <div className="text-blue-100">Faster Onboarding</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to transform your client onboarding?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            PlankPort started when our founders, Alex and Sarah, were running their own marketing agency. 
            Help us transform how agencies onboard clients. Start with PlankPort today.
          <Link to="/signup">
            <Button size="lg" className="px-8 py-4 text-lg">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Free forever • No setup fees • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};