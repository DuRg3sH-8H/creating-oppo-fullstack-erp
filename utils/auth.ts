import { verifyToken as authUtilsVerifyToken } from "@/lib/auth-utils"

/**
 * Verify authentication token from request
 * Re-export from auth-utils for consistency
 */
export const verifyToken = authUtilsVerifyToken
