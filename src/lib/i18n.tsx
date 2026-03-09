import React, { createContext, useContext, useState, useCallback } from 'react';

type Lang = 'ar' | 'en';

interface I18nContextType {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.about': { ar: 'عن المستشفى', en: 'About' },
  'nav.departments': { ar: 'الأقسام', en: 'Departments' },
  'nav.doctors': { ar: 'الأطباء', en: 'Doctors' },
  'nav.services': { ar: 'الخدمات', en: 'Services' },
  'nav.contact': { ar: 'اتصل بنا', en: 'Contact' },
  'nav.portal': { ar: 'بوابة المريض', en: 'Patient Portal' },
  'nav.admin': { ar: 'لوحة التحكم', en: 'Admin' },
  'nav.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'nav.signup': { ar: 'إنشاء حساب', en: 'Sign Up' },

  // Hero
  'hero.welcome': { ar: 'أهلاً بكم في المستشفى الأهلي', en: 'Welcome to Al-Ahli Hospital' },
  'hero.subtitle': { ar: 'نحن بعون الله نرعاكم', en: 'With God\'s help, we care for you' },
  'hero.location': { ar: 'الخليل - فلسطين', en: 'Hebron - Palestine' },
  'hero.book': { ar: 'احجز موعد', en: 'Book Appointment' },
  'hero.explore': { ar: 'استكشف الأقسام', en: 'Explore Departments' },

  // Stats
  'stats.surgeries': { ar: 'عملية جراحية', en: 'Surgeries' },
  'stats.er': { ar: 'زيارة طوارئ', en: 'ER Visits' },
  'stats.outpatient': { ar: 'مراجعة عيادات', en: 'Outpatient Visits' },
  'stats.lab': { ar: 'فحص مخبري', en: 'Lab Tests' },
  'stats.xray': { ar: 'صورة إشعاعية', en: 'X-Rays' },
  'stats.births': { ar: 'ولادة', en: 'Births' },

  // Sections
  'departments.title': { ar: 'الأقسام الطبية', en: 'Medical Departments' },
  'departments.subtitle': { ar: 'يضم المستشفى الأقسام الطبية التالية', en: 'Our hospital includes the following departments' },
  'doctors.title': { ar: 'الكادر الطبي', en: 'Medical Staff' },
  'doctors.subtitle': { ar: 'نخبة من الأطباء المتخصصين', en: 'Elite specialized doctors' },
  'services.title': { ar: 'خدماتنا', en: 'Our Services' },
  'services.subtitle': { ar: 'خدمات طبية متكاملة', en: 'Comprehensive medical services' },

  // Common
  'common.viewAll': { ar: 'عرض الكل', en: 'View All' },
  'common.viewDetails': { ar: 'التفاصيل', en: 'View Details' },
  'common.bookAppointment': { ar: 'احجز موعد', en: 'Book Appointment' },
  'common.search': { ar: 'بحث', en: 'Search' },
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.add': { ar: 'إضافة', en: 'Add' },
  'common.submit': { ar: 'إرسال', en: 'Submit' },
  'common.back': { ar: 'رجوع', en: 'Back' },
  'common.name': { ar: 'الاسم', en: 'Name' },
  'common.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'common.phone': { ar: 'الهاتف', en: 'Phone' },
  'common.password': { ar: 'كلمة المرور', en: 'Password' },
  'common.specialty': { ar: 'التخصص', en: 'Specialty' },

  // About
  'about.title': { ar: 'عن المستشفى الأهلي', en: 'About Al-Ahli Hospital' },
  'about.description': { ar: 'المستشفى الأهلي في الخليل هو صرح طبي شامخ يقدم خدمات طبية متكاملة لأهالي المدينة والمنطقة. تأسس بجهود المحسنين والمتبرعين ليكون منارة صحية تخدم المجتمع.', en: 'Al-Ahli Hospital in Hebron is a prominent medical institution providing comprehensive healthcare services to the city and surrounding areas.' },

  // Contact
  'contact.title': { ar: 'اتصل بنا', en: 'Contact Us' },
  'contact.address': { ar: 'الخليل - فلسطين', en: 'Hebron - Palestine' },
  'contact.phone': { ar: '0097022224555', en: '0097022224555' },
  'contact.email': { ar: 'info@ahli.org', en: 'info@ahli.org' },
  'contact.sendMessage': { ar: 'أرسل رسالة', en: 'Send Message' },
  'contact.yourName': { ar: 'اسمك', en: 'Your Name' },
  'contact.yourEmail': { ar: 'بريدك الإلكتروني', en: 'Your Email' },
  'contact.subject': { ar: 'الموضوع', en: 'Subject' },
  'contact.message': { ar: 'الرسالة', en: 'Message' },

  // Auth
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.signup': { ar: 'إنشاء حساب جديد', en: 'Create Account' },
  'auth.fullName': { ar: 'الاسم الكامل', en: 'Full Name' },
  'auth.noAccount': { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  'auth.hasAccount': { ar: 'لديك حساب؟', en: 'Already have an account?' },

  // Chatbot
  'chat.title': { ar: 'المساعد الذكي', en: 'Smart Assistant' },
  'chat.placeholder': { ar: 'اكتب سؤالك هنا...', en: 'Type your question...' },
  'chat.welcome': { ar: 'مرحباً! أنا المساعد الذكي للمستشفى الأهلي. كيف يمكنني مساعدتك؟', en: 'Hello! I\'m Al-Ahli Hospital\'s smart assistant. How can I help you?' },

  // Portal
  'portal.myAppointments': { ar: 'مواعيدي', en: 'My Appointments' },
  'portal.myLabTests': { ar: 'نتائج الفحوصات', en: 'Lab Results' },
  'portal.myInvoices': { ar: 'فواتيري', en: 'My Invoices' },
  'portal.feedback': { ar: 'شكاوى واقتراحات', en: 'Feedback' },
  'portal.profile': { ar: 'ملفي الشخصي', en: 'My Profile' },

  // Admin
  'admin.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'admin.manageDoctors': { ar: 'إدارة الأطباء', en: 'Manage Doctors' },
  'admin.manageDepartments': { ar: 'إدارة الأقسام', en: 'Manage Departments' },
  'admin.manageServices': { ar: 'إدارة الخدمات', en: 'Manage Services' },
  'admin.manageAppointments': { ar: 'إدارة المواعيد', en: 'Manage Appointments' },
  'admin.manageLabTests': { ar: 'إدارة الفحوصات', en: 'Manage Lab Tests' },
  'admin.manageInvoices': { ar: 'إدارة الفواتير', en: 'Manage Invoices' },
  'admin.manageFeedback': { ar: 'إدارة الشكاوى', en: 'Manage Feedback' },

  // Appointment booking
  'booking.chooseDepartment': { ar: 'اختر القسم', en: 'Choose Department' },
  'booking.chooseDoctor': { ar: 'اختر الطبيب', en: 'Choose Doctor' },
  'booking.chooseDate': { ar: 'اختر التاريخ', en: 'Choose Date' },
  'booking.chooseTime': { ar: 'اختر الوقت', en: 'Choose Time' },
  'booking.confirm': { ar: 'تأكيد الحجز', en: 'Confirm Booking' },
  'booking.success': { ar: 'تم حجز الموعد بنجاح!', en: 'Appointment booked successfully!' },
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('ar');

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: string) => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
