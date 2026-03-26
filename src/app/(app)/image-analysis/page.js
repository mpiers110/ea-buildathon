"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { saveAnalysis } from "@/lib/firestore";

export default function ImageAnalysisPage() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setAnalysis(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnalysis(data);

      // Save to Firestore
      await saveAnalysis({
        fileName: image.name,
        analysis: data.analysis,
        urgency: data.urgency,
      });
    } catch (err) {
      setAnalysis({
        error: true,
        analysis: `❌ **Error**: ${err.message}\n\nPlease check your API key and try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          📸 Medical Image Analysis
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Upload photos of skin conditions, wounds, rashes, or eye symptoms for
          AI-powered assessment.
        </p>
      </div>

      <div className="disclaimer-bar">
        <span>⚠️</span>
        <span>
          Image analysis provides initial assessment only. Do not use for
          definitive diagnosis. Always consult a qualified healthcare provider.
        </span>
      </div>

      <div className="analysis-layout">
        {/* Upload Zone */}
        <div>
          <div
            className={`upload-zone ${dragover ? "dragover" : ""} ${imagePreview ? "has-image" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragover(true);
            }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files[0])}
              accept="image/*"
              hidden
            />

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Upload preview"
                className="upload-preview"
              />
            ) : (
              <>
                <div className="upload-zone-icon">📷</div>
                <h3>Upload Medical Image</h3>
                <p>
                  Drag & drop or click to browse
                  <br />
                  Supports JPG, PNG, WebP
                </p>
              </>
            )}
          </div>

          {imagePreview && (
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? "⏳ Analyzing with Gemini..." : "🔍 Analyze Image"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ flex: "0 0 auto" }}
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="analysis-results">
          <h3>
            🔬 Analysis Results
            {analysis?.urgency && (
              <span
                className={`triage-badge ${analysis.urgency.toLowerCase()}`}
                style={{ marginLeft: 12, fontSize: 11 }}
              >
                {analysis.urgency}
              </span>
            )}
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="loading-spinner" />
              <p
                style={{
                  color: "var(--text-muted)",
                  marginTop: 16,
                  fontSize: 14,
                }}
              >
                Analyzing image with Gemini AI...
              </p>
            </div>
          ) : analysis ? (
            <div className="analysis-content">
              <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
            </div>
          ) : (
            <div className="analysis-placeholder">
              <div className="analysis-placeholder-icon">🔬</div>
              <h3>No Analysis Yet</h3>
              <p>
                Upload an image and click "Analyze" to get AI-powered assessment
                results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
