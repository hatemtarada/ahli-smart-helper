
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'patient');

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Departments
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Doctors
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    specialty_ar TEXT NOT NULL DEFAULT '',
    specialty_en TEXT NOT NULL DEFAULT '',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    image_url TEXT DEFAULT '',
    bio_ar TEXT DEFAULT '',
    bio_en TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Services
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    price NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Lab tests
CREATE TABLE public.lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    test_name_ar TEXT NOT NULL,
    test_name_en TEXT NOT NULL DEFAULT '',
    result TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result_date DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoice items
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT DEFAULT '',
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Feedback
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_name TEXT DEFAULT '',
    patient_email TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'feedback' CHECK (type IN ('feedback', 'complaint', 'suggestion')),
    subject TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Insurance providers
CREATE TABLE public.insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;

-- Knowledge base for chatbot (scraped website content)
CREATE TABLE public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    source_url TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Doctor schedule (for appointment booking)
CREATE TABLE public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Departments (public read, admin write)
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Doctors (public read, admin write)
CREATE POLICY "Anyone can view doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Services (public read, admin write)
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Admins can manage appointments" ON public.appointments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Lab tests
CREATE POLICY "Patients can view own lab tests" ON public.lab_tests FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Admins can manage lab tests" ON public.lab_tests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Invoices
CREATE POLICY "Patients can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Invoice items
CREATE POLICY "Patients can view own invoice items" ON public.invoice_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.patient_id = auth.uid())
);
CREATE POLICY "Admins can manage invoice items" ON public.invoice_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Feedback
CREATE POLICY "Anyone can create feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Admins can manage feedback" ON public.feedback FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insurance providers (public read)
CREATE POLICY "Anyone can view insurance providers" ON public.insurance_providers FOR SELECT USING (true);
CREATE POLICY "Admins can manage insurance providers" ON public.insurance_providers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Knowledge base (public read, admin write)
CREATE POLICY "Anyone can view knowledge base" ON public.knowledge_base FOR SELECT USING (true);
CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Doctor schedules (public read, admin write)
CREATE POLICY "Anyone can view doctor schedules" ON public.doctor_schedules FOR SELECT USING (true);
CREATE POLICY "Admins can manage doctor schedules" ON public.doctor_schedules FOR ALL USING (public.has_role(auth.uid(), 'admin'));
