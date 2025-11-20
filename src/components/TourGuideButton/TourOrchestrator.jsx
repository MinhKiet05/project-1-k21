import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import startSiteTour from "../../lib/tour";

// Define tours - only for post page
const PAGE_TOURS = {
  // POST PAGE TOUR - only keep this one
  "/post": {
    name: {
      vi: "Trang đăng bài",
      en: "Create Post Page"
    },
    steps: {
      vi: [
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
      en: [
        {
          popover: {
            title: "📝 Create Post Page",
            description:
              "Welcome to the create post page! This is where you create new posts to sell your products. Let me guide you step by step!",
          },
        },
        {
          element: "input[name='image']",
          popover: {
            title: "📷 Add Product Images",
            description:
              "Click here to select product images. Support up to 10 images, each under 10MB.",
          },
        },
        {
          element: "input[name='productName']",
          popover: {
            title: "🏷️ Product Name",
            description:
              "Enter a clear and specific product name. Example: 'iPhone 15 Pro Max 256GB Blue Titanium' instead of just 'iPhone'.",
          },
        },
        {
          element: "input[name='productPrice']",
          popover: {
            title: "💰 Selling Price",
            description:
              "Enter your desired selling price. Example: 25000000 (25 million VND). Fair pricing attracts more buyers!",
          },
        },
        {
          element: "select[name='category']",
          popover: {
            title: "📂 Select Category",
            description:
              "Choose appropriate category: Electronics, Fashion, Books & Office... to help buyers find your item easily.",
          },
        },
        {
          element: "select[name='location']",
          popover: {
            title: "📍 Select Area",
            description:
              "Choose your selling area so buyers in the same location can visit and inspect the item directly.",
          },
        },
        {
          element: "textarea[name='description']",
          popover: {
            title: "📋 Detailed Description",
            description:
              "Write a comprehensive description: condition, specifications, usage notes...",
          },
        },
        {
          element: ".upload-post-submit-button",
          popover: {
            title: "✅ Complete Post",
            description:
              "After filling all information, click this button to publish your post on the website!",
          },
        },
      ]
    }
  },
};

// Dialog component for tour confirmation
function TourDialog({ isOpen, onConfirm, onCancel, tourName, language }) {
  if (!isOpen) return null;

  const messages = {
    vi: {
      title: "🎯 Bắt đầu hướng dẫn?",
      message: `Bạn có muốn xem hướng dẫn sử dụng cho "${tourName}"?`,
      confirm: "Bắt đầu",
      cancel: "Không, cảm ơn",
      description: "Hướng dẫn sẽ giúp bạn hiểu cách sử dụng trang này một cách hiệu quả nhất."
    },
    en: {
      title: "🎯 Start Tutorial?",
      message: `Would you like to see the tutorial for "${tourName}"?`,
      confirm: "Start",
      cancel: "No, thanks",
      description: "The tutorial will help you understand how to use this page most effectively."
    }
  };

  const text = messages[language] || messages.vi;

  const dialogStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    fontFamily: 'Be Vietnam Pro, sans-serif'
  };

  const contentStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
  };

  const buttonStyle = {
    padding: '10px 20px',
    margin: '0 8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  };

  const confirmButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#E59462',
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f5f5f5',
    color: '#666'
  };

  return (
    <div style={dialogStyle} onClick={onCancel}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px' }}>
          {text.title}
        </h3>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '16px', lineHeight: '1.4' }}>
          {text.message}
        </p>
        <p style={{ margin: '0 0 20px 0', color: '#999', fontSize: '14px', lineHeight: '1.4' }}>
          {text.description}
        </p>
        <div>
          <button 
            style={cancelButtonStyle}
            onClick={onCancel}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e5e5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          >
            {text.cancel}
          </button>
          <button 
            style={confirmButtonStyle}
            onClick={onConfirm}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c4774a'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#E59462'}
          >
            {text.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main TourOrchestrator component
function TourOrchestrator() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [tourRunning, setTourRunning] = useState(false);

  const runTour = async (tour) => {
    if (tourRunning) {
      console.log("⚠️ Tour already running, skipping...");
      return;
    }

    setTourRunning(true);
    console.log(`🎯 Starting tour for: ${tour.name} (${tour.path})`);

    try {
      // Wait a bit for page elements to load
      await new Promise((resolve) => setTimeout(resolve, 800));

      const currentLanguage = i18n.language || 'vi';
      
      // Custom exit confirmation dialog
      const showExitConfirmation = () => {
        return new Promise((resolve) => {
          console.log("🎯 Creating exit confirmation dialog");
          
          const exitMessages = {
            vi: {
              title: "Xác nhận thoát", 
              message: "Bạn có chắc muốn thoát tour không?",
              confirm: "Có, thoát tour",
              cancel: "Tiếp tục tour"
            },
            en: {
              title: "Confirm Exit",
              message: "Are you sure you want to exit the tour?", 
              confirm: "Yes, exit tour",
              cancel: "Continue tour"
            }
          };

          const messages = exitMessages[currentLanguage] || exitMessages.vi;

          // Create dialog elements
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483647;
            font-family: 'Be Vietnam Pro', sans-serif;
            pointer-events: auto;
          `;

          const dialog = document.createElement('div');
          dialog.style.cssText = `
            background-color: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            pointer-events: auto;
            position: relative;
          `;

          dialog.innerHTML = `
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px; user-select: none;">${messages.title}</h3>
            <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 1.4; user-select: none;">${messages.message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button id="tour-continue" style="
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                background-color: #E59462;
                color: white;
                transition: all 0.2s;
                pointer-events: auto;
                user-select: none;
                outline: none;
              ">${messages.cancel}</button>
              <button id="tour-exit" style="
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                background-color: #f5f5f5;
                color: #666;
                transition: all 0.2s;
                pointer-events: auto;
                user-select: none;
                outline: none;
              ">${messages.confirm}</button>
            </div>
          `;

          // Add event listeners
          const continueBtn = dialog.querySelector('#tour-continue');
          const exitBtn = dialog.querySelector('#tour-exit');

          const handleContinue = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔄 Continue tour clicked");
            try {
              document.body.removeChild(overlay);
            } catch (err) {
              console.warn("Failed to remove overlay:", err);
            }
            resolve(false); // Don't exit
          };

          const handleExit = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🚪 Exit tour clicked");
            try {
              document.body.removeChild(overlay);
            } catch (err) {
              console.warn("Failed to remove overlay:", err);
            }
            resolve(true); // Exit tour
          };

          continueBtn.addEventListener('click', handleContinue);
          exitBtn.addEventListener('click', handleExit);

          // Add hover effects
          continueBtn.addEventListener('mouseenter', () => {
            continueBtn.style.backgroundColor = '#c4774a';
          });
          continueBtn.addEventListener('mouseleave', () => {
            continueBtn.style.backgroundColor = '#E59462';
          });

          exitBtn.addEventListener('mouseenter', () => {
            exitBtn.style.backgroundColor = '#e5e5e5';
          });
          exitBtn.addEventListener('mouseleave', () => {
            exitBtn.style.backgroundColor = '#f5f5f5';
          });

          overlay.appendChild(dialog);
          document.body.appendChild(overlay);

          // Close on overlay click (but not dialog click)
          overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
              console.log("🖱️ Overlay clicked, continuing tour");
              try {
                document.body.removeChild(overlay);
              } catch (err) {
                console.warn("Failed to remove overlay:", err);
              }
              resolve(false); // Don't exit
            }
          });

          // Prevent dialog clicks from bubbling to overlay
          dialog.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        });
      };

      // Store driver instance for force destroy
      let driverInstance = null;

      const tourOptions = {
        animate: true,
        padding: 10,
        allowClose: true,
        closeBtnText: currentLanguage === 'en' ? "Close" : "Thoát",
        nextBtnText: currentLanguage === 'en' ? "Next" : "Tiếp theo",
        prevBtnText: currentLanguage === 'en' ? "Previous" : "Quay lại",
        doneBtnText: currentLanguage === 'en' ? "Done" : "Hoàn thành",
        onDestroyed: () => {
          console.log("✅ Tour completed - no dialog needed");
          setTourRunning(false);
        },
        onCloseClick: async () => {
          console.log("🚪 Tour close button clicked");
          
          try {
            const shouldExit = await showExitConfirmation();
            console.log("🎯 User decision:", shouldExit ? "Exit" : "Continue");
            
            if (shouldExit) {
              console.log("🔥 User confirmed exit via close button - forcing destruction");
              setTourRunning(false);
              
              // Force destroy tour
              setTimeout(() => {
                try {
                  if (driverInstance && driverInstance.destroy) {
                    driverInstance.destroy();
                  }
                  
                  // Clean up all tour elements
                  const tourElements = document.querySelectorAll(`
                    [data-driver-popover], 
                    .driver-overlay, 
                    .driver-highlighted-element,
                    .driver-popover,
                    .driver-active-element,
                    .driver-no-interaction,
                    .driver-fade
                  `);
                  tourElements.forEach(el => {
                    try {
                      el.remove();
                    } catch (e) {
                      console.warn("Could not remove element:", e);
                    }
                  });
                  
                  // Reset body classes
                  document.body.classList.remove('driver-active', 'driver-fade');
                  console.log("🗑️ Tour destroyed via close button");
                } catch (error) {
                  console.error("❌ Error in close button destroy:", error);
                }
              }, 100);
            }
            
            return shouldExit;
          } catch (error) {
            console.error("❌ Error in onCloseClick:", error);
            setTourRunning(false);
            return true; // Allow close on error
          }
        },
        // Show confirmation dialog when destroy starts
        onDestroyStarted: async () => {
          console.log("🔄 Tour destroy process started - showing confirmation");
          
          try {
            const shouldExit = await showExitConfirmation();
            console.log("🎯 User decision in destroy:", shouldExit ? "Exit" : "Continue");
            
            if (shouldExit) {
              console.log("🔥 User confirmed exit - forcing tour destruction");
              setTourRunning(false);
              
              // Force destroy tour immediately
              setTimeout(() => {
                try {
                  if (driverInstance && driverInstance.destroy) {
                    driverInstance.destroy();
                  }
                  
                  // Clean up DOM elements
                  const tourElements = document.querySelectorAll(`
                    [data-driver-popover], 
                    .driver-overlay, 
                    .driver-highlighted-element,
                    .driver-popover,
                    .driver-active-element,
                    .driver-no-interaction,
                    .driver-fade
                  `);
                  tourElements.forEach(el => {
                    try {
                      el.remove();
                    } catch (e) {
                      console.warn("Could not remove element:", e);
                    }
                  });
                  
                  // Reset body classes
                  document.body.classList.remove('driver-active', 'driver-fade');
                  console.log("🗑️ Tour forcefully destroyed");
                } catch (error) {
                  console.error("❌ Error in force destroy:", error);
                }
              }, 100);
              
              return true; // Allow destroy
            } else {
              return false; // Prevent destroy, continue tour
            }
          } catch (error) {
            console.error("❌ Error in onDestroyStarted:", error);
            setTourRunning(false);
            return true; // Allow destroy on error
          }
        }
      };

      driverInstance = await startSiteTour(tour.steps, tourOptions);
      console.log(`✅ Tour completed for: ${tour.name}`);
    } catch (error) {
      console.error("❌ Tour error:", error);

      // Simple fallback message
      try {
        const currentLanguage = i18n.language || 'vi';
        const fallbackMessage = currentLanguage === 'en' 
          ? "Cannot load detailed guide. Please try again later!"
          : "Không thể tải hướng dẫn chi tiết. Vui lòng thử lại sau!";

        await startSiteTour([
          {
            popover: {
              title: currentLanguage === 'en' ? "Notification" : "Thông báo",
              description: fallbackMessage,
            },
          },
        ]);
      } catch (fallbackError) {
        console.error("❌ Fallback tour also failed:", fallbackError);
      }
    } finally {
      setTourRunning(false);
    }
  };

  useEffect(() => {
    const getCurrentPageTour = () => {
      const path = location.pathname;
      const currentLanguage = i18n.language || 'vi';

      // Only return tour for post page
      if (path === "/post" && PAGE_TOURS[path]) {
        const tour = PAGE_TOURS[path];
        return {
          name: tour.name[currentLanguage] || tour.name.vi,
          steps: tour.steps[currentLanguage] || tour.steps.vi,
          path: path
        };
      }

      return null;
    };

    const handleTourStart = () => {
      console.log("🎬 Tour start event received");
      const tour = getCurrentPageTour();
      
      if (!tour) {
        console.log(`ℹ️ No tour available for page: ${location.pathname}`);
        return;
      }

      // Start tour directly without dialog
      runTour(tour);
    };

    // Add event listeners
    document.addEventListener("start-fullsite-tour", handleTourStart);

    // Cleanup function
    return () => {
      document.removeEventListener("start-fullsite-tour", handleTourStart);
      setTourRunning(false);
    };
  }, [location.pathname, i18n.language]);

  return null; // This component doesn't render anything
}

export default TourOrchestrator;
