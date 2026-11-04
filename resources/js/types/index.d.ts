export interface User {
    id: number;
    name: string;
    email: string;
    cpf: string;
    tipo_usuario: string;
    email_verified_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};