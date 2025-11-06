// Template table (t_msg_template)
export interface Template {
  id: number;
  template_id: string;
  rel_template_id?: string | null;
  name: string;
  sign_name: string;
  source_id: string;
  channel: number; // 1: email, 2: sms, etc.
  subject: string;
  content: string;
  status: number; // 1: pending, 2: approved, 3: rejected, etc.
  create_time: string;
  modify_time: string;
  // Optional extra field for creator if backend provides it
  creator?: string;
}

// Message record table (t_msg_record)
export interface MsgRecord {
  id: number;
  msg_id: string;
  source_id: string;
  channel: number;
  subject: string;
  to: string;
  template_id: string;
  template_data: string;
  status: number; // 1: pending, 2: success, 3: failed
  retry_count: number;
  create_time: string;
  modify_time: string;
}

export interface PagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type UserRole = "MARKETER" | "MANAGER";