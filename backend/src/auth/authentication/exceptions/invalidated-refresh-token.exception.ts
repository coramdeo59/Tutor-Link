export class InvalidatedRefreshTokenError extends Error {
	constructor(message: string = "Refresh token is invalid") {
		super(message);
		this.name = "InvalidatedRefreshTokenError";
	}
}
