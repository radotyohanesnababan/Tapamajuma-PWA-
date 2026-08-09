// src/utils/devPath.js

// true kalau diakses lewat dev.tapamajuma.my.id (prod), false kalau lokal/domain utama
export const isDevSubdomain = () =>
  typeof window !== "undefined" && window.location.hostname.startsWith("dev.");

// path login developer: "/login" di subdomain dev, "/developer/login" di lokal/domain utama
export const developerLoginPath = () => (isDevSubdomain() ? "/login" : "/developer/login");

// path home/dashboard developer: "/" di subdomain dev, "/developer" di lokal/domain utama
export const developerHomePath = () => (isDevSubdomain() ? "/" : "/developer");