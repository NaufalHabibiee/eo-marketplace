export type EO = {
  id: string;
  company_name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  google_maps_url: string | null;
  year_established: number | null;
  event_types: string[];
  services: string[];
  capacity: number | null;
  min_budget: number | null;
  portfolio_images: string[];
  rating: number | null;
  review_count: number;
  total_events: number | null;
  verified: boolean;
  status: "active" | "inactive";
  created_at: string;
};

export type EOCardData = Pick<
  EO,
  "id" | "company_name" | "slug" | "logo" | "city" | "rating" | "review_count" | "event_types" | "total_events" | "verified"
>;

export type EventRequest = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  event_type: string;
  location: string;
  event_date: string;
  participants: number;
  budget: string;
  description: string;
  created_at: string;
  status: string;
};

export type LeadRow = {
  id: string;
  status: string;
  created_at: string;
  request: EventRequest;
  eo: Pick<EO, "id" | "company_name" | "slug" | "phone"> | null;
};
