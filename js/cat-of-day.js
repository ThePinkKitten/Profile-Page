/*
  Cat of the Day Feature
  - Fetches random cat images from TheCatAPI
  - Generates cat quotes
*/

// Array of cat-related quotes
const catQuotes = [
  "A new cat each day keeps the stress away!",
  "Cats are not our masters, they are our programmers.",
  "Behind every great programmer is a cat watching over them.",
  "Not all those who wander are lost - some are cats debugging.",
  "Cats and code have something in common: both are mysterious yet adorable!",
  "When solving bugs, think like a cat: patient and focused.",
  "Debug like a cat - never give up until you catch that mouse (bug).",
  "How can you tell if a developer owns a cat? They code with one hand.",
  "Cats have 9 lives, programmers have 9 backups.",
  "A day without cats is a day without enough coding.",
  "The two most important things in life: cats and cache memory.",
  "Meow is just another way of saying 'Hello World'",
  "Cats don't break code, they just refactor it unexpectedly.",
  "Great code is like a cat: elegant, efficient, and does exactly what it wants.",
  "The Internet exists solely for cat pictures and Stack Overflow."
];

// Function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to load a new cat
function loadNewCat() {
  const catImage = document.getElementById('catOfDay'); // Cập nhật ID đúng từ catImage thành catOfDay
  const catQuote = document.getElementById('catQuote');
  
  // Add loading state
  if (catImage) {
    catImage.style.opacity = '0.5';
    
    // Fetch a new random cat image
    const timestamp = new Date().getTime(); // Add timestamp to prevent caching
    catImage.src = `https://api.thecatapi.com/v1/images/search?format=src&mime_types=image/jpg&${timestamp}`;
    
    // When image is loaded
    catImage.onload = function() {
      catImage.style.opacity = '1';
      catImage.classList.add('meow-loaded');
      setTimeout(() => catImage.classList.remove('meow-loaded'), 1000);
    };
  }
  
  // Update the quote
  if (catQuote) {
    catQuote.textContent = getRandomItem(catQuotes);
    catQuote.style.opacity = '0';
    setTimeout(() => {
      catQuote.style.opacity = '1';
    }, 300);
  }
}

// Initialize the Cat of the Day feature
export function initCatOfDay() {
  // Check if the cat image element exists on the current page
  const catImage = document.getElementById('catOfDay'); // Cập nhật ID đúng từ catImage thành catOfDay
  const catQuote = document.getElementById('catQuote');
  
  if (catImage && catQuote) {
    // Load initial cat
    loadNewCat();
    
    // Add click event to the cat image to load a new cat
    catImage.addEventListener('click', function(e) {
      e.preventDefault();
      loadNewCat();
      
      // Add a little paw effect when clicking
      const pawPrint = document.createElement('div');
      pawPrint.className = 'paw-print';
      pawPrint.innerHTML = '🐾';
      pawPrint.style.position = 'absolute';
      pawPrint.style.left = (e.offsetX) + 'px';
      pawPrint.style.top = (e.offsetY) + 'px';
      pawPrint.style.animation = 'pawPrint 1s forwards';
      this.parentNode.appendChild(pawPrint);
      
      setTimeout(() => {
        this.parentNode.removeChild(pawPrint);
      }, 1000);
    });
  }
}
