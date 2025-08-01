import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, CreditCard, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useStripe } from '../../hooks/useStripe';
import { getProductByPriceId, formatPrice } from '../../stripe-config';

export const SuccessPage: React.FC = () => {
  const { subscription, loading, refetch, getCurrentPlan } = useStripe();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refetch subscription data to get the latest information
    if (sessionId) {
      // Add a small delay to ensure Stripe webhook has processed
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [sessionId, refetch]);

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full text-center p-8">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing your subscription...
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to OnboardFlow. Your subscription is now active.
          </p>
        </div>

        {/* Subscription Details */}
        {currentPlan && (
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
                  <p className="text-sm text-gray-600">Your active plan information</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan
                  </label>
                  <p className="text-sm text-gray-900 font-medium">{currentPlan.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatPrice(currentPlan.price, currentPlan.currency)} / {currentPlan.interval}
                  </p>
                </div>
              </div>

              {subscription && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Billing Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {subscription.current_period_end 
                        ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <p className="text-sm text-gray-900">
                      {subscription.payment_method_brand && subscription.payment_method_last4
                        ? `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}`
                        : 'Payment method on file'
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What's included:</h4>
                <p className="text-sm text-blue-800">{currentPlan.description}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Access Your Dashboard</p>
                <p className="text-sm text-gray-600">
                  Start managing your client onboarding workflows immediately.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Your First Template</p>
                <p className="text-sm text-gray-600">
                  Set up reusable onboarding workflows for your clients.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Invite Your Team</p>
                <p className="text-sm text-gray-600">
                  Add team members and start collaborating on client projects.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/dashboard/settings')}>
            <Calendar className="mr-2 w-5 h-5" />
            Manage Subscription
          </Button>
        </div>

        {/* Session Info (for debugging) */}
        {sessionId && (
          <Card className="p-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Session ID: {sessionId}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};