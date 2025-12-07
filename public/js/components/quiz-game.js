/**
 * Quiz game component - displays questions and handles answers
 */
class QuizGame extends HTMLElement {
  static get observedAttributes() {
    return ["question", "current", "total", "score", "session-id", "question-index"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.answered = false;
    this.selectedIndex = null;
    this.correctAnswerIndex = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback() {
    this.answered = false;
    this.selectedIndex = null;
    this.correctAnswerIndex = null;
    this.render();
    this.setupEventListeners();
  }

  getQuestion() {
    try {
      const encoded = this.getAttribute("question") || "{}";
      return JSON.parse(decodeURIComponent(encoded));
    } catch {
      return {};
    }
  }

  setupEventListeners() {
    this.shadowRoot.querySelectorAll(".answer-btn").forEach((btn, index) => {
      btn.addEventListener("click", async () => {
        if (this.answered) return;

        this.answered = true;
        this.selectedIndex = index;
        this.render();

        const sessionId = this.getAttribute("session-id");
        const questionIndex = parseInt(this.getAttribute("question-index") || "0");

        // Submit answer to server for validation
        const response = await fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            questionIndex,
            selectedAnswerIndex: index,
          }),
        });

        const result = await response.json();
        this.correctAnswerIndex = result.correctAnswerIndex;
        this.render();

        const question = this.getQuestion();

        // Delay before moving to next question
        setTimeout(() => {
          this.dispatchEvent(
            new CustomEvent("answer-submitted", {
              bubbles: true,
              composed: true,
              detail: {
                currentScore: result.currentScore,
                isComplete: result.isComplete,
                answer: question.answers[index],
                correctAnswer: question.answers[result.correctAnswerIndex],
              },
            })
          );
        }, 1500);
      });
    });
  }

  render() {
    const question = this.getQuestion();
    const current = this.getAttribute("current") || "1";
    const total = this.getAttribute("total") || "10";
    const score = this.getAttribute("score") || "0";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .game {
          max-width: 600px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .progress {
          font-weight: 600;
          color: #495057;
        }

        .score {
          background: #e9ecef;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          color: #28a745;
        }

        .question {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 2rem;
          line-height: 1.4;
        }

        .answers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .answer-btn {
          background: white;
          border: 2px solid #e9ecef;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          text-align: left;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .answer-btn:hover:not(:disabled) {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .answer-btn:disabled {
          cursor: default;
        }

        .answer-btn.selected {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .answer-btn.correct {
          border-color: #28a745;
          background: #28a745;
          color: white;
        }

        .answer-btn.incorrect {
          border-color: #dc3545;
          background: #dc3545;
          color: white;
        }

        .answer-btn.reveal-correct {
          border-color: #28a745;
          background: #d4edda;
          color: #155724;
        }

        .difficulty-badge {
          margin-bottom: 0.75rem;
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .difficulty-badge.easy {
          background: #d4edda;
          color: #155724;
        }

        .difficulty-badge.medium {
          background: #fff3cd;
          color: #856404;
        }

        .difficulty-badge.hard {
          background: #f8d7da;
          color: #721c24;
        }
      </style>

      <div class="game">
        <div class="header">
          <span class="progress">Question ${current} of ${total}</span>
          <span class="score">Score: ${score}</span>
        </div>

        <span class="difficulty-badge ${question.difficulty || ""}">${question.difficulty || ""}</span>
        <div class="question">${question.question || ""}</div>

        <div class="answers">
          ${(question.answers || [])
            .map((answer, i) => {
              let btnClass = "answer-btn";
              if (this.answered && this.correctAnswerIndex !== null) {
                if (i === this.correctAnswerIndex) {
                  btnClass += i === this.selectedIndex ? " correct" : " reveal-correct";
                } else if (i === this.selectedIndex) {
                  btnClass += " incorrect";
                }
              } else if (this.answered) {
                // Waiting for server response - show selected
                if (i === this.selectedIndex) {
                  btnClass += " selected";
                }
              }
              return `
                <button class="${btnClass}" ${this.answered ? "disabled" : ""}>
                  ${answer}
                </button>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }
}

customElements.define("quiz-game", QuizGame);
