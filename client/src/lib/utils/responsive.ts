import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

// Type definitions for device types
type DeviceType =
  | "mobile"
  | "tablet"
  | "console"
  | "smarttv"
  | "wearable"
  | "embedded"
  | undefined;

/**
 * Server-side function to get the device type from user agent
 * @returns The device type or undefined for desktop
 * @throws Error if called on client-side
 */
const getDeviceType = (): DeviceType => {
  if (typeof process === "undefined") {
    throw new Error(
      "[Server method] you are importing a server-only module outside of server"
    );
  }

  const { get } = headers();
  const ua: string | null = get("user-agent");

  const device = new UAParser(ua || "").getDevice();
  return device.type as DeviceType;
};

/**
 * Check if the current device is a mobile device
 * @returns true if device is mobile, false otherwise
 * @throws Error if called on client-side
 */
export const isMobileDevice = (): boolean => {
  return getDeviceType() === "mobile";
};

/**
 * Check if the current device is a tablet device
 * @returns true if device is tablet, false otherwise
 * @throws Error if called on client-side
 */
export const isTabletDevice = (): boolean => {
  return getDeviceType() === "tablet";
};

/**
 * Check if the current device is a desktop device
 * @returns true if device is desktop (undefined device type), false otherwise
 * @throws Error if called on client-side
 */
export const isDesktopDevice = (): boolean => {
  return !getDeviceType(); // undefined means desktop
};

/**
 * Check if the current device is a smart TV
 * @returns true if device is smart TV, false otherwise
 * @throws Error if called on client-side
 */
export const isSmartTVDevice = (): boolean => {
  return getDeviceType() === "smarttv";
};

/**
 * Check if the current device is a console (gaming console)
 * @returns true if device is console, false otherwise
 * @throws Error if called on client-side
 */
export const isConsoleDevice = (): boolean => {
  return getDeviceType() === "console";
};

/**
 * Check if the current device is a wearable device
 * @returns true if device is wearable, false otherwise
 * @throws Error if called on client-side
 */
export const isWearableDevice = (): boolean => {
  return getDeviceType() === "wearable";
};

/**
 * Get detailed device information
 * @returns Object containing device type and additional info
 * @throws Error if called on client-side
 */
export const getDeviceInfo = () => {
  if (typeof process === "undefined") {
    throw new Error(
      "[Server method] you are importing a server-only module outside of server"
    );
  }

  const { get } = headers();
  const ua: string | null = get("user-agent");

  const parser = new UAParser(ua || "");
  const device = parser.getDevice();
  const browser = parser.getBrowser();
  const os = parser.getOS();

  return {
    deviceType: device.type as DeviceType,
    deviceVendor: device.vendor || null,
    deviceModel: device.model || null,
    browserName: browser.name || null,
    browserVersion: browser.version || null,
    osName: os.name || null,
    osVersion: os.version || null,
    isMobile: device.type === "mobile",
    isTablet: device.type === "tablet",
    isDesktop: !device.type,
    userAgent: ua,
  };
};

// Export the device type for external usage
export type { DeviceType };
