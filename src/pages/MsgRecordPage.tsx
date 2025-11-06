import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchMsgRecordById, fetchMsgRecords } from "../api/client";
import { MsgRecord } from "../types";
import { ChannelTag, ErrorText, LoadingSpinner, StatusBadge } from "../components/ui";

interface LocationState {
  msgId?: string;
}

export const MsgRecordPage: React.FC = () => {
  const location = useLocation();
  const navState = location.state as LocationState | null;
  const [msgId, setMsgId] = useState(navState?.msgId || "");
  const [records, setRecords] = useState<MsgRecord[]>([]);
  const [status, setStatus] = useState<number | undefined>();
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setLoading(true);
    setError("");
    try {
      if (msgId) {
        const list = await fetchMsgRecordById(msgId);
        setRecords(list);
      } else {
        const res = await fetchMsgRecords({
          templateId: templateId || undefined,
          status,
          page: 1,
          pageSize: 50,
        });
        setRecords(res.list);
      }
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (msgId) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>Message Records</h2>
      </div>

      <div className="filters">
        <div>
          <label className="sc-only" htmlFor="msg-id-search">
            Search by message ID (exact match)
          </label>
          <input
            id="msg-id-search"
            className="input"
            placeholder="Search by msg_id (exact match)"
            value={msgId}
            onChange={(e) => setMsgId(e.target.value)}
          />
        </div>
        <span className="filter-separator">OR</span>
        <div>
          <label className="sc-only" htmlFor="template-id-filter">
            Filter by template ID
          </label>
          <input
            id="template-id-filter"
            className="input"
            placeholder="Filter by template_id"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
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
            }}
          >
            <option value="">All status</option>
            <option value="1">Pending</option>
            <option value="2">Success</option>
            <option value="3">Failed</option>
          </select>
        </div>
        <button className="btn-primary" onClick={search}>
          Search
        </button>
      </div>

      {loading && <LoadingSpinner />}
      <ErrorText error={error} />

      {!loading && records.length === 0 && !error && (
        <div className="empty-state">No records found.</div>
      )}

      {!loading && records.length > 0 && (
        <table className="neon-table">
          <thead>
            <tr>
              <th>msg_id</th>
              <th>template_id</th>
              <th>channel</th>
              <th>to</th>
              <th>subject</th>
              <th>status</th>
              <th>retry</th>
              <th>created</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.msg_id}</td>
                <td>{r.template_id}</td>
                <td>
                  <ChannelTag channel={r.channel} />
                </td>
                <td>{r.to}</td>
                <td>{r.subject}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td>{r.retry_count}</td>
                <td>{r.create_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
