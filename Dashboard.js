// Dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // ĐÚNG: trùng với key lưu trong Login.html
  const token = localStorage.getItem("accessToken");

  // Nếu chưa login thì đá về trang login
  if (!token) {
    window.location.href = "../Login/Login.html";
    return;
  }

  // Lấy thông tin user
  const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const email = userData.email || "User";

  // Hiển thị tên người dùng (nếu có span)
  const userNameSpan = document.getElementById("user-name");
  if (userNameSpan) {
    userNameSpan.textContent = email;
  }

  // Xử lý logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      window.location.href = "../Login/Login.html";
    });
  }
});
