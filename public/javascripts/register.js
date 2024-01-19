document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const registrationError = document.getElementById("registrationError");
    fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        console.log(response);
        if (response.ok) {
          window.location.href = "/login.html";
        } else if (response.status == 403) {
          registrationError.textContent = "Email is already in use";
        } else if (response.status == 400) {
          registrationError.textContent = "Password is not strong enough";
        }
      })
      .catch((error) => {
        console.error("Error in registration", error);
      });
  });
