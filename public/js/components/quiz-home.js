/**
 * Homepage component with start button and leaderboard preview
 */
class QuizHome extends HTMLElement {
  static get observedAttributes() {
    return ["user"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback() {
    this.render();
    this.setupEventListeners();
  }

  getUser() {
    try {
      const userAttr = this.getAttribute("user");
      if (!userAttr) return null;
      return JSON.parse(userAttr);
    } catch {
      return null;
    }
  }

  setupEventListeners() {
    const startBtn = this.shadowRoot.querySelector(".start-btn");
    const loginBtn = this.shadowRoot.querySelector("#login-btn");
    const signupBtn = this.shadowRoot.querySelector("#signup-btn");
    const profileBtn = this.shadowRoot.querySelector("#profile-btn");
    const logoutBtn = this.shadowRoot.querySelector("#logout-btn");

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("quiz-start", { bubbles: true, composed: true })
        );
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("go-login", { bubbles: true, composed: true })
        );
      });
    }

    if (signupBtn) {
      signupBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("go-signup", { bubbles: true, composed: true })
        );
      });
    }

    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("go-profile", { bubbles: true, composed: true })
        );
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("logout", { bubbles: true, composed: true })
        );
      });
    }
  }

  render() {
    const user = this.getUser();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .home {
          text-align: center;
          padding: 2rem 0;
        }

        .user-bar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .username {
          font-weight: 600;
          color: #1a1a2e;
        }

        .auth-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f8f9ff;
        }

        .btn-primary-sm {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary-sm:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .btn-text {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-text:hover {
          color: #667eea;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          color: #1a1a2e;
        }

        .subtitle {
          color: #666;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .welcome {
          color: #667eea;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .start-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 3rem;
          font-size: 1.25rem;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          font-weight: 600;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .start-btn:active {
          transform: translateY(0);
        }

        .login-prompt {
          margin-top: 1rem;
          color: #888;
          font-size: 0.9rem;
        }

        .leaderboard-section {
          margin-top: 3rem;
        }
      </style>

      <div class="home">
        <div class="user-bar">
          ${user ? `
            <div class="user-info">
              <span class="username">${user.username}</span>
            </div>
            <button id="profile-btn" class="btn-secondary">Profile</button>
            <button id="logout-btn" class="btn-text">Logout</button>
          ` : `
            <div class="auth-buttons">
              <button id="login-btn" class="btn-secondary">Log In</button>
              <button id="signup-btn" class="btn-primary-sm">Sign Up</button>
            </div>
          `}
        </div>

        <h1>Quiz Time</h1>
        ${user ? `<p class="welcome">Welcome back, ${user.username}!</p>` : ""}
        <p class="subtitle">Test your knowledge across various categories</p>

        <button class="start-btn">Start Quiz</button>
        ${!user ? '<p class="login-prompt">Log in to save your scores to the leaderboard</p>' : ""}

        <div class="leaderboard-section">
          <leaderboard-preview></leaderboard-preview>
        </div>
      </div>
    `;
  }
}

customElements.define("quiz-home", QuizHome);
