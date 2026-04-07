import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "#007AFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="116" height="72" viewBox="0 0 116 72" fill="none">
          {/* < bracket */}
          <path
            d="M28 4L4 36L28 68"
            stroke="white"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* / slash */}
          <path
            d="M74 4L42 68"
            stroke="white"
            strokeWidth="9"
            strokeLinecap="round"
            strokeOpacity="0.55"
          />
          {/* > bracket */}
          <path
            d="M88 4L112 36L88 68"
            stroke="white"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
