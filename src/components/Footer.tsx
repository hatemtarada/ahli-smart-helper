import { useI18n } from '@/lib/i18n';
import { Heart, Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t, lang } = useI18n();

  return (
    <footer className="bg-hospital-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">أ</span>
              </div>
              <div>
                <span className="font-bold text-base block leading-none">
                  {lang === 'ar' ? 'المستشفى الأهلي' : 'Al-Ahli Hospital'}
                </span>
                <span className="text-primary-foreground/50 text-xs">
                  {lang === 'ar' ? 'الخليل - فلسطين' : 'Hebron - Palestine'}
                </span>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              {lang === 'ar'
                ? 'نحن بعون الله نرعاكم - مستشفى خيري غير ربحي تأسس عام 1979 لخدمة المجتمع الفلسطيني.'
                : 'With God\'s help, we care for you - A non-profit charitable hospital established in 1979.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm mb-5 text-primary-foreground/90 uppercase tracking-wider">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/departments', label: t('nav.departments') },
                { to: '/doctors', label: t('nav.doctors') },
                { to: '/services', label: t('nav.services') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/portal', label: t('nav.portal') },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors flex items-center gap-1.5 group">
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-5 text-primary-foreground/90 uppercase tracking-wider">
              {t('contact.title')}
            </h3>
            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex items-center gap-2.5 text-primary-foreground/60">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span dir="ltr">0097022224555</span>
              </div>
              <div className="flex items-center gap-2.5 text-primary-foreground/60">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>info@ahli.org</span>
              </div>
              <div className="flex items-start gap-2.5 text-primary-foreground/60">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{t('contact.address')}</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-bold text-sm mb-5 text-primary-foreground/90 uppercase tracking-wider">
              {lang === 'ar' ? 'ساعات العمل' : 'Working Hours'}
            </h3>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="font-medium text-primary-foreground/80">{lang === 'ar' ? 'الطوارئ' : 'Emergency'}</p>
                  <p>{lang === 'ar' ? '24 ساعة / 7 أيام' : '24/7'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="font-medium text-primary-foreground/80">{lang === 'ar' ? 'العيادات' : 'Clinics'}</p>
                  <p>{lang === 'ar' ? '٨:٠٠ ص - ٣:٠٠ م' : '8:00 AM - 3:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/40 flex items-center gap-1.5">
            © {new Date().getFullYear()} {lang === 'ar' ? 'المستشفى الأهلي - الخليل' : 'Al-Ahli Hospital - Hebron'}
            <span className="mx-1">•</span>
            {lang === 'ar' ? 'صُنع بـ' : 'Made with'}
            <Heart className="w-3 h-3 text-destructive inline" />
          </p>
          <p className="text-xs text-primary-foreground/30">
            {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;