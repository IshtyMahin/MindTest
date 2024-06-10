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

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault(); 

      if (!user) {
        alert("Please login to send a message.");
        return;
      }

      const formData = new FormData(contactForm);
      const messageData = {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
      };

      try {
        const response = await fetch(
          "https://quiz-zone-g1pi.onrender.com/api/user/contact/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData.message);
          contactForm.reset();
        } else {
          console.error("Failed to send message.");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Handle network error
      }
    });
  }
});

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://quiz-zone-g1pi.onrender.com/api/user/profile/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
  const all_quiz_btn = document.getElementById("all_quiz_btn");

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
    all_quiz_btn.style.display = "none";
    ddloginLink.style.display = "inline";
    ddlogoutLink.style.display = "none";
    ddprofileLink.style.display = "none";
    ddregisterLink.style.display = "inline";
    ddcreateQuizLink.style.display = "none";
    ddquiz_list.style.display = "none";
  }
};
