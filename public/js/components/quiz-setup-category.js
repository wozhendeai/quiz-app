/**
 * Category selection step in quiz setup wizard
 */
class QuizSetupCategory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.categories = [];
    this.loading = true;
  }

  connectedCallback() {
    this.render();
    this.fetchCategories();
  }

  async fetchCategories() {
    try {
      const response = await fetch("/api/quiz/categories");
      this.categories = await response.json();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
    this.loading = false;
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.shadowRoot.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        const categoryId = parseInt(card.dataset.id);
        const categoryName = card.dataset.name;

        this.dispatchEvent(
          new CustomEvent("category-selected", {
            bubbles: true,
            composed: true,
            detail: { id: categoryId, name: categoryName },
          })
        );
      });
    });
  }

  render() {
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

        .loading {
          color: #666;
          padding: 2rem;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .category-card {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .category-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .category-name {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 0.95rem;
        }
      </style>

      <div class="setup">
        <p class="step-indicator">Step 1 of 2</p>
        <h2>Choose a Category</h2>

        ${this.loading ? '<div class="loading">Loading categories...</div>' : this.renderCategories()}
      </div>
    `;
  }

  renderCategories() {
    return `
      <div class="categories">
        ${this.categories
          .map(
            (cat) => `
          <div class="category-card" data-id="${cat.id}" data-name="${cat.name}">
            <span class="category-name">${cat.name}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }
}

customElements.define("quiz-setup-category", QuizSetupCategory);
