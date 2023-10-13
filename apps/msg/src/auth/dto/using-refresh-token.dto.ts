export class UsingRefreshTokenDto {
    private readonly _userId: number;
    private readonly _refreshToken: string;

    constructor(
        userId: number,
        refreshToken: string,
    ) {
        this._userId = userId;
        this._refreshToken = refreshToken;
    }

    get userId() {
        return this._userId;
    }

    get refreshToken() {
        return this._refreshToken;
    }
}