/*
  Typing An  "Still learning... but already purring ⋆⁺₊⋆ ☁︎",
  "Building 8+ amazing projects... with purr-fect architecture ₊˚⊹⋆｡𖦹",
  "Typing gently... don't wake my inner lion (ฅ'ω'ฅ)",
  "Full-stack developer with enterprise experience ❀( ˶ˆᗜˆ˵ )❀",
  "React + Node.js + Docker enthusiast ˘•ﻌ•˘",
  "Deploying microservices... please stand by ⁽⁽ଘ( ˊᵕˋ )ଓ⁾⁾",
  "Containerizing applications with a soft paw touch ෆ⸒⸒⸜( ˶'ᵕ'˶)⸝",
  "MongoDB + MySQL + Firebase expert ♡( ◡‿◡ )",
  "Paws-itively dedicated to clean architecture 𓃠",
  "Code. Deploy. Purr. Repeat. ♡(=^- ω -^=)",
  "I speak softly... but I carry enterprise solutions ⸝⸝⸝ᵕ ﻌ ᵕ⸝⸝⸝",
  "CI/CD pipelines with a cute tail ฅ^•ﻌ•^ฅ",
  "Little paws, big commits & production deployments ⋆꒰⌯͒•ɷ•⌯͒꒱",
  "Club Management + E-commerce + AI Chess... (⁎⁍̴̛ᴗ⁍̴̛⁎)",
  "Docker containers are my new cardboard boxes ˶ᵔ ᵕ ᵔ˶",
  - Creates typewriter effect with multiple phrases
  - Auto-cycles through defined phrases
*/

/**
 * Array of greeting phrases to display in the typing animation
 * Includes cat-themed emoticons and multi-language greetings
 */
const texts = [
  "Purr-fectly delighted to meet you ૮꒰ ྀི >⸝⸝⸝< ྀི꒱ა",
  "は じ め ま し て υ´• ﻌ •`υ",
  "Nice to meet you ₍˄•͈⚇•͈˄₎",
  "Meow-velous to make your acquaintance /ᐠ ̥  ̮  ̥ ᐟ\\ฅ",
  "Still learning... but already purring ⋆⁺₊⋆ ☁︎",
  "Typing gently... don’t wake my inner lion (ฅ'ω'ฅ)",
  "Full-stack fluff in the making ₊˚⊹⋆｡𖦹",
  "A quiet coder with loud thoughts ❀( ˶ˆᗜˆ˵ )❀",
  "Please don't debug me... I'm sensitive ˘•ﻌ•˘",
  "Deploying cuddles... please stand by ⁽⁽ଘ( ˊᵕˋ )ଓ⁾⁾",
  "Logging in with a soft paw touch ෆ⸒⸒⸜( ˶'ᵕ'˶)⸝",
  "Sleeping on your code and making it better ♡( ◡‿◡ )",
  "Paws-itively dedicated to quality code 𓃠",
  "Copy. Paste. Purr. Repeat. ♡(=^- ω -^=)",
  "I speak softly... but I carry a big purr ⸝⸝⸝ᵕ ﻌ ᵕ⸝⸝⸝",
  "Code softly and carry a cute tail ฅ^•ﻌ•^ฅ",
  "Little paws, big commits ⋆꒰⌯͒•ɷ•⌯͒꒱",
  "I write code... sometimes in my sleep (⁎⁍̴̛ᴗ⁍̴̛⁎)",
  "Please wait... compiling cuddles ˶ᵔ ᵕ ᵔ˶",  "Napping until next deployment... zzZ₍ᐢ•ﻌ•ᐢ₎",
  "Swagger documentation lover ૮₍ ´• ˕ •` ₎ა",
  "Silent... but emotionally available for code reviews ₊˚ʚ ᗢ₊",
  "Push gently — my microservices have feelings ꒰⸝⸝⸝｡ ·̫ ｡⸝⸝⸝꒱",
  "From Android to Web to Desktop development ₍ᐢ. ̫.ᐢ₎",
  "8 projects and counting... but I purr with purpose ʕ ꈍᴥꈍʔ",
  "Payment integration specialist (MoMo + PayPal) ⸝⸝⸝ᵕᴗᵕ⸝⸝⸝",
  "OAuth 2.0 authentication with soft tabs ✿˘︶˘✿",
  "Enterprise architecture in a kitten package ❥( ⸝⸝⸝ᵕᴗᵕ⸝⸝⸝ )",
  "No bugs, only surprise features... like me ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა",
  "Reading API docs like bedtime stories 𓃠✧˖°",
  "Turning complex requirements into purr-fect solutions ( ˘ω˘ )"
];




// State variables for typing animation
let textIndex = 0;       // Current text being displayed
let charIndex = 0;       // Current character position
let isTyping = false;    // Whether typing animation is active
let typingElement;       // DOM element for displaying text

/**
 * Erase text with typewriter effect
 * Removes one character at a time
 */
function eraseText() {
  if (!isTyping || !typingElement) return;
  const currentText = typingElement.textContent;
    if (currentText.length > 0) {
    typingElement.textContent = currentText.slice(0, -1);
    setTimeout(eraseText, 50);
  } else {
    textIndex = (textIndex + 1) % texts.length;
    charIndex = 0;
    setTimeout(type, 200);
  }
}

/**
 * Type text with typewriter effect
 * Adds one character at a time
 */
function type() {
  if (!isTyping || !typingElement) return;
  const currentText = texts[textIndex];
    if (charIndex < currentText.length) {
    typingElement.textContent += currentText.charAt(charIndex);
    charIndex++;
    setTimeout(type, 60);
  } else {
    setTimeout(eraseText, 1200);
  }
}

/**
 * Reset typing animation with fade effect
 * Used when changing pages or sections
 */
export function resetTyping() {
  if (!typingElement) return;
  
  const originalOpacity = typingElement.style.opacity || "1";
  typingElement.style.opacity = "0.5";
  
  setTimeout(() => {
    typingElement.style.opacity = originalOpacity;
  }, 300);
}

/**
 * Initialize typing animation
 * Finds the target element and starts the animation
 */
export function initTypingAnimation() {
  typingElement = document.querySelector('.typing-text');
  
  if (typingElement) {
    setTimeout(() => {
      isTyping = true;
      type();
    }, 500);
  }
}