/*
  Typing Animation
  - Initialize typing animation functionality
*/

// Texts to display in the typing animation
const texts = [
  "Purr-fectly delighted to meet you ૮꒰ ྀི >⸝⸝⸝< ྀི꒱ა",
  "は じ め ま し て υ´• ﻌ •`υ",
  "Nice to meet you ₍˄•͈⚇•͈˄₎",
  "Meow-velous to make your acquaintance /ᐠ ̥  ̮  ̥ ᐟ\ฅ"
];

let textIndex = 0;
let charIndex = 0;
let isTyping = false;
let typingElement;

// Function to erase text
function eraseText() {
  if (!isTyping || !typingElement) return;
  const currentText = typingElement.textContent;
  if (currentText.length > 0) {
    typingElement.textContent = currentText.slice(0, -1);
    setTimeout(eraseText, 90);
  } else {
    textIndex = (textIndex + 1) % texts.length;
    charIndex = 0;
    setTimeout(type, 200);
  }
}

// Function to type text
function type() {
  if (!isTyping || !typingElement) return;
  const currentText = texts[textIndex];
  if (charIndex < currentText.length) {
    typingElement.textContent += currentText.charAt(charIndex);
    charIndex++;
    setTimeout(type, 100);
  } else {
    setTimeout(eraseText, 2000);
  }
}

// Function to reset typing animation
export function resetTyping() {
  if (!typingElement) return;
  
  const originalOpacity = typingElement.style.opacity || "1";
  typingElement.style.opacity = "0.5";
  
  setTimeout(() => {
    typingElement.style.opacity = originalOpacity;
  }, 300);
}

// Function to initialize typing animation
export function initTypingAnimation() {
  typingElement = document.querySelector('.typing-text');
  
  if (typingElement) {
    setTimeout(() => {
      isTyping = true;
      type();
    }, 500);
  }
} 