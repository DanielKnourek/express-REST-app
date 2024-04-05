CREATE TABLE `customer` (
  `uuid` binary(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
  `display_name` varchar(255) NOT NULL,
    PRIMARY KEY(`uuid`)
);

CREATE TABLE `user` (
  `uuid` binary(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
  `username` varchar(25) NOT NULL,
  `full_name` varchar(255) NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer',
	PRIMARY KEY(`uuid`)
);

CREATE TABLE `customer_user` (
  `customer_fk` binary(16) NOT NULL,
  `user_fk` binary(16) NOT NULL,
  FOREIGN KEY (`customer_fk`) REFERENCES `customer` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`user_fk`) REFERENCES `user` (`uuid`) ON DELETE CASCADE,
	PRIMARY KEY(`customer_fk`, `user_fk`)
);

CREATE TABLE `service` (
  `uuid` binary(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
  `display_name` varchar(255) NOT NULL,
	PRIMARY KEY(`uuid`)
);

CREATE TABLE `customer_service` (
  `customer_fk` binary(16) NOT NULL,
  `service_fk` binary(16) NOT NULL,
  FOREIGN KEY (`customer_fk`) REFERENCES `customer` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`service_fk`) REFERENCES `service` (`uuid`) ON DELETE CASCADE,
	PRIMARY KEY(`customer_fk`, `service_fk`)
);

CREATE TABLE `log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `user_fk` binary(16) NULL,
  `message` varchar(255) NOT NULL,
	PRIMARY KEY(`id`),
  FOREIGN KEY (`user_fk`) REFERENCES `user` (`uuid`)
) AUTO_INCREMENT=1;