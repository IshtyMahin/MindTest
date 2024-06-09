document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quiz_id");

  // Fetch quiz details
  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(
        `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quizId}/`
      );
      if (response.ok) {
          const quiz = await response.json();
          console.log(quiz);
        renderQuizDetails(quiz);
      } else {
        console.error("Failed to fetch quiz details.");
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
    }
  };

  // Render quiz details
  const renderQuizDetails = (quiz) => {
    document.getElementById("quizTitle").textContent = quiz.title;
    document.getElementById("quizDescription").textContent = quiz.description;

    const questionsContainer = document.getElementById("questions");
    questionsContainer.innerHTML = "";

    quiz.questions.forEach((question, index) => {
      const questionElement = document.createElement("div");
      questionElement.classList.add("question");

      const choices = question.choices
        .map(
          (choice, choiceIndex) => `
        <label>
          <input type="radio" name="question${question.id}" value="${
            choice.id
          }" />
          ${String.fromCharCode(65 + choiceIndex)}. ${choice.text}
        </label>
      `
        )
        .join("");

      questionElement.innerHTML = `
        <p><strong>Question ${index + 1}:</strong> ${question.text}</p>
        <div class="choices">${choices}</div>
      `;

      questionsContainer.appendChild(questionElement);
    });
  };

  // Handle quiz submission
  document.getElementById("submitQuiz").addEventListener("click", async () => {
    const questions = Array.from(document.querySelectorAll(".question"));
    const answers = questions.map((question) => {
      const selectedChoice = question.querySelector(
        'input[type="radio"]:checked'
      );
      return {
        question_id: selectedChoice.name.replace("question", ""),
        selected_choice_id: selectedChoice.value,
      };
    });

    try {
      const response = await fetch(
        `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quizId}/take/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ questions: answers }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`You scored ${data.score} points!`);
        window.location.href = "quiz_list.html";
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Submission failed. Please try again.");
    }
  });

  // Fetch quiz details when the page loads
  fetchQuizDetails();
});
