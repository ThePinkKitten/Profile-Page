
/*
  Social Links Configuration
  - Defines social media platform links and icons
  - Used by social-links.js to generate the links section
  - Each entry contains name, URL and image path
*/

/**
 * Array of social media platform links
 * @typedef {Object} SocialLink
 * @property {string} name - Display name of the platform
 * @property {string} link - URL to the profile
 * @property {string} image - Path to platform icon image
 */
export const links = [ 
	{ 
		name: "Facebook", 
		link: "https://www.facebook.com/ThePinkKitten/", 
		image: "Assets/Image/SocialMedia/facebook.png", 
	},
	{ 
		name: "Github", 
		link: "https://github.com/ThePinkKitten", 
		image: "Assets/Image/SocialMedia/github.png", 
	},  
	{ 
		name: "Youtube", 
		link: "https://www.youtube.com/@thepinkcat2301", 
		image: "Assets/Image/SocialMedia/youtube.png", 
	}, 
	{ 
		name: "Twitter", 
		link: "https://twitter.com/ThePinkKitten", 
		image: "Assets/Image/SocialMedia/twitter.png", 
	},  
	{ 
		name: "Instagram", 
		link: "https://www.instagram.com/thepinkkitten/", 
		image: "Assets/Image/SocialMedia/instagram.png", 	}
	
	// Additional platforms can be added here following the same structure
];
