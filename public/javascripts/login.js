document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log("Email: " + email);
    console.log("Password: " + password);
    const loginError = document.getElementById("loginError");

    fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          loginError.textContent = "Invalid credentials";
        }
        return response.json();
      })
      .then((data) => {
        if (data.token) {
          storeToken(data.token);
          window.location.href = "/";
        } else {
          console.error("Login failed");
        }
      })
      .catch((error) => {
        console.error("Error in login:", error);
      });
  });
function storeToken(token) {
  localStorage.setItem("auth_token", token);
}
