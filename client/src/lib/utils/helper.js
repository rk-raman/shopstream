import { Check } from "react-feather";
// import min from "lodash/min";
// import max from "lodash/min";
export const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const isObject = (obj) => {
  return obj !== undefined && obj !== null && obj.constructor == Object;
};

export const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
export const getFileExtension = (filename) => {
  return filename.split(".").pop();
};

export const GetYearsOptions = () => {
  const curr_year = new Date().getFullYear();
  return Array.from(new Array(200), (v, i) => (
    <option key={curr_year - i} value={curr_year - i}>
      {curr_year - i}
    </option>
  ));
};

export const GetRattingsOptions = () => {
  return Array.from(new Array(5), (v, i) => (
    <option key={i + 1} value={i + 1}>
      {i + 1}
    </option>
  ));
};

export function numberWithCommas(number) {
  //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  //return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
  return number?.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatValueInCroresAndLakhs(value) {
  if (value >= 10000000) {
    const crore = Math.floor((value / 10000000) * 100) / 100;
    return crore + " cr";
  } else if (value >= 100000) {
    const lakh = Math.floor((value / 100000) * 100) / 100;

    return lakh + " lakh";
  } else if (value >= 1000) {
    const thousand = Math.floor((value / 1000) * 100) / 100;
    return thousand + "k";
  } else {
    return value?.toString();
  }
}

export const getCurrencySymbol = (currency_code = "INR") => {
  return currency_symbols[currency_code];
};

export const formatPriceWithCurrency = (price, currencyCode = "INR") => {
  const currency = getCurrencySymbol(currencyCode);
  return `${currency} ${formatValueInCroresAndLakhs(price)}`;
};

export const formatPriceWithoutCurrency = (price) => {
  return `${formatValueInCroresAndLakhs(price)}`;
};

export const formatPriceWithCommas = (price, currencyCode = "INR") => {
  const currency = getCurrencySymbol(currencyCode);
  return `${currency} ${numberWithCommas(price)}`;
};

export const getKeyValueData = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        _id: el.value,
        name: el.label || el.key,
      };
    })
  );
};

export const getLabelValueData = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        ...el,
        value: el._id || el.id,
        label: el.name,
      };
    })
  );
};

export const getKeywordOptions = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        value: el.keyword_id,
        label: el.keyword_name,
        name: `in ${el.cat_name}`,
      };
    })
  );
};

export const getLabelValueOptions = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        ...el,
        value: el.id || el._id || el.isoCode,
        label: el.name,
      };
    })
  );
};

export const getCountryOptions = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        value: el.isoCode,
        label: el.name,
      };
    })
  );
};
export const getCountryOptionsWithPhoneCode = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        value: el.phoneCode,
        label: el.name,
      };
    })
  );
};

export const getCityOptions = (data) => {
  return (
    data &&
    data.length &&
    data.map((el) => {
      return {
        ...el,
        value: el.name,
        label: el.name,
      };
    })
  );
};

const currency_symbols = {
  INR: "₹",
};

export const getGoogleRattingOptions = () => {
  let googleRattingOptions = [];
  for (let i = 3.5; i <= 5; i += 0.1) {
    let obj = {
      label: i.toFixed(1),
      value: i.toFixed(1),
    };
    googleRattingOptions.push(obj);
  }

  return googleRattingOptions;
};

export const getRoiOptions = () => {
  let options = [];
  for (let i = 6; i <= 42; i += 3) {
    const start = i;
    const end = i + 3;
    let obj = {
      label: `${start}-${end} Months`,
      value: `${start}-${end}`,
    };
    options.push(obj);
  }

  return options;
};

export function createSlug(word, location) {
  const slug = word
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/,/g, "/");
  const finalSlug = `/franchise/${slug}-franchise`;
  return finalSlug;
}

export function createBrandDetailsPageSlug(brandName, id) {
  const slug = brandName
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/&/g, "and")
    ?.replace(/,/g, "/");
  const finalSlug = `/brand/${slug}-franchise?id=${id}`;
  return finalSlug;
}

export function createBlogDetailsPageSlug(blog) {
  const slug = blog.title
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "-") // Replace spaces with hyphens
    ?.replace(/&/g, "and") // Replace '&' with 'and'
    ?.replace(/,/g, "-") // Replace ',' with hyphens
    ?.replace(/\?/g, "") // Remove question marks
    ?.replace(/\//g, "") // Replace '/' with an empty space
    ?.replace(/\.+$/, ""); // Remove trailing periods

  const blogName = blog?.catinfo?.name
    ? blog?.catinfo?.name
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : "unnamed-blog";

  const finalSlug = `/content/${blogName}/${slug}-franchise?id=${blog._id}`;
  // console.log({ blogName, finalSlug });
  return finalSlug;
}

export function createBlogListingPageSlug(name) {
  const slug = name
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/&/g, "and")
    ?.replace(/,/g, "/");
  const finalSlug = `/content/${slug}`;
  return finalSlug;
}

export const createSlugFromWord = (word) => {
  const slug = word
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/,/g, "/");
  return slug;
};

//input "case-study" // output "Case Study"
export function convertKebabToTitle(str) {
  if (!str || typeof str !== "string") {
    return ""; // Return an empty string if str is not valid
  }

  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" ");
}

export const formatFaqData = (faqData) => {
  return faqData.map((item, idx) => {
    return {
      key: idx + 1,
      label: item.question,
      children: <div dangerouslySetInnerHTML={{ __html: item.answer }} />,
    };
  });
};

export function removeHtmlTags(str) {
  if (str === null || str === "") return false;
  else str = str?.toString();

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return str?.replace(/(<([^>]+)>)/gi, "");
}

