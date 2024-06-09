document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    user = await fetchUserProfile();
    updateNavbar(user);
  } else {
    updateNavbar(null);
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const first_name = document.getElementById("first_name").value;
      const last_name = document.getElementById("last_name").value;
      const password = document.getElementById("password").value;
      const password2 = document.getElementById("password2").value;
      const profileImg = document.getElementById("profileImgUpload").files[0];

      const formData = new FormData();
      formData.append("image", profileImg);

      try {
        const imgbbResponse = await fetch(
          "https://api.imgbb.com/1/upload?key=dccf78e1bf130f4292eb12620c826d79",
          {
            method: "POST",
            body: formData,
          }
        );

        if (imgbbResponse.ok) {
          const imgbbData = await imgbbResponse.json();
          const profileImgUrl = imgbbData.data.url;

          const registrationData = {
            email,
            first_name,
            last_name,
            password,
            password2,
            profile_img: profileImgUrl,
          };

          const registerResponse = await fetch(
            "https://quiz-zone-g1pi.onrender.com/api/user/register/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(registrationData),
            }
          );

          if (registerResponse.ok) {
            alert("Registration successful!");
            window.location.href = "login.html";
          } else {
            alert("Registration failed. Please try again.");
          }
        } else {
          alert("Failed to upload profile image.");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(
          "https://quiz-zone-g1pi.onrender.com/api/user/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token.access);
          alert("Login successful!");
          window.location.href = "index.html";
        } else {
          alert("Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }
});

const apiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return await response.json();
    } else {
      console.error("API call failed:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
};

const fetchQuizzes = async () => {
  const quizzes = await apiCall("https://quiz-zone-g1pi.onrender.com/api/quizzes/");
  if (quizzes) {
    const quizList = document.getElementById("quizList");
    quizList.innerHTML = quizzes
      .map(
        (quiz) => `
      <div class="bg-white p-4 rounded-lg shadow-lg">
        <h3 class="text-xl font-bold">${quiz.title}</h3>
        <p>${quiz.description}</p>
        <a href="quiz_detail.html?quiz_id=${quiz.id}" class="bg-blue-500 text-white py-2 px-4 rounded mt-4 inline-block">Take Quiz</a>
      </div>
    `
      )
      .join("");
  }
};

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in local storage.");
      return null;
    }

    const response = await fetch("https://quiz-zone-g1pi.onrender.com/api/user/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return userData.id;
    } else {
      console.error("Failed to fetch user profile.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
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



