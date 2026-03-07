const targetDate = new Date("2026-06-11T09:00:00");

const countdownNodes = {
  days: document.querySelectorAll("[data-days]"),
  hours: document.querySelectorAll("[data-hours]"),
  minutes: document.querySelectorAll("[data-minutes]"),
  seconds: document.querySelectorAll("[data-seconds]"),
  status: document.querySelectorAll("[data-countdown-status]"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function paintNodeList(nodes, value) {
  nodes.forEach((node) => {
    node.textContent = value;
  });
}

function updateCountdown() {
  if (!countdownNodes.days.length) {
    return;
  }

  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    paintNodeList(countdownNodes.days, "00");
    paintNodeList(countdownNodes.hours, "00");
    paintNodeList(countdownNodes.minutes, "00");
    paintNodeList(countdownNodes.seconds, "00");
    paintNodeList(countdownNodes.status, "Conference is live. Enter committee.");
    return;
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  paintNodeList(countdownNodes.days, pad(days));
  paintNodeList(countdownNodes.hours, pad(hours));
  paintNodeList(countdownNodes.minutes, pad(minutes));
  paintNodeList(countdownNodes.seconds, pad(seconds));
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -35px 0px",
    }
  );

  items.forEach((item) => observer.observe(item));
}

function setupCursorGlow() {
  const cursor = document.querySelector(".cursor-glow");
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  let raf = 0;
  let x = 0;
  let y = 0;

  const applyPosition = () => {
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    raf = 0;
  };

  window.addEventListener("mousemove", (event) => {
    x = event.clientX;
    y = event.clientY;
    cursor.style.opacity = "1";
    if (!raf) {
      raf = requestAnimationFrame(applyPosition);
    }
  });

  window.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });
}

function setupMobileNav() {
  const menuBtn = document.querySelector("[data-menu-toggle]");
  if (!menuBtn) {
    return;
  }

  menuBtn.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
    const expanded = document.body.classList.contains("menu-open");
    menuBtn.setAttribute("aria-expanded", String(expanded));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

function setupTiltCards() {
  const cards = document.querySelectorAll(".tilt");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

function init() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupReveal();
  setupCursorGlow();
  setupMobileNav();
  setupTiltCards();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
