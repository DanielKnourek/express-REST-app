import z from 'zod';

const customerSchema = z.object({
    uuid: z.string().uuid(),
    display_name: z.string().max(255),
});

const newCustomerSchema = customerSchema.omit({uuid: true});

type customer = z.infer<typeof customerSchema>;
type newCustomer = z.infer<typeof newCustomerSchema>;

export {
    customerSchema, customer,
    newCustomerSchema, newCustomer,
};