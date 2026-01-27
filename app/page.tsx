"use client";
import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminAccess = () => {
    if (!adminAuthenticated) {
      setShowPasswordInput(true);
      return;
    }
    // Nếu đã authenticated thì có thể đi thẳng đến dashboard
  };

  const verifyPassword = () => {
    if (password === "admin123") { // Đổi password này trong production
      setAdminAuthenticated(true);
      setShowPasswordInput(false);
      setError("");
      setPassword("");
    } else {
      setError("Sai mật khẩu! Vui lòng thử lại.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPassword();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="border-4 border-black bg-white p-8 mb-8 shadow-[12px_12px_0_0_#000] text-center">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-4">
            🍱  Hệ thống quản lí bếp ăn thông minh
          </h1>
          <div className="h-3 w-48 bg-gradient-to-r from-pink-400 to-indigo-400 mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
            Hệ thống quản lí bếp ăn thông minh
          </p>
          <p className="text-lg text-gray-600">
            Tự động hóa quy trình lựa chọn món ăn, phân phối và quản lí bữa ăn.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border-4 border-black bg-white p-6 text-center shadow-[12px_12px_0_0_#000] ">
            <div className="text-4xl font-black mb-2">🎯</div>
            <div className="text-2xl font-black">Lựa chọn thực đơn thông minh</div>
            <p className="text-gray-600 mt-2">Học sinh chọn món ăn yêu thích</p>
          </div>
          <div className="border-4 border-black bg-white p-6 text-center shadow-[12px_12px_0_0_#000] ">
            <div className="text-4xl font-black mb-2">🤖</div>
            <div className="text-2xl font-black">Tự động phân phối</div>
            <p className="text-gray-600 mt-2">Máy phát cơm tự động theo cấu hình</p>
          </div>
          <div className="border-4 border-black bg-white p-6 text-center shadow-[12px_12px_0_0_#000] ">
            <div className="text-4xl font-black mb-2">📊</div>
            <div className="text-2xl font-black">Quản lý thông minh</div>
            <p className="text-gray-600 mt-2">Theo dõi và tối ưu nguyên liệu</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* For Students - Voting */}
          <Link
            href="/vote"
            className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 border-2 border-black flex items-center justify-center">
                <span className="text-2xl">🗳️</span>
              </div>
              <h2 className="text-2xl font-black text-black">Bỏ Phiếu</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Học sinh bỏ phiếu chọn món ăn cho bữa trưa/tối
            </p>
            <div className="flex items-center text-green-600 font-bold">
              <span>Truy cập ngay</span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          {/* For Students - Pickup */}
          <Link
            href="/students"
            className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 border-2 border-black flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-black text-black">Nhận Cơm</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Nhận phần ăn tự động từ máy phát cơm
            </p>
            <div className="flex items-center text-blue-600 font-bold">
              <span>Truy cập ngay</span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          {/* For Kitchen - Raw Materials */}
          <Link
            href="/materials"
            className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-yellow-100 border-2 border-black flex items-center justify-center">
                <span className="text-2xl">🥦</span>
              </div>
              <h2 className="text-2xl font-black text-black">Nguyên Liệu</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Xem tổng nguyên liệu cần chuẩn bị cho nhà bếp
            </p>
            <div className="flex items-center text-yellow-600 font-bold">
              <span>Truy cập ngay</span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          {/* thong ke */}
          {/* For Statistics */}
          <Link
            href="/thongke"
            className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 border-2 border-black flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-black text-black">Thống Kê</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Xem thống kê lượt vote của học sinh theo menu
            </p>
            <div className="flex items-center text-purple-600 font-bold">
              <span>Truy cập ngay</span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          {/* nha kho */}
          <Link
            href="/quanlikho"
            className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 border-2 border-black flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-black text-black">Nhà kho</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Xem thông tin nhiệt độ và độ ẩm của nhà kho
            </p>
            <div className="flex items-center text-purple-600 font-bold">
              <span>Truy cập ngay</span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        </div>

        {/* For Admin - Dashboard */}
        <div className={` gr`}>
          <div
            onClick={handleAdminAccess}
            className={`border-4 ${adminAuthenticated ? 'border-green-500' : 'border-black'} bg-white p-8 cursor-pointer hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 ${adminAuthenticated ? 'bg-green-100' : 'bg-red-100'} border-2 ${adminAuthenticated ? 'border-green-500' : 'border-black'} flex items-center justify-center`}>
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black">Quản Trị</h2>
                <div className={`text-sm font-bold ${adminAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {adminAuthenticated ? '✓ Đã xác thực' : '🔒 Yêu cầu mật khẩu'}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Quản lý học sinh, menu, và theo dõi hệ thống
            </p>
            {adminAuthenticated ? (
              <div className={` grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}>
                <Link
                  href="/admin/dashboard"
                  className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 border-2 border-black flex items-center justify-center">
                      <span className="text-2xl">👨‍🎓</span>
                    </div>
                    <h2 className="text-2xl font-black text-black">Quản lý</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Truy cập Dashboard
                  </p>
                  <div className="flex items-center text-purple-600 font-bold">
                    <span>Truy cập ngay</span>
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* For Admin - Add Student */}
                <Link
                  href="/students/add"
                  className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 border-2 border-black flex items-center justify-center">
                      <span className="text-2xl">👨‍🎓</span>
                    </div>
                    <h2 className="text-2xl font-black text-black">Thêm HS</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Thêm học sinh mới và cấu hình khẩu phần ăn
                  </p>
                  <div className="flex items-center text-purple-600 font-bold">
                    <span>Truy cập ngay</span>
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* For Admin - View Menus */}
                <Link
                  href="/menus"
                  className="block border-4 border-black bg-white p-8 hover:shadow-[12px_12px_0_0_#000] transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-pink-100 border-2 border-black flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <h2 className="text-2xl font-black text-black">Danh Sách Món</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Xem và quản lý tất cả menu có sẵn
                  </p>
                  <div className="flex items-center text-pink-600 font-bold">
                    <span>Truy cập ngay</span>
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center text-red-600 font-bold">
                <span>Nhấn để xác thực</span>
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>


        </div>

        {/* Password Modal */}
        {showPasswordInput && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur flex items-center justify-center p-4 z-50">
            <div className="border-4 border-black bg-white p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 border-2 border-black flex items-center justify-center">
                  <span className="text-xl">🔒</span>
                </div>
                <h2 className="text-2xl font-black text-black">Xác thực Admin</h2>
              </div>

              <p className="text-gray-600 mb-6">
                Vui lòng nhập mật khẩu admin để truy cập khu vực quản trị
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Nhập mật khẩu admin"
                className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
              />

              {error && (
                <div className="text-red-600 font-bold mb-4">{error}</div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={verifyPassword}
                  className="flex-1 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all border-2 border-black"
                >
                  XÁC THỰC
                </button>
                <button
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPassword("");
                    setError("");
                  }}
                  className="flex-1 py-3 bg-white text-black font-bold hover:bg-gray-100 transition-all border-2 border-black"
                >
                  HỦY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {/* <div className="mt-12 border-4 border-black bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">📞 Liên hệ</h3>
              <p className="text-gray-600">Bộ phận IT Canteen</p>
              <p className="text-gray-600">Email: it@canteen.edu</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">🕐 Giờ làm việc</h3>
              <p className="text-gray-600">Thứ 2 - Thứ 6: 7:00 - 17:00</p>
              <p className="text-gray-600">Thứ 7: 7:00 - 12:00</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">ℹ️ Thông tin hệ thống</h3>
              <p className="text-gray-600">Phiên bản: 1.0.0</p>
              <p className="text-gray-600">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300 text-center">
            <p className="text-gray-600">
              © 2025 Smart Canteen System. Tất cả các quyền được bảo lưu.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}