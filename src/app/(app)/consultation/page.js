"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  createConsultation,
  updateConsultation,
  saveRecord,
} from "@/lib/firestore";

export default function ConsultationPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [triageLevel, setTriageLevel] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [ehrGenerating, setEhrGenerating] = useState(false);
  const [ehrGenerated, setEhrGenerated] = useState(false);
  const [activeInput, setActiveInput] = useState(null); // { type, options, min, max }
  const [scaleValue, setScaleValue] = useState(5);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const newSessionId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    setSessionId(newSessionId);

    const initialAiMsg = {
      role: "ai",
      content: `### 👋 Welcome to AfyaScribe Consultation

I'm your AI-powered healthcare triage assistant. I'll guide you through a step-by-step patient assessment.

- I'll ask **one question at a time**
- Some questions have **quick-select options**
- Others let you **type freely**

**Let's begin!** Please describe the patient's main complaint or symptoms.

> ⚠️ *This is an AI assistant for initial assessment only. Always refer to qualified healthcare providers for definitive diagnosis.*`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([initialAiMsg]);

    // Initialize consultation in Firestore
    createConsultation(newSessionId, {
      messages: [initialAiMsg],
    });

    // Start with text input for initial complaint
    setActiveInput({ type: "text" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text, imgFile = null, imgPreviewUrl = null) => {
    if (loading) return;
    if (!text && !imgFile) return;

    const userMsg = {
      role: "user",
      content: text,
      image: imgPreviewUrl,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setActiveInput(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("message", text);
    formData.append("sessionId", sessionId);
    if (imgFile) {
      formData.append("image", imgFile);
    }

    // Clear image state
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.triageLevel) {
        setTriageLevel(data.triageLevel);
      }

      const aiMsg = {
        role: "ai",
        content: data.response,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Set the active input type for the next question
      if (data.inputType) {
        setActiveInput(data.inputType);
        if (data.inputType.type === "scale") {
          setScaleValue(
            Math.ceil((data.inputType.min + data.inputType.max) / 2),
          );
        }
      } else {
        // Final assessment — no input needed, but keep textarea available
        setActiveInput(null);
      }

      // Save consultation to Firestore
      updateConsultation(sessionId, {
        messages: [...messages, userMsg, aiMsg],
        triageLevel: data.triageLevel || triageLevel,
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `❌ **Error**: ${err.message}\n\nPlease check your API key in \`.env.local\` and ensure the server is running.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setActiveInput({ type: "text" });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !image) return;
    await sendMessage(trimmed, image, imagePreview);
  };

  const handleOptionClick = async (option) => {
    await sendMessage(option);
  };

  const handleScaleSubmit = async () => {
    await sendMessage(`${scaleValue}`);
  };

  const handleGenerateEHR = async () => {
    if (messages.length < 3) return;
    setEhrGenerating(true);

    try {
      const res = await fetch("/api/generate-ehr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
          triageLevel,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Save EHR to Firestore
      await saveRecord({
        sessionId,
        triageLevel: triageLevel || "LOW",
        ehr: data.ehr,
        summary: data.summary || "Consultation record",
      });

      setEhrGenerated(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `### ✅ Electronic Health Record Generated

The EHR has been saved successfully. You can view it in the **Health Records** section.

**Triage Level**: ${triageLevel || "PENDING"}

[View Records →](/records)`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `❌ **Error generating EHR**: ${err.message}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setEhrGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const triageBadgeClass = triageLevel ? triageLevel.toLowerCase() : null;

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">🩺</div>
          <div>
            <h2>AI Consultation</h2>
            <p>Step-by-step patient assessment</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {triageLevel && (
            <div className={`triage-badge ${triageBadgeClass}`}>
              {triageLevel === "LOW" && "🟢"}
              {triageLevel === "MODERATE" && "🟡"}
              {triageLevel === "HIGH" && "🔴"}
              {triageLevel === "EMERGENCY" && "🚨"} {triageLevel}
            </div>
          )}
          {messages.length > 3 && !ehrGenerated && (
            <button
              className="generate-ehr-btn"
              onClick={handleGenerateEHR}
              disabled={ehrGenerating}
            >
              {ehrGenerating ? "⏳ Generating..." : "📋 Generate EHR"}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === "user" ? "user" : "ai"}`}
          >
            {msg.image && (
              <img
                src={msg.image}
                alt="Attached"
                className="chat-bubble-image"
              />
            )}
            {msg.role === "ai" ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              <span>{msg.content}</span>
            )}
            <div className="chat-bubble-time">{msg.time}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-typing">
            <div className="chat-typing-dot" />
            <div className="chat-typing-dot" />
            <div className="chat-typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Input Area */}
      <div className="chat-input-area">
        {/* Options Input */}
        {activeInput?.type === "options" && !loading && (
          <div className="chat-options-area">
            <div className="chat-options-grid">
              {activeInput.options.map((option, i) => (
                <button
                  key={i}
                  className="chat-option-btn"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="chat-options-or">
              <span>or type your own answer below</span>
            </div>
          </div>
        )}

        {/* Scale Input */}
        {activeInput?.type === "scale" && !loading && (
          <div className="chat-scale-area">
            <div className="chat-scale-header">
              <span className="chat-scale-label">
                {scaleValue <= 3
                  ? "😊 Mild"
                  : scaleValue <= 6
                    ? "😐 Moderate"
                    : scaleValue <= 8
                      ? "😟 Severe"
                      : "😣 Very Severe"}
              </span>
              <span className="chat-scale-value">{scaleValue}</span>
            </div>
            <div className="chat-scale-track">
              <input
                type="range"
                min={activeInput.min}
                max={activeInput.max}
                value={scaleValue}
                onChange={(e) => setScaleValue(parseInt(e.target.value))}
                className="chat-scale-slider"
              />
              <div className="chat-scale-labels">
                <span>{activeInput.min}</span>
                <span>{activeInput.max}</span>
              </div>
            </div>
            <button className="chat-scale-submit" onClick={handleScaleSubmit}>
              Confirm: {scaleValue} / {activeInput.max} →
            </button>
          </div>
        )}

        {/* Text Input (always shown as fallback) */}
        <div className="chat-input-wrapper">
          {imagePreview && (
            <div className="chat-image-preview">
              <img src={imagePreview} alt="Preview" />
              <span>{image?.name}</span>
              <button
                className="chat-image-remove"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                ✕
              </button>
            </div>
          )}
          <div className="chat-input-row">
            <button
              className="chat-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              hidden
            />
            <textarea
              ref={inputRef}
              className="chat-input"
              rows={1}
              placeholder={
                activeInput?.type === "options"
                  ? "Or type your own answer..."
                  : activeInput?.type === "scale"
                    ? "Or type a number..."
                    : "Describe symptoms or answer the question..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
        </div>
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={loading || (!input.trim() && !image)}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
