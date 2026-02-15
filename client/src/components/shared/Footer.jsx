import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <span className="text-2xl font-bold">Inkar</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('hero.subtitle')}
            </p>
            <div className="flex gap-3">
              {['Facebook', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 text-xs font-bold">
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-5">{t('nav.workspaces')}</h3>
            <ul className="space-y-3">
              {[
                { to: '/workspaces', label: t('nav.workspaces') },
                { to: '/booking', label: t('booking.title') },
                { to: '/about', label: t('footer.about') },
                { to: '/contact', label: t('footer.contact') }
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-5">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary-400" />
                <span>{t('contact.info.address.content')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={16} className="flex-shrink-0 text-primary-400" />
                <span>{t('contact.info.phone.content')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={16} className="flex-shrink-0 text-primary-400" />
                <span>{t('contact.info.email.content')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Clock size={16} className="flex-shrink-0 text-primary-400" />
                <span>{t('contact.info.hours.content')}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-5">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
          <p className="text-gray-600 text-xs">Made with care in Kazakhstan</p>
        </div>
      </div>
    </footer>
  );
};
