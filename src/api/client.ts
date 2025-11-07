import { MsgRecord, PagedResult, Template } from "../types";

const API_BASE = "https://msg.ilessai.com/api";
const DEFAULT_TRACE_ID = "mytrace123";
const DEFAULT_USER_ID = "77";

interface MsgApiResponse<T> {
  code: number;
  message?: string | null;
  data?: T;
}

const generateTraceId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `trace-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const buildHeaders = (
  extra?: Record<string, string>,
  override?: { traceId?: string; userId?: string }
): Record<string, string> => {
  const traceId =
    override?.traceId ?? DEFAULT_TRACE_ID ?? generateTraceId();
  const userId = override?.userId ?? DEFAULT_USER_ID;
  return {
    "Trace-ID": traceId,
    "User-ID": userId,
    ...(extra ?? {}),
  };
};

const sanitizeResponseText = (text: string): string =>
  text.replace(/^\uFEFF/, "").trim();

function isMsgResponse<T>(value: unknown): value is MsgApiResponse<T> {
  return (
    !!value &&
    typeof value === "object" &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "number"
  );
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP error ${res.status}`);
  }
  const cleanedText = sanitizeResponseText(text);
  if (!cleanedText) {
    return undefined as T;
  }

  let json: unknown;
  try {
    json = JSON.parse(cleanedText);
  } catch (err) {
    const preview = cleanedText.slice(0, 140);
    throw new Error(
      preview
        ? `Failed to parse server response: ${preview}`
        : "Failed to parse server response."
    );
  }

  if (isMsgResponse<T>(json)) {
    if (json.code !== 0) {
      throw new Error(
        (json.message && String(json.message)) || `API error ${json.code}`
      );
    }
    return (json.data ?? ({} as T)) as T;
  }

  return json as T;
}

export async function fetchTemplateById(
  templateId: string
): Promise<Template> {
  const url = new URL(`${API_BASE}/msg/get_template`);
  url.searchParams.set("templateId", templateId);
  const data = await handleResponse<Record<string, unknown>>(
    await fetch(url.toString(), {
      headers: buildHeaders({ "Content-Type": "application/json" }),
    })
  );
  return normalizeTemplate(data);
}

export interface CreateTemplatePayload {
  name: string;
  content: string;
  sourceId: string;
  channel: number;
  subject: string;
  signName?: string;
  traceId?: string;
  userId?: string;
}

export interface UpdateTemplatePayload {
  name: string;
  sign_name: string;
  source_id: string;
  channel: number;
  subject: string;
  content: string;
  template_id: string;
  rel_template_id?: string;
  status?: number;
}

export interface FetchTemplatesParams {
  status?: number;
  page?: number;
  pageSize?: number;
  templateId?: string;
  sourceId?: string;
}

export async function createTemplate(
  payload: CreateTemplatePayload
): Promise<Template> {
  const { traceId, userId, signName, ...body } = payload;
  const headers = buildHeaders(
    { "Content-Type": "application/json" },
    { traceId, userId }
  );

  const res = await fetch(`${API_BASE}/msg/create_template`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...body,
      ...(signName ? { signName } : {}),
    }),
  });
  const data = await handleResponse<Record<string, unknown>>(res);
  return normalizeTemplate(data);
}

export async function updateTemplate(
  payload: UpdateTemplatePayload
): Promise<Template> {
  const res = await fetch(`${API_BASE}/template/update_template`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse<Template>(res);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/template/del_template`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ templateId, template_id: templateId }),
  });
  await handleResponse(res);
}

// Approve template: set status = 2
export async function approveTemplate(templateId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/template/update_template`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      template_id: templateId,
      templateId,
      status: 2,
      templateModel: { templateId, status: 2 },
    }),
  });
  await handleResponse(res);
}

const TEMPLATE_LIST_ENDPOINT = `${API_BASE}/msg/get_template_list`;

function collectTemplateRecords(data: unknown): Record<string, unknown>[] {
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  if (Array.isArray(data)) {
    return data.filter(isRecord);
  }

  if (isRecord(data)) {
    const record = data as Record<string, unknown>;
    const candidates = ["list", "templates", "records", "items", "rows"] as const;
    for (const candidate of candidates) {
      const value = record[candidate];
      if (Array.isArray(value)) {
        return value.filter(isRecord);
      }
    }
  }

  return [];
}

export async function fetchTemplates(
  params?: FetchTemplatesParams
): Promise<Template[]> {
  const url = new URL(TEMPLATE_LIST_ENDPOINT);
  if (params) {
    Object.entries(params)
      .filter(
        (entry): entry is [string, string | number] =>
          entry[1] !== undefined && entry[1] !== null && entry[1] !== ""
      )
      .forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
  }

  const res = await fetch(url.toString(), {
    headers: buildHeaders(),
  });
  const data = await handleResponse<unknown>(res);
  return collectTemplateRecords(data).map((tpl) => normalizeTemplate(tpl));
}

export async function fetchPendingTemplates(): Promise<Template[]> {
  return fetchTemplates({ status: 1 });
}

// Test send APIs
export interface SendMsgPayload {
  templateId: string;
  to: string;
  templateData: Record<string, unknown> | string;
  sourceId?: string;
  channel?: number;
  subject?: string;
  priority?: number;
}

export interface SendMsgResult {
  msgId: string;
}

export async function sendTestMsg(
  payload: SendMsgPayload
): Promise<SendMsgResult> {
  const res = await fetch(`${API_BASE}/msg/send_msg`, {
    method: "POST",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<string | Record<string, unknown>>(res);
  if (typeof data === "string") {
    return { msgId: data };
  }
  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    const maybeMsgId =
      (typeof record.msgId === "string" && record.msgId) ||
      (typeof record.msg_id === "string" && record.msg_id);
    if (maybeMsgId) {
      return { msgId: maybeMsgId };
    }
  }
  throw new Error("Server response missing msg_id.");
}

// Message record APIs
export async function fetchMsgRecordById(msgId: string): Promise<MsgRecord[]> {
  const url = new URL(`${API_BASE}/get_msg_record`);
  url.searchParams.set("msgId", msgId);
  return handleResponse<MsgRecord[]>(
    await fetch(url.toString(), { headers: buildHeaders() })
  );
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
  return handleResponse<PagedResult<MsgRecord>>(
    await fetch(url.toString(), { headers: buildHeaders() })
  );
}

function normalizeTemplate(raw: Record<string, unknown>): Template {
  const asString = (value: unknown, fallback = "") =>
    value === undefined || value === null ? fallback : String(value);
  const asNumber = (value: unknown, fallback = 0) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const relTemplate =
    raw.rel_template_id ?? raw.relTemplateId ?? raw.rel_templateId;
  return {
    id: asNumber(raw.id),
    template_id: asString(raw.template_id ?? raw.templateId),
    rel_template_id:
      relTemplate === undefined || relTemplate === null
        ? null
        : String(relTemplate),
    name: asString(raw.name),
    sign_name: asString(raw.sign_name ?? raw.signName),
    source_id: asString(raw.source_id ?? raw.sourceId),
    channel: asNumber(raw.channel, 1),
    subject: asString(raw.subject),
    content: asString(raw.content),
    status: asNumber(raw.status, 1),
    create_time: asString(raw.create_time ?? raw.createTime),
    modify_time: asString(raw.modify_time ?? raw.modifyTime),
    creator:
      raw.creator === undefined || raw.creator === null
        ? undefined
        : String(raw.creator),
  };
}
