
/*
  Social Links
  - Initialize social links functionality
*/
import { links } from "./links.js";

// Function to reset links animation
export function resetLinksAnimation() {
  const links = document.querySelectorAll('.link');
  if (!links || links.length === 0) return;
  
  links.forEach((link, index) => {
    link.style.animation = 'none';
    link.style.opacity = '0';
    link.offsetHeight;
    link.style.animation = `slideIn 0.3s ease forwards ${index * 0.05}s`;
  });
}

// Function to initialize social links ( depend on how many links in links.js )
export function initSocialLinks() {
  const linkContainer = document.getElementById("links");
  if (!linkContainer) return;

  function addLink(name, link, image) {
    return `
      <a href="${link}" class="link" target="_blank"> 
        <img src="${image}" alt=""/> 
        <span>${name}</span> 
        <img class="linkIcon" src="${image}" alt=""/> 
      </a> 
    `;
  }

  let allLinks = "";
  links.forEach((ele) => {
    allLinks += addLink(ele.name, ele.link, ele.image);
  });

  linkContainer.innerHTML = allLinks;
  
  const linkElements = document.querySelectorAll('.link');
  linkElements.forEach((link, index) => {
    link.style.opacity = '0';
    link.style.setProperty('--order', index + 1);
  });

  // Reset links animation
  resetLinksAnimation();
} 