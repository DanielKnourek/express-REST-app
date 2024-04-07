import { z } from "zod";

const serviceSchema = z.object({
    uuid: z.string().uuid(),
    display_name: z.string().max(255),
});

const newServiceSchema = serviceSchema.omit({ uuid: true });

type Service = z.infer<typeof serviceSchema>;
type NewService = z.infer<typeof newServiceSchema>;

export {
    serviceSchema, Service,
    newServiceSchema, NewService,
};