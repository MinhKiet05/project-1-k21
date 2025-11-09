import { useTranslation } from 'react-i18next';

// Hook để dễ dàng sử dụng translation với fallback
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  
  // Helper function để format giá tiền
  const formatPrice = (price) => {
    if (!price || price === 0) return t('common.noPrice');
    return `${price.toLocaleString('vi-VN')} ${t('common.vnd')}`;
  };

  // Helper function để format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
  };

  // Helper function để lấy status label
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return t('management.status.pending');
      case 'approved': return t('management.status.approved');
      case 'rejected': return t('management.status.rejected');
      case 'expired': return t('management.status.expired');
      case 'sold': return t('management.status.sold');
      default: return t('common.unknown');
    }
  };

  return {
    t,
    i18n,
    formatPrice,
    formatDate,
    getStatusLabel,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage
  };
};

export default useAppTranslation;