import { useUserRole } from "../../contexts/UserRoleContext";
import { useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";

export default function ProtectedAdminRoute({ children }) {
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();
  const { isAdmin, isLoadingRole } = useUserRole();

  if (!isLoaded || isLoadingRole) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
          color: "#dc3545",
        }}
      >
        {t("common.login_required")}
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
          color: "#dc3545",
          textAlign: "center",
        }}
      >
        <h2>⛔ {t("errors.access_denied")}</h2>
        <p>{t("errors.admin_required")}</p>
        <p>{t("errors.admin_only_access")}</p>
      </div>
    );
  }

  return children;
}
