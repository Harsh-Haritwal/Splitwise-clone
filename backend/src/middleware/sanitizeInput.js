const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const cleanObject = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      cleanObject[key] = sanitizeValue(value[key]);
    }
    return cleanObject;
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};

module.exports = sanitizeInput;
