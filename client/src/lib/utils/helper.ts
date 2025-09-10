import { Check } from "react-feather";
import { ReactNode } from "react";

// Type definitions
interface KeyValueData {
  _id: string | number;
  name: string;
}

interface LabelValueData {
  value: string | number;
  label: string;
  [key: string]: any;
}

interface KeywordOption {
  value: string | number;
  label: string;
  name: string;
}

interface CountryOption {
  value: string;
  label: string;
}

interface CityOption {
  value: string;
  label: string;
  name: string;
}

interface GoogleRatingOption {
  label: string;
  value: string;
}

interface RoiOption {
  label: string;
  value: string;
}

interface Blog {
  _id: string;
  title: string;
  catinfo?: {
    name: string;
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FormattedFaqItem {
  key: number;
  label: string;
  children: ReactNode;
}

interface BusinessCategory {
  name: string;
}

interface City {
  name: string;
  zone?: {
    name: string;
  };
}

interface ZoneObject {
  [zoneName: string]: string[];
}

interface ArrayItem {
  value: number;
}

interface MinMaxResult {
  min: number;
  max: number;
}

interface ConvertibleItem {
  name: string;
}

interface User {
  firstName?: string;
  lastName?: string;
}

interface Plan {
  properties: {
    [key: string]: PlanProperty;
  };
}

interface PlanProperty {
  display_name: string;
  value: string | number;
}

interface Feature {
  display_name: string;
}

interface Royalty {
  value: number;
  type: "percent" | "rs";
}

interface ConversionResult {
  value: number;
  type: "crore" | "lakh";
}

// Currency symbols mapping
const currency_symbols: Record<string, string> = {
  INR: "₹",
};

// Duration options mapping
export const durationOptions: Record<string, string> = {
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

// Utility functions
export const isEmpty = (value: any): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const isObject = (obj: any): obj is object => {
  return obj !== undefined && obj !== null && obj.constructor === Object;
};

export const isJson = (str: string): boolean => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop() || "";
};

export function numberWithCommas(number?: number): string {
  return number?.toLocaleString("en-US", { maximumFractionDigits: 2 }) || "0";
}

export function formatValueInCroresAndLakhs(value: number): string {
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
    return value?.toString() || "0";
  }
}

export const getCurrencySymbol = (currency_code: string = "INR"): string => {
  return currency_symbols[currency_code] || "₹";
};

export const formatPriceWithCurrency = (
  price: number,
  currencyCode: string = "INR"
): string => {
  const currency = getCurrencySymbol(currencyCode);
  return `${currency} ${formatValueInCroresAndLakhs(price)}`;
};

export const formatPriceWithoutCurrency = (price: number): string => {
  return `${formatValueInCroresAndLakhs(price)}`;
};

export const formatPriceWithCommas = (
  price: number,
  currencyCode: string = "INR"
): string => {
  const currency = getCurrencySymbol(currencyCode);
  return `${currency} ${numberWithCommas(price)}`;
};

export const getKeyValueData = (data?: any[]): KeyValueData[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    _id: el.value,
    name: el.label || el.key,
  }));
};

export const getLabelValueData = (
  data?: any[]
): LabelValueData[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    ...el,
    value: el._id || el.id,
    label: el.name,
  }));
};

export const getKeywordOptions = (
  data?: any[]
): KeywordOption[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    value: el.keyword_id,
    label: el.keyword_name,
    name: `in ${el.cat_name}`,
  }));
};

export const getLabelValueOptions = (
  data: any[]
): LabelValueData[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    ...el,
    value: el.id || el._id || el.isoCode,
    label: el.name,
  }));
};
export const getCountryOptions = (
  data?: any[]
): CountryOption[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    value: el.isoCode,
    label: el.name,
  }));
};

export const getCountryOptionsWithPhoneCode = (
  data?: any[]
): CountryOption[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    value: el.phoneCode,
    label: el.name,
  }));
};

export const getCityOptions = (data?: any[]): CityOption[] | undefined => {
  if (!data || data.length === 0) return undefined;

  return data.map((el) => ({
    ...el,
    value: el.name,
    label: el.name,
  }));
};

export const getGoogleRattingOptions = (): GoogleRatingOption[] => {
  const googleRattingOptions: GoogleRatingOption[] = [];
  for (let i = 3.5; i <= 5; i += 0.1) {
    const obj: GoogleRatingOption = {
      label: i.toFixed(1),
      value: i.toFixed(1),
    };
    googleRattingOptions.push(obj);
  }
  return googleRattingOptions;
};

export const getRoiOptions = (): RoiOption[] => {
  const options: RoiOption[] = [];
  for (let i = 6; i <= 42; i += 3) {
    const start = i;
    const end = i + 3;
    const obj: RoiOption = {
      label: `${start}-${end} Months`,
      value: `${start}-${end}`,
    };
    options.push(obj);
  }
  return options;
};

export function createSlug(word: string, location?: string): string {
  const slug = word
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/,/g, "/");
  const finalSlug = `/franchise/${slug}-franchise`;
  return finalSlug;
}

export function createBrandDetailsPageSlug(
  brandName: string,
  id: string | number
): string {
  const slug = brandName
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/&/g, "and")
    ?.replace(/,/g, "/");
  const finalSlug = `/brand/${slug}-franchise?id=${id}`;
  return finalSlug;
}

