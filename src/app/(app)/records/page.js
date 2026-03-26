"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { listRecords } from "@/lib/firestore";

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    async function loadRecords() {
      const saved = await listRecords();
      setRecords(saved);
    }
    loadRecords();
  }, []);

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTriageBadge = (level) => {
    const l = (level || "low").toLowerCase();
    const icons = { low: "🟢", moderate: "🟡", high: "🔴", emergency: "🚨" };
    return (
      <span className={`triage-badge ${l}`}>
        {icons[l] || "🟢"} {level || "LOW"}
      </span>
    );
  };

  if (selectedRecord) {
    return (
      <div className="page-container">
        <button
          className="btn btn-secondary"
          onClick={() => setSelectedRecord(null)}
          style={{ marginBottom: 24 }}
        >
          ← Back to Records
        </button>

        <div className="ehr-document">
          <div className="ehr-document-header">
            <div>
              <h2>📋 Electronic Health Record</h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Generated on {formatDate(selectedRecord.createdAt)}
              </p>
            </div>
            {getTriageBadge(selectedRecord.triageLevel)}
          </div>

          <div className="analysis-content">
            <ReactMarkdown>{selectedRecord.ehr}</ReactMarkdown>
          </div>

          <div className="ehr-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                const blob = new Blob([selectedRecord.ehr], {
                  type: "text/markdown",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `EHR_${selectedRecord.id}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              📥 Download EHR
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(selectedRecord.ehr);
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          📋 Health Records
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          View and manage auto-generated Electronic Health Records from AI
          consultations.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Records Yet</h3>
          <p>Start a consultation and generate an EHR to see records here.</p>
          <Link
            href="/consultation"
            className="btn btn-primary"
            style={{ marginTop: 20 }}
          >
            💬 Start Consultation
          </Link>
        </div>
      ) : (
        <div className="records-list">
          {records.map((record, i) => (
            <div
              key={record.id}
              className="record-card"
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setSelectedRecord(record)}
            >
              <div className="record-card-header">
                <span className="record-card-title">
                  Consultation #{record.id?.slice(0, 8)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {getTriageBadge(record.triageLevel)}
                  <span className="record-card-date">
                    {formatDate(record.createdAt)}
                  </span>
                </div>
              </div>
              <p className="record-card-summary">
                {record.summary || "AI-generated consultation record"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
