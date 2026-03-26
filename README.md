# 🏥 AfyaScribe — Multimodal Healthcare Assistant for Rural Africa

> **Build with AI East Africa Buildathon** | Category: **AI for Health / Social Good**

---

## 🎯 The Problem

**Over 50% of Sub-Saharan Africans lack access to basic healthcare.** Rural communities face:

- **No nearby doctors** — patients travel 50+ km for a basic consultation
- **Delayed diagnosis** — treatable conditions become fatal due to late detection
- **No medical records** — paper-based systems, records lost, no continuity of care
- **Language barriers** — medical information only available in English
- **Overwhelmed CHWs** — Community Health Workers handle 100s of patients with zero digital tools

> \*A mother in rural Kenya notices a rash on her child. The nearest clinic is 4 hours away. She doesn't know if it's urgent or can wait. She has no record of previous visits. **AfyaScribe changes this.\***

---

## 💡 The Solution: AfyaScribe

**AfyaScribe** ("Afya" = Health in Swahili) is a **multimodal AI-powered healthcare assistant** that enables Community Health Workers and patients in rural areas to:

1. **📸 Snap & Assess** — Upload photos of skin conditions, wounds, eye symptoms → AI-powered visual analysis
2. **💬 Describe & Triage** — Chat with AI about symptoms in plain language → intelligent triage & urgency scoring
3. **📋 Auto-Generate EHR** — Every consultation auto-generates a structured Electronic Health Record
4. **📝 Clinical Notes** — AI generates professional clinical notes from the conversation
5. **🌍 Multilingual** — Works in English and Swahili (extensible to other languages)

---

## 🏗️ Architecture & Google Cloud Stack

```
┌──────────────────────────────────────────────────────┐
│                    AfyaScribe Frontend                    │
│         (Responsive Web App - HTML/CSS/JS)           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Symptom  │ │  Image   │ │   EHR    │ │ Clinical │ │
│  │  Chat    │ │  Upload  │ │  Viewer  │ │  Notes   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
└───────┼─────────────┼────────────┼────────────┼───────┘
        │             │            │            │
┌───────┼─────────────┼────────────┼────────────┼───────┐
│       ▼             ▼            ▼            ▼       │
│              Node.js / Express Backend                │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │              Google Cloud APIs                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │ Gemini   │ │ Vision   │ │ Cloud        │   │   │
│  │  │ API      │ │ API      │ │ Firestore    │   │   │
│  │  │(Multimod)│ │(Image    │ │ (EHR Store)  │   │   │
│  │  │          │ │ Analysis)│ │              │   │   │
│  │  └──────────┘ └──────────┘ └──────────────┘   │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

### Google Technologies Used

| Technology                        | Purpose                                                           |
| --------------------------------- | ----------------------------------------------------------------- |
| **Gemini API** (gemini-2.5-flash) | Multimodal AI — symptom chat, image understanding, clinical notes |
| **Google Cloud Vision API**       | Medical image preprocessing, label detection, feature extraction  |
| **Vertex AI**                     | Model hosting, structured prediction pipelines                    |
| **Cloud Firestore**               | Store patient EHRs, consultation history                          |
| **Google Cloud Run**              | Serverless deployment                                             |

---

## 🖥️ Key Screens & Features

### 1. **Landing / Dashboard**

- Clean, medical-themed hero
- Quick-action cards: "Start Consultation", "View Records", "Upload Image"
- Stats: total consultations, patients assessed today

### 2. **Consultation Chat (Star Feature ⭐)**

- Conversational symptom assessment powered by Gemini
- AI asks follow-up questions intelligently
- Real-time **triage score** (🟢 Low → 🟡 Moderate → 🔴 High urgency)
- Supports text + image input in same conversation
- Swahili/English toggle

### 3. **Image Analysis**

- Upload/capture photos of: skin conditions, wounds, eye symptoms, rashes
- Vision API extracts features → Gemini provides assessment
- Side-by-side: uploaded image + AI analysis with confidence scores
- Visual annotation of detected areas

### 4. **EHR Generator**

- Auto-generated from consultation
- Structured format: Patient info, Chief complaint, History, Assessment, Plan
- Downloadable as PDF
- Stored in Firestore for future reference

### 5. **Clinical Notes**

- SOAP-format notes auto-generated from the AI conversation
- Subjective, Objective, Assessment, Plan
- Editable by the CHW before saving

---

## 🔥 Why This Wins

| Criteria               | How AfyaScribe Delivers                                              |
| ---------------------- | -------------------------------------------------------------------- |
| **High Impact**        | Directly addresses healthcare access for 600M+ underserved Africans  |
| **Actual Problem**     | WHO reports 1 doctor per 10,000 people in rural East Africa          |
| **Visual & Demo-able** | Live image analysis, real-time chat triage, auto-generated EHRs      |
| **Google Tech**        | Deep integration with Gemini, Vision API, Vertex AI, Firestore       |
| **Innovation**         | Multimodal AI + local language support = unprecedented accessibility |
| **Feasibility**        | Can build MVP in 60 minutes with focused scope                       |

---

## ⏱️ 60-Minute Build Plan

| Time      | Task                                                                     |
| --------- | ------------------------------------------------------------------------ |
| 0-5 min   | Project setup (Vite + Express), API keys configured                      |
| 5-15 min  | Backend: Gemini API integration, system prompts, image analysis endpoint |
| 15-30 min | Frontend: Dashboard + Consultation chat UI                               |
| 30-40 min | Image upload + analysis display, triage scoring                          |
| 40-50 min | EHR generation + clinical notes auto-generation                          |
| 50-55 min | Polish: animations, responsive design, loading states                    |
| 55-60 min | Final testing + demo prep                                                |

---

## 🗣️ Demo Script (2 minutes)

1. **"Meet Mary"** — CHW in rural Kenya, handles 50+ patients/day with zero tools
2. **Live demo**: Patient has skin rash → upload photo → AI analysis in seconds
3. **Symptom chat**: "The patient has fever for 3 days and headache" → AI asks smart follow-ups → triage: 🔴 HIGH
4. **Auto-generated EHR** — one click, professional medical record created
5. **Impact**: "AfyaScribe can be the first line of healthcare for 600 million people"

---

## 🛠️ Technical Implementation Details

### Gemini System Prompt (Medical Triage)

```
You are AfyaScribe, a medical triage assistant for Community Health Workers
in rural East Africa. Your role is to:
1. Conduct structured symptom assessments
2. Provide urgency triage (LOW/MODERATE/HIGH/EMERGENCY)
3. Suggest potential conditions (always with disclaimers)
4. Generate structured clinical notes
5. Recommend next steps (home care, clinic visit, emergency referral)

IMPORTANT: Always include disclaimer that this is an AI assistant
and not a replacement for professional medical advice.
```

### Key API Endpoints

```
POST /api/consultation    → Start/continue chat with Gemini
POST /api/analyze-image   → Upload image → Vision API + Gemini analysis
POST /api/generate-ehr    → Generate EHR from consultation
GET  /api/records/:id     → Retrieve patient records
```

---

## 📊 Impact Metrics to Highlight

- **4.5 billion** people lack access to essential health services globally
- **1 doctor per 10,000** people in rural East Africa
- **50%** of Sub-Saharan Africa lives >5km from nearest health facility
- AfyaScribe could reduce unnecessary clinic visits by **40%** through proper triage
- EHR generation saves CHWs **2+ hours** of paperwork daily
