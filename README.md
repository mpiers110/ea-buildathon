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

> *A mother in rural Kenya notices a rash on her child. The nearest clinic is 4 hours away. She doesn't know if it's urgent or can wait. She has no record of previous visits. **AfyaScribe changes this.***

---

## 💡 The Solution: AfyaScribe

**AfyaScribe** ("Afya" = Health in Swahili) is a **multimodal AI-powered healthcare assistant** built with **Next.js** and **Google Gemini** that enables Community Health Workers and patients in rural areas to:

1. **📸 Smart Image Assessment** — Upload photos of skin conditions, wounds, or eye symptoms for AI-powered visual analysis.
2. **💬 Interactive Consultation** — A guided, one-question-at-a-time chat assessment with custom UI widgets (scales, option buttons) for precise data collection.
3. **📋 Persistent EHRs** — Every consultation auto-generates a structured Electronic Health Record (SOAP format) saved securely in **Firebase Firestore**.
4. **🟢 Intelligent Triage** — Real-time urgency scoring (Low, Moderate, High, Emergency) based on multimodal inputs.

---

## 🏗️ Architecture & Google Cloud Stack

```
┌──────────────────────────────────────────────────────────┐
│                    AfyaScribe Frontend                    │
│            (Next.js 15 App Router - React 19)             │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐     │
│  │ Dashboard│ │ Consult  │ │  Image   │ │ Records   │     │
│  │ (Stats)  │ │ (Chat)   │ │  Assess  │ │ (Firestore)│     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘     │
└───────┼─────────────┼────────────┼─────────────┼──────────┘
        │             │            │             │
        └─────────────┴─────┬──────┴─────────────┘
                            ▼
              ┌──────────────────────────┐
              │    Next.js API Routes     │
              │  (BFF / Serverless)      │
              └─────────────┬────────────┘
                            ▼
      ┌──────────────────────────────────────────────┐
      │             Google Cloud & Firebase          │
      │  ┌────────────┐ ┌────────────┐ ┌───────────┐ │
      │  │ Gemini 2.0 │ │ Firebase   │ │ Vertex AI │ │
      │  │ Flash API  │ │ Firestore  │ │ Platform  │ │
      │  └────────────┘ └────────────┘ └───────────┘ │
      └──────────────────────────────────────────────┘
```

### Google Technologies Used

| Technology                        | Purpose                                                           |
| --------------------------------- | ----------------------------------------------------------------- |
| **Gemini 2.0 Flash**              | Core multimodal AI — symptom triage, image assessment, EHR generation |
| **Firebase Firestore**            | Persistent storage for consultations, EHR records, and image analyses |
| **Next.js 15**                    | Unified framework for the responsive UI and Serverless API routes |
| **Google Cloud Run**             | Recommended platform for scalable deployment                      |

---

## 🖥️ Key Features

### 1. **Interactive Consultation (Star Feature ⭐)**
Unlike basic chatbots, AfyaScribe uses a **guided diagnostic flow**:
- **One question at a time**: Prevents user overwhelm.
- **Dynamic Widgets**: Pain scales (1-10) and option buttons (Age ranges, symptoms) for faster data entry.
- **Multimodal**: Attach images mid-conversation for Gemini to analyze contextually.

### 2. **Visual Assessment**
- Dedicated tool for skin, wound, and eye assessment.
- Gemini provides structured results: Observation, Potential Conditions, Urgency, and Next Steps.

### 3. **Health Records Repository**
- All generated EHRs (SOAP notes) are saved to Firestore.
- CHWs can search past records, view summaries, and download notes as Markdown files.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Gemini API Key ([Get one here](https://aistudio.google.com/apikey))
- Firebase Project ([Console](https://console.firebase.google.com/))

### Installation
1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with:
   ```plaintext
   GEMINI_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

---

## 🔥 Why This Wins
- **High Impact**: Directly addresses rural healthcare gaps for millions.
- **Multimodal Innovation**: Seamlessly combines vision and text for better triage.
- **CHW Friendly**: Minimal typing required via interactive buttons and scales.
- **Ready for Field Use**: Full persistence means no data loss during unreliable connectivity.
st line of healthcare for 600 million people"

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
