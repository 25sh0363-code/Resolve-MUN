const targetDate = new Date("2026-06-12T00:00:00");

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const statusElement = document.getElementById("countdown-status");
const loadingScreen = document.getElementById("loading-screen");
const revealElements = document.querySelectorAll(".reveal");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    daysElement.textContent = "00";
    hoursElement.textContent = "00";
    minutesElement.textContent = "00";
    secondsElement.textContent = "00";
    statusElement.textContent = "Conference is live. Enter committee.";
    return;
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  daysElement.textContent = pad(days);
  hoursElement.textContent = pad(hours);
  minutesElement.textContent = pad(minutes);
  secondsElement.textContent = pad(seconds);
}

function hideLoader() {
  if (!loadingScreen) {
    document.body.classList.remove("is-loading");
    return;
  }

  loadingScreen.classList.add("hide");
  document.body.classList.remove("is-loading");

  setTimeout(() => {
    loadingScreen.remove();
  }, 600);
}

function setupReveals() {
  if (!revealElements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initializePageMotion() {
  setupReveals();

  const minimumLoaderDuration = 900;
  setTimeout(hideLoader, minimumLoaderDuration);
}

updateCountdown();
setInterval(updateCountdown, 1000);

if (document.readyState === "complete") {
  initializePageMotion();
} else {
  window.addEventListener("load", initializePageMotion, { once: true });
}
