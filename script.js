const WORKER_URL =
"https://ai-ustaz-chat.abaeva-shahizat.workers.dev/";

let currentTool = "";
let chatHistory = [];

const titles = {
plan: "📚 План занятия",
lab: "🧪 Практическая работа",
test: "📝 Тест",
criteria: "🎯 Критерии оценивания",
explain: "👨‍🎓 Объяснить студенту",
chat: "💬 AI-чат"
};

const panel = document.getElementById("panel");
const title = document.getElementById("title");
const form = document.getElementById("form");
const result = document.getElementById("result");
const chatBox = document.getElementById("chatBox");
const chatInputArea = document.getElementById("chatInputArea");
const chatMessage = document.getElementById("chatMessage");
const generateBtn = document.getElementById("generateBtn");
const sendBtn = document.getElementById("sendBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");
const siteLanguage = document.getElementById("siteLanguage");

/* =========================
ОТКРЫТИЕ ИНСТРУМЕНТА
========================= */

document.querySelectorAll(".card").forEach(card => {

card.addEventListener("click", () => {


openTool(card.dataset.tool);


});

});

function openTool(type) {

currentTool = type;

panel.classList.add("show");

title.textContent = titles[type];

form.innerHTML = "";

result.hidden = true;
chatBox.hidden = true;
chatInputArea.hidden = true;

status.textContent = "";

if (type === "chat") {

generateBtn.style.display = "none";
copyBtn.style.display = "none";

chatBox.hidden = false;
chatInputArea.hidden = false;

if (chatHistory.length === 0) {

  addMessage(
    "ai",
    "Здравствуйте! 👋 Я AI-Ustaz.\n\n" +
    "Напишите свой вопрос, и я постараюсь помочь."
  );

}

} else {

generateBtn.style.display = "inline-block";
copyBtn.style.display = "inline-block";

const base = `

  <div class="row">

    <label>
      Дисциплина
      <input
        id="subject"
        placeholder="Например: JavaScript"
      >
    </label>

    <label>
      Тема
      <input
        id="topic"
        placeholder="Например: DOM"
      >
    </label>

  </div>

  <div class="row" style="margin-top:12px">

    <label>
      Курс
      <input
        id="course"
        placeholder="3 курс"
      >
    </label>

    <label>
      Язык
      <select id="language">
        <option value="Русский">Русский</option>
        <option value="Қазақша">Қазақша</option>
      </select>
    </label>

  </div>

`;

let extra = "";

if (type === "explain") {

  extra = `

    <label style="display:block;margin-top:12px">

      Что нужно объяснить

      <textarea
        id="question"
        placeholder="Например: объясни тему DOM простыми словами"
      ></textarea>

    </label>

  `;

}

if (type === "test") {

  extra = `

    <label style="display:block;margin-top:12px">

      Количество вопросов

      <input
        id="count"
        type="number"
        min="1"
        max="50"
        value="10"
      >

    </label>

  `;

}

form.innerHTML = base + extra;

}

panel.scrollIntoView({
behavior: "smooth"
});

}

/* =========================
ПОЛУЧЕНИЕ ЗНАЧЕНИЯ
========================= */

function getValue(id) {

const element = document.getElementById(id);

return element
? element.value.trim()
: "";

}

/* =========================
ЗАПРОС К CLOUDFLARE WORKER
========================= */

async function callWorker(message) {

const response = await fetch(
WORKER_URL,
{
method: "POST",

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({
    message: message
  })
}

);

const text = await response.text();

let data;

try {


data = JSON.parse(text);

} catch (error) {


throw new Error(
  "Worker вернул неправильный ответ:\n" +
  text
);

}

if (!response.ok) {

throw new Error(
  data.error ||
  "Ошибка Worker: " +
  response.status
);

}

return (
data.answer ||
data.response ||
data.message ||
data.text ||
"AI не вернул текст ответа."
);

}

/* =========================
СОЗДАНИЕ PROMPT
========================= */

function buildPrompt() {

const subject =
getValue("subject") || "не указана";

const topic =
getValue("topic") || "не указана";

const course =
getValue("course") || "студенты колледжа";

const language =
getValue("language") || "Русский";

if (currentTool === "plan") {

return `


Ты — AI-Ustaz, помощник преподавателя колледжа.

Создай подробный план занятия.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык ответа: ${language}

Включи:

1. Цель занятия
2. Результаты обучения
3. Этапы занятия с временем
4. Объяснение темы
5. Практическую работу
6. Проверку знаний
7. Рефлексию
8. Домашнее задание

Ответ должен быть структурированным и удобным для преподавателя.

`;

}

if (currentTool === "lab") {

return `

Ты — AI-Ustaz, помощник преподавателя колледжа.

Создай практическую работу для студентов.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык ответа: ${language}

Включи:

1. Цель работы
2. Ожидаемые результаты
3. Краткую теорию
4. Оборудование или программное обеспечение
5. Пошаговое задание
6. Контрольные вопросы
7. Критерии оценивания
8. Дескрипторы

Сделай задание понятным студентам колледжа.

`;

}

if (currentTool === "test") {

const count =
  getValue("count") || "10";

return `

Ты — AI-Ustaz, помощник преподавателя колледжа.

Создай тест для студентов.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык ответа: ${language}

Количество вопросов: ${count}

Для каждого вопроса:

* сформулируй вопрос;
* дай 4 варианта ответа;
* только один вариант должен быть правильным.

В конце укажи ключ правильных ответов.

`;

}

if (currentTool === "criteria") {

return `

Ты — AI-Ustaz, помощник преподавателя колледжа.

Создай критерии оценивания работы студента.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык ответа: ${language}

Создай систему оценивания на 100 баллов.

Для каждого критерия укажи:

* количество баллов;
* критерий;
* конкретные дескрипторы;
* что должен выполнить студент.

В конце добавь шкалу интерпретации результата.

`;

}

if (currentTool === "explain") {


const question =
  getValue("question") ||
  "Объясни тему простыми словами.";

return `

Ты — AI-Ustaz, помощник преподавателя колледжа.

Объясни студенту тему простым и понятным языком.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык ответа: ${language}

Запрос студента:

${question}

Структура ответа:

1. Простое определение
2. Объяснение
3. Практический пример
4. Типичная ошибка
5. Небольшое задание для самопроверки

Не используй слишком сложные термины без объяснения.

`;

}

return "";

}

