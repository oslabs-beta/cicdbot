import React, { useEffect, useId, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  approveTemplate,
  deleteTemplate,
  fetchTemplateById,
  updateTemplate,
} from "../api/client";
import { Template } from "../types";
import { ChannelTag, ErrorText, LoadingSpinner, StatusBadge } from "../components/ui";
import { useAuth } from "../state/AuthContext";

export const TemplateDetailPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [signName, setSignName] = useState("");
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<number>(1);
  const navigate = useNavigate();
  const { role } = useAuth();
  const channelFieldId = useId();
  const nameFieldId = useId();
  const signNameFieldId = useId();
  const subjectFieldId = useId();
  const contentFieldId = useId();

  const canEditByMarketer =
    role === "MARKETER" && template && template.status !== 2;

  const isManager = role === "MANAGER";

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    setError("");
    fetchTemplateById(templateId)
      .then((tpl) => {
        setTemplate(tpl);
        setContent(tpl.content);
        setName(tpl.name);
        setSignName(tpl.sign_name);
        setSubject(tpl.subject);
        setChannel(tpl.channel);
      })
      .catch((e) => setError(e.message || "Failed to load template"))
      .finally(() => setLoading(false));
  }, [templateId]);

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateTemplate({
        template_id: template.template_id,
        name,
        sign_name: signName,
        source_id: template.source_id,
        channel,
        subject,
        content,
        status: template.status,
        rel_template_id: template.rel_template_id ?? undefined,
      });
      setTemplate(updated);
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!template) return;
    if (!window.confirm("Approve this template?")) return;
    setSaving(true);
    setError("");
    try {
      await approveTemplate(template.template_id);
      setTemplate({ ...template, status: 2 });
    } catch (e: any) {
      setError(e.message || "Approve failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    if (!window.confirm("Delete this template permanently?")) return;
    setSaving(true);
    setError("");
    try {
      await deleteTemplate(template.template_id);
      navigate("/templates");
    } catch (e: any) {
      setError(e.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !template) return <ErrorText error={error} />;
  if (!template) return <div className="empty-state">Template not found.</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>Template Detail</h2>
        <div className="actions">
          <Link
            className="btn-ghost"
            to={`/templates/${template.template_id}/test`}
          >
            Test Send
          </Link>
        </div>
      </div>
      <ErrorText error={error} />

      <div className="form-grid">
        <div className="form-group">
          <span className="form-label">Template ID</span>
          <div className="readonly">{template.template_id}</div>
        </div>
        <div className="form-group">
          <span className="form-label">Status</span>
          <StatusBadge status={template.status} />
        </div>
        <div className="form-group">
          {canEditByMarketer || isManager ? (
            <>
              <label htmlFor={channelFieldId}>Channel</label>
              <select
                id={channelFieldId}
                className="select"
                value={channel}
                onChange={(e) => setChannel(Number(e.target.value))}
              >
                <option value={1}>Email</option>
                <option value={2}>SMS</option>
              </select>
            </>
          ) : (
            <>
              <span className="form-label">Channel</span>
              <ChannelTag channel={template.channel} />
            </>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={nameFieldId}>Name</label>
          <input
            id={nameFieldId}
            className="input"
            value={name}
            disabled={!canEditByMarketer && !isManager}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor={signNameFieldId}>Sign Name</label>
          <input
            id={signNameFieldId}
            className="input"
            value={signName}
            disabled={!canEditByMarketer && !isManager}
            onChange={(e) => setSignName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor={subjectFieldId}>Subject</label>
          <input
            id={subjectFieldId}
            className="input"
            value={subject}
            disabled={!canEditByMarketer && !isManager}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor={contentFieldId}>Content</label>
          <textarea
            id={contentFieldId}
            className="textarea"
            rows={10}
            value={content}
            disabled={!canEditByMarketer && !isManager}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <span className="form-label">Source ID</span>
          <div className="readonly">{template.source_id}</div>
        </div>
        <div className="form-group">
          <span className="form-label">Created At</span>
          <div className="readonly">{template.create_time}</div>
        </div>
        <div className="form-group">
          <span className="form-label">Updated At</span>
          <div className="readonly">{template.modify_time}</div>
        </div>
      </div>

      <div className="form-actions">
        {(canEditByMarketer || isManager) && (
          <button
            className="btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
        {isManager && template.status === 1 && (
          <button
            className="btn-success"
            disabled={saving}
            onClick={handleApprove}
          >
            Approve
          </button>
        )}
        {isManager && (
          <button
            className="btn-danger"
            disabled={saving}
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
        <button className="btn-ghost" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  );
};
