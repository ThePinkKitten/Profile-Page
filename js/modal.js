/*
  Modal Component
  - Handles modal dialog functionality
  - Controls opening and closing of modal windows
  - Implements click-outside-to-close behavior
*/

/**
 * Initialize modal functionality
 * Sets up event handlers for modal dialog
 */
export function initModal() {
  const openModal = document.getElementById("openModal");
  const modal = document.getElementById("myModal");
  
  // Early return if elements don't exist
  if (!openModal || !modal) return;

  // Open modal when trigger is clicked
  openModal.onclick = function () {
    modal.style.display = "block";
  }

  // Close modal when clicking outside content area
  window.addEventListener('click', function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}