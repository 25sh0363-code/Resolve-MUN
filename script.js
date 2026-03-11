/* ── Resolve MUN — Enhanced Interactive Engine ── */

const targetDate = new Date("2026-06-11T09:00:00");

const countdownNodes = {
  days: document.querySelectorAll("[data-days]"),
  hours: document.querySelectorAll("[data-hours]"),
  minutes: document.querySelectorAll("[data-minutes]"),
  seconds: document.querySelectorAll("[data-seconds]"),
  status: document.querySelectorAll("[data-countdown-status]"),
};

function pad(value) { return String(value).padStart(2, "0"); }

function paintNodeList(nodes, value) {
  nodes.forEach((node) => { node.textContent = value; });
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
  if (!items.length) return;
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
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );
  items.forEach((item) => observer.observe(item));
}

// ── Dual Magnetic Cursor ──────────────────────────────────────
function setupCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const dot  = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-glow";
  document.body.append(dot, ring);

  let mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });
  window.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });

  (function animateRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll("a, button, .card, .tilt, .metric, .btn").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("cursor-expanded"));
    el.addEventListener("mouseleave", () => ring.classList.remove("cursor-expanded"));
  });
}

// ── Particle Constellation ────────────────────────────────────
function setupParticles() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const PR  = Math.min(devicePixelRatio, 2);

  function resize() {
    canvas.width  = innerWidth  * PR;
    canvas.height = innerHeight * PR;
    ctx.scale(PR, PR);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const COUNT = innerWidth < 768 ? 50 : 95;
  const P = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * innerWidth,
    y:  Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r:  Math.random() * 1.3 + 0.35,
    a:  Math.random() * 0.45 + 0.12,
  }));

  let mouseX = -9999, mouseY = -9999;
  window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  const CON = 135, MCON = 155;

  (function frame() {
    const W = innerWidth, H = innerHeight;
    ctx.clearRect(0, 0, W, H);
    P.forEach((p) => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    });
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      const dm = Math.hypot(a.x - mouseX, a.y - mouseY);
      if (dm < MCON) {
        const alpha = (1 - dm / MCON) * 0.45;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(155,114,245,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
      for (let j = i + 1; j < P.length; j++) {
        const b = P[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < CON) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,120,210,${(1 - d / CON) * 0.22})`;
          ctx.lineWidth = 0.45;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(155,114,245,${a.a})`;
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  })();
}

// ── Count-up Stats ────────────────────────────────────────────
function setupCountUp() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target  = parseFloat(el.dataset.count);
      const suffix  = el.dataset.suffix  || "";
      const prefix  = el.dataset.prefix  || "";
      const isFloat = String(target).includes(".");
      const dur = 1800;
      const t0  = performance.now();
      function step(now) {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (isFloat ? (target * ease).toFixed(2) : Math.round(target * ease)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

// ── Typewriter ────────────────────────────────────────────────
function setupTypewriter() {
  const el = document.querySelector("[data-typewriter]");
  if (!el) return;
  el.classList.add("tw-cursor");
  const words = el.dataset.typewriter.split("|");
  let wi = 0, ci = 0, del = false;
  el.textContent = "";
  function tick() {
    const word = words[wi];
    if (!del) {
      el.textContent = word.slice(0, ci + 1);
      ci++;
      if (ci === word.length) { del = true; setTimeout(tick, 1900); return; }
    } else {
      el.textContent = word.slice(0, ci - 1);
      ci--;
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? 46 : 78);
  }
  tick();
}

// ── Mobile Nav ────────────────────────────────────────────────
function setupMobileNav() {
  const menuBtn = document.querySelector("[data-menu-toggle]");
  if (!menuBtn) return;
  menuBtn.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", document.body.classList.contains("menu-open") ? "true" : "false");
  });
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// ── Tilt Cards ────────────────────────────────────────────────
function setupTiltCards() {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width  - 0.5;
      const y = (event.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.01)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
    });
  });
}

