/**
 * User profile component with play history
 */
class UserProfile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.profile = null;
    this.loading = true;
    this.error = null;
  }

  connectedCallback() {
    this.render();
    this.fetchProfile();
  }

  async fetchProfile() {
    try {
      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      this.profile = await response.json();
    } catch (error) {
      this.error = error.message;
    }

    this.loading = false;
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const backBtn = this.shadowRoot.querySelector("#back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("go-home", {
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .profile {
          max-width: 600px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        #back-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        #back-btn:hover {
          background: #f0f0f0;
        }

        h2 {
          margin: 0;
          color: #1a1a2e;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.25rem;
          border-radius: 12px;
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        h3 {
          color: #1a1a2e;
          margin-bottom: 1rem;
        }

        .history {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e9ecef;
        }

        .history-item:last-child {
          border-bottom: none;
        }

        .history-info {
          flex: 1;
        }

        .history-category {
          font-weight: 600;
          color: #1a1a2e;
        }

        .history-date {
          font-size: 0.85rem;
          color: #888;
        }

        .history-score {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .history-score.good {
          color: #28a745;
        }

        .history-score.okay {
          color: #ffc107;
        }

        .history-score.poor {
          color: #dc3545;
        }

        .loading, .error, .empty {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .error {
          color: #dc3545;
        }
      </style>

      <div class="profile">
        <div class="header">
          <button id="back-btn">&larr;</button>
          <h2>${this.profile?.user?.username || "Profile"}</h2>
        </div>

        ${this.renderContent()}
      </div>
    `;
  }

  renderContent() {
    if (this.loading) {
      return '<div class="loading">Loading profile...</div>';
    }

    if (this.error) {
      return `<div class="error">${this.error}</div>`;
    }

    if (!this.profile) {
      return '<div class="error">Profile not found</div>';
    }

    const { user, scores, totalGames, averagePercentage } = this.profile;

    return `
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${totalGames}</div>
          <div class="stat-label">Games Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${averagePercentage}%</div>
          <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${scores.length > 0 ? Math.max(...scores.map(s => s.percentage)) : 0}%</div>
          <div class="stat-label">Best Score</div>
        </div>
      </div>

      <h3>Play History</h3>
      ${scores.length === 0
        ? '<div class="empty">No games played yet. Start a quiz!</div>'
        : `<div class="history">
            ${scores.map(score => `
              <div class="history-item">
                <div class="history-info">
                  <div class="history-category">${score.categoryName || "Mixed Categories"}</div>
                  <div class="history-date">${this.formatDate(score.completedAt)}</div>
                </div>
                <div class="history-score ${this.getScoreClass(score.percentage)}">
                  ${score.score}/${score.totalQuestions} (${score.percentage}%)
                </div>
              </div>
            `).join("")}
          </div>`
      }
    `;
  }

  getScoreClass(percentage) {
    if (percentage >= 70) return "good";
    if (percentage >= 40) return "okay";
    return "poor";
  }
}

customElements.define("user-profile", UserProfile);
