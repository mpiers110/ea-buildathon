import "@/app/globals.css";

export const metadata = {
  title: "AfyaScribe — Healthcare Assistant for Rural Africa",
  description:
    "AI-powered multimodal healthcare assistant providing symptom triage, image-based diagnosis, and EHR generation for Community Health Workers in rural East Africa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
