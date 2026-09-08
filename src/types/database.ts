import type { UserRole } from "@/lib/roles";

export type Profile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyType = "RESIDENTIAL" | "COMMERCIAL";

export type PhotoType =
  | "BEFORE"
  | "AFTER"
  | "PROPERTY"
  | "DAMAGE"
  | "OTHER"
  | "DRIVEWAY"
  | "DRIVEWAY_FINISHED";

export type Property = {
  id: string;
  customer_id: string;
  name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  province: string;
  postal_code: string;
  latitude: string | number | null;
  longitude: string | number | null;
  property_type: PropertyType;
  driveway_type: string | null;
  driveway_length: string | number | null;
  driveway_width: string | number | null;
  parking_area: string | null;
  walkway_count: number;
  steps_count: number;
  snow_storage_location: string | null;
  deicing_required: boolean;
  service_preferences: string[] | null;
  roof_type: string | null;
  roof_notes: string | null;
  salt_puck_count: number;
  firewood_preferences: string[] | null;
  firewood_stack_location: string | null;
  firewood_notes: string | null;
  hazards: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
};

export type FirewoodProduct = {
  id: string;
  name: string;
  description: string | null;
  wood_type: string | null;
  seasoned: boolean;
  kiln_dried: boolean;
  quantity_unit: string;
  price: number;
  inventory_quantity: number;
  delivery_available: boolean;
  pickup_available: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  category: "SNOW" | "FIREWOOD" | "FUTURE";
  service_type: string;
  active: boolean;
  base_price: number;
  pricing_model: string;
};

export type ServiceRequestStatus =
  | "CUSTOMER_REQUESTED"
  | "ADMIN_REVIEW"
  | "APPROVED"
  | "DECLINED"
  | "CANCELLED"
  | "CONVERTED_TO_JOB";

export type FirewoodOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type BookingMode = "ADMIN_APPROVAL" | "AUTO_CONFIRM";

export type ServiceRequest = {
  id: string;
  customer_id: string;
  property_id: string;
  service_id: string;
  requested_date: string;
  preferred_time: string | null;
  status: ServiceRequestStatus;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContractType = "SEASONAL" | "MONTHLY" | "COMMERCIAL" | "CUSTOM";

export type ContractStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED";

export type Contract = {
  id: string;
  customer_id: string;
  property_id: string;
  service_id: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string | null;
  status: ContractStatus;
  price: number;
  billing_frequency: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
};

export type ContractView = Contract & {
  property_name: string;
  property_address: string;
  service_name: string;
  customer_name: string;
  customer_email: string;
};

export type FirewoodOrder = {
  id: string;
  customer_id: string;
  property_id: string;
  status: FirewoodOrderStatus;
  delivery_date: string | null;
  delivery_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type FirewoodOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type ServiceRequestView = ServiceRequest & {
  property_name: string;
  property_address: string;
  service_name: string;
  service_type: string;
  pricing_model: string;
  base_price: number;
  customer_name: string;
  customer_email: string;
};

export type FirewoodOrderView = FirewoodOrder & {
  property_name: string;
  property_address: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  quantity_unit: string;
};

export type PropertyPhoto = {
  id: string;
  property_id: string;
  uploaded_by: string | null;
  storage_path: string;
  photo_type: PhotoType;
  caption: string | null;
  created_at: string;
};

export type PropertyPhotoView = PropertyPhoto & {
  signedUrl: string | null;
};

export type JobStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type JobPriority = "NORMAL" | "HIGH" | "URGENT";

export type Job = {
  id: string;
  property_id: string;
  customer_id: string;
  service_id: string;
  assigned_crew_id: string | null;
  property_zone_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: JobStatus;
  priority: JobPriority;
  before_photo_required: boolean;
  after_photo_required: boolean;
  arrival_time: string | null;
  start_time: string | null;
  completion_time: string | null;
  crew_notes: string | null;
  customer_notes: string | null;
  weather_snapshot: unknown;
  snow_depth: string | number | null;
  created_at: string;
  updated_at: string;
};

export type JobPhoto = {
  id: string;
  job_id: string;
  property_id: string;
  uploaded_by: string | null;
  photo_type: PhotoType;
  storage_path: string;
  latitude: string | number | null;
  longitude: string | number | null;
  captured_at: string;
  created_at: string;
};

export type JobPhotoView = JobPhoto & {
  signedUrl: string | null;
};

export type JobView = Job & {
  property_name: string;
  property_address: string;
  service_name: string;
  customer_name: string;
  crew_name: string | null;
  hazards: string | null;
  special_instructions: string | null;
  snow_storage_location: string | null;
  driveway_type: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type StormStatus = "MONITORING" | "ACTIVE" | "PROCESSING" | "COMPLETED";

export type StormEvent = {
  id: string;
  name: string;
  start_time: string;
  end_time: string | null;
  estimated_snowfall: string | number | null;
  actual_snowfall: string | number | null;
  status: StormStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyZone = {
  id: string;
  property_id: string;
  name: string;
  sort_order: number;
  priority: JobPriority;
  instructions: string | null;
  photo_required: boolean;
  created_at: string;
  updated_at: string;
};

export type JobMaterial = {
  id: string;
  job_id: string;
  material_name: string;
  quantity: string | number;
  unit: string;
  cost: number;
  created_at: string;
};

export type AdminPropertyRow = Property & {
  customer_name: string;
  customer_email: string;
};
