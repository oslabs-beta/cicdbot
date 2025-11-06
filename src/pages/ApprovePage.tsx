import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveTemplate,
  deleteTemplate,
  fetchPendingTemplates,
} from "../api/client";
import { Template } from "../types";
import {
  ChannelTag,
  ErrorText,
  LoadingSpinner,
  StatusBadge,
} from "../components/ui";

export const ApprovePage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPendingTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchPendingTemplates();
      // Filter any templates that may have been updated to non-pending status
      setTemplates(list.filter((tpl) => tpl.status === 1));
    } catch (err: any) {
      setTemplates([]);
      setError(err.message || "Failed to load pending templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingTemplates();
  }, [loadPendingTemplates]);

  const handleApprove = async (templateId: string) => {
    if (!window.confirm("Approve this template?")) return;
    setProcessingId(templateId);
    setError("");
    try {
      await approveTemplate(templateId);
      setTemplates((prev) =>
        prev.filter((tpl) => tpl.template_id !== templateId)
      );
    } catch (e: any) {
      setError(e.message || "Approve failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm("Delete this template?")) return;
    setProcessingId(templateId);
    setError("");
    try {
      await deleteTemplate(templateId);
      setTemplates((prev) =>
        prev.filter((tpl) => tpl.template_id !== templateId)
      );
    } catch (e: any) {
      setError(e.message || "Delete failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Approval Center</h2>
        <div className="actions">
          <button
            className="btn-ghost"
            onClick={() => void loadPendingTemplates()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorText error={error} />

      {!loading && templates.length === 0 && !error && (
        <div className="empty-state">
          No pending templates awaiting approval.
        </div>
      )}

      {!loading && templates.length > 0 && (
        <table className="neon-table">
          <thead>
            <tr>
              <th>Template ID</th>
              <th>Name</th>
              <th>Source ID</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.template_id}>
                <td>
                  <Link className="link" to={`/templates/${template.template_id}`}>
                    {template.template_id}
                  </Link>
                </td>
                <td>{template.name}</td>
                <td>{template.source_id}</td>
                <td>
                  <ChannelTag channel={template.channel} />
                </td>
                <td>
                  <StatusBadge status={template.status} />
                </td>
                <td>{template.create_time}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-success-xs"
                      disabled={
                        processingId === template.template_id ||
                        template.status !== 1
                      }
                      onClick={() => void handleApprove(template.template_id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-danger-xs"
                      disabled={processingId === template.template_id}
                      onClick={() => void handleDelete(template.template_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
