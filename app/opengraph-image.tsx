import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "TCAP - Thai Credit Ability Planner";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0f0d",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Simple Logo Representation */}
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#10b77f",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "80px",
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(to right, #10b77f, #34d399)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            TCAP
          </h1>
        </div>
        <p
          style={{
            fontSize: "32px",
            color: "#9ca3af",
            margin: 0,
            maxWidth: "800px",
            textAlign: "center",
          }}
        >
          Thai Credit Ability Planner
        </p>
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              fontSize: "20px",
            }}
          >
            DSR Calculator
          </div>
          <div
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              fontSize: "20px",
            }}
          >
            Debt Planner
          </div>
          <div
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              fontSize: "20px",
            }}
          >
            Loan Simulator
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
