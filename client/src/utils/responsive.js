import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

// export const isMobileDevice = () => {
//   if (typeof process === "undefined") {
//     throw new Error(
//       "[Server method] you are importing a server-only module outside of server"
//     );
//   }

//   const { get } = headers();
//   const ua = get("user-agent");

//   const device = new UAParser(ua || "").getDevice();

//   return device.type === "mobile";
// };

const getDeviceType = () => {
  if (typeof process === "undefined") {
    throw new Error(
      "[Server method] you are importing a server-only module outside of server"
    );
  }

  const { get } = headers();
  const ua = get("user-agent");

  const device = new UAParser(ua || "").getDevice();
  return device.type;
};

export const isMobileDevice = () => {
  return getDeviceType() === "mobile";
};

export const isTabletDevice = () => {
  return getDeviceType() === "tablet";
};

export const isDesktopDevice = () => {
  return !getDeviceType(); // undefined means desktop
};