/* =========================
КНОПКА СОЗДАТЬ
========================= */

generateBtn.addEventListener(
"click",
async () => {

const prompt = buildPrompt();

if (!prompt) {
  return;
}

result.hidden = false;

result.textContent =
  "⏳ AI-Ustaz готовит ответ...";

status.textContent =
  "Подключение к AI...";

generateBtn.disabled = true;

try {

  const answer =
    await callWorker(prompt);

  result.textContent = answer;

  status.textContent =
    "✅ Ответ получен.";

} catch (error) {

  result.textContent =
    "❌ Ошибка:\n\n" +
    error.message;

  status.textContent =
    "Ошибка соединения.";

  console.error(error);

} finally {

  generateBtn.disabled = false;

}

}
);

/* =========================
AI-ЧАТ
========================= */

sendBtn.addEventListener(
"click",
sendChat
);

async function sendChat() {

const message =
chatMessage.value.trim();

if (!message) {
return;
}

chatMessage.value = "";

addMessage(
"user",
message
);

const loading =
addMessage(
"ai",
"🤖 AI-Ustaz печатает..."
);

sendBtn.disabled = true;

try {
const history =
  chatHistory
    .slice(-10)
    .map(item =>
      item.role +
      ": " +
      item.content
    )
    .join("\n");


const prompt = `

Ты — AI-Ustaz, помощник преподавателя колледжа.

Отвечай понятно, грамотно и практически.

Если пользователь пишет по-русски —
отвечай по-русски.

Если пользователь пишет по-казахски —
отвечай по-казахски.

История предыдущего диалога:

${history}

Новый запрос пользователя:

${message}

`;

const answer =
  await callWorker(prompt);

loading.remove();

addMessage(
  "ai",
  answer
);

chatHistory.push({
  role: "user",
  content: message
});

chatHistory.push({
  role: "assistant",
  content: answer
});

} catch (error) {

loading.remove();

addMessage(
  "ai",
  "❌ Ошибка:\n" +
  error.message
);

console.error(error);

} finally {

sendBtn.disabled = false;

}

}

/* =========================
ДОБАВЛЕНИЕ СООБЩЕНИЯ
========================= */

function addMessage(type, text) {

const message =
document.createElement("div");

message.className =
"chat-message " +
(
type === "user"
? "chat-user"
: "chat-ai"
);

message.textContent = text;

chatBox.appendChild(message);

chatBox.scrollTop =
chatBox.scrollHeight;

return message;

}

/* =========================
КОПИРОВАНИЕ
========================= */

copyBtn.addEventListener(
"click",
async () => {

if (result.hidden) {
  return;
}

try {

  await navigator.clipboard.writeText(
    result.textContent
  );

  status.textContent =
    "📋 Скопировано.";

} catch (error) {

  status.textContent =
    "❌ Не удалось скопировать.";

}

}
);

/* =========================
CTRL + ENTER В ЧАТЕ
========================= */

chatMessage.addEventListener(
"keydown",
event => {

if (
  event.key === "Enter" &&
  event.ctrlKey
) {

  event.preventDefault();

  sendChat();

}

}
);

/* =========================
ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА
========================= */

siteLanguage.addEventListener(
"change",
() => {

if (siteLanguage.value === "kk") {

  document.querySelector(".hero h1").textContent =
    "Оқытушының интеллектуалды көмекшісі";

  document.querySelector(".hero p").textContent =
    "AI көмегімен сабақ жоспарларын, практикалық жұмыстарды, тесттерді және бағалау критерийлерін жасаңыз.";

} else {

  document.querySelector(".hero h1").textContent =
    "Интеллектуальный ассистент преподавателя";

  document.querySelector(".hero p").textContent =
    "Создавайте планы занятий, практические работы, тесты и критерии оценивания с помощью AI.";

}
```

}
);

/* =========================
ПРОВЕРКА ЗАГРУЗКИ
========================= */

console.log(
"✅ AI-Ustaz script.js загружен"
);
