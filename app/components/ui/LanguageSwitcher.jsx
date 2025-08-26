"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl"; // Import useTranslations

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1]; // Assuming locale is the first segment
  const t = useTranslations("LanguageSwitcher"); // Initialize translations for this component

  const handleChange = (newLocale) => {
    const newPath = `/${newLocale}${pathname.substring(
      currentLocale.length + 1
    )}`;
    router.push(newPath);
  };

  const buttonClass = (locale) =>
    `px-4 py-2 rounded-md transition-colors duration-200 ${
      currentLocale === locale
        ? "bg-amber-500 text-black font-semibold"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
    }`;

  return (
    <div className="flex gap-2"> {/* Use flexbox for buttons */}
      <button
        onClick={() => handleChange("en")}
        className={buttonClass("en")}
      >
        {t("english")}
      </button>
      <button
        onClick={() => handleChange("ar")}
        className={buttonClass("ar")}
      >
        العربية
      </button>
    </div>
  );
}