export function createBlogDetailsPageSlug(blog: Blog): string {
  const slug = blog.title
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/&/g, "and")
    ?.replace(/,/g, "-")
    ?.replace(/\?/g, "")
    ?.replace(/\//g, "")
    ?.replace(/\.+$/, "");

  const blogName = blog?.catinfo?.name
    ? blog?.catinfo?.name
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : "unnamed-blog";

  const finalSlug = `/content/${blogName}/${slug}-franchise?id=${blog._id}`;
  return finalSlug;
}

export function createBlogListingPageSlug(name: string): string {
  const slug = name
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/&/g, "and")
    ?.replace(/,/g, "/");
  const finalSlug = `/content/${slug}`;
  return finalSlug;
}

export const createSlugFromWord = (word: string): string => {
  const slug = word
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/,/g, "/");
  return slug;
};

export function convertKebabToTitle(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function removeHtmlTags(str: string): string | false {
  if (str === null || str === "") return false;
  else str = str?.toString();

  return str?.replace(/(<([^>]+)>)/gi, "") || "";
}

export const isFnbCategory = (
  businesscategoryname: BusinessCategory[]
): boolean => {
  return !!businesscategoryname.find((el) => el.name === "Food & Beverages");
};

export function areAllObjectValueEmpty(obj: Record<string, any>): boolean {
  return Object.values(obj).every(
    (value) => value === null || value === undefined || value === ""
  );
}

export function capitalizeFirstLetter(str: string): string {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const scrollToTop = (): void => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export function groupCityByZone(cities: City[]): ZoneObject {
  if (!cities || cities.length === 0) {
    return {};
  }
  const zoneObject: ZoneObject = {};
  cities.forEach((city) => {
    const zoneName = city?.zone?.name || "City";
    if (!zoneObject[zoneName]) {
      zoneObject[zoneName] = [];
    }
    zoneObject[zoneName].push(city?.name);
  });

  return zoneObject;
}

export const filterNonZeroValues = (array: ArrayItem[]): ArrayItem[] => {
  return array.filter((item) => item.value !== 0);
};

export function formatTotalInvestment(number: number): string {
  let totalInvestment = parseInt(number.toString());
  if (totalInvestment >= 10000000) {
    totalInvestment = Math.round(totalInvestment / 10000000);
    return totalInvestment + " CR";
  } else if (totalInvestment >= 100000) {
    totalInvestment = Math.round(totalInvestment / 100000);
    return totalInvestment + " L";
  } else {
    return number.toString();
  }
}

export function findMinMaxValues(arr: any[], property: string): MinMaxResult {
  const parsedArr = arr.map((item) => item[property]).flat();

  const minValue = parsedArr?.[0] || 0;
  const maxValue = parsedArr?.[1] || 0;
  return { min: minValue, max: maxValue };
}

export function convertToLowerCaseWithUnderscore(
  arr: ConvertibleItem[]
): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.map((item) => {
    if (!item || typeof item !== "object" || !item.name) {
      throw new Error("Invalid object in the array");
    }
    return item.name.toLowerCase().replace(/ /g, "_");
  });
}

export function convertUnderscoreToTitleCase(inputString: string): string {
  if (typeof inputString !== "string") {
    throw new Error("Input must be a string");
  }
  return inputString
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const generateMonthOptions = (): { value: number; label: string }[] => {
  const options: { value: number; label: string }[] = [];
  for (let i = 1; i <= 4; i++) {
    let label: string;
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

export const generateYearOptions = (): { value: number; label: string }[] => {
  const options: { value: number; label: string }[] = [];
  for (let i = 0; i <= 10; i++) {
    const label = i === 10 ? `${i}+ years` : `${i} year${i !== 1 ? "s" : ""}`;
    options.push({ value: i, label });
  }
  return options;
};

export function getUsername(user?: User): string | null {
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

export function findMinMaxValuesObj(arr: any, property: string): number {
  const parsedArr = parseInt(arr[property]);
  return parsedArr;
}

export const getImageUrl = (path: string): string => {
  return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${path}`;
};

export const renderFeatureValue = (
  plan: Plan,
  feature: Feature
): string | ReactNode => {
  const properties = plan.properties;
  let currentProp: PlanProperty | undefined = undefined;
  for (let key in properties) {
    const prop = properties[key];
    if (feature.display_name === prop.display_name) {
      currentProp = prop;
    }
  }

  if (!currentProp) return "-";

  if (currentProp.display_name === "Post Your Requirement") {
    return `${currentProp.value} times`;
  }
  if (currentProp.display_name === "Direct Contact Number") {
    return `${currentProp.value} Brands`;
  }
  if (currentProp.value === "No") {
    return "-";
  }
  if (currentProp.value === "Yes") {
    return <Check />;
  }

  return currentProp.value.toString();
};

export function getValueInLakhOrCrore(
  number: number,
  unit: string
): number | null {
  let multiplier = 1;

  if (unit.toLowerCase() === "lakh") {
    multiplier = 100000;
  } else if (unit.toLowerCase() === "crore") {
    multiplier = 10000000;
  } else {
    return null;
  }

  return number * multiplier;
}

export const getBrandRoyalityValue = (royalty?: Royalty): string | null => {
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

export function convertNumberToWords(num: number): ConversionResult {
  if (num >= 10000000) {
    const croreValue = num / 10000000;
    const roundedCroreValue = Math.round(croreValue * 10) / 10;
    return { value: roundedCroreValue, type: "crore" };
  } else if (num >= 100000) {
    const lakhValue = num / 100000;
    const roundedLakhValue = Math.round(lakhValue * 10) / 10;
    return { value: roundedLakhValue, type: "lakh" };
  } else {
    return { value: num, type: "lakh" };
  }
}

export const isProductionEnv: boolean =
  process.env.NEXT_PUBLIC_APP_ENV === "production";
