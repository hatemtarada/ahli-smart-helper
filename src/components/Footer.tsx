import { useI18n } from '@/lib/i18n';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t, lang } = useI18n();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-bold">أ</span>
              </div>
              <span className="font-bold text-lg">
                {lang === 'ar' ? 'المستشفى الأهلي' : 'Al-Ahli Hospital'}
              </span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              {lang === 'ar'
                ? 'نحن بعون الله نرعاكم - المستشفى الأهلي في الخليل'
                : 'With God\'s help, we care for you - Al-Ahli Hospital, Hebron'}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
            <div className="flex flex-col gap-2">
              <Link to="/departments" className="text-background/70 hover:text-background text-sm transition-colors">{t('nav.departments')}</Link>
              <Link to="/doctors" className="text-background/70 hover:text-background text-sm transition-colors">{t('nav.doctors')}</Link>
              <Link to="/services" className="text-background/70 hover:text-background text-sm transition-colors">{t('nav.services')}</Link>
              <Link to="/contact" className="text-background/70 hover:text-background text-sm transition-colors">{t('nav.contact')}</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t('contact.title')}</h3>
            <div className="flex flex-col gap-3 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span dir="ltr">0097022224555</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>info@ahli.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{t('contact.address')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm text-background/50">
          <p className="flex items-center justify-center gap-1">
            {lang === 'ar' ? 'صُنع بـ' : 'Made with'}
            <Heart className="w-3 h-3 text-destructive" />
            {lang === 'ar' ? 'للمستشفى الأهلي - الخليل' : 'for Al-Ahli Hospital - Hebron'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
