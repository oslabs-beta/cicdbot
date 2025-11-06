import React, { useId, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { sendTestMsg } from "../api/client";
import { ErrorText } from "../components/ui";

interface LocationState {
  templateId?: string;
}

export const TestSendPage: React.FC = () => {
  const { templateId: paramTemplateId } = useParams<{ templateId: string }>();
  const location = useLocation();
  const navState = location.state as LocationState | null;
  const [templateId, setTemplateId] = useState<string>(
    paramTemplateId || navState?.templateId || ""
  );
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [templateDataText, setTemplateDataText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [resultMsgId, setResultMsgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const templateInputId = useId();
  const targetInputId = useId();
  const subjectInputId = useId();
  const priorityInputId = useId();
  const templateDataId = useId();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResultMsgId(null);
    const trimmedTemplateId = templateId.trim();
    const trimmedRecipient = to.trim();
    const trimmedSubject = subject.trim();
    const trimmedPriority = priority.trim();

    if (!trimmedTemplateId || !trimmedRecipient || !trimmedSubject || !trimmedPriority) {
      setError("Template ID, recipient, subject and priority are required.");
      return;
    }
    const priorityValue = Number(trimmedPriority);
    if (!Number.isFinite(priorityValue) || priorityValue < 1 || priorityValue > 3) {
      setError("Priority must be 1, 2, or 3.");
      return;
    }

    let parsedData: Record<string, unknown> | string = templateDataText;
    try {
      if (templateDataText.trim().startsWith("{")) {
        parsedData = JSON.parse(templateDataText);
      }
    } catch (e) {
      setError("Template data JSON is invalid.");
      return;
    }

    setSending(true);
    try {
      const res = await sendTestMsg({
        templateId: trimmedTemplateId,
        to: trimmedRecipient,
        subject: trimmedSubject,
        templateData: parsedData,
        priority: priorityValue,
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

      <ErrorText error={error} />

      <form onSubmit={handleSend} className="form-grid">
        <div className="form-group form-group-full">
          <label htmlFor={templateInputId}>Template ID</label>
          <input
            id={templateInputId}
            className="input"
            placeholder="Enter template ID"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor={targetInputId}>Recipient</label>
          <input
            id={targetInputId}
            className="input"
            placeholder="Email or phone number"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor={subjectInputId}>Subject</label>
          <input
            id={subjectInputId}
            className="input"
            placeholder="Shipping Notification"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor={priorityInputId}>Priority</label>
          <select
            id={priorityInputId}
            className="select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">Select priority</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
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
