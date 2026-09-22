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

document.querySelectorAll(".card").forEach(card => {

card.addEventListener("click", () => {

```
openTool(card.dataset.tool);
```

});

});

function openTool(type){

currentTool = type;

panel.classList.add("show");

title.textContent = titles[type];

form.innerHTML = "";

result.hidden = true;

chatBox.hidden = true;

chatInputArea.hidden = true;

status.textContent = "";

if(type === "chat"){

```
generateBtn.style.display = "none";

copyBtn.style.display = "none";

chatBox.hidden = false;

chatInputArea.hidden = false;

if(chatHistory.length === 0){

  addMessage(
    "ai",
    "Здравствуйте! 👋 Я AI-Ustaz.\n\n" +
    "Напишите свой вопрос, и я постараюсь помочь."
  );

}
```

}else{

```
generateBtn.style.display = "inline-block";

copyBtn.style.display = "inline-block";

const base = `
  <div class="row">

    <label>
      Дисциплина
      <input id="subject" placeholder="Например: JavaScript">
    </label>

    <label>
      Тема
      <input id="topic" placeholder="Например: DOM">
    </label>

  </div>

  <div class="row" style="margin-top:12px">

    <label>
      Курс
      <input id="course" placeholder="3 курс">
    </label>

    <label>
      Язык
      <select id="language">
        <option>Русский</option>
        <option>Қазақша</option>
      </select>
    </label>

  </div>
`;

let extra = "";

if(type === "explain"){

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

if(type === "test"){

  extra = `
    <label style="display:block;margin-top:12px">
      Количество вопросов

      <input id="count" value="10">
    </label>
  `;

}

form.innerHTML = base + extra;
```

}

panel.scrollIntoView({
behavior:"smooth"
});

}

function getValue(id){

const element = document.getElementById(id);

return element ? element.value.trim() : "";

}

async function callWorker(message){

const response = await fetch(
WORKER_URL,
{
method:"POST",

```
  headers:{
    "Content-Type":"application/json"
  },

  body:JSON.stringify({
    message:message
  })
}
```

);

const text = await response.text();

let data;

try{

```
data = JSON.parse(text);
```

}catch(error){

```
throw new Error(
  "Worker вернул неправильный ответ: " +
  text
);
```

}

if(!response.ok){

```
throw new Error(
  data.error ||
  "Ошибка Worker: " +
  response.status
);
```

}

return (
data.answer ||
data.response ||
data.message ||
data.text ||
"AI не вернул текст ответа."
);

}

function buildPrompt(){

const subject =
getValue("subject") || "не указана";

const topic =
getValue("topic") || "не указана";

const course =
getValue("course") || "студенты колледжа";

const language =
getValue("language") || "Русский";

if(currentTool === "plan"){

```
return `
```

Создай подробный план занятия.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык: ${language}

Включи цель, результаты обучения,
этапы занятия с временем,
объяснение темы, практическую работу,
рефлексию и домашнее задание.
`;

}

if(currentTool === "lab"){

```
return `
```

Создай практическую работу для студентов колледжа.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык: ${language}

Включи цель, краткую теорию,
оборудование, пошаговое задание,
контрольные вопросы и критерии оценивания.
`;

}

if(currentTool === "test"){

```
const count =
  getValue("count") || "10";

return `
```

Создай тест для студентов колледжа.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык: ${language}

Количество вопросов: ${count}

Для каждого вопроса сделай 4 варианта ответа.
После теста укажи правильные ответы.
`;

}

if(currentTool === "criteria"){

```
return `
```

Создай критерии оценивания работы студента.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык: ${language}

Сделай систему оценивания на 100 баллов.
Добавь критерии и конкретные дескрипторы.
`;

}

if(currentTool === "explain"){

```
const question =
  getValue("question") ||
  "Объясни тему простыми словами.";

return `
```

Объясни студенту колледжа тему простым языком.

Дисциплина: ${subject}
Тема: ${topic}
Курс: ${course}
Язык: ${language}

Запрос:
${question}

Дай определение,
практический пример
и небольшое задание для самопроверки.
`;

}

return "";

}

generateBtn.addEventListener(
"click",
async () => {

```
const prompt = buildPrompt();

if(!prompt){
  return;
}

result.hidden = false;

result.textContent =
  "⏳ AI-Ustaz готовит ответ...";

status.textContent =
  "Подключение к Worker...";

generateBtn.disabled = true;

try{

  const answer =
    await callWorker(prompt);

  result.textContent = answer;

  status.textContent =
    "✅ Ответ получен.";

}catch(error){

  result.textContent =
    "❌ Ошибка:\n\n" +
    error.message;

  status.textContent =
    "Ошибка соединения.";

}finally{

  generateBtn.disabled = false;

}
```

}
);

sendBtn.addEventListener(
"click",
sendChat
);

async function sendChat(){

const message =
chatMessage.value.trim();

if(!message){
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

try{

```
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
```

Ты — AI-Ustaz, помощник преподавателя колледжа.

Отвечай понятно и практично.
Если пользователь пишет по-русски — отвечай по-русски.
Если по-казахски — отвечай по-казахски.

История:
${history}

Новый запрос:
${message}
`;

```
const answer =
  await callWorker(prompt);

loading.remove();

addMessage(
  "ai",
  answer
);

chatHistory.push({
  role:"user",
  content:message
});

chatHistory.push({
  role:"assistant",
  content:answer
});
```

}catch(error){

```
loading.remove();

addMessage(
  "ai",
  "❌ Ошибка:\n" +
  error.message
);
```

}finally{

```
sendBtn.disabled = false;
```

}

}

function addMessage(type,text){

const message =
document.createElement("div");

message.className =
"chat-message " +
(type === "user"
? "chat-user"
: "chat-ai");

message.textContent = text;

chatBox.appendChild(message);

chatBox.scrollTop =
chatBox.scrollHeight;

return message;

}

copyBtn.addEventListener(
"click",
async () => {

```
if(result.hidden){
  return;
}

try{

  await navigator.clipboard.writeText(
    result.textContent
  );

  status.textContent =
    "📋 Скопировано.";

}catch(error){

  status.textContent =
    "Не удалось скопировать.";

}
```

}
);

chatMessage.addEventListener(
"keydown",
event => {

```
if(
  event.key === "Enter" &&
  event.ctrlKey
){

  sendChat();

}
```

}
);
