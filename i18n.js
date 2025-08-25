import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  try {
    const messages = (await import(`./messages/${locale}.json`)).default;

    return {
      locale, // <- must return the current locale
      messages, // <- your locale messages
    };
  } catch (e) {
    console.warn(
      `Missing messages for locale "${locale}", falling back to en.json`
    );

    const messages = (await import("./messages/en.json")).default;

    return {
      locale: "en", // fallback locale
      messages,
    };
  }
});
