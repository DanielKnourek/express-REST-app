import { z } from "zod";
import { User, userSchema } from "../user/userSchema";

const logEntrySchema = z.object({
    id: z.number().nonnegative(),
    timestamp: z.date(),
    caller: userSchema.shape.uuid.optional(),
    message: z.string().max(255),
});

const newLogEntrySchema = logEntrySchema.omit({ id: true, timestamp: true });

type LogEntry = z.infer<typeof logEntrySchema>;
type NewLogEntry = z.infer<typeof newLogEntrySchema>;


let systemUser: User['uuid'] = '00000000-0000-0000-0000-000000000000';

export {
    logEntrySchema, LogEntry,
    newLogEntrySchema, NewLogEntry,
    systemUser
};