const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const cleanText = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const isValidEmail = (value) => {
  const email = cleanText(value);
  return email.length <= 254 && emailRegex.test(email);
};

const isValidName = (value, minimum, maximum) => {
  const name = cleanText(value);
  return name.length >= minimum && name.length <= maximum;
};

const isValidPassword = (value) => {
  return (
    typeof value === "string" && value.length >= 8 && value.length <= 128
  );
};

const isValidUrl = (value) => {
  const url = cleanText(value);
  return url.length <= 500 && /^https?:\/\/\S+$/i.test(url);
};

module.exports = {
  cleanText,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidUrl,
};
