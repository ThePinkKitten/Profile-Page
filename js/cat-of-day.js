/*
  Cat of the Day Feature
  - Fetches random cat images from TheCatAPI
  - Displays random programming-related cat quotes
  - Provides interactive cat image refresh
*/

/**
 * Collection of cat-related programming quotes
 * Used to display a random quote with each cat image
 */
const catQuotes = [
  "A new cat each day keeps the stress away!",
  "Cats are not our masters, they are our programmers.",
  "Behind every great programmer is a cat watching over them.",
  "Not all those who wander are lost - some are cats debugging.",
  "Cats and code have something in common: both are mysterious yet adorable!",
  "When solving bugs, think like a cat: patient and focused.",
  "How can you tell if a developer owns a cat? They code with one hand.",
  "Cats have 9 lives, programmers have 9 backups.",
  "A day without cats is a day without enough coding.",
  "The two most important things in life: cats and cache memory.",
  "Meow is just another way of saying 'Hello World'.",
  "Cats don't break code, they just refactor it unexpectedly.",
  "Great code is like a cat: elegant, efficient, and does exactly what it wants.",
  "The Internet exists solely for cat pictures and Stack Overflow.",
  "Cats don't cause bugs — they just expose the ones already there.",
  "A cat on your keyboard is the universe telling you to take a break.",
  "In the world of code, always follow the cat: graceful, quiet, and always landing on their feet.",
  "Every good commit needs a cat's approval (or at least their paw print).",
  "Linting? My cat already did that with her fur.",
  "Your cat isn't ignoring you — they're just garbage collecting unnecessary attention.",
  "Even cats follow DRY: Don't Repeat Yawns.",
  "Forget rubber duck debugging — try explaining to your cat.",
  "A cat's tail is like a semicolon — small, but you'll notice when it's missing.",
  "Every developer needs version control. Every cat needs nap control.",
  "Cats don't crash programs, they enhance entropy.",
  "A silent cat is either plotting... or just optimized.",
  "You can't spell 'catastrophe' without 'cat' — especially in production.",
  "The best code review is when your cat walks away — unimpressed.",
  "Cats invented sleep mode long before computers did.",
  "Cats were the original neural networks — they learn, adapt, and occasionally ignore training data.",
  "The purring sound? Just their way of backpropagating comfort.",
  "GPT? Great Purring Tabby.",
  "Your AI model hallucinates? So does your cat at 3AM.",
  "Cats invented transfer learning: from sofa to keyboard in milliseconds.",
  "A cat can teach you cybersecurity: trust nothing, scan everything, sleep with one eye open.",
  "Your password isn't safe — especially if your cat knows where you type it.",
  "Firewall? Try a cat on your router.",
  "Cats practice zero trust architecture naturally — even with their own tail.",
  "The best intrusion detection system is a cat startled by a falling USB stick.",
  "Cats don't click phishing links — unless it's a fish-shaped cursor.",
  "A purring cat is just secure background noise against audio-based attacks.",
  "For every vulnerability, there's a cat already sitting on the patch cable.",
  "Cats love CI/CD — Continuous Interruptions / Continuous Demands.",
  "Infrastructure as Code? More like Infrastructure as Catnip.",
  "Cats are stateless — unless there's food in the cache.",
  "99.99% uptime, 100% chance the cat walks on the power button.",
  "Kubernetes? More like Kubernip: orchestrating naps across all containers.",
  "Containers are like cats — isolate them, and they still find a way to cause trouble.",
  "Logs? My cat left plenty after stepping on the keyboard.",
  "Cats are natural testers — they'll find the one thing you forgot to secure.",
  "Unit tests are like cats: small, independent, and necessary for sanity.",
  "Your cat already wrote a failing test case when it slept on your keyboard.",
  "A passing test suite means the cat hasn't touched your code yet.",
  "If the test passes and your cat's tail hit Enter, review again.",
  "Test-driven development? Try Cat-driven disaster recovery.",
  "A bug not found by QA will be discovered by your cat during a live demo.",
  "Cats prefer low-level access — that's why they always sit on the motherboard.",
  "Bit-flipping? More like paw-flipping the power switch.",
  "Direct memory access? Cats do that with your attention.",
  "The cat is not grounded — that's why static fried your RAM.",
  "Your cat is a full-stack developer — they climb from backend chairs to front-end monitors.",
  "Cats know recursion: sit in the box, inside the box, that came in a bigger box.",
  "Boolean logic: the cat is either on the keyboard (1) or under the desk (0).",
  "If Schrödinger had a dev environment, he'd still be waiting for the cat to finish compiling.",
  "The cat didn't ignore you — it was busy garbage collecting your attention span.",
  "ASCII cat art is the pinnacle of computer aesthetics.",
  "Cats are multithreaded — they nap and judge you simultaneously.",
  "Cats are the ultimate UX testers — if it's not intuitive, they'll knock it over.",
  "The only responsive design your cat cares about is how fast you respond to their meow.",
  "Hover states? Try hovering a cat's paw over your trackpad.",
  "A modal window is just a box. Cats love boxes.",
  "Your layout isn't broken — your cat just enabled grid chaos mode.",
  "Dark mode exists because cats are nocturnal developers.",
  "Cats don't need CSS — they're inherently styled.",
  "Cats follow Agile: short sprints, long naps, constant feedback (via meows).",
  "Daily stand-up? My cat does that at 4AM — on my chest.",
  "Cats are master Scrum Lords: they prioritize their own backlog (treats, naps, judgment).",
  "The burndown chart only works if the cat hasn't shredded it.",
  "If your cat joins the Zoom call, they're now the product owner.",
  "Git blame? Pretty sure that commit was the cat's paw.",
  "Merge conflicts are just cats refusing to share the same chair.",
  "Clean code is like a clean litter box — rare but appreciated.",
  "Cats don't use version control — they *are* the final version.",
  "Your cat already cherry-picked the changes — and your lunch.",
  "Automate all the things — except feeding the cat. That must be manual or else.",
  "Scripts crash. Cats just act like they meant to do it.",
  "Cats love automation: one meow, food appears.",
  "Stack trace? More like scratch trace, courtesy of your cat.",
  "If a bug disappears when the cat leaves, it was probably a Schrödinger bug.",
  "Your cat is a distributed system: online everywhere, present nowhere.",
  "Cats don't timeout — they nap strategically.",
  "API rate limit? Your cat exceeds it with every demand.",
  "Latency is when your cat delays judgment just to make it sting more.",
  "A dropped connection? Probably a cat chewing the Ethernet cable again.",
  "Cats don't use relational databases — they prefer emotional ones.",
  "Your cat just ran a fuzzy search on your sandwich.",
  "Data integrity? My cat just rolled over the external drive.",
  "SQL injection? The cat did one by stepping on the keyboard.",
  "Cats prefer NoSQL: No Structure, Only Chaos & Licking."
];

