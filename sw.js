/**
 * Service Worker
 * Cải thiện hiệu suất và cho phép sử dụng offline
 */

// Tên của cache
const CACHE_NAME = 'pink-cat-profile-cache-v2';

// Danh sách các tài nguyên cần cache
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/animations.css',  '/css/shared-components.css',
  '/css/home.css',
  '/css/content-containers.css',
  '/css/responsive.css',
  '/css/cat-styles.css',
  '/js/main.js',
  '/js/avatar.js',
  '/js/sidebar.js',
  '/js/modal.js',
  '/js/optimize-images.js',
  '/js/persistent-audio.js',
  '/js/typing.js',
  '/js/social-links.js',
  '/Assets/Image/Background/background.gif',
  '/Assets/Image/Avatar/avatar2.png',
  '/Assets/Image/Avatar/favicon.png'
];

// Sự kiện install - thực hiện khi Service Worker được cài đặt lần đầu
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mở cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache lỗi:', err);
      })
  );
});

// Sự kiện fetch - xử lý các yêu cầu tài nguyên
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Trả về tài nguyên từ cache nếu có
        if (response) {
          return response;
        }
        
        // Nếu không có trong cache, lấy từ mạng
        return fetch(event.request).then(
          response => {
            // Kiểm tra nếu nhận được phản hồi hợp lệ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Sao chép phản hồi vì body chỉ có thể sử dụng một lần
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Chỉ cache các yêu cầu GET
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
      .catch(error => {
        // Có thể thêm xử lý trường hợp offline ở đây
        console.log('Fetch lỗi:', error);
      })
  );
});

// Sự kiện activate - dọn dẹp cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
