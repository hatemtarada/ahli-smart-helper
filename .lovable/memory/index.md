Design system, architecture constraints, and key decisions for Al-Ahli Hospital project

## Design System
- Primary: Teal (HSL 195 85% 35%)
- Accent: Green (HSL 160 60% 40%)
- Font: Cairo (Arabic), Inter (English)
- RTL-first layout, bilingual AR+EN

## Architecture
- Supabase Cloud backend with RLS
- AI chatbot via Lovable AI Gateway (gemini-3-flash-preview)
- Edge function: `chat` (verify_jwt: false)
- Storage bucket: `hospital-uploads` (public, admin-only upload)

## Database Tables
departments, doctors, services, appointments, lab_tests, invoices, invoice_items, feedback, insurance_providers, knowledge_base, doctor_schedules, profiles, user_roles, announcements

## Key Decisions
- Roles in separate `user_roles` table (admin/patient)
- Auto-create profile + patient role on signup
- Default data shown when DB is empty (fallback)
- Hospital data from https://ahli.org/ar/
- Chatbot restricted to hospital-only questions
- Chatbot reads announcements table for news context
- Image upload via hospital-uploads storage bucket
