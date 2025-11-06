import React, { useEffect, useState } from "react";
import {
  approveTemplate,
  deleteTemplate,
  fetchTemplates,
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [operating, setOperating] = useState(false);
  const [error, setError] = useState("");

  const loadPending = () => {
    setLoading(true);
    setError("");
    fetchTemplates({ status: 1, page: 1, pageSize: 200 })
      .then((res) => setTemplates(res.list))
      .catch((e) => setError(e.message || "Failed to load templates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const toggleSelect = (tplId: string) => {
    setSelectedIds((prev) =>
      prev.includes(tplId) ? prev.filter((id) => id !== tplId) : [...prev, tplId]
    );
  };

  const handleApproveOne = async (tplId: string) => {
    if (!window.confirm("Approve this template?")) return;
    setOperating(true);
    setError("");
    try {
      await approveTemplate(tplId);
      loadPending();
    } catch (e: any) {
      setError(e.message || "Approve failed");
    } finally {
      setOperating(false);
    }
  };

  const handleDeleteOne = async (tplId: string) => {
    if (!window.confirm("Delete this template?")) return;
    setOperating(true);
    setError("");
    try {
      await deleteTemplate(tplId);
      loadPending();
    } catch (e: any) {
      setError(e.message || "Delete failed");
    } finally {
      setOperating(false);
    }
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Approve ${selectedIds.length} selected templates at once?`
      )
    )
      return;
    setOperating(true);
    setError("");
    try {
      for (const id of selectedIds) {
        await approveTemplate(id);
      }
      setSelectedIds([]);
      loadPending();
    } catch (e: any) {
      setError(e.message || "Batch approve failed");
    } finally {
      setOperating(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Approval Center</h2>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorText error={error} />

      {!loading && templates.length === 0 && (
        <div className="empty-state">No pending templates.</div>
      )}

      {!loading && templates.length > 0 && (
        <>
          <div className="batch-bar">
            <span>Pending templates: {templates.length}</span>
            <button
              className="btn-success"
              disabled={operating || selectedIds.length === 0}
              onClick={handleApproveSelected}
            >
              Approve Selected ({selectedIds.length})
            </button>
          </div>

          <table className="neon-table">
            <thead>
              <tr>
                <th>
                  <label className="sc-only" htmlFor="select-all-checkbox">
                        Select all templates
                  </label>
                  <input
                    id="select-all-checkbox"
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === templates.length
                    }
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedIds(templates.map((t) => t.template_id))
                        : setSelectedIds([])
                    }
                  />
                </th>
                <th>Template ID</th>
                <th>Name</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>
                    <label
                      className="sc-only"
                      htmlFor={`select-template-${tpl.template_id}`}
                    >
                      Select template {tpl.name || tpl.template_id}
                    </label>
                    <input
                      id={`select-template-${tpl.template_id}`}
                      type="checkbox"
                      checked={selectedIds.includes(tpl.template_id)}
                      onChange={() => toggleSelect(tpl.template_id)}
                    />
                  </td>
                  <td>{tpl.template_id}</td>
                  <td>{tpl.name}</td>
                  <td>
                    <ChannelTag channel={tpl.channel} />
                  </td>
                  <td>
                    <StatusBadge status={tpl.status} />
                  </td>
                  <td>{tpl.create_time}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-success-xs"
                        disabled={operating}
                        onClick={() => handleApproveOne(tpl.template_id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-danger-xs"
                        disabled={operating}
                        onClick={() => handleDeleteOne(tpl.template_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};