// ── Click Ripple ──────────────────────────────────────────────
function setupRipple() {
  document.querySelectorAll(".card, .metric, .btn").forEach((el) => {
    el.addEventListener("click", (e) => {
      const r = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position:absolute;border-radius:50%;width:8px;height:8px;
        left:${e.clientX - r.left - 4}px;top:${e.clientY - r.top - 4}px;
        background:rgba(155,114,245,0.55);transform:scale(0);
        animation:rippleAnim 0.62s ease-out forwards;
        pointer-events:none;z-index:5;
      `;
      el.style.position = "relative";
      el.style.overflow  = "hidden";
      el.append(ripple);
      setTimeout(() => ripple.remove(), 680);
    });
  });
}

// ── Floating Globes ───────────────────────────────────────────
function setupFloatingGlobes() {
  if (document.querySelector(".floating-globes")) return;
  const layer = document.createElement("div");
  layer.className = "floating-globes";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <div class="wire-globe globe-left"></div>
    <div class="wire-globe globe-right"></div>
  `;
  document.body.append(layer);
  const globes = layer.querySelectorAll(".wire-globe");
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.024;
    globes.forEach((globe, index) => {
      globe.style.translate = `0 ${Math.round(offset * (index % 2 === 0 ? 1 : -1))}px`;
    });
  }, { passive: true });
}

// ── Nav Shadow on Scroll ──────────────────────────────────────
function setupNavScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });
}

// ── Hero Parallax ─────────────────────────────────────────────
function setupHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero || window.matchMedia("(pointer: coarse)").matches) return;
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / innerWidth  - 0.5) * 10;
    const y = (e.clientY / innerHeight - 0.5) * 6;
    hero.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  }, { passive: true });
}

// ── Easter Eggs ───────────────────────────────────────────────
function showBadge(text) {
  const b = document.createElement("div");
  b.className = "secret-badge";
  b.textContent = text;
  document.body.append(b);
  requestAnimationFrame(() => b.classList.add("visible"));
  setTimeout(() => { b.classList.remove("visible"); setTimeout(() => b.remove(), 500); }, 3600);
}

function burstParticles() {
  const N = 30, cx = innerWidth / 2, cy = innerHeight / 2;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const dist  = 80 + Math.random() * 90;
    const span  = document.createElement("span");
    span.style.cssText = `
      position:fixed;left:${cx}px;top:${cy}px;
      width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px;
      border-radius:50%;pointer-events:none;z-index:300;
      background:hsl(${250 + Math.random() * 60},85%,68%);
      animation:burst 0.95s ease-out forwards;
      --bx:${Math.cos(angle) * dist}px;--by:${Math.sin(angle) * dist}px;
    `;
    document.body.append(span);
    setTimeout(() => span.remove(), 1000);
  }
}

function showSecretPopup() {
  if (document.getElementById("secret-drink-popup")) return;
  const overlay = document.createElement("div");
  overlay.id = "secret-drink-popup";
  overlay.innerHTML = `
    <div class="sdp-card">
      <div class="sdp-icon">🍵</div>
      <p class="sdp-eyebrow">YOU FOUND IT</p>
      <h2 class="sdp-title">Secret Unlocked</h2>
      <p class="sdp-body">Show this to <strong>Tech USG&nbsp;– Omsuraj</strong> on <strong>Day&nbsp;2</strong> of Resolve MUN to claim a free drink on him.</p>
      <p class="sdp-fine">⚠️ Only valid for the <strong>first 2 people</strong> who find this. First come, first served.</p>
      <button class="sdp-close">Got It — I'm Claiming This 🎉</button>
    </div>
  `;
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
  const close = () => {
    overlay.classList.remove("visible");
    setTimeout(() => overlay.remove(), 420);
  };
  overlay.querySelector(".sdp-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
}

function setupEasterEggs() {
  // ① Konami Code
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let ki = 0;
  window.addEventListener("keydown", (e) => {
    ki = (e.key === KONAMI[ki]) ? ki + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (ki === KONAMI.length) { showBadge("🕊️ You found the Diplomat's Code"); ki = 0; }
  });

  // ② Type "RESOLVE" anywhere
  let typed = "";
  window.addEventListener("keydown", (e) => {
    if (!e.key || e.key.length !== 1) return;
    typed = (typed + e.key.toUpperCase()).slice(-7);
    if (typed === "RESOLVE") { showBadge("⚖️ The chamber recognizes your resolve"); burstParticles(); typed = ""; }
  });

  // ③ Logo taps — 3× on mobile = secret popup, 7× on desktop = badge
  let tapCount = 0, tapTimer = null;
  const brand = document.querySelector(".brand");
  if (brand) {
    // Use touchstart for instant response on mobile (no 300ms delay)
    brand.addEventListener("touchstart", (e) => {
      e.preventDefault(); // stop navigation + stop the ghost click
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 1800);
      if (tapCount === 3) { showSecretPopup(); tapCount = 0; }
    }, { passive: false });

    // Desktop fallback: 7 clicks
    brand.addEventListener("click", (e) => {
      if (window.matchMedia("(pointer: coarse)").matches) { e.preventDefault(); return; }
      e.preventDefault();
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 1800);
      if (tapCount === 7) { showBadge("🌍 All 193 nations stand ready"); burstParticles(); tapCount = 0; }
    });
  }
}

