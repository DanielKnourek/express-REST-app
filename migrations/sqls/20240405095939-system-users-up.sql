INSERT INTO `user` (`uuid`, `access_token`, `username`, `full_name`, `role`)
VALUES (
    uuid_to_bin('00000000-0000-0000-0000-000000000000'),
    UNHEX('0000000000000000000000000000000000000000000000000000000000000000'),
    'system_user', 'System user', 1
    );

INSERT INTO `customer` (`uuid`, `display_name`)
VALUES (
    uuid_to_bin('00000000-1111-0000-1111-000000000000'),
    'System Customer'
    );

INSERT INTO `customer_user` (`user_fk`, `customer_fk`)
VALUES (
    uuid_to_bin('00000000-0000-0000-0000-000000000000'),
    uuid_to_bin('00000000-1111-0000-1111-000000000000')
    );