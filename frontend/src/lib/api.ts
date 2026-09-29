const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type AccountType = "intern" | "company";

/** Where to send a signed-in user by default: their personalized dashboard. */
export function homePathFor(): string {
  return "/home";
}

export type SchoolType = "university" | "graduate_school" | "vocational_school" | "technical_college" | "other";
export type SkillCategory = "language" | "framework" | "tool";
export type SkillLevel = "class_experience" | "personal" | "team";
export type PortfolioContext = "class_project" | "personal" | "hackathon" | "intern" | "other";
export type ProfileSection =
  | "basic_info"
  | "desired_conditions"
  | "skills"
  | "portfolio_items"
  | "highlights"
  | "self_pr"
  | "links";

export interface BasicInfo {
  school_type: SchoolType | null;
  school_name: string | null;
  department: string | null;
  graduation_year_month: string | null;
}

export interface DesiredRole {
  job_category: string;
  job_subcategory: string;
  priority: number;
}

export interface DesiredConditions {
  desired_roles: DesiredRole[];
  desired_location: string | null;
  job_hunting_axes: string | null;
}

export interface StudentSkillEntry {
  id: number;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export interface PortfolioItem {
  id: number;
  title: string;
  summary: string | null;
  context: PortfolioContext | null;
  tech_stack: string[];
  highlights: string | null;
  github_url: string | null;
  other_url: string | null;
  position: number;
}

export interface StudentHighlight {
  id: number;
  title: string;
  body: string;
  position: number;
}

export interface SelfPr {
  bio: string | null;
  career_goal: string | null;
}

export interface ProfileLink {
  portfolio_item_id: number;
  title: string;
  github_url: string | null;
  other_url: string | null;
}

export interface Intern {
  id: number;
  name: string;
  email: string;
  completion_percentage: number;
  missing_sections: ProfileSection[];
  basic_info: BasicInfo;
  desired_conditions: DesiredConditions;
  skills: StudentSkillEntry[];
  portfolio_items: PortfolioItem[];
  highlights: StudentHighlight[];
  self_pr: SelfPr;
  links: ProfileLink[];
}

export interface Company {
  id: number;
  name: string;
  email: string;
  description: string | null;
}

export interface MessageAttachment {
  id: number;
  filename: string;
  content_type: string;
  byte_size: number;
  url: string;
}

export interface Message {
  id: number;
  sender_type: AccountType;
  sender_intern: { id: number; name: string } | null;
  body: string;
  created_at: string;
  edited: boolean;
  deleted: boolean;
  attachments: MessageAttachment[];
}

export type WorkStyle = "online" | "onsite" | "hybrid";

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  created_at: string;
  graduation_year: number | null;
  starts_on: string | null;
  ends_on: string | null;
  work_style: WorkStyle | null;
  location: string | null;
  job_category: string | null;
  job_subcategory: string | null;
  skills: string[];
  deadline_soon: boolean;
  company: { id: number; name: string };
}

export interface JobPostingSearchParams {
  graduationYear?: number | string;
  workStyle?: WorkStyle;
  jobCategory?: string;
  jobSubcategory?: string;
  location?: string;
  companyId?: number;
  limit?: number;
}

export interface JobPostingListResponse {
  total_count: number;
  job_postings: JobPosting[];
}

export class ApiError extends Error {
  status: number;
  errors: string[];
  /** Field name -> messages, when the backend provides per-field validation errors. */
  fieldErrors: Record<string, string[]>;

  constructor(status: number, errors: string[], fieldErrors: Record<string, string[]> = {}) {
    super(errors.join(", "));
    this.status = status;
    this.errors = errors;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, body, ...rest } = options;
  // When sending FormData (e.g. file uploads), the browser must set its own
  // multipart Content-Type header (with boundary), so omit the JSON default.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
    throw new ApiError(res.status, errors, data.field_errors ?? {});
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
  const { bio, ...intern } = params;
  return request<AuthResponse<Intern>>("/api/v1/auth/intern_signup", {
    method: "POST",
    body: JSON.stringify({ intern: bio ? { ...intern, bio } : intern }),
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

export interface InternSearchParams {
  keyword?: string;
  skill?: string;
  jobCategory?: string;
  jobSubcategory?: string;
  location?: string;
}

export function fetchInterns(token: string, search: InternSearchParams = {}) {
  const query = new URLSearchParams();
  if (search.keyword) query.set("keyword", search.keyword);
  if (search.skill) query.set("skill", search.skill);
  if (search.jobCategory) query.set("job_category", search.jobCategory);
  if (search.jobSubcategory) query.set("job_subcategory", search.jobSubcategory);
  if (search.location) query.set("location", search.location);

  const qs = query.toString();
  return request<Intern[]>(`/api/v1/interns${qs ? `?${qs}` : ""}`, { token });
}

export function fetchIntern(token: string, id: number) {
  return request<Intern>(`/api/v1/interns/${id}`, { token });
}

export function updateBasicInfo(token: string, internId: number, params: Partial<BasicInfo>) {
  return request<Intern>(`/api/v1/interns/${internId}/student_profile/basic_info`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ student_profile: params }),
  });
}