function setFormStatus(statusNode, text, type) {
  if (!statusNode) return;
  statusNode.textContent = text;
  statusNode.classList.remove("success", "error");
  if (type) {
    statusNode.classList.add(type);
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (!base64) {
        reject(new Error("Could not process proof of payment file."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read proof of payment file."));
    reader.readAsDataURL(file);
  });
}

function setupDelegateRegistration() {
  const form = document.getElementById("delegate-registration-form");
  if (!form) return;

  const submitButton = form.querySelector("button[type='submit']");
  const statusNode = form.querySelector("[data-form-status]");
  const endpoint = (form.dataset.appscriptUrl || "").trim();
  const defaultLabel = submitButton?.dataset.submitLabel || "Submit Delegate Registration";

  if (!endpoint || endpoint.includes("PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE")) {
    if (submitButton) submitButton.disabled = true;
    setFormStatus(
      statusNode,
      "Connect the Google Apps Script URL in register.html to enable submissions.",
      "error"
    );
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      setFormStatus(statusNode, "Please complete all required fields.", "error");
      return;
    }

    const formData = new FormData(form);
    if ((formData.get("website") || "").toString().trim()) {
      setFormStatus(statusNode, "Validation failed.", "error");
      return;
    }

    const proofFile = formData.get("proofOfPayment");
    if (!(proofFile instanceof File) || !proofFile.name) {
      setFormStatus(statusNode, "Please upload proof of payment.", "error");
      return;
    }
    if (proofFile.size > 12 * 1024 * 1024) {
      setFormStatus(statusNode, "Proof of payment must be 12MB or less.", "error");
      return;
    }

    const allowedFile =
      proofFile.type.startsWith("image/") ||
      proofFile.type === "application/pdf" ||
      /\.(jpg|jpeg|png|webp|heic|pdf)$/i.test(proofFile.name);
    if (!allowedFile) {
      setFormStatus(statusNode, "Please upload an image screenshot/photo or PDF.", "error");
      return;
    }

    let proofOfPaymentBase64 = "";
    try {
      proofOfPaymentBase64 = await readFileAsBase64(proofFile);
    } catch (error) {
      setFormStatus(statusNode, error?.message || "Could not process proof of payment file.", "error");
      return;
    }

    const payload = {
      registrationType: "delegate",
      fullName: (formData.get("fullName") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      institution: (formData.get("institution") || "").toString().trim(),
      city: (formData.get("city") || "").toString().trim(),
      country: (formData.get("country") || "").toString().trim(),
      grade: (formData.get("grade") || "").toString().trim(),
      munExperience: (formData.get("munExperience") || "").toString().trim(),
      committeePreference1: (formData.get("committeePreference1") || "").toString().trim(),
      committeePreference2: (formData.get("committeePreference2") || "").toString().trim(),
      portfolioPreference: (formData.get("portfolioPreference") || "").toString().trim(),
      paymentReference: (formData.get("paymentReference") || "").toString().trim(),
      dietaryNotes: (formData.get("dietaryNotes") || "").toString().trim(),
      medicalNotes: (formData.get("medicalNotes") || "").toString().trim(),
      proofOfPaymentFileName: proofFile.name,
      proofOfPaymentMimeType: proofFile.type || "application/octet-stream",
      proofOfPaymentBase64,
      consent: formData.get("consent") === "on",
      source: "website",
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }
    setFormStatus(statusNode, "Submitting registration...", null);

    try {
      const body = new URLSearchParams({
        payload: JSON.stringify(payload),
      });

      const response = await fetch(endpoint, {
        method: "POST",
        body,
      });

      const responseText = await response.text();
      let responseData = {};
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (_error) {
        responseData = {};
      }

      if (!response.ok || responseData.status === "error") {
        const message = responseData.message || "Registration failed. Please try again.";
        throw new Error(message);
      }

      setFormStatus(
        statusNode,
        "Registration received. Check your email soon for confirmation from the organizing team.",
        "success"
      );
      form.reset();
    } catch (error) {
      setFormStatus(
        statusNode,
        error?.message || "Could not submit registration right now. Please try again.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultLabel;
      }
    }
  });
}

function setupOrganisingCommitteeRegistration() {
  const form = document.getElementById("oc-registration-form");
  if (!form) return;

  const submitButton = form.querySelector("button[type='submit']");
  const statusNode = form.querySelector("[data-form-status]");
  const endpoint = (form.dataset.appscriptUrl || "").trim();
  const defaultLabel = submitButton?.dataset.submitLabel || "Submit Organising Committee Application";

  if (!endpoint || endpoint.includes("PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE")) {
    if (submitButton) submitButton.disabled = true;
    setFormStatus(
      statusNode,
      "Connect the Google Apps Script URL in register.html to enable submissions.",
      "error"
    );
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      setFormStatus(statusNode, "Please complete all required fields.", "error");
      return;
    }

    const formData = new FormData(form);
    if ((formData.get("website") || "").toString().trim()) {
      setFormStatus(statusNode, "Validation failed.", "error");
      return;
    }

    const payload = {
      registrationType: "organisingCommittee",
      fullName: (formData.get("fullName") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      institution: (formData.get("institution") || "").toString().trim(),
      grade: (formData.get("grade") || "").toString().trim(),
      preferredTeam: (formData.get("preferredTeam") || "").toString().trim(),
      relevantExperience: (formData.get("relevantExperience") || "").toString().trim(),
      motivation: (formData.get("motivation") || "").toString().trim(),
      availability: (formData.get("availability") || "").toString().trim(),
      consent: formData.get("consent") === "on",
      source: "website",
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }
    setFormStatus(statusNode, "Submitting application...", null);

    try {
      const body = new URLSearchParams({
        payload: JSON.stringify(payload),
      });

      const response = await fetch(endpoint, {
        method: "POST",
        body,
      });

      const responseText = await response.text();
      let responseData = {};
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (_error) {
        responseData = {};
      }

      if (!response.ok || responseData.status === "error") {
        const message = responseData.message || "Application failed. Please try again.";
        throw new Error(message);
      }

      setFormStatus(
        statusNode,
        "Application received. The team will review your profile and reach out.",
        "success"
      );
      form.reset();
    } catch (error) {
      setFormStatus(
        statusNode,
        error?.message || "Could not submit application right now. Please try again.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultLabel;
      }
    }
  });
}

// ── Init ──────────────────────────────────────────────────────
function init() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupParticles();
  setupReveal();
  setupCursor();
  setupMobileNav();
  setupTiltCards();
  setupRipple();
  setupFloatingGlobes();
  setupNavScroll();
  setupHeroParallax();
  setupTypewriter();
  setupCountUp();
  setupEasterEggs();
  setupDelegateRegistration();
  setupOrganisingCommitteeRegistration();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
