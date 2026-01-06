import { invoke } from "@tauri-apps/api/core";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

async function updateCountdown() {
  try {
    const countdown: Countdown = await invoke("get_countdown");
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.textContent = countdown.days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = countdown.hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = countdown.minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = countdown.seconds.toString().padStart(2, '0');
  } catch (error) {
    console.error("Failed to get countdown:", error);
  }
}

function scrambleText(element: HTMLElement, newText: string, duration: number) {
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const originalText = element.textContent || '';
  const length = Math.max(originalText.length, newText.length);
  let frame = 0;
  const totalFrames = Math.ceil(duration / 30);

  const tempSpan = document.createElement('span');
  tempSpan.style.fontFamily = window.getComputedStyle(element).fontFamily;
  tempSpan.style.fontSize = window.getComputedStyle(element).fontSize;
  tempSpan.style.fontWeight = window.getComputedStyle(element).fontWeight;
  tempSpan.style.position = 'absolute';
  tempSpan.style.visibility = 'hidden';
  tempSpan.style.whiteSpace = 'nowrap';
  tempSpan.textContent = newText;
  document.body.appendChild(tempSpan);
  const newWidth = tempSpan.offsetWidth;
  document.body.removeChild(tempSpan);
  element.style.width = `${newWidth}px`;

  const interval = setInterval(() => {
    let displayText = '';
    for (let i = 0; i < length; i++) {
      if (i < (frame / totalFrames) * length) {
        displayText += newText[i] || '';
      } else {
        displayText += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    element.textContent = displayText;
    frame++;
    if (frame > totalFrames) {
      clearInterval(interval);
    }
  }, 30);
}

window.addEventListener("DOMContentLoaded", () => {
  updateCountdown();

  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Start the countdown - no need to pause on blur/focus since we cache the target time
  setInterval(updateCountdown, 1000);

  const title = document.querySelector("#countdown-app .heading h1") as HTMLElement;
  const titles = [
    'HYPE IS REAL',
    'CAN\'T WAIT ANYMORE',
    'SOON™',
    'ALMOST THERE',
    'STAY TUNED',
    'COUNTING THE DAYS',
    'EXCITEMENT LEVEL: 100',
    'GET READY',
    'THE WAIT IS ALMOST OVER',
    'ADVENTURE AWAITS',
    'LET THE COUNTDOWN BEGIN',
    'PREPARE YOUR WORLDS',
    'THE JOURNEY BEGINS',
    'GEAR UP',
    'BRACE YOURSELVES',
    'THE FUTURE IS NEAR',
    'SO MUCH TO EXPLORE',
    'THE BEST IS YET TO COME',
    'READY FOR ACTION'
  ];
  title.textContent = titles[Math.floor(Math.random() * titles.length)];
  setInterval(() => {
    let newTitle;
    do {
      newTitle = titles[Math.floor(Math.random() * titles.length)];
    } while (newTitle === title.textContent);
    scrambleText(title, newTitle, 900);
  }, 10000);

  // Modal functionality
  const supportBtn = document.getElementById("support-btn") as HTMLButtonElement;
  const modal = document.getElementById("support-modal") as HTMLDivElement;
  const closeBtn = document.querySelector(".close") as HTMLSpanElement;
  const submitBtn = document.getElementById("submit-wishes") as HTMLButtonElement;
  const wishesText = document.getElementById("wishes-text") as HTMLTextAreaElement;

  supportBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  submitBtn.addEventListener("click", () => {
    const wishes = wishesText.value.trim();
    if (wishes) {
      // For now, just log it. In a real app, you'd send it to a server
      console.log("User wishes:", wishes);
      alert("Thank you for your support! Your wishes have been recorded.");

      // Hide modal
      modal.style.display = "none";
      wishesText.value = "";
    } else {
      alert("Please enter your wishes before submitting.");
    }
  });
});
