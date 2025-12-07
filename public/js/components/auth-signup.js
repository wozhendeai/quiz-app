/**
 * Signup form component
 */
class AuthSignup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.error = null;
    this.loading = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.shadowRoot.querySelector("form");
    const loginLink = this.shadowRoot.querySelector("#login-link");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("go-login", {
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  async handleSubmit() {
    const username = this.shadowRoot.querySelector("#username").value;
    const password = this.shadowRoot.querySelector("#password").value;
    const confirmPassword = this.shadowRoot.querySelector("#confirm-password").value;

    if (password !== confirmPassword) {
      this.error = "Passwords do not match";
      this.render();
      this.setupEventListeners();
      return;
    }

    this.loading = true;
    this.error = null;
    this.render();
    this.setupEventListeners();

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      this.dispatchEvent(
        new CustomEvent("auth-success", {
          bubbles: true,
          composed: true,
          detail: data.user,
        })
      );
    } catch (error) {
      this.error = error.message;
      this.loading = false;
      this.render();
      this.setupEventListeners();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .auth-form {
          max-width: 400px;
          margin: 0 auto;
          text-align: center;
        }

        h2 {
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
          text-align: left;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        input {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus {
          border-color: #667eea;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        button {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .links {
          margin-top: 1.5rem;
          color: #666;
        }

        .links a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .links a:hover {
          text-decoration: underline;
        }

        .hint {
          font-size: 0.85rem;
          color: #888;
          margin-top: 0.25rem;
        }
      </style>

      <div class="auth-form">
        <h2>Create Account</h2>
        <p class="subtitle">Join to track your scores</p>

        ${this.error ? `<div class="error">${this.error}</div>` : ""}

        <form>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" required placeholder="Your display name" minlength="2" maxlength="20" />
            <p class="hint">This will appear on the leaderboard</p>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="At least 6 characters" minlength="6" />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" required placeholder="Confirm your password" />
          </div>

          <button type="submit" ${this.loading ? "disabled" : ""}>
            ${this.loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p class="links">
          Already have an account? <a href="#" id="login-link">Log in</a>
        </p>
      </div>
    `;
  }
}

customElements.define("auth-signup", AuthSignup);
