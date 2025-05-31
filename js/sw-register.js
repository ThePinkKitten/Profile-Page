/**
 * Service Worker Registration 
 * Đăng ký Service Worker nếu trình duyệt hỗ trợ
 */

// Kiểm tra xem trình duyệt có hỗ trợ Service Worker không
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker đã đăng ký thành công với phạm vi: ', registration.scope);
      })
      .catch(function(error) {
        // Không gây lỗi nếu không thể đăng ký, chỉ ghi log
        console.log('Đăng ký Service Worker thất bại:', error);
      });
  });
}
