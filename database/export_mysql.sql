-- Auto-generated from SQLite to MySQL
-- Generated at: 2026-04-11 18:52:42
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `action` VARCHAR(255) NOT NULL,
  `auditable_type` VARCHAR(255) NULL,
  `auditable_id` VARCHAR(255) NULL,
  `metadata` LONGTEXT NULL,
  `ip_address` VARCHAR(255) NULL,
  `user_agent` LONGTEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `audit_logs_auditable_type_auditable_id_index` ON `audit_logs` (`auditable_type`, `auditable_id`);
CREATE INDEX `audit_logs_action_created_at_index` ON `audit_logs` (`action`, `created_at`);

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (1, 1, 'customer.payment.intent_created', 'App\Models\Payment', 1, '{"booking_id":"019d6e80-dce1-7103-8afa-59b17aaa99c6","provider":"STRIPE","payment_reference":"pi_3TK1Um9Fe3R1FMiH04tT4sAB"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 19:10:36', '2026-04-08 19:10:36');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (2, 1, 'customer.payment.synced', 'App\Models\Payment', 1, '{"booking_id":"019d6e80-dce1-7103-8afa-59b17aaa99c6","provider_reference":"pi_3TK1Um9Fe3R1FMiH04tT4sAB","stripe_status":"succeeded","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 19:10:57', '2026-04-08 19:10:57');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (3, 1, 'customer.payment.intent_created', 'App\Models\Payment', 2, '{"booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","provider":"STRIPE","payment_reference":"pi_3TK2SJ9Fe3R1FMiH1yH3DsmV"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:12:07', '2026-04-08 20:12:07');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (4, 1, 'customer.payment.synced', 'App\Models\Payment', 2, '{"booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","provider_reference":"pi_3TK2SJ9Fe3R1FMiH1yH3DsmV","stripe_status":"succeeded","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:12:38', '2026-04-08 20:12:38');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (5, 1, 'customer.payment.intent_created', 'App\Models\Payment', 3, '{"booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","provider":"STRIPE","payment_reference":"pi_3TK2ZF9Fe3R1FMiH0c8fyFft"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:19:17', '2026-04-08 20:19:17');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (6, 1, 'customer.payment.synced', 'App\Models\Payment', 3, '{"booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","provider_reference":"pi_3TK2ZF9Fe3R1FMiH0c8fyFft","stripe_status":"succeeded","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:19:49', '2026-04-08 20:19:49');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (7, 1, 'customer.booking.deleted', 'App\Models\Booking', '019d6ebf-a4af-72c1-8cb5-4395f020da00', '{"booking_status":"CANCELLED","check_out":"2026-04-14"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:43:30', '2026-04-08 20:43:30');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (8, 1, 'customer.booking.deleted', 'App\Models\Booking', '019d6eb9-1839-73ce-b0c6-1675c633a011', '{"booking_status":"CANCELLED","check_out":"2026-04-29"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:43:37', '2026-04-08 20:43:37');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (9, 1, 'customer.booking.deleted', 'App\Models\Booking', '019d6e80-dce1-7103-8afa-59b17aaa99c6', '{"booking_status":"CANCELLED","check_out":"2026-04-15"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:43:47', '2026-04-08 20:43:47');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (10, 4, 'customer.payment.intent_created', 'App\Models\Payment', 4, '{"booking_id":"019d6ee3-2859-7170-8421-b1eb7e9015dc","provider":"STRIPE","payment_reference":"pi_3TK3BK9Fe3R1FMiH0Kcs8uoT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:58:38', '2026-04-08 20:58:38');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (11, 4, 'customer.booking.deleted', 'App\Models\Booking', '019d6ee3-2859-7170-8421-b1eb7e9015dc', '{"booking_status":"CANCELLED","check_out":"2026-04-22"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 20:58:51', '2026-04-08 20:58:51');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (12, 4, 'customer.booking.deleted', 'App\Models\Booking', '019d6ee4-4aa2-73af-ba2a-7adeed425049', '{"booking_status":"CANCELLED","check_out":"2026-04-15"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 21:02:13', '2026-04-08 21:02:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (13, 4, 'customer.payment.intent_created', 'App\Models\Payment', 6, '{"booking_id":"019d6eeb-1d98-736d-a468-29a4f8425f43","provider":"STRIPE","payment_reference":"pi_3TK3JL9Fe3R1FMiH14awLmJ3"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 21:06:55', '2026-04-08 21:06:55');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (14, 4, 'customer.booking.deleted', 'App\Models\Booking', '019d6eeb-1d98-736d-a468-29a4f8425f43', '{"booking_status":"CANCELLED","check_out":"2026-04-16"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 21:07:06', '2026-04-08 21:07:06');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (15, 4, 'customer.booking.deleted', 'App\Models\Booking', '019d6eef-9bb5-703a-bc55-7837fc61e378', '{"booking_status":"CANCELLED","check_out":"2026-04-15"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 21:19:36', '2026-04-08 21:19:36');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (16, 4, 'customer.booking.deleted', 'App\Models\Booking', '019d6ef7-3d04-7259-8cc6-14402adbd85a', '{"booking_status":"CANCELLED","check_out":"2026-04-15"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-08 21:20:59', '2026-04-08 21:20:59');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (17, 1, 'customer.booking.deleted', 'App\Models\Booking', '019d7478-7772-7376-bf8b-5ead0d34aaab', '{"booking_status":"CANCELLED","check_out":"2026-04-16"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-09 22:59:41', '2026-04-09 22:59:41');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (18, 1, 'customer.payment.intent_created', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider":"STRIPE","payment_reference":"pi_3TKRo09Fe3R1FMiH1MvSREzm"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-09 23:16:12', '2026-04-09 23:16:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (19, 1, 'customer.payment.synced', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider_reference":"pi_3TKRo09Fe3R1FMiH1MvSREzm","stripe_status":"succeeded","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-09 23:16:39', '2026-04-09 23:16:39');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (20, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKdKb9Fe3R1FMiH0JTrIyVZ"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 11:34:37', '2026-04-10 11:34:37');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (21, 1, 'customer.payment.synced', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider_reference":"pi_3TKdKb9Fe3R1FMiH0JTrIyVZ","stripe_status":"succeeded","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 11:35:03', '2026-04-10 11:35:03');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (22, 1, 'admin.booking.status_updated', 'App\Models\Booking', '019d772c-014b-700f-bf47-e089dec7f76d', '{"previous_status":"CONFIRMED","new_status":"PENDING","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:28:59', '2026-04-10 17:28:59');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (23, 1, 'admin.booking.status_updated', 'App\Models\Booking', '019d772c-014b-700f-bf47-e089dec7f76d', '{"previous_status":"PENDING","new_status":"CONFIRMED","payment_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:29:01', '2026-04-10 17:29:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (24, 1, 'admin.payment.status_updated', 'App\Models\Payment', 12, '{"previous_status":"PAID","new_status":"PENDING"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:29:12', '2026-04-10 17:29:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (25, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKiru9Fe3R1FMiH0VE6jDgg"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:29:22', '2026-04-10 17:29:22');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (26, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKiz99Fe3R1FMiH1FNxyuDN"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:36:51', '2026-04-10 17:36:51');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (27, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKj1x9Fe3R1FMiH0g5vc4Gn"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:39:45', '2026-04-10 17:39:45');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (28, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKj6T9Fe3R1FMiH08Gbymc7"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:44:25', '2026-04-10 17:44:25');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (29, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjHp9Fe3R1FMiH0clArzIx"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 17:56:09', '2026-04-10 17:56:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (30, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjSe9Fe3R1FMiH1mJ65XSO"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:07:20', '2026-04-10 18:07:20');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (31, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjTJ9Fe3R1FMiH1TiACftq"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:08:01', '2026-04-10 18:08:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (32, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjTm9Fe3R1FMiH0PFFhP4E"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:08:30', '2026-04-10 18:08:30');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (33, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjVb9Fe3R1FMiH1n3PQUzk","installment_type":null}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:10:23', '2026-04-10 18:10:23');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (34, 1, 'customer.payment.synced', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider_reference":"pi_3TKjVb9Fe3R1FMiH1n3PQUzk","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:10:47', '2026-04-10 18:10:47');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (35, 1, 'admin.payment.status_updated', 'App\Models\Payment', 12, '{"previous_status":"PAID","new_status":"PENDING"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:11:13', '2026-04-10 18:11:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (36, 1, 'admin.payment.status_updated', 'App\Models\Payment', 11, '{"previous_status":"PAID","new_status":"PENDING"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:11:15', '2026-04-10 18:11:15');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (37, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjWX9Fe3R1FMiH0D8cWDlU","installment_type":null}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:11:21', '2026-04-10 18:11:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (38, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjYO9Fe3R1FMiH1kGKqRmk","installment_type":"FULL"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:13:16', '2026-04-10 18:13:16');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (39, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjZo9Fe3R1FMiH0eus5Gnx","installment_type":"DEPOSIT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:14:45', '2026-04-10 18:14:45');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (40, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKja69Fe3R1FMiH1pq1naFm","installment_type":"DEPOSIT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:15:02', '2026-04-10 18:15:02');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (41, 1, 'customer.payment.synced', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider_reference":"pi_3TKja69Fe3R1FMiH1pq1naFm","stripe_status":"succeeded","payment_status":"PENDING","display_status":"PARTIALLY_PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:15:29', '2026-04-10 18:15:29');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (42, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjbI9Fe3R1FMiH1C1wrKrp","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:16:16', '2026-04-10 18:16:16');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (43, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKjbi9Fe3R1FMiH1xLmKOFs","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:16:42', '2026-04-10 18:16:42');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (44, 1, 'customer.payment.synced', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider_reference":"pi_3TKjbi9Fe3R1FMiH1xLmKOFs","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 18:17:11', '2026-04-10 18:17:11');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (45, 1, 'customer.payment.intent_created', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider":"STRIPE","payment_reference":"pi_3TKkn39Fe3R1FMiH10Z065Qu","installment_type":"DEPOSIT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:32:29', '2026-04-10 19:32:29');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (46, 1, 'customer.payment.intent_created', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider":"STRIPE","payment_reference":"pi_3TKknR9Fe3R1FMiH1wYknOkj","installment_type":"DEPOSIT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:32:53', '2026-04-10 19:32:53');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (47, 1, 'customer.payment.synced', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider_reference":"pi_3TKknR9Fe3R1FMiH1wYknOkj","stripe_status":"succeeded","payment_status":"PENDING","display_status":"PARTIALLY_PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:33:11', '2026-04-10 19:33:11');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (48, 1, 'customer.payment.intent_created', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider":"STRIPE","payment_reference":"pi_3TKkri9Fe3R1FMiH1cPMDc1h","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:37:18', '2026-04-10 19:37:18');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (49, 1, 'customer.payment.intent_created', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider":"STRIPE","payment_reference":"pi_3TKks39Fe3R1FMiH0zNvsphY","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:37:39', '2026-04-10 19:37:39');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (50, 1, 'customer.payment.synced', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider_reference":"pi_3TKks39Fe3R1FMiH0zNvsphY","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:38:00', '2026-04-10 19:38:00');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (51, 1, 'customer.payment.intent_created', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider":"STRIPE","payment_reference":"pi_3TKksc9Fe3R1FMiH0R3DtPuO","installment_type":"DEPOSIT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:38:14', '2026-04-10 19:38:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (52, 1, 'customer.payment.synced', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider_reference":"pi_3TKksc9Fe3R1FMiH0R3DtPuO","stripe_status":"succeeded","payment_status":"PENDING","display_status":"PARTIALLY_PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:38:30', '2026-04-10 19:38:30');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (53, 1, 'customer.payment.intent_created', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider":"STRIPE","payment_reference":"pi_3TKkuQ9Fe3R1FMiH0hD4Ekto","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:40:06', '2026-04-10 19:40:06');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (54, 1, 'customer.payment.synced', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider_reference":"pi_3TKkuQ9Fe3R1FMiH0hD4Ekto","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:43:02', '2026-04-10 19:43:02');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (55, 1, 'admin.payment.status_updated', 'App\Models\Payment', 13, '{"previous_status":"PAID","new_status":"PENDING"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:45:33', '2026-04-10 19:45:33');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (56, 1, 'admin.payment.status_updated', 'App\Models\Payment', 12, '{"previous_status":"PAID","new_status":"PENDING"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:45:34', '2026-04-10 19:45:34');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (57, 1, 'admin.payment.status_updated', 'App\Models\Payment', 11, '{"previous_status":"PAID","new_status":"PENDING"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:45:35', '2026-04-10 19:45:35');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (58, 1, 'customer.payment.intent_created', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider":"STRIPE","payment_reference":"pi_3TKkzw9Fe3R1FMiH08Jhy9OU","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:45:49', '2026-04-10 19:45:49');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (59, 1, 'customer.payment.synced', 'App\Models\Payment', 13, '{"booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","provider_reference":"pi_3TKkzw9Fe3R1FMiH08Jhy9OU","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:46:09', '2026-04-10 19:46:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (60, 1, 'customer.payment.intent_created', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider":"STRIPE","payment_reference":"pi_3TKl0h9Fe3R1FMiH1SmqPmrO","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:46:35', '2026-04-10 19:46:35');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (61, 1, 'customer.payment.synced', 'App\Models\Payment', 12, '{"booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","provider_reference":"pi_3TKl0h9Fe3R1FMiH1SmqPmrO","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:46:58', '2026-04-10 19:46:58');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (62, 1, 'customer.payment.intent_created', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider":"STRIPE","payment_reference":"pi_3TKl1M9Fe3R1FMiH1c6qWpu4","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:47:16', '2026-04-10 19:47:16');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (63, 1, 'customer.payment.intent_created', 'App\Models\Payment', 14, '{"booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","provider":"STRIPE","payment_reference":"pi_3TKl2N9Fe3R1FMiH0MYSOtOp","installment_type":"DEPOSIT"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:48:19', '2026-04-10 19:48:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (64, 1, 'customer.payment.synced', 'App\Models\Payment', 14, '{"booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","provider_reference":"pi_3TKl2N9Fe3R1FMiH0MYSOtOp","stripe_status":"succeeded","payment_status":"PENDING","display_status":"PARTIALLY_PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:48:35', '2026-04-10 19:48:35');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (65, 1, 'customer.payment.intent_created', 'App\Models\Payment', 14, '{"booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","provider":"STRIPE","payment_reference":"pi_3TKl2h9Fe3R1FMiH12YqsXne","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:48:40', '2026-04-10 19:48:40');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (66, 1, 'customer.payment.synced', 'App\Models\Payment', 14, '{"booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","provider_reference":"pi_3TKl2h9Fe3R1FMiH12YqsXne","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-10 19:49:04', '2026-04-10 19:49:04');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (67, 1, 'customer.payment.intent_created', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider":"STRIPE","payment_reference":"pi_3TKzYQ9Fe3R1FMiH0yoB5S9D","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-11 11:18:23', '2026-04-11 11:18:23');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (68, 1, 'customer.payment.synced', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider_reference":"pi_3TKzYQ9Fe3R1FMiH0yoB5S9D","stripe_status":"requires_payment_method","payment_status":"FAILED","display_status":"FAILED"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-11 11:19:08', '2026-04-11 11:19:08');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (69, 1, 'customer.payment.intent_created', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider":"STRIPE","payment_reference":"pi_3TKzZM9Fe3R1FMiH0L222JMi","installment_type":"BALANCE"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-11 11:19:20', '2026-04-11 11:19:20');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `auditable_type`, `auditable_id`, `metadata`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (70, 1, 'customer.payment.synced', 'App\Models\Payment', 11, '{"booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","provider_reference":"pi_3TKzZM9Fe3R1FMiH0L222JMi","stripe_status":"succeeded","payment_status":"PAID","display_status":"PAID"}', '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', '2026-04-11 11:21:42', '2026-04-11 11:21:42');

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `hotel_id` INT NOT NULL,
  `rate_id` INT NOT NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `guests` INT NOT NULL,
  `nights` INT NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `fees_total` DECIMAL(12,2) NOT NULL DEFAULT '0',
  `total_price` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `cancellation_reason` VARCHAR(255) NULL,
  `cancelled_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `bookings` (`id`, `user_id`, `event_id`, `hotel_id`, `rate_id`, `check_in`, `check_out`, `guests`, `nights`, `subtotal`, `fees_total`, `total_price`, `status`, `cancellation_reason`, `cancelled_at`, `created_at`, `updated_at`) VALUES ('019d6f30-0be1-712d-b21a-3e5b067860e9', 4, 1, 1, 3, '2026-04-08 00:00:00', '2026-04-23 00:00:00', 2, 15, 3675, 0, 3675, 'CONFIRMED', NULL, NULL, '2026-04-08 22:21:52', '2026-04-08 22:21:52');
INSERT INTO `bookings` (`id`, `user_id`, `event_id`, `hotel_id`, `rate_id`, `check_in`, `check_out`, `guests`, `nights`, `subtotal`, `fees_total`, `total_price`, `status`, `cancellation_reason`, `cancelled_at`, `created_at`, `updated_at`) VALUES ('019d7487-f568-7183-bb04-4c19aea6b9bb', 1, 1, 1, 3, '2026-04-10 00:00:00', '2026-04-17 00:00:00', 3, 7, 1715, 0, 1715, 'CONFIRMED', NULL, NULL, '2026-04-09 23:16:00', '2026-04-09 23:16:00');
INSERT INTO `bookings` (`id`, `user_id`, `event_id`, `hotel_id`, `rate_id`, `check_in`, `check_out`, `guests`, `nights`, `subtotal`, `fees_total`, `total_price`, `status`, `cancellation_reason`, `cancelled_at`, `created_at`, `updated_at`) VALUES ('019d772c-014b-700f-bf47-e089dec7f76d', 1, 1, 1, 3, '2026-04-10 00:00:00', '2026-04-17 00:00:00', 3, 7, 1715, 0, 1715, 'CONFIRMED', NULL, NULL, '2026-04-10 11:34:25', '2026-04-10 17:29:01');
INSERT INTO `bookings` (`id`, `user_id`, `event_id`, `hotel_id`, `rate_id`, `check_in`, `check_out`, `guests`, `nights`, `subtotal`, `fees_total`, `total_price`, `status`, `cancellation_reason`, `cancelled_at`, `created_at`, `updated_at`) VALUES ('019d78e1-83c6-71a9-9147-01ff021cb16c', 1, 1, 1, 3, '2026-04-10 00:00:00', '2026-04-17 00:00:00', 1, 7, 1715, 0, 1715, 'CONFIRMED', NULL, NULL, '2026-04-10 19:32:18', '2026-04-10 19:32:18');
INSERT INTO `bookings` (`id`, `user_id`, `event_id`, `hotel_id`, `rate_id`, `check_in`, `check_out`, `guests`, `nights`, `subtotal`, `fees_total`, `total_price`, `status`, `cancellation_reason`, `cancelled_at`, `created_at`, `updated_at`) VALUES ('019d78f0-08b9-70df-91c1-69222bfbe6e9', 1, 1, 1, 3, '2026-04-10 00:00:00', '2026-04-17 00:00:00', 2, 7, 1715, 0, 1715, 'CONFIRMED', NULL, NULL, '2026-04-10 19:48:10', '2026-04-10 19:48:10');

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` VARCHAR(255) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `cache_expiration_index` ON `cache` (`expiration`);

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `cache_locks_expiration_index` ON `cache_locks` (`expiration`);

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `location` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12,2) NULL,
  `longitude` DECIMAL(12,2) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `booking_start` DATE NULL,
  `booking_end` DATE NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `cover_image` VARCHAR(255) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);

INSERT INTO `events` (`id`, `name`, `slug`, `description`, `location`, `latitude`, `longitude`, `start_date`, `end_date`, `booking_start`, `booking_end`, `is_active`, `created_at`, `updated_at`, `cover_image`, `is_featured`) VALUES (1, 'Maratona de Gaia', 'maratona-de-gaia', 'Maratona de Gaia', 'Lisboa, Portugal', 38.7223, -9.1393, NULL, NULL, NULL, NULL, 1, '2026-04-08 19:03:50', '2026-04-11 13:05:41', 'events/tBc6vBQqeylRtRPMKk48gSkXv804R30vY8v3ipoS.webp', 1);

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(255) NOT NULL,
  `connection` LONGTEXT NOT NULL,
  `queue` LONGTEXT NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `exception` LONGTEXT NOT NULL,
  `failed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `failed_jobs_uuid_unique` ON `failed_jobs` (`uuid`);

DROP TABLE IF EXISTS `hotels`;
CREATE TABLE `hotels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12,2) NULL,
  `longitude` DECIMAL(12,2) NULL,
  `supplier_name` VARCHAR(255) NOT NULL,
  `website_url` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `gallery_images` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `hotels` (`id`, `event_id`, `name`, `description`, `address`, `latitude`, `longitude`, `supplier_name`, `website_url`, `is_active`, `created_at`, `updated_at`, `gallery_images`) VALUES (1, 1, 'Hotel Demo 20260408190350', 'Hotel para validar fluxo completo.', 'Avenida da Liberdade, Lisboa', 38.726, -9.145, 'Fornecedor Demo', 'https://example.com/hotel-demo-20260408190350', 1, '2026-04-08 19:03:50', '2026-04-09 15:24:10', '["hotels\/p6vTovHzeDuXqdQWcmujuEem9u4Xs4JMNUnhtVDO.png"]');

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` VARCHAR(255) NOT NULL,
  `payment_id` INT NULL,
  `installment_type` VARCHAR(255) NOT NULL,
  `invoice_number` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NULL,
  `issued_at` DATETIME NOT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);
CREATE UNIQUE INDEX `invoices_booking_id_installment_type_unique` ON `invoices` (`booking_id`, `installment_type`);

INSERT INTO `invoices` (`id`, `booking_id`, `payment_id`, `installment_type`, `invoice_number`, `amount`, `currency`, `file_path`, `issued_at`, `created_at`, `updated_at`) VALUES (1, '019d7487-f568-7183-bb04-4c19aea6b9bb', 11, 'BALANCE', 'INV-20260411112134-NE1PME', 1690, 'EUR', 'invoices/2026/04/INV-20260411112134-NE1PME.html', '2026-04-11 11:21:34', '2026-04-11 11:21:34', '2026-04-11 11:21:34');

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `total_jobs` INT NOT NULL,
  `pending_jobs` INT NOT NULL,
  `failed_jobs` INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options` LONGTEXT NULL,
  `cancelled_at` INT NULL,
  `created_at` INT NOT NULL,
  `finished_at` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` INT NOT NULL,
  `reserved_at` INT NULL,
  `available_at` INT NOT NULL,
  `created_at` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `jobs_queue_index` ON `jobs` (`queue`);

DROP TABLE IF EXISTS `meal_plans`;
CREATE TABLE `meal_plans` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `meal_plans_name_unique` ON `meal_plans` (`name`);

INSERT INTO `meal_plans` (`id`, `name`, `created_at`, `updated_at`) VALUES (1, 'breakfast', '2026-04-08 19:03:50', '2026-04-08 19:03:50');
INSERT INTO `meal_plans` (`id`, `name`, `created_at`, `updated_at`) VALUES (2, 'half-board', '2026-04-08 19:03:50', '2026-04-08 19:03:50');
INSERT INTO `meal_plans` (`id`, `name`, `created_at`, `updated_at`) VALUES (3, 'all-inclusive', '2026-04-08 19:03:50', '2026-04-08 19:03:50');

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `migration` VARCHAR(255) NOT NULL,
  `batch` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4, '2026_04_07_190747_create_events_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5, '2026_04_07_190747_create_hotels_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6, '2026_04_07_190747_create_room_types_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7, '2026_04_07_190748_create_bookings_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8, '2026_04_07_190748_create_meal_plans_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9, '2026_04_07_190748_create_rates_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10, '2026_04_07_190749_create_payments_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11, '2026_04_07_190749_create_supplier_payments_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12, '2026_04_07_230000_create_payment_webhook_events_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13, '2026_04_08_000100_create_audit_logs_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14, '2026_04_08_120000_add_gallery_images_to_hotels_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15, '2026_04_08_130000_create_notifications_table', 1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16, '2026_04_08_160000_add_hotel_id_to_users_table', 2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17, '2026_04_08_220000_create_push_subscriptions_table', 3);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18, '2026_04_10_120000_add_cover_image_to_events_table', 4);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19, '2026_04_10_130000_add_is_featured_to_events_table', 4);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20, '2026_04_10_170000_add_nationality_and_nif_to_users_table', 5);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21, '2026_04_10_120000_make_event_dates_nullable', 6);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22, '2026_04_10_160000_add_cancellation_and_deposit_fields_to_rates', 7);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23, '2026_04_10_170000_add_deposit_amount_to_rates', 8);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24, '2026_04_10_180000_add_installment_fields_to_payments', 9);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25, '2026_04_10_181000_backfill_deposit_installments_for_existing_bookings', 10);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26, '2026_04_10_210000_create_invoices_table', 11);

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `notifiable_type` VARCHAR(255) NOT NULL,
  `notifiable_id` INT NOT NULL,
  `data` LONGTEXT NOT NULL,
  `read_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `notifications_notifiable_type_notifiable_id_index` ON `notifications` (`notifiable_type`, `notifiable_id`);

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('b845b6a2-c6a5-4aae-9a88-5398d8fbbce2', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6e80-dce1-7103-8afa-59b17aaa99c6\/payment","booking_id":"019d6e80-dce1-7103-8afa-59b17aaa99c6","kind":"booking_created"}', '2026-04-08 19:11:09', '2026-04-08 19:10:32', '2026-04-08 19:11:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('35bbced3-b837-4a9d-bae8-c508d447c027', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Payment confirmed","message":"Payment confirmed for Evento Demo 20260408190350 at Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6e80-dce1-7103-8afa-59b17aaa99c6","booking_id":"019d6e80-dce1-7103-8afa-59b17aaa99c6","kind":"payment_confirmed"}', '2026-04-08 19:11:09', '2026-04-08 19:10:54', '2026-04-08 19:11:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('459f4aa4-3d1f-45e7-af5f-555e21b177f0', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"New paid booking","message":"Booking 019d6e80-dce1-7103-8afa-59b17aaa99c6 by Administrador Teste was confirmed and paid.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6e80-dce1-7103-8afa-59b17aaa99c6","booking_id":"019d6e80-dce1-7103-8afa-59b17aaa99c6","kind":"admin_booking_paid"}', '2026-04-08 19:11:09', '2026-04-08 19:10:56', '2026-04-08 19:11:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('78e934be-0703-4423-955b-73d5686fa7d6', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eb9-1839-73ce-b0c6-1675c633a011\/payment","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"booking_created"}', '2026-04-08 20:20:37', '2026-04-08 20:11:57', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('c2548fb4-3088-477f-91c3-08f16a8e488c', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 2, '{"title":"New booking received","message":"Booking 019d6eb9-1839-73ce-b0c6-1675c633a011 by Administrador Teste was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6eb9-1839-73ce-b0c6-1675c633a011","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"hotel_booking_created"}', NULL, '2026-04-08 20:11:59', '2026-04-08 20:11:59');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('76848621-c961-46e6-bbb1-be744f41b476', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"New booking received","message":"Booking 019d6eb9-1839-73ce-b0c6-1675c633a011 by Administrador Teste was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6eb9-1839-73ce-b0c6-1675c633a011","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"hotel_booking_created"}', '2026-04-08 20:21:06', '2026-04-08 20:12:00', '2026-04-08 20:21:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('e8598283-2540-46de-9aa8-a0a803b2c98e', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Payment confirmed","message":"Payment confirmed for Evento Demo 20260408190350 at Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eb9-1839-73ce-b0c6-1675c633a011","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"payment_confirmed"}', '2026-04-08 20:20:37', '2026-04-08 20:12:35', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('df995501-990d-4c52-84d9-2adac37db9bf', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"New paid booking","message":"Booking 019d6eb9-1839-73ce-b0c6-1675c633a011 by Administrador Teste was confirmed and paid.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6eb9-1839-73ce-b0c6-1675c633a011","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"admin_booking_paid"}', '2026-04-08 20:20:37', '2026-04-08 20:12:37', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('01137354-28cd-4058-83af-dc704d51af81', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6eb9-1839-73ce-b0c6-1675c633a011 by Administrador Teste was created.","url":"http:\/\/localhost\/admin\/bookings?search=019d6eb9-1839-73ce-b0c6-1675c633a011","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"admin_booking_created"}', '2026-04-08 20:20:37', '2026-04-08 20:16:59', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('65d81cf6-cde4-46a0-bac2-13fff006ac38', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ebf-a4af-72c1-8cb5-4395f020da00\/payment","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"booking_created"}', '2026-04-08 20:20:37', '2026-04-08 20:19:06', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('e5dcbbbb-c6c1-4561-91ac-3811bb607ed6', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6ebf-a4af-72c1-8cb5-4395f020da00 by Administrador Teste was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6ebf-a4af-72c1-8cb5-4395f020da00","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"admin_booking_created"}', '2026-04-08 20:20:37', '2026-04-08 20:19:08', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('cab08c08-8552-4934-9f45-6aeb928a93ff', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 2, '{"title":"New booking received","message":"Booking 019d6ebf-a4af-72c1-8cb5-4395f020da00 by Administrador Teste was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6ebf-a4af-72c1-8cb5-4395f020da00","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"hotel_booking_created"}', NULL, '2026-04-08 20:19:09', '2026-04-08 20:19:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('02c44dfd-7c90-45d8-9c89-f3ffac40fe92', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"New booking received","message":"Booking 019d6ebf-a4af-72c1-8cb5-4395f020da00 by Administrador Teste was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6ebf-a4af-72c1-8cb5-4395f020da00","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"hotel_booking_created"}', '2026-04-08 20:21:06', '2026-04-08 20:19:10', '2026-04-08 20:21:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('5300c321-e1c5-4b03-a60d-216c27a1471a', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Payment confirmed","message":"Payment confirmed for Evento Demo 20260408190350 at Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ebf-a4af-72c1-8cb5-4395f020da00","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"payment_confirmed"}', '2026-04-08 20:20:37', '2026-04-08 20:19:46', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('497abb9e-69be-4cb9-8267-d625b1bae558', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"New paid booking","message":"Booking 019d6ebf-a4af-72c1-8cb5-4395f020da00 by Administrador Teste was confirmed and paid.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6ebf-a4af-72c1-8cb5-4395f020da00","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"admin_booking_paid"}', '2026-04-08 20:20:37', '2026-04-08 20:19:48', '2026-04-08 20:20:37');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('1926bf03-e1d1-4d9a-adf3-90c4ada033fb', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 1, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ebf-a4af-72c1-8cb5-4395f020da00","booking_id":"019d6ebf-a4af-72c1-8cb5-4395f020da00","kind":"booking_cancelled"}', '2026-04-08 20:45:48', '2026-04-08 20:43:25', '2026-04-08 20:45:48');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('0e40a8f7-1538-455e-847d-bc05460be22e', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 1, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eb9-1839-73ce-b0c6-1675c633a011","booking_id":"019d6eb9-1839-73ce-b0c6-1675c633a011","kind":"booking_cancelled"}', '2026-04-08 20:45:48', '2026-04-08 20:43:32', '2026-04-08 20:45:48');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('5530631f-7509-4e18-a0e6-dd1efdd05b3a', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 1, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6e80-dce1-7103-8afa-59b17aaa99c6","booking_id":"019d6e80-dce1-7103-8afa-59b17aaa99c6","kind":"booking_cancelled"}', '2026-04-08 20:45:48', '2026-04-08 20:43:42', '2026-04-08 20:45:48');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('bdeb9233-2a8a-497f-81e4-24e34d5da077', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 4, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ee3-2859-7170-8421-b1eb7e9015dc\/payment","booking_id":"019d6ee3-2859-7170-8421-b1eb7e9015dc","kind":"booking_created"}', '2026-04-08 21:02:18', '2026-04-08 20:57:54', '2026-04-08 21:02:18');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('37e8eba9-70f5-4a1e-bd4b-4e8e1771fc9e', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6ee3-2859-7170-8421-b1eb7e9015dc by Adalberto was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6ee3-2859-7170-8421-b1eb7e9015dc","booking_id":"019d6ee3-2859-7170-8421-b1eb7e9015dc","kind":"admin_booking_created"}', '2026-04-08 21:06:09', '2026-04-08 20:57:56', '2026-04-08 21:06:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('297d731d-c283-4b40-8ff0-5e59b12c6829', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 4, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ee3-2859-7170-8421-b1eb7e9015dc","booking_id":"019d6ee3-2859-7170-8421-b1eb7e9015dc","kind":"booking_cancelled"}', '2026-04-08 21:02:18', '2026-04-08 20:58:45', '2026-04-08 21:02:18');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('13d0085c-8a20-45e1-913e-f18627b2118a', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 4, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ee4-4aa2-73af-ba2a-7adeed425049\/payment","booking_id":"019d6ee4-4aa2-73af-ba2a-7adeed425049","kind":"booking_created"}', '2026-04-08 21:02:18', '2026-04-08 20:59:08', '2026-04-08 21:02:18');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('53f63de5-75ff-4045-a01a-1359871c19cf', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6ee4-4aa2-73af-ba2a-7adeed425049 by Adalberto was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6ee4-4aa2-73af-ba2a-7adeed425049","booking_id":"019d6ee4-4aa2-73af-ba2a-7adeed425049","kind":"admin_booking_created"}', '2026-04-08 21:06:09', '2026-04-08 20:59:10', '2026-04-08 21:06:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('76cd3b4c-da8b-4f37-ba7a-8ffec6eb9b12', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 4, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ee4-4aa2-73af-ba2a-7adeed425049","booking_id":"019d6ee4-4aa2-73af-ba2a-7adeed425049","kind":"booking_cancelled"}', '2026-04-08 21:02:18', '2026-04-08 21:02:02', '2026-04-08 21:02:18');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('075bf693-5944-4902-9dc1-5ce67c3ebe99', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 4, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eeb-1d98-736d-a468-29a4f8425f43\/payment","booking_id":"019d6eeb-1d98-736d-a468-29a4f8425f43","kind":"booking_created"}', '2026-04-08 21:07:10', '2026-04-08 21:06:35', '2026-04-08 21:07:10');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('5fe8b303-fd05-4677-b9cb-64fb374bb13e', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6eeb-1d98-736d-a468-29a4f8425f43 by Adalberto was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6eeb-1d98-736d-a468-29a4f8425f43","booking_id":"019d6eeb-1d98-736d-a468-29a4f8425f43","kind":"admin_booking_created"}', '2026-04-08 21:10:42', '2026-04-08 21:06:37', '2026-04-08 21:10:42');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('f386855c-76b6-4f8a-b0d5-00ef565b88d3', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"New booking received","message":"Booking 019d6eeb-1d98-736d-a468-29a4f8425f43 by Adalberto was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6eeb-1d98-736d-a468-29a4f8425f43","booking_id":"019d6eeb-1d98-736d-a468-29a4f8425f43","kind":"hotel_booking_created"}', '2026-04-08 21:11:06', '2026-04-08 21:06:39', '2026-04-08 21:11:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('1e521897-4adb-4ae7-bcfe-78aad699f29d', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 4, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eeb-1d98-736d-a468-29a4f8425f43","booking_id":"019d6eeb-1d98-736d-a468-29a4f8425f43","kind":"booking_cancelled"}', '2026-04-08 21:07:10', '2026-04-08 21:07:01', '2026-04-08 21:07:10');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('2812e552-aa10-434e-8965-96577c1f4373', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 4, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eef-9bb5-703a-bc55-7837fc61e378\/payment","booking_id":"019d6eef-9bb5-703a-bc55-7837fc61e378","kind":"booking_created"}', '2026-04-08 21:19:26', '2026-04-08 21:11:30', '2026-04-08 21:19:26');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('8fb7e20d-d457-486b-8e97-9cc0ac45bc51', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6eef-9bb5-703a-bc55-7837fc61e378 by Adalberto was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6eef-9bb5-703a-bc55-7837fc61e378","booking_id":"019d6eef-9bb5-703a-bc55-7837fc61e378","kind":"admin_booking_created"}', '2026-04-08 21:17:00', '2026-04-08 21:11:32', '2026-04-08 21:17:00');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('6be4878a-6ccd-43f6-9b29-2c0cbd893bea', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"New booking received","message":"Booking 019d6eef-9bb5-703a-bc55-7837fc61e378 by Adalberto was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6eef-9bb5-703a-bc55-7837fc61e378","booking_id":"019d6eef-9bb5-703a-bc55-7837fc61e378","kind":"hotel_booking_created"}', '2026-04-08 21:18:58', '2026-04-08 21:11:34', '2026-04-08 21:18:58');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('d541f518-2fd3-41db-b933-27946b27823c', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 4, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6eef-9bb5-703a-bc55-7837fc61e378","booking_id":"019d6eef-9bb5-703a-bc55-7837fc61e378","kind":"booking_cancelled"}', '2026-04-08 21:19:38', '2026-04-08 21:19:31', '2026-04-08 21:19:38');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('5bb28ad1-f832-49f3-83c3-8d6468b8e6b4', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 4, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ef7-3d04-7259-8cc6-14402adbd85a\/payment","booking_id":"019d6ef7-3d04-7259-8cc6-14402adbd85a","kind":"booking_created"}', '2026-04-08 21:21:01', '2026-04-08 21:19:50', '2026-04-08 21:21:01');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('f69e6179-2d1c-4a04-b78f-7fe1e6dd9bad', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6ef7-3d04-7259-8cc6-14402adbd85a by Adalberto was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6ef7-3d04-7259-8cc6-14402adbd85a","booking_id":"019d6ef7-3d04-7259-8cc6-14402adbd85a","kind":"admin_booking_created"}', '2026-04-08 21:24:50', '2026-04-08 21:19:51', '2026-04-08 21:24:50');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('b3d37291-be71-4ee5-93b7-02340b6cc0fb', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"New booking received","message":"Booking 019d6ef7-3d04-7259-8cc6-14402adbd85a by Adalberto was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6ef7-3d04-7259-8cc6-14402adbd85a","booking_id":"019d6ef7-3d04-7259-8cc6-14402adbd85a","kind":"hotel_booking_created"}', '2026-04-09 13:26:53', '2026-04-08 21:19:54', '2026-04-09 13:26:53');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('36d64f74-a372-4d3a-9855-e30aa74929c7', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 4, '{"title":"Booking cancelled","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 was cancelled.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6ef7-3d04-7259-8cc6-14402adbd85a","booking_id":"019d6ef7-3d04-7259-8cc6-14402adbd85a","kind":"booking_cancelled"}', '2026-04-08 21:21:01', '2026-04-08 21:20:49', '2026-04-08 21:21:01');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('156d3af9-7796-46a1-9d76-056193e22c6a', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 4, '{"title":"Booking created","message":"Your booking for Evento Demo 20260408190350 at Hotel Demo 20260408190350 is ready for payment.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d6f30-0be1-712d-b21a-3e5b067860e9\/payment","booking_id":"019d6f30-0be1-712d-b21a-3e5b067860e9","kind":"booking_created"}', NULL, '2026-04-08 22:21:53', '2026-04-08 22:21:53');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('7df8ebd6-15d0-4155-8006-4ca5cca30c3e', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"New booking created","message":"Booking 019d6f30-0be1-712d-b21a-3e5b067860e9 by Adalberto was created.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d6f30-0be1-712d-b21a-3e5b067860e9","booking_id":"019d6f30-0be1-712d-b21a-3e5b067860e9","kind":"admin_booking_created"}', '2026-04-08 22:34:09', '2026-04-08 22:21:54', '2026-04-08 22:34:09');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('eaa19749-80bd-4cde-97b7-14761025e10d', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"New booking received","message":"Booking 019d6f30-0be1-712d-b21a-3e5b067860e9 by Adalberto was created for Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d6f30-0be1-712d-b21a-3e5b067860e9","booking_id":"019d6f30-0be1-712d-b21a-3e5b067860e9","kind":"hotel_booking_created"}', '2026-04-09 13:26:53', '2026-04-08 22:21:57', '2026-04-09 13:26:53');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('2593f805-fedc-4c6b-b7bb-8f9641a811e5', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Reserva criada","message":"A Sua reserva para Evento Demo 20260408190350 em Hotel Demo 20260408190350 foi criada com sucesso.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d7478-7772-7376-bf8b-5ead0d34aaab\/payment","booking_id":"019d7478-7772-7376-bf8b-5ead0d34aaab","kind":"booking_created"}', '2026-04-09 23:16:56', '2026-04-09 22:59:05', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('e1d3f1be-c83b-44b0-ac2a-4b299c45c6cb', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"Nova Reserva Criada","message":"Reserva 019d7478-7772-7376-bf8b-5ead0d34aaab por Administrador Teste foi feita.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d7478-7772-7376-bf8b-5ead0d34aaab","booking_id":"019d7478-7772-7376-bf8b-5ead0d34aaab","kind":"admin_booking_created"}', '2026-04-09 23:16:56', '2026-04-09 22:59:08', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('1a4ff2fd-05f9-41f6-b4b6-87a7d9c83cab', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"Nova reserva recebida","message":"Reserva 019d7478-7772-7376-bf8b-5ead0d34aaab por Administrador Teste foi criada para Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d7478-7772-7376-bf8b-5ead0d34aaab","booking_id":"019d7478-7772-7376-bf8b-5ead0d34aaab","kind":"hotel_booking_created"}', NULL, '2026-04-09 22:59:11', '2026-04-09 22:59:11');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('c436a801-eefb-4e96-ae3a-9f77a15ddb6b', 'App\Notifications\BookingCancelledNotification', 'App\Models\User', 1, '{"title":"Reserva cancelada","message":"A Sua reserva para Evento Demo 20260408190350 em Hotel Demo 20260408190350 foi cancelada.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d7478-7772-7376-bf8b-5ead0d34aaab","booking_id":"019d7478-7772-7376-bf8b-5ead0d34aaab","kind":"booking_cancelled"}', '2026-04-09 23:16:56', '2026-04-09 22:59:32', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('7700607d-369d-4703-8ad4-ef35adcb52e8', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Reserva criada","message":"A Sua reserva para Evento Demo 20260408190350 em Hotel Demo 20260408190350 foi criada com sucesso.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d7487-f568-7183-bb04-4c19aea6b9bb\/payment","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"booking_created"}', '2026-04-09 23:16:56', '2026-04-09 23:16:00', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('a252276b-f4b9-4d4d-8aa4-f4ca40c3efa8', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"Nova Reserva Criada","message":"Reserva 019d7487-f568-7183-bb04-4c19aea6b9bb por Administrador Teste foi feita.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"admin_booking_created"}', '2026-04-09 23:16:56', '2026-04-09 23:16:03', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('eca2696a-7b17-41f7-bc9c-987aedd076d8', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"Nova reserva recebida","message":"Reserva 019d7487-f568-7183-bb04-4c19aea6b9bb por Administrador Teste foi criada para Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"hotel_booking_created"}', NULL, '2026-04-09 23:16:05', '2026-04-09 23:16:05');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('4e827253-834b-465f-9526-120bbe780a6f', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Evento Demo 20260408190350 em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"payment_confirmed"}', '2026-04-09 23:16:56', '2026-04-09 23:16:34', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('9fe3837d-08fa-4b87-a3a7-38a3b6e75f2d', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d7487-f568-7183-bb04-4c19aea6b9bb por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"admin_booking_paid"}', '2026-04-09 23:16:56', '2026-04-09 23:16:37', '2026-04-09 23:16:56');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('e41e3dc7-8bb1-490d-906a-792ac7471ee7', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Reserva criada","message":"A Sua reserva para Maratona de Gaia em Hotel Demo 20260408190350 foi criada com sucesso.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d772c-014b-700f-bf47-e089dec7f76d\/payment","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"booking_created"}', '2026-04-10 11:43:49', '2026-04-10 11:34:25', '2026-04-10 11:43:49');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('2e73b59e-7093-4230-a39f-4ce7686c7e08', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"Nova Reserva Criada","message":"Reserva 019d772c-014b-700f-bf47-e089dec7f76d por Administrador Teste foi feita.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"admin_booking_created"}', '2026-04-10 11:43:49', '2026-04-10 11:34:29', '2026-04-10 11:43:49');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('77860fff-a581-4775-8049-f6a03e0af1d5', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"Nova reserva recebida","message":"Reserva 019d772c-014b-700f-bf47-e089dec7f76d por Administrador Teste foi criada para Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"hotel_booking_created"}', NULL, '2026-04-10 11:34:30', '2026-04-10 11:34:30');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('dc09871f-a36e-400a-89bc-54b0e952babd', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"payment_confirmed"}', '2026-04-10 11:43:49', '2026-04-10 11:34:59', '2026-04-10 11:43:49');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('b8394e96-22f6-4cd4-a42d-a07fd4271134', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d772c-014b-700f-bf47-e089dec7f76d por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"admin_booking_paid"}', '2026-04-10 11:43:49', '2026-04-10 11:35:02', '2026-04-10 11:43:49');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('7e155d0b-88fa-4ca2-97c3-438cb8bb8dfe', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 18:10:42', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('0bb2814f-9a8a-4f3a-9f95-6a27cff0d806', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d772c-014b-700f-bf47-e089dec7f76d por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 18:10:45', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('4d634a79-cb61-4876-b498-2a5e835c3f43', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 18:17:07', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('3a36be32-8002-4883-8bd7-ff6ef3a86124', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d772c-014b-700f-bf47-e089dec7f76d por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 18:17:10', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('afa5280e-a445-4a73-94dc-9b1382e97422', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Reserva criada","message":"A Sua reserva para Maratona de Gaia em Hotel Demo 20260408190350 foi criada com sucesso.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d78e1-83c6-71a9-9147-01ff021cb16c\/payment","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"booking_created"}', '2026-04-11 11:05:06', '2026-04-10 19:32:18', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('471309bd-1c78-4aae-8635-dba3da3b9282', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"Nova Reserva Criada","message":"Reserva 019d78e1-83c6-71a9-9147-01ff021cb16c por Administrador Teste foi feita.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d78e1-83c6-71a9-9147-01ff021cb16c","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"admin_booking_created"}', '2026-04-11 11:05:06', '2026-04-10 19:32:21', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('53f5614e-e73e-4e15-9170-8332d6896cd2', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"Nova reserva recebida","message":"Reserva 019d78e1-83c6-71a9-9147-01ff021cb16c por Administrador Teste foi criada para Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d78e1-83c6-71a9-9147-01ff021cb16c","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"hotel_booking_created"}', NULL, '2026-04-10 19:32:23', '2026-04-10 19:32:23');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('0723f93d-8b95-4794-8021-90510ad58f41', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d78e1-83c6-71a9-9147-01ff021cb16c","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 19:37:56', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('972aeb7c-888b-45e2-9312-6111f91bba8d', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d78e1-83c6-71a9-9147-01ff021cb16c por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d78e1-83c6-71a9-9147-01ff021cb16c","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 19:37:59', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('134e7526-c12c-4a63-96c1-92db0b52f3a3', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 19:42:57', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('d2a8e684-5d69-44ae-997e-30f98eca2894', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d7487-f568-7183-bb04-4c19aea6b9bb por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 19:43:00', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('0973e798-64a4-4827-bf9c-1b447b992d74', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d78e1-83c6-71a9-9147-01ff021cb16c","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 19:46:05', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('55ce3c6d-b9d8-4c78-9551-1e8f8f54e8a5', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d78e1-83c6-71a9-9147-01ff021cb16c por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d78e1-83c6-71a9-9147-01ff021cb16c","booking_id":"019d78e1-83c6-71a9-9147-01ff021cb16c","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 19:46:08', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('e08b1720-c76e-4dc5-a293-e17cb6a04196', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 19:46:52', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('d3f9d593-145a-48cb-b4a9-3c2546d17838', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d772c-014b-700f-bf47-e089dec7f76d por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d772c-014b-700f-bf47-e089dec7f76d","booking_id":"019d772c-014b-700f-bf47-e089dec7f76d","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 19:46:55', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('391dc667-7819-48b7-bcb8-f733ebec17e5', 'App\Notifications\BookingCreatedNotification', 'App\Models\User', 1, '{"title":"Reserva criada","message":"A Sua reserva para Maratona de Gaia em Hotel Demo 20260408190350 foi criada com sucesso.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d78f0-08b9-70df-91c1-69222bfbe6e9\/payment","booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","kind":"booking_created"}', '2026-04-11 11:05:06', '2026-04-10 19:48:10', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('37248344-24cb-45af-8037-9b378c8d9194', 'App\Notifications\AdminBookingCreatedNotification', 'App\Models\User', 1, '{"title":"Nova Reserva Criada","message":"Reserva 019d78f0-08b9-70df-91c1-69222bfbe6e9 por Administrador Teste foi feita.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d78f0-08b9-70df-91c1-69222bfbe6e9","booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","kind":"admin_booking_created"}', '2026-04-11 11:05:06', '2026-04-10 19:48:12', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('12cbce8a-e576-4732-a433-a1a0e4b15bd8', 'App\Notifications\HotelBookingCreatedNotification', 'App\Models\User', 3, '{"title":"Nova reserva recebida","message":"Reserva 019d78f0-08b9-70df-91c1-69222bfbe6e9 por Administrador Teste foi criada para Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/hotel\/bookings?search=019d78f0-08b9-70df-91c1-69222bfbe6e9","booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","kind":"hotel_booking_created"}', NULL, '2026-04-10 19:48:14', '2026-04-10 19:48:14');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('e2132baa-9238-4b96-bfa5-ae609da5b499', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d78f0-08b9-70df-91c1-69222bfbe6e9","booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","kind":"payment_confirmed"}', '2026-04-11 11:05:06', '2026-04-10 19:49:00', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('5eab8697-2942-432a-96d8-857098af712d', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d78f0-08b9-70df-91c1-69222bfbe6e9 por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d78f0-08b9-70df-91c1-69222bfbe6e9","booking_id":"019d78f0-08b9-70df-91c1-69222bfbe6e9","kind":"admin_booking_paid"}', '2026-04-11 11:05:06', '2026-04-10 19:49:03', '2026-04-11 11:05:06');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('1e462a23-b7cc-475e-aa1c-2c815e5f7980', 'App\Notifications\PaymentConfirmedNotification', 'App\Models\User', 1, '{"title":"Pagamento confirmado","message":"Pagamento confirmado para Maratona de Gaia em Hotel Demo 20260408190350.","url":"http:\/\/127.0.0.1:8000\/dashboard\/bookings\/019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"payment_confirmed"}', '2026-04-11 11:21:54', '2026-04-11 11:21:36', '2026-04-11 11:21:54');
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES ('bdd2f2ee-8bea-48be-b1bf-acf734db99d1', 'App\Notifications\AdminBookingConfirmedNotification', 'App\Models\User', 1, '{"title":"Reserva Paga","message":"A Reserva 019d7487-f568-7183-bb04-4c19aea6b9bb por Administrador Teste foi paga.","url":"http:\/\/127.0.0.1:8000\/admin\/bookings?search=019d7487-f568-7183-bb04-4c19aea6b9bb","booking_id":"019d7487-f568-7183-bb04-4c19aea6b9bb","kind":"admin_booking_paid"}', '2026-04-11 11:21:54', '2026-04-11 11:21:39', '2026-04-11 11:21:54');

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `payment_webhook_events`;
CREATE TABLE `payment_webhook_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider` VARCHAR(255) NOT NULL,
  `event_id` VARCHAR(255) NOT NULL,
  `event_type` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `processed_at` DATETIME NOT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `payment_webhook_events_provider_event_id_unique` ON `payment_webhook_events` (`provider`, `event_id`);

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` VARCHAR(255) NOT NULL,
  `provider` VARCHAR(255) NOT NULL DEFAULT 'STRIPE_MOCK',
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'EUR',
  `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `due_date` DATE NOT NULL,
  `paid_at` DATETIME NULL,
  `provider_reference` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `installment_type` VARCHAR(255) NOT NULL DEFAULT 'FULL',
  `deposit_amount` DECIMAL(12,2) NULL,
  `balance_amount` DECIMAL(12,2) NULL,
  `deposit_due_date` DATE NULL,
  `balance_due_date` DATE NULL,
  `deposit_paid_at` DATETIME NULL,
  `balance_paid_at` DATETIME NULL,
  `deposit_provider_reference` VARCHAR(255) NULL,
  `balance_provider_reference` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `payments` (`id`, `booking_id`, `provider`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `provider_reference`, `created_at`, `updated_at`, `installment_type`, `deposit_amount`, `balance_amount`, `deposit_due_date`, `balance_due_date`, `deposit_paid_at`, `balance_paid_at`, `deposit_provider_reference`, `balance_provider_reference`) VALUES (9, '019d6f30-0be1-712d-b21a-3e5b067860e9', 'STRIPE', 25, 'EUR', 'PENDING', '2026-04-10', NULL, NULL, '2026-04-08 22:21:52', '2026-04-10 18:14:27', 'DEPOSIT', 25, 3650, '2026-04-10', '2026-04-05', NULL, NULL, NULL, NULL);
INSERT INTO `payments` (`id`, `booking_id`, `provider`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `provider_reference`, `created_at`, `updated_at`, `installment_type`, `deposit_amount`, `balance_amount`, `deposit_due_date`, `balance_due_date`, `deposit_paid_at`, `balance_paid_at`, `deposit_provider_reference`, `balance_provider_reference`) VALUES (11, '019d7487-f568-7183-bb04-4c19aea6b9bb', 'STRIPE', 1690, 'EUR', 'PAID', '2026-04-07 00:00:00', '2026-04-11 11:21:34', 'pi_3TKzZM9Fe3R1FMiH0L222JMi', '2026-04-09 23:16:00', '2026-04-11 11:21:34', 'BALANCE', 25, 1690, '2026-04-10', '2026-04-07', '2026-04-10 19:38:30', '2026-04-11 11:21:34', 'pi_3TKksc9Fe3R1FMiH0R3DtPuO', 'pi_3TKzZM9Fe3R1FMiH0L222JMi');
INSERT INTO `payments` (`id`, `booking_id`, `provider`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `provider_reference`, `created_at`, `updated_at`, `installment_type`, `deposit_amount`, `balance_amount`, `deposit_due_date`, `balance_due_date`, `deposit_paid_at`, `balance_paid_at`, `deposit_provider_reference`, `balance_provider_reference`) VALUES (12, '019d772c-014b-700f-bf47-e089dec7f76d', 'STRIPE', 1690, 'EUR', 'PAID', '2026-04-07 00:00:00', '2026-04-10 19:46:52', 'pi_3TKl0h9Fe3R1FMiH1SmqPmrO', '2026-04-10 11:34:25', '2026-04-10 19:46:52', 'BALANCE', 25, 1690, '2026-04-10', '2026-04-07', '2026-04-10 18:15:29', '2026-04-10 19:46:52', 'pi_3TKja69Fe3R1FMiH1pq1naFm', 'pi_3TKl0h9Fe3R1FMiH1SmqPmrO');
INSERT INTO `payments` (`id`, `booking_id`, `provider`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `provider_reference`, `created_at`, `updated_at`, `installment_type`, `deposit_amount`, `balance_amount`, `deposit_due_date`, `balance_due_date`, `deposit_paid_at`, `balance_paid_at`, `deposit_provider_reference`, `balance_provider_reference`) VALUES (13, '019d78e1-83c6-71a9-9147-01ff021cb16c', 'STRIPE', 1690, 'EUR', 'PAID', '2026-04-07 00:00:00', '2026-04-10 19:46:05', 'pi_3TKkzw9Fe3R1FMiH08Jhy9OU', '2026-04-10 19:32:18', '2026-04-10 19:46:05', 'BALANCE', 25, 1690, '2026-04-10 00:00:00', '2026-04-07 00:00:00', '2026-04-10 19:33:11', '2026-04-10 19:46:05', 'pi_3TKknR9Fe3R1FMiH1wYknOkj', 'pi_3TKkzw9Fe3R1FMiH08Jhy9OU');
INSERT INTO `payments` (`id`, `booking_id`, `provider`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `provider_reference`, `created_at`, `updated_at`, `installment_type`, `deposit_amount`, `balance_amount`, `deposit_due_date`, `balance_due_date`, `deposit_paid_at`, `balance_paid_at`, `deposit_provider_reference`, `balance_provider_reference`) VALUES (14, '019d78f0-08b9-70df-91c1-69222bfbe6e9', 'STRIPE', 1690, 'EUR', 'PAID', '2026-04-07 00:00:00', '2026-04-10 19:49:00', 'pi_3TKl2h9Fe3R1FMiH12YqsXne', '2026-04-10 19:48:10', '2026-04-10 19:49:00', 'BALANCE', 25, 1690, '2026-04-10 00:00:00', '2026-04-07 00:00:00', '2026-04-10 19:48:35', '2026-04-10 19:49:00', 'pi_3TKl2N9Fe3R1FMiH0MYSOtOp', 'pi_3TKl2h9Fe3R1FMiH12YqsXne');

DROP TABLE IF EXISTS `push_subscriptions`;
CREATE TABLE `push_subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `endpoint` LONGTEXT NOT NULL,
  `public_key` VARCHAR(255) NOT NULL,
  `auth_token` VARCHAR(255) NOT NULL,
  `content_encoding` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `push_subscriptions_user_id_endpoint_unique` ON `push_subscriptions` (`user_id`, `endpoint`);

INSERT INTO `push_subscriptions` (`id`, `user_id`, `endpoint`, `public_key`, `auth_token`, `content_encoding`, `created_at`, `updated_at`) VALUES (4, 1, 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABp1sYTPtmRG0z7IGZU950yzCA_Br7_zPSmb6DwiAhQR8EdumClhoiyvcJG0yJ1yo_W7IjA7e9pu4T5KA5R0sxVH7ET-cc2hB0c087bDSfpbH81sFZ3HmsH_--3d3CxrWvYZarnNo1Tx_Ttbl71gUjrKTrA6WrrVTNMEccHqybKaYBqAhM', 'BEng_Xo_z3E0_74ueGF4sl0TKmqPVacfOlQ1iVn6E5ZQd--02RiVK0eR95Oz4MCFbsaMc_FjD96p0JGYbXBofoo', 'kD0dyLVMqkrAVDwOsQ7oxg', NULL, '2026-04-08 21:18:12', '2026-04-08 21:18:12');
INSERT INTO `push_subscriptions` (`id`, `user_id`, `endpoint`, `public_key`, `auth_token`, `content_encoding`, `created_at`, `updated_at`) VALUES (6, 3, 'https://fcm.googleapis.com/fcm/send/eBm4MomDXNs:APA91bHbETXixW9zTrwT10psiKuWlE16YFuGhBkscxAbo3s-_GtMsDpwvt3Z5ekZtU1OxPpzSH-XCvuguFWWgRUUrxSAQcCCyVY9pcajDPhbfCnWT1o_05e9aguh-R5KfCYv5uzo4XY2', 'BEKEK0UjHV4_ay-8K09HWpM3W-3dMIkem6VG_QnKoNKUT-vFl-dUJ-VBcq_zcRx-kyy8xBj0Rsz0Zsi5wrDJtOc', 'JSFuKPMufvawiQwKvfc4PQ', NULL, '2026-04-08 21:19:18', '2026-04-08 21:19:18');
INSERT INTO `push_subscriptions` (`id`, `user_id`, `endpoint`, `public_key`, `auth_token`, `content_encoding`, `created_at`, `updated_at`) VALUES (7, 3, 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABp1sYTPtmRG0z7IGZU950yzCA_Br7_zPSmb6DwiAhQR8EdumClhoiyvcJG0yJ1yo_W7IjA7e9pu4T5KA5R0sxVH7ET-cc2hB0c087bDSfpbH81sFZ3HmsH_--3d3CxrWvYZarnNo1Tx_Ttbl71gUjrKTrA6WrrVTNMEccHqybKaYBqAhM', 'BEng_Xo_z3E0_74ueGF4sl0TKmqPVacfOlQ1iVn6E5ZQd--02RiVK0eR95Oz4MCFbsaMc_FjD96p0JGYbXBofoo', 'kD0dyLVMqkrAVDwOsQ7oxg', NULL, '2026-04-08 22:22:30', '2026-04-08 22:22:30');

DROP TABLE IF EXISTS `rates`;
CREATE TABLE `rates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hotel_id` INT NOT NULL,
  `room_type_id` INT NOT NULL,
  `meal_plan_id` INT NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL,
  `sale_price` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'EUR',
  `stock` INT NOT NULL,
  `cancellation_deadline` DATETIME NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `cancellation_policy` VARCHAR(255) NOT NULL DEFAULT 'FREE_CANCELLATION',
  `deposit_percentage` DECIMAL(12,2) NULL,
  `balance_due_days_before_checkin` INT NULL,
  `deposit_amount` DECIMAL(12,2) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `rates_unique_combo` ON `rates` (`hotel_id`, `room_type_id`, `meal_plan_id`);

INSERT INTO `rates` (`id`, `hotel_id`, `room_type_id`, `meal_plan_id`, `cost_price`, `sale_price`, `currency`, `stock`, `cancellation_deadline`, `is_active`, `created_at`, `updated_at`, `cancellation_policy`, `deposit_percentage`, `balance_due_days_before_checkin`, `deposit_amount`) VALUES (1, 1, 1, 1, 90, 140, 'EUR', 20, '2026-05-03 00:00:00', 1, '2026-04-08 19:03:50', '2026-04-10 18:03:49', 'DEPOSIT_NON_REFUNDABLE', NULL, 4, 10);
INSERT INTO `rates` (`id`, `hotel_id`, `room_type_id`, `meal_plan_id`, `cost_price`, `sale_price`, `currency`, `stock`, `cancellation_deadline`, `is_active`, `created_at`, `updated_at`, `cancellation_policy`, `deposit_percentage`, `balance_due_days_before_checkin`, `deposit_amount`) VALUES (2, 1, 2, 2, 120, 185, 'EUR', 18, '2026-05-03 00:00:00', 1, '2026-04-08 19:03:50', '2026-04-08 19:03:50', 'FREE_CANCELLATION', NULL, NULL, NULL);
INSERT INTO `rates` (`id`, `hotel_id`, `room_type_id`, `meal_plan_id`, `cost_price`, `sale_price`, `currency`, `stock`, `cancellation_deadline`, `is_active`, `created_at`, `updated_at`, `cancellation_policy`, `deposit_percentage`, `balance_due_days_before_checkin`, `deposit_amount`) VALUES (3, 1, 3, 3, 160, 245, 'EUR', 7, '2026-05-03 00:00:00', 1, '2026-04-08 19:03:50', '2026-04-10 19:48:10', 'DEPOSIT_NON_REFUNDABLE', NULL, 3, 25);

DROP TABLE IF EXISTS `room_types`;
CREATE TABLE `room_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `max_guests` INT NOT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `room_types_name_unique` ON `room_types` (`name`);

INSERT INTO `room_types` (`id`, `name`, `max_guests`, `created_at`, `updated_at`) VALUES (1, 'single', 1, '2026-04-08 19:03:50', '2026-04-08 19:03:50');
INSERT INTO `room_types` (`id`, `name`, `max_guests`, `created_at`, `updated_at`) VALUES (2, 'double', 2, '2026-04-08 19:03:50', '2026-04-08 19:03:50');
INSERT INTO `room_types` (`id`, `name`, `max_guests`, `created_at`, `updated_at`) VALUES (3, 'triple', 3, '2026-04-08 19:03:50', '2026-04-08 19:03:50');

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` INT NULL,
  `ip_address` VARCHAR(255) NULL,
  `user_agent` LONGTEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `sessions_last_activity_index` ON `sessions` (`last_activity`);
CREATE INDEX `sessions_user_id_index` ON `sessions` (`user_id`);

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('xi1y9UZKC4iagByNNxMcVtwkk9NIgLdjhYtIZDfu', 1, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiNkhFWGRQYjZ0eXQ3UEV0RnRCUGR1eGMxU2NESHNETWg2T2x2emkyUyI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjIxOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1775912744);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('3qQrR8AEsINx9n7We02lg1xrD8DsgUybDtQUn7LH', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWGJkNG5LcjhabUhtcDhDM1dCdXN1NUJZZjV2U3NkSkgxQWRKcGNGaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1775911760);

DROP TABLE IF EXISTS `supplier_payments`;
CREATE TABLE `supplier_payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `booking_id` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'EUR',
  `due_date` DATE NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `paid_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `supplier_payments` (`id`, `booking_id`, `amount`, `currency`, `due_date`, `status`, `paid_at`, `created_at`, `updated_at`) VALUES (9, '019d6f30-0be1-712d-b21a-3e5b067860e9', 2400, 'EUR', '2026-04-23 00:00:00', 'PENDING', NULL, '2026-04-08 22:21:52', '2026-04-08 22:21:52');
INSERT INTO `supplier_payments` (`id`, `booking_id`, `amount`, `currency`, `due_date`, `status`, `paid_at`, `created_at`, `updated_at`) VALUES (11, '019d7487-f568-7183-bb04-4c19aea6b9bb', 1120, 'EUR', '2026-04-24 00:00:00', 'PENDING', NULL, '2026-04-09 23:16:00', '2026-04-09 23:16:00');
INSERT INTO `supplier_payments` (`id`, `booking_id`, `amount`, `currency`, `due_date`, `status`, `paid_at`, `created_at`, `updated_at`) VALUES (12, '019d772c-014b-700f-bf47-e089dec7f76d', 1120, 'EUR', '2026-04-25 00:00:00', 'PENDING', NULL, '2026-04-10 11:34:25', '2026-04-10 11:34:25');
INSERT INTO `supplier_payments` (`id`, `booking_id`, `amount`, `currency`, `due_date`, `status`, `paid_at`, `created_at`, `updated_at`) VALUES (13, '019d78e1-83c6-71a9-9147-01ff021cb16c', 1120, 'EUR', '2026-04-25 00:00:00', 'PENDING', NULL, '2026-04-10 19:32:18', '2026-04-10 19:32:18');
INSERT INTO `supplier_payments` (`id`, `booking_id`, `amount`, `currency`, `due_date`, `status`, `paid_at`, `created_at`, `updated_at`) VALUES (14, '019d78f0-08b9-70df-91c1-69222bfbe6e9', 1120, 'EUR', '2026-04-25 00:00:00', 'PENDING', NULL, '2026-04-10 19:48:10', '2026-04-10 19:48:10');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `email_verified_at` DATETIME NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL DEFAULT 'CLIENT',
  `remember_token` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `hotel_id` INT NULL,
  `nationality` VARCHAR(255) NULL,
  `nif` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`, `hotel_id`, `nationality`, `nif`) VALUES (1, 'Administrador Teste', 'admin@admin.com', NULL, '$2y$12$dR0PkdzlnCUDkiKKikWnbOkIhtcJDlz95n4bt9IjGIV96ykIONscu', 'ADMIN', NULL, '2026-04-08 14:19:02', '2026-04-10 11:19:41', NULL, 'Portugal', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`, `hotel_id`, `nationality`, `nif`) VALUES (3, 'Gestor Hotel 20260408190350', 'hotel.demo.20260408190350@opteventos.test', NULL, '$2y$12$GpCdT08e6fWCG9O.b7tMVOF6.aSfgm/Hb8Y23dpAJA/.GbSVwOj4C', 'HOTEL', '51pQ4SY4BG28fsAxXzhdhLhY76eASK30lWBKetN8xzIkqrp6B7iBkNtOBCIH', '2026-04-08 19:03:51', '2026-04-08 19:03:51', 1, NULL, NULL);
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`, `hotel_id`, `nationality`, `nif`) VALUES (4, 'Adalberto', 'adalberto.j.s.p@gmail.com', NULL, '$2y$12$K0vtDbvbr.O6O4ZE5OXEpeNNMUvIA/6hfAXh.jSXMFjB5opGTtPW6', 'CLIENT', NULL, '2026-04-08 20:57:20', '2026-04-08 20:57:20', NULL, NULL, NULL);

-- Foreign keys
ALTER TABLE `audit_logs` ADD CONSTRAINT `fk_audit_logs_user_id_0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_rate_id_0` FOREIGN KEY (`rate_id`) REFERENCES `rates` (`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_hotel_id_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_event_id_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `bookings` ADD CONSTRAINT `fk_bookings_user_id_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `hotels` ADD CONSTRAINT `fk_hotels_event_id_0` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoices_payment_id_0` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoices_booking_id_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `payments` ADD CONSTRAINT `fk_payments_booking_id_0` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `fk_push_subscriptions_user_id_0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `rates` ADD CONSTRAINT `fk_rates_meal_plan_id_0` FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans` (`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `rates` ADD CONSTRAINT `fk_rates_room_type_id_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `rates` ADD CONSTRAINT `fk_rates_hotel_id_2` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `supplier_payments` ADD CONSTRAINT `fk_supplier_payments_booking_id_0` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `users` ADD CONSTRAINT `fk_users_hotel_id_0` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

SET FOREIGN_KEY_CHECKS=1;
