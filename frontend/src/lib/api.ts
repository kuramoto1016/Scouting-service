const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type AccountType = "intern" | "company";

export interface Intern {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  university: string | null;
  faculty: string | null;
  grade: string | null;
  skills: string | null;
  desired_location: string | null;
  desired_job_type: string | null;
  portfolio_url: string | null;
  career_goal: string | null;
}

export interface InternProfileInput {
  name: string;
  bio: string;
  university: string;
  faculty: string;
  grade: string;
  skills: string;
  desired_location: string;
  desired_job_type: string;
  portfolio_url: string;
  career_goal: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  description: string | null;
}

export interface Message {
  id: number;
  sender_type: AccountType;
  body: string;
  created_at: string;
}

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  created_at: string;
  company: { id: number; name: string };
}

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, errors: string[]) {
    super(errors.join(", "));
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errors: string[] = data.errors ?? (data.error ? [data.error] : ["エラーが発生しました"]);
    throw new ApiError(res.status, errors);
  }

  return data as T;
}

export interface AuthResponse<T> {
  token: string;
  account_type?: AccountType;
  intern?: Intern;
  company?: Company;
  account?: T;
}

export function signupIntern(params: { name: string; email: string; password: string; bio?: string }) {
  return request<AuthResponse<Intern>>("/api/v1/auth/intern_signup", {
    method: "POST",
    body: JSON.stringify({ intern: params }),
  });
}

export function signupCompany(params: { name: string; email: string; password: string; description?: string }) {
  return request<AuthResponse<Company>>("/api/v1/auth/company_signup", {
    method: "POST",
    body: JSON.stringify({ company: params }),
  });
}

export function login(params: { accountType: AccountType; email: string; password: string }) {
  return request<AuthResponse<Intern | Company>>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      account_type: params.accountType,
      email: params.email,
      password: params.password,
    }),
  });
}

export function fetchMe(token: string) {
  return request<{ account_type: AccountType; account: Intern | Company }>("/api/v1/me", { token });
}

export function fetchInterns(token: string) {
  return request<Intern[]>("/api/v1/interns", { token });
}

export function fetchIntern(token: string, id: number) {
  return request<Intern>(`/api/v1/interns/${id}`, { token });
}

export function updateInternProfile(token: string, id: number, params: Partial<InternProfileInput>) {
  return request<Intern>(`/api/v1/interns/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ intern: params }),
  });
}

export function fetchConversations(token: string) {
  return request<(Intern | Company)[]>("/api/v1/conversations", { token });
}

export function fetchMessages(
  token: string,
  partnerType: AccountType,
  partnerId: number
) {
  const path =
    partnerType === "intern"
      ? `/api/v1/interns/${partnerId}/messages`
      : `/api/v1/companies/${partnerId}/messages`;
  return request<Message[]>(path, { token });
}

export function sendMessage(
  token: string,
  partnerType: AccountType,
  partnerId: number,
  body: string
) {
  const path =
    partnerType === "intern"
      ? `/api/v1/interns/${partnerId}/messages`
      : `/api/v1/companies/${partnerId}/messages`;
  return request<Message>(path, {
    method: "POST",
    token,
    body: JSON.stringify({ message: { body } }),
  });
}

export function fetchJobPostings() {
  return request<JobPosting[]>("/api/v1/job_postings");
}

export function createJobPosting(token: string, params: { title: string; description: string }) {
  return request<JobPosting>("/api/v1/job_postings", {
    method: "POST",
    token,
    body: JSON.stringify({ job_posting: params }),
  });
}
