import { useState } from 'react';
import { ArrowRight, Check, Zap, Shield, Users, BarChart3, Star, Play } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Blazing fast performance with real-time updates and instant sync across all devices.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption and SOC 2 compliance.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless collaboration tools for teams of any size, from startups to enterprises.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into productivity patterns with beautiful, actionable dashboards.'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals and small teams',
      features: [
        'Up to 5 projects',
        'Basic analytics',
        'Email support',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$12',
      period: 'per user/month',
      description: 'Best for growing teams and businesses',
      features: [
        'Unlimited projects',
        'Advanced analytics',
        'Priority support',
        'Team collaboration',
        'Custom integrations',
        'Advanced reporting'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$24',
      period: 'per user/month',
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Professional',
        'White-label solution',
        'Dedicated account manager',
        'Custom onboarding',
        'SLA guarantee',
        'Advanced security'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager at TechCorp',
      content: 'TaskFlow has revolutionized how our team manages projects. The insights are incredible!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Startup Founder',
      content: 'From chaos to clarity in just one week. This tool is a game-changer for productivity.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Operations Director',
      content: 'The analytics dashboard gives us insights we never had before. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #f1f5f9 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Hero Section */}
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
          borderRadius: '50%',
          padding: '1.5rem',
          width: '80px',
          height: '80px',
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 24px rgba(71, 85, 105, 0.2)'
        }}>
          <Zap size={40} style={{ color: 'white' }} />
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '1rem',
          lineHeight: '1.1'
        }}>
          The Future of Task Management
        </h1>

        <p style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          color: '#64748b',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          Transform your team's productivity with AI-powered insights, beautiful dashboards, and seamless collaboration tools.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          <button
            onClick={onGetStarted}
            style={{
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 16px rgba(71, 85, 105, 0.2)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Get Started Free
            <ArrowRight size={20} />
          </button>

          <button
            style={{
              background: 'white',
              color: '#334155',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#334155';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Play size={20} />
            Watch Demo
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} style={{ color: '#10b981' }} />
            Free 14-day trial
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} style={{ color: '#10b981' }} />
            No credit card required
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} style={{ color: '#10b981' }} />
            Cancel anytime
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        padding: '4rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Why teams choose TaskFlow
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: hoveredFeature === index ? '0 12px 24px rgba(0, 0, 0, 0.1)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: hoveredFeature === index ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                    borderRadius: '12px',
                    padding: '1rem',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={24} style={{ color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    lineHeight: '1.6'
                  }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Simple, transparent pricing
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Choose the perfect plan for your team
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: plan.popular ? '0 12px 24px rgba(71, 85, 105, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: plan.popular ? '2px solid #334155' : '1px solid #e2e8f0',
                position: 'relative',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Most Popular
                </div>
              )}

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                {plan.name}
              </h3>
              <p style={{
                color: '#64748b',
                marginBottom: '1rem'
              }}>
                {plan.description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                marginBottom: '1.5rem'
              }}>
                <span style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#1e293b'
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  marginLeft: '0.5rem'
                }}>
                  {plan.period}
                </span>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '2rem'
              }}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Check size={16} style={{ color: '#10b981' }} />
                    <span style={{ color: '#374151' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: plan.popular ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' : 'white',
                  color: plan.popular ? 'white' : '#334155',
                  border: plan.popular ? 'none' : '2px solid #334155',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {plan.name === 'Starter' ? 'Get Started Free' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{
        padding: '4rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Loved by thousands of teams
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  marginBottom: '1rem'
                }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  ))}
                </div>
                <p style={{
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  "{testimonial.content}"
                </p>
                <div>
                  <p style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.25rem'
                  }}>
                    {testimonial.name}
                  </p>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.875rem'
                  }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          Ready to transform your productivity?
        </h2>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Join thousands of teams already using TaskFlow to get more done.
        </p>
        <button
          onClick={onGetStarted}
          style={{
            background: 'white',
            color: '#334155',
            border: 'none',
            borderRadius: '12px',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Start Your Free Trial
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;