import "./DashboardLayout.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function DashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isUsersActive = location.pathname === "/dashboard/users";
  const isPostsActive = location.pathname === "/dashboard/posts";

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-title">
          <h2>{t("dashboard.title")}</h2>
        </div>

        <div className="sidebar-menu">
          <div
            className={`menu-item ${isUsersActive ? "active" : ""}`}
            onClick={() => navigate("/dashboard/users")}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>{t("dashboard.users")}</span>
          </div>
          <div
            className={`menu-item ${isPostsActive ? "active" : ""}`}
            onClick={() => navigate("/dashboard/posts")}
          >
            <FontAwesomeIcon icon={faFileAlt} />
            <span>{t("dashboard.posts")}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
