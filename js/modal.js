/*
  Modal
  - Initialize modal functionality
*/

// Function to initialize modal
export function initModal() {
  const openModal = document.getElementById("openModal");
  const modal = document.getElementById("myModal");
  
  if (!openModal || !modal) return;

  openModal.onclick = function () {
    modal.style.display = "block";
  }

  window.addEventListener('click', function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
} 