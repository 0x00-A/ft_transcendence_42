export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const formatDate = (dateString: Date, locale: string = 'en') => {
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};