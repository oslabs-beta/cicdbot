import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTemplates } from "../api/client";
import { Template } from "../types";
import { ChannelTag, ErrorText, LoadingSpinner, StatusBadge } from "../components/ui";
import { useAuth } from "../state/AuthContext";

export const TemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<number | undefined>();
  const [channel, setChannel] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const { role } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchTemplates({ keyword, status, channel, page, pageSize })
      .then((res) => {
        setTemplates(res.list);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message || "Failed to load templates"))
      .finally(() => setLoading(false));
  }, [keyword, status, channel, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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

      <div className="filters">
        <div>
          <label className="sc-only" htmlFor="keyword-search">
            Search by name or template ID
          </label>
          <input
            id="keyword-search"
            className="input"
            placeholder="Search by name or template id..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <label className="sc-only" htmlFor="status-filter">
            Filter by status
          </label>
          <select
            id="status-filter"
            className="select"
            value={status ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setStatus(v ? Number(v) : undefined);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            <option value="1">Pending</option>
            <option value="2">Approved</option>
            <option value="3">Rejected</option>
          </select>
        </div>
        <div>
          <label className="sc-only" htmlFor="channel-filter">
            Filter by channel
          </label>
          <select
            id="channel-filter"
            className="select"
            value={channel ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setChannel(v ? Number(v) : undefined);
              setPage(1);
            }}
          >
            <option value="">All channels</option>
            <option value="1">Email</option>
            <option value="2">SMS</option>
          </select>
        </div>
      </div>

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

          <div className="pagination">
            <button
              className="btn-ghost-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              « Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="btn-ghost-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next »
            </button>
          </div>
        </>
      )}
    </div>
  );
};
