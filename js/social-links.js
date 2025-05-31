
/*
  Social Links Module
  - Handles rendering and animation of social media links
  - Uses data from links.js for configuration
*/
import { links } from "./links.js";

/**
 * Reset the animation of all social links
 * Creates a staggered entrance animation effect
 */
export function resetLinksAnimation() {
  const linkElements = document.querySelectorAll('.link');
  if (!linkElements || linkElements.length === 0) return;
  
  linkElements.forEach((link, index) => {
    // Reset animation by removing it first
    link.style.animation = 'none';
    link.style.opacity = '0';
    
    // Trigger reflow to ensure animation restart
    link.offsetHeight;
    
    // Apply staggered animation with delay based on index
    link.style.animation = `slideIn 0.3s ease forwards ${index * 0.05}s`;
  });
}

/**
 * Initialize social links from configuration
 * Renders links from the links.js configuration file
 */
export function initSocialLinks() {
  const linkContainer = document.getElementById("links");
  if (!linkContainer) return;

  /**
   * Generate HTML for a single social link
   * @param {string} name - Display name of the social platform
   * @param {string} link - URL to the social profile
   * @param {string} image - Path to the social platform icon
   * @returns {string} HTML for the social link
   */
  function addLink(name, link, image) {
    return `
      <a href="${link}" class="link" target="_blank" rel="noopener noreferrer"> 
        <img src="${image}" alt="${name} icon"/> 
        <span>${name}</span> 
        <img class="linkIcon" src="${image}" alt="${name} icon"/> 
      </a> 
    `;
  }

  let allLinks = "";
  links.forEach((ele) => {
    allLinks += addLink(ele.name, ele.link, ele.image);
  });

  linkContainer.innerHTML = allLinks;  
  // Set initial state for links - hidden with CSS order property
  const linkElements = document.querySelectorAll('.link');
  linkElements.forEach((link, index) => {
    link.style.opacity = '0';
    link.style.setProperty('--order', index + 1);
  });

  // Start animation sequence for links
  resetLinksAnimation();
}