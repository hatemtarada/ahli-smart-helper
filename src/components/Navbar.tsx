import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, LogOut, User, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/departments', label: t('nav.departments') },
    { to: '/doctors', label: t('nav.doctors') },
    { to: '/services', label: t('nav.services') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-card/95 backdrop-blur-xl border-b border-border shadow-card'
        : 'bg-card/80 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-black text-lg">أ</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base text-foreground leading-none block">
                {lang === 'ar' ? 'المستشفى الأهلي' : 'Al-Ahli Hospital'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {lang === 'ar' ? 'الخليل - فلسطين' : 'Hebron - Palestine'}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'EN' : 'عربي'}
            </Button>

            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/portal">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 font-semibold">
                    <User className="w-3.5 h-3.5" />
                    {t('nav.portal')}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 font-semibold border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t('nav.admin')}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={signOut} className="text-xs gap-1.5 text-muted-foreground">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold">{t('nav.login')}</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="text-xs font-semibold shadow-glow">{t('nav.signup')}</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-border pt-3 animate-fade-in">
            <div className="flex flex-col gap-0.5">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                {user ? (
                  <>
                    <Link to="/portal" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted rounded-lg flex items-center gap-2">
                      <User className="w-4 h-4" /> {t('nav.portal')}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-accent hover:bg-muted rounded-lg flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {t('nav.admin')}
                      </Link>
                    )}
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-muted rounded-lg text-start w-full flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-4 py-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full text-xs">{t('nav.login')}</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button className="w-full text-xs">{t('nav.signup')}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;