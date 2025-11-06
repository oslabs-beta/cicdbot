import { MsgRecord, PagedResult, Template } from "../types";

const API_BASE = "http://localhost:8082"; // change to your backend

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP error ${res.status}`);
  }
  return res.json();
}

// Template APIs
export async function fetchTemplates(params?: {
  keyword?: string;
  status?: number;
  channel?: number;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<Template>> {
  const url = new URL(`${API_BASE}/template/list_template`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return handleResponse<PagedResult<Template>>(await fetch(url.toString()));
}

export async function fetchTemplateById(
  templateId: string
): Promise<Template> {
  const url = new URL(`${API_BASE}/template/get_template`);
  url.searchParams.set("templateId", templateId);
  return handleResponse<Template>(await fetch(url.toString()));
}

export interface SaveTemplatePayload {
  name: string;
  sign_name: string;
  source_id: string;
  channel: number;
  subject: string;
  content: string;
  template_id?: string;
  rel_template_id?: string;
  status?: number;
}

export async function createTemplate(
  payload: SaveTemplatePayload
): Promise<Template> {
  const res = await fetch(`${API_BASE}/template/create_template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Template>(res);
}

export async function updateTemplate(
  payload: SaveTemplatePayload & { template_id: string }
): Promise<Template> {
  const res = await fetch(`${API_BASE}/template/update_template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Template>(res);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/template/del_template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId }),
  });
  await handleResponse(res);
}

// Approve template: set status = 2
export async function approveTemplate(templateId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/template/update_template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template_id: templateId, status: 2 }),
  });
  await handleResponse(res);
}

// Test send APIs
export interface SendMsgPayload {
  templateId: string;
  to: string;
  templateData: Record<string, unknown> | string;
  sourceId?: string;
  channel?: number;
}

export interface SendMsgResult {
  msgId: string;
  status: string;
}

export async function sendTestMsg(
  payload: SendMsgPayload
): Promise<SendMsgResult> {
  const res = await fetch(`${API_BASE}/send_msg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<SendMsgResult>(res);
}

// Message record APIs
export async function fetchMsgRecordById(msgId: string): Promise<MsgRecord[]> {
  const url = new URL(`${API_BASE}/get_msg_record`);
  url.searchParams.set("msgId", msgId);
  return handleResponse<MsgRecord[]>(await fetch(url.toString()));
}

export async function fetchMsgRecords(params?: {
  templateId?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<MsgRecord>> {
  const url = new URL(`${API_BASE}/get_msg_record_page`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return handleResponse<PagedResult<MsgRecord>>(await fetch(url.toString()));
}