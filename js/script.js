document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    user = await fetchUserProfile();
    updateNavbar(user);
  } else {
    updateNavbar(null);
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  const quizList = document.getElementById("quizList");
  if (quizList) {
    fetchQuizzes(user);
  }

  const quizCreateForm = document.getElementById("quiz-create-form");
  if (quizCreateForm) {
    setupQuizCreateForm(user);
  }
});

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

const fetchQuizzes = async (user) => {
  const quizzes = await apiCall("https://quiz-zone-g1pi.onrender.com/api/quizzes/");
  const quizList = document.getElementById("quizList");

  if (quizzes && quizList) {
    quizList.innerHTML = quizzes
      .map((quiz) => {
        return `
        <div class="quiz-item">
          <h3>${quiz.title}</h3>
          <p>${quiz.description}</p>
          <a href="quiz_detail.html?quiz_id=${
            quiz.id
          }" class="take-quiz-link">Take Quiz</a>
          ${
            user && user.is_admin
              ? `
          <a href="edit_quiz.html?quiz_id=${quiz.id}" class="edit-quiz-link">Edit</a>
          <button class="delete-quiz-btn" data-id="${quiz.id}">Delete</button>
          `
              : ""
          }
        </div>`;
      })
      .join("");

    document.querySelectorAll(".delete-quiz-btn").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        const quizId = event.target.getAttribute("data-id");
        await deleteQuiz(quizId);
        fetchQuizzes(user);
      });
    });
  }
};

const deleteQuiz = async (quizId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quizId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Quiz deleted successfully.");
    } else {
      alert("Failed to delete quiz.");
    }
  } catch (error) {
    console.error("Error deleting quiz:", error);
  }
};

const setupQuizCreateForm = (user) => {
  if (!user || !user.is_admin) {
    window.location.href = "index.html";
    }
    
     const fetchCategories = async () => {
       const categories = await apiCall(
         "https://quiz-zone-g1pi.onrender.com/api/categories/"
       );
       const categorySelect = document.getElementById("quiz-category");
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

    const quizCreateForm = document.getElementById("quiz-create-form");
    const quizTimeLimitCheckbox = document.getElementById("quiz-time-limit");
    const timeLimitField = document.getElementById("time-limit-field");
    const addQuestionBtn = document.getElementById("add-question-btn");
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

    // Fetch categories and populate the category select field
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

   quizCreateForm.addEventListener("submit", async (event) => {
     event.preventDefault();

     const title = document.getElementById("quiz-title").value;
     const description = document.getElementById("quiz-description").value;
     const category = document.getElementById("quiz-category").value;
     const hasTimeLimit = document.getElementById("quiz-time-limit").checked;
     const timeLimit = document.getElementById("quiz-time-limit-value").value;

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
         "https://quiz-zone-g1pi.onrender.com/api/quizzes/create/",
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${localStorage.getItem("token")}`,
           },
           body: JSON.stringify(quizData),
         }
       );

       if (createResponse.ok) {
         const quiz = await createResponse.json();

         // Prepare questions
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
               const choiceText =
                 choiceItem.querySelector(".choice-text").value;
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

         // Add questions to the created quiz
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
           alert("Quiz created successfully with questions!");
           quizCreateForm.reset();
           timeLimitField.style.display = "none";
           questionsSection.innerHTML = "";
           fetchQuizzes();
         } else {
           alert("Failed to add questions to the quiz.");
         }
       } else {
         alert("Failed to create the quiz.");
       }
     } catch (error) {
       console.error("Error creating quiz:", error);
     }
   });
    
   

    const addCategoryBtn = document.getElementById("addCategoryBtn");
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener("click", async () => {
        const newCategoryInput = document.getElementById("newCategory");
        const newCategory = newCategoryInput.value.trim();

        if (newCategory) {
          try {
            const response = await fetch(
              "https://quiz-zone-g1pi.onrender.com/api/categories/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newCategory }),
              }
            );

            if (response.ok) {
              newCategoryInput.value = "";
              fetchCategories();
              console.log("New category added successfully!");
            } else {
              console.error("Failed to add new category.");
            }
          } catch (error) {
            console.error("Error adding new category:", error);
          }
        } else {
          console.error("Please enter a category name.");
        }
      });
    }
    
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
