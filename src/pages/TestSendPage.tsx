import React, { useEffect, useId, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchTemplates, sendTestMsg } from "../api/client";
import { Template } from "../types";
import { ErrorText, LoadingSpinner } from "../components/ui";

interface LocationState {
  templateId?: string;
}

export const TestSendPage: React.FC = () => {
  const { templateId: paramTemplateId } = useParams<{ templateId: string }>();
  const location = useLocation();
  const navState = location.state as LocationState | null;
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState<string>(
    paramTemplateId || navState?.templateId || ""
  );
  const [to, setTo] = useState("");
  const [templateDataText, setTemplateDataText] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [resultMsgId, setResultMsgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const templateSelectId = useId();
  const targetInputId = useId();
  const templateDataId = useId();

  useEffect(() => {
    setLoading(true);
    fetchTemplates({ page: 1, pageSize: 100 })
      .then((res) => setTemplates(res.list))
      .catch((e) => setError(e.message || "Failed to load templates"))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResultMsgId(null);
    if (!templateId || !to) {
      setError("Template and target address are required.");
      return;
    }
    let data: any = templateDataText;
    try {
      if (templateDataText.trim().startsWith("{")) {
        data = JSON.parse(templateDataText);
      }
    } catch (e) {
      setError("Template data JSON is invalid.");
      return;
    }

    setSending(true);
    try {
      const res = await sendTestMsg({
        templateId,
        to,
        templateData: data,
      });
      setResultMsgId(res.msgId);
    } catch (e: any) {
      setError(e.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Test Send</h2>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorText error={error} />

      {!loading && (
        <form onSubmit={handleSend} className="form-grid">
          <div className="form-group form-group-full">
            <label htmlFor={templateSelectId}>Template</label>
            <select
              id={templateSelectId}
              className="select"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">Select a template</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.template_id}>
                  {tpl.name} ({tpl.template_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor={targetInputId}>Target address</label>
            <input
              id={targetInputId}
              className="input"
              placeholder="Email or phone number"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor={templateDataId}>
              Template data (JSON string or plain text)
            </label>
            <textarea
              id={templateDataId}
              className="textarea"
              rows={8}
              value={templateDataText}
              onChange={(e) => setTemplateDataText(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Test Message"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {resultMsgId && (
        <div className="result-box">
          <div>Message sent successfully.</div>
          <div>
            msg_id: <code>{resultMsgId}</code>
          </div>
          <button
            className="btn-ghost-xs"
            onClick={() =>
              navigate("/records", { state: { msgId: resultMsgId } })
            }
          >
            View message record
          </button>
        </div>
      )}
    </div>
  );
};
