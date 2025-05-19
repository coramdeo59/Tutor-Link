import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => {
	// Determine if we're in production or not
	const isProduction = process.env.NODE_ENV === "production";

	// Default values based on environment
	const defaults = {
		// In production, we strictly require a secret; locally we can use a fallback
		secret: isProduction
			? process.env.JWT_SECRET
			: process.env.JWT_SECRET || "local-dev-secret",
		// Audience can be different for local vs production
		audience:
			process.env.JWT_TOKEN_AUDIENCE ||
			(isProduction ? "prod-audience" : "local-audience"),
		// Issuer can identify the environment
		issuer:
			process.env.JWT_ISSUER ||
			(isProduction ? "ethio-fundme-prod" : "ethio-fundme-dev"),
		// Longer token lifetime in production, shorter for local development to detect issues
		accessTokenTtl: parseInt(
			process.env.JWT_ACCESS_TOKEN_TTL || (isProduction ? "7200" : "3600"),
			10
		),
		// Longer refresh tokens in production for convenience
		refreshTokenTtl: parseInt(
			process.env.JWT_REFRESH_TOKEN_TTL || (isProduction ? "604800" : "86400"),
			10
		),
	};

	// Security check for production environment
	if (isProduction && !process.env.JWT_SECRET) {
		console.warn(
			"WARNING: Running in production without a defined JWT_SECRET is insecure!"
		);
	}

	return defaults;
});
