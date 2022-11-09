import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";

import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AppError } from "@shared/errors/AppError";

interface IRequest {
    email: string;
    password: string;
}

interface IResponse {
    user: {
        name: string;
        email: string;
    };
    token: string;
}

@injectable()
class AuthenticateUserUseCase {
    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository
    ) { }
    async execute({ email, password }: IRequest): Promise<IResponse> {
        // Usuário existe
        const user = await this.usersRepository.findByEmail(email);

        if (!user) {
            throw new AppError("Email or password is incorrect!");
        }

        // Senha está correta
        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            throw new AppError("Email or password is incorrect!");
        }

        // Gerar jsonwebtoken
        const token = sign({}, "1c337b8875d720aecd45a9ce37e436d6", {
            subject: user.id,
            expiresIn: "1d",
        });

        const tokenReturn: IResponse = {
            token,
            user: {
                name: user.name,
                email: user.email,
            },
        };

        return tokenReturn;
    }
}

export { AuthenticateUserUseCase };