/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Load a new cat image and quote
 * Fetches a random cat image from TheCatAPI and displays a new quote
 */
function loadNewCat() {
  const catImage = document.getElementById('catOfDay');
  const catQuote = document.getElementById('catQuote');
  
  // Add loading state for the image
  if (catImage) {
    // Fade out the current image
    catImage.style.opacity = '0.5';
    
    // Fetch a new random cat image with cache-busting
    const timestamp = new Date().getTime();
    catImage.src = `https://api.thecatapi.com/v1/images/search?format=src&mime_types=image/jpg&${timestamp}`;
    
    // Handle image load completion
    catImage.onload = function() {
      // Fade in the new image
      catImage.style.opacity = '1';
      
      // Add animation class and remove it after animation completes
      catImage.classList.add('meow-loaded');
      setTimeout(() => catImage.classList.remove('meow-loaded'), 1000);
    };
  }
  
  // Update the quote with animation
  if (catQuote) {
    // Get a new random quote
    catQuote.textContent = getRandomItem(catQuotes);
    
    // Animate quote change with fade effect
    catQuote.style.opacity = '0';
    setTimeout(() => {
      catQuote.style.opacity = '1';
    }, 300);
  }
}

/**
 * Initialize the Cat of the Day feature
 * Sets up event handlers and loads the initial cat
 */
export function initCatOfDay() {
  // Get related DOM elements
  const catImage = document.getElementById('catOfDay');
  const catQuote = document.getElementById('catQuote');
  const newCatBtn = document.getElementById('newCatBtn');
  
  // Only initialize if the required elements exist on the page
  if (catImage && catQuote) {
    // Load initial cat when page loads
    loadNewCat();
    
    // Allow clicking on the cat image to get a new cat
    catImage.addEventListener('click', function(e) {
      e.preventDefault();
      loadNewCat();
    });
    
    // Set up the dedicated "New Cat" button if it exists
    if (newCatBtn) {
      newCatBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loadNewCat();
      });
    }
  }
}
