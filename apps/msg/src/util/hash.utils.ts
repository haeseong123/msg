import { genSalt, hash } from "bcrypt";

const saltRound = 10;

export const hashString = async (string: string): Promise<string> => {
    const salt = await genSalt(saltRound)
    return await hash(string, salt)
}
