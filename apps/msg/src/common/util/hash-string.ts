import { hash } from "bcrypt";

export const hashString = async (string: string): Promise<string> => {
    const saltRound = 10;

    return await hash(string, saltRound);
}