export const isFnbCategory = (businesscategoryname) => {
  return !!businesscategoryname.find((el) => el.name === "Food & Beverages");
};

export function areAllObjectValueEmpty(obj) {
  return Object.values(obj).every(
    (value) => value === null || value === undefined || value === ""
  );
}

export function capitalizeFirstLetter(str) {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const scrollToTop = () => {
  // Scroll to the top of the page
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export function groupCityByZone(cities) {
  if (!cities || cities.length === 0) {
    return {};
  }
  const zoneObject = {};
  cities.forEach((city) => {
    const zoneName = city?.zone?.name || "City";
    if (!zoneObject[zoneName]) {
      zoneObject[zoneName] = [];
    }
    zoneObject[zoneName].push(city?.name);
  });

  return zoneObject;
}

export const filterNonZeroValues = (array) => {
  return array.filter((item) => item.value !== 0);
};

export function formatTotalInvestment(number) {
  let totalInvestment = parseInt(number);
  if (totalInvestment >= 10000000) {
    // If totalInvestment is 10 million or more, format as crore
    totalInvestment = (totalInvestment / 10000000).toFixed() + " CR";
  } else if (totalInvestment >= 100000) {
    // If totalInvestment is 100,000 or more, format as lakh
    totalInvestment = (totalInvestment / 100000).toFixed() + " L";
  } else {
    // Otherwise, keep the original value
    totalInvestment = number;
  }
  return totalInvestment;
}

export function findMinMaxValues(arr, property) {
  const parsedArr = arr.map((item) => item[property]).flat();

  // const minValue = min(parsedArr);
  // const maxValue = max(parsedArr);
  const minValue = parsedArr?.[0] || 0;
  const maxValue = parsedArr?.[1] || 0;
  return { min: minValue, max: maxValue };
}

export function convertToLowerCaseWithUnderscore(arr) {
  if (!Array.isArray(arr)) {
    return [];
    //throw new Error('Input is not an array');
  }
  return arr.map((item) => {
    if (!item || typeof item !== "object" || !item.name) {
      throw new Error("Invalid object in the array");
    }
    return item.name.toLowerCase().replace(/ /g, "_");
  });
}

export function convertUnderscoreToTitleCase(inputString) {
  if (typeof inputString !== "string") {
    throw new Error("Input must be a string");
  }
  // Function logic remains the same
  return inputString
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const generateMonthOptions = () => {
  const options = [];
  for (let i = 1; i <= 4; i++) {
    let label;
    if (i === 3) {
      label = `${i} months`;
    } else if (i === 4) {
      label = `3+ months`;
    } else {
      label = `${i} month${i > 1 ? "s" : ""}`;
    }
    options.push({ value: i, label });
  }
  return options;
};

export const generateYearOptions = () => {
  const options = [];
  for (let i = 0; i <= 10; i++) {
    const label = i === 10 ? `${i}+ years` : `${i} year${i !== 1 ? "s" : ""}`;
    options.push({ value: i, label });
  }
  return options;
};

export function getUsername(user) {
  if (!user) return null;
  const { firstName, lastName } = user;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return null;
  }
}

export function findMinMaxValuesObj(arr, property) {
  const parsedArr = parseInt(arr[property]);
  return parsedArr;
}

export const getImageUrl = (path) => {
  return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${path}`;
};

//Subscriptions plan table
export const renderFeatureValue = (plan, feature) => {
  const properties = plan.properties;
  let currentProp = undefined;
  for (let key in properties) {
    const prop = properties[key];
    if (feature.display_name === prop.display_name) {
      currentProp = prop;
    }
  }

  if (currentProp.display_name == "Post Your Requirement") {
    return `${currentProp.value} times`;
  }
  if (currentProp.display_name == "Direct Contact Number") {
    return `${currentProp.value} Brands`;
  }
  if (currentProp.value === "No") {
    return "-";
  }
  if (currentProp.value === "Yes") {
    return <Check />;
  }

  return currentProp.value;
};

export function getValueInLakhOrCrore(number, unit) {
  let multiplier = 1;

  // Determine the multiplier based on the unit
  if (unit.toLowerCase() === "lakh") {
    multiplier = 100000;
  } else if (unit.toLowerCase() === "crore") {
    multiplier = 10000000;
  } else {
    // If the unit is neither lakh nor crore, return null or handle the error accordingly
    return null;
  }

  // Calculate the value and return it
  return number * multiplier;
}

export const durationOptions = {
  "1m": "1 month",
  "2m": "2 months",
  "3m": "3 months",
  "4m": "4 months",
  "5m": "5 months",
  "6m": "6 months",
  "7m": "7 months",
  "8m": "8 months",
  "9m": "9 months",
  "10m": "10 months",
  "11m": "11 months",
  "12m": "12 months",
};

export const getBrandRoyalityValue = (royalty) => {
  if (!royalty?.value) return null;
  if (royalty?.value === 0) return null;
  if (royalty?.value > 0 && royalty.type === "percent") {
    return `${royalty.value}%`;
  }
  if (royalty?.value > 0 && royalty.type === "rs") {
    return formatPriceWithCurrency(royalty.value);
  }
  return null;
};

export function convertNumberToWords(num) {
  if (num >= 10000000) {
    let croreValue = num / 10000000;
    let roundedCroreValue = Math.round(croreValue * 10) / 10; // round to 1 decimal place
    return { value: roundedCroreValue, type: "crore" };
  } else if (num >= 100000) {
    let lakhValue = num / 100000;
    let roundedLakhValue = Math.round(lakhValue * 10) / 10; // round to 1 decimal place
    return { value: roundedLakhValue, type: "lakh" };
  } else {
    return { value: num, type: "lakh" };
  }
}

export const isProductionEnv = process.env.NEXT_PUBLIC_APP_ENV === "production";
