document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    user = await fetchUserProfile();
    updateNavbar(user);
  } else {
      updateNavbar(null);
      window.location.href = "index.html";
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quiz_id");
  if (quizId) {
    fetchQuizDetails(quizId, user);
    }
    
});

const fetchQuizDetails = async (quizId, user) => {
  try {
    const response = await fetch(
      `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quizId}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const quizData = await response.json();
      console.log(quizData.category);
      // Fetch category details
      const categoryResponse = await fetch(
        `https://quiz-zone-g1pi.onrender.com/api/categories/${quizData.category}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        quizData.categoryName = categoryData.name;
        populateQuizDetails(quizData, user);
      } else {
        console.error("Failed to fetch category details.");
      }
    } else {
      console.error("Failed to fetch quiz details.");
    }
  } catch (error) {
    console.error("Error fetching quiz details:", error);
  }
};

const populateQuizDetails = (quizData, user) => {
  console.log(quizData);
  const fetchCategories = async () => {
    const categories = await apiCall("https://quiz-zone-g1pi.onrender.com/api/categories/");
    const categorySelect = document.getElementById("category");
    if (categories && categorySelect) {
      categorySelect.innerHTML = categories
        .map(
          (category) => `
      <option value="${category.id}">${category.name}</option>
    `
        )
        .join("");
    }
  };
  fetchCategories();
    
  document.getElementById("title").value = quizData.title;
  document.getElementById("description").value = quizData.description;
  document.getElementById("category").value = quizData.categoryName;

  if (quizData.has_time_limit) {
    document.getElementById("time-limit").checked = true;
    document.getElementById("time-limit-value").value =
      quizData.time_limit;
    document.getElementById("time-limit-field").style.display = "block";
  } else {
    document.getElementById("time-limit").checked = false;
    document.getElementById("time-limit-value").value = "";
    document.getElementById("time-limit-field").style.display = "none";
  }

  const questionsSection = document.getElementById("questions-section");
//   questionsSection.innerHTML = "";
  quizData.questions.forEach((question) => {
    const questionElement = document.createElement("div");
    questionElement.innerHTML = `
            <div class="question-item mb-4 p-4 border border-gray-300 rounded">
                <div class="mb-4">
                    <label class="block text-gray-700">Question</label>
                    <textarea class="question-text w-full p-2 border border-gray-300 rounded mt-2">${question.text}</textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Points</label>
                    <input type="number" class="question-points w-full p-2 border border-gray-300 rounded mt-2" value="${question.points}">
                </div>
                <div class="choices-section mb-4">
                    <h4 class="text-lg font-bold mb-2">Choices</h4>
                </div>
            </div>
        `;
    questionsSection.appendChild(questionElement);

    const choicesSection = questionElement.querySelector(".choices-section");
    question.choices.forEach((choice) => {
      const choiceElement = document.createElement("div");
      choiceElement.innerHTML = `
                <div class="choice-item mb-2 p-2 border border-gray-300 rounded">
                    <input type="text" class="choice-text w-full p-2 border border-gray-300 rounded mt-2" placeholder="Choice text" value="${
                      choice.text
                    }">
                    <label class="block text-gray-700 mt-2">
                        <input type="checkbox" class="choice-is-correct" ${
                          choice.is_correct ? "checked" : ""
                        }> Correct
                    </label>
                </div>
            `;
        choicesSection.appendChild(choiceElement);
    });
  });

  editQuiz(user, quizData.id);
};

