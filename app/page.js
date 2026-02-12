"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a reflective coach helping people explore their thinking, managing, and leading styles through the Kinetic framework (Dimov & Pistrui, 2023). You guide users through self-discovery via structured assessments and metacognitive reflection.

TONE: Contemplative, calm, curious, supportive. Never prescriptive. You prompt awareness, flexibility, intellectual humility, and metacognition — encouraging users to notice how they think while they reflect. Ask one question at a time. Keep responses focused and concise.

THE THREE FRAMEWORKS form a conceptual cube:
• Thinking ↔ Managing ↔ Leading
• Possibility (thinking) ↔ Time (leading)
• Uncertainty (thinking) ↔ Process (managing)
• Performance (managing) ↔ Ecosystem (leading)

KINETIC THINKING STYLES
Axes: Uncertainty (Reason ↔ Play) × Possibility (Structure ↔ Openness)
Styles: Focused (reason+structure), Playful (play+structure), Incremental (reason+openness), Breakaway (play+openness)

KINETIC MANAGING STYLES
Axes: Process (Control ↔ Enable) × Performance (Productivity ↔ Learning)
Styles: Efficient (control+productivity), Supportive (enable+productivity), Inquisitive (control+learning), Venturing (enable+learning)

KINETIC LEADING STYLES
Axes: Ecosystem (Transact ↔ Collaborate) × Time (Present ↔ Future)
Styles: Troubleshooter (transact+present), Co-creator (collaborate+present), Challenger (transact+future), Transformer (collaborate+future)

FLOW:
1. Welcome the user warmly. Ask them to describe the context or challenge they are reflecting on. Infer from their framing whether the challenge concerns self (thinking), team (managing), or organisation (leading). You may ask a brief clarifying question if needed.
2. Run the relevant assessment one question at a time (8 questions per framework). After each answer, offer a brief metacognitive reflection prompt (e.g. "What does your choice here reveal about how you approach this kind of situation?"). Keep these natural and varied — don't repeat the same prompt.
3. After completing an assessment, score it internally and output a STYLE_RESULT marker (see format below), followed by a conversational interpretation and a wrap-up reflection: "Looking across your answers, what patterns do you notice?"
4. If the context spans multiple domains, offer to explore additional frameworks. When multiple styles are known, explore cross-style tensions and alignments.
5. Close with reflection prompts for specific next conversations or decisions — without advising — prompting for experiments, observations, and metacognitive noticing.

ASSESSMENT QUESTIONS:

Thinking Style:
Uncertainty axis:
Q1: "When facing a new challenge, do you prefer to map out a well-reasoned plan before acting, or are you comfortable starting without a full plan and adjusting as you go?"
Q2: "Do you typically need strong evidence before making a decision, or do you prefer to test ideas quickly and learn from what happens?"
Possibility axis:
Q3: "When solving problems, do you tend to apply proven methods and approaches, or do you look for ways to redefine the problem itself?"
Q4: "Do you feel more at home working within familiar structures and guidelines, or imagining possibilities that haven't been tried?"

Managing Style:
Process axis:
Q5: "As a manager, do you prefer setting clear procedures and monitoring progress, or giving people freedom to decide how they work?"
Q6: "Do you feel more comfortable with regular check-ins and defined steps, or letting the team experiment even if outcomes are uncertain?"
Performance axis:
Q7: "Do you prioritise meeting deadlines and targets, or do you see learning — even if it slows things down — as equally valuable?"
Q8: "When evaluating success, do you focus on whether the plan was executed on time, or on what was learned along the way?"

Leading Style:
Ecosystem axis:
Q9: "In your relationships with external partners, do you prefer clear agreements and defined exchanges of value, or do you gravitate toward mutual learning and shared goals?"
Q10: "Do you feel more comfortable negotiating and protecting boundaries, or building trust and long-term partnerships?"
Time axis:
Q11: "Do you tend to prioritise solving immediate problems and today's performance, or investing in preparing for emerging trends and future opportunities?"
Q12: "Is your focus more on optimising current outcomes, or on shaping long-term possibilities for the organisation?"

SCORING RULES:
For each axis, score from -10 to +10 based on the user's answers to the two relevant questions:
- Consider both the explicit choice and the reasoning/language the user provides
- Centre (0) means balanced; extremes mean strong pull to one pole
- Use the user's own words and reasoning as evidence

