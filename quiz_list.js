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

});

const updateNavbar = (user) => {
  const createQuizLink = document.getElementById("create-quiz-link");
  const profileLink = document.getElementById("profile-link");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");
  const registerLink = document.getElementById("register-link");
  const quiz_list = document.getElementById("quiz_list");

  if (user) {
    loginLink.style.display = "none";
    logoutLink.style.display = "inline";
    profileLink.style.display = "inline";
    registerLink.style.display = "none";

    if (user.is_admin) {
      createQuizLink.style.display = "inline";
    } else {
      createQuizLink.style.display = "none";
    }
  } else {
    loginLink.style.display = "inline";
    logoutLink.style.display = "none";
    profileLink.style.display = "none";
    registerLink.style.display = "inline";
    createQuizLink.style.display = "none";
    quiz_list.style.display = "none";
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
      <div class="bg-white rounded-lg shadow-md p-6 bg-gradient-to-b from-gray-600 to-gray-800 flex flex-col justify-between transform transition-transform hover:scale-105 hover:shadow-lg">
        <div>
          <h3 class="text-xl font-semibold mb-4 border-b-2 text-center">${
            quiz.title
          }</h3>
          <p class="mb-4">${quiz.description}</p>
        </div>
        <div class="card-actions flex justify-center">
          <a href="quiz_detail.html?quiz_id=${
            quiz.id
          }" class="btn px-8">Take Quiz</a>
          
        </div>
        <div class="card-actions flex justify-center my-2">
           ${
             user && user.is_admin
               ? `
             <a href="edit_quiz.html?quiz_id=${quiz.id}" class="btn px-8 ml-4 bg-green-300 hover:bg-green-400 ">Edit</a>
            <button class="btn px-8 ml-4 delete-quiz-btn bg-red-300 hover:bg-red-400 " data-id="${quiz.id}">Delete</button>
          `
               : ""
           }
        </div>
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
      `https://quiz-zone-g1pi.onrender.com/api/quizzes/${quizId}/delete/`,
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
