import React from "react";

export const StatusBadge: React.FC<{ status: number }> = ({ status }) => {
  const { text, className } = getStatusMeta(status);
  return <span className={`badge ${className}`}>{text}</span>;
};

function getStatusMeta(status: number): { text: string; className: string } {
  switch (status) {
    case 1:
      return { text: "Pending", className: "badge-warning" };
    case 2:
      return { text: "Approved", className: "badge-success" };
    case 3:
      return { text: "Rejected", className: "badge-danger" };
    default:
      return { text: `Status ${status}`, className: "badge-default" };
  }
}

export const ChannelTag: React.FC<{ channel: number }> = ({ channel }) => {
  let text = "";
  switch (channel) {
    case 1:
      text = "Email";
      break;
    case 2:
      text = "SMS";
      break;
    default:
      text = `Channel ${channel}`;
  }
  return <span className="badge badge-outline">{text}</span>;
};

export const LoadingSpinner: React.FC = () => (
  <div className="spinner">
    <div className="spinner-circle" />
    <span>Loading...</span>
  </div>
);

export const ErrorText: React.FC<{ error: string }> = ({ error }) =>
  error ? <div className="error-text">{error}</div> : null;