-- ========================================================================
-- النسخة النهائية الكاملة والشاملة لقاعدة البيانات
-- LEAGO Car Rental System - Complete Database Schema (Final Version)
-- تتضمن: الجداول، الدوال، Triggers، RLS Policies، Indexes، والجدولة
-- بدون أي بيانات أولية (INSERTs)
-- ========================================================================

-- ========================================================================
-- 1. تمكين الامتدادات اللازمة
-- ========================================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ========================================================================
-- 2. إنشاء الأنواع المخصصة (Enums)
-- ========================================================================
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('admin', 'branch', 'branch_employee', 'customer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.rental_type AS ENUM ('daily', 'weekly', 'monthly', 'ownership'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.document_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.car_status AS ENUM ('available', 'rented', 'maintenance', 'hidden'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.notification_type AS ENUM ('info','warning','booking_update','system','booking_cancelled','booking_expired','booking_completed','document_update'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.announcement_priority AS ENUM ('normal','high','urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ 
BEGIN 
  CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'payment_pending', 'active', 'completed', 'cancelled', 'expired'); 
EXCEPTION WHEN duplicate_object THEN 
  ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'expired';
END $$;

-- ========================================================================
-- 3. إنشاء الجداول الرئيسية
-- ========================================================================

-- جدول الفروع
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  location_en TEXT NOT NULL,
  location_ar TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geom geography(Point, 4326),
  phone TEXT,
  email TEXT,
  working_hours TEXT,
  images TEXT[],
  description_ar TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  manager_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT UNIQUE,
  phone_verified_at TIMESTAMPTZ,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  user_latitude DECIMAL(10,8),
  user_longitude DECIMAL(11,8),
  location_updated_at TIMESTAMP WITH TIME ZONE,
  location_accuracy NUMERIC,
  geom geography(Point, 4326),
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الأدوار (User Roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- إضافة قيد المدير للفروع
ALTER TABLE public.branches ADD CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES auth.users(id);

-- جدول الوثائق
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status document_status DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT documents_document_type_check CHECK (document_type = ANY (ARRAY['national_id'::text, 'driving_license'::text])),
  CONSTRAINT chk_document_url_scheme CHECK (
    document_url ~* '^https://[a-z0-9.-]+(/.*)?$'::text 
    OR document_url ~* '^/storage/v1/object/public/.*'::text
    OR document_url ~* '^[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|pdf|doc|docx)$'::text
  )
);

-- جدول العلامات التجارية
CREATE TABLE IF NOT EXISTS public.car_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول موديلات السيارات
CREATE TABLE IF NOT EXISTS public.car_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.car_brands(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  year INTEGER NOT NULL,
  default_image_url TEXT,
  description_en TEXT,
  description_ar TEXT,
  specifications JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brand_id, name_en, year)
);

-- جدول ألوان السيارات
CREATE TABLE IF NOT EXISTS public.car_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  hex_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول مميزات السيارات
CREATE TABLE IF NOT EXISTS public.car_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول السيارات
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.car_models(id) ON DELETE CASCADE,
  color_id UUID REFERENCES public.car_colors(id) ON DELETE SET NULL,
  daily_price DECIMAL(10, 2) NOT NULL,
  weekly_price DECIMAL(10, 2),
  monthly_price DECIMAL(10, 2),
  ownership_price DECIMAL(10, 2),
  mileage INTEGER DEFAULT 0,
  seats INTEGER NOT NULL DEFAULT 5,
  fuel_type TEXT NOT NULL DEFAULT 'gasoline',
  transmission TEXT NOT NULL DEFAULT 'automatic',
  features TEXT[],
  features_ar TEXT[],
  features_en TEXT[],
  description_ar TEXT,
  description_en TEXT,
  additional_images TEXT[],
  quantity INTEGER NOT NULL DEFAULT 1,
  available_quantity INTEGER NOT NULL DEFAULT 1,
  status car_status DEFAULT 'available',
  is_new BOOLEAN DEFAULT FALSE,
  discount_percentage INTEGER DEFAULT 0,
  offer_expires_at TIMESTAMPTZ,
  rental_types rental_type[] DEFAULT '{daily}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (available_quantity <= quantity),
  CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CHECK (daily_price > 0)
);

-- جدول الربط بين السيارات والمميزات
CREATE TABLE IF NOT EXISTS public.car_feature_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.car_features(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(car_id, feature_id)
);

-- جدول الحجوزات
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  rental_type rental_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_reference TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  booking_range daterange GENERATED ALWAYS AS (daterange(start_date, end_date, '[)')) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (daily_rate >= 0),
  CHECK (total_amount >= 0),
  CHECK (final_amount >= 0),
  CHECK (start_date < end_date)
);

-- جدول الإعلانات
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  priority public.announcement_priority DEFAULT 'normal',
  branch_id UUID REFERENCES public.branches(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  message_en TEXT NOT NULL,
  message_ar TEXT,
  type public.notification_type NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  sent_via TEXT CHECK (sent_via IN ('system','job','admin','branch_manager')) DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_metadata_size CHECK (pg_column_size(metadata) <= 8192)
);

-- جدول العروض على السيارات
CREATE TABLE IF NOT EXISTS public.car_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  offer_name_ar TEXT NOT NULL,
  offer_name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_days_get_free')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_rental_days INTEGER DEFAULT 1,
  max_rental_days INTEGER,
  rental_types rental_type[] DEFAULT '{daily}',
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول تحديد معدل الطلبات (Rate Limiting) - ✅ المُحدّث
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, action_type, attempted_at);

-- جدول سجل الأمان
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  identifier TEXT,
  details JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول صندوق الإشعارات الصادرة
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  to_user uuid NOT NULL,
  type public.notification_type NOT NULL
);

-- جدول سجل المراجعة
CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor uuid,
  table_name text NOT NULL,
  row_id uuid,
  action text CHECK (action IN ('insert','update','delete')),
  old_data jsonb,
  new_data jsonb
);

-- جدول طلبات OTP
CREATE TABLE IF NOT EXISTS public.otp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  authentica_session_id TEXT,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التحقق من الهاتف
CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول سجلات المصادقة
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- 4. تمكين RLS على جميع الجداول
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_feature_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- 5. الدوال الأساسية والمساعدة
-- ========================================================================

