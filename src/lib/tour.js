// Lightweight helper to start the site tour from anywhere (Header, Console, tests).
// Exposes `startSiteTour` as both a default export and `window.startSiteTour` for convenience.

export default async function startSiteTour(stepsOverride = null, opts = {}) {
  try {
    const steps = stepsOverride || [
      // Centered welcome step (no element) — explains the purpose of the tour
      {
        popover: {
          title: "Chào mừng",
          description:
            'Hướng dẫn nhanh các chức năng chính trên trang. Bạn có thể bấm "Skip" để thoát bất kỳ lúc nào.',
        },
      },

      // Header / Logo
      {
        element: ".header-logo",
        popover: {
          title: "Logo",
          description: "Bấm vào logo để quay về trang chủ.",
        },
      },

      // Navigation
      {
        element: '.nav a[href="/home"]',
        popover: {
          title: "Thanh điều hướng",
          description:
            "Dùng các link này để chuyển giữa Home, Post, Management và About.",
        },
      },

      // Quick Search
      {
        element: ".header-icon-btn.search-icon-btn",
        popover: {
          title: "Tìm kiếm nhanh",
          description: "Bấm để mở thanh tìm kiếm; nhập và nhấn Enter để tìm.",
        },
      },

      // Create Post (protected action) - point to post link
      {
        element: '.nav a[href="#"]',
        popover: {
          title: "Tạo bài / Đăng bài",
          description:
            "Sử dụng mục Post để đăng nội dung mới (yêu cầu đăng nhập). Nếu bạn chưa đăng nhập, hệ thống sẽ yêu cầu đăng nhập.",
        },
      },

      // Chat
      {
        element: ".header-icon-btn .icon-btn-chat",
        popover: {
          title: "Chat",
          description: "Mở cửa sổ chat để trao đổi với người dùng khác.",
        },
      },

      // Notifications
      {
        element: ".header-icon-btn .icon-btn-bell",
        popover: {
          title: "Thông báo",
          description: "Xem thông báo mới nhất tại đây.",
        },
      },

      // Language selector
      {
        element: ".language-dropdown-container",
        popover: {
          title: "Ngôn ngữ",
          description: "Thay đổi ngôn ngữ giao diện của trang.",
        },
      },

      // User / account
      {
        element: ".header-user-display",
        popover: {
          title: "Tài khoản",
          description: "Quản lý tài khoản, avatar, và đăng xuất tại đây.",
        },
      },

      // Main content hint (centered if element not present)
      {
        popover: {
          title: "Nội dung chính",
          description:
            "Ở giữa trang là danh sách bài viết, banner và các module chính. Duyệt bài viết để xem chi tiết.",
        },
      },

      // Footer
      {
        element: ".footer-logo",
        popover: {
          title: "Footer",
          description:
            "Thông tin liên hệ, đường dẫn nhanh và copyright nằm ở đây.",
        },
      },

      // Final / done
      {
        popover: {
          title: "Xong",
          description:
            'Hoàn tất hướng dẫn. Bạn có thể bấm "Tour" để chạy lại hướng dẫn bất kỳ lúc nào.',
        },
      },
    ];

    // helper: wait for any of the selectors to appear (useful for lazy-mounted UI)
    const waitForAnySelector = (selectors, timeout = 2000) => {
      const start = Date.now();
      return new Promise((resolve) => {
        const check = () => {
          for (const s of selectors) {
            try {
              if (document.querySelector(s)) return resolve(true);
            } catch (e) {
              // ignore malformed selectors
            }
          }
          if (Date.now() - start >= timeout) return resolve(false);
          setTimeout(check, 150);
        };
        check();
      });
    };

    // Instantiate driver.js robustly across different bundle shapes
    const makeInstance = async () => {
      try {
        const DriverClass =
          window.Driver || (window.driver && window.driver.Driver) || null;
        if (DriverClass) {
          const driverInstance = new DriverClass(
            Object.assign(
              {
                animate: true,
                opacity: 0.65,
                padding: 10,
                allowClose: true,
                closeBtnText: "Skip",
                nextBtnText: "Next",
                prevBtnText: "Back",
                doneBtnText: "Done",
                // Let custom onCloseClick handle confirmation
                onDestroyStarted: () => {
                  // Don't show browser dialog, let custom logic handle it
                  return true;
                },
              },
              opts
            )
          );
          return driverInstance;
        }
        if (window.driver && window.driver.js && window.driver.js.driver)
          return window.driver.js.driver();
        if (typeof window.driver === "function") return window.driver();

        // Fallback: try importing the installed package (bundler) dynamically
        try {
          const mod = await import("driver.js");
          // mod may export a factory function 'driver', or default, or a class Driver
          const factory = mod.driver || mod.default || mod;
          if (!factory) return null;

          // If factory is a function that returns an instance when called
          if (typeof factory === "function") {
            try {
              // try calling factory as driver({...})
              const inst = factory(
                Object.assign(
                  {
                    animate: true,
                    opacity: 0.65,
                    padding: 10,
                    allowClose: true,
                    closeBtnText: "Skip",
                    nextBtnText: "Next",
                    prevBtnText: "Back",
                    doneBtnText: "Done",
                    // Let custom onCloseClick handle confirmation
                    onDestroyStarted: () => {
                      return true;
                    },
                  },
                  opts
                )
              );
              if (inst) return inst;
            } catch (e) {
              // if that fails, maybe factory is a namespace with Driver
            }
          }

          // If module exposes a Driver class
          if (factory && factory.Driver) {
            const driverInstance = new factory.Driver(
              Object.assign(
                {
                  animate: true,
                  opacity: 0.65,
                  padding: 10,
                  allowClose: true,
                  closeBtnText: "Skip",
                  nextBtnText: "Next",
                  prevBtnText: "Back",
                  doneBtnText: "Done",
                  // Let custom onCloseClick handle confirmation
                  onDestroyStarted: () => {
                    return true;
                  },
                },
                opts
              )
            );
            return driverInstance;
          }
        } catch (impErr) {
          // dynamic import failed or package not installed/available
          console.debug(
            "dynamic import(driver.js) failed or unavailable",
            impErr
          );
        }
      } catch (e) {
        // ignore and return null
        console.warn("driver.js init failed", e);
      }
      return null;
    };

    const driver = await makeInstance();
    if (!driver) {
      console.warn(
        "startSiteTour: driver.js not found on window or via import"
      );
      return null;
    }

    // Wait briefly for UI elements to mount so the tour can highlight them.
    const selectors = steps.map((st) => st.element).filter(Boolean);
    waitForAnySelector(selectors, opts.waitTimeout || 2000).then((found) => {
      if (!found)
        console.info(
          "startSiteTour: no target selectors found within timeout; tour will still attempt to start"
        );

      // If driver supports step definition APIs, use them
      try {
        // helper to call whichever start method the driver exposes (start | drive | run)
        const callStart = () => {
          if (typeof driver.start === "function") {
            console.debug("startSiteTour: using driver.start()");
            return driver.start();
          }
          if (typeof driver.drive === "function") {
            console.debug("startSiteTour: using driver.drive()");
            return driver.drive();
          }
          if (typeof driver.run === "function") {
            console.debug("startSiteTour: using driver.run()");
            return driver.run();
          }
          if (typeof driver.play === "function") {
            console.debug("startSiteTour: using driver.play()");
            return driver.play();
          }
          console.warn(
            "startSiteTour: no standard start method found on driver instance"
          );
          return null;
        };

        if (driver.defineSteps) {
          driver.defineSteps(steps);
          callStart();
        } else if (driver.setSteps) {
          driver.setSteps(steps);
          callStart();
        } else if (driver.highlight) {
          // simple fallback: sequentially highlight
          let i = 0;
          const next = () => {
            if (i >= steps.length) return;
            try {
              driver.highlight(steps[i]);
            } catch (e) {
              console.warn("driver.highlight failed for step", e);
            }
            i += 1;
            setTimeout(next, 2800);
          };
          next();
        }
      } catch (e) {
        console.error("startSiteTour: failed to start driver tour", e);
      }
    });

    return driver;
  } catch (e) {
    console.error("startSiteTour error", e);
    return null;
  }
}

// attach to window for easy console/manual invocation
try {
  window.startSiteTour = window.startSiteTour || startSiteTour;
} catch (e) {
  /* ignore in non-browser env */
}
