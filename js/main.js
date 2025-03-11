document.getElementById("menuBtn").addEventListener("click", function () {
    document.querySelector(".toggleMenu").classList.toggle("open");
    this.classList.toggle("open");
});

setTimeout(() => {
    document.querySelector(".notification a img").classList.add("start-shake");
    document.querySelector(".notification .newMessages").style.opacity = "1";
    document.querySelector(".notification .newMessages").style.transform = "scale(1)";
}, 10000);
