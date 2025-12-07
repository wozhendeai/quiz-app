/**
 * Username input step in quiz setup wizard
 */
class QuizSetupName extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  generateRandomUsername() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let suffix = "";
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `Player_${suffix}`;
  }

  setupEventListeners() {
    const input = this.shadowRoot.querySelector("#username-input");
    const continueBtn = this.shadowRoot.querySelector("#continue-btn");
    const skipBtn = this.shadowRoot.querySelector("#skip-btn");

    continueBtn.addEventListener("click", () => {
      const username = input.value.trim() || this.generateRandomUsername();
      this.dispatchNameSelected(username);
    });

    skipBtn.addEventListener("click", () => {
      const username = this.generateRandomUsername();
      this.dispatchNameSelected(username);
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const username = input.value.trim() || this.generateRandomUsername();
        this.dispatchNameSelected(username);
      }
    });
  }

  dispatchNameSelected(username) {
    this.dispatchEvent(
      new CustomEvent("name-selected", {
        bubbles: true,
        composed: true,
        detail: username,
      })
    );
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .setup {
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }

        h2 {
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          margin-bottom: 2rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        input {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus {
          border-color: #667eea;
        }

        input::placeholder {
          color: #adb5bd;
        }

        .buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        button {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        #continue-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        #continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        #skip-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        #skip-btn:hover {
          background: #f8f9ff;
        }
      </style>

      <div class="setup">
        <h2>Enter Your Name</h2>
        <p class="subtitle">This will appear on the leaderboard</p>

        <div class="input-group">
          <input
            type="text"
            id="username-input"
            placeholder="Your name"
            maxlength="20"
            autofocus
          />
        </div>

        <div class="buttons">
          <button id="skip-btn">Skip</button>
          <button id="continue-btn">Continue</button>
        </div>
      </div>
    `;
  }
}

customElements.define("quiz-setup-name", QuizSetupName);
