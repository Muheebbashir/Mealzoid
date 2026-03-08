import { useState } from "react";
import type { CSSProperties } from "react";
import { useAddRole } from "../hooks/useAddRole";
import type { Role } from "../types/Role.types";

const roles = [
  {
    id: "customer",
    label: "Customer",
    emoji: "🛍️",
    description: "Order food & groceries",
  },
  {
    id: "rider",
    label: "Rider",
    emoji: "🏍️",
    description: "Deliver & earn money",
  },
  {
    id: "seller",
    label: "Seller",
    emoji: "🍽️",
    description: "Sell your food online",
  },
];

export default function RoleSelect() {
  const [selected, setSelected] = useState<string | null>(null);
  const { addRole, isLoading } = useAddRole();

 const handleContinue = () => {
  if (!selected) return;
  addRole(selected as Role);
  };

  return (
    <div style={styles.page}>
      <div style={styles.blobTop} />
      <div style={styles.blobBottom} />

      <div style={styles.card} className="role-select-card">
        <div style={styles.logoRow}>
          <img src="/logo1.png" alt="Mealzoid" style={styles.logoImg} />
        </div>

        <h1 style={styles.heading}>Choose your role</h1>
        <p style={styles.sub}>
          Tell us how you want to use Mealzoid. You can always change this later.
        </p>

        <div style={styles.roleGrid} className="role-grid">
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                style={{
                  ...styles.roleCard,
                  ...(isSelected ? styles.roleCardActive : {}),
                }}
              >
                <div
                  style={{
                    ...styles.check,
                    ...(isSelected ? styles.checkActive : {}),
                  }}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div style={styles.roleEmoji}>{role.emoji}</div>
                <div style={styles.roleLabel}>{role.label}</div>
                <div style={styles.roleDesc}>{role.description}</div>

                {isSelected && <div style={styles.glowRing} />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || isLoading}
          style={{
            ...styles.nextBtn,
            ...(selected && !isLoading ? styles.nextBtnActive : styles.nextBtnDisabled),
          }}
        >
          {isLoading ? (
            "Setting up your account..."
          ) : selected ? (
            <>
              {`Continue as ${selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : ''}`}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginLeft: 8 }}>
                <path
                  d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          ) : (
            "Select a role to continue"
          )}
        </button>

        <p style={styles.terms}>
          By continuing, you agree to our{" "}
          <span style={styles.link}>Terms of Service</span> &{" "}
          <span style={styles.link}>Privacy Policy</span>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; background: none; font-family: inherit; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @media (max-width: 380px) {
          .role-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .role-select-card { padding: 24px 20px !important; }
        }
        @media (min-width: 381px) and (max-width: 420px) {
          .role-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .role-grid > button { padding: 14px 6px !important; }
          .role-select-card { padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}

const RED = "#E23744";
const RED_DARK = "#c0303c";
const RED_LIGHT = "#fef2f3";

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff7f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Sora', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  blobTop: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, #ffd6d9 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blobBottom: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "radial-gradient(circle, #ffe4e6 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "#ffffff",
    borderRadius: 24,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 8px 48px rgba(226,55,68,0.10), 0 2px 8px rgba(0,0,0,0.06)",
    animation: "fadeUp 0.5s ease both",
    position: "relative",
    zIndex: 1,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logoImg: {
    height: 140,
    objectFit: "contain" as CSSProperties["objectFit"],
  },
  heading: {
    fontSize: 26,
    fontWeight: 800,
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: "-0.5px",
  },
  sub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 28,
    lineHeight: 1.6,
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "20px 10px",
    borderRadius: 16,
    border: "2px solid #f0f0f0",
    background: "#fafafa",
    cursor: "pointer",
    transition: "all 0.2s ease",
    overflow: "hidden",
  },
  roleCardActive: {
    border: `2px solid ${RED}`,
    background: RED_LIGHT,
    transform: "translateY(-2px)",
    boxShadow: `0 8px 24px rgba(226,55,68,0.18)`,
  },
  check: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "2px solid #ddd",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  checkActive: {
    border: `2px solid ${RED}`,
    background: RED,
  },
  glowRing: {
    position: "absolute",
    inset: 0,
    borderRadius: 14,
    border: `2px solid ${RED}`,
    animation: "pulse-ring 1s ease-out infinite",
    pointerEvents: "none",
  },
  roleEmoji: {
    fontSize: 32,
    lineHeight: 1,
    marginBottom: 2,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  roleDesc: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    lineHeight: 1.4,
  },
  nextBtn: {
    width: "100%",
    padding: "15px 24px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    marginBottom: 16,
    letterSpacing: "-0.2px",
  },
  nextBtnActive: {
    background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)`,
    color: "white",
    boxShadow: `0 6px 20px rgba(226,55,68,0.4)`,
    cursor: "pointer",
  },
  nextBtnDisabled: {
    background: "#f0f0f0",
    color: "#bbb",
    cursor: "not-allowed",
  },
  terms: {
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
    lineHeight: 1.6,
  },
  link: {
    color: RED,
    cursor: "pointer",
    fontWeight: 600,
  },
};