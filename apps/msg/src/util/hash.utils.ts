import { compare, genSalt, hash } from "bcrypt";

const saltRound = 10;

export const hashString = async (string: string): Promise<string> => {
    const salt = await genSalt(saltRound)
    return await hash(string, 10)
}

export const verifyString = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await compare(password, hashedPassword)
}