import React, { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTemplate } from "../api/client";
import { ErrorText } from "../components/ui";
import { useAuth } from "../state/AuthContext";

export const TemplateCreatePage: React.FC = () => {
  const [name, setName] = useState("");
  const [signName, setSignName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [channel, setChannel] = useState(1);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { username } = useAuth();
  const nameId = useId();
  const signNameId = useId();
  const sourceIdFieldId = useId();
  const channelId = useId();
  const subjectId = useId();
  const contentId = useId();

  const generateTraceId = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return `trace-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSignName = signName.trim();
    const trimmedSourceId = sourceId.trim();
    const trimmedSubject = subject.trim();
    const trimmedContent = content.trim();
    if (
      !trimmedName ||
      !trimmedSourceId ||
      !trimmedSubject ||
      !trimmedContent
    ) {
      setError("Name, source ID, subject and content are required.");
      return;
    }
    setName(trimmedName);
    setSignName(trimmedSignName);
    setSourceId(trimmedSourceId);
    setSubject(trimmedSubject);
    setContent(trimmedContent);
    setError("");
    setSaving(true);
    try {
      const tpl = await createTemplate({
        name: trimmedName,
        signName: trimmedSignName ? trimmedSignName : undefined,
        sourceId: trimmedSourceId,
        channel,
        subject: trimmedSubject,
        content: trimmedContent,
        traceId: generateTraceId(),
        userId: username || "77",
      });
      navigate(`/templates/${tpl.template_id}`);
    } catch (e: any) {
      setError(e.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Create Template</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <ErrorText error={error} />

        <div className="form-group">
          <label htmlFor={nameId}>Name *</label>
          <input
            id={nameId}
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Order Notification"
          />
        </div>

        <div className="form-group">
          <label htmlFor={signNameId}>Sign Name (Optional)</label>
          <input
            id={signNameId}
            className="input"
            value={signName}
            onChange={(e) => setSignName(e.target.value)}
            placeholder="Company signature"
          />
        </div>

        <div className="form-group">
          <label htmlFor={sourceIdFieldId}>Source ID *</label>
          <input
            id={sourceIdFieldId}
            className="input"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            required
            placeholder="wba867d3-1b3b-413f-9e16-2859730fabsa"
          />
        </div>

        <div className="form-group">
          <label htmlFor={channelId}>Channel</label>
          <select
            id={channelId}
            className="select"
            value={channel}
            onChange={(e) => setChannel(Number(e.target.value))}
          >
            <option value={1}>Email</option>
            <option value={2}>SMS</option>
          </select>
        </div>

        <div className="form-group form-group-full">
          <label htmlFor={subjectId}>Subject *</label>
          <input
            id={subjectId}
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Order Shipped"
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor={contentId}>Content *</label>
          <textarea
            id={contentId}
            className="textarea"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Dear ${user_name}, your order ${order_id} has been shipped."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Creating..." : "Create Template"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