export function updateDesiredConditions(
  token: string,
  internId: number,
  params: { desired_roles: DesiredRole[]; desired_location: string; job_hunting_axes: string }
) {
  return request<Intern>(`/api/v1/interns/${internId}/student_profile/desired_conditions`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ student_profile: params }),
  });
}

export function updateSelfPr(token: string, internId: number, params: Partial<SelfPr>) {
  return request<Intern>(`/api/v1/interns/${internId}/student_profile/self_pr`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ student_profile: params }),
  });
}

export interface StudentSkillInput {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export function updateSkills(token: string, internId: number, skills: StudentSkillInput[]) {
  return request<Intern>(`/api/v1/interns/${internId}/student_skills`, {
    method: "PUT",
    token,
    body: JSON.stringify({ skills }),
  });
}

export interface PortfolioItemInput {
  title: string;
  summary?: string;
  context?: PortfolioContext;
  tech_stack?: string[];
  highlights?: string;
  github_url?: string;
  other_url?: string;
}

export function createPortfolioItem(token: string, internId: number, params: PortfolioItemInput) {
  return request<Intern>(`/api/v1/interns/${internId}/portfolio_items`, {
    method: "POST",
    token,
    body: JSON.stringify({ portfolio_item: params }),
  });
}

export function updatePortfolioItem(
  token: string,
  internId: number,
  itemId: number,
  params: Partial<PortfolioItemInput>
) {
  return request<Intern>(`/api/v1/interns/${internId}/portfolio_items/${itemId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ portfolio_item: params }),
  });
}

export function deletePortfolioItem(token: string, internId: number, itemId: number) {
  return request<Intern>(`/api/v1/interns/${internId}/portfolio_items/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export function reorderPortfolioItems(token: string, internId: number, orderedIds: number[]) {
  return request<Intern>(`/api/v1/interns/${internId}/portfolio_items/reorder`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
}

export interface StudentHighlightInput {
  title: string;
  body: string;
}

export function createStudentHighlight(token: string, internId: number, params: StudentHighlightInput) {
  return request<Intern>(`/api/v1/interns/${internId}/student_highlights`, {
    method: "POST",
    token,
    body: JSON.stringify({ student_highlight: params }),
  });
}

export function updateStudentHighlight(
  token: string,
  internId: number,
  highlightId: number,
  params: Partial<StudentHighlightInput>
) {
  return request<Intern>(`/api/v1/interns/${internId}/student_highlights/${highlightId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ student_highlight: params }),
  });
}

export function deleteStudentHighlight(token: string, internId: number, highlightId: number) {
  return request<Intern>(`/api/v1/interns/${internId}/student_highlights/${highlightId}`, {
    method: "DELETE",
    token,
  });
}

export function reorderStudentHighlights(token: string, internId: number, orderedIds: number[]) {
  return request<Intern>(`/api/v1/interns/${internId}/student_highlights/reorder`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
}

export interface ConversationParticipant {
  id: number;
  name: string;
}

export interface Conversation {
  id: number;
  title: string;
  interns: ConversationParticipant[];
  participant_count: number;
  last_activity_at: string;
  latest_message: {
    id: number;
    sender_type: AccountType;
    sender_name: string | null;
    body: string;
    created_at: string;
  } | null;
  company?: { id: number; name: string };
}

export function fetchConversations(token: string) {
  return request<Conversation[]>("/api/v1/conversations", { token });
}

export function fetchConversation(token: string, conversationId: number) {
  return request<Conversation>(`/api/v1/conversations/${conversationId}`, { token });
}

export function createConversation(token: string, internIds: number[], title?: string) {
  return request<Conversation>("/api/v1/conversations", {
    method: "POST",
    token,
    body: JSON.stringify({ intern_ids: internIds, title }),
  });
}

export function updateConversation(
  token: string,
  conversationId: number,
  params: { title?: string; internIds?: number[] }
) {
  return request<Conversation>(`/api/v1/conversations/${conversationId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      ...(params.title !== undefined ? { title: params.title } : {}),
      ...(params.internIds !== undefined ? { intern_ids: params.internIds } : {}),
    }),
  });
}

export function fetchMessages(token: string, conversationId: number) {
  return request<Message[]>(`/api/v1/conversations/${conversationId}/messages`, { token });
}

export async function fetchAttachmentBlob(token: string, url: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errors: string[] = data.errors ?? (data.error ? [data.error] : ["エラーが発生しました"]);
    throw new ApiError(res.status, errors, data.field_errors ?? {});
  }

  return res.blob();
}

export function sendMessage(
  token: string,
  conversationId: number,
  body: string,
  attachments: File[] = []
) {
  if (attachments.length === 0) {
    return request<Message>(`/api/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ message: { body } }),
    });
  }

  const formData = new FormData();
  formData.set("message[body]", body);
  attachments.forEach((file) => formData.append("message[attachments][]", file));

  return request<Message>(`/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    token,
    body: formData,
  });
}

/**
 * Edits a message the caller previously sent. `attachments` follows the same
 * "presence matters" rule as the backend: omit it to keep the message's
 * current files, or pass an array (including `[]`) to replace them.
 */
export function updateMessage(
  token: string,
  conversationId: number,
  messageId: number,
  body: string,
  attachments?: File[]
) {
  if (attachments === undefined) {
    return request<Message>(`/api/v1/conversations/${conversationId}/messages/${messageId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ message: { body } }),
    });
  }

  const formData = new FormData();
  formData.set("message[body]", body);
  if (attachments.length === 0) {
    formData.append("message[attachments][]", "");
  } else {
    attachments.forEach((file) => formData.append("message[attachments][]", file));
  }

  return request<Message>(`/api/v1/conversations/${conversationId}/messages/${messageId}`, {
    method: "PATCH",
    token,
    body: formData,
  });
}

export function deleteMessage(token: string, conversationId: number, messageId: number) {
  return request<Message>(`/api/v1/conversations/${conversationId}/messages/${messageId}`, {
    method: "DELETE",
    token,
  });
}

export function fetchJobPostings(search: JobPostingSearchParams = {}) {
  const query = new URLSearchParams();
  if (search.graduationYear) query.set("graduation_year", String(search.graduationYear));
  if (search.workStyle) query.set("work_style", search.workStyle);
  if (search.jobCategory) query.set("job_category", search.jobCategory);
  if (search.jobSubcategory) query.set("job_subcategory", search.jobSubcategory);
  if (search.location) query.set("location", search.location);
  if (search.companyId) query.set("company_id", String(search.companyId));
  if (search.limit) query.set("limit", String(search.limit));

  const qs = query.toString();
  return request<JobPostingListResponse>(`/api/v1/job_postings${qs ? `?${qs}` : ""}`);
}

export function fetchJobPosting(id: number) {
  return request<JobPosting>(`/api/v1/job_postings/${id}`);
}

export interface JobPostingInput {
  title: string;
  description: string;
  graduation_year?: number | null;
  starts_on?: string | null;
  ends_on?: string | null;
  work_style?: WorkStyle | null;
  location?: string | null;
  job_category?: string | null;
  job_subcategory?: string | null;
  skills?: string[];
}

export function createJobPosting(token: string, params: JobPostingInput) {
  return request<JobPosting>("/api/v1/job_postings", {
    method: "POST",
    token,
    body: JSON.stringify({ job_posting: params }),
  });
}

export type ScheduleStatus = "open" | "confirmed" | "cancelled";
export type ScheduleAnswer = "available" | "unavailable" | "maybe";

export interface ScheduleSlotResponse {
  intern_id: number;
  answer: ScheduleAnswer;
}

export interface ScheduleSlot {
  id: number;
  starts_at: string;
  ends_at: string;
  responses?: ScheduleSlotResponse[];
}

export interface Schedule {
  id: number;
  title: string;
  status: ScheduleStatus;
  company: { id: number; name: string };
  interns: { id: number; name: string }[];
  confirmed_slot_id: number | null;
  slots: ScheduleSlot[];
}

export function fetchSchedules(token: string) {
  return request<Schedule[]>("/api/v1/schedules", { token });
}

export function fetchSchedule(token: string, scheduleId: number) {
  return request<Schedule>(`/api/v1/schedules/${scheduleId}`, { token });
}

export interface ScheduleSlotInput {
  starts_at: string;
  ends_at: string;
}

export function createSchedule(
  token: string,
  params: { title: string; internIds: number[]; slots: ScheduleSlotInput[] }
) {
  return request<Schedule>("/api/v1/schedules", {
    method: "POST",
    token,
    body: JSON.stringify({ title: params.title, intern_ids: params.internIds, slots: params.slots }),
  });
}

export function confirmSchedule(token: string, scheduleId: number, scheduleSlotId: number) {
  return request<Schedule>(`/api/v1/schedules/${scheduleId}/confirm`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ schedule_slot_id: scheduleSlotId }),
  });
}

export function cancelSchedule(token: string, scheduleId: number) {
  return request<Schedule>(`/api/v1/schedules/${scheduleId}/cancel`, {
    method: "PATCH",
    token,
  });
}

export function respondToScheduleSlot(
  token: string,
  scheduleId: number,
  scheduleSlotId: number,
  answer: ScheduleAnswer
) {
  return request<ScheduleSlotResponse>(`/api/v1/schedules/${scheduleId}/slots/${scheduleSlotId}/response`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ answer }),
  });
}
