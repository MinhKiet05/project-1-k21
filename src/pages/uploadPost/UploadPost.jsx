import "./UploadPost.css";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../hooks/useCategories";
import { useLocations } from "../../hooks/useLocations";
import { useCreatePost } from "../../hooks/useCreatePost";
import { uploadImages } from "../../utils/uploadImages";
import { useUser } from "@clerk/clerk-react";
import TourGuideButton from "../../components/TourGuideButton/TourGuideButton";

export default function UploadPost() {
  const { t } = useTranslation(["upload", "common"]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Hooks
  const { user } = useUser(); // Lấy thông tin user từ Clerk
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
  } = useLocations();
  const { createPost } = useCreatePost();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setError("");

    // Kiểm tra số lượng file (tối đa 10 ảnh)
    if (files.length > 10) {
      setError(t("errors.maxImages"));
      toast.error(t("errors.maxImages"));
      return;
    }

    // Kiểm tra từng file
    const validFiles = [];
    let totalSize = 0;

    for (let file of files) {
      // Kiểm tra định dạng file (chỉ hỗ trợ hình ảnh)
      if (!file.type.startsWith("image/")) {
        setError(t("errors.imageFormat"));
        toast.error(t("errors.imageFormat"));
        return;
      }

      totalSize += file.size;
      validFiles.push(file);
    }

    // Kiểm tra tổng kích thước (tối đa 10MB = 10 * 1024 * 1024 bytes)
    if (totalSize > 10 * 1024 * 1024) {
      setError(t("errors.maxSize"));
      toast.error(t("errors.maxSize"));
      return;
    }

    // Tạo preview cho các file hợp lệ
    const previewList = validFiles.map((file, index) => ({
      id: Date.now() + index, // Thêm ID để tracking
      file,
      url: URL.createObjectURL(file),
    }));

    // Update state and sync the hidden file input's FileList using DataTransfer
    setImages(previewList);
    try {
      const dt = new DataTransfer();
      validFiles.forEach((f) => dt.items.add(f));
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
    } catch (err) {
      // DataTransfer may not be supported in some environments; ignore if so
    }
  };

  // Hàm xóa ảnh cụ thể
  const removeImage = (imageId) => {
    const updatedImages = images.filter((img) => img.id !== imageId);
    setImages(updatedImages);

    // Sync the input's FileList so the browser file count updates
    try {
      const dt = new DataTransfer();
      updatedImages.forEach((img) => dt.items.add(img.file));
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
    } catch (err) {
      // ignore if not supported
    }
  };

  // Helpers để validate theo trường (dùng cho onBlur)
  const containsLetter = (s) => /\p{L}/u.test(s || "");
  const isValidNumber = (s) => {
    if (!s) return false;
    const normalized = s.replace(/[.,\s]/g, "");
    return /^-?\d+(\.\d+)?$/.test(normalized);
  };

  const validateField = (fieldName, value) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (fieldName === "productName") {
        if (!value || !containsLetter(value)) {
          next.productName = t("validation.productName");
        } else {
          delete next.productName;
        }
      }

      if (fieldName === "productPrice") {
        if (!value || !isValidNumber(value) || Number(value) <= 0) {
          next.productPrice = t("validation.productPrice");
        } else {
          delete next.productPrice;
        }
      }

      if (fieldName === "description") {
        if (!value || !containsLetter(value)) {
          next.description = t("validation.description");
        } else {
          delete next.description;
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setError("");

    // Kiểm tra user đăng nhập
    if (!user) {
      setError(t("errors.loginRequired"));
      toast.error(t("errors.loginRequired"));
      return;
    }

    // Validate images
    const errors = {};
    if (images.length === 0) {
      errors.images = t("validation.images");
    }

    const formData = new FormData(e.target);
    const name = (formData.get("productName") || "").toString().trim();
    const price = (formData.get("productPrice") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const categoryId = formData.get("category") || "";
    const locationId = formData.get("location") || "";

    const containsLetter = (s) => /\p{L}/u.test(s || "");
    const isValidNumber = (s) => {
      if (!s) return false;
      // Remove common formatting characters like commas and spaces
      const normalized = s.replace(/[.,\s]/g, "");
      return /^-?\d+(\.\d+)?$/.test(normalized);
    };

    if (!name || !containsLetter(name)) {
      errors.productName = t("validation.productName");
    }

    if (!price || !isValidNumber(price)) {
      errors.productPrice = t("validation.productPriceValid");
    }

    if (!description || !containsLetter(description)) {
      errors.description = t("validation.description");
    }

    if (!categoryId) {
      errors.category = t("validation.category");
    }

    if (!locationId) {
      errors.location = t("validation.location");
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // scroll to first error field
      const firstKey = Object.keys(errors)[0];
      let el = null;
      if (firstKey === "images")
        el = document.querySelector(".image-upload-section");
      else el = document.querySelector(`[name="${firstKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setIsSubmitting(true);

      // Debug: Kiểm tra user authentication

      // 1. Upload ảnh lên Supabase Storage
      const imageFiles = images.map((img) => img.file);
      const uploadResult = await uploadImages(imageFiles, "images");

      if (!uploadResult.success) {
        setError(t("errors.uploadImages") + ": " + uploadResult.error);
        toast.error(t("errors.uploadImages") + ": " + uploadResult.error);
        return;
      }

      // 2. Tạo post trong database
      const postData = {
        title: name,
        description: description,
        price: price.replace(/[.,\s]/g, ""), // Loại bỏ định dạng
        imageUrls: uploadResult.urls,
        authorId: user.id,
        categoryId: categoryId,
        locationId: locationId,
      };

      const createResult = await createPost(postData);

      if (!createResult.success) {
        setError(t("errors.createPost") + ": " + createResult.error);
        toast.error(t("errors.createPost") + ": " + createResult.error);
        return;
      }

      // 3. Thành công - reset form
      toast.success(t("success.postCreated"));
      e.target.reset();
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.files = new DataTransfer().files;
      }
    } catch (err) {
      setError(t("errors.general") + ": " + err.message);
      toast.error(t("errors.general") + ": " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-post-page">
      <TourGuideButton />
      <div className="upload-post-container">
        <h1>{t("title")}</h1>
        <form className="upload-post-form" onSubmit={handleSubmit}>
          <div className="upload-post-form-row">
            <label>
              {t("fields.images")}:<span>*</span>
            </label>
            <div className="image-upload-section">
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                multiple
                required
                onChange={handleImageChange}
              />

              {/* Hiển thị thông tin hỗ trợ */}
              <div className="upload-info">
                <small>{t("imageInfo")}</small>
              </div>

              {/* Hiển thị lỗi nếu có */}
              {error && <div className="upload-error">{error}</div>}
              {formErrors.images && (
                <div className="field-error">{formErrors.images}</div>
              )}

              {/* ✅ Preview ảnh hiển thị ở dưới */}
              {images.length > 0 && (
                <div className="image-preview-container">
                  <div className="preview-header">
                    <span>{t("imagesSelected", { count: images.length })}</span>
                  </div>
                  <div className="preview-grid">
                    {images.map((img) => (
                      <div key={img.id} className="image-preview-item">
                        <img src={img.url} alt={`preview-${img.id}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(img.id)}
                          title={t("removeImage")}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="upload-post-form-row">
            <label>
              {t("fields.productName")}:<span>*</span>
            </label>
            <div className="field-input">
              <input
                type="text"
                name="productName"
                placeholder={t("placeholders.productName")}
                required
                onBlur={(e) => validateField("productName", e.target.value)}
              />
              {formErrors.productName && (
                <div className="field-error">{formErrors.productName}</div>
              )}
            </div>
          </div>

          <div className="upload-post-form-row price-row">
            <label>
              {t("fields.price")}:<span>*</span>
            </label>
            <div className="field-input">
              <div className="price-row-wrapper">
                <input
                  type="text"
                  name="productPrice"
                  placeholder={t("placeholders.price")}
                  required
                  onBlur={(e) => validateField("productPrice", e.target.value)}
                />
                {formErrors.productPrice && (
                  <div className="field-error">{formErrors.productPrice}</div>
                )}
              </div>
            </div>
          </div>

          <div className="upload-post-form-row">
            <label>
              {t("fields.category")}:<span>*</span>
            </label>
            <select name="category" required disabled={categoriesLoading}>
              <option value="">
                {categoriesLoading
                  ? t("common.loading")
                  : categoriesError
                  ? t("errors.loadData")
                  : t("placeholders.category")}
              </option>
              {categories
                .sort((a, b) => {
                  // "Khác" luôn ở cuối
                  if (a.name.toLowerCase().includes("khác")) return 1;
                  if (b.name.toLowerCase().includes("khác")) return -1;
                  // Các danh mục khác sắp xếp theo tên
                  return a.displayName.localeCompare(b.displayName, "vi", {
                    sensitivity: "base",
                  });
                })
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.displayName}
                  </option>
                ))}
            </select>
            {categoriesError && (
              <div className="field-error">
                {t("errors.loadCategories")}: {categoriesError}
              </div>
            )}
          </div>

          <div className="upload-post-form-row">
            <label>
              {t("fields.location")}:<span>*</span>
            </label>
            <select name="location" required disabled={locationsLoading}>
              <option value="">
                {locationsLoading
                  ? t("common.loading")
                  : locationsError
                  ? t("errors.loadData")
                  : t("placeholders.location")}
              </option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.displayName}
                </option>
              ))}
            </select>
            {locationsError && (
              <div className="field-error">
                {t("errors.loadLocations")}: {locationsError}
              </div>
            )}
          </div>

          <div className="upload-post-form-row">
            <label>
              {t("fields.description")}:<span>*</span>
            </label>
            <div className="field-input">
              <textarea
                name="description"
                placeholder={t("placeholders.description")}
                required
                onBlur={(e) => validateField("description", e.target.value)}
              ></textarea>
              {formErrors.description && (
                <div className="field-error">{formErrors.description}</div>
              )}
            </div>
          </div>

          <div className="upload-post-form-row">
            <label>{t("rules.title")}:</label>
            <ul>
              <li>{t("rules.appropriate")}</li>
              <li>{t("rules.expiry")}</li>
              <li>{t("rules.extend")}</li>
            </ul>
          </div>

          <div className="upload-post-form-row-btn">
            <button
              type="submit"
              className="upload-post-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
