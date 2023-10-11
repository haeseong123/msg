export class UsingRefreshTokenDto {
    private readonly _id: number;
    private readonly _refreshToken: string;

    constructor(
        id: number,
        refreshToken: string,
    ) {
        this._id = id;
        this._refreshToken = refreshToken;
    }

    get id() {
        return this._id;
    }

    get refreshToken() {
        return this._refreshToken;
    }
}