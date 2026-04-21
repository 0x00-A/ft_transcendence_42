import { useTranslation } from "react-i18next";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();


  return (
    <footer className="h-12 pb-2  w-full mt-4">
      <div className="text-center text-lg text-gray-400">
        © {currentYear} {t('footer')}
      </div>
    </footer>
  );
};

export default Footer;