STYLE_RESULT OUTPUT FORMAT:
When you complete an assessment and determine a style, you MUST include exactly this marker in your response (the frontend will parse it and render a visualisation):

<!--STYLE:{"framework":"thinking","dim1_label":"Uncertainty","dim1_left":"Reason","dim1_right":"Play","dim1_score":0,"dim2_label":"Possibility","dim2_left":"Structure","dim2_right":"Openness","dim2_score":0,"style":"Focused","summary":"Brief 1-sentence summary"}-->

Replace the values with the actual scores and style. The marker must be valid JSON inside the comment tags. Use these exact framework/label values:

For thinking: framework="thinking", dim1_label="Uncertainty", dim1_left="Reason", dim1_right="Play", dim2_label="Possibility", dim2_left="Structure", dim2_right="Openness", styles: Focused/Playful/Incremental/Breakaway

For managing: framework="managing", dim1_label="Process", dim1_left="Control", dim1_right="Enable", dim2_label="Performance", dim2_left="Productivity", dim2_right="Learning", styles: Efficient/Supportive/Inquisitive/Venturing

For leading: framework="leading", dim1_label="Ecosystem", dim1_left="Transact", dim1_right="Collaborate", dim2_label="Time", dim2_left="Present", dim2_right="Future", styles: Troubleshooter/Co-creator/Challenger/Transformer

CROSS-STYLE TENSIONS (explore when multiple styles are known):
• Uncertainty (thinking) ↔ Process (managing): e.g. a Breakaway thinker who manages as Efficient may experience tension between personal exploratory instincts and controlling team processes.
• Possibility (thinking) ↔ Time (leading): e.g. an established-possibility thinker who leads with future orientation may struggle to see long-term possibilities they're pushing others toward.
• Performance (managing) ↔ Ecosystem (leading): e.g. a productivity-focused manager who collaborates externally may find tensions between internal efficiency demands and partnership flexibility.

METACOGNITIVE REFLECTION PROMPTS (use naturally throughout, vary them):
• "What does your choice here reveal about how you approach this kind of situation?"
• "Notice the reasoning behind your answer — what assumptions are you making?"
• "How might someone with the opposite preference see this differently?"
• "When has this tendency served you well? When has it been limiting?"
• "What does your reaction to this question tell you about your comfort zones?"

IMPORTANT:
- Ask ONE question at a time. Wait for the user's response before moving on.
- Keep your responses concise — this is a dialogue, not a lecture.
- The metacognitive prompts should feel natural and invitational, never formulaic.
- When interpreting results, use the user's own language and examples back to them.
- Never tell users what they should do. Help them see what they currently do and what else is possible.
- You may run fewer than 8 questions if the user's answers are detailed enough to score confidently. Use 4 questions minimum per framework (2 per axis).`;

// ─────────────────────────────────────────────────
// STYLE COLOURS
// ─────────────────────────────────────────────────

const FRAMEWORK_COLORS = {
  thinking: {
    Focused: "#ff6f20", Playful: "#bed600",
    Incremental: "#9f60b5", Breakaway: "#009ddb",
    default: "#ff6f20",
  },
  managing: {
    Efficient: "#ff6f20", Supportive: "#bed600",
    Inquisitive: "#9f60b5", Venturing: "#009ddb",
    default: "#ff6f20",
  },
  leading: {
    Troubleshooter: "#ff6f20", "Co-creator": "#bed600",
    Challenger: "#9f60b5", Transformer: "#009ddb",
    default: "#ff6f20",
  },
};

const FRAMEWORK_BACKGROUNDS = {
  thinking: "/images/thinking-background.png",
  managing: "/images/managing-background.png",
  leading: "/images/leading-background.png",
};

const FRAMEWORK_LABELS = {
  thinking: "Kinetic Thinking Style",
  managing: "Kinetic Managing Style",
  leading: "Kinetic Leading Style",
};

// ─────────────────────────────────────────────────
// PARSE STYLE RESULTS FROM ASSISTANT MESSAGES
// ─────────────────────────────────────────────────

function parseStyleResults(text) {
  const results = [];
  const regex = /<!--STYLE:(.*?)-->/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      results.push(JSON.parse(match[1]));
    } catch (e) {
      console.error("Failed to parse style result:", e);
    }
  }
  const cleanText = text.replace(/<!--STYLE:.*?-->/g, "").trim();
  return { cleanText, results };
}

// ─────────────────────────────────────────────────
// STYLE MATRIX COMPONENT
// ─────────────────────────────────────────────────

