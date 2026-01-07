/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// Performance optimizations
Config.setVideoImageFormat("jpeg"); // Already optimized - JPEG is faster than PNG
Config.setOverwriteOutput(true);

// Enable GPU acceleration for better performance
Config.setChromiumOpenGlRenderer("angle");

// Enable hardware acceleration if available (macOS/Windows)
Config.setHardwareAcceleration("if-possible");

// Optimize encoding settings
Config.setPixelFormat("yuv420p"); // Standard format for better compatibility and speed

// Set reasonable concurrency (will be overridden by CLI flags)
Config.setConcurrency(4); // Conservative default, use benchmark to find optimal

Config.overrideWebpackConfig(enableTailwind);
