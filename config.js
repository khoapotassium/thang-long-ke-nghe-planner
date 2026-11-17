// Cấu hình — chỉ cần sửa file này
window.APP_CONFIG = {
  // GoatCounter (đo lường ẩn danh, không cookie, miễn phí cho dự án phi thương mại).
  // Đăng ký tại https://www.goatcounter.com rồi điền mã site, ví dụ "tlkn-planner" (để trống = tắt)
  goatcounterCode: "khoa",

  // Địa chỉ Cloudflare Worker nhận góp ý, ví dụ "https://tlkn-feedback.tenban.workers.dev/feedback"
  // Để trống = ô góp ý sẽ hướng người dùng sang bình luận trên Threads
  feedbackEndpoint: "https://tlkn-feedback.khoapotassium.workers.dev/feedback",

  // Link bài Threads của bạn (để người dùng bình luận góp ý)
  threadsUrl: "",

  // Thông tin liên hệ hiển thị ở trang Quyền riêng tư (email hoặc trang Threads của bạn)
  contact: "vietkhoa.dvk@gmail.com"
};
