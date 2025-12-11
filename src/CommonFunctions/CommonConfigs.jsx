export function arraysAreEqualIgnoreCase(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  const lowerArr1 = arr1.map(value => value.toLowerCase()).sort();
  const lowerArr2 = arr2.map(value => value.toLowerCase()).sort();

  for (let i = 0; i < lowerArr1.length; i++) {
    if (lowerArr1[i] !== lowerArr2[i]) return false;
  }
  return true;
}

export function extractSubdomainAndDomain() {
  const hostname = window.location.hostname; // Get the hostname part

  const parts = hostname.split(".");

  if (parts.length < 2) {
    return { siteUrl: hostname, subdomain: null, domain: hostname }; // In case there is no subdomain
  }

  const domain = parts.slice(-2).join("."); // Join the last two parts to get the domain
  const subdomain = parts.slice(0, -2).join("."); // Join the rest to get the subdomain

  // Construct the full site URL
  const siteUrl = subdomain ? `${subdomain}.${domain}` : domain;

  return { siteUrl, subdomain: subdomain || null, domain };
}

export const calculateTierLimit = tier => {
  switch (tier) {
    case "tier_0":
      return 250;
    case "tier_1":
      return 1_000;
    case "tier_2":
      return 10_000;
    case "tier_3":
      return 1_00_000;
    case "tier_4":
      return "Unlimited";
  }
};

export const replaceSpecialCharsWithHtml = text => {
  // Replace *text* with <strong>text</strong>
  text = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

  // Replace _text_ with <em>text</em>
  text = text.replace(/_(.*?)_/g, "<em>$1</em>");

  // Handle nested cases
  text = text.replace(/\*_(.*?)_\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/_\*(.*?)\*_/g, "<em><strong>$1</strong></em>");

  // Replace newlines with <br>
  text = text.replace(/\n/g, "<br>");
  return text;
};

export const capitalizeFirstLetter = str => {
  if (typeof str !== "string" || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  let percentage = (value / total) * 100;
  percentage = Math.round(percentage * 10) / 10;

  if (percentage < 0.1) {
    percentage = 0.1;
  }

  return percentage;
}

export function convertToDateString(dateString) {
  const [date, time, period] = dateString.split(" ");
  const [day, month, year] = date.split("/");
  const [hour, minute] = time.split(":");

  let hours = parseInt(hour, 10);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const formattedDate = new Date(Date.UTC(year, month - 1, day, hours, minute));

  return formattedDate.toISOString();
}
