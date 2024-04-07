import { User } from "@/utils/user/userSchema";
import { customer } from "./customer/customerSchema";
import { getConnection } from "./db";

enum Rules {
    isAdmin = 'isAdmin',
    isMember = 'isMember',
    isUser = 'isUser',
}

enum Roles {
    admin = 'admin',
    customer = 'customer',
}

const ruleTable: {
    [rule in Rules]: Rules[];
} = {
    [Rules.isAdmin]: [Rules.isAdmin],
    [Rules.isMember]: [Rules.isAdmin, Rules.isMember],
    [Rules.isUser]: [Rules.isAdmin, Rules.isMember, Rules.isUser],
}

type ruleDefinitionType = {
    rule: Rules,
    args?: any[],
}
const checkACL = async (defined_rule: ruleDefinitionType, user: User): Promise<boolean> => {
    const ruleset = ruleTable[defined_rule.rule];

    for (const r of ruleset) {
        switch (r) {
            case Rules.isAdmin:
                if (user.role === Roles.admin) {
                    return true;
                }
                break;
            case Rules.isMember:
                //TODO: make better solution
                const isMember = await isMemberRule(user, defined_rule?.args?.[0]);
                if (isMember) {
                    return true;
                }
                break;
            case Rules.isUser:
                if (user.role === Roles.customer) {
                    return true;
                }
                break;
        }
    }
    return false;
}

const isMemberRule = async (user: User, customer_uuid: customer['uuid']): Promise<boolean> => {
    const sql_querry = /*sql*/`SELECT EXISTS(
        SELECT *
        FROM customer_user 
        WHERE 
        customer_fk = UUID_TO_BIN(?)
        AND
        user_fk = uuid_to_bin(?)
        ) as is_member`;

    return await getConnection({
        message: 'Testing if user {${user.uuid}} is a member of customer {${customer_uuid}}',
    })
        .then((connection) => {
            return connection.execute(sql_querry, [customer_uuid, user.uuid])
        })
        .then(([rows]) => {
            if ((rows as any)[0].is_member != 1) { // TODO: cast to any
                throw new Error('no match found for user and customer');
            }
            return true;
        })
        .catch((err) => {
            return false;
        })
}

export {
    Rules,
    Roles,
    checkACL,
}
