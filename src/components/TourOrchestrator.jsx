import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import startSiteTour from "../lib/tour";

// Define tours - only for post page
const PAGE_TOURS = {
  // POST PAGE TOUR - only keep this one
  "/post": {
    name: "Trang đăng bài",
    steps: [
      {
        popover: {
          title: "📝 Trang đăng bài",
          description:
            "Chào mừng đến trang đăng bài! Đây là nơi bạn tạo bài đăng mới để bán sản phẩm. Tôi sẽ hướng dẫn từng bước!",
        },
      },
      {
        element: "input[name='image']",
        popover: {
          title: "📷 Thêm hình ảnh sản phẩm",
          description:
            "Bấm vào ô này để chọn hình ảnh sản phẩm. Hỗ trợ tối đa 10 ảnh, mỗi ảnh dưới 10MB.",
        },
      },
      {
        element: "input[name='productName']",
        popover: {
          title: "🏷️ Tên sản phẩm",
          description:
            "Nhập tên sản phẩm rõ ràng và cụ thể. Ví dụ: 'iPhone 15 Pro Max 256GB Xanh Titan' thay vì chỉ 'iPhone'.",
        },
      },
      {
        element: "input[name='productPrice']",
        popover: {
          title: "💰 Giá bán",
          description:
            "Nhập giá bán mong muốn. Ví dụ: 25000000 (25 triệu VNĐ). Giá hợp lý sẽ thu hút nhiều người mua hơn!",
        },
      },
      {
        element: "select[name='category']",
        popover: {
          title: "📂 Chọn danh mục",
          description:
            "Chọn danh mục phù hợp: Điện tử, Thời trang, Sách văn phòng phẩm... để người mua dễ tìm thấy.",
        },
      },
      {
        element: "select[name='location']",
        popover: {
          title: "📍 Chọn khu vực",
          description:
            "Chọn khu vực bán hàng để người mua trong cùng địa điểm có thể đến xem trực tiếp.",
        },
      },
      {
        element: "textarea[name='description']",
        popover: {
          title: "📋 Mô tả chi tiết",
          description:
            "Viết mô tả đầy đủ về sản phẩm: tình trạng, thông số kỹ thuật, lưu ý sử dụng...",
        },
      },
      {
        element: ".upload-post-submit-button",
        popover: {
          title: "✅ Hoàn tất đăng bài",
          description:
            "Sau khi điền đầy đủ thông tin, bấm nút này để đăng bài lên website!",
        },
      },
    ],
  },
};

// Main TourOrchestrator component
function TourOrchestrator() {
  const location = useLocation();

  useEffect(() => {
    let tourRunning = false;

    const getCurrentPageTour = () => {
      const path = location.pathname;

      // Only return tour for post page
      if (path === "/post" && PAGE_TOURS[path]) {
        return PAGE_TOURS[path];
      }

      return null;
    };

    const runCurrentPageTour = async () => {
      if (tourRunning) {
        console.log("⚠️ Tour already running, skipping...");
        return;
      }

      const currentTour = getCurrentPageTour();
      if (!currentTour) {
        console.log(`ℹ️ No tour available for page: ${location.pathname}`);
        return;
      }

      tourRunning = true;
      console.log(
        `🎯 Starting tour for: ${currentTour.name} (${location.pathname})`
      );

      try {
        // Wait a bit for page elements to load
        await new Promise((resolve) => setTimeout(resolve, 800));

        await startSiteTour(currentTour.steps, {
          animate: true,
          padding: 10,
          allowClose: true,
          closeBtnText: "Thoát",
          nextBtnText: "Tiếp theo",
          prevBtnText: "Quay lại",
          doneBtnText: "Hoàn thành",
        });

        console.log(`✅ Tour completed for: ${currentTour.name}`);
      } catch (error) {
        console.error("❌ Tour error:", error);

        // Simple fallback message
        try {
          await startSiteTour([
            {
              popover: {
                title: "Thông báo",
                description:
                  "Không thể tải hướng dẫn chi tiết. Vui lòng thử lại sau!",
              },
            },
          ]);
        } catch (fallbackError) {
          console.error("❌ Fallback tour also failed:", fallbackError);
        }
      } finally {
        tourRunning = false;
      }
    };

    // Listen for custom tour start event
    const handleTourStart = () => {
      console.log("🎬 Tour start event received");
      runCurrentPageTour();
    };

    // Add event listener
    document.addEventListener("start-fullsite-tour", handleTourStart);

    // Cleanup function
    return () => {
      document.removeEventListener("start-fullsite-tour", handleTourStart);
      tourRunning = false;
    };
  }, [location.pathname]);

  return null; // This component doesn't render anything
}

export default TourOrchestrator;
