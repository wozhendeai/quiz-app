/**
 * Question count selection step in quiz setup wizard
 */
class QuizSetupCount extends HTMLElement {
  static get observedAttributes() {
    return ["category"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selectedCount = 10;
    this.loading = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Count buttons
    this.shadowRoot.querySelectorAll(".count-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedCount = parseInt(btn.dataset.count);
        this.render();
        this.setupEventListeners();
      });
    });

    // Back button
    this.shadowRoot.querySelector(".back-btn")?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("setup-back", { bubbles: true, composed: true })
      );
    });

    // Start button
    this.shadowRoot.querySelector(".start-btn")?.addEventListener("click", () => {
      if (this.loading) return;
      this.loading = true;
      this.render();

      this.dispatchEvent(
        new CustomEvent("count-selected", {
          bubbles: true,
          composed: true,
          detail: this.selectedCount,
        })
      );
    });
  }

  render() {
    const category = this.getAttribute("category") || "Selected Category";
    const counts = [5, 10, 15, 20, 25];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .setup {
          text-align: center;
        }

        h2 {
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }

        .step-indicator {
          color: #667eea;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .category-badge {
          display: inline-block;
          background: #e9ecef;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #495057;
          margin-bottom: 1.5rem;
        }

        .count-options {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin: 2rem 0;
        }

        .count-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid #e9ecef;
          background: white;
          font-size: 1.25rem;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s;
        }

        .count-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .count-btn.selected {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .back-btn {
          background: white;
          border: 2px solid #e9ecef;
          color: #495057;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          border-color: #adb5bd;
        }

        .start-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .start-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .start-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      </style>

      <div class="setup">
        <p class="step-indicator">Step 2 of 2</p>
        <h2>How Many Questions?</h2>

        <div class="category-badge">${category}</div>

        <div class="count-options">
          ${counts
            .map(
              (count) => `
            <button
              class="count-btn ${count === this.selectedCount ? "selected" : ""}"
              data-count="${count}"
            >
              ${count}
            </button>
          `
            )
            .join("")}
        </div>

        <div class="actions">
          <button class="back-btn">Back</button>
          <button class="start-btn" ${this.loading ? "disabled" : ""}>
            ${this.loading ? "Loading..." : "Start Quiz"}
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("quiz-setup-count", QuizSetupCount);
