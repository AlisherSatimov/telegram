document.addEventListener("DOMContentLoaded", async function () {
  axios.defaults.baseURL = "http://localhost:3000";
  let alerts = document.querySelector(".alerts");
  let form = document.querySelector("form");

  function createAlert(msg, type = "error") {
    let alertElement = document.createElement("div");
    let color =
      type === "error"
        ? "rose"
        : type === "success"
        ? "green"
        : type === "info"
        ? "blue"
        : "yellow";
    let className = `text-xl ps-8 py-2 pe-4 rounded-lg border border-${color}-900 text-${color}-900 bg-${color}-200`;

    alertElement.classList.add(...className.split(" "));
    alertElement.innerText = msg;
    let closeBtn = document.createElement("button");
    closeBtn.classList.add("ms-4");
    closeBtn.innerText = "X";
    alertElement.append(closeBtn);
    alerts.append(alertElement);
    closeBtn.addEventListener("click", () => alertElement.remove());
    setTimeout(() => alertElement.remove(), 3_000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let phone = form[0].value;
    let password = form[1].value;

    if (!phone || !password) return createAlert("All fields are required!");

    if (phone.length !== 13 || !phone.startsWith("+998"))
      return createAlert("Phone format must be +998XXXXXXXXX");

    if (password.length < 4)
      return createAlert("Password must be at least 4 character long");

    phone = phone.slice(1);

    let {
      data: [user],
    } = await axios.get(`/users?phone=${phone}`);

    if (!user) return createAlert("No user found for this phone number");

    if (password !== user.password) return createAlert("Wrong password");

    localStorage.setItem("user-id", user.id);

    createAlert("Logged in successfully", "success");

    setTimeout(() => {
      window.location.replace("/");
    }, 3_500);
  });
});
