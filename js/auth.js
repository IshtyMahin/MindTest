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

});

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