-- دالة التحديث التلقائي للـ updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- دالة كشف اللغة
CREATE OR REPLACE FUNCTION public.detect_language(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF text_input ~ '[\u0600-\u06FF]' THEN
    RETURN 'ar';
  ELSE
    RETURN 'en';
  END IF;
END;
$$;

-- دالة التحقق من الدور
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- دالة الحصول على دور المستخدم
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- دالة الحصول على دور المستخدم الحالي
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- دالة التحقق من المسؤول
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT has_role(auth.uid(), 'admin');
$$;

-- دالة التحقق من مدير الفرع
CREATE OR REPLACE FUNCTION public.is_branch_manager()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT has_role(auth.uid(), 'branch');
$$;

-- دالة الحصول على فرع المستخدم الحالي
CREATE OR REPLACE FUNCTION public.current_user_branch_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT branch_id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- دالة إرسال الإشعارات
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_title_ar TEXT,
  p_title_en TEXT,
  p_message_ar TEXT,
  p_message_en TEXT,
  p_type notification_type,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title_ar, title_en, message_ar, message_en, type, metadata, created_by
  ) VALUES (
    p_user_id, p_title_ar, p_title_en, p_message_ar, p_message_en, p_type, p_metadata, auth.uid()
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- دالة تسجيل الأحداث الأمنية
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID,
  p_identifier TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO security_audit_log (event_type, user_id, identifier, details)
  VALUES (p_event_type, p_user_id, p_identifier, p_details);
END;
$$;

-- دالة تسجيل مشاكل التوفر
CREATE OR REPLACE FUNCTION public.log_availability_inconsistency(
  p_car_id UUID,
  p_issue_type TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO security_audit_log (
    event_type, 
    identifier, 
    details
  )
  VALUES (
    'availability_inconsistency',
    p_car_id::TEXT,
    p_details || jsonb_build_object('issue_type', p_issue_type)
  );
END;
$$;

-- دالة إنشاء ملف المستخدم تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := NEW.id;
  
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    phone,
    age,
    gender,
    location,
    user_latitude,
    user_longitude
  )
  VALUES (
    new_user_id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'temp_email' IS NOT NULL 
        AND NEW.raw_user_meta_data ->> 'email' != '' 
      THEN NEW.raw_user_meta_data ->> 'email'
      ELSE COALESCE(NEW.email, '')
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'age')::INTEGER
      ELSE NULL
    END,
    NEW.raw_user_meta_data ->> 'gender',
    NEW.raw_user_meta_data ->> 'location',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'user_latitude' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'user_latitude')::DECIMAL
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'user_longitude' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'user_longitude')::DECIMAL
      ELSE NULL
    END
  );
  
  INSERT INTO public.user_roles (
    user_id,
    role
  )
  VALUES (
    new_user_id,
    'customer'
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$;

-- ========================================================================
-- 6. دوال نظام الحجوزات
-- ========================================================================

-- دالة تحديد الحالات التي تستهلك السعة
CREATE OR REPLACE FUNCTION public.booking_status_consumes_capacity(_st public.booking_status)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT _st IN ('pending', 'confirmed', 'payment_pending', 'active');
$$;

-- دوال المساعدة للحجوزات
CREATE OR REPLACE FUNCTION public.make_booking_range(_start date, _end date)
RETURNS daterange
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT daterange(_start, _end, '[)');
$$;

CREATE OR REPLACE FUNCTION public.days_from_range(_r daterange)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT GREATEST(1, (upper(_r) - lower(_r))::int);
$$;

-- الدالة الرئيسية لحساب الكمية المتاحة الفعلية
CREATE OR REPLACE FUNCTION public.get_actual_available_quantity(
  _car_id uuid,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_quantity INTEGER;
  reserved_quantity INTEGER;
BEGIN
  SELECT quantity INTO total_quantity
  FROM public.cars
  WHERE id = _car_id;

  IF total_quantity IS NULL THEN
    RETURN 0;
  END IF;

  IF _start_date IS NOT NULL AND _end_date IS NOT NULL THEN
    SELECT COALESCE(COUNT(*), 0) INTO reserved_quantity
    FROM public.bookings
    WHERE car_id = _car_id
      AND booking_status_consumes_capacity(status)
      AND booking_range && make_booking_range(_start_date, _end_date);
  ELSE
    SELECT COALESCE(COUNT(*), 0) INTO reserved_quantity
    FROM public.bookings
    WHERE car_id = _car_id
      AND booking_status_consumes_capacity(status)
      AND (expires_at IS NULL OR expires_at > NOW());
  END IF;

  RETURN GREATEST(0, total_quantity - reserved_quantity);
END;
$$;

-- دالة التحقق من توفر السيارة
CREATE OR REPLACE FUNCTION public.check_car_availability(
  _car_id UUID,
  _start_date DATE,
  _end_date DATE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_end_date date;
  v_available_qty integer;
  v_car_status car_status;
BEGIN
  v_end_date := COALESCE(_end_date, _start_date + 1);
  
  SELECT status INTO v_car_status
  FROM cars
  WHERE id = _car_id;
  
  IF v_car_status IS NULL OR v_car_status != 'available' THEN
    RETURN false;
  END IF;
  
  v_available_qty := get_actual_available_quantity(_car_id, _start_date, v_end_date);
  
  RETURN v_available_qty > 0;
END;
$$;

-- دالة إنشاء الحجز النهائية
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_customer_id uuid, 
  p_car_id uuid, 
  p_branch_id uuid, 
  p_rental_type rental_type, 
  p_start date, 
  p_end date, 
  p_daily_rate numeric, 
  p_discount_amount numeric DEFAULT 0, 
  p_initial_status booking_status DEFAULT 'pending'::booking_status,
  p_notes text DEFAULT NULL::text
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role public.user_role;
  v_car public.cars%ROWTYPE;
  v_b public.bookings%ROWTYPE;
  v_range daterange;
  v_total_days int;
  v_base_price numeric;
  v_car_discount_amount numeric := 0;
  v_price_after_car_discount numeric;
  v_total_amount numeric;
  v_total_discount numeric := 0;
  v_final_amount numeric;
  v_actual_rate numeric;
  v_expires_at timestamp with time zone;
  v_branch_manager_id uuid;
  v_actual_available int;
  v_full_periods int;
  v_remaining_days int;
  v_apply_discount boolean := false;
BEGIN
  v_role := public.get_user_role(auth.uid());
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  SELECT * INTO v_car 
  FROM public.cars 
  WHERE id = p_car_id 
    AND status = 'available'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Car not available';
  END IF;
  
  IF v_car.branch_id IS DISTINCT FROM p_branch_id THEN
    RAISE EXCEPTION 'Car branch mismatch';
  END IF;

  IF NOT (p_rental_type = ANY(v_car.rental_types)) THEN
    RAISE EXCEPTION 'Rental type % not allowed for this car', p_rental_type;
  END IF;

  IF p_start IS NULL OR p_end IS NULL OR p_start >= p_end THEN
    RAISE EXCEPTION 'Invalid dates';
  END IF;
  
  v_range := daterange(p_start, p_end, '[)');
  v_total_days := GREATEST(1, (p_end - p_start));

  CASE p_rental_type
    WHEN 'daily' THEN
      v_base_price := v_car.daily_price;
    WHEN 'weekly' THEN
      v_base_price := COALESCE(v_car.weekly_price, v_car.daily_price * 7);
    WHEN 'monthly' THEN
      v_base_price := COALESCE(v_car.monthly_price, v_car.daily_price * 30);
    WHEN 'ownership' THEN
      IF v_car.ownership_price IS NULL THEN
        RAISE EXCEPTION 'Ownership price not available for this car';
      END IF;
      v_base_price := v_car.ownership_price;
    ELSE
      RAISE EXCEPTION 'Invalid rental type: %', p_rental_type;
  END CASE;

  IF p_rental_type != 'ownership' AND v_car.discount_percentage > 0 THEN
    IF v_car.offer_expires_at IS NULL OR v_car.offer_expires_at >= NOW() THEN
      v_apply_discount := true;
      v_car_discount_amount := v_base_price * v_car.discount_percentage / 100;
      v_price_after_car_discount := v_base_price - v_car_discount_amount;
    ELSE
      v_apply_discount := false;
      v_price_after_car_discount := v_base_price;
      v_car_discount_amount := 0;
    END IF;
  ELSE
    v_apply_discount := false;
    v_price_after_car_discount := v_base_price;
    v_car_discount_amount := 0;
  END IF;

  v_actual_rate := v_price_after_car_discount;

  CASE p_rental_type
    WHEN 'daily' THEN
      v_total_amount := v_actual_rate * v_total_days;
      IF v_apply_discount THEN
        v_total_discount := v_car_discount_amount * v_total_days;
      END IF;
      
    WHEN 'weekly' THEN
      IF v_total_days <= 7 THEN
        v_total_amount := v_actual_rate;
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount;
        END IF;
      ELSE
        v_full_periods := FLOOR(v_total_days / 7);
        v_remaining_days := v_total_days % 7;
        v_total_amount := v_actual_rate * v_full_periods;
        
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount * v_full_periods;
        END IF;
        
        IF v_remaining_days > 0 THEN
          IF v_remaining_days <= 3 THEN
            v_total_amount := v_total_amount + (v_car.daily_price * v_remaining_days);
          ELSE
            v_total_amount := v_total_amount + v_actual_rate;
            IF v_apply_discount THEN
              v_total_discount := v_total_discount + v_car_discount_amount;
            END IF;
          END IF;
        END IF;
      END IF;
      
    WHEN 'monthly' THEN
      IF v_total_days <= 31 THEN
        v_total_amount := v_actual_rate;
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount;
        END IF;
      ELSE
        v_full_periods := FLOOR(v_total_days / 30);
        v_remaining_days := v_total_days % 30;
        v_total_amount := v_actual_rate * v_full_periods;
        
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount * v_full_periods;
        END IF;
        
        IF v_remaining_days > 0 THEN
          IF v_remaining_days <= 15 THEN
            v_total_amount := v_total_amount + (v_car.daily_price * v_remaining_days);
          ELSE
            v_total_amount := v_total_amount + v_actual_rate;
            IF v_apply_discount THEN
              v_total_discount := v_total_discount + v_car_discount_amount;
            END IF;
          END IF;
        END IF;
      END IF;
      
    WHEN 'ownership' THEN
      v_total_amount := v_actual_rate;
      v_total_discount := 0;
      
    ELSE
      RAISE EXCEPTION 'Invalid rental type: %', p_rental_type;
  END CASE;

  v_final_amount := v_total_amount;

  IF public.booking_status_consumes_capacity(p_initial_status) THEN
    v_actual_available := public.get_actual_available_quantity(p_car_id, p_start, p_end);
    
    IF v_actual_available <= 0 THEN
      RAISE EXCEPTION 'No availability for the requested period';
    END IF;
  END IF;

  IF p_initial_status = 'pending' THEN
    v_expires_at := NULL;
  ELSIF p_initial_status = 'confirmed' THEN
    v_expires_at := NOW() + INTERVAL '24 hours';
  ELSIF p_initial_status = 'payment_pending' THEN
    v_expires_at := NOW() + INTERVAL '30 minutes';
  ELSE
    v_expires_at := NULL;
  END IF;

  INSERT INTO public.bookings (
    id, customer_id, car_id, branch_id, rental_type,
    start_date, end_date, total_days, daily_rate,
    total_amount, discount_amount, final_amount,
    status, notes, expires_at
  ) VALUES (
    gen_random_uuid(), p_customer_id, p_car_id, p_branch_id, p_rental_type,
    p_start, p_end, v_total_days, v_actual_rate,
    v_total_amount, v_total_discount, v_final_amount,
    p_initial_status, p_notes, v_expires_at
  )
  RETURNING * INTO v_b;

  IF p_initial_status = 'pending' THEN
    SELECT manager_id INTO v_branch_manager_id
    FROM public.branches 
    WHERE id = p_branch_id;
    
    IF v_branch_manager_id IS NOT NULL THEN
      PERFORM public.send_notification(
        v_branch_manager_id,
        'حجز جديد',
        'New Booking',
        'هناك حجز جديد في انتظار موافقتك',
        'There is a new booking waiting for your approval',
        'booking_update',
        jsonb_build_object('booking_id', v_b.id)
      );
    END IF;
  END IF;

  RETURN v_b;
END;
$$;

-- دالة إلغاء الحجز من العميل
CREATE OR REPLACE FUNCTION public.customer_cancel_booking(
  p_booking_id UUID,
  p_cancellation_notes TEXT DEFAULT NULL
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking bookings;
  v_customer_id UUID;
BEGIN
  v_customer_id := auth.uid();
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found';
  END IF;

  IF v_booking.customer_id != v_customer_id THEN
    RAISE EXCEPTION 'forbidden: not your booking';
  END IF;

  IF v_booking.status NOT IN ('pending', 'confirmed', 'payment_pending') THEN
    RAISE EXCEPTION 'cannot_cancel: booking status is %', v_booking.status;
  END IF;

  UPDATE bookings
  SET 
    status = 'cancelled',
    notes = COALESCE(p_cancellation_notes, notes),
    updated_at = NOW()
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  PERFORM send_notification(
    (SELECT manager_id FROM branches WHERE id = v_booking.branch_id),
    'إلغاء حجز',
    'Booking Cancelled',
    'تم إلغاء حجز من قبل العميل',
    'A booking has been cancelled by the customer',
    'booking_cancelled',
    jsonb_build_object('booking_id', p_booking_id)
  );

  RETURN v_booking;
END;
$$;

-- دالة موافقة الفرع على الحجز
CREATE OR REPLACE FUNCTION public.approve_booking(
  p_booking_id uuid,
  p_payment_deadline_hours integer DEFAULT 24
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_role public.user_role;
BEGIN
  v_role := public.get_user_role(auth.uid());
  IF v_role NOT IN ('admin', 'branch', 'branch_employee') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
    AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not in pending status';
  END IF;

  UPDATE public.bookings
  SET 
    status = 'confirmed',
    approved_by = auth.uid(),
    approved_at = NOW(),
    expires_at = NOW() + (p_payment_deadline_hours || ' hours')::interval,
    updated_at = NOW()
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  PERFORM public.send_notification(
    v_booking.customer_id,
    'تم قبول حجزك',
    'Booking Approved',
    'تم قبول حجزك. يرجى إتمام الدفع خلال ' || p_payment_deadline_hours || ' ساعة',
    'Your booking has been approved. Please complete payment within ' || p_payment_deadline_hours || ' hours',
    'booking_update',
    jsonb_build_object(
      'booking_id', p_booking_id,
      'expires_at', v_booking.expires_at
    )
  );

  RETURN v_booking;
END;
$$;

-- دالة رفض الحجز من الفرع
CREATE OR REPLACE FUNCTION public.reject_booking(
  p_booking_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_role public.user_role;
BEGIN
  v_role := public.get_user_role(auth.uid());
  IF v_role NOT IN ('admin', 'branch', 'branch_employee') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
    AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or not in pending status';
  END IF;

  UPDATE public.bookings
  SET 
    status = 'cancelled',
    notes = COALESCE(p_reason, 'رفض من قبل الفرع'),
    updated_at = NOW()
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  PERFORM public.send_notification(
    v_booking.customer_id,
    'تم رفض حجزك',
    'Booking Rejected',
    COALESCE(p_reason, 'تم رفض حجزك من قبل الفرع. يمكنك التواصل معهم لمعرفة السبب'),
    COALESCE(p_reason, 'Your booking has been rejected by the branch. You can contact them for more information'),
    'warning',
    jsonb_build_object('booking_id', p_booking_id, 'reason', p_reason)
  );

  RETURN v_booking;
END;
$$;

-- دالة تحديث ملاحظات الحجز
CREATE OR REPLACE FUNCTION public.update_booking_notes(
  p_booking_id UUID,
  p_notes TEXT
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_role user_role;
BEGIN
  v_role := get_user_role(auth.uid());
  
  IF v_role NOT IN ('admin', 'branch', 'branch_employee') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;
  
  UPDATE bookings
  SET 
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_booking_id
    AND (
      is_admin()
      OR branch_id = current_user_branch_id()
    )
  RETURNING * INTO v_booking;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;
  
  RETURN v_booking;
END;
$$;

-- دالة لجلب تفاصيل الحجز الشاملة
CREATE OR REPLACE FUNCTION public.get_booking_details(p_booking_id UUID)
RETURNS TABLE(
  booking_id UUID,
  booking_status booking_status,
  start_date DATE,
  end_date DATE,
  total_days INTEGER,
  daily_rate NUMERIC,
  total_amount NUMERIC,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  rental_type rental_type,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  customer_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_verified BOOLEAN,
  customer_bookings_count BIGINT,
  customer_documents_count BIGINT,
  customer_approved_documents_count BIGINT,
  car_id UUID,
  brand_name_ar TEXT,
  model_name_ar TEXT,
  model_year INTEGER,
  color_name_ar TEXT,
  car_image_url TEXT,
  branch_id UUID,
  branch_name_ar TEXT,
  branch_phone TEXT,
  branch_location_ar TEXT,
  approved_by_id UUID,
  approved_by_name TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    b.id,
    b.status,
    b.start_date,
    b.end_date,
    b.total_days,
    b.daily_rate,
    b.total_amount,
    b.discount_amount,
    b.final_amount,
    b.rental_type,
    b.payment_reference,
    b.notes,
    b.created_at,
    b.approved_at,
    b.expires_at,
    p.user_id,
    p.full_name,
    p.email,
    p.phone,
    p.is_verified,
    (SELECT COUNT(*) FROM bookings WHERE customer_id = p.user_id),
    (SELECT COUNT(*) FROM documents WHERE user_id = p.user_id),
    (SELECT COUNT(*) FROM documents WHERE user_id = p.user_id AND status = 'approved'),
    c.id,
    cb.name_ar,
    cm.name_ar,
    cm.year,
    cc.name_ar,
    cm.default_image_url,
    br.id,
    br.name_ar,
    br.phone,
    br.location_ar,
    ap.user_id,
    ap.full_name
  FROM bookings b
  LEFT JOIN profiles p ON b.customer_id = p.user_id
  LEFT JOIN cars c ON b.car_id = c.id
  LEFT JOIN car_models cm ON c.model_id = cm.id
  LEFT JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN car_colors cc ON c.color_id = cc.id
  LEFT JOIN branches br ON b.branch_id = br.id
  LEFT JOIN profiles ap ON b.approved_by = ap.user_id
  WHERE b.id = p_booking_id
    AND (
      is_admin()
      OR b.branch_id = current_user_branch_id()
      OR b.customer_id = auth.uid()
    );
$$;

-- ========================================================================
-- 7. دوال التنظيف والجدولة
-- ========================================================================

-- تنظيف الحجوزات منتهية الصلاحية
CREATE OR REPLACE FUNCTION public.cleanup_expired_bookings()
RETURNS TABLE(cleaned_count integer, restored_cars text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  car_updates_count INTEGER := 0;
  updated_cars TEXT[] := ARRAY[]::TEXT[];
  booking_record RECORD;
BEGIN
  FOR booking_record IN 
    SELECT b.id, b.car_id, cb.name_ar as brand_name, cm.name_ar as model_name
    FROM public.bookings b
    JOIN public.cars c ON b.car_id = c.id
    JOIN public.car_models cm ON c.model_id = cm.id
    JOIN public.car_brands cb ON cm.brand_id = cb.id
    WHERE b.status = 'payment_pending'
      AND b.expires_at IS NOT NULL 
      AND b.expires_at < NOW()
  LOOP
    UPDATE public.bookings 
    SET 
      status = 'expired',
      updated_at = NOW()
    WHERE id = booking_record.id;
    
    car_updates_count := car_updates_count + 1;
    updated_cars := array_append(updated_cars, booking_record.brand_name || ' ' || booking_record.model_name);
    
    PERFORM log_security_event(
      'booking_expired',
      NULL,
      booking_record.id::TEXT,
      jsonb_build_object(
        'car_id', booking_record.car_id,
        'brand_model', booking_record.brand_name || ' ' || booking_record.model_name
      )
    );
  END LOOP;
  
  RETURN QUERY SELECT car_updates_count, updated_cars;
END;
$$;

-- إكمال الحجوزات النشطة المنتهية
CREATE OR REPLACE FUNCTION public.complete_active_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
  completed_count INTEGER := 0;
BEGIN
  FOR booking_record IN
    SELECT 
      id,
      customer_id,
      car_id,
      branch_id,
      end_date
    FROM bookings
    WHERE status = 'active'
      AND end_date < CURRENT_DATE
  LOOP
    UPDATE bookings
    SET 
      status = 'completed',
      updated_at = NOW()
    WHERE id = booking_record.id;

    PERFORM send_notification(
      booking_record.customer_id,
      'اكتمل الحجز',
      'Booking Completed',
      'تم إكمال حجزك بنجاح',
      'Your booking has been completed successfully',
      'booking_completed',
      jsonb_build_object('booking_id', booking_record.id)
    );

    completed_count := completed_count + 1;
  END LOOP;

  RETURN completed_count;
END;
$$;

-- دالة التحقق من عدم اتساق التوفر
CREATE OR REPLACE FUNCTION public.fix_availability_inconsistencies()
RETURNS table(car_id uuid, expected_availability integer, actual_availability integer, needs_attention boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  car_record RECORD;
  expected_avail integer;
BEGIN
  FOR car_record IN SELECT c.id, c.quantity, c.available_quantity FROM cars c WHERE c.status = 'available' LOOP
    expected_avail := public.get_actual_available_quantity(car_record.id);
    IF expected_avail != car_record.available_quantity THEN
      PERFORM log_availability_inconsistency(car_record.id, 'quantity_mismatch', jsonb_build_object('expected', expected_avail, 'actual', car_record.available_quantity, 'total_quantity', car_record.quantity, 'note', 'Use get_actual_available_quantity() for accurate availability'));
      RETURN QUERY SELECT car_record.id, expected_avail, car_record.available_quantity, true;
    ELSE
      RETURN QUERY SELECT car_record.id, expected_avail, car_record.available_quantity, false;
    END IF;
  END LOOP;
END;
$$;

-- دالة تنظيف الإشعارات القديمة
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = TRUE 
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- دالة التحقق من العروض المنتهية
CREATE OR REPLACE FUNCTION public.check_expired_offers()
RETURNS TABLE(
  car_id uuid,
  model_name text,
  branch_name text,
  discount_percentage int,
  expired_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    c.id,
    m.name_ar,
    b.name_ar,
    c.discount_percentage,
    c.offer_expires_at
  FROM cars c
  JOIN car_models m ON c.model_id = m.id
  JOIN branches b ON c.branch_id = b.id
  WHERE c.discount_percentage > 0
    AND c.offer_expires_at < NOW()
    AND c.status != 'hidden';
$$;

-- دالة تنظيف العروض المنتهية
CREATE OR REPLACE FUNCTION public.cleanup_expired_offers()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_affected_count int;
BEGIN
  UPDATE cars
  SET 
    discount_percentage = 0,
    offer_expires_at = NULL,
    updated_at = NOW()
  WHERE discount_percentage > 0
    AND offer_expires_at < NOW();
  
  GET DIAGNOSTICS v_affected_count = ROW_COUNT;
  
  RETURN v_affected_count;
END;
$$;

-- ========================================================================
-- 8. دوال حساب الأسعار
-- ========================================================================

-- دالة حساب السعر النهائي
CREATE OR REPLACE FUNCTION public.calculate_booking_price(
  p_car_id uuid,
  p_rental_type rental_type,
  p_start_date date,
  p_end_date date,
  p_discount_percentage numeric DEFAULT 0,
  p_discount_amount numeric DEFAULT 0
)
RETURNS TABLE(
  base_price numeric,
  car_discount_percentage int,
  car_discount_amount numeric,
  price_after_car_discount numeric,
  total_days int,
  subtotal numeric,
  booking_discount_amount numeric,
  final_amount numeric,
  total_savings numeric,
  total_savings_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_car cars%ROWTYPE;
  v_total_days int;
  v_base_price numeric;
  v_car_discount numeric := 0;
  v_price_after_car_discount numeric;
  v_subtotal numeric;
  v_booking_discount numeric := 0;
  v_final numeric;
  v_full_periods int;
  v_remaining_days int;
  v_apply_car_discount boolean := false;
  v_original_total numeric;
BEGIN
  SELECT * INTO v_car 
  FROM cars 
  WHERE id = p_car_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Car not found';
  END IF;

  IF NOT (p_rental_type = ANY(v_car.rental_types)) THEN
    RAISE EXCEPTION 'Rental type % not allowed for this car', p_rental_type;
  END IF;

  v_total_days := GREATEST(1, (p_end_date - p_start_date));

  CASE p_rental_type
    WHEN 'daily' THEN
      v_base_price := v_car.daily_price;
    WHEN 'weekly' THEN
      v_base_price := COALESCE(v_car.weekly_price, v_car.daily_price * 7);
    WHEN 'monthly' THEN
      v_base_price := COALESCE(v_car.monthly_price, v_car.daily_price * 30);
    WHEN 'ownership' THEN
      IF v_car.ownership_price IS NULL THEN
        RAISE EXCEPTION 'Ownership price not available';
      END IF;
      v_base_price := v_car.ownership_price;
  END CASE;

  IF p_rental_type != 'ownership' 
     AND v_car.discount_percentage > 0 
     AND (v_car.offer_expires_at IS NULL OR v_car.offer_expires_at >= NOW()) THEN
    v_apply_car_discount := true;
    v_car_discount := v_base_price * v_car.discount_percentage / 100;
    v_price_after_car_discount := v_base_price - v_car_discount;
  ELSE
    v_apply_car_discount := false;
    v_price_after_car_discount := v_base_price;
    v_car_discount := 0;
  END IF;

  CASE p_rental_type
    WHEN 'daily' THEN
      v_subtotal := v_price_after_car_discount * v_total_days;
      v_original_total := v_base_price * v_total_days;
      
    WHEN 'weekly' THEN
      IF v_total_days <= 7 THEN
        v_subtotal := v_price_after_car_discount;
        v_original_total := v_base_price;
      ELSE
        v_full_periods := FLOOR(v_total_days / 7);
        v_remaining_days := v_total_days % 7;
        v_subtotal := v_price_after_car_discount * v_full_periods;
        v_original_total := v_base_price * v_full_periods;
        
        IF v_remaining_days > 0 THEN
          IF v_remaining_days <= 3 THEN
            v_subtotal := v_subtotal + (v_car.daily_price * v_remaining_days);
            v_original_total := v_original_total + (v_car.daily_price * v_remaining_days);
          ELSE
            v_subtotal := v_subtotal + v_price_after_car_discount;
            v_original_total := v_original_total + v_base_price;
          END IF;
        END IF;
      END IF;
      
    WHEN 'monthly' THEN
      IF v_total_days <= 31 THEN
        v_subtotal := v_price_after_car_discount;
        v_original_total := v_base_price;
      ELSE
        v_full_periods := FLOOR(v_total_days / 30);
        v_remaining_days := v_total_days % 30;
        v_subtotal := v_price_after_car_discount * v_full_periods;
        v_original_total := v_base_price * v_full_periods;
        
        IF v_remaining_days > 0 THEN
          IF v_remaining_days <= 15 THEN
            v_subtotal := v_subtotal + (v_car.daily_price * v_remaining_days);
            v_original_total := v_original_total + (v_car.daily_price * v_remaining_days);
          ELSE
            v_subtotal := v_subtotal + v_price_after_car_discount;
            v_original_total := v_original_total + v_base_price;
          END IF;
        END IF;
      END IF;
      
    WHEN 'ownership' THEN
      v_subtotal := v_price_after_car_discount;
      v_original_total := v_base_price;
  END CASE;

  v_booking_discount := (v_subtotal * p_discount_percentage / 100) 
                        + COALESCE(p_discount_amount, 0);
  
  IF v_booking_discount > (v_subtotal * 0.5) THEN
    v_booking_discount := v_subtotal * 0.5;
  END IF;

  v_final := GREATEST(0, v_subtotal - v_booking_discount);

  RETURN QUERY SELECT
    v_base_price,
    v_car.discount_percentage::int,
    v_car_discount,
    v_price_after_car_discount,
    v_total_days,
    v_subtotal,
    v_booking_discount,
    v_final,
    v_original_total - v_final AS total_savings,
    CASE 
      WHEN v_original_total > 0 
      THEN ROUND((v_original_total - v_final) / v_original_total * 100, 2)
      ELSE 0
    END AS total_savings_percentage;
END;
$$;

-- ========================================================================
-- 9. دوال المميزات (car_features)
-- ========================================================================

-- دالة تعيين مميزات متعددة لسيارة
CREATE OR REPLACE FUNCTION public.set_car_features(
  p_car_id UUID,
  p_feature_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT (is_admin() OR (
    is_branch_manager() AND EXISTS (
      SELECT 1 FROM cars 
      WHERE id = p_car_id AND branch_id = current_user_branch_id()
    )
  )) THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  DELETE FROM car_feature_assignments WHERE car_id = p_car_id;

  IF p_feature_ids IS NOT NULL AND array_length(p_feature_ids, 1) > 0 THEN
    INSERT INTO car_feature_assignments (car_id, feature_id)
    SELECT p_car_id, unnest(p_feature_ids)
    ON CONFLICT (car_id, feature_id) DO NOTHING;
  END IF;
END;
$$;

-- دالة الحصول على مميزات سيارة
CREATE OR REPLACE FUNCTION public.get_car_features(p_car_id UUID)
RETURNS TABLE(
  feature_id UUID,
  name_ar TEXT,
  name_en TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    cf.id,
    cf.name_ar,
    cf.name_en
  FROM car_feature_assignments cfa
  JOIN car_features cf ON cfa.feature_id = cf.id
  WHERE cfa.car_id = p_car_id
    AND cf.is_active = true
  ORDER BY cf.name_ar;
$$;

-- دالة إضافة ميزة لسيارة
CREATE OR REPLACE FUNCTION public.add_feature_to_car(
  p_car_id UUID,
  p_feature_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT (is_admin() OR (
    is_branch_manager() AND EXISTS (
      SELECT 1 FROM cars 
      WHERE id = p_car_id AND branch_id = current_user_branch_id()
    )
  )) THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  INSERT INTO car_feature_assignments (car_id, feature_id)
  VALUES (p_car_id, p_feature_id)
  ON CONFLICT (car_id, feature_id) DO NOTHING;
END;
$$;

-- دالة حذف ميزة من سيارة
CREATE OR REPLACE FUNCTION public.remove_feature_from_car(
  p_car_id UUID,
  p_feature_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT (is_admin() OR (
    is_branch_manager() AND EXISTS (
      SELECT 1 FROM cars 
      WHERE id = p_car_id AND branch_id = current_user_branch_id()
    )
  )) THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  DELETE FROM car_feature_assignments
  WHERE car_id = p_car_id AND feature_id = p_feature_id;
END;
$$;

-- ========================================================================
-- 10. دوال المستندات (Documents)
-- ========================================================================

-- دالة قبول المستند
CREATE OR REPLACE FUNCTION public.approve_document(
  p_document_id UUID
)
RETURNS documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_document documents%ROWTYPE;
  v_role user_role;
BEGIN
  v_role := get_user_role(auth.uid());
  
  IF v_role NOT IN ('admin', 'branch', 'branch_employee') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;
  
  UPDATE documents
  SET 
    status = 'approved',
    verified_by = auth.uid(),
    verified_at = NOW(),
    rejection_reason = NULL,
    updated_at = NOW()
  WHERE id = p_document_id
    AND (
      is_admin()
      OR (
        is_branch_manager() 
        AND user_id IN (
          SELECT user_id FROM profiles 
          WHERE branch_id = current_user_branch_id()
        )
      )
    )
  RETURNING * INTO v_document;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;
  
  PERFORM send_notification(
    v_document.user_id,
    'تم قبول المستند',
    'Document Approved',
    'تم قبول مستندك بنجاح',
    'Your document has been approved successfully',
    'document_update',
    jsonb_build_object('document_id', v_document.id, 'document_type', v_document.document_type)
  );
  
  RETURN v_document;
END;
$$;

-- دالة رفض المستند
CREATE OR REPLACE FUNCTION public.reject_document(
  p_document_id UUID,
  p_reason TEXT
)
RETURNS documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_document documents%ROWTYPE;
  v_role user_role;
BEGIN
  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'Rejection reason is required';
  END IF;
  
  v_role := get_user_role(auth.uid());
  
  IF v_role NOT IN ('admin', 'branch', 'branch_employee') THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;
  
  UPDATE documents
  SET 
    status = 'rejected',
    verified_by = auth.uid(),
    verified_at = NOW(),
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_document_id
    AND (
      is_admin()
      OR (
        is_branch_manager() 
        AND user_id IN (
          SELECT user_id FROM profiles 
          WHERE branch_id = current_user_branch_id()
        )
      )
    )
  RETURNING * INTO v_document;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;
  
  PERFORM send_notification(
    v_document.user_id,
    'تم رفض المستند',
    'Document Rejected',
    'تم رفض مستندك: ' || p_reason,
    'Your document has been rejected: ' || p_reason,
    'document_update',
    jsonb_build_object('document_id', v_document.id, 'document_type', v_document.document_type, 'reason', p_reason)
  );
  
  RETURN v_document;
END;
$$;

-- دالة جلب المستندات قيد المراجعة
CREATE OR REPLACE FUNCTION public.get_pending_documents(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  document_id UUID,
  document_type TEXT,
  document_url TEXT,
  document_status document_status,
  created_at TIMESTAMPTZ,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_records BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_records
  FROM documents d
  JOIN profiles p ON d.user_id = p.user_id
  WHERE d.status = 'pending'
    AND (
      is_admin()
      OR (
        is_branch_manager()
        AND p.branch_id = current_user_branch_id()
      )
    );
  
  RETURN QUERY
  SELECT 
    d.id,
    d.document_type,
    d.document_url,
    d.status,
    d.created_at,
    p.user_id,
    p.full_name,
    p.email,
    p.phone,
    total_records
  FROM documents d
  JOIN profiles p ON d.user_id = p.user_id
  WHERE d.status = 'pending'
    AND (
      is_admin()
      OR (
        is_branch_manager()
        AND p.branch_id = current_user_branch_id()
      )
    )
  ORDER BY d.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- دالة جلب المستندات حسب الحالة
CREATE OR REPLACE FUNCTION public.get_documents_by_status(
  p_status document_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  document_id UUID,
  document_type TEXT,
  document_url TEXT,
  document_status document_status,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  verified_by_name TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_records BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_records
  FROM documents d
  JOIN profiles p ON d.user_id = p.user_id
  WHERE (p_status IS NULL OR d.status = p_status)
    AND (
      is_admin()
      OR (
        is_branch_manager()
        AND p.branch_id = current_user_branch_id()
      )
    );
  
  RETURN QUERY
  SELECT 
    d.id,
    d.document_type,
    d.document_url,
    d.status,
    d.rejection_reason,
    d.created_at,
    d.verified_at,
    p.user_id,
    p.full_name,
    p.email,
    p.phone,
    vp.full_name,
    total_records
  FROM documents d
  JOIN profiles p ON d.user_id = p.user_id
  LEFT JOIN profiles vp ON d.verified_by = vp.user_id
  WHERE (p_status IS NULL OR d.status = p_status)
    AND (
      is_admin()
      OR (
        is_branch_manager()
        AND p.branch_id = current_user_branch_id()
      )
    )
  ORDER BY 
    CASE 
      WHEN d.status = 'pending' THEN 1
      WHEN d.status = 'approved' THEN 2
      ELSE 3
    END,
    d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- دالة لجلب مستندات العميل
CREATE OR REPLACE FUNCTION public.get_customer_documents(p_customer_id UUID)
RETURNS TABLE(
  document_id UUID,
  document_type TEXT,
  document_url TEXT,
  document_status document_status,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by_name TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    d.id,
    d.document_type,
    d.document_url,
    d.status,
    d.rejection_reason,
    d.created_at,
    d.verified_at,
    vp.full_name
  FROM documents d
  LEFT JOIN profiles vp ON d.verified_by = vp.user_id
  WHERE d.user_id = p_customer_id
    AND (
      is_admin()
      OR d.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.customer_id = p_customer_id
          AND b.branch_id = current_user_branch_id()
      )
    )
  ORDER BY d.created_at DESC;
$$;

-- ========================================================================
-- 11. دوال الإعلانات (Announcements)
-- ========================================================================

-- دالة جلب الإعلانات النشطة
CREATE OR REPLACE FUNCTION public.get_active_announcements(
  p_branch_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  announcement_id UUID,
  title_ar TEXT,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  is_featured BOOLEAN,
  priority announcement_priority,
  branch_id UUID,
  branch_name_ar TEXT,
  created_by_name TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_records BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_records
  FROM announcements a
  WHERE a.is_active = true
    AND (a.expires_at IS NULL OR a.expires_at > NOW())
    AND (p_branch_id IS NULL OR a.branch_id = p_branch_id OR a.branch_id IS NULL);
  
  RETURN QUERY
  SELECT 
    a.id,
    a.title_ar,
    a.title_en,
    a.description_ar,
    a.description_en,
    a.image_url,
    a.is_featured,
    a.priority,
    a.branch_id,
    b.name_ar,
    p.full_name,
    a.expires_at,
    a.created_at,
    total_records
  FROM announcements a
  LEFT JOIN branches b ON a.branch_id = b.id
  LEFT JOIN profiles p ON a.created_by = p.user_id
  WHERE a.is_active = true
    AND (a.expires_at IS NULL OR a.expires_at > NOW())
    AND (p_branch_id IS NULL OR a.branch_id = p_branch_id OR a.branch_id IS NULL)
  ORDER BY 
    CASE a.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      ELSE 4
    END,
    a.is_featured DESC,
    a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- دالة تبديل حالة الإعلان
CREATE OR REPLACE FUNCTION public.toggle_announcement_status(
  p_announcement_id UUID
)
RETURNS announcements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_announcement announcements%ROWTYPE;
BEGIN
  UPDATE announcements
  SET 
    is_active = NOT is_active,
    updated_at = NOW()
  WHERE id = p_announcement_id
    AND (
      is_admin()
      OR (
        is_branch_manager() 
        AND (branch_id IS NULL OR branch_id = current_user_branch_id())
      )
    )
  RETURNING * INTO v_announcement;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Announcement not found or access denied';
  END IF;
  
  RETURN v_announcement;
END;
$$;

-- ========================================================================
-- 12. دوال Rate Limiting (المُحدّثة)
-- ========================================================================

-- دالة Rate Limiting الصحيحة
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_attempt_count INTEGER;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND attempted_at >= v_window_start;
  
  INSERT INTO rate_limits (
    identifier,
    action_type,
    attempted_at
  ) VALUES (
    p_identifier,
    p_action_type,
    NOW()
  );
  
  RETURN v_attempt_count < p_max_attempts;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Rate limit check failed: %', SQLERRM;
  RETURN TRUE;
END;
$$;

-- دالة لحذف المحاولات القديمة
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- دالة اختبار Rate Limiting
CREATE OR REPLACE FUNCTION public.test_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT
)
RETURNS TABLE(
  attempt_number INTEGER,
  is_allowed BOOLEAN,
  remaining_attempts INTEGER,
  total_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_max INTEGER := 5;
BEGIN
  v_window_start := NOW() - INTERVAL '15 minutes';
  
  SELECT COUNT(*)
  INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND attempted_at >= v_window_start;
  
  RETURN QUERY
  SELECT 
    (v_count + 1)::INTEGER as attempt_number,
    (v_count < v_max)::BOOLEAN as is_allowed,
    GREATEST(0, v_max - v_count - 1)::INTEGER as remaining_attempts,
    v_count::INTEGER as total_attempts;
END;
$$;

-- دالة لإعادة تعيين Rate Limit
CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reset rate limits';
  END IF;
  
  IF p_action_type IS NULL THEN
    DELETE FROM rate_limits
    WHERE identifier = p_identifier;
  ELSE
    DELETE FROM rate_limits
    WHERE identifier = p_identifier
      AND action_type = p_action_type;
  END IF;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- دالة تسجيل محاولات تسجيل الدخول
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_user_id UUID,
  p_action TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO auth_logs (user_id, action, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_ip_address, p_user_agent);
END;
$$;

-- ========================================================================
-- 13. دوال البحث المتقدمة
-- ========================================================================

-- دالة البحث في السيارات
CREATE OR REPLACE FUNCTION public.search_cars(
  p_search_query TEXT DEFAULT NULL,
  p_brand_id UUID DEFAULT NULL,
  p_model_id UUID DEFAULT NULL,
  p_branch_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_transmission TEXT DEFAULT NULL,
  p_fuel_type TEXT DEFAULT NULL,
  p_rental_type TEXT DEFAULT 'daily',
  p_sort_by TEXT DEFAULT 'relevance',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  model_name_en TEXT,
  model_name_ar TEXT,
  brand_name_en TEXT,
  brand_name_ar TEXT,
  branch_name_en TEXT,
  branch_name_ar TEXT,
  color_name_en TEXT,
  color_name_ar TEXT,
  daily_price NUMERIC,
  weekly_price NUMERIC,
  monthly_price NUMERIC,
  status TEXT,
  transmission TEXT,
  fuel_type TEXT,
  seats INT,
  available_quantity INT,
  features_ar TEXT[],
  features_en TEXT[],
  relevance_score INT,
  total_results BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(DISTINCT c.id) INTO total_count
  FROM cars c
  JOIN car_models m ON c.model_id = m.id
  JOIN car_brands b ON m.brand_id = b.id
  JOIN branches br ON c.branch_id = br.id
  LEFT JOIN car_colors cc ON c.color_id = cc.id
  WHERE 
    (p_search_query IS NULL OR 
     m.name_ar ILIKE '%' || p_search_query || '%' OR 
     m.name_en ILIKE '%' || p_search_query || '%' OR
     b.name_ar ILIKE '%' || p_search_query || '%' OR
     b.name_en ILIKE '%' || p_search_query || '%')
    AND (p_brand_id IS NULL OR m.brand_id = p_brand_id)
    AND (p_model_id IS NULL OR c.model_id = p_model_id)
    AND (p_branch_id IS NULL OR c.branch_id = p_branch_id)
    AND (p_min_price IS NULL OR c.daily_price >= p_min_price)
    AND (p_max_price IS NULL OR c.daily_price <= p_max_price)
    AND (p_transmission IS NULL OR c.transmission = p_transmission)
    AND (p_fuel_type IS NULL OR c.fuel_type = p_fuel_type)
    AND c.status = 'available'
    AND c.available_quantity > 0;

  RETURN QUERY
  SELECT 
    c.id,
    m.name_en as model_name_en,
    m.name_ar as model_name_ar,
    b.name_en as brand_name_en,
    b.name_ar as brand_name_ar,
    br.name_en as branch_name_en,
    br.name_ar as branch_name_ar,
    cc.name_en as color_name_en,
    cc.name_ar as color_name_ar,
    c.daily_price,
    c.weekly_price,
    c.monthly_price,
    c.status::TEXT,
    c.transmission,
    c.fuel_type,
    c.seats,
    c.available_quantity,
    COALESCE(
      (SELECT array_agg(cf.name_ar ORDER BY cf.name_ar)
       FROM car_feature_assignments cfa 
       JOIN car_features cf ON cfa.feature_id = cf.id 
       WHERE cfa.car_id = c.id AND cf.is_active = true),
      '{}'::TEXT[]
    ) as features_ar,
    COALESCE(
      (SELECT array_agg(cf.name_en ORDER BY cf.name_en)
       FROM car_feature_assignments cfa 
       JOIN car_features cf ON cfa.feature_id = cf.id 
       WHERE cfa.car_id = c.id AND cf.is_active = true),
      '{}'::TEXT[]
    ) as features_en,
    CASE 
      WHEN m.name_ar ILIKE p_search_query || '%' OR m.name_en ILIKE p_search_query || '%' THEN 100
      WHEN b.name_ar ILIKE p_search_query || '%' OR b.name_en ILIKE p_search_query || '%' THEN 90
      WHEN m.name_ar ILIKE '%' || p_search_query || '%' OR m.name_en ILIKE '%' || p_search_query || '%' THEN 80
      ELSE 70
    END as relevance_score,
    total_count as total_results
  FROM cars c
  JOIN car_models m ON c.model_id = m.id
  JOIN car_brands b ON m.brand_id = b.id
  JOIN branches br ON c.branch_id = br.id
  LEFT JOIN car_colors cc ON c.color_id = cc.id
  WHERE 
    (p_search_query IS NULL OR 
     m.name_ar ILIKE '%' || p_search_query || '%' OR 
     m.name_en ILIKE '%' || p_search_query || '%' OR
     b.name_ar ILIKE '%' || p_search_query || '%' OR
     b.name_en ILIKE '%' || p_search_query || '%')
    AND (p_brand_id IS NULL OR m.brand_id = p_brand_id)
    AND (p_model_id IS NULL OR c.model_id = p_model_id)
    AND (p_branch_id IS NULL OR c.branch_id = p_branch_id)
    AND (p_min_price IS NULL OR c.daily_price >= p_min_price)
    AND (p_max_price IS NULL OR c.daily_price <= p_max_price)
    AND (p_transmission IS NULL OR c.transmission = p_transmission)
    AND (p_fuel_type IS NULL OR c.fuel_type = p_fuel_type)
    AND c.status = 'available'
    AND c.available_quantity > 0
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'price_asc' THEN c.daily_price
      WHEN p_sort_by = 'price_desc' THEN -c.daily_price
      WHEN p_sort_by = 'relevance' THEN -(CASE 
        WHEN m.name_ar ILIKE p_search_query || '%' OR m.name_en ILIKE p_search_query || '%' THEN 100
        WHEN b.name_ar ILIKE p_search_query || '%' OR b.name_en ILIKE p_search_query || '%' THEN 90
        WHEN m.name_ar ILIKE '%' || p_search_query || '%' OR m.name_en ILIKE '%' || p_search_query || '%' THEN 80
        ELSE 70
      END)
      ELSE -(CASE 
        WHEN m.name_ar ILIKE p_search_query || '%' OR m.name_en ILIKE p_search_query || '%' THEN 100
        WHEN b.name_ar ILIKE p_search_query || '%' OR b.name_en ILIKE p_search_query || '%' THEN 90
        WHEN m.name_ar ILIKE '%' || p_search_query || '%' OR m.name_en ILIKE '%' || p_search_query || '%' THEN 80
        ELSE 70
      END)
    END
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- دالة الحصول على أقرب السيارات
CREATE OR REPLACE FUNCTION public.get_nearest_cars(
  _user_lat DECIMAL, 
  _user_lon DECIMAL, 
  _limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  car_id UUID, 
  car_model TEXT, 
  car_brand TEXT, 
  car_color TEXT, 
  daily_price DECIMAL, 
  branch_name TEXT, 
  branch_location TEXT, 
  distance_meters DECIMAL, 
  distance_km DECIMAL, 
  main_image_url TEXT, 
  seats INTEGER, 
  fuel_type TEXT, 
  transmission TEXT, 
  is_new BOOLEAN, 
  discount_percentage INTEGER, 
  actual_available_quantity INTEGER
)
LANGUAGE SQL 
STABLE 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
  SELECT 
    c.id, 
    cm.name_en, 
    cb.name_en, 
    cc.name_en, 
    c.daily_price, 
    b.name_en, 
    b.location_en,
    ROUND(ST_Distance(b.geom, ST_SetSRID(ST_MakePoint(_user_lon, _user_lat), 4326))::DECIMAL, 0),
    ROUND((ST_Distance(b.geom, ST_SetSRID(ST_MakePoint(_user_lon, _user_lat), 4326)) / 1000)::DECIMAL, 2),
    cm.default_image_url, 
    c.seats, 
    c.fuel_type, 
    c.transmission, 
    c.is_new, 
    c.discount_percentage, 
    public.get_actual_available_quantity(c.id)
  FROM public.cars c
  JOIN public.branches b ON c.branch_id = b.id
  JOIN public.car_models cm ON c.model_id = cm.id
  JOIN public.car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN public.car_colors cc ON c.color_id = cc.id
  WHERE c.status = 'available' 
    AND public.get_actual_available_quantity(c.id) > 0 
    AND b.is_active = TRUE 
    AND b.geom IS NOT NULL
  ORDER BY b.geom <-> ST_SetSRID(ST_MakePoint(_user_lon, _user_lat), 4326)
  LIMIT _limit;
$$;

-- ========================================================================
-- 14. دوال مساعدة للفروع
-- ========================================================================

-- دالة إحصائيات الفرع
CREATE OR REPLACE FUNCTION public.get_branch_statistics(_branch_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  is_active BOOLEAN,
  manager_id UUID,
  manager_name TEXT,
  employees_count INTEGER,
  cars_count INTEGER,
  active_bookings_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    b.id,
    b.name_en as name,
    b.location_en as location,
    b.is_active,
    b.manager_id,
    p_manager.full_name as manager_name,
    (SELECT COUNT(*)::INTEGER FROM profiles p JOIN user_roles ur ON p.user_id = ur.user_id 
     WHERE p.branch_id = b.id AND ur.role IN ('branch', 'branch_employee')) as employees_count,
    (SELECT COUNT(*)::INTEGER FROM cars WHERE branch_id = b.id AND status != 'hidden') as cars_count,
    (SELECT COUNT(*)::INTEGER FROM bookings WHERE branch_id = b.id 
     AND status IN ('pending', 'confirmed', 'payment_pending', 'active')) as active_bookings_count,
    b.created_at,
    b.updated_at
  FROM public.branches b
  LEFT JOIN public.profiles p_manager ON b.manager_id = p_manager.user_id
  WHERE b.id = _branch_id
    AND (
      public.has_role(auth.uid(), 'admin')
      OR b.manager_id = auth.uid()
      OR b.is_active = true
    );
$$;

-- دالة الحصول على السيارات الأكثر حجزاً
CREATE OR REPLACE FUNCTION public.get_most_booked_cars(
  p_branch_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  car_id UUID,
  brand_name TEXT,
  model_name TEXT,
  booking_count BIGINT,
  total_revenue NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    cb.name_en,
    cm.name_en,
    COUNT(b.id),
    COALESCE(SUM(b.final_amount), 0)
  FROM cars c
  JOIN car_models cm ON c.model_id = cm.id
  JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN bookings b ON c.id = b.car_id AND b.status IN ('completed', 'active')
  WHERE (p_branch_id IS NULL OR c.branch_id = p_branch_id)
  GROUP BY c.id, cb.name_en, cm.name_en
  ORDER BY COUNT(b.id) DESC
  LIMIT p_limit;
END;
$$;

-- ========================================================================
-- 15. دالة التحقق من صحة النظام
-- ========================================================================

CREATE OR REPLACE FUNCTION public.verify_system_health()
RETURNS TABLE(component TEXT, status TEXT, details TEXT)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 'User Roles System'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM user_roles LIMIT 1) THEN 'OK' ELSE 'WARNING' END::TEXT,
    (SELECT COUNT(*)::TEXT || ' roles configured' FROM user_roles)::TEXT
  
  UNION ALL
  SELECT 'Dynamic Availability'::TEXT, 'OK'::TEXT, 'Using get_actual_available_quantity()'::TEXT
  
  UNION ALL
  SELECT 'Critical Functions'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('get_user_role', 'handle_new_user', 'search_cars') GROUP BY proname HAVING COUNT(*) >= 1) 
      THEN 'OK' ELSE 'ERROR' END::TEXT,
    'All critical functions present'::TEXT
  
  UNION ALL
  SELECT 'Rate Limiting'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_rate_limit') 
      THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Rate limiting function available'::TEXT
  
  UNION ALL
  SELECT 'pg_cron Jobs'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM cron.job LIMIT 1) 
      THEN 'OK' ELSE 'WARNING' END::TEXT,
    (SELECT COUNT(*)::TEXT || ' jobs scheduled' FROM cron.job)::TEXT;
END;
$$;

-- ========================================================================
-- 16. دوال الجغرافيا
-- ========================================================================

-- تحديث البيانات الجغرافية للفروع
CREATE OR REPLACE FUNCTION public.update_branch_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- تحديث البيانات الجغرافية للمستخدمين
CREATE OR REPLACE FUNCTION public.update_profile_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_latitude IS NOT NULL AND NEW.user_longitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.user_longitude, NEW.user_latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- ========================================================================
-- 17. إنشاء Triggers
-- ========================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- تحديث updated_at تلقائياً
DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cars_updated_at ON public.cars;
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_car_offers_updated_at ON public.car_offers;
CREATE TRIGGER update_car_offers_updated_at BEFORE UPDATE ON public.car_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- تحديث البيانات الجغرافية
DROP TRIGGER IF EXISTS update_branch_geom_trigger ON public.branches;
CREATE TRIGGER update_branch_geom_trigger BEFORE INSERT OR UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_branch_geom();

DROP TRIGGER IF EXISTS update_profile_geom_trigger ON public.profiles;
CREATE TRIGGER update_profile_geom_trigger BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_profile_geom();

-- ========================================================================
-- 18. سياسات RLS (Row Level Security)
-- ========================================================================

-- سياسات user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
CREATE POLICY "Only admins can assign roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- سياسات profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can view their branch employees" ON public.profiles;
CREATE POLICY "Branch managers can view their branch employees" ON public.profiles FOR SELECT USING (
  is_branch_manager() AND branch_id = current_user_branch_id()
);

-- سياسات documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
CREATE POLICY "Admins can view all documents" ON public.documents FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can view branch documents" ON public.documents;
CREATE POLICY "Branch managers can view branch documents" ON public.documents FOR SELECT USING (
  is_branch_manager() AND user_id IN (
    SELECT user_id FROM profiles WHERE branch_id = current_user_branch_id()
  )
);

-- سياسات branches
DROP POLICY IF EXISTS "Everyone can view active branches" ON public.branches;
CREATE POLICY "Everyone can view active branches" ON public.branches FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can view own branch" ON public.branches;
CREATE POLICY "Branch managers can view own branch" ON public.branches FOR SELECT USING (
  is_branch_manager() AND id = current_user_branch_id()
);

DROP POLICY IF EXISTS "Branch managers can update own branch" ON public.branches;
CREATE POLICY "Branch managers can update own branch" ON public.branches FOR UPDATE USING (
  is_branch_manager() AND id = current_user_branch_id()
);

-- سياسات car_brands
DROP POLICY IF EXISTS "Everyone can view active brands" ON public.car_brands;
CREATE POLICY "Everyone can view active brands" ON public.car_brands FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage brands" ON public.car_brands;
CREATE POLICY "Admins can manage brands" ON public.car_brands FOR ALL USING (is_admin());

-- سياسات car_models
DROP POLICY IF EXISTS "Everyone can view active models" ON public.car_models;
CREATE POLICY "Everyone can view active models" ON public.car_models FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage models" ON public.car_models;
CREATE POLICY "Admins can manage models" ON public.car_models FOR ALL USING (is_admin());

-- سياسات car_colors
DROP POLICY IF EXISTS "Everyone can view active colors" ON public.car_colors;
CREATE POLICY "Everyone can view active colors" ON public.car_colors FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage colors" ON public.car_colors;
CREATE POLICY "Admins can manage colors" ON public.car_colors FOR ALL USING (is_admin());

-- سياسات car_features
DROP POLICY IF EXISTS "Everyone can view active features" ON public.car_features;
CREATE POLICY "Everyone can view active features" ON public.car_features FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage features" ON public.car_features;
CREATE POLICY "Admins can manage features" ON public.car_features FOR ALL USING (is_admin());

-- سياسات car_feature_assignments
DROP POLICY IF EXISTS "Everyone can view car features" ON public.car_feature_assignments;
CREATE POLICY "Everyone can view car features" ON public.car_feature_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage car features" ON public.car_feature_assignments;
CREATE POLICY "Admins can manage car features" ON public.car_feature_assignments FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can manage branch car features" ON public.car_feature_assignments;
CREATE POLICY "Branch managers can manage branch car features" ON public.car_feature_assignments FOR ALL USING (
  is_branch_manager() AND EXISTS (
    SELECT 1 FROM cars 
    WHERE cars.id = car_feature_assignments.car_id 
      AND cars.branch_id = current_user_branch_id()
  )
);

-- سياسات cars
DROP POLICY IF EXISTS "Everyone can view available cars" ON public.cars;
CREATE POLICY "Everyone can view available cars" ON public.cars FOR SELECT USING (status = 'available');

DROP POLICY IF EXISTS "Admins can manage all cars" ON public.cars;
CREATE POLICY "Admins can manage all cars" ON public.cars FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can manage own branch cars" ON public.cars;
CREATE POLICY "Branch managers can manage own branch cars" ON public.cars FOR ALL USING (
  is_branch_manager() AND branch_id = current_user_branch_id()
);

-- سياسات bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can view branch bookings" ON public.bookings;
CREATE POLICY "Branch managers can view branch bookings" ON public.bookings FOR SELECT USING (
  is_branch_manager() AND branch_id = current_user_branch_id()
);

DROP POLICY IF EXISTS "Branch managers can update branch bookings" ON public.bookings;
CREATE POLICY "Branch managers can update branch bookings" ON public.bookings FOR UPDATE USING (
  is_branch_manager() AND branch_id = current_user_branch_id()
);

-- سياسات announcements
DROP POLICY IF EXISTS "Everyone can view active announcements" ON public.announcements;
CREATE POLICY "Everyone can view active announcements" ON public.announcements FOR SELECT USING (
  is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())
);

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can manage own branch announcements" ON public.announcements;
CREATE POLICY "Branch managers can manage own branch announcements" ON public.announcements FOR ALL USING (
  is_branch_manager() AND (branch_id IS NULL OR branch_id = current_user_branch_id())
);

-- سياسات notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and branch managers can send notifications" ON public.notifications;
CREATE POLICY "Admins and branch managers can send notifications" ON public.notifications FOR INSERT WITH CHECK (
  is_admin() OR is_branch_manager()
);

-- سياسات car_offers
DROP POLICY IF EXISTS "Everyone can view active offers" ON public.car_offers;
CREATE POLICY "Everyone can view active offers" ON public.car_offers FOR SELECT USING (
  is_active = TRUE AND valid_from <= NOW() AND valid_until >= NOW()
);

DROP POLICY IF EXISTS "Admins can manage all offers" ON public.car_offers;
CREATE POLICY "Admins can manage all offers" ON public.car_offers FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Branch managers can manage own branch offers" ON public.car_offers;
CREATE POLICY "Branch managers can manage own branch offers" ON public.car_offers FOR ALL USING (
  is_branch_manager() AND branch_id = current_user_branch_id()
);

-- سياسات rate_limits
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits FOR ALL USING (true);

-- سياسات security_audit_log
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view audit logs" ON public.security_audit_log FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log FOR INSERT WITH CHECK (true);

-- سياسات notification_outbox
DROP POLICY IF EXISTS "Service role can manage notification outbox" ON public.notification_outbox;
CREATE POLICY "Service role can manage notification outbox" ON public.notification_outbox FOR ALL USING (true);

-- سياسات audit_log
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Admins can view audit log" ON public.audit_log FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Service role can insert audit log" ON public.audit_log;
CREATE POLICY "Service role can insert audit log" ON public.audit_log FOR INSERT WITH CHECK (true);

-- سياسات otp_requests
DROP POLICY IF EXISTS "Users can view own otp requests" ON public.otp_requests;
CREATE POLICY "Users can view own otp requests" ON public.otp_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own otp requests" ON public.otp_requests;
CREATE POLICY "Users can insert own otp requests" ON public.otp_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage otp requests" ON public.otp_requests;
CREATE POLICY "Service role can manage otp requests" ON public.otp_requests FOR ALL USING (true);

-- سياسات phone_verifications
DROP POLICY IF EXISTS "Service role can manage phone verifications" ON public.phone_verifications;
CREATE POLICY "Service role can manage phone verifications" ON public.phone_verifications FOR ALL USING (true);

-- سياسات auth_logs
DROP POLICY IF EXISTS "Users can view own auth logs" ON public.auth_logs;
CREATE POLICY "Users can view own auth logs" ON public.auth_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all auth logs" ON public.auth_logs;
CREATE POLICY "Admins can view all auth logs" ON public.auth_logs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Service role can insert auth logs" ON public.auth_logs;
CREATE POLICY "Service role can insert auth logs" ON public.auth_logs FOR INSERT WITH CHECK (true);

-- ========================================================================
-- 19. إنشاء الفهارس (Indexes) لتحسين الأداء
-- ========================================================================

-- فهارس user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON public.user_roles(user_id, role);

-- فهارس profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_id ON public.profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_profiles_geom ON public.profiles USING GIST(geom);

-- فهارس documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);

-- فهارس branches
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON public.branches(is_active);
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON public.branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_branches_geom ON public.branches USING GIST(geom);

-- فهارس car_brands
CREATE INDEX IF NOT EXISTS idx_car_brands_is_active ON public.car_brands(is_active);
CREATE INDEX IF NOT EXISTS idx_car_brands_name_en ON public.car_brands(name_en);
CREATE INDEX IF NOT EXISTS idx_car_brands_name_ar ON public.car_brands(name_ar);

-- فهارس car_models
CREATE INDEX IF NOT EXISTS idx_car_models_brand_id ON public.car_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_car_models_is_active ON public.car_models(is_active);
CREATE INDEX IF NOT EXISTS idx_car_models_year ON public.car_models(year);
CREATE INDEX IF NOT EXISTS idx_car_models_name_en ON public.car_models(name_en);
CREATE INDEX IF NOT EXISTS idx_car_models_name_ar ON public.car_models(name_ar);

-- فهارس car_colors
CREATE INDEX IF NOT EXISTS idx_car_colors_is_active ON public.car_colors(is_active);

-- فهارس car_features
CREATE INDEX IF NOT EXISTS idx_car_features_is_active ON public.car_features(is_active);
CREATE INDEX IF NOT EXISTS idx_car_features_name_ar ON public.car_features(name_ar);

-- فهارس car_feature_assignments
CREATE INDEX IF NOT EXISTS idx_car_feature_assignments_car_id ON public.car_feature_assignments(car_id);
CREATE INDEX IF NOT EXISTS idx_car_feature_assignments_feature_id ON public.car_feature_assignments(feature_id);

-- فهارس cars
CREATE INDEX IF NOT EXISTS idx_cars_branch_id ON public.cars(branch_id);
CREATE INDEX IF NOT EXISTS idx_cars_model_id ON public.cars(model_id);
CREATE INDEX IF NOT EXISTS idx_cars_color_id ON public.cars(color_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON public.cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_daily_price ON public.cars(daily_price);
CREATE INDEX IF NOT EXISTS idx_cars_is_new ON public.cars(is_new);
CREATE INDEX IF NOT EXISTS idx_cars_discount_percentage ON public.cars(discount_percentage);
CREATE INDEX IF NOT EXISTS idx_cars_rental_types ON public.cars USING GIN(rental_types);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON public.cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_transmission ON public.cars(transmission);

-- فهارس bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON public.bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_branch_id ON public.bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON public.bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_end_date ON public.bookings(end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_range ON public.bookings USING GIST(booking_range);
CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON public.bookings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- فهرس مركب للحجوزات النشطة
CREATE INDEX IF NOT EXISTS idx_bookings_active_car_range ON public.bookings(car_id, booking_range) 
WHERE status IN ('pending', 'confirmed', 'payment_pending', 'active');

-- فهارس announcements
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_branch_id ON public.announcements(branch_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON public.announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcements_is_featured ON public.announcements(is_featured);

-- فهارس notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- فهرس مركب للإشعارات غير المقروءة
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) 
WHERE is_read = FALSE;

-- فهارس car_offers
CREATE INDEX IF NOT EXISTS idx_car_offers_car_id ON public.car_offers(car_id);
CREATE INDEX IF NOT EXISTS idx_car_offers_branch_id ON public.car_offers(branch_id);
CREATE INDEX IF NOT EXISTS idx_car_offers_is_active ON public.car_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_car_offers_valid_from ON public.car_offers(valid_from);
CREATE INDEX IF NOT EXISTS idx_car_offers_valid_until ON public.car_offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_car_offers_rental_types ON public.car_offers USING GIN(rental_types);

-- فهرس مركب للعروض النشطة
CREATE INDEX IF NOT EXISTS idx_car_offers_active ON public.car_offers(car_id, is_active, valid_from, valid_until) 
WHERE is_active = TRUE;

-- فهارس security_audit_log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);

-- فهارس notification_outbox
CREATE INDEX IF NOT EXISTS idx_notification_outbox_to_user ON public.notification_outbox(to_user);
CREATE INDEX IF NOT EXISTS idx_notification_outbox_created_at ON public.notification_outbox(created_at);

-- فهارس audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_row_id ON public.audit_log(row_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON public.audit_log(occurred_at DESC);

-- فهارس otp_requests
CREATE INDEX IF NOT EXISTS idx_otp_requests_user_id ON public.otp_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_requests_phone ON public.otp_requests(phone);
CREATE INDEX IF NOT EXISTS idx_otp_requests_status ON public.otp_requests(status);
CREATE INDEX IF NOT EXISTS idx_otp_requests_expires_at ON public.otp_requests(expires_at);

-- فهارس phone_verifications
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON public.phone_verifications(expires_at);

-- فهارس auth_logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON public.auth_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at DESC);

-- فهارس البحث النصي
CREATE INDEX IF NOT EXISTS idx_car_brands_name_ar_trgm ON public.car_brands USING GIN(name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_car_brands_name_en_trgm ON public.car_brands USING GIN(name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_car_models_name_ar_trgm ON public.car_models USING GIN(name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_car_models_name_en_trgm ON public.car_models USING GIN(name_en gin_trgm_ops);

-- ========================================================================
-- 20. إنشاء Views
-- ========================================================================

-- View ديناميكي للتوفر
CREATE OR REPLACE VIEW public.cars_availability AS
SELECT 
  c.id as car_id,
  c.quantity as total_quantity,
  public.get_actual_available_quantity(c.id) as available_quantity,
  c.status,
  c.branch_id,
  cb.name_ar as brand_name_ar,
  cb.name_en as brand_name_en,
  cm.name_ar as model_name_ar,
  cm.name_en as model_name_en
FROM public.cars c
JOIN public.car_models cm ON c.model_id = cm.id
JOIN public.car_brands cb ON cm.brand_id = cb.id;

-- View للأسعار الفعالة
CREATE OR REPLACE VIEW public.cars_with_effective_prices AS
SELECT 
  c.id,
  c.branch_id,
  b.name_ar AS branch_name_ar,
  b.name_en AS branch_name_en,
  m.name_ar AS model_name_ar,
  m.name_en AS model_name_en,
  c.daily_price AS original_daily_price,
  c.weekly_price AS original_weekly_price,
  c.monthly_price AS original_monthly_price,
  c.ownership_price AS original_ownership_price,
  c.discount_percentage,
  c.offer_expires_at,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
    THEN true
    ELSE false
  END AS has_active_offer,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
    THEN c.daily_price - (c.daily_price * c.discount_percentage / 100)
    ELSE c.daily_price
  END AS effective_daily_price,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
         AND c.weekly_price IS NOT NULL
    THEN c.weekly_price - (c.weekly_price * c.discount_percentage / 100)
    ELSE c.weekly_price
  END AS effective_weekly_price,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
         AND c.monthly_price IS NOT NULL
    THEN c.monthly_price - (c.monthly_price * c.discount_percentage / 100)
    ELSE c.monthly_price
  END AS effective_monthly_price,
  c.ownership_price AS effective_ownership_price,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
    THEN c.daily_price * c.discount_percentage / 100
    ELSE 0
  END AS daily_savings,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
         AND c.monthly_price IS NOT NULL
    THEN c.monthly_price * c.discount_percentage / 100
    ELSE 0
  END AS monthly_savings,
  0 AS ownership_savings,
  c.status,
  c.available_quantity,
  c.rental_types
FROM cars c
JOIN car_models m ON c.model_id = m.id
JOIN branches b ON c.branch_id = b.id
WHERE c.status != 'hidden';

-- View شامل للسيارات مع المميزات
CREATE OR REPLACE VIEW public.cars_with_details AS
SELECT 
  c.id,
  c.branch_id,
  b.name_ar as branch_name_ar,
  b.name_en as branch_name_en,
  cm.name_ar as model_name_ar,
  cm.name_en as model_name_en,
  cb.name_ar as brand_name_ar,
  cb.name_en as brand_name_en,
  cc.name_ar as color_name_ar,
  cc.name_en as color_name_en,
  c.daily_price,
  c.weekly_price,
  c.monthly_price,
  c.ownership_price,
  c.discount_percentage,
  c.offer_expires_at,
  CASE 
    WHEN c.discount_percentage > 0 
         AND (c.offer_expires_at IS NULL OR c.offer_expires_at >= NOW())
    THEN true
    ELSE false
  END as has_active_offer,
  c.quantity,
  c.available_quantity,
  public.get_actual_available_quantity(c.id) as actual_available_quantity,
  c.status,
  COALESCE(
    ARRAY(
      SELECT cf.name_ar 
      FROM car_feature_assignments cfa 
      JOIN car_features cf ON cfa.feature_id = cf.id 
      WHERE cfa.car_id = c.id AND cf.is_active = true
      ORDER BY cf.name_ar
    ),
    '{}'::TEXT[]
  ) as features_ar,
  COALESCE(
    ARRAY(
      SELECT cf.name_en 
      FROM car_feature_assignments cfa 
      JOIN car_features cf ON cfa.feature_id = cf.id 
      WHERE cfa.car_id = c.id AND cf.is_active = true
      ORDER BY cf.name_en
    ),
    '{}'::TEXT[]
  ) as features_en,
  COALESCE(
    ARRAY(
      SELECT cf.id 
      FROM car_feature_assignments cfa 
      JOIN car_features cf ON cfa.feature_id = cf.id 
      WHERE cfa.car_id = c.id AND cf.is_active = true
    ),
    '{}'::UUID[]
  ) as feature_ids,
  c.description_ar,
  c.description_en,
  c.additional_images,
  c.seats,
  c.fuel_type,
  c.transmission,
  c.mileage,
  c.is_new,
  c.rental_types,
  c.created_at,
  c.updated_at
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
JOIN branches b ON c.branch_id = b.id
LEFT JOIN car_colors cc ON c.color_id = cc.id
WHERE c.status != 'hidden';

-- ========================================================================
-- 21. الجدولة التلقائية باستخدام pg_cron
-- ========================================================================

-- حذف الجداول القديمة إن وجدت
SELECT cron.unschedule('complete-expired-bookings') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'complete-expired-bookings'
);

SELECT cron.unschedule('cleanup-old-bookings') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-bookings'
);

SELECT cron.unschedule('cleanup-old-notifications') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-notifications'
);

SELECT cron.unschedule('cleanup-expired-offers') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-offers'
);

SELECT cron.unschedule('cleanup-rate-limits') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-rate-limits'
);

-- جدولة إكمال الحجوزات النشطة المنتهية (يومياً الساعة 2 صباحاً)
SELECT cron.schedule(
  'complete-expired-bookings',
  '0 2 * * *',
  $$SELECT complete_active_bookings();$$
);

-- جدولة تنظيف الحجوزات منتهية الصلاحية (كل 6 ساعات)
SELECT cron.schedule(
  'cleanup-old-bookings',
  '0 */6 * * *',
  $$SELECT cleanup_expired_bookings();$$
);

-- جدولة تنظيف الإشعارات القديمة (شهرياً)
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 1 * *',
  $$SELECT cleanup_old_notifications(30);$$
);

-- جدولة تنظيف العروض المنتهية (يومياً الساعة 1 صباحاً)
SELECT cron.schedule(
  'cleanup-expired-offers',
  '0 1 * * *',
  $$SELECT cleanup_expired_offers();$$
);

-- جدولة تنظيف Rate Limits (كل 6 ساعات)
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 */6 * * *',
  $$SELECT cleanup_old_rate_limits();$$
);

-- ========================================================================
-- 22. Storage Buckets Configuration
-- ========================================================================

-- bucket: brand-logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-logos', 
  'brand-logos', 
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view brand logos" ON storage.objects;
CREATE POLICY "Anyone can view brand logos" ON storage.objects FOR SELECT USING (bucket_id = 'brand-logos');

DROP POLICY IF EXISTS "Admins can upload brand logos" ON storage.objects;
CREATE POLICY "Admins can upload brand logos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'brand-logos' 
  AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update brand logos" ON storage.objects;
CREATE POLICY "Admins can update brand logos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'brand-logos' AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Admins can delete brand logos" ON storage.objects;
CREATE POLICY "Admins can delete brand logos" ON storage.objects FOR DELETE USING (
  bucket_id = 'brand-logos' AND auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- bucket: car-model-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-model-images', 
  'car-model-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view model images" ON storage.objects;
CREATE POLICY "Anyone can view model images" ON storage.objects FOR SELECT USING (bucket_id = 'car-model-images');

DROP POLICY IF EXISTS "Admins can upload model images" ON storage.objects;
CREATE POLICY "Admins can upload model images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'car-model-images' 
  AND auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update model images" ON storage.objects;
CREATE POLICY "Admins can update model images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'car-model-images' 
  AND auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Admins can delete model images" ON storage.objects;
CREATE POLICY "Admins can delete model images" ON storage.objects FOR DELETE USING (
  bucket_id = 'car-model-images' 
  AND auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

-- bucket: car-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images', 
  'car-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
CREATE POLICY "Admins can upload car images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'car-images' AND is_admin()
);

DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
CREATE POLICY "Admins can update car images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'car-images' AND is_admin()) WITH CHECK (bucket_id = 'car-images' AND is_admin());

DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;
CREATE POLICY "Admins can delete car images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'car-images' AND is_admin());

DROP POLICY IF EXISTS "Everyone can view car images" ON storage.objects;
CREATE POLICY "Everyone can view car images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'car-images');

-- bucket: branch-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branch-images', 
  'branch-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins can upload branch images" ON storage.objects;
CREATE POLICY "Admins can upload branch images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'branch-images' AND is_admin()
);

DROP POLICY IF EXISTS "Admins can update branch images" ON storage.objects;
CREATE POLICY "Admins can update branch images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'branch-images' AND is_admin()) WITH CHECK (bucket_id = 'branch-images' AND is_admin());

DROP POLICY IF EXISTS "Admins can delete branch images" ON storage.objects;
CREATE POLICY "Admins can delete branch images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'branch-images' AND is_admin());

DROP POLICY IF EXISTS "Everyone can view branch images" ON storage.objects;
CREATE POLICY "Everyone can view branch images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'branch-images');

-- bucket: announcement-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images',
  'announcement-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins can upload announcement images" ON storage.objects;
CREATE POLICY "Admins can upload announcement images" ON storage.objects FOR INSERT TO public WITH CHECK (
  bucket_id = 'announcement-images' 
  AND (auth.jwt() ->> 'role')::text = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'branch')
  )
);

DROP POLICY IF EXISTS "Everyone can view announcement images" ON storage.objects;
CREATE POLICY "Everyone can view announcement images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'announcement-images');

DROP POLICY IF EXISTS "Admins can delete announcement images" ON storage.objects;
CREATE POLICY "Admins can delete announcement images" ON storage.objects FOR DELETE TO public USING (
  bucket_id = 'announcement-images'
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'branch')
  )
);

-- ========================================================================
-- 23. تعليقات التوثيق
-- ========================================================================

COMMENT ON TABLE public.branches IS 'جدول الفروع - معلومات الفروع والمواقع الجغرافية';
COMMENT ON TABLE public.profiles IS 'جدول الملفات الشخصية - معلومات المستخدمين';
COMMENT ON TABLE public.user_roles IS 'جدول الأدوار - نظام آمن منفصل لإدارة أدوار المستخدمين';
COMMENT ON TABLE public.documents IS 'جدول الوثائق - وثائق التحقق من الهوية ورخص القيادة';
COMMENT ON TABLE public.car_features IS 'جدول المميزات - قائمة مميزات السيارات القياسية';
COMMENT ON TABLE public.car_feature_assignments IS 'جدول الربط - ربط السيارات بمميزاتها';
COMMENT ON TABLE public.cars IS 'جدول السيارات - معلومات السيارات المتاحة للإيجار';
COMMENT ON TABLE public.bookings IS 'جدول الحجوزات - حجوزات السيارات والحالات المختلفة';
COMMENT ON TABLE public.notifications IS 'جدول الإشعارات - إشعارات المستخدمين';
COMMENT ON TABLE public.car_offers IS 'جدول العروض - عروض خاصة على السيارات';
COMMENT ON TABLE public.rate_limits IS 'جدول Rate Limiting - تتبع محاولات الطلبات';

COMMENT ON FUNCTION public.get_actual_available_quantity IS 'حساب الكمية المتاحة الفعلية للسيارة بناءً على الحجوزات النشطة';
COMMENT ON FUNCTION public.check_car_availability IS 'التحقق من توفر السيارة في فترة زمنية محددة';
COMMENT ON FUNCTION public.create_booking_atomic IS 'إنشاء حجز جديد بشكل آمن مع نظام الخصومات المحدث';
COMMENT ON FUNCTION public.customer_cancel_booking IS 'إلغاء الحجز من قبل العميل';
COMMENT ON FUNCTION public.approve_booking IS 'موافقة الفرع على الحجز';
COMMENT ON FUNCTION public.reject_booking IS 'رفض الحجز من قبل الفرع';
COMMENT ON FUNCTION public.cleanup_expired_bookings IS 'تنظيف الحجوزات منتهية الصلاحية تلقائياً';
COMMENT ON FUNCTION public.complete_active_bookings IS 'إكمال الحجوزات النشطة المنتهية تلقائياً';
COMMENT ON FUNCTION public.calculate_booking_price IS 'حساب السعر النهائي مع دعم النظام المرن والخصومات';
COMMENT ON FUNCTION public.search_cars IS 'البحث المتقدم عن السيارات مع دعم car_features';
COMMENT ON FUNCTION public.send_notification IS 'إرسال إشعار للمستخدم';
COMMENT ON FUNCTION public.detect_language IS 'كشف لغة النص (عربي أو إنجليزي)';
COMMENT ON FUNCTION public.has_role IS 'التحقق من دور مستخدم محدد';
COMMENT ON FUNCTION public.is_admin IS 'التحقق من صلاحيات المسؤول';
COMMENT ON FUNCTION public.is_branch_manager IS 'التحقق من صلاحيات مدير الفرع';
COMMENT ON FUNCTION public.set_car_features IS 'تعيين مميزات متعددة لسيارة';
COMMENT ON FUNCTION public.get_car_features IS 'الحصول على مميزات سيارة';
COMMENT ON FUNCTION public.add_feature_to_car IS 'إضافة ميزة واحدة لسيارة';
COMMENT ON FUNCTION public.remove_feature_from_car IS 'حذف ميزة من سيارة';
COMMENT ON FUNCTION public.log_security_event IS 'تسجيل حدث أمني في السجل';
COMMENT ON FUNCTION public.log_availability_inconsistency IS 'تسجيل مشكلة في التوفر';
COMMENT ON FUNCTION public.check_rate_limit IS 'التحقق من Rate Limiting وتسجيل المحاولة';
COMMENT ON FUNCTION public.cleanup_old_rate_limits IS 'حذف محاولات Rate Limiting القديمة';
COMMENT ON FUNCTION public.test_rate_limit IS 'اختبار حالة Rate Limiting دون تسجيل محاولة';
COMMENT ON FUNCTION public.reset_rate_limit IS 'إعادة تعيين Rate Limit (للمسؤولين)';
COMMENT ON FUNCTION public.approve_document IS 'قبول مستند من قبل مسؤول أو مدير فرع';
COMMENT ON FUNCTION public.reject_document IS 'رفض مستند مع توضيح السبب';
COMMENT ON FUNCTION public.get_pending_documents IS 'جلب المستندات قيد المراجعة';
COMMENT ON FUNCTION public.get_active_announcements IS 'جلب الإعلانات النشطة';
COMMENT ON FUNCTION public.toggle_announcement_status IS 'تبديل حالة الإعلان';
COMMENT ON FUNCTION public.get_booking_details IS 'جلب تفاصيل الحجز الشاملة';
COMMENT ON FUNCTION public.update_booking_notes IS 'تحديث ملاحظات الحجز';

COMMENT ON COLUMN public.bookings.booking_range IS 'نطاق التواريخ المحجوزة - يستخدم للتحقق من التعارضات';
COMMENT ON COLUMN public.bookings.expires_at IS 'وقت انتهاء صلاحية الحجز - يستخدم للإلغاء التلقائي';
COMMENT ON COLUMN public.cars.available_quantity IS '⚠️ تحذير: هذا العمود غير دقيق! استخدم get_actual_available_quantity() للحصول على الكمية الفعلية المتاحة';
COMMENT ON COLUMN public.cars.quantity IS 'إجمالي كمية السيارات المتاحة في الفرع';
COMMENT ON COLUMN public.cars.discount_percentage IS 'نسبة الخصم - لا تُطبق على التمليك';
COMMENT ON COLUMN public.cars.offer_expires_at IS 'تاريخ انتهاء العرض - NULL يعني عرض دائم';

-- ========================================================================
-- ✅ النسخة النهائية - اكتملت بنجاح!
-- ========================================================================

-- رسالة النجاح
DO $$ 
BEGIN 
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '✅ تم إنشاء قاعدة البيانات بنجاح!';
  RAISE NOTICE 'LEAGO Car Rental System - Complete Database Schema';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '📊 الإحصائيات:';
  RAISE NOTICE '   - الجداول: 23 جدول';
  RAISE NOTICE '   - الدوال: 50+ دالة';
  RAISE NOTICE '   - الـ Views: 3 views';
  RAISE NOTICE '   - الـ Triggers: 10 triggers';
  RAISE NOTICE '   - الـ Indexes: 60+ index';
  RAISE NOTICE '   - الـ Storage Buckets: 5 buckets';
  RAISE NOTICE '   - الـ pg_cron Jobs: 5 jobs';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '🎯 الميزات الرئيسية:';
  RAISE NOTICE '   ✅ نظام حجوزات ديناميكي محدّث';
  RAISE NOTICE '   ✅ Rate Limiting محسّن';
  RAISE NOTICE '   ✅ نظام المميزات (car_features)';
  RAISE NOTICE '   ✅ إدارة المستندات';
  RAISE NOTICE '   ✅ نظام الإعلانات';
  RAISE NOTICE '   ✅ تسجيل أمني شامل';
  RAISE NOTICE '   ✅ RLS Policies محكمة';
  RAISE NOTICE '   ✅ جدولة تلقائية';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '🚀 النظام جاهز للاستخدام!';
  RAISE NOTICE '========================================================================';
END $$;



-------------------------------------------------------------------------------------------------------------------------- addition

than we add

CREATE OR REPLACE FUNCTION public.quick_search_suggestions(
  _term text, 
  _lang text DEFAULT NULL, 
  _limit integer DEFAULT 8
)
RETURNS TABLE(
  suggestion text, 
  source text, 
  detected_language text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  detected_lang text;
BEGIN
    detected_lang := COALESCE(_lang, detect_language(_term));
    
    RETURN QUERY
    (
        SELECT DISTINCT
            CASE 
                WHEN detected_lang = 'ar' THEN cb.name_ar
                ELSE cb.name_en
            END as suggestion,
            'brand'::TEXT as source,
            detected_lang as detected_language
        FROM car_brands cb
        WHERE cb.is_active = true
        AND (
            (detected_lang = 'ar' AND cb.name_ar ILIKE '%' || _term || '%') OR
            (detected_lang = 'en' AND cb.name_en ILIKE '%' || _term || '%') OR
            cb.name_ar ILIKE '%' || _term || '%' OR
            cb.name_en ILIKE '%' || _term || '%'
        )
        ORDER BY 
            CASE 
                WHEN detected_lang = 'ar' THEN cb.name_ar
                ELSE cb.name_en
            END
        LIMIT _limit / 3
    )
    UNION ALL
    (
        SELECT DISTINCT
            CASE 
                WHEN detected_lang = 'ar' THEN cm.name_ar
                ELSE cm.name_en
            END as suggestion,
            'model'::TEXT as source,
            detected_lang as detected_language
        FROM car_models cm
        WHERE cm.is_active = true
        AND (
            (detected_lang = 'ar' AND cm.name_ar ILIKE '%' || _term || '%') OR
            (detected_lang = 'en' AND cm.name_en ILIKE '%' || _term || '%') OR
            cm.name_ar ILIKE '%' || _term || '%' OR
            cm.name_en ILIKE '%' || _term || '%'
        )
        ORDER BY 
            CASE 
                WHEN detected_lang = 'ar' THEN cm.name_ar
                ELSE cm.name_en
            END
        LIMIT _limit / 3
    )
    UNION ALL
    (
        SELECT DISTINCT
            CASE 
                WHEN detected_lang = 'ar' THEN b.name_ar
                ELSE b.name_en
            END as suggestion,
            'branch'::TEXT as source,
            detected_lang as detected_language
        FROM branches b
        WHERE b.is_active = true
        AND (
            (detected_lang = 'ar' AND b.name_ar ILIKE '%' || _term || '%') OR
            (detected_lang = 'en' AND b.name_en ILIKE '%' || _term || '%') OR
            b.name_ar ILIKE '%' || _term || '%' OR
            b.name_en ILIKE '%' || _term || '%'
        )
        ORDER BY 
            CASE 
                WHEN detected_lang = 'ar' THEN b.name_ar
                ELSE b.name_en
            END
        LIMIT _limit / 3
    )
    ORDER BY source, suggestion
    LIMIT _limit;
END;
$$;


now add this


-- ========================================================================
-- إصلاح شامل لنظام المصادقة - تطبيق LEAGO للعملاء فقط
-- ========================================================================

-- ========================================================================
-- الجزء 1: إصلاح سياسات RLS للـ profiles
-- ========================================================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- سياسة SELECT: المستخدم يرى ملفه فقط
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- سياسة INSERT: المستخدم يستطيع إنشاء ملف له فقط
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- سياسة UPDATE: المستخدم يستطيع تحديث ملفه فقط
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ========================================================================
-- الجزء 2: إصلاح سياسات RLS للـ user_roles
-- ========================================================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert customer role" ON public.user_roles;

-- سياسة SELECT: المستخدم يرى دوره فقط
CREATE POLICY "Users can view own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- سياسة INSERT: السماح بإنشاء دور customer فقط
CREATE POLICY "Users can insert customer role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'customer'
);

-- ========================================================================
-- الجزء 3: دالة آمنة لإنشاء ملف العميل
-- ========================================================================

CREATE OR REPLACE FUNCTION public.create_customer_profile_safe(
  p_user_id UUID,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_age INTEGER DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_user_latitude DECIMAL DEFAULT NULL,
  p_user_longitude DECIMAL DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- التحقق من أن المستخدم الحالي هو نفسه
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated: Must be logged in';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create profile for another user';
  END IF;

  -- التحقق من عدم وجود الملف مسبقاً
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    -- تحديث الملف الموجود
    UPDATE public.profiles SET
      email = COALESCE(p_email, email),
      full_name = COALESCE(p_full_name, full_name),
      phone = COALESCE(p_phone, phone),
      age = COALESCE(p_age, age),
      gender = COALESCE(p_gender, gender),
      location = COALESCE(p_location, location),
      user_latitude = COALESCE(p_user_latitude, user_latitude),
      user_longitude = COALESCE(p_user_longitude, user_longitude),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    v_result := json_build_object(
      'success', true,
      'message', 'Profile updated',
      'user_id', p_user_id
    );
  ELSE
    -- إنشاء ملف جديد
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      phone,
      age,
      gender,
      location,
      user_latitude,
      user_longitude,
      is_verified,
      branch_id
    ) VALUES (
      p_user_id,
      COALESCE(p_email, COALESCE(p_phone, '') || '@phone.temp'),
      COALESCE(p_full_name, ''),
      p_phone,
      p_age,
      p_gender,
      p_location,
      p_user_latitude,
      p_user_longitude,
      FALSE,
      NULL
    );
    
    v_result := json_build_object(
      'success', true,
      'message', 'Profile created',
      'user_id', p_user_id
    );
  END IF;

  -- إضافة دور customer فقط
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (p_user_id, 'customer', p_user_id)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.create_customer_profile_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_customer_profile_safe TO anon;

COMMENT ON FUNCTION public.create_customer_profile_safe IS 'إنشاء ملف عميل بشكل آمن مع التحقق من الصلاحيات';

-- ========================================================================
-- الجزء 4: دالة التحقق من دور المستخدم
-- ========================================================================

CREATE OR REPLACE FUNCTION public.check_user_is_customer()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_role user_role;
  v_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- عد الأدوار للمستخدم
  SELECT COUNT(*) INTO v_count
  FROM public.user_roles
  WHERE user_id = auth.uid();

  -- يجب أن يكون له دور واحد فقط
  IF v_count != 1 THEN
    RETURN FALSE;
  END IF;

  -- التحقق من أن الدور هو customer
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN v_role = 'customer';
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_is_customer TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_is_customer TO anon;

COMMENT ON FUNCTION public.check_user_is_customer IS 'التحقق من أن المستخدم عميل فقط (وليس له أدوار أخرى)';

-- ========================================================================
-- الجزء 5: دالة الحصول على دور المستخدم
-- ========================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role::TEXT INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN v_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role TO anon;

-- ========================================================================
-- الجزء 6: دالة منع الأدوار غير المسموحة
-- ========================================================================

CREATE OR REPLACE FUNCTION public.prevent_non_customer_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- السماح فقط بدور customer في التطبيق
  IF NEW.role != 'customer' THEN
    RAISE EXCEPTION 'Only customer role is allowed in this application';
  END IF;

  -- التحقق من عدم وجود أدوار أخرى للمستخدم
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id 
    AND role != 'customer'
  ) THEN
    RAISE EXCEPTION 'User already has a non-customer role';
  END IF;

  RETURN NEW;
END;
$$;

-- إنشاء Trigger للتحقق من الأدوار
DROP TRIGGER IF EXISTS enforce_customer_role_only ON public.user_roles;
CREATE TRIGGER enforce_customer_role_only
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_non_customer_roles();

COMMENT ON FUNCTION public.prevent_non_customer_roles IS 'منع إضافة أدوار غير customer في تطبيق العملاء';

-- ========================================================================
-- الجزء 7: تنظيف الأدوار القديمة (اختياري)
-- ========================================================================

-- حذف جميع الأدوار غير customer (إذا كنت متأكداً)
-- احذف علامة التعليق للتنفيذ:
-- DELETE FROM public.user_roles WHERE role != 'customer';

-- ========================================================================
-- الجزء 8: اختبار النظام
-- ========================================================================

-- اختبار دالة التحقق من الدور
-- SELECT public.check_user_is_customer();

-- اختبار الحصول على الدور الحالي
-- SELECT public.get_current_user_role();

-- ========================================================================
-- ✅ تم الانتهاء من التعديلات
-- ========================================================================

-- رسالة النجاح
DO $$ 
BEGIN 
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '✅ تم تطبيق التعديلات بنجاح!';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '📊 التعديلات المطبقة:';
  RAISE NOTICE '   - سياسات RLS محدثة للـ profiles';
  RAISE NOTICE '   - سياسات RLS محدثة للـ user_roles';
  RAISE NOTICE '   - دالة create_customer_profile_safe';
  RAISE NOTICE '   - دالة check_user_is_customer';
  RAISE NOTICE '   - دالة get_current_user_role';
  RAISE NOTICE '   - Trigger لمنع الأدوار غير المسموحة';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '🔐 الحماية:';
  RAISE NOTICE '   - يُسمح فقط بدور customer';
  RAISE NOTICE '   - المستخدمون الجدد يحصلون على دور customer تلقائياً';
  RAISE NOTICE '   - لا يمكن إضافة أدوار أخرى';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '🚀 التطبيق جاهز للاستخدام!';
  RAISE NOTICE '========================================================================';
END $$;



we add


-- ========================================================================
-- دوال محسّنة لنظام الحجوزات
-- ========================================================================

-- ============================================
-- 1. get_user_bookings - جلب حجوزات المستخدم
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_bookings(
  p_user_id UUID DEFAULT NULL,
  p_status TEXT[] DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  -- معلومات الحجز
  id UUID,
  customer_id UUID,
  car_id UUID,
  branch_id UUID,
  rental_type rental_type,
  start_date DATE,
  end_date DATE,
  total_days INTEGER,
  daily_rate NUMERIC,
  total_amount NUMERIC,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  status booking_status,
  payment_reference TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  
  -- معلومات السيارة (JSON)
  car JSONB,
  
  -- معلومات الفرع (JSON)
  branch JSONB,
  
  -- إجمالي النتائج
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_total_count BIGINT;
BEGIN
  -- تحديد المستخدم
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;
  
  -- حساب الإجمالي
  SELECT COUNT(*) INTO v_total_count
  FROM bookings b
  WHERE b.customer_id = v_user_id
    AND (p_status IS NULL OR b.status::TEXT = ANY(p_status));
  
  -- جلب البيانات
  RETURN QUERY
  WITH booking_data AS (
    SELECT 
      b.id,
      b.customer_id,
      b.car_id,
      b.branch_id,
      b.rental_type,
      b.start_date,
      b.end_date,
      b.total_days,
      b.daily_rate,
      b.total_amount,
      b.discount_amount,
      b.final_amount,
      b.status,
      b.payment_reference,
      b.approved_by,
      b.approved_at,
      b.notes,
      b.expires_at,
      b.created_at,
      b.updated_at,
      
      -- تجميع معلومات السيارة
      jsonb_build_object(
        'id', c.id,
        'daily_price', c.daily_price,
        'weekly_price', c.weekly_price,
        'monthly_price', c.monthly_price,
        'ownership_price', c.ownership_price,
        'seats', c.seats,
        'fuel_type', c.fuel_type,
        'transmission', c.transmission,
        'features_ar', c.features_ar,
        'features_en', c.features_en,
        'additional_images', c.additional_images,
        'model', jsonb_build_object(
          'id', cm.id,
          'name_ar', cm.name_ar,
          'name_en', cm.name_en,
          'year', cm.year,
          'default_image_url', cm.default_image_url,
          'description_ar', cm.description_ar,
          'description_en', cm.description_en,
          'brand', jsonb_build_object(
            'id', cb.id,
            'name_ar', cb.name_ar,
            'name_en', cb.name_en,
            'logo_url', cb.logo_url
          )
        ),
        'color', jsonb_build_object(
          'id', cc.id,
          'name_ar', cc.name_ar,
          'name_en', cc.name_en,
          'hex_code', cc.hex_code
        )
      ) as car_data,
      
      -- تجميع معلومات الفرع
      jsonb_build_object(
        'id', br.id,
        'name_ar', br.name_ar,
        'name_en', br.name_en,
        'location_ar', br.location_ar,
        'location_en', br.location_en,
        'phone', br.phone,
        'email', br.email,
        'working_hours', br.working_hours,
        'latitude', br.latitude,
        'longitude', br.longitude
      ) as branch_data
      
    FROM bookings b
    LEFT JOIN cars c ON b.car_id = c.id
    LEFT JOIN car_models cm ON c.model_id = cm.id
    LEFT JOIN car_brands cb ON cm.brand_id = cb.id
    LEFT JOIN car_colors cc ON c.color_id = cc.id
    LEFT JOIN branches br ON b.branch_id = br.id
    WHERE b.customer_id = v_user_id
      AND (p_status IS NULL OR b.status::TEXT = ANY(p_status))
  )
  SELECT 
    bd.id,
    bd.customer_id,
    bd.car_id,
    bd.branch_id,
    bd.rental_type,
    bd.start_date,
    bd.end_date,
    bd.total_days,
    bd.daily_rate,
    bd.total_amount,
    bd.discount_amount,
    bd.final_amount,
    bd.status,
    bd.payment_reference,
    bd.approved_by,
    bd.approved_at,
    bd.notes,
    bd.expires_at,
    bd.created_at,
    bd.updated_at,
    bd.car_data,
    bd.branch_data,
    v_total_count
  FROM booking_data bd
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN bd.created_at
    END DESC,
    CASE 
      WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN bd.created_at
    END ASC,
    CASE 
      WHEN p_sort_by = 'start_date' AND p_sort_order = 'desc' THEN bd.start_date
    END DESC,
    CASE 
      WHEN p_sort_by = 'start_date' AND p_sort_order = 'asc' THEN bd.start_date
    END ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_user_bookings IS 
'جلب حجوزات المستخدم مع تفاصيل كاملة للسيارة والفرع - محسّنة للأداء';

-- ============================================
-- 2. get_booking_full_details - تفاصيل حجز واحد
-- ============================================

CREATE OR REPLACE FUNCTION public.get_booking_full_details(
  p_booking_id UUID
)
RETURNS TABLE(
  -- معلومات الحجز
  id UUID,
  customer_id UUID,
  car_id UUID,
  branch_id UUID,
  rental_type rental_type,
  start_date DATE,
  end_date DATE,
  total_days INTEGER,
  daily_rate NUMERIC,
  total_amount NUMERIC,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  status booking_status,
  payment_reference TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  
  -- معلومات السيارة (JSON)
  car JSONB,
  
  -- معلومات الفرع (JSON)
  branch JSONB,
  
  -- معلومات المُوافق (JSON)
  approved_by_user JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- التحقق من الصلاحيات
  IF NOT (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = p_booking_id 
        AND (
          customer_id = auth.uid()
          OR branch_id = current_user_branch_id()
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    b.id,
    b.customer_id,
    b.car_id,
    b.branch_id,
    b.rental_type,
    b.start_date,
    b.end_date,
    b.total_days,
    b.daily_rate,
    b.total_amount,
    b.discount_amount,
    b.final_amount,
    b.status,
    b.payment_reference,
    b.approved_by,
    b.approved_at,
    b.notes,
    b.expires_at,
    b.created_at,
    b.updated_at,
    
    -- معلومات السيارة
    jsonb_build_object(
      'id', c.id,
      'daily_price', c.daily_price,
      'weekly_price', c.weekly_price,
      'monthly_price', c.monthly_price,
      'ownership_price', c.ownership_price,
      'seats', c.seats,
      'fuel_type', c.fuel_type,
      'transmission', c.transmission,
      'features_ar', c.features_ar,
      'features_en', c.features_en,
      'additional_images', c.additional_images,
      'status', c.status,
      'discount_percentage', c.discount_percentage,
      'offer_expires_at', c.offer_expires_at,
      'model', jsonb_build_object(
        'id', cm.id,
        'name_ar', cm.name_ar,
        'name_en', cm.name_en,
        'year', cm.year,
        'default_image_url', cm.default_image_url,
        'description_ar', cm.description_ar,
        'description_en', cm.description_en,
        'specifications', cm.specifications,
        'brand', jsonb_build_object(
          'id', cb.id,
          'name_ar', cb.name_ar,
          'name_en', cb.name_en,
          'logo_url', cb.logo_url
        )
      ),
      'color', jsonb_build_object(
        'id', cc.id,
        'name_ar', cc.name_ar,
        'name_en', cc.name_en,
        'hex_code', cc.hex_code
      )
    ) as car_data,
    
    -- معلومات الفرع
    jsonb_build_object(
      'id', br.id,
      'name_ar', br.name_ar,
      'name_en', br.name_en,
      'location_ar', br.location_ar,
      'location_en', br.location_en,
      'phone', br.phone,
      'email', br.email,
      'working_hours', br.working_hours,
      'latitude', br.latitude,
      'longitude', br.longitude,
      'images', br.images
    ) as branch_data,
    
    -- معلومات المُوافق
    CASE 
      WHEN b.approved_by IS NOT NULL THEN
        jsonb_build_object(
          'user_id', ap.user_id,
          'full_name', ap.full_name,
          'email', ap.email
        )
      ELSE NULL
    END as approved_by_user_data
    
  FROM bookings b
  LEFT JOIN cars c ON b.car_id = c.id
  LEFT JOIN car_models cm ON c.model_id = cm.id
  LEFT JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN car_colors cc ON c.color_id = cc.id
  LEFT JOIN branches br ON b.branch_id = br.id
  LEFT JOIN profiles ap ON b.approved_by = ap.user_id
  WHERE b.id = p_booking_id;
END;
$$;

COMMENT ON FUNCTION public.get_booking_full_details IS 
'جلب تفاصيل حجز واحد بشكل كامل مع معلومات المُوافق';

-- ============================================
-- 3. get_user_booking_stats - إحصائيات الحجوزات
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_booking_stats(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total BIGINT,
  pending BIGINT,
  confirmed BIGINT,
  payment_pending BIGINT,
  active BIGINT,
  completed BIGINT,
  cancelled BIGINT,
  expired BIGINT,
  total_spent NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT as confirmed,
    COUNT(*) FILTER (WHERE status = 'payment_pending')::BIGINT as payment_pending,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled,
    COUNT(*) FILTER (WHERE status = 'expired')::BIGINT as expired,
    COALESCE(SUM(final_amount) FILTER (WHERE status IN ('completed', 'active')), 0) as total_spent
  FROM bookings
  WHERE customer_id = v_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_booking_stats IS 
'إحصائيات حجوزات المستخدم - عدد كل حالة والمبلغ الإجمالي';

-- ============================================
-- 4. check_car_availability_detailed - تفاصيل التوفر
-- ============================================

CREATE OR REPLACE FUNCTION public.check_car_availability_detailed(
  p_car_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  is_available BOOLEAN,
  total_quantity INTEGER,
  available_quantity INTEGER,
  actual_available INTEGER,
  conflicting_bookings INTEGER,
  car_status car_status,
  message TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_car RECORD;
  v_actual_available INTEGER;
  v_conflicting INTEGER;
  v_is_available BOOLEAN;
  v_message TEXT;
BEGIN
  -- جلب معلومات السيارة
  SELECT 
    c.quantity,
    c.available_quantity,
    c.status
  INTO v_car
  FROM cars c
  WHERE c.id = p_car_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 0, 0, 0, 0, NULL::car_status, 
      'السيارة غير موجودة'::TEXT;
    RETURN;
  END IF;
  
  -- حساب الكمية المتاحة الفعلية
  v_actual_available := get_actual_available_quantity(
    p_car_id, 
    p_start_date, 
    p_end_date
  );
  
  -- حساب الحجوزات المتداخلة
  SELECT COUNT(*)::INTEGER INTO v_conflicting
  FROM bookings
  WHERE car_id = p_car_id
    AND booking_status_consumes_capacity(status)
    AND booking_range && make_booking_range(p_start_date, p_end_date);
  
  -- تحديد التوفر والرسالة
  IF v_car.status != 'available' THEN
    v_is_available := false;
    v_message := 'السيارة غير متاحة للحجز';
  ELSIF v_actual_available <= 0 THEN
    v_is_available := false;
    v_message := 'لا توجد كمية متاحة في هذه الفترة';
  ELSE
    v_is_available := true;
    v_message := format('متاح %s من أصل %s', v_actual_available, v_car.quantity);
  END IF;
  
  RETURN QUERY SELECT 
    v_is_available,
    v_car.quantity,
    v_car.available_quantity,
    v_actual_available,
    v_conflicting,
    v_car.status,
    v_message;
END;
$$;

COMMENT ON FUNCTION public.check_car_availability_detailed IS 
'التحقق من توفر السيارة مع تفاصيل كاملة عن الكمية والحجوزات';

-- ============================================
-- 5. search_user_bookings - بحث في الحجوزات
-- ============================================

CREATE OR REPLACE FUNCTION public.search_user_bookings(
  p_search_query TEXT,
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  status booking_status,
  start_date DATE,
  end_date DATE,
  final_amount NUMERIC,
  car_info TEXT,
  branch_info TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;
  
  RETURN QUERY
  SELECT 
    b.id,
    b.status,
    b.start_date,
    b.end_date,
    b.final_amount,
    (cb.name_ar || ' ' || cm.name_ar || ' ' || cm.year::TEXT) as car_info,
    br.name_ar as branch_info,
    b.created_at
  FROM bookings b
  LEFT JOIN cars c ON b.car_id = c.id
  LEFT JOIN car_models cm ON c.model_id = cm.id
  LEFT JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN branches br ON b.branch_id = br.id
  WHERE b.customer_id = v_user_id
    AND (
      p_search_query IS NULL
      OR cb.name_ar ILIKE '%' || p_search_query || '%'
      OR cb.name_en ILIKE '%' || p_search_query || '%'
      OR cm.name_ar ILIKE '%' || p_search_query || '%'
      OR cm.name_en ILIKE '%' || p_search_query || '%'
      OR br.name_ar ILIKE '%' || p_search_query || '%'
      OR br.name_en ILIKE '%' || p_search_query || '%'
      OR b.payment_reference ILIKE '%' || p_search_query || '%'
    )
  ORDER BY b.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.search_user_bookings IS 
'البحث في حجوزات المستخدم بالاسم أو رقم المرجع';

-- ========================================================================
-- ✅ الدوال جاهزة!
-- ========================================================================


than we 


-- ========================================================================
-- RLS Policies لجدول الحجوزات (bookings)
-- ========================================================================

-- 1️⃣ حذف الـ Policies القديمة (لتجنب التعارض)
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Branch managers can view branch bookings" ON public.bookings;
DROP POLICY IF EXISTS "Branch managers can update branch bookings" ON public.bookings;

-- ========================================================================
-- 2️⃣ Policies الجديدة المحسّنة
-- ========================================================================

-- 📖 SELECT: من يستطيع قراءة الحجوزات
DROP POLICY IF EXISTS "View bookings policy" ON public.bookings;
CREATE POLICY "View bookings policy" ON public.bookings
FOR SELECT USING (
  customer_id = auth.uid()  -- ✅ العميل يرى حجوزاته
  OR is_admin()             -- ✅ المسؤول يرى كل الحجوزات
  OR (
    is_branch_manager()     -- ✅ مدير الفرع يرى حجوزات فرعه فقط
    AND branch_id = current_user_branch_id()
  )
);

-- ➕ INSERT: من يستطيع إنشاء حجوزات
DROP POLICY IF EXISTS "Create bookings policy" ON public.bookings;
CREATE POLICY "Create bookings policy" ON public.bookings
FOR INSERT WITH CHECK (
  customer_id = auth.uid()  -- ✅ العميل ينشئ حجوزات باسمه فقط
  OR is_admin()             -- ✅ المسؤول ينشئ حجوزات لأي أحد
  OR is_branch_manager()    -- ✅ مدير الفرع ينشئ حجوزات لعملاء فرعه
);

-- ✏️ UPDATE: من يستطيع تحديث الحجوزات
DROP POLICY IF EXISTS "Update bookings policy" ON public.bookings;
CREATE POLICY "Update bookings policy" ON public.bookings
FOR UPDATE USING (
  -- العميل يستطيع تحديث حجوزاته في حالات معينة
  (
    customer_id = auth.uid()
    AND status IN ('pending', 'confirmed', 'payment_pending')  -- ✅ فقط قبل التفعيل
  )
  OR is_admin()  -- ✅ المسؤول يعدل كل شيء
  OR (
    is_branch_manager()  -- ✅ مدير الفرع يعدل حجوزات فرعه
    AND branch_id = current_user_branch_id()
  )
)
WITH CHECK (
  -- التأكد أن التحديث لا يغير البيانات الحساسة
  (
    customer_id = auth.uid()  -- العميل لا يغير customer_id
    AND car_id = car_id       -- العميل لا يغير السيارة
    AND branch_id = branch_id -- العميل لا يغير الفرع
  )
  OR is_admin()  -- المسؤول يعدل أي شيء
  OR (
    is_branch_manager()
    AND branch_id = current_user_branch_id()
  )
);

-- 🗑️ DELETE: من يستطيع حذف الحجوزات
DROP POLICY IF EXISTS "Delete bookings policy" ON public.bookings;
CREATE POLICY "Delete bookings policy" ON public.bookings
FOR DELETE USING (
  is_admin()  -- ✅ فقط المسؤول يحذف الحجوزات
);

-- ========================================================================
-- 3️⃣ Policies إضافية للعمليات الخاصة
-- ========================================================================

-- 🚫 إلغاء الحجز من العميل (باستخدام الدالة customer_cancel_booking)
-- لا نحتاج policy خاصة لأن UPDATE policy تسمح بذلك

-- ✅ موافقة/رفض الحجز من الفرع (باستخدام approve_booking / reject_booking)
-- لا نحتاج policy خاصة لأن UPDATE policy تسمح بذلك

-- ========================================================================
-- 4️⃣ Policy لعرض تفاصيل الحجز الموسّعة
-- ========================================================================

-- ملاحظة: get_booking_details() دالة وليست policy
-- لكن تستخدم نفس القيود الأمنية داخلياً

COMMENT ON POLICY "View bookings policy" ON public.bookings IS 
'العميل يرى حجوزاته فقط، المسؤول يرى كل شيء، مدير الفرع يرى حجوزات فرعه';

COMMENT ON POLICY "Create bookings policy" ON public.bookings IS 
'العميل ينشئ حجوزات باسمه، الموظفين ينشئون للعملاء';

COMMENT ON POLICY "Update bookings policy" ON public.bookings IS 
'العميل يعدل حجوزاته قبل التفعيل، الموظفين يعدلون حجوزات فرعهم';

COMMENT ON POLICY "Delete bookings policy" ON public.bookings IS 
'فقط المسؤول يحذف الحجوزات بشكل نهائي';

-- ========================================================================
-- ✅ اكتمل - الـ Policies جاهزة!
-- ========================================================================


than we add andfix

-- ========================================================================
-- إصلاح دالة get_booking_full_details
-- ========================================================================

DROP FUNCTION IF EXISTS public.get_booking_full_details(UUID);

CREATE OR REPLACE FUNCTION public.get_booking_full_details(
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSONB;
  v_booking RECORD;
  v_car JSONB;
  v_branch JSONB;
  v_approver JSONB;
BEGIN
  -- ✅ جلب معلومات الحجز
  SELECT 
    b.id,
    b.customer_id,
    b.car_id,
    b.branch_id,
    b.rental_type,
    b.start_date,
    b.end_date,
    b.total_days,
    b.daily_rate,
    b.total_amount,
    b.discount_amount,
    b.final_amount,
    b.status,
    b.payment_reference,
    b.approved_by,
    b.approved_at,
    b.notes,
    b.expires_at,
    b.created_at,
    b.updated_at
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id;
  
  -- ✅ التحقق من وجود الحجز
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- ✅ التحقق من الصلاحيات
  IF NOT (
    v_booking.customer_id = auth.uid()
    OR is_admin()
    OR (
      is_branch_manager() 
      AND v_booking.branch_id = current_user_branch_id()
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- ✅ جلب معلومات السيارة
  SELECT jsonb_build_object(
    'id', c.id,
    'daily_price', c.daily_price,
    'weekly_price', c.weekly_price,
    'monthly_price', c.monthly_price,
    'ownership_price', c.ownership_price,
    'seats', c.seats,
    'fuel_type', c.fuel_type,
    'transmission', c.transmission,
    'features_ar', c.features_ar,
    'features_en', c.features_en,
    'additional_images', c.additional_images,
    'status', c.status,
    'discount_percentage', c.discount_percentage,
    'offer_expires_at', c.offer_expires_at,
    'model', jsonb_build_object(
      'id', cm.id,
      'name_ar', cm.name_ar,
      'name_en', cm.name_en,
      'year', cm.year,
      'default_image_url', cm.default_image_url,
      'description_ar', cm.description_ar,
      'description_en', cm.description_en,
      'specifications', cm.specifications,
      'brand', jsonb_build_object(
        'id', cb.id,
        'name_ar', cb.name_ar,
        'name_en', cb.name_en,
        'logo_url', cb.logo_url
      )
    ),
    'color', CASE 
      WHEN cc.id IS NOT NULL THEN
        jsonb_build_object(
          'id', cc.id,
          'name_ar', cc.name_ar,
          'name_en', cc.name_en,
          'hex_code', cc.hex_code
        )
      ELSE NULL
    END
  )
  INTO v_car
  FROM cars c
  JOIN car_models cm ON c.model_id = cm.id
  JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN car_colors cc ON c.color_id = cc.id
  WHERE c.id = v_booking.car_id;
  
  -- ✅ جلب معلومات الفرع
  SELECT jsonb_build_object(
    'id', br.id,
    'name_ar', br.name_ar,
    'name_en', br.name_en,
    'location_ar', br.location_ar,
    'location_en', br.location_en,
    'phone', br.phone,
    'email', br.email,
    'working_hours', br.working_hours,
    'latitude', br.latitude,
    'longitude', br.longitude,
    'images', br.images
  )
  INTO v_branch
  FROM branches br
  WHERE br.id = v_booking.branch_id;
  
  -- ✅ جلب معلومات المُوافق إن وُجد
  IF v_booking.approved_by IS NOT NULL THEN
    SELECT jsonb_build_object(
      'user_id', p.user_id,
      'full_name', p.full_name,
      'email', p.email
    )
    INTO v_approver
    FROM profiles p
    WHERE p.user_id = v_booking.approved_by;
  ELSE
    v_approver := NULL;
  END IF;
  
  -- ✅ تجميع النتيجة النهائية
  v_result := jsonb_build_object(
    'id', v_booking.id,
    'customer_id', v_booking.customer_id,
    'car_id', v_booking.car_id,
    'branch_id', v_booking.branch_id,
    'rental_type', v_booking.rental_type,
    'start_date', v_booking.start_date,
    'end_date', v_booking.end_date,
    'total_days', v_booking.total_days,
    'daily_rate', v_booking.daily_rate,
    'total_amount', v_booking.total_amount,
    'discount_amount', v_booking.discount_amount,
    'final_amount', v_booking.final_amount,
    'status', v_booking.status,
    'payment_reference', v_booking.payment_reference,
    'approved_by', v_booking.approved_by,
    'approved_at', v_booking.approved_at,
    'notes', v_booking.notes,
    'expires_at', v_booking.expires_at,
    'created_at', v_booking.created_at,
    'updated_at', v_booking.updated_at,
    'car', v_car,
    'branch', v_branch,
    'approved_by_user', v_approver
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_booking_full_details IS 
'جلب تفاصيل حجز واحد بشكل كامل - يرجع JSONB واحد';


we add this logic also

-- ========================================================================
-- نظام الدفع المحسّن - Payment System v2
-- ========================================================================

-- ============================================
-- 1. validate_and_prepare_booking_for_payment
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_and_prepare_booking_for_payment(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  is_valid BOOLEAN,
  booking_data JSONB,
  error_code TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_booking RECORD;
  v_result JSONB;
BEGIN
  -- ============================================
  -- STEP 1: Fetch and lock booking
  -- ============================================
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id
    AND customer_id = p_user_id
  FOR UPDATE; -- 🔒 Lock for concurrent safety
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false,
      NULL::JSONB,
      'BOOKING_NOT_FOUND'::TEXT,
      'الحجز غير موجود أو ليس لديك صلاحية الوصول'::TEXT;
    RETURN;
  END IF;
  
  -- ============================================
  -- STEP 2: Validate status - pending
  -- ============================================
  IF v_booking.status = 'pending' THEN
    RETURN QUERY SELECT 
      false,
      NULL::JSONB,
      'PENDING_APPROVAL'::TEXT,
      'الحجز في انتظار موافقة الفرع. لا يمكن الدفع حالياً'::TEXT;
    RETURN;
  END IF;
  
  -- ============================================
  -- STEP 3: Validate status - invalid states
  -- ============================================
  IF v_booking.status IN ('cancelled', 'expired', 'completed', 'active') THEN
    RETURN QUERY SELECT 
      false,
      NULL::JSONB,
      'INVALID_STATUS'::TEXT,
      format('لا يمكن الدفع للحجز بحالة: %s', v_booking.status)::TEXT;
    RETURN;
  END IF;
  
  -- ============================================
  -- STEP 4: Validate status - must be confirmed or payment_pending
  -- ============================================
  IF v_booking.status NOT IN ('confirmed', 'payment_pending') THEN
    RETURN QUERY SELECT 
      false,
      NULL::JSONB,
      'INVALID_STATUS'::TEXT,
      format('حالة الحجز غير صالحة للدفع: %s', v_booking.status)::TEXT;
    RETURN;
  END IF;
  
  -- ============================================
  -- STEP 5: Check expiration
  -- ============================================
  IF v_booking.expires_at IS NOT NULL 
     AND v_booking.expires_at < NOW() THEN
    -- Mark as expired if not already
    IF v_booking.status != 'expired' THEN
      UPDATE bookings 
      SET status = 'expired', updated_at = NOW()
      WHERE id = p_booking_id;
    END IF;
    
    RETURN QUERY SELECT 
      false,
      NULL::JSONB,
      'BOOKING_EXPIRED'::TEXT,
      'انتهت صلاحية الحجز'::TEXT;
    RETURN;
  END IF;
  
  -- ============================================
  -- STEP 6: Build response with all needed data
  -- ============================================
  SELECT jsonb_build_object(
    'booking', jsonb_build_object(
      'id', v_booking.id,
      'customer_id', v_booking.customer_id,
      'car_id', v_booking.car_id,
      'branch_id', v_booking.branch_id,
      'status', v_booking.status,
      'final_amount', v_booking.final_amount,
      'start_date', v_booking.start_date,
      'end_date', v_booking.end_date
    ),
    'car', (
      SELECT jsonb_build_object(
        'id', c.id,
        'model', jsonb_build_object(
          'name_ar', cm.name_ar,
          'name_en', cm.name_en,
          'brand', jsonb_build_object(
            'name_ar', cb.name_ar,
            'name_en', cb.name_en
          )
        )
      )
      FROM cars c
      JOIN car_models cm ON c.model_id = cm.id
      JOIN car_brands cb ON cm.brand_id = cb.id
      WHERE c.id = v_booking.car_id
    ),
    'branch', (
      SELECT jsonb_build_object(
        'id', br.id,
        'name_ar', br.name_ar,
        'name_en', br.name_en,
        'manager_id', br.manager_id
      )
      FROM branches br
      WHERE br.id = v_booking.branch_id
    ),
    'current_status', v_booking.status,
    'needs_status_update', (v_booking.status = 'confirmed')
  ) INTO v_result;
  
  -- ============================================
  -- STEP 7: Return success
  -- ============================================
  RETURN QUERY SELECT 
    true,
    v_result,
    NULL::TEXT,
    NULL::TEXT;
END;
$$;

COMMENT ON FUNCTION public.validate_and_prepare_booking_for_payment IS 
'التحقق الشامل من صلاحية الحجز للدفع وإرجاع كل البيانات المطلوبة';

-- ============================================
-- 2. update_booking_to_payment_pending
-- ============================================

CREATE OR REPLACE FUNCTION public.update_booking_to_payment_pending(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  new_expires_at TIMESTAMPTZ,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_status booking_status;
  v_new_expires_at TIMESTAMPTZ;
BEGIN
  -- Get current status
  SELECT status INTO v_current_status
  FROM bookings
  WHERE id = p_booking_id
    AND customer_id = p_user_id
  FOR UPDATE; -- Lock
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMPTZ, 'الحجز غير موجود'::TEXT;
    RETURN;
  END IF;
  
  -- Only update if status is 'confirmed'
  IF v_current_status = 'confirmed' THEN
    v_new_expires_at := NOW() + INTERVAL '30 minutes';
    
    UPDATE bookings
    SET 
      status = 'payment_pending',
      expires_at = v_new_expires_at,
      updated_at = NOW()
    WHERE id = p_booking_id;
    
    RETURN QUERY SELECT 
      true, 
      v_new_expires_at, 
      'تم تحديث الحجز إلى payment_pending'::TEXT;
    RETURN;
  END IF;
  
  -- Already in payment_pending
  IF v_current_status = 'payment_pending' THEN
    SELECT expires_at INTO v_new_expires_at
    FROM bookings
    WHERE id = p_booking_id;
    
    RETURN QUERY SELECT 
      true, 
      v_new_expires_at, 
      'الحجز بالفعل في حالة payment_pending'::TEXT;
    RETURN;
  END IF;
  
  -- Invalid status
  RETURN QUERY SELECT 
    false, 
    NULL::TIMESTAMPTZ, 
    format('حالة غير صالحة: %s', v_current_status)::TEXT;
END;
$$;

COMMENT ON FUNCTION public.update_booking_to_payment_pending IS 
'تحديث الحجز إلى payment_pending مع مهلة 30 دقيقة';

-- ============================================
-- 3. complete_booking_payment_transaction
-- ============================================

CREATE OR REPLACE FUNCTION public.complete_booking_payment_transaction(
  p_booking_id UUID,
  p_payment_reference TEXT,
  p_user_id UUID,
  p_booking_data JSONB
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_branch_manager_id UUID;
  v_final_amount NUMERIC;
BEGIN
  -- ============================================
  -- STEP 1: Update booking to active
  -- ============================================
  UPDATE bookings
  SET 
    status = 'active',
    payment_reference = p_payment_reference,
    expires_at = NULL,
    updated_at = NOW()
  WHERE id = p_booking_id
    AND customer_id = p_user_id
  RETURNING 
    (SELECT manager_id FROM branches WHERE id = branch_id),
    final_amount
  INTO v_branch_manager_id, v_final_amount;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'فشل تحديث الحجز'::TEXT;
    RETURN;
  END IF;
  
  -- ============================================
  -- STEP 2: Send customer notification
  -- ============================================
  BEGIN
    PERFORM send_notification(
      p_user_id,
      'تم تأكيد الحجز ✅',
      'Booking Confirmed ✅',
      format('تم الدفع بنجاح. حجزك الآن نشط. رقم المرجع: %s', p_payment_reference),
      format('Payment successful. Your booking is now active. Reference: %s', p_payment_reference),
      'booking_update',
      jsonb_build_object(
        'booking_id', p_booking_id,
        'payment_reference', p_payment_reference
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail
    RAISE WARNING 'Failed to send customer notification: %', SQLERRM;
  END;
  
  -- ============================================
  -- STEP 3: Send branch manager notification
  -- ============================================
  IF v_branch_manager_id IS NOT NULL THEN
    BEGIN
      PERFORM send_notification(
        v_branch_manager_id,
        'حجز جديد نشط 🎉',
        'New Active Booking 🎉',
        format('تم تأكيد دفع حجز جديد. رقم المرجع: %s', p_payment_reference),
        format('New booking payment confirmed. Reference: %s', p_payment_reference),
        'booking_update',
        jsonb_build_object(
          'booking_id', p_booking_id,
          'payment_reference', p_payment_reference,
          'customer_id', p_user_id
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send manager notification: %', SQLERRM;
    END;
  END IF;
  
  -- ============================================
  -- STEP 4: Log security event
  -- ============================================
  BEGIN
    PERFORM log_security_event(
      'payment_completed',
      p_user_id,
      p_booking_id::TEXT,
      jsonb_build_object(
        'booking_id', p_booking_id,
        'payment_reference', p_payment_reference,
        'amount', v_final_amount,
        'timestamp', NOW()
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to log security event: %', SQLERRM;
  END;
  
  RETURN QUERY SELECT true, 'تم إكمال الدفع بنجاح'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.complete_booking_payment_transaction IS 
'إكمال عملية الدفع - تحديث الحجز وإرسال الإشعارات وتسجيل الأحداث';

-- ============================================
-- 4. handle_payment_failure_transaction
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_payment_failure_transaction(
  p_booking_id UUID,
  p_user_id UUID,
  p_error_message TEXT,
  p_payment_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_expires_at TIMESTAMPTZ,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_status booking_status;
  v_new_expires_at TIMESTAMPTZ;
BEGIN
  -- Get current status
  SELECT status INTO v_current_status
  FROM bookings
  WHERE id = p_booking_id
    AND customer_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMPTZ, 'الحجز غير موجود'::TEXT;
    RETURN;
  END IF;
  
  -- Only revert if in payment_pending
  IF v_current_status = 'payment_pending' THEN
    v_new_expires_at := NOW() + INTERVAL '24 hours';
    
    UPDATE bookings
    SET 
      status = 'confirmed',
      expires_at = v_new_expires_at,
      updated_at = NOW()
    WHERE id = p_booking_id;
    
    -- Send notification
    BEGIN
      PERFORM send_notification(
        p_user_id,
        'فشل الدفع ❌',
        'Payment Failed ❌',
        format(
          'فشل الدفع: %s. يمكنك إعادة المحاولة خلال 24 ساعة',
          COALESCE(p_error_message, 'خطأ غير معروف')
        ),
        format(
          'Payment failed: %s. You can retry within 24 hours',
          COALESCE(p_error_message, 'Unknown error')
        ),
        'warning',
        jsonb_build_object(
          'booking_id', p_booking_id,
          'payment_id', p_payment_id,
          'error', p_error_message
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send notification: %', SQLERRM;
    END;
    
    -- Log security event
    BEGIN
      PERFORM log_security_event(
        'payment_failed',
        p_user_id,
        p_booking_id::TEXT,
        jsonb_build_object(
          'booking_id', p_booking_id,
          'payment_id', p_payment_id,
          'error_message', p_error_message,
          'timestamp', NOW()
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to log security event: %', SQLERRM;
    END;
    
    RETURN QUERY SELECT 
      true, 
      v_new_expires_at, 
      'تمت معالجة فشل الدفع وإعادة الحجز إلى confirmed'::TEXT;
    RETURN;
  END IF;
  
  -- Status not payment_pending
  RETURN QUERY SELECT 
    false, 
    NULL::TIMESTAMPTZ, 
    format('لا يمكن معالجة الفشل - الحالة الحالية: %s', v_current_status)::TEXT;
END;
$$;

COMMENT ON FUNCTION public.handle_payment_failure_transaction IS 
'معالجة فشل الدفع - إعادة الحجز إلى confirmed مع 24 ساعة جديدة';

-- ========================================================================
-- ✅ دوال الدفع الشاملة جاهزة!
-- ========================================================================


we add  these 

-- ========================================================================
-- دالة جديدة: get_booking_for_payment_check
-- ========================================================================

CREATE OR REPLACE FUNCTION public.get_booking_for_payment_check(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- ============================================
  -- التحقق البسيط: فقط وجود الحجز والملكية
  -- ============================================
  SELECT jsonb_build_object(
    'booking', jsonb_build_object(
      'id', b.id,
      'customer_id', b.customer_id,
      'car_id', b.car_id,
      'branch_id', b.branch_id,
      'status', b.status,
      'final_amount', b.final_amount
    ),
    'car', jsonb_build_object(
      'id', c.id,
      'model', jsonb_build_object(
        'name_ar', cm.name_ar,
        'name_en', cm.name_en,
        'brand', jsonb_build_object(
          'name_ar', cb.name_ar,
          'name_en', cb.name_en
        )
      )
    ),
    'branch', jsonb_build_object(
      'id', br.id,
      'name_ar', br.name_ar,
      'name_en', br.name_en,
      'manager_id', br.manager_id
    ),
    'current_status', b.status
  )
  INTO v_result
  FROM bookings b
  LEFT JOIN cars c ON b.car_id = c.id
  LEFT JOIN car_models cm ON c.model_id = cm.id
  LEFT JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN branches br ON b.branch_id = br.id
  WHERE b.id = p_booking_id
    AND b.customer_id = p_user_id;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Booking not found or unauthorized';
  END IF;
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_booking_for_payment_check IS 
'التحقق البسيط من وجود الحجز - للاستخدام في check-payment-status';



than we add

-- ==========================================================
-- ✅ Function: update_user_location
-- ✅ Schema: LEAGO Car Rental System
-- ✅ الهدف: تحديث موقع المستخدم وإحداثياته فقط
-- ==========================================================

CREATE OR REPLACE FUNCTION public.update_user_location(
  _location TEXT,
  _user_latitude DECIMAL(10,8),
  _user_longitude DECIMAL(11,8)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    location = COALESCE(_location, location),
    user_latitude = COALESCE(_user_latitude, user_latitude),
    user_longitude = COALESCE(_user_longitude, user_longitude),
    location_updated_at = NOW(),
    updated_at = NOW()
  WHERE user_id = auth.uid();
END;
$$;



we do this 

-- ========================================================================
-- دوال BookingScreen المحسّنة
-- ========================================================================

-- ============================================
-- 1. get_car_for_booking - جلب بيانات السيارة للحجز
-- ============================================

CREATE OR REPLACE FUNCTION public.get_car_for_booking(
  p_car_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'car_id', c.id,
    'status', c.status,
    'is_available', (c.status = 'available'),
    'daily_price', c.daily_price,
    'weekly_price', c.weekly_price,
    'monthly_price', c.monthly_price,
    'discount_percentage', c.discount_percentage,
    'offer_expires_at', c.offer_expires_at,
    'is_new', c.is_new,
    'seats', c.seats,
    'fuel_type', c.fuel_type,
    'transmission', c.transmission,
    'branch_id', c.branch_id,
    'additional_images', c.additional_images,
    'description_ar', c.description_ar,
    'description_en', c.description_en,
    'features_ar', c.features_ar,
    'features_en', c.features_en,
    'rental_types', c.rental_types,
    
    'brand', jsonb_build_object(
      'name_ar', cb.name_ar,
      'name_en', cb.name_en,
      'logo_url', cb.logo_url
    ),
    
    'model', jsonb_build_object(
      'name_ar', cm.name_ar,
      'name_en', cm.name_en,
      'year', cm.year,
      'default_image_url', cm.default_image_url,
      'description_ar', cm.description_ar,
      'description_en', cm.description_en
    ),
    
    'color', jsonb_build_object(
      'name_ar', cc.name_ar,
      'name_en', cc.name_en,
      'hex_code', cc.hex_code
    ),
    
    'branch', jsonb_build_object(
      'id', br.id,
      'name_ar', br.name_ar,
      'name_en', br.name_en,
      'location_ar', br.location_ar,
      'location_en', br.location_en,
      'phone', br.phone,
      'working_hours', br.working_hours
    )
  )
  INTO v_result
  FROM cars c
  JOIN car_models cm ON c.model_id = cm.id
  JOIN car_brands cb ON cm.brand_id = cb.id
  LEFT JOIN car_colors cc ON c.color_id = cc.id
  JOIN branches br ON c.branch_id = br.id
  WHERE c.id = p_car_id
    AND c.status = 'available';
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Car not found or not available';
  END IF;
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_car_for_booking IS 
'جلب بيانات السيارة الكاملة للحجز مع كل التفاصيل';

-- ============================================
-- 2. calculate_booking_price_preview - حساب السعر المتوقع
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_booking_price_preview(
  p_car_id UUID,
  p_rental_type rental_type,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  base_price NUMERIC,
  total_days INTEGER,
  discount_percentage NUMERIC,
  discount_amount NUMERIC,
  final_price NUMERIC,
  price_per_unit NUMERIC,
  offer_valid BOOLEAN,
  offer_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_car RECORD;
  v_total_days INTEGER;
  v_base_price NUMERIC;
  v_discount_amount NUMERIC;
  v_offer_valid BOOLEAN;
BEGIN
  -- جلب بيانات السيارة
  SELECT 
    c.daily_price,
    c.weekly_price,
    c.monthly_price,
    c.discount_percentage,
    c.offer_expires_at
  INTO v_car
  FROM cars c
  WHERE c.id = p_car_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Car not found';
  END IF;
  
  -- حساب عدد الأيام
  v_total_days := GREATEST(1, (p_end_date - p_start_date));
  
  -- تحديد السعر الأساسي
  CASE p_rental_type
    WHEN 'daily' THEN
      v_base_price := v_car.daily_price * v_total_days;
      
    WHEN 'weekly' THEN
      v_base_price := COALESCE(v_car.weekly_price, v_car.daily_price * 7);
      
    WHEN 'monthly' THEN
      v_base_price := COALESCE(v_car.monthly_price, v_car.daily_price * 30);
      
    ELSE
      RAISE EXCEPTION 'Invalid rental type';
  END CASE;
  
  -- التحقق من صلاحية العرض
  v_offer_valid := (
    v_car.discount_percentage > 0 
    AND (
      v_car.offer_expires_at IS NULL 
      OR v_car.offer_expires_at > NOW()
    )
  );
  
  -- حساب الخصم
  IF v_offer_valid THEN
    v_discount_amount := v_base_price * v_car.discount_percentage / 100;
  ELSE
    v_discount_amount := 0;
  END IF;
  
  RETURN QUERY SELECT
    v_base_price,
    v_total_days,
    CASE WHEN v_offer_valid THEN v_car.discount_percentage ELSE 0 END,
    v_discount_amount,
    v_base_price - v_discount_amount,
    v_base_price / v_total_days,
    v_offer_valid,
    v_car.offer_expires_at;
END;
$$;

COMMENT ON FUNCTION public.calculate_booking_price_preview IS 
'حساب السعر المتوقع للحجز مع الخصومات - للعرض فقط';

-- ============================================
-- 3. get_user_booking_eligibility - التحقق من أهلية المستخدم
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_booking_eligibility(
  p_user_id UUID
)
RETURNS TABLE(
  is_eligible BOOLEAN,
  reason_code TEXT,
  reason_message_ar TEXT,
  reason_message_en TEXT,
  user_profile JSONB,
  documents_status JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_profile RECORD;
  v_is_verified BOOLEAN;
  v_documents JSONB;
  v_has_approved_docs BOOLEAN;
  v_has_pending_docs BOOLEAN;
BEGIN
  -- جلب بيانات المستخدم
  SELECT 
    full_name,
    email,
    phone,
    age,
    gender
  INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      false,
      'USER_NOT_FOUND'::TEXT,
      'المستخدم غير موجود'::TEXT,
      'User not found'::TEXT,
      NULL::JSONB,
      NULL::JSONB;
    RETURN;
  END IF;
  
  -- التحقق من التوثيق
  SELECT is_user_verified(p_user_id) INTO v_is_verified;
  
  -- جلب حالة المستندات
  SELECT 
    jsonb_build_object(
      'total', COUNT(*),
      'approved', COUNT(*) FILTER (WHERE status = 'approved'),
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
    )
  INTO v_documents
  FROM documents
  WHERE user_id = p_user_id;
  
  v_has_approved_docs := (v_documents->>'approved')::INTEGER > 0;
  v_has_pending_docs := (v_documents->>'pending')::INTEGER > 0;
  
  -- تحديد الأهلية
  IF NOT v_has_approved_docs AND NOT v_has_pending_docs THEN
    RETURN QUERY SELECT
      false,
      'DOCUMENTS_REQUIRED'::TEXT,
      'يجب رفع المستندات المطلوبة'::TEXT,
      'Required documents must be uploaded'::TEXT,
      jsonb_build_object(
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'phone', v_profile.phone
      ),
      v_documents;
    RETURN;
  END IF;
  
  IF v_has_pending_docs AND NOT v_has_approved_docs THEN
    RETURN QUERY SELECT
      false,
      'DOCUMENTS_PENDING'::TEXT,
      'مستنداتك قيد المراجعة'::TEXT,
      'Your documents are under review'::TEXT,
      jsonb_build_object(
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'phone', v_profile.phone
      ),
      v_documents;
    RETURN;
  END IF;
  
  IF NOT v_is_verified THEN
    RETURN QUERY SELECT
      false,
      'VERIFICATION_REQUIRED'::TEXT,
      'يجب التحقق من هويتك'::TEXT,
      'Identity verification required'::TEXT,
      jsonb_build_object(
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'phone', v_profile.phone
      ),
      v_documents;
    RETURN;
  END IF;
  
  -- المستخدم مؤهل
  RETURN QUERY SELECT
    true,
    'ELIGIBLE'::TEXT,
    'يمكنك إتمام الحجز'::TEXT,
    'You can complete the booking'::TEXT,
    jsonb_build_object(
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'age', v_profile.age,
      'gender', v_profile.gender
    ),
    v_documents;
END;
$$;

COMMENT ON FUNCTION public.get_user_booking_eligibility IS 
'التحقق الشامل من أهلية المستخدم للحجز';

-- ============================================
-- 4. validate_booking_dates - التحقق من صحة التواريخ
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_booking_dates(
  p_start_date DATE,
  p_end_date DATE,
  p_min_days INTEGER DEFAULT 1
)
RETURNS TABLE(
  is_valid BOOLEAN,
  error_code TEXT,
  error_message_ar TEXT,
  error_message_en TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_today DATE;
  v_total_days INTEGER;
BEGIN
  v_today := CURRENT_DATE;
  v_total_days := p_end_date - p_start_date;
  
  -- التحقق: البداية في الماضي
  IF p_start_date < v_today THEN
    RETURN QUERY SELECT
      false,
      'PAST_DATE'::TEXT,
      'لا يمكن الحجز في الماضي'::TEXT,
      'Cannot book in the past'::TEXT;
    RETURN;
  END IF;
  
  -- التحقق: النهاية قبل أو تساوي البداية
  IF p_end_date <= p_start_date THEN
    RETURN QUERY SELECT
      false,
      'INVALID_DATE_RANGE'::TEXT,
      'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'::TEXT,
      'End date must be after start date'::TEXT;
    RETURN;
  END IF;
  
  -- التحقق: أقل من الحد الأدنى
  IF v_total_days < p_min_days THEN
    RETURN QUERY SELECT
      false,
      'MIN_DAYS_NOT_MET'::TEXT,
      format('الحد الأدنى للحجز هو %s يوم', p_min_days)::TEXT,
      format('Minimum booking is %s days', p_min_days)::TEXT;
    RETURN;
  END IF;
  
  -- صحيح
  RETURN QUERY SELECT
    true,
    'VALID'::TEXT,
    'التواريخ صحيحة'::TEXT,
    'Dates are valid'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.validate_booking_dates IS 
'التحقق من صحة تواريخ الحجز';

-- ========================================================================
-- ✅ دوال BookingScreen جاهزة!
-- ========================================================================

than we do this

-- ========================================================================
-- calculate_booking_price_preview_v2 - متطابقة مع create_booking_atomic
-- ========================================================================

DROP FUNCTION IF EXISTS public.calculate_booking_price_preview(UUID, rental_type, DATE, DATE);

CREATE OR REPLACE FUNCTION public.calculate_booking_price_preview(
  p_car_id UUID,
  p_rental_type rental_type,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  base_price NUMERIC,              -- السعر الأساسي للوحدة (يوم/أسبوع/شهر)
  total_days INTEGER,              -- إجمالي الأيام
  discount_percentage NUMERIC,     -- نسبة الخصم
  discount_amount NUMERIC,         -- مبلغ الخصم الإجمالي
  total_amount NUMERIC,            -- المبلغ الإجمالي قبل الخصم
  final_price NUMERIC,             -- السعر النهائي بعد الخصم
  price_per_unit NUMERIC,          -- السعر للوحدة بعد الخصم
  offer_valid BOOLEAN,             -- هل العرض ساري؟
  offer_expires_at TIMESTAMPTZ,    -- تاريخ انتهاء العرض
  calculation_details JSONB        -- تفاصيل الحساب
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_car RECORD;
  v_total_days INTEGER;
  v_base_price NUMERIC;                    -- السعر الأساسي للوحدة
  v_car_discount_amount NUMERIC := 0;     -- خصم السيارة للوحدة
  v_price_after_car_discount NUMERIC;     -- السعر بعد خصم السيارة
  v_total_amount NUMERIC;                 -- المبلغ الإجمالي
  v_total_discount NUMERIC := 0;          -- إجمالي الخصم
  v_final_amount NUMERIC;                 -- المبلغ النهائي
  v_actual_rate NUMERIC;                  -- السعر الفعلي المستخدم
  v_apply_discount BOOLEAN := false;      -- هل نطبق الخصم؟
  v_full_periods INTEGER;
  v_remaining_days INTEGER;
  v_details JSONB;
BEGIN
  -- ============================================
  -- 1. جلب بيانات السيارة
  -- ============================================
  SELECT 
    c.daily_price,
    c.weekly_price,
    c.monthly_price,
    c.ownership_price,
    c.discount_percentage,
    c.offer_expires_at,
    c.rental_types
  INTO v_car
  FROM cars c
  WHERE c.id = p_car_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Car not found';
  END IF;
  
  -- التحقق من نوع الإيجار
  IF NOT (p_rental_type = ANY(v_car.rental_types)) THEN
    RAISE EXCEPTION 'Rental type % not allowed for this car', p_rental_type;
  END IF;
  
  -- ============================================
  -- 2. حساب عدد الأيام
  -- ============================================
  v_total_days := GREATEST(1, (p_end_date - p_start_date));
  
  -- ============================================
  -- 3. اختيار السعر الأساسي
  -- ============================================
  CASE p_rental_type
    WHEN 'daily' THEN
      v_base_price := v_car.daily_price;
      
    WHEN 'weekly' THEN
      v_base_price := COALESCE(v_car.weekly_price, v_car.daily_price * 7);
      
    WHEN 'monthly' THEN
      v_base_price := COALESCE(v_car.monthly_price, v_car.daily_price * 30);
      
    WHEN 'ownership' THEN
      IF v_car.ownership_price IS NULL THEN
        RAISE EXCEPTION 'Ownership price not available for this car';
      END IF;
      v_base_price := v_car.ownership_price;
      
    ELSE
      RAISE EXCEPTION 'Invalid rental type: %', p_rental_type;
  END CASE;
  
  -- ============================================
  -- 4. تحديد هل نطبق الخصم
  -- ============================================
  -- التمليك: لا يُطبق عليه خصم السيارة
  IF p_rental_type != 'ownership' AND v_car.discount_percentage > 0 THEN
    -- التحقق من صلاحية العرض
    -- NULL = عرض دائم
    IF v_car.offer_expires_at IS NULL OR v_car.offer_expires_at >= NOW() THEN
      v_apply_discount := true;
      v_car_discount_amount := v_base_price * v_car.discount_percentage / 100;
      v_price_after_car_discount := v_base_price - v_car_discount_amount;
    ELSE
      -- العرض منتهي
      v_apply_discount := false;
      v_price_after_car_discount := v_base_price;
      v_car_discount_amount := 0;
    END IF;
  ELSE
    -- لا يوجد خصم (تمليك أو discount_percentage = 0)
    v_apply_discount := false;
    v_price_after_car_discount := v_base_price;
    v_car_discount_amount := 0;
  END IF;
  
  -- السعر الفعلي المستخدم
  v_actual_rate := v_price_after_car_discount;
  
  -- ============================================
  -- 5. حساب المبلغ الإجمالي (النظام المرن)
  -- ============================================
  CASE p_rental_type
    -- ========================================
    -- يومي: بسيط
    -- ========================================
    WHEN 'daily' THEN
      v_total_amount := v_actual_rate * v_total_days;
      IF v_apply_discount THEN
        v_total_discount := v_car_discount_amount * v_total_days;
      END IF;
      
      v_details := jsonb_build_object(
        'type', 'daily',
        'total_days', v_total_days,
        'rate_per_day', v_actual_rate,
        'calculation', format('%s × %s = %s', v_actual_rate, v_total_days, v_total_amount)
      );
      
    -- ========================================
    -- أسبوعي: مع معالجة الأيام الزائدة
    -- ========================================
    WHEN 'weekly' THEN
      IF v_total_days <= 7 THEN
        -- أسبوع واحد أو أقل
        v_total_amount := v_actual_rate;
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount;
        END IF;
        
        v_details := jsonb_build_object(
          'type', 'weekly',
          'total_days', v_total_days,
          'full_weeks', 1,
          'rate_per_week', v_actual_rate,
          'calculation', format('أسبوع واحد = %s', v_total_amount)
        );
      ELSE
        -- أكثر من أسبوع
        v_full_periods := FLOOR(v_total_days / 7);
        v_remaining_days := v_total_days % 7;
        
        -- الأسابيع الكاملة
        v_total_amount := v_actual_rate * v_full_periods;
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount * v_full_periods;
        END IF;
        
        -- الأيام الزائدة
        IF v_remaining_days > 0 THEN
          IF v_remaining_days <= 3 THEN
            -- حساب يومي (بدون خصم)
            v_total_amount := v_total_amount + (v_car.daily_price * v_remaining_days);
            
            v_details := jsonb_build_object(
              'type', 'weekly',
              'total_days', v_total_days,
              'full_weeks', v_full_periods,
              'remaining_days', v_remaining_days,
              'remaining_calculation', 'daily',
              'calculation', format('%s أسابيع × %s + %s أيام × %s = %s',
                v_full_periods, v_actual_rate, v_remaining_days, v_car.daily_price, v_total_amount)
            );
          ELSE
            -- أسبوع كامل إضافي (مع خصم)
            v_total_amount := v_total_amount + v_actual_rate;
            IF v_apply_discount THEN
              v_total_discount := v_total_discount + v_car_discount_amount;
            END IF;
            
            v_details := jsonb_build_object(
              'type', 'weekly',
              'total_days', v_total_days,
              'full_weeks', v_full_periods + 1,
              'remaining_days', v_remaining_days,
              'remaining_calculation', 'weekly',
              'calculation', format('%s أسابيع × %s = %s',
                v_full_periods + 1, v_actual_rate, v_total_amount)
            );
          END IF;
        ELSE
          v_details := jsonb_build_object(
            'type', 'weekly',
            'total_days', v_total_days,
            'full_weeks', v_full_periods,
            'calculation', format('%s أسابيع × %s = %s',
              v_full_periods, v_actual_rate, v_total_amount)
          );
        END IF;
      END IF;
      
    -- ========================================
    -- شهري: مع معالجة الأيام الزائدة
    -- ========================================
    WHEN 'monthly' THEN
      IF v_total_days <= 31 THEN
        -- شهر واحد أو أقل
        v_total_amount := v_actual_rate;
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount;
        END IF;
        
        v_details := jsonb_build_object(
          'type', 'monthly',
          'total_days', v_total_days,
          'full_months', 1,
          'rate_per_month', v_actual_rate,
          'calculation', format('شهر واحد = %s', v_total_amount)
        );
      ELSE
        -- أكثر من شهر
        v_full_periods := FLOOR(v_total_days / 30);
        v_remaining_days := v_total_days % 30;
        
        -- الأشهر الكاملة
        v_total_amount := v_actual_rate * v_full_periods;
        IF v_apply_discount THEN
          v_total_discount := v_car_discount_amount * v_full_periods;
        END IF;
        
        -- الأيام الزائدة
        IF v_remaining_days > 0 THEN
          IF v_remaining_days <= 15 THEN
            -- حساب يومي (بدون خصم)
            v_total_amount := v_total_amount + (v_car.daily_price * v_remaining_days);
            
            v_details := jsonb_build_object(
              'type', 'monthly',
              'total_days', v_total_days,
              'full_months', v_full_periods,
              'remaining_days', v_remaining_days,
              'remaining_calculation', 'daily',
              'calculation', format('%s أشهر × %s + %s أيام × %s = %s',
                v_full_periods, v_actual_rate, v_remaining_days, v_car.daily_price, v_total_amount)
            );
          ELSE
            -- شهر كامل إضافي (مع خصم)
            v_total_amount := v_total_amount + v_actual_rate;
            IF v_apply_discount THEN
              v_total_discount := v_total_discount + v_car_discount_amount;
            END IF;
            
            v_details := jsonb_build_object(
              'type', 'monthly',
              'total_days', v_total_days,
              'full_months', v_full_periods + 1,
              'remaining_days', v_remaining_days,
              'remaining_calculation', 'monthly',
              'calculation', format('%s أشهر × %s = %s',
                v_full_periods + 1, v_actual_rate, v_total_amount)
            );
          END IF;
        ELSE
          v_details := jsonb_build_object(
            'type', 'monthly',
            'total_days', v_total_days,
            'full_months', v_full_periods,
            'calculation', format('%s أشهر × %s = %s',
              v_full_periods, v_actual_rate, v_total_amount)
          );
        END IF;
      END IF;
      
    -- ========================================
    -- تمليك: سعر ثابت
    -- ========================================
    WHEN 'ownership' THEN
      v_total_amount := v_actual_rate;
      v_total_discount := 0;
      
      v_details := jsonb_build_object(
        'type', 'ownership',
        'total_days', v_total_days,
        'ownership_price', v_actual_rate,
        'calculation', format('سعر التمليك = %s (بدون خصم)', v_total_amount)
      );
      
    ELSE
      RAISE EXCEPTION 'Invalid rental type: %', p_rental_type;
  END CASE;
  
  -- المبلغ النهائي
  v_final_amount := v_total_amount;
  
  -- ============================================
  -- 6. إرجاع النتيجة
  -- ============================================
  RETURN QUERY SELECT
    v_base_price,                                          -- السعر الأساسي
    v_total_days,                                          -- عدد الأيام
    CASE WHEN v_apply_discount 
      THEN v_car.discount_percentage 
      ELSE 0 
    END,                                                   -- نسبة الخصم
    v_total_discount,                                      -- مبلغ الخصم
    v_total_amount + v_total_discount,                     -- المبلغ قبل الخصم
    v_final_amount,                                        -- السعر النهائي
    v_actual_rate,                                         -- السعر للوحدة
    v_apply_discount,                                      -- هل العرض ساري؟
    v_car.offer_expires_at,                                -- تاريخ انتهاء العرض
    v_details;                                             -- تفاصيل الحساب
END;
$$;

COMMENT ON FUNCTION public.calculate_booking_price_preview IS 
'حساب السعر المتوقع للحجز - متطابق مع create_booking_atomic';

-- -- ============================================
-- -- أمثلة الاستخدام
-- -- ============================================

-- -- مثال 1: شهري مع خصم دائم (31 يوم)
-- SELECT 
--   base_price AS "السعر الأساسي",
--   total_days AS "الأيام",
--   discount_percentage || '%' AS "الخصم",
--   total_amount AS "قبل الخصم",
--   discount_amount AS "مبلغ الخصم",
--   final_price AS "السعر النهائي",
--   calculation_details->>'calculation' AS "الحساب"
-- FROM calculate_booking_price_preview(
--   'CAR_ID'::UUID,
--   'monthly',
--   '2025-11-01'::DATE,
--   '2025-12-01'::DATE  -- 30 يوم
-- );

-- -- مثال 2: شهري مع أيام زائدة (45 يوم)
-- SELECT 
--   base_price AS "السعر الأساسي",
--   total_days AS "الأيام",
--   final_price AS "السعر النهائي",
--   calculation_details->>'full_months' AS "أشهر كاملة",
--   calculation_details->>'remaining_days' AS "أيام زائدة",
--   calculation_details->>'calculation' AS "الحساب"
-- FROM calculate_booking_price_preview(
--   'CAR_ID'::UUID,
--   'monthly',
--   '2025-11-01'::DATE,
--   '2025-12-15'::DATE  -- 44 يوم
-- );

-- -- مثال 3: أسبوعي مع أيام زائدة (10 أيام)
-- SELECT 
--   total_days AS "الأيام",
--   final_price AS "السعر النهائي",
--   calculation_details->>'full_weeks' AS "أسابيع كاملة",
--   calculation_details->>'remaining_days' AS "أيام زائدة",
--   calculation_details->>'calculation' AS "الحساب"
-- FROM calculate_booking_price_preview(
--   'CAR_ID'::UUID,
--   'weekly',
--   '2025-11-01'::DATE,
--   '2025-11-11'::DATE  -- 10 أيام
-- );

-- -- مثال 4: تمليك (لا خصم)
-- SELECT 
--   base_price AS "سعر التمليك",
--   discount_percentage AS "الخصم%",
--   final_price AS "السعر النهائي",
--   offer_valid AS "عرض ساري؟",
--   calculation_details->>'calculation' AS "الحساب"
-- FROM calculate_booking_price_preview(
--   'CAR_ID'::UUID,
--   'ownership',
--   '2025-11-01'::DATE,
--   '2025-12-01'::DATE
-- );

we add this


-- ========================================================================
-- إصلاح get_user_booking_eligibility - بدون is_user_verified
-- ========================================================================

DROP FUNCTION IF EXISTS public.get_user_booking_eligibility(UUID);

CREATE OR REPLACE FUNCTION public.get_user_booking_eligibility(
  p_user_id UUID
)
RETURNS TABLE(
  is_eligible BOOLEAN,
  reason_code TEXT,
  reason_message_ar TEXT,
  reason_message_en TEXT,
  user_profile JSONB,
  documents_status JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_profile RECORD;
  v_documents JSONB;
  v_has_approved_docs BOOLEAN;
  v_has_pending_docs BOOLEAN;
BEGIN
  -- جلب بيانات المستخدم
  SELECT 
    full_name,
    email,
    phone,
    age,
    gender
  INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      false,
      'USER_NOT_FOUND'::TEXT,
      'المستخدم غير موجود'::TEXT,
      'User not found'::TEXT,
      NULL::JSONB,
      NULL::JSONB;
    RETURN;
  END IF;
  
  -- جلب حالة المستندات
  SELECT 
    jsonb_build_object(
      'total', COUNT(*),
      'approved', COUNT(*) FILTER (WHERE status = 'approved'),
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
    )
  INTO v_documents
  FROM documents
  WHERE user_id = p_user_id;
  
  -- إذا لم تكن هناك مستندات، تعتبر فارغة
  IF v_documents IS NULL THEN
    v_documents := jsonb_build_object(
      'total', 0,
      'approved', 0,
      'pending', 0,
      'rejected', 0
    );
  END IF;
  
  v_has_approved_docs := (v_documents->>'approved')::INTEGER > 0;
  v_has_pending_docs := (v_documents->>'pending')::INTEGER > 0;
  
  -- ✅ تحديد الأهلية بناءً على المستندات فقط (بدون is_user_verified)
  IF NOT v_has_approved_docs AND NOT v_has_pending_docs THEN
    RETURN QUERY SELECT
      false,
      'DOCUMENTS_REQUIRED'::TEXT,
      'يجب رفع المستندات المطلوبة للحجز'::TEXT,
      'Required documents must be uploaded to book'::TEXT,
      jsonb_build_object(
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'phone', v_profile.phone
      ),
      v_documents;
    RETURN;
  END IF;
  
  IF v_has_pending_docs AND NOT v_has_approved_docs THEN
    RETURN QUERY SELECT
      false,
      'DOCUMENTS_PENDING'::TEXT,
      'مستنداتك قيد المراجعة، سيتم إشعارك عند الموافقة'::TEXT,
      'Your documents are under review, you will be notified when approved'::TEXT,
      jsonb_build_object(
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'phone', v_profile.phone
      ),
      v_documents;
    RETURN;
  END IF;
  
  -- ✅ المستخدم مؤهل (لديه مستندات موافق عليها)
  RETURN QUERY SELECT
    true,
    'ELIGIBLE'::TEXT,
    'يمكنك إتمام الحجز'::TEXT,
    'You can complete the booking'::TEXT,
    jsonb_build_object(
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'age', v_profile.age,
      'gender', v_profile.gender
    ),
    v_documents;
END;
$$;

COMMENT ON FUNCTION public.get_user_booking_eligibility IS 
'التحقق من أهلية المستخدم للحجز - بناءً على المستندات فقط';