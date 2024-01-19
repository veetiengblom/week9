const indexError = document.getElementById("indexError");
const emailField = document.getElementById("emailField");
const indexForm = document.getElementById("indexForm");
const loggedInForm = document.getElementById("loggedInForm");
const itemContainer = document.getElementById("itemContainer");
const itemBtn = document.getElementById("add-item");
const listOfItems = document.getElementById("allItems");

const checkLogIn = async () => {
  const authToken = localStorage.getItem("auth_token");
  if (authToken) {
    indexForm.style.display = "none";
    loggedInForm.style.display = "block";
    itemContainer.style.display = "block";
    newItem();
    try {
      const response = await fetch("/index", {
        method: "GET",
        headers: {
          authorization: "bearer " + authToken,
        },
      });

      if (!response.ok) {
        throw new Error("HTTP error: ", response.status);
      }
      const data = await response.json();
      emailField.innerText = data.email;

      const resp = await getItems();
      for (let i = 0; i < resp.items.length; i++) {
        let oneItem = document.createElement("li");
        oneItem.innerText = resp.items[i];
        listOfItems.appendChild(oneItem);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

document
  .getElementById("logOutBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    //delete token
    localStorage.removeItem("auth_token");

    //shwich display properties
    indexForm.style.display = "block";
    loggedInForm.style.display = "none";
    itemContainer.style.display = "none";
    window.location.href = "/";
  });

const newItem = async () => {
  itemBtn.addEventListener("keyup", async (event) => {
    if (event.key === "Enter") {
      let itemHolder = itemBtn.value;
      const authToken = localStorage.getItem("auth_token");
      try {
        const response = await fetch("/addItem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + authToken,
          },
          body: JSON.stringify({ items: itemHolder }),
        });
        if (!response.ok) {
          throw new Error("HTTP error: ", response.status);
        }
        itemBtn.value = "";
      } catch (error) {
        console.error(error);
      }
    }
  });
};

const getItems = async () => {
  const authToken = localStorage.getItem("auth_token");
  try {
    const response = await fetch("/getItems", {
      method: "GET",
      headers: {
        authorization: "bearer " + authToken,
      },
    });
    if (!response.ok) {
      throw new Error("HTTP error: ", response.status);
    }
    const data = response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", checkLogIn);
