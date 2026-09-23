console.log("AI-Ustaz SCRIPT.JS ЗАГРУЖЕН");

document.querySelectorAll(".card").forEach(function(card) {

card.addEventListener("click", function() {
alert("РАБОТАЕТ: " + card.dataset.tool);

});

});
