import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { workspaceService } from '../../services/api';
import {
  Clock, CreditCard, TrendingUp, Users, ArrowRight, CheckCircle,
  Sparkles, Zap, Star, Award, ChevronDown, ChevronUp, MapPin,
  Quote, Wifi, Coffee, Monitor, Shield, Headphones, Building2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const HomePage = () => {
  const { t } = useTranslation();
  const [featuredWorkspaces, setFeaturedWorkspaces] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    loadFeaturedWorkspaces();
  }, []);

  const loadFeaturedWorkspaces = async () => {
    try {
      const response = await workspaceService.getAll({ isActive: true });
      setFeaturedWorkspaces((response.workspaces || []).slice(0, 4));
    } catch (err) {
      console.error('Failed to load workspaces', err);
    }
  };

  const testimonials = [
    {
      name: t('home.testimonials.t1.name'),
      role: t('home.testimonials.t1.role'),
      text: t('home.testimonials.t1.text'),
      rating: 5
    },
    {
      name: t('home.testimonials.t2.name'),
      role: t('home.testimonials.t2.role'),
      text: t('home.testimonials.t2.text'),
      rating: 5
    },
    {
      name: t('home.testimonials.t3.name'),
      role: t('home.testimonials.t3.role'),
      text: t('home.testimonials.t3.text'),
      rating: 4
    }
  ];

  const pricingPlans = [
    {
      type: 'hot_desk',
      icon: Coffee,
      price: '480',
      color: 'from-orange-400 to-orange-600',
      features: ['WiFi', t('home.pricing.flexible'), t('home.pricing.commonArea'), t('home.pricing.coffeeIncluded')]
    },
    {
      type: 'desk',
      icon: Monitor,
      price: '480',
      color: 'from-blue-400 to-blue-600',
      popular: true,
      features: ['WiFi', t('home.pricing.personalDesk'), t('home.pricing.monitor'), t('home.pricing.locker'), t('home.pricing.coffeeIncluded')]
    },
    {
      type: 'meeting_room',
      icon: Users,
      price: '1200',
      color: 'from-purple-400 to-purple-600',
      features: ['WiFi', t('home.pricing.projector'), t('home.pricing.whiteboard'), t('home.pricing.upTo10'), t('home.pricing.coffeeIncluded')]
    },
    {
      type: 'private_office',
      icon: Building2,
      price: '2500',
      color: 'from-emerald-400 to-emerald-600',
      features: ['WiFi', t('home.pricing.privateRoom'), t('home.pricing.furniture'), t('home.pricing.storage'), t('home.pricing.priority')]
    }
  ];

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') }
  ];

  const getTypeGradient = (type) => {
    const gradients = {
      desk: 'from-blue-400 to-blue-600',
      meeting_room: 'from-purple-400 to-purple-600',
      private_office: 'from-emerald-400 to-emerald-600',
      hot_desk: 'from-orange-400 to-orange-600'
    };
    return gradients[type] || 'from-gray-400 to-gray-600';
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-400 via-primary-600 to-primary-700 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
        </div>

        <div className="absolute top-20 left-10 animate-float opacity-30"><Sparkles size={40} className="text-yellow-300" /></div>
        <div className="absolute top-40 right-20 animate-float-delayed opacity-30"><Zap size={35} className="text-yellow-200" /></div>
        <div className="absolute bottom-32 left-1/4 animate-float-slow opacity-30"><Star size={30} className="text-yellow-300" /></div>
        <div className="absolute bottom-20 right-1/3 animate-float opacity-30"><Award size={35} className="text-yellow-200" /></div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-fade-in-up">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm font-semibold">{t('hero.stats.satisfaction')} {t('hero.stats.satisfactionLabel')}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t('hero.title')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-4 bg-yellow-400/30 rounded-lg -z-0"></span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl mb-4 text-blue-100 font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              {[
                { value: t('hero.stats.workspaces'), label: t('hero.stats.workspacesLabel') },
                { value: t('hero.stats.users'), label: t('hero.stats.usersLabel') },
                { value: t('hero.stats.satisfaction'), label: t('hero.stats.satisfactionLabel') }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-1">{stat.value}</div>
                  <div className="text-sm md:text-base text-blue-100">{stat.label}</div>
                  {i < 2 && <div className="hidden md:block absolute w-px h-16 bg-white/30" style={{ left: `${33 + i * 33}%` }}></div>}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <Link to="/workspaces">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 group">
                  <span className="flex items-center text-black">
                    {t('hero.cta')}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </span>
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm shadow-lg transition-all duration-300 text-lg px-8 py-6">
                  {t('hero.learnMore')}
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-blue-100 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300" /><span>{t('hero.trust.securePayment')}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300" /><span>{t('hero.trust.instantConfirmation')}</span></div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300" /><span>{t('hero.trust.support24')}</span></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,120 600,0 900,60 C1050,90 1125,75 1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('benefits.title')}</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">{t('home.benefitsSubtitle')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, key: 'time', color: 'bg-blue-100 text-blue-600' },
              { icon: CreditCard, key: 'payment', color: 'bg-green-100 text-green-600' },
              { icon: TrendingUp, key: 'analytics', color: 'bg-purple-100 text-purple-600' },
              { icon: Users, key: 'support', color: 'bg-orange-100 text-orange-600' }
            ].map(({ icon: Icon, key, color }) => (
              <div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t(`benefits.${key}.title`)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(`benefits.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workspaces */}
      {featuredWorkspaces.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{t('home.featured.title')}</h2>
                <p className="text-gray-500">{t('home.featured.subtitle')}</p>
              </div>
              <Link to="/workspaces" className="hidden md:flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium transition-colors">
                {t('home.featured.viewAll')}
                <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredWorkspaces.map((ws) => (
                <Card key={ws._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className={`h-40 bg-gradient-to-br ${getTypeGradient(ws.type)} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                      <MapPin size={80} className="text-white" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="success">{t('workspace.available')}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="info">{t(`workspace.types.${ws.type}`)}</Badge>
                    </div>
                  </div>
                  <CardBody className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{ws.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">{ws.description || t('home.featured.modernWorkspace')}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary-600">₸{ws.pricePerHour}</span>
                        <span className="text-gray-400 text-sm">/{t('workspace.perHour')}</span>
                      </div>
                      <Link to={`/booking?workspace=${ws._id}`}>
                        <Button size="sm">{t('workspace.bookNow')}</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link to="/workspaces">
                <Button variant="outline">{t('home.featured.viewAll')} <ArrowRight size={16} className="ml-1" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('howItWorks.title')}</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">{t('home.howItWorksSubtitle')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-primary-200">
                    {n}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{t(`howItWorks.step${n}.title`)}</h3>
                  <p className="text-gray-600">{t(`howItWorks.step${n}.description`)}</p>
                </div>
                {n < 4 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-primary-300">
                    <ArrowRight size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('home.pricing.title')}</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map(({ type, icon: Icon, price, color, popular, features }) => (
              <div
                key={type}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  popular ? 'border-primary-500 shadow-lg shadow-primary-100' : 'border-gray-100'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                    {t('home.pricing.popular')}
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t(`workspace.types.${type}`)}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">₸{price}</span>
                  <span className="text-gray-500 text-sm">/{t('workspace.perHour')}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/booking" className="block">
                  <Button className="w-full" variant={popular ? 'primary' : 'outline'}>
                    {t('workspace.bookNow')}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('home.testimonials.title')}</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">{t('home.testimonials.subtitle')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 relative">
                <Quote size={32} className="text-primary-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className={j < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('contact.faq.title')}</h2>
          <p className="text-center text-gray-500 mb-12">{t('home.faq.subtitle')}</p>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={20} className="text-primary-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Strip */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400 mb-6 uppercase tracking-wider font-medium">{t('home.partners.title')}</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40">
            {[Shield, Building2, Headphones, Wifi, Monitor, Coffee].map((Icon, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <Icon size={28} />
                <span className="text-lg font-bold hidden sm:inline">Partner {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-blue-100">{t('cta.description')}</p>
          <Link to="/auth?mode=register">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl text-lg px-10 py-4 font-bold">
              {t('cta.button')}
              <ArrowRight className="ml-2 inline" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};
