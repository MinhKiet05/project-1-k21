import "./Loading.css";
import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation(['common']);
  
  return (
    <div className="loading-container">
      <div className="loading-spinner">
      </div>
      <p>{t('loading')}</p>
    </div>
  );
}