function StyleMatrix({ data }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fw = data.framework;
  const colors = FRAMEWORK_COLORS[fw] || FRAMEWORK_COLORS.thinking;
  const accent = colors[data.style] || colors.default;
  const bgSrc = FRAMEWORK_BACKGROUNDS[fw] || FRAMEWORK_BACKGROUNDS.thinking;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const maxW = Math.min(280, canvas.parentElement?.clientWidth || 280);
      const displayW = maxW;
      const displayH = maxW;
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + "px";
      canvas.style.height = displayH + "px";
      ctx.scale(dpr, dpr);

      const w = displayW, h = displayH;

      ctx.clearRect(0, 0, w, h);

      // Draw background image if loaded
      if (imgRef.current) {
        ctx.drawImage(imgRef.current, 0, 0, w, h);
      }

      // Plot point
      const cx = w / 2, cy = h / 2;
      const plotRange = (w / 2) * (10 / 12);
      const plotX = cx + (data.dim1_score / 10) * plotRange;
      const plotY = cy - (data.dim2_score / 10) * plotRange;

      // Glow
      const gradient = ctx.createRadialGradient(plotX, plotY, 0, plotX, plotY, 24);
      gradient.addColorStop(0, accent + "80");
      gradient.addColorStop(1, accent + "00");
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(plotX, plotY, 24, 0, Math.PI * 2); ctx.fill();

      // Point
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(plotX, plotY, 6, 0, Math.PI * 2); ctx.fill();

      // Ring
      ctx.strokeStyle = accent + "80";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(plotX, plotY, 10, 0, Math.PI * 2); ctx.stroke();
    };

    // Load image then draw
    if (!imgRef.current || imgRef.current.src !== bgSrc) {
      const img = new Image();
      img.onload = () => { imgRef.current = img; draw(); };
      img.src = bgSrc;
    } else {
      draw();
    }
  }, [data, accent, bgSrc]);

  return (
    <div style={{
      background: "#111827",
      border: "1px solid rgba(100,140,200,0.12)",
      borderRadius: 8,
      padding: 16,
      marginTop: 12,
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
          color: "rgba(160,180,220,0.5)", fontFamily: "Inter, system-ui, sans-serif",
        }}>
          {FRAMEWORK_LABELS[fw] || fw}
        </div>
        <div style={{
          padding: "2px 10px", borderRadius: 3,
          background: accent + "18", border: `1px solid ${accent}35`,
          fontSize: 13, fontWeight: 500, color: accent,
          fontFamily: "'Crimson Pro', Georgia, serif",
        }}>
          {data.style}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <canvas ref={canvasRef} />
        <div style={{ flex: 1, minWidth: 200, width: "100%" }}>
          <DimScore label={data.dim1_label} left={data.dim1_left} right={data.dim1_right} score={data.dim1_score} color={accent} />
          <DimScore label={data.dim2_label} left={data.dim2_left} right={data.dim2_right} score={data.dim2_score} color={accent} />
          {data.summary && (
            <div style={{
              marginTop: 10, fontSize: 13, color: "rgba(180,195,220,0.7)",
              fontStyle: "italic", lineHeight: 1.5,
              fontFamily: "'Crimson Pro', Georgia, serif",
            }}>
              {data.summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DimScore({ label, left, right, score, color }) {
  const pct = ((score + 10) / 20) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, color: "rgba(160,180,220,0.5)", letterSpacing: 1,
        textTransform: "uppercase", marginBottom: 3,
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        {label}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: "rgba(160,180,220,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>{left}</span>
        <span style={{ fontSize: 10, color: "rgba(160,180,220,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>{right}</span>
      </div>
      <div style={{ height: 4, background: "rgba(100,140,200,0.08)", borderRadius: 2, position: "relative" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: 4, background: "rgba(160,180,220,0.2)" }} />
        <div style={{
          position: "absolute", left: `${pct}%`, top: -3, width: 10, height: 10,
          borderRadius: "50%", background: color, transform: "translateX(-50%)",
          boxShadow: `0 0 8px ${color}30`
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// CHAT MESSAGE COMPONENT
// ─────────────────────────────────────────────────

function ChatMessage({ role, text, styleResults }) {
  const isUser = role === "user";

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "msgFade 0.3s ease",
    }}>
      <div style={{
        maxWidth: isUser ? "75%" : "85%",
        padding: isUser ? "10px 16px" : "0",
      }}>
        {isUser ? (
          <div style={{
            background: "rgba(100,140,200,0.1)",
            border: "1px solid rgba(100,140,200,0.15)",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 16px",
            fontSize: 14, lineHeight: 1.65, color: "#c0ccdd",
            fontFamily: "'Crimson Pro', Georgia, serif",
          }}>
            {text}
          </div>
        ) : (
          <div>
            <div style={{
              fontSize: 14.5, lineHeight: 1.7, color: "#b8c8dc",
              fontFamily: "'Crimson Pro', Georgia, serif",
              whiteSpace: "pre-wrap",
            }}>
              {text}
            </div>
            {styleResults?.map((sr, i) => (
              <StyleMatrix key={i} data={sr} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "8px 0", marginBottom: 16 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "rgba(160,180,220,0.3)",
          animation: `typingDot 1.2s ease infinite ${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────
// ASSESSED STYLES SIDEBAR
// ─────────────────────────────────────────────────

function AssessedStyles({ styles }) {
  if (styles.length === 0) return null;

  return (
    <div style={{
      padding: "12px 16px",
      background: "rgba(15,20,35,0.5)",
      borderBottom: "1px solid rgba(100,140,200,0.08)",
      display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
    }}>
      <span style={{
        fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
        color: "rgba(160,180,220,0.4)", fontFamily: "Inter, system-ui, sans-serif",
      }}>
        Assessed
      </span>
      {styles.map((s, i) => {
        const colors = FRAMEWORK_COLORS[s.framework] || FRAMEWORK_COLORS.thinking;
        const accent = colors[s.style] || colors.default;
        return (
          <div key={i} style={{
            padding: "3px 10px", borderRadius: 3,
            background: accent + "12", border: `1px solid ${accent}30`,
            fontSize: 11, color: accent,
            fontFamily: "'Crimson Pro', Georgia, serif",
          }}>
            {s.style}
            <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 10 }}>
              ({s.framework})
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [assessedStyles, setAssessedStyles] = useState([]);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, loading]);

  const sendMessage = useCallback(async (userText) => {
    if (!userText?.trim() || loading) return;

    const newUserMsg = { role: "user", content: userText.trim() };
    const updatedMessages = [...messages, newUserMsg];
    setMessages((prev) => [...prev, { role: "user", text: userText.trim(), styleResults: [] }]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content || m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const rawText = data.content
        .map((item) => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");

      const { cleanText, results } = parseStyleResults(rawText);

      if (results.length > 0) {
        setAssessedStyles((prev) => [...prev, ...results]);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: cleanText, content: rawText, styleResults: results },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I'm sorry, something went wrong. Could you try again?", content: "", styleResults: [] },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startSession = () => {
    setStarted(true);
    setMessages([]);
    setAssessedStyles([]);
    // Send an initial greeting trigger
    setTimeout(() => {
      setLoading(true);
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Hello, I'd like to explore my thinking and leadership styles." }],
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          const rawText = data.content?.map((i) => (i.type === "text" ? i.text : "")).filter(Boolean).join("\n") || "";
          const { cleanText, results } = parseStyleResults(rawText);
          setMessages([
            { role: "assistant", text: cleanText, content: rawText, styleResults: results },
          ]);
        })
        .catch(() => {
          setMessages([
            { role: "assistant", text: "Welcome. I'm here to help you explore your thinking, managing, and leading styles. What brings you here today — is there a particular challenge or situation you'd like to reflect on?", content: "", styleResults: [] },
          ]);
        })
        .finally(() => setLoading(false));
    }, 200);
  };

  // ─── Welcome screen ───
  if (!started) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080c18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Crimson Pro', Georgia, serif",
        padding: 24,
      }}>
        <div style={{ maxWidth: 520, textAlign: "center" }}>
          <img
            src="/images/kinetic-logo.png"
            alt="Kinetic Thinking Framework"
            style={{ width: 80, height: "auto", marginBottom: 20, opacity: 0.9 }}
          />
          <div style={{
            fontSize: 10, letterSpacing: 4, color: "#3a4a6a",
            textTransform: "uppercase", marginBottom: 16,
            fontFamily: "Inter, system-ui, sans-serif",
          }}>
            Kinetic Thinking Framework
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 300, color: "#d0daea",
            lineHeight: 1.3, margin: "0 0 12px 0",
          }}>
            Style Explorer
          </h1>
          <p style={{
            fontSize: 16, color: "#6a7f99", lineHeight: 1.7,
            marginBottom: 32, fontStyle: "italic",
          }}>
            A guided conversation to explore how you think, manage, and lead —
            through the lens of the Kinetic Thinking Framework.
          </p>
          <div style={{
            display: "flex", gap: 24, justifyContent: "center",
            marginBottom: 36, flexWrap: "wrap",
          }}>
            {[
              { label: "Thinking", desc: "Uncertainty × Possibility", color: "#009ddb" },
              { label: "Managing", desc: "Process × Performance", color: "#9f60b5" },
              { label: "Leading", desc: "Ecosystem × Time", color: "#ff6f20" },
            ].map((f) => (
              <div key={f.label} style={{
                padding: "12px 16px", borderRadius: 6,
                background: f.color + "08", border: `1px solid ${f.color}20`,
                minWidth: 130,
              }}>
                <div style={{ fontSize: 14, color: f.color, fontWeight: 500, marginBottom: 2 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 11, color: "#5a6f8f" }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <button
            onClick={startSession}
            style={{
              padding: "12px 36px", fontSize: 15, fontWeight: 400,
              fontFamily: "'Crimson Pro', Georgia, serif",
              background: "rgba(100,140,200,0.12)",
              border: "1px solid rgba(100,140,200,0.25)",
              borderRadius: 6, color: "#a0bcdd", cursor: "pointer",
              letterSpacing: 0.5, transition: "all 0.2s",
            }}
          >
            Begin Reflection
          </button>
          <div style={{
            marginTop: 48, fontSize: 11, color: "#3a4a6a", lineHeight: 1.6,
            fontFamily: "Inter, system-ui, sans-serif",
          }}>
            Based on: Dimov, D. and Pistrui, J. (2023).{" "}
            <a
              href="https://doi.org/10.1016/j.jbvd.2023.100015"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4a6a8a", textDecoration: "underline" }}
            >
              Kinetic thinking styles: A tool for developing entrepreneurial thinking
            </a>.{" "}
            <em>Journal of Business Venturing Design</em>, 2, 100015.
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat interface ───
  return (
    <div style={{
      height: "100vh", background: "#080c18",
      display: "flex", flexDirection: "column",
      fontFamily: "'Crimson Pro', Georgia, serif",
    }}>
      <style>{`
        @keyframes msgFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typingDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 0.8; transform: translateY(-3px); } }
        textarea::placeholder { color: rgba(120,140,170,0.4); }
        textarea:focus { outline: none; border-color: rgba(100,140,200,0.3) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid rgba(100,140,200,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,14,28,0.9)",
      }}>
        <div>
          <div style={{
            fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
            color: "#3a4a6a", fontFamily: "Inter, system-ui, sans-serif",
          }}>
            Kinetic Thinking Framework
          </div>
          <div style={{ fontSize: 17, color: "#c0ccdd", fontWeight: 400 }}>
            Style Explorer
          </div>
        </div>
        <button
          onClick={() => { setStarted(false); setMessages([]); setAssessedStyles([]); }}
          style={{
            padding: "5px 14px", fontSize: 11,
            fontFamily: "Inter, system-ui, sans-serif",
            background: "rgba(100,140,200,0.06)",
            border: "1px solid rgba(100,140,200,0.12)",
            borderRadius: 3, color: "#5a6f8f", cursor: "pointer",
          }}
        >
          New session
        </button>
      </div>

      {/* Assessed styles bar */}
      <AssessedStyles styles={assessedStyles} />

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "24px 20px",
        maxWidth: 720, width: "100%", margin: "0 auto",
        boxSizing: "border-box",
      }}>
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            text={msg.text}
            styleResults={msg.styleResults}
          />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid rgba(100,140,200,0.08)",
        background: "rgba(10,14,28,0.9)",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts..."
            rows={1}
            style={{
              flex: 1, padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
              fontFamily: "'Crimson Pro', Georgia, serif",
              background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(100,140,200,0.12)",
              borderRadius: 8, color: "#c8d6e8",
              resize: "none", minHeight: 42, maxHeight: 120,
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 18px", fontSize: 13,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 500,
              background: loading || !input.trim() ? "rgba(100,140,200,0.06)" : "rgba(100,140,200,0.15)",
              border: "1px solid rgba(100,140,200,0.2)",
              borderRadius: 8,
              color: loading || !input.trim() ? "#3a4a6a" : "#a0bcdd",
              cursor: loading || !input.trim() ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
