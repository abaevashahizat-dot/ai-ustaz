console.log("AI-Ustaz: SCRIPT.JS ЗАГРУЖЕН");

document.querySelectorAll(".card").forEach(function(card) {
  card.addEventListener("click", function() {
    alert("Кнопка работает: " + card.dataset.tool);
  });
});
