document.addEventListener("DOMContentLoaded", async () => {
  axios.defaults.baseURL = "http://localhost:3000";

  let alerts = document.querySelector(".alerts");

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

  let avatar = document.querySelector("#avatar");
  let fullName = document.querySelector("#fullName");
  let phoneNumber = document.querySelector("#phoneNumber");
  let form = document.querySelector("form");
  let messagesWrapper = document.querySelector(".messages");

  function displayChat(chat, friend) {
    avatar.innerHTML = friend.fullName[0];
    fullName.innerHTML = friend.fullName;
    phoneNumber.innerHTML = "+" + friend.phone;

    let { messages } = chat;

    [...messagesWrapper.children].forEach((child) => child.remove());

    messages.forEach((message) => {
      let msgEl = document.createElement("div");
      let timeEl = document.createElement("small");
      msgEl.classList.add(
        "message",
        message.fromId === +myId ? "from-me" : "to-me"
      );
      timeEl.classList.add("time");
      let time = new Date(message.date);
      timeEl.innerText = `${time.getHours().toString(10).padStart(2, 0)}:${time
        .getMinutes()
        .toString(10)
        .padStart(2, 0)}`;

      msgEl.innerText = message.text;
      msgEl.append(timeEl);

      messagesWrapper.append(msgEl);
    });
  }

  let chat;
  let friend;

  if (chatId) {
    let { data: chatData } = await axios.get(`/chats/${chatId}`);
    chat = chatData;
    let friendId = chat.members.find((member) => member !== +myId);
    let { data: friendData } = await axios.get(`/users/${friendId}`);
    friend = friendData;
    displayChat(chat, friend);
  } else if (friendId) {
    let [{ data: friendData }, { data: chats }] = await Promise.all([
      axios.get(`/users/${friendId}`),
      axios.get("/chats"),
    ]);

    friend = friendData;
    chat = chats.find(
      (chat) => chat.members.includes(+myId) && chat.members.includes(+friendId)
    );

    if (!chat) {
      let { data: newChat } = await axios.post("/chats", {
        members: [+myId, +friendId],
        messages: [],
      });

      chat = newChat;
    }

    displayChat(chat, friend);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let text = form[0].value;
    if (!text) return createAlert("Message cannot be empty");
    let id = crypto.randomUUID();

    let newMsg = {
      text,
      id,
      fromId: +myId,
      date: Date.now(),
    };

    chat.messages.push(newMsg);

    await axios.put(`/chats/${chat.id}`, chat);

    displayChat(chat, friend);

    form.reset();
  });
});
