import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">أ</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              {lang === 'ar' ? 'المستشفى الأهلي' : 'Al-Ahli Hospital'}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="text-muted-foreground"
            >
              <Globe className="w-4 h-4" />
              <span className="ms-1">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </Button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/portal">
                  <Button variant="outline" size="sm">{t('nav.portal')}</Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">{t('nav.admin')}</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>{t('nav.logout')}</Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">{t('nav.signup')}</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-border pt-2">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/portal" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">{t('nav.portal')}</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">{t('nav.admin')}</Link>}
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-3 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-lg text-start">{t('nav.logout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">{t('nav.login')}</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-primary hover:bg-muted rounded-lg">{t('nav.signup')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
