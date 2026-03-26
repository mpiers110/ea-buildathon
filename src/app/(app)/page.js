"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    consultations: 0,
    images: 0,
    records: 0,
    triageHigh: 0,
  });
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    // Load stats from localStorage
    const consultations = JSON.parse(
      localStorage.getItem("afya_consultations") || "[]",
    );
    const analyses = JSON.parse(localStorage.getItem("afya_analyses") || "[]");
    const records = JSON.parse(localStorage.getItem("afya_records") || "[]");
    const highTriage = records.filter(
      (r) => r.triageLevel === "HIGH" || r.triageLevel === "EMERGENCY",
    ).length;

    setStats({
      consultations: consultations.length,
      images: analyses.length,
      records: records.length,
      triageHigh: highTriage,
    });

    setTimeout(() => setAnimateStats(true), 100);
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-badge">
          <span>🤖</span> Powered by Google Gemini
        </div>
        <h1>
          Welcome to <span>AfyaScribe</span>
        </h1>
        <p>
          AI-powered healthcare assistant for Community Health Workers. Perform
          symptom assessments, analyze medical images, and generate Electronic
          Health Records — all powered by multimodal AI.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-bar">
        <span>⚠️</span>
        <span>
          AfyaScribe is an AI-assisted tool for initial assessment only. It does
          not replace professional medical advice. Always refer patients to
          qualified healthcare providers for definitive diagnosis and treatment.
        </span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon teal">💬</div>
          <div className="stat-card-value">{stats.consultations}</div>
          <div className="stat-card-label">Consultations Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">📸</div>
          <div className="stat-card-value">{stats.images}</div>
          <div className="stat-card-label">Images Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon amber">📋</div>
          <div className="stat-card-value">{stats.records}</div>
          <div className="stat-card-label">EHRs Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red">🔴</div>
          <div className="stat-card-value">{stats.triageHigh}</div>
          <div className="stat-card-label">High Urgency Cases</div>
        </div>
      </div>

      {/* Action Cards */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        Quick Actions
      </h2>
      <div className="actions-grid">
        <Link href="/consultation" className="action-card">
          <div className="action-card-icon">💬</div>
          <h3>Start Consultation</h3>
          <p>
            Chat with AfyaScribe to assess patient symptoms. Get intelligent
            triage scoring and clinical recommendations.
          </p>
          <span className="action-card-arrow">→</span>
        </Link>

        <Link href="/image-analysis" className="action-card">
          <div className="action-card-icon">📸</div>
          <h3>Analyze Image</h3>
          <p>
            Upload photos of skin conditions, wounds, or eye symptoms for
            AI-powered visual assessment and analysis.
          </p>
          <span className="action-card-arrow">→</span>
        </Link>

        <Link href="/records" className="action-card">
          <div className="action-card-icon">📋</div>
          <h3>View Records</h3>
          <p>
            Access generated Electronic Health Records, clinical notes, and
            consultation history.
          </p>
          <span className="action-card-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
