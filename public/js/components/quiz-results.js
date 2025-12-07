/**
 * Quiz results component - displays final score
 */
class QuizResults extends HTMLElement {
  static get observedAttributes() {
    return ["score", "total"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.shadowRoot.querySelector(".play-again-btn")?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("play-again", { bubbles: true, composed: true })
      );
    });
  }

  getPercentage() {
    const score = parseInt(this.getAttribute("score") || "0");
    const total = parseInt(this.getAttribute("total") || "1");
    return Math.round((score / total) * 100);
  }

  getMessage() {
    const percentage = this.getPercentage();
    if (percentage === 100) return "Perfect Score!";
    if (percentage >= 80) return "Excellent!";
    if (percentage >= 60) return "Good Job!";
    if (percentage >= 40) return "Not Bad!";
    return "Keep Practicing!";
  }

  render() {
    const score = this.getAttribute("score") || "0";
    const total = this.getAttribute("total") || "0";
    const percentage = this.getPercentage();
    const message = this.getMessage();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .results {
          text-align: center;
          padding: 2rem 0;
        }

        .message {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 1rem;
        }

        .score-circle {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: conic-gradient(
            #667eea ${percentage}%,
            #e9ecef ${percentage}%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 2rem auto;
          position: relative;
        }

        .score-inner {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .score-label {
          font-size: 0.9rem;
          color: #666;
        }

        .percentage {
          font-size: 1.25rem;
          color: #667eea;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .play-again-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-again-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
      </style>

      <div class="results">
        <div class="message">${message}</div>

        <div class="score-circle">
          <div class="score-inner">
            <span class="score-number">${score}/${total}</span>
            <span class="score-label">correct</span>
          </div>
        </div>

        <div class="percentage">${percentage}%</div>

        <button class="play-again-btn">Play Again</button>
      </div>
    `;
  }
}

customElements.define("quiz-results", QuizResults);
