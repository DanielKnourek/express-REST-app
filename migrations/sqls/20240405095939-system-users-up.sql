INSERT INTO `user` (`uuid`, `access_key`, `username`, `full_name`, `role`)
VALUES (
    uuid_to_bin('00000000-0000-0000-0000-000000000000'),
    UNHEX('0000000000000000000000000000000000000000000000000000000000000000'),
    'system', 'System', 1
    );