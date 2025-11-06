import React, { useState } from "react";
import { Link } from "react-router-dom";
import { fetchTemplateById } from "../api/client";
import { Template } from "../types";
import { ChannelTag, ErrorText, LoadingSpinner, StatusBadge } from "../components/ui";
import { useAuth } from "../state/AuthContext";

export const TemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateIdInput, setTemplateIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { role } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTemplateId = templateIdInput.trim();
    if (!trimmedTemplateId) {
      setError("Template ID is required.");
      setTemplates([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tpl = await fetchTemplateById(trimmedTemplateId);
      setTemplates([tpl]);
      setTemplateIdInput(trimmedTemplateId);
    } catch (err: any) {
      setTemplates([]);
      setError(err.message || "Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTemplateIdInput("");
    setTemplates([]);
    setError("");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Template List</h2>
        <div className="actions">
          <Link to="/templates/new" className="btn-primary">
            + Create Template
          </Link>
        </div>
      </div>

      <form className="filters" onSubmit={handleSearch}>
        <div>
          <label className="sc-only" htmlFor="template-id-search">
            Search by template ID
          </label>
          <input
            id="template-id-search"
            className="input"
            placeholder="Search by template ID..."
            value={templateIdInput}
            onChange={(e) => setTemplateIdInput(e.target.value)}
          />
        </div>
        <div className="filters-actions">
          <button type="submit" className="btn-primary">
            Search
          </button>
          <button type="button" className="btn-ghost" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner />}
      <ErrorText error={error} />

      {!loading && templates.length === 0 && !error && (
        <div className="empty-state">No templates found.</div>
      )}

      {!loading && templates.length > 0 && (
        <>
          <table className="neon-table">
            <thead>
              <tr>
                <th>Template ID</th>
                <th>Name</th>
                <th>Sign</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>{tpl.template_id}</td>
                  <td>
                    <Link className="link" to={`/templates/${tpl.template_id}`}>
                      {tpl.name}
                    </Link>
                  </td>
                  <td>{tpl.sign_name}</td>
                  <td>
                    <ChannelTag channel={tpl.channel} />
                  </td>
                  <td>
                    <StatusBadge status={tpl.status} />
                  </td>
                  <td>{tpl.modify_time}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="btn-ghost-xs"
                        to={`/templates/${tpl.template_id}`}
                      >
                        View
                      </Link>
                      {role === "MARKETER" && (
                        <Link
                          className="btn-ghost-xs"
                          to={`/templates/${tpl.template_id}/test`}
                        >
                          Test
                        </Link>
                      )}
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
