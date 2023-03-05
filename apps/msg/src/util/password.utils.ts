import { compare, genSalt, hash } from "bcrypt";

const saltRound = 10;

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await genSalt(saltRound)
    return await hash(password, salt)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await compare(password, hashedPassword)
}