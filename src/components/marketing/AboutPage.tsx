import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Lightbulb, Award, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Client-Focused',
      description: 'Everything we build is designed to improve the client experience and strengthen agency-client relationships.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously innovate to stay ahead of industry needs and provide cutting-edge solutions.',
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'We see ourselves as partners in your success, not just a software vendor.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in everything we do, from code quality to customer support.',
    },
  ];

  const team = [
    {
      name: 'Alex Thompson',
      role: 'CEO & Co-Founder',
      bio: 'Former agency owner with 10+ years of experience scaling marketing agencies. Built Portplank to solve his own client onboarding challenges.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    },
    {
      name: 'Sarah Kim',
      role: 'CTO & Co-Founder',
      bio: 'Previously led engineering teams at scale-up SaaS companies. Passionate about building reliable, scalable software that agencies can depend on.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Product',
      bio: 'Product leader with deep expertise in workflow automation and user experience design. Ensures Portplank stays intuitive and powerful.',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    },
    {
      name: 'Emily Chen',
      role: 'Head of Customer Success',
      bio: 'Dedicated to helping agencies maximize their success with Portplank. Leads our customer success and support teams.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    },
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Company Founded',
      description: 'Started by agency owners who experienced onboarding pain firsthand.',
    },
    {
      year: '2023',
      title: 'First 100 Agencies',
      description: 'Reached our first major milestone with agencies across 15 countries.',
    },
    {
      year: '2024',
      title: 'Series A Funding',
      description: 'Raised $5M to accelerate product development and team growth.',
    },
    {
      year: '2024',
      title: '500+ Agencies',
      description: 'Now trusted by over 500 agencies managing 10,000+ client onboardings.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              We're on a mission to transform
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> agency-client relationships</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              OnboardFlow was born from the frustration of manual, chaotic client onboarding processes. 
              We believe every agency deserves professional, streamlined workflows that impress clients and save time.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Portplank started when our founders, Alex and Sarah, were running their own marketing agency. 
                  They were frustrated with the manual, error-prone process of onboarding new clients.
                </p>
                <p>
                  Spreadsheets, email chains, and forgotten tasks were creating a poor first impression with clients 
                  and wasting countless hours of their team's time. They knew there had to be a better way.
                </p>
                <p>
                  After trying existing solutions and finding them lacking, they decided to build the onboarding 
                  platform they wished they had. Portplank was born from real agency experience and real pain points.
                </p>
                <p>
                  Today, we're proud to help hundreds of agencies create professional, efficient onboarding 
                  experiences that strengthen client relationships from day one.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Agencies Trust Us</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from product development to customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a passionate team of agency veterans, engineers, and customer success experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From a small agency's pain point to a platform trusted by hundreds.
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <div className="text-2xl font-bold text-blue-600">{milestone.year}</div>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2 mr-8"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join our mission?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Portplank started when our founders, Alex and Sarah, were running their own marketing agency. 
            Help us transform how agencies onboard clients. Start with Portplank today.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};