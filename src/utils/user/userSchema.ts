import z from 'zod';
import { Roles } from '@/utils/authorization';

const userSchema = z.object({
    uuid: z.string().uuid(),
    username: z.string().max(25),
    full_name: z.string().max(255),
    access_token: z.string().length(64).optional(),
    role: z.nativeEnum(Roles),
});

const newUserSchema = userSchema.omit({ uuid: true, access_token: true });

type User = z.infer<typeof userSchema>;
type NewUser = z.infer<typeof newUserSchema>;

const userBarerTokenSchema = z.object({
    authorization: z.string().length(71).transform((value) => value.split(' ')[1]),
}).transform((value) => ({ access_token: value.authorization }));

type UserBarerToken = z.infer<typeof userBarerTokenSchema>;

export {
    userSchema, User,
    newUserSchema, NewUser,
    userBarerTokenSchema, UserBarerToken,
};