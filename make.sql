DROP DATABASE IF EXISTS post;
DROP USER IF EXISTS backend_user@localhost;
CREATE DATABASE post CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER backend_user@localhost IDENTIFIED BY 'GreenDog4$$';
GRANT ALL PRIVILEGES ON post.* TO backend_user@localhost;
