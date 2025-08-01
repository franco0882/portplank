import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Building, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStripe } from '../../hooks/useStripe';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

interface SignupFormProps {
  selectedPlan?: 'free' | 'startup' | 'agency';
  selectedPriceId?: string | undefined;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  selectedPlan: propSelectedPlan, 
  selectedPriceId: propSelectedPriceId 
}) => {
  const { signUp } = useAuth();
  const { createCheckoutSession } = useStripe();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const selectedPlan = propSelectedPlan || (searchParams.get('plan') as 'free' | 'startup' | 'agency') || 'free';
  const selectedPriceId = propSelectedPriceId || searchParams.get('price') || undefined;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Agency Info
    agencyName: '',
    agencySlug: '',
    website: '',
    phone: '',
    
    // Billing Info (for paid plans)
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingName: '',
    billingAddress: '',
    billingCity: '',
    billingZip: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const planDetails = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      users: '1 employee (You)',
      clients: '3 clients',
      features: ['Basic task management', 'Client portal', 'Email notifications'],
    },
    startup: {
      name: 'Startup',
      price: '$99',
      period: 'per month',
      users: '3 employees',
      clients: '20 clients',
      features: ['Everything in Free', 'Advanced tasks', 'Custom branding', 'File uploads'],
    },
    agency: {
      name: 'Agency',
      price: '$299',
      period: 'per month',
      users: '10 employees',
      clients: 'Unlimited clients',
      features: ['Everything in Startup', 'White-label', 'Advanced integrations', 'Dedicated support'],
    },
  };

  const currentPlan = planDetails[selectedPlan];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from agency name
    if (field === 'agencyName') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, agencySlug: slug }));
    }
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { agencyName, agencySlug, billingAddress, billingCity, billingZip } = formData;
    
    if (!agencyName || !agencySlug) {
      setError('Please fill in all required fields');
      return false;
    }

    // For paid plans, require billing information
    if (selectedPlan !== 'free' && (!billingAddress || !billingCity || !billingZip)) {
      setError('Please fill in billing address information');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      if (selectedPlan === 'free') {
        handleSubmit();
      } else {
        setStep(3);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare agency data
      const agencyData = {
        name: formData.agencyName,
        slug: formData.agencySlug,
        website: formData.website,
        phone: formData.phone,
        billing_address: formData.billingAddress,
        billing_city: formData.billingCity,
        billing_zip: formData.billingZip,
        billing_country: 'Canada', // Default for now
      };
      
      const { error } = await signUp(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`,
        'agency_owner',
        agencyData,
        formData.phone
      );

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          setError('This email is already registered. Try logging in.');
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Account created successfully!');
        // If a paid plan was selected, initiate Stripe checkout after successful signup
        if (selectedPriceId) {
          try {
            await createCheckoutSession(selectedPriceId, 'subscription');
          } catch (stripeError) {
            console.error('Error creating checkout session:', stripeError);
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/pricing" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to pricing
          </Link>
          
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Get started with Portplank {currentPlan.name} plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 xl:col-span-2">
            <Card>
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`text-sm ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                    Personal Info
                  </span>
                </div>
                
                <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className={`text-sm ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                    Agency Info
                  </span>
                </div>
                
                {selectedPlan !== 'free' && (
                  <>
                    <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        3
                      </div>
                      <span className={`text-sm ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                        Billing
                      </span>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-800">{error}</p>
                    {error.includes('Try logging in') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/login')}
                        className="ml-4 text-red-700 border-red-300 hover:bg-red-100"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@agency.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={formData.password} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Agency Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency Name *
                    </label>
                    <input
                      type="text"
                      value={formData.agencyName}
                      onChange={(e) => handleInputChange('agencyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your Agency Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency URL *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        portplank.com/
                      </span>
                      <input
                        type="text"
                        value={formData.agencySlug}
                        onChange={(e) => handleInputChange('agencySlug', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your-agency"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be your agency's unique URL for client access
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://youragency.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      value={formData.billingAddress}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.billingCity}
                        onChange={(e) => handleInputChange('billingCity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Toronto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.billingZip}
                        onChange={(e) => handleInputChange('billingZip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="M5V 3A8"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Billing Information */}
              {step === 3 && selectedPlan !== 'free' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Your 14-day free trial starts today. You won't be charged until the trial ends.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={formData.billingName}
                      onChange={(e) => handleInputChange('billingName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                {step > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                
                <div className="ml-auto">
                  {step < (selectedPlan === 'free' ? 2 : 3) ? (
                    <Button onClick={handleNext}>
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="ml-4"
                    >
                      {selectedPlan === 'free' ? 'Create Account' : 'Start Free Trial'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Plan Summary */}
          <div className="lg:col-span-3 xl:col-span-1 lg:min-w-80">
            <Card className="sticky top-8">
              <div className="text-center mb-6">
                <Badge variant="info" className="mb-2">
                  {currentPlan.name} Plan
                </Badge>
                <div className="text-3xl font-bold text-gray-900">
                  {currentPlan.price}
                  <span className="text-lg font-normal text-gray-600">/{currentPlan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employees:</span>
                  <span className="font-medium">{currentPlan.users}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clients:</span>
                  <span className="font-medium">{currentPlan.clients}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Included features:</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedPlan !== 'free' && (
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="font-medium">14-day free trial</span>
                  </div>
                  <p className="text-blue-700 text-xs mt-1">
                    No charges until your trial ends
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Already have an account?
                </span>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};