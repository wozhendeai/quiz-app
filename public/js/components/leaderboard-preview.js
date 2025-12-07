/**
 * Leaderboard preview showing top 5 scores
 * Stub implementation until leaderboard API exists
 */
class LeaderboardPreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.scores = [];
    this.loading = true;
    this.error = null;
  }

  connectedCallback() {
    this.render();
    this.fetchLeaderboard();
  }

  async fetchLeaderboard() {
    try {
      const response = await fetch("/api/quiz/leaderboard?limit=5");
      if (response.ok) {
        const data = await response.json();
        this.scores = data.leaderboard || [];
      } else {
        this.scores = [];
      }
    } catch {
      this.scores = [];
    }
    this.loading = false;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .leaderboard {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 400px;
          margin: 0 auto;
        }

        h3 {
          margin: 0 0 1rem 0;
          color: #1a1a2e;
          font-size: 1.1rem;
        }

        .loading {
          color: #666;
          text-align: center;
          padding: 1rem;
        }

        .empty {
          color: #888;
          text-align: center;
          padding: 1rem;
          font-style: italic;
        }

        .score-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
        }

        .score-item:last-child {
          border-bottom: none;
        }

        .rank {
          font-weight: 700;
          color: #667eea;
          width: 2rem;
        }

        .name {
          flex: 1;
          font-weight: 500;
        }

        .score {
          font-weight: 600;
          color: #28a745;
        }
      </style>

      <div class="leaderboard">
        <h3>Top Players</h3>
        ${this.renderContent()}
      </div>
    `;
  }

  renderContent() {
    if (this.loading) {
      return '<div class="loading">Loading...</div>';
    }

    if (this.scores.length === 0) {
      return '<div class="empty">No scores yet. Be the first!</div>';
    }

    return `
      <ul class="score-list">
        ${this.scores
          .map(
            (score) => `
          <li class="score-item">
            <span class="rank">#${score.rank}</span>
            <span class="name">${score.username}</span>
            <span class="score">${score.score}/${score.totalQuestions}</span>
          </li>
        `
          )
          .join("")}
      </ul>
    `;
  }
}

customElements.define("leaderboard-preview", LeaderboardPreview);