const updateNavbar = (user) => {
  const createQuizLink = document.getElementById("create-quiz-link");
  const ddcreateQuizLink = document.getElementById("dd-create-quiz-link");
  const profileLink = document.getElementById("profile-link");
  const ddprofileLink = document.getElementById("dd-profile-link");
  const loginLink = document.getElementById("login-link");
  const ddloginLink = document.getElementById("dd-login-link");
  const logoutLink = document.getElementById("logout-link");
  const ddlogoutLink = document.getElementById("dd-logout-link");
  const registerLink = document.getElementById("register-link");
  const ddregisterLink = document.getElementById("dd-register-link");
  const quiz_list = document.getElementById("quiz_list");
  const ddquiz_list = document.getElementById("dd-quiz_list");
 
  if (user) {
    loginLink.style.display = "none";
    logoutLink.style.display = "inline";
    profileLink.style.display = "inline";
    registerLink.style.display = "none";
    ddloginLink.style.display = "none";
    ddlogoutLink.style.display = "inline";
    ddprofileLink.style.display = "inline";
    ddregisterLink.style.display = "none";

    if (user.is_admin) {
      createQuizLink.style.display = "inline";
      ddcreateQuizLink.style.display = "inline";
    } else {
      createQuizLink.style.display = "none";
      ddcreateQuizLink.style.display = "none";
    }
  } else {
    loginLink.style.display = "inline";
    logoutLink.style.display = "none";
    profileLink.style.display = "none";
    registerLink.style.display = "inline";
    createQuizLink.style.display = "none";
    quiz_list.style.display = "none";

    ddloginLink.style.display = "inline";
    ddlogoutLink.style.display = "none";
    ddprofileLink.style.display = "none";
    ddregisterLink.style.display = "inline";
    ddcreateQuizLink.style.display = "none";
    ddquiz_list.style.display = "none";
  }
};

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("https://quiz-zone-g1pi.onrender.com/api/user/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return userData;
    } else {
      console.error("Failed to fetch user profile.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const editQuiz = (user,quizId) => {
  if (!user || !user.is_admin) {
    window.location.href = "index.html";
  }

  const fetchCategories = async () => {
    const categories = await apiCall("https://quiz-zone-g1pi.onrender.com/api/categories/");
    const categorySelect = document.getElementById("category");
    if (categories && categorySelect) {
      categorySelect.innerHTML = categories
        .map(
          (category) => `
      <option value="${category.id}">${category.name}</option>
    `
        )
        .join("");
    }
  };

 
  const quizTimeLimitCheckbox = document.getElementById("time-limit");
  const timeLimitField = document.getElementById("time-limit-field");

  const addQuestionBtn = document.getElementById("add-question-btn");
    console.log(addQuestionBtn);
  const questionsSection = document.getElementById("questions-section");
  const questionTemplate =
    document.getElementById("question-template").innerHTML;
  const choiceTemplate = document.getElementById("choice-template").innerHTML;

  quizTimeLimitCheckbox.addEventListener("change", () => {
    if (quizTimeLimitCheckbox.checked) {
      timeLimitField.style.display = "block";
    } else {
      timeLimitField.style.display = "none";
    }
  });

  fetchCategories();

  addQuestionBtn.addEventListener("click", () => {
    const questionElement = document.createElement("div");
    questionElement.innerHTML = questionTemplate;
    questionsSection.insertBefore(questionElement, addQuestionBtn);

    const addChoiceBtn = questionElement.querySelector(".add-choice-btn");
    addChoiceBtn.addEventListener("click", () => {
      const choiceElement = document.createElement("div");
      choiceElement.innerHTML = choiceTemplate;
      addChoiceBtn.parentElement.insertBefore(choiceElement, addChoiceBtn);
    });
  });

  const editQuizForm = document.getElementById("editQuizForm");
  editQuizForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      


    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const hasTimeLimit = document.getElementById("time-limit").checked;
    const timeLimit = document.getElementById("time-limit-value").value;
    const userData = await fetchUserProfile();
    const quizData = {
        title,
        description,
        category,
        has_time_limit: hasTimeLimit,
        time_limit: hasTimeLimit ? `PT${timeLimit}M` : null,
        creator: userData.id,
        };

    try {
      const createResponse = await fetch(
        `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quizId}/edit/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quizData),
        }
      );

      if (createResponse.ok) {
        const quiz = await createResponse.json();

        const questions = [];
        document.querySelectorAll(".question-item").forEach((questionItem) => {
          const questionText =
            questionItem.querySelector(".question-text").value;
          const questionPoints =
            questionItem.querySelector(".question-points").value;
          const choices = [];

          questionItem
            .querySelectorAll(".choice-item")
            .forEach((choiceItem) => {
              const choiceText = choiceItem.querySelector(".choice-text").value;
              const choiceIsCorrect =
                choiceItem.querySelector(".choice-is-correct").checked;
              choices.push({
                text: choiceText,
                is_correct: choiceIsCorrect,
              });
            });

          questions.push({
            quiz: quiz.id,
            text: questionText,
            points: questionPoints,
            choices: choices,
          });
        });

        const addQuestionResponse = await fetch(
          `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quiz.id}/add-question/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(questions),
          }
        );

        if (addQuestionResponse.ok) {
          alert("Quiz update successfully with questions!");
          quizCreateForm.reset();
          timeLimitField.style.display = "none";
          questionsSection.innerHTML = "";
          fetchQuizzes();
        } else {
          alert("Failed to add questions to the quiz.");
        }
      } else {
        alert("Failed to update the quiz.");
      }
    } catch (error) {
      console.error("Error update quiz:", error);
    }
  });
};

const apiCall = async (url) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`API call failed with status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
};
