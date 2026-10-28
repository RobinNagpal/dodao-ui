-- Remove 624 XETRA ETFs with under €100M in assets and no report.
--
-- Each ETF has its own DELETE below, pinned to its id, exchange 'XETRA' and ticker. The list was taken
-- on 2026-10-25 from a read-only query on prod: XETRA funds whose AUM (screener "Assets", euros) is below
-- 100,000,000, with no report of any kind, no favourite, note, credit spend, generation request or
-- scenario link, not another fund's alternative listing, and not owning one (QREM keeps QREX).
--
-- How to run (never by hand against production):
--   1. Review this file in the PR and merge it.
--   2. Take an RDS snapshot of v2-api-prod-db.
--   3. GitHub Actions → "insights-ui: apply data SQL" →
--      sql_file=insights-ui/prisma/data-sql/etfs/20261025-remove-small-unreported-xetra-etfs.sql, dry_run=true
--      (runs everything, prints the counts, then ROLLBACK).
--   4. Re-run with dry_run=false to COMMIT.
--   5. Flush /etfs/* from CloudFront so cached pages of the removed funds stop being served.
--
-- Safety (all in one transaction; any failed check raises and nothing is deleted):
--   * The tables that point at ETFs are locked (SHARE mode) for the few seconds this runs, so nothing
--     can start referencing a listed ETF between the checks and the deletes.
--   * Before deleting, every listed ETF must still exist with that id, exchange and ticker, and still
--     have no report and nothing pointing at it. Otherwise the script stops and names the ETF.
--   * Every removed row (and its financial, analyzer, price-history and MOR rows) is copied to the
--     etf_archive schema first (etf_archive.*_20261025).
--   * Afterwards every listed ETF must be gone and XETRA must have exactly 624 fewer rows.
-- Running it a second time fails at the checks (the ETFs are gone), so it cannot delete anything else.

BEGIN;

SET LOCAL lock_timeout = '10s';
LOCK TABLE "favourite_etfs", "etf_notes", "etf_generation_requests", "report_spends", "etf_scenario_etf_links" IN SHARE MODE;

-- The 624 ETFs (same list as the DELETEs below).
CREATE TEMP TABLE "_etf_delete_list" ("id" text PRIMARY KEY, "symbol" text NOT NULL UNIQUE) ON COMMIT DROP;
INSERT INTO "_etf_delete_list" ("id", "symbol") VALUES
  ('366e7142-b83b-4f5d-a7d2-1dc2455580ff', 'DGXU'),
  ('b3c49e8d-6440-4084-8ca0-7b29241ed3bd', 'DOME'),
  ('dc7b78a1-1c1b-4f70-aea8-2162bd158493', 'DRAM'),
  ('c78880d3-db57-4029-9620-582dd653eeb8', 'DRON'),
  ('52f8f06b-f3ea-4ee6-ad9c-99193c998c17', 'DTNE'),
  ('b1f03687-7e83-4b0e-9233-53b0a4a04c24', 'DXSC'),
  ('30cd2734-55cb-4399-b207-6d931457a7f9', 'DXSG'),
  ('f17a1ebc-fc3c-4ac0-93cc-9dd20911b561', 'DXSK'),
  ('6a60f7ff-d652-4e3e-b584-6f54f85ee72a', 'DXSL'),
  ('4b29c342-de8d-40e1-a100-083dbb2204ea', 'DXSP'),
  ('ee2a300e-c5da-4cdb-b476-269fc9211be4', 'DYLD'),
  ('23532fb1-0105-4ed5-b482-a289f12f4417', 'DZMW'),
  ('3a90bf2a-4087-4cba-9d35-5fff46fa4342', 'E0UA'),
  ('a31fe285-4a8a-4856-bdc2-86000ccf215e', 'E15H'),
  ('4615ee69-db13-4e15-bee1-94dbf858bf24', 'E6BR'),
  ('9e761b18-4f91-427b-af6c-a1a469b57855', 'E903'),
  ('90d81ccf-c66c-4833-86ab-da4805b81e30', 'E907'),
  ('cbe23d98-9db1-45c9-8b12-58c6e15a76c1', 'E908'),
  ('6daca3c1-cd56-4d47-b53c-4605ff127ec6', 'ECLM'),
  ('a58f682a-12d3-4e3a-b2f4-b12297320148', 'ECMA'),
  ('a72013e9-a6c6-43a4-aa99-9cf15e3de97b', 'ECMD'),
  ('8b488abc-5b4c-457b-998b-eadcb67a1c22', 'ECMF'),
  ('b787a580-455d-40ec-8215-0abc80ac06a9', 'ED3F'),
  ('6f4d4304-5db9-492c-9023-ab4ddf946f69', 'EDE0'),
  ('600b8d42-e23a-47c9-a850-5443d8f2e7af', 'EDE2'),
  ('37d49477-5109-407c-a493-097dc3db8c47', 'EDEF'),
  ('675409e8-3fae-47a7-90d9-2164016b9dd8', 'EDEJ'),
  ('26522090-60aa-4511-9e04-c6c19831bbec', 'EDEL'),
  ('2d18f255-64cf-4a8c-b1a8-d408aa60891c', 'EDEM'),
  ('d58460d3-f405-4b74-aa70-501ddf041705', 'EDEN'),
  ('4c2df9f5-0b35-4290-a070-f330e13bfb00', 'EDEP'),
  ('3380e33d-031e-4516-b1b4-68abeed45778', 'EDEU'),
  ('a7ac69e0-9b11-4eb8-ab9b-c65460c36568', 'EDEY'),
  ('6c5b167c-7ad0-4591-b1f0-6cc686659d91', 'EDEZ'),
  ('506a83ab-87c4-4d8c-b7dd-cf5c3e3ff210', 'EEA1'),
  ('86865f0a-74a9-408b-a9fa-4a2eb26e85e7', 'EEAA'),
  ('da564bb3-9b7a-45d2-a339-fb932b5283d0', 'EEAB'),
  ('4ffe3dc2-c563-40f4-bd1a-d12c5c648678', 'EEAG'),
  ('80ab9056-a56e-4cfd-a0bc-71e22aec7c6f', 'EEAK'),
  ('39d96cb7-8428-4dd0-b8d2-6ee4d6c098fd', 'EEAM'),
  ('5b02785f-40dc-4237-ad22-7faa3cf00365', 'EEAP'),
  ('69fd8a83-b916-4d0f-b35c-3ad1eeddbfee', 'EEAS'),
  ('42ed5108-eccb-46b7-8d09-172fcc11828a', 'EEAT'),
  ('48629817-1b72-4818-8cc6-1ec5ac9258f7', 'EEAU'),
  ('d5e8c4b0-c5f8-4460-b335-69cc5e8a3b15', 'EEAV'),
  ('51dc21f4-5d24-4fc7-b5b0-8a7a0a704b50', 'EEAY'),
  ('50dd00c7-3a93-4d20-868f-f590277a10c3', 'EEPG'),
  ('ee2aa1a1-5b75-48f4-b0a9-ea9b465c3590', 'EGRE'),
  ('81161201-0c44-4836-9d08-69a9be39ca47', 'EGV1'),
  ('e2649be3-7bdb-474b-a2c2-189f1f94e02a', 'EGV3'),
  ('8daf86a5-7101-46aa-adcf-1c93c1beb29d', 'EGV5'),
  ('e0388402-ad0f-4ef5-922c-321d3e165277', 'EGV7'),
  ('e9a286f8-6e19-4353-bfc1-f0d0efcfe3f9', 'EGVD'),
  ('9ccd6a48-ebd4-4884-b889-5b028022baab', 'EHLT'),
  ('f586c148-a6ae-4458-b53f-263136a22263', 'EIBB'),
  ('51a86314-ed1a-48a8-b6e1-c10e3567b624', 'EIBX'),
  ('6c42c223-eadf-468b-80a7-f388c93b21a1', 'EIGA'),
  ('2418550b-fed2-46d0-9138-e65f3615ab8e', 'EKLD'),
  ('7a9286d6-f9a9-4504-89f5-f8c4f092de46', 'EKUS'),
  ('dea6ce34-b8bf-4990-9328-570478aed5ae', 'EL41'),
  ('4dd100af-ca64-4b3c-950d-e3ed4111a1e0', 'EL43'),
  ('9a768e0b-4852-438a-8b7f-1d0b6bcb0090', 'EL44'),
  ('87f837a1-2125-41a9-b22d-9b9363ef0cd4', 'EL46'),
  ('a522fec6-bfb6-4f4b-98eb-cf67d1a65048', 'EL48'),
  ('8b5d3f00-3b72-4b7c-af86-924556d94884', 'EL4D'),
  ('7cda01c7-d428-4c88-ae81-69e430bf78a2', 'EL4E'),
  ('d2e1ffe8-bb82-4a81-bed4-1616a52086f8', 'EL4L'),
  ('bba2e974-32aa-4c38-8fa4-68fc799a4f19', 'EL4N'),
  ('43ba78b9-5532-465e-ac8e-c1faa7605156', 'EL4P'),
  ('0714f183-6b0f-4c35-bc9e-8e80cd6dfae7', 'EL4R'),
  ('78eed931-dc80-4396-843a-512a3a9ed526', 'EL4T'),
  ('09132b34-3858-4e55-a8f1-ae25f5b60a42', 'EL4V'),
  ('9e6ed0a7-26ae-4c65-8ade-1f779e7a7521', 'ELF0'),
  ('7d0fb359-76f8-4877-889a-14db624a4f73', 'ELFD'),
  ('0d2c7c4e-4f77-44df-8eeb-a93b7b8ed811', 'ELFF'),
  ('54d7ded2-1671-40a6-acae-a73dc06aee43', 'EMGM'),
  ('15fbed0c-e866-4680-abd6-3f4b9da073b4', 'EMSB'),
  ('7be70508-e329-4e34-98d9-a1450b5a7586', 'ENTR'),
  ('3dfd0b98-0454-4a4e-be98-f2ffc1f71ab8', 'EQQJ'),
  ('1395daa6-ae96-4e7c-b6a0-16afb4c9799b', 'ES6Y'),
  ('7a4b8505-53fd-47df-8007-45dc68b2ee77', 'ESAA'),
  ('4a8d19a8-0664-493a-844b-c3328350421b', 'ESAB'),
  ('335af519-8e03-40f8-806c-6ef6bca44015', 'ESAC'),
  ('737986dd-497c-4454-99ee-7b47e56d032b', 'ESAD'),
  ('0cfd68a9-094c-4876-a8c4-4ce85fa1ae0d', 'ESAE'),
  ('8dc98096-ec69-483e-8880-76d31c6bc83f', 'ESAG'),
  ('611d393c-ba3a-4b91-b76e-bae7ef21890a', 'ESAH'),
  ('76fe7123-e2b5-4b5c-8f51-6cf2c22dca5a', 'ESAI'),
  ('be626050-6a22-4979-b7e2-88558c2c8795', 'ESAJ'),
  ('7cbe1bb6-b738-4251-bb96-25afbb039ba0', 'ESAK'),
  ('1802be31-0f6b-4eea-8f16-ea5f5dc4a7c2', 'ESAL'),
  ('ebadc77f-a09c-4541-afcd-9c3d79b3baa4', 'ESAM'),
  ('89e5e79e-1ef1-40e1-adb4-232ae5d7ad5c', 'ESAQ'),
  ('d481b111-c50b-49be-b2ed-960ebdf6e9f1', 'ESAR'),
  ('5692c8f8-1b78-431a-bae5-b2311938f5af', 'ESGJ'),
  ('7c76bce7-12d5-4caa-9057-6259de40063a', 'ESGX'),
  ('08ccb72b-97c2-472e-b269-1d186c612531', 'ESRI'),
  ('0904b510-3b94-46c1-adbe-7eb5f3160778', 'ESTA'),
  ('6579c6a1-6fce-4e89-bf4e-fa4c81d9811a', 'ESTD'),
  ('b084a1e1-c6ee-41bb-b703-fc2d0dd568a5', 'ESUF'),
  ('4d20e9bd-258d-4127-8310-d905c1fd149e', 'ETLI'),
  ('54914f63-3c07-4fd8-8223-c8ae40c8c471', 'EU03'),
  ('ac05017c-c47f-4303-80ab-a84b111045d9', 'EUAI'),
  ('2a6c1de9-25be-4226-a163-6d7e87a9f5de', 'EUEB'),
  ('3a2597d5-1670-4e6a-aa30-5943d8b0945b', 'EUFG'),
  ('8f41e980-0fb4-4954-89c9-2e91d2b5b0ee', 'EUGV'),
  ('a2936f3b-0658-42b0-b46b-7416bc3749f3', 'EUPB'),
  ('1b280575-56fa-4732-ac44-d0b4c3039ca5', 'EUPD'),
  ('17705bc1-76ef-45e2-9220-ba7c0a3e088c', 'EUPF'),
  ('3e871a07-081a-42fb-aec0-29da36fe1faf', 'EUTA'),
  ('e5be6b8a-c872-4dff-aae0-c3cc69b8eb67', 'EUTD'),
  ('608c85f5-f2b9-423a-be1a-feb2577c85e4', 'EUVL'),
  ('0a0405bf-068a-41e7-9f88-d93cd0950f54', 'EWGC'),
  ('85bd93e7-072f-41d9-a6bc-9d48505e3d03', 'EWRD'),
  ('af3fdcc9-67bc-4e6c-a861-b73e6b3a2ea4', 'EXH2'),
  ('4792854d-3519-4ab1-bb7c-97539a6c218e', 'EXH6'),
  ('e1c3aafd-35e9-49c2-aab2-6c8baacbebd9', 'EXH8'),
  ('89f19448-69ac-4245-84d4-7d5c77277d36', 'EXHG'),
  ('167316ac-fd38-4c9b-bbd2-2c152b572a17', 'EXI5'),
  ('19c0d8ec-69ab-43d4-999b-286b512fdb3b', 'EXIB'),
  ('e4eb1af1-d963-4187-86c8-b6b94e74ebaa', 'EXIC'),
  ('0bd099a5-5c37-42d7-bb34-043c39daf2ed', 'EXID'),
  ('329c717b-fc24-45ca-a311-34edcc66ca10', 'EXIF'),
  ('189ece46-0683-4674-aacb-7a1ec11c0bd6', 'EXV7'),
  ('3ac89677-22b6-4005-bb4f-36d0c0a2d2e1', 'EXV9'),
  ('1f580574-394a-4141-9a9a-7673b1aba65b', 'EXX6'),
  ('68f16350-825d-4de6-98f5-b2beca89191c', 'EXXU'),
  ('6b635f82-8d43-4831-a621-b5147296af18', 'EYLD'),
  ('846a85c1-3675-4066-98fe-52c4404a862f', 'F702'),
  ('19ebe6c7-4d8d-402d-bd4c-ccf2d94e548c', 'F703'),
  ('87673aed-9bac-4885-88bf-d4f9645bece0', 'FBIE'),
  ('848aab35-e2fc-4125-9838-47c0c38bb419', 'FBIH'),
  ('dfbd9114-7a77-4bf3-b7cd-5995f4068ece', 'FBIU'),
  ('8d79abf5-bae8-496a-8386-0dccd192335a', 'FCHP'),
  ('24fb6475-972d-4550-bf7b-e4c28baa4ccb', 'FEBB'),
  ('f56bf0cb-3d8b-492e-99c7-325683b46661', 'FEIA'),
  ('c6cc7365-9263-4a76-a00d-7b3a4c513997', 'FEIG'),
  ('4cef3c4f-cff4-4ec8-8a09-e143f419940d', 'FESE'),
  ('36d54f1e-2e5c-4d65-b577-0e26ccf60382', 'FEUI'),
  ('2392dc01-4073-4ccb-b412-58d13aeedb49', 'FEUQ'),
  ('93841361-2619-4f4a-807d-7c9fafc902ed', 'FFGE'),
  ('464fc13e-0428-42a7-9a0a-ffa23cec7de3', 'FFSM'),
  ('50aecefc-b5db-43d9-9c6a-f40e74c8633c', 'FGEA'),
  ('8f2cb1c7-b32a-4e5c-8a81-5ecf3c19fecf', 'FGEU'),
  ('37e6a517-66d5-4ad1-83e3-7facf3fdc15e', 'FINZ'),
  ('d0aadea9-51bf-49bb-97da-60a355947f03', 'FJ7H'),
  ('48e0b281-3de2-4734-938a-9c6199090c1c', 'FJ7I'),
  ('5c1bd19f-1271-46e7-b4b2-3c0f1f452173', 'FLCV'),
  ('e6a33ec7-4baa-4ba7-a5de-595958738570', 'FLRA'),
  ('03427c7b-e762-4026-9235-2a23b27c3c4d', 'FLXP'),
  ('9983500e-ae68-4eea-84de-e75359b9dd96', 'FRC4'),
  ('cff2e6b4-2b36-4d3c-b1c4-d11c5f0e850d', 'FSCE'),
  ('39a1bebf-6842-40c5-976a-c8dbbaa0b304', 'FSCI'),
  ('1755d3eb-68de-4b48-8284-101923ee7781', 'FSCM'),
  ('be62700e-2573-448c-9867-4e080813ccb0', 'FSPW'),
  ('9951c7bf-46fc-439c-8472-29ea33067b47', 'FTGI'),
  ('1f543944-752e-4e6a-8dfb-82584ccfd2da', 'FTGM'),
  ('e5cb5faa-394b-409c-8fb3-36687f433516', 'FTGN'),
  ('6464cfb1-a793-4452-b145-1ad841747f54', 'FTGQ'),
  ('d231b626-a92f-4129-b7a6-078f4ff6fca0', 'FTGS'),
  ('50db222c-bb96-43ed-ba1f-83f5e5e55e16', 'FTSS'),
  ('7cdaa579-bda6-4da7-9af8-2161b3538cfe', 'FTUI'),
  ('f3fe28ee-2d6e-42eb-8d64-054df522e1a4', 'FVUI'),
  ('5289c0bf-bb6f-4ffd-b789-774552f52df2', 'FWEA'),
  ('dcabfc50-30be-4fa9-a2ae-f509a083fb7b', 'FYEM'),
  ('509cdf4e-6a56-432d-a97b-e173fa9df5bb', 'GACB'),
  ('959bf736-2986-40b3-b266-335ad7d8193e', 'GAEB'),
  ('bd9c39dc-9837-4b3e-a147-f5e2e552aff2', 'GAEM'),
  ('57531dce-ffa8-4f13-95a1-49510d75bf1d', 'GASF'),
  ('5112d9b3-6d4a-4b71-8a18-27a9bdaa4a2e', 'GAUG'),
  ('b90c8c03-7cf9-4104-8a2a-d0f7d2be2a7e', 'GB1D'),
  ('793a4a55-34f6-4840-af4c-4924b03b45f4', 'GCOR'),
  ('ea5ec37c-97f8-4f0b-b758-74329e23fe18', 'GENY'),
  ('0f60d5f7-b68d-445d-ba05-0902d8d9c499', 'GEUR'),
  ('922aa7ab-d536-4aca-a9e0-296e9dd27817', 'GFEA'),
  ('28469c19-d94e-4600-9b90-01db24141668', 'GGUE'),
  ('3165c352-f1d9-437d-824b-3481b95a444f', 'GIGE'),
  ('f4c1fe47-3f04-4e43-86a8-e619a72869c6', 'GLAD'),
  ('b1d7cee5-3a33-40b3-b9d8-29450188bdaa', 'GLIG'),
  ('a42115d1-39f0-4af6-bfac-53f961b6d96b', 'GMAY'),
  ('dcc66a9f-8c2c-41d7-b245-9efde9b91f0d', 'GRON'),
  ('72c69b64-0b6a-4b38-82ef-9b3d4bc92908', 'GSXG'),
  ('17251d64-c968-44a4-911f-b690f8ff49aa', 'GTIL'),
  ('5bd2af80-33c9-4f62-adba-2847386f12c1', 'GXHY'),
  ('3e96ebb3-bf25-45a0-9469-23e56a748eb1', 'GXPE'),
  ('41a8a90e-c7ed-44fd-aae1-5fef4ae28cfb', 'GXUS'),
  ('2a92c323-1500-4aad-80de-295782d4fa4a', 'H21V'),
  ('b74655b5-35f8-40e5-87e2-9be88701bfd7', 'H41F'),
  ('5afa5185-f3ee-4887-9f78-c90b6902b07d', 'H41Q'),
  ('4ab07dfe-55fc-4d44-a33f-faf55e75dce3', 'H41S'),
  ('64b21f86-ac55-4c88-9167-df198e28de16', 'H41X'),
  ('242d1632-28b5-47cd-ae21-b092d4e033f0', 'H41Y'),
  ('a3e488b2-cc13-40ba-894d-4c713f155f76', 'H4ZK'),
  ('deac2346-4660-444f-9f2d-870449dfe2f2', 'HGGA'),
  ('d68a53e5-4fa8-49c6-8abb-ac39654c7e60', 'HJAP'),
  ('fb6901b6-76d0-4d2b-aae5-298f758d2a89', 'HP2A'),
  ('743cbd69-6805-45cb-a344-079be0352788', 'HP8E'),
  ('ff4d2fdf-346e-49ee-92fc-5fa5d43f1c0b', 'HPAE'),
  ('4afda252-8c12-435d-864e-bc5cbba9dbfe', 'HPAU'),
  ('e7364fdc-f859-4624-bdeb-aa3c8abfec7f', 'HQ5B'),
  ('3af5486a-829c-4802-b3e5-b51bcba4ea77', 'HX60'),
  ('d68727d6-35e8-42fd-b9b7-0c1d9433da94', 'HY3M'),
  ('366adf0f-8cb0-449f-888f-6e536a6d2a8c', 'HYCN'),
  ('6ddd677e-4922-422b-a4f2-47243a5c50c0', 'HYHE'),
  ('4017817f-bb19-49a9-b8d6-ceb83d59df58', 'IB36'),
  ('5e48b8fa-8acf-4b53-a61c-38f676ea7955', 'IB37'),
  ('59861d5a-fe3d-48e1-8038-5d16baa5acf9', 'ICFP'),
  ('b8eb80fc-bd9f-486f-9f64-e6d92e6f4714', 'IEXA'),
  ('683d9651-fda4-4eeb-8eb5-d9ce91bc9b70', 'IG33'),
  ('66853b52-b1cd-47d3-9009-46de9157eae8', 'IG34'),
  ('aa5d087b-b1b5-4525-a592-652eacfbc36b', 'IG35'),
  ('a60f2af9-628e-4b25-9932-39bbce8fb7ed', 'INCU'),
  ('9414a6bc-5037-442b-abb2-d65dd0469b78', 'INDU'),
  ('631faa53-234a-454f-bc66-c6c94011c99f', 'IS07'),
  ('b2378940-83c8-471f-8b6a-d83dcd474642', 'IS0S'),
  ('38634c24-a8d5-45ca-b4af-39686904f985', 'IS31'),
  ('4afff50d-9e43-4cfc-99b4-1618e2203812', 'IS3Z'),
  ('4fe46894-ef37-4d53-9d94-f671f20fb58b', 'ISFX'),
  ('a39ba0ee-d7f8-4fe1-9444-e2e53b135d80', 'IUSW'),
  ('e1c33a12-b4f9-4493-b811-eba56a62ade6', 'IVAI'),
  ('4aa23c0a-0e95-4922-b800-a06a29d40ebe', 'IVCS'),
  ('99d00d18-d04a-4490-8d24-c82191c3eec6', 'JAGA'),
  ('df36b880-ebd3-41fb-8d44-32fa3eaa3a0f', 'JAGG'),
  ('8681e71e-3e95-48a7-b7c9-ae085e76de2a', 'JAUS'),
  ('de55b012-fb9c-49f5-9171-092cb7105512', 'JC11'),
  ('7d4ea88a-8c41-439a-b36b-e8ac4c49dd63', 'JCEU'),
  ('f683a4d6-8162-478c-8f4a-aede7022677f', 'JE13'),
  ('a18d3501-4a38-4798-9a23-510087bb03fd', 'JEAA'),
  ('f6673f2e-9470-4123-bb89-6677dae1a1e7', 'JEBE'),
  ('e15dbcca-6c49-46e6-9439-648b5777ac70', 'JEEA'),
  ('293cbb0e-873c-45c0-a5ab-6e672449ab44', 'JEEG'),
  ('3d9b7278-67af-479e-86bf-744eb1d5d7a3', 'JEEM'),
  ('2f3d5dc4-4892-4701-a09c-54ebe67cdf3e', 'JEIA'),
  ('ebb22416-c062-4f30-8ee6-9225c8202f50', 'JEIE'),
  ('43122525-6c47-4c12-a9b4-0b9a5e12a4ac', 'JESE'),
  ('21faea7f-ac85-41b6-b75a-df9886d84ea1', 'JESM'),
  ('3fc8e396-dad0-4dcd-be7a-0e0a68a74c48', 'JEUS'),
  ('cbc3a826-400a-4efb-9759-426694b8ba30', 'JEYE'),
  ('a8095a7d-523e-4f3f-a531-30396029adea', 'JGGE'),
  ('cee0bfcf-89bc-4e57-858b-40a7c5aad8e8', 'JGLE'),
  ('f339230d-9a3e-4332-93ab-28d7dd5b9b03', 'JGPD'),
  ('e1d6ce8c-188a-4d89-b2aa-968d1dd0ee4e', 'JGSD'),
  ('64134eb2-eb60-46de-829a-084a66a3f932', 'JGSE'),
  ('a05b8c2a-9c32-41b4-9a89-d8ca529ee5fc', 'JGSV'),
  ('1466256b-3e3b-4b68-9bfd-d304dc58c1e1', 'JHES'),
  ('0ed69729-0dd6-431c-8e26-557750b5fc38', 'JIGG'),
  ('4804b852-92d6-466f-8c7c-1cad14077d69', 'JIPD'),
  ('f6f99936-d9a8-4bcf-99be-17a221c427a9', 'JJEH'),
  ('0b76fb53-ed37-4ac1-8125-9fd575eb1609', 'JLOD'),
  ('dca40772-0cec-4234-8f00-77b6246c6bb2', 'JMLP'),
  ('bd7a406f-6719-486e-adba-861d9236b8a3', 'JOGS'),
  ('6f3d46b3-62de-4d47-96fd-4e1fac5a14a9', 'JP40'),
  ('fd46398f-bfe1-41eb-8906-674fea338ba4', 'JPBM'),
  ('c61db96d-07e5-4024-8349-e4e849dcb98c', 'JPUY'),
  ('d7152ef6-87d1-4faf-b858-33a9f3a3506c', 'JPVD'),
  ('abbb3230-7fd9-435a-896b-34b9520a7d8d', 'JQPD'),
  ('82c88112-694e-4a1b-8a54-ef8ad4e57759', 'JREI'),
  ('49c268d3-a711-4750-902a-2018b338dae6', 'JREW'),
  ('07f643f8-d0f9-497b-9050-107dbf73a90d', 'JRUB'),
  ('49959e21-2163-47a3-a011-91ca56f1ff4b', 'JRUE'),
  ('8071fc6d-f994-471a-976c-38c24b7d404c', 'JRWE'),
  ('127011be-2850-4024-8fc5-ce4e130668a5', 'JRWU'),
  ('4b6688f6-00ac-49c0-a90b-fc8a5e0ff9c0', 'JSRI'),
  ('d590379c-09a8-4abd-9334-33bd9f9a1fd8', 'JTEN'),
  ('49667473-269d-4c84-8eda-3656a377ee2b', 'JUIE'),
  ('df83f38a-20e5-4923-921d-9d047e4a1ed8', 'JURY'),
  ('fd691187-203a-4a04-b7e7-1edb50d1601e', 'JYEH'),
  ('7f9d7902-6d20-4e81-b63f-1e5c86d34435', 'KLMH'),
  ('0a9c8602-3d40-4ab4-ae50-78b4aa579eda', 'KNG'),
  ('94dbfb2a-e231-449a-a5ae-cfd92df4fe85', 'KSRE'),
  ('3c8a3a26-5cfb-43da-b706-b01ba8cb23d7', 'LAAA'),
  ('29952459-dc56-479c-8025-1d5d73289991', 'LCHM'),
  ('9d00a126-489a-4ed4-b6bf-6c6b7ca1d76b', 'LCVB'),
  ('bf42abc8-93aa-4891-b7d7-0bc3f261658e', 'LDAX'),
  ('d615ef74-f349-48e6-885a-ffd58e108d53', 'LDGA'),
  ('18a99e2e-7ea9-44c1-97fe-9fa2ef01f6fe', 'LEEU'),
  ('4c1869ef-816f-4769-a2cf-69fc076c83f5', 'LFOD'),
  ('0c773edb-799e-4774-8108-18ce7506e8d4', 'LGGA'),
  ('d6fdb45d-3b21-4abe-b30c-482e6f90f4ca', 'LGGM'),
  ('923e6ef7-1aab-4e0f-8f7b-ed93fe6dcdcf', 'LGQI'),
  ('65f23051-420d-4f90-8df6-83440abf0282', 'LGWT'),
  ('4097ddf0-e76d-40ca-a5e4-c8dc50cd0b6d', 'LHKG'),
  ('d2fea3a8-95ad-4bd0-9f57-7c3679070394', 'LION'),
  ('d7f1d99b-6833-4ea6-9580-afc6589ff565', 'LM9B'),
  ('60cdee33-6457-48b1-9961-5df13e604ac4', 'LMWE'),
  ('6d417fba-8822-45d4-ae3a-a6aa9c943001', 'LNXB'),
  ('ac4db848-700e-481a-87e4-75de71914027', 'LQEU'),
  ('08c1a835-e786-4003-9585-3143e117959c', 'LSK7'),
  ('621e7100-57d0-4354-b227-4eddcb5b2477', 'LSK8'),
  ('d361f751-fe67-4f1d-a37e-1ccbaeefc549', 'LTCM'),
  ('19504b15-ff95-4ef7-8635-d0b85cf4a7c4', 'LTVL'),
  ('33fbee09-f328-48f4-925e-bbcba521b190', 'LUTL'),
  ('5bbbe171-0501-47b4-8c5e-043831b2b412', 'LVDX'),
  ('426c3744-43c7-42aa-8c3c-c3b773698477', 'LVLC'),
  ('922e6554-3121-4ef1-8c2f-8560a70dd034', 'LVLE'),
  ('f7ede2dc-afb9-4140-b7e0-d54c660ed88c', 'LWCH'),
  ('6df7bc1e-6aff-44ee-bd36-31d70837aed7', 'LYQK'),
  ('dcaca30e-423a-4d3c-8bd8-f90ab81dc06a', 'LYQL'),
  ('57a86e11-5879-4723-926e-6ee6e2afd5ff', 'LYQS'),
  ('1c676b3c-8eb0-43dc-b87b-d3fa8231777f', 'LYS5'),
  ('0ffb1abe-f114-4a85-b16d-295dfe1e9b17', 'LYX4'),
  ('981fc476-7ab7-4335-9928-7b7f57fdb93b', 'LYX8'),
  ('e0539b88-eb20-4ed8-bf69-9c8cc1fbf2a2', 'LYYE'),
  ('6eaefdef-4960-4874-bfac-c7031fe18526', 'M9SA'),
  ('13669ebb-7b0a-40ef-b818-0ec652b639a4', 'M9SV'),
  ('09b28400-d52a-465c-a8be-cbbacbe8f6ca', 'MACV'),
  ('b669639a-bd20-4ebe-ba7f-87a83048dfcc', 'MANU'),
  ('74372c6d-ac9b-4eed-9403-b9c574e82424', 'MAXD'),
  ('d9234575-99bb-4563-9f74-10c2c34559ab', 'MAXJ'),
  ('1e6e58ee-a44d-4495-8081-e9d9d45d80c7', 'MAXM'),
  ('44bdb0c4-bc4a-4f6a-a53c-041f9fefdb71', 'MAXS'),
  ('70c7bfbc-4422-4eb2-9517-d01b3ebb4c2d', 'MDBU'),
  ('0965960f-f6ef-47d2-b478-e625b62142aa', 'MEGA'),
  ('2f79e275-2f39-460f-a6e0-cf29f7a6f152', 'MEWD'),
  ('2e003f67-76b7-4ac1-9b10-43a789166c27', 'MIVU'),
  ('a62e1663-3df1-4a6a-9fd4-08b224efd0de', 'MNTE'),
  ('99784f49-beb4-432f-8563-1d1175fcd55f', 'MODR'),
  ('9e9f0ec7-fe61-409f-bba5-77c15cbe03ea', 'MSET'),
  ('4e45fd39-4ad4-42b2-b8be-71e44ad07538', 'MTDD'),
  ('5bb7f5c1-af4d-476c-81a9-f9d74d2f860d', 'MTVR'),
  ('1041685f-3d9d-416e-93bf-cdf41f7df5a5', 'MVEE'),
  ('29a26b53-c669-432a-aa23-e85a3c514dc9', 'MWDD'),
  ('21ae0ba3-84c8-428e-b3f5-60360cd7cce1', 'MWHE'),
  ('15c2ab6c-64bc-4ef0-b6fb-f3edabf9ca69', 'MWOS'),
  ('fad263c6-aff4-41d2-aa3e-b45c3e89dbf5', 'MWOU'),
  ('2ee5a399-c5cf-4f1a-a57a-d0950d0ff8fb', 'N1EU'),
  ('b6c24c87-bf6b-4021-ba8f-18735c1ebd02', 'NA7Y'),
  ('b7c4694d-10a0-4690-8108-4989909361b9', 'NADB'),
  ('6c4f3b8c-1fc7-4c39-ae26-383b1930293c', 'NS4E'),
  ('85c50d04-9c0f-44da-a359-bfc4b3faaf94', 'NSDT'),
  ('8a55687c-4f0b-4ed6-a2e3-b018901f9ba5', 'ODBA'),
  ('8d57dce4-4977-4ef0-a4f3-a6fe324590f0', 'OIGS'),
  ('b85caa85-8e68-4b6f-bda5-326b89225fec', 'OSX2'),
  ('da2b443f-0bca-486f-a243-5d215913a81b', 'OSX4'),
  ('85283153-dac0-4f90-959e-54e8e1b1dce9', 'OTUS'),
  ('71af4007-502e-4896-b05a-4efb0ffc605d', 'P1KA'),
  ('896d3b9f-1011-4c2e-ad01-ca3270ebec25', 'PAUD'),
  ('42965e94-28fe-442a-a0fa-99547a84fc26', 'PAUE'),
  ('86a0a054-9830-4f68-97d2-0e87460b7ceb', 'PAUJ'),
  ('364fb0d3-ddca-4982-8ac4-e2d959570073', 'PAUS'),
  ('d17d5db7-d4fb-41f7-b290-ae7c37f08fea', 'PDSE'),
  ('26d1b0af-7185-461e-9028-ab5123fd3699', 'PDWD'),
  ('6744dc57-1306-40e2-a02c-fa99b0be3968', 'PHWD'),
  ('59878254-5b06-43f3-90e8-d87e4415f121', 'PLAN'),
  ('4f168c30-0710-402c-b7b5-e8b0d8c51fd6', 'PQUS'),
  ('0c374cd1-0774-40a5-9d59-14e01a9073c4', 'PQXU'),
  ('038dc4d3-feac-4482-888c-b9e1c12a3032', 'PR1H'),
  ('690bc937-8bfd-4945-9a9b-fb3ca19066ea', 'PR1T'),
  ('b85dc511-27ad-44e3-b0b8-53a37198beb8', 'PRAG'),
  ('1d938382-ca14-487e-913b-bc35c609ab8c', 'PRAP'),
  ('ee3b133c-1618-45e9-939c-7a4c7f5bde2f', 'PRAS'),
  ('ab16ea77-c52c-4f4d-84fd-dab70eae1c9a', 'PUIG'),
  ('daba1555-2381-40bd-8417-eb38fb09c71a', 'QCLN'),
  ('88146d31-d080-4a9d-9c56-9a2249ca0670', 'QDEV'),
  ('810ccab5-d5e9-475b-ab9e-b3ce14b2f358', 'QGRW'),
  ('ede9d067-408e-4be2-bb9e-df576d9ca5d0', 'QREU'),
  ('521b9e0b-5125-4701-b657-132118519b1f', 'QSEP'),
  ('40fe5570-0747-45f6-9d03-1cd3fa330fc7', 'QSPA'),
  ('84b34df8-af8a-4e0f-a8e7-4c684856b93c', 'QUEU'),
  ('e840c7c7-afc9-4f60-b0cb-079490d8aefd', 'RDVY'),
  ('cab41700-a95a-4312-b38c-ea1a028cb18f', 'RDYN'),
  ('5e7a3519-f19c-45d9-8cff-3b146fc3ab6e', 'REMD'),
  ('6d707f53-2d00-43db-b72c-32f1937a6d10', 'REUS'),
  ('d1b5b081-fa6e-4b04-85ae-687599d8e6ee', 'RHYE'),
  ('47a13ed9-fd6c-4dab-9948-be490d6eb737', 'RIZF'),
  ('c0ff784c-e8e8-4f5d-911d-085e3747c87e', 'SAQL'),
  ('2a318873-b453-4535-bc83-cba6c58703fa', 'SC01'),
  ('d7dd720a-778f-42ff-85fe-76854195636b', 'SC0E'),
  ('86c6112e-852f-4010-95fb-e9514e69663f', 'SC0T'),
  ('3fdc8b85-8e6d-4d5b-8020-de2f230e17f5', 'SC0V'),
  ('6d5967bc-f123-4fcb-a632-fa3c3dca046c', 'SC0W'),
  ('6a26e84f-4968-48b5-a89b-20aea5d5b474', 'SC0Y'),
  ('0da4fd8f-f112-49be-a0d7-4a52d344915a', 'SC2X'),
  ('f05350ed-443d-4984-b772-5c2cf5d6b766', 'SDG9'),
  ('47eb1114-ce38-45e9-8efd-3583fedc2e47', 'SEAA'),
  ('67ffa1f1-f198-4a96-9e65-08f893da793c', 'SEAD'),
  ('b47cac65-6e6f-4948-a216-b7a4caf650e0', 'SEUA'),
  ('eda89a2c-06c8-4015-a0f3-98afd8fc4d4d', 'SHTE'),
  ('253e9158-0a5d-4096-b7b7-0f42c3e62531', 'SJEA'),
  ('e9131364-5462-4a1d-b641-4cb203a6a80b', 'SJPS'),
  ('6f64dda9-a133-4c27-861f-aa7c4c4d60af', 'SM8T'),
  ('4890b885-ced9-4b64-9375-176fb7411f10', 'SMTV'),
  ('d5b50747-5122-4e8b-beaa-faa039a65035', 'SNP1'),
  ('f6371cf1-db39-426d-aeee-2f0440c5790c', 'SNPE'),
  ('e520cac2-38ed-4bcc-aeb1-289a045536fe', 'SOVE'),
  ('88fe79ad-ea13-43d2-8b71-24b252b56f0d', 'SPF2'),
  ('73286850-de21-40f6-9c08-576e4f430961', 'SPFA'),
  ('2c246a68-81cf-4a2e-920f-cd82616cc2d1', 'SPFD'),
  ('75c40e8b-9024-4485-863b-1e992d54d5c2', 'SPP7'),
  ('47064e64-7e84-4ec9-8e3c-5e2283fb678e', 'SPPD'),
  ('93c7599e-d119-4fd9-b2f0-bf44a38aaf3a', 'SPPQ'),
  ('f4f4074b-f0c0-4aa3-8544-11b4799d9a71', 'SPQB'),
  ('acca313e-a8f0-47e0-9b63-e4c32bb7a70c', 'SPY2'),
  ('da74698c-a8ca-48c4-a55e-db97a3e024f1', 'SPYT'),
  ('9d8619db-421c-4710-946b-cc23f38930b5', 'ST4R'),
  ('90806758-8290-4aaa-9839-ccf1799caa5a', 'STT6'),
  ('6c331568-0f22-4a1b-8360-fc4e5c494c4b', 'STXH'),
  ('285d478c-58ec-4473-a598-b0fe90d6c069', 'SUUE'),
  ('b622ee0e-99b9-413d-bd3b-031ac8862a13', 'SXRR'),
  ('9a3d8567-d043-4cbe-9b01-f3cdf0effa75', 'SYB4'),
  ('4cc906be-f484-4088-91ee-147e8b90bc15', 'T05A'),
  ('7e6bb9ea-29ab-46d7-898b-4284b075a5a3', 'T7EU'),
  ('a0783dc9-a61f-4e5d-a317-91d2f9712375', 'TAAA'),
  ('53c885ec-5215-40ef-8143-3d25c15a9dd4', 'TABC'),
  ('f0add133-82bb-4892-86a5-97268e3aed04', 'TAEH'),
  ('21ab6c93-41f6-4ce0-98a3-3e711d9ec2c0', 'TCBT'),
  ('e39afdf4-9971-433d-807b-fc6d0cf3063f', 'TCRS'),
  ('f1a93cd5-10e1-4543-8db4-3b539268c83d', 'TDVX'),
  ('436552f4-d020-4edc-a85d-55b642e97b9d', 'TGAI'),
  ('57a760f5-da5c-42c0-a399-520f5460f4b0', 'TGBT'),
  ('31cfd18d-3bb5-4eb4-ba98-26e7cf9c2602', 'THFE'),
  ('0dc1f9e6-c46f-43d4-9ac3-521811568575', 'TIGA'),
  ('50ade934-98a8-48c7-918b-dc47dd1ced9c', 'TOPB'),
  ('72342a63-84b5-4421-ac07-e711c59eda16', 'TR7A'),
  ('5a29b864-8143-42a7-a3d0-97e2c76318e1', 'TRD1'),
  ('3aec5c88-3bc9-4dc6-b800-753849a005d8', 'TRDL'),
  ('1869692b-99a7-4375-a3d6-144ff5f2c9ee', 'TRXA'),
  ('9575f033-7326-4942-b19a-5af89a587a6e', 'TRXL'),
  ('59d5f93b-feef-4407-95d1-2ae7e4ce6d05', 'TUCP'),
  ('4a916a07-7e9b-407d-aa2c-ec071561a5b4', 'U8NJ'),
  ('a102e606-d777-46de-aaa5-e8d618eed058', 'UBF6'),
  ('cbb52eb7-611f-43e5-b4f4-867d77850636', 'UBF7'),
  ('2dd861cd-12ce-4ee3-a0bf-900dbb6cb5cd', 'UBUR'),
  ('69ed33d9-8af7-46bc-9eba-4b755e7d5664', 'UBUW'),
  ('021b5190-8058-4afd-8bd8-13a8fb1adeca', 'UBUX'),
  ('ddf86700-fe88-439a-878d-196853465ad2', 'UCT2'),
  ('9023abc5-78f1-44b9-b21c-30c998f5dab7', 'UEEH'),
  ('dea6b4b8-6335-45a8-9714-cbe3857b50ba', 'UEF0'),
  ('d2c69092-7d4a-49e8-baab-8394b7f18b13', 'UEFF'),
  ('e8593bae-f3dd-4248-beb7-47d455dfa6b5', 'UEQ3'),
  ('4ae88a97-59bb-49db-8e43-7ef1af0cba48', 'UEQV'),
  ('07113b9f-2a0a-4166-a3bb-49ffac015117', 'UIC1'),
  ('617bc6a5-56bb-47e8-a6d4-f79eacb9bd89', 'UIMZ'),
  ('05c4a966-d410-46df-b9dc-b814c12b4671', 'UIQ1'),
  ('abead813-1dc7-4965-ba45-7d7c4c50978a', 'UIQL'),
  ('6d2b2df7-8e1f-4bd8-87d1-15b8fb224183', 'UIQN'),
  ('e71e16ff-2523-4d56-a380-a46845579098', 'UK1T'),
  ('753e52ae-a41e-4982-86f7-ba6892ac8965', 'UKPH'),
  ('3daaf9c0-3e6a-472a-9382-d99fbcef674c', 'UKRN'),
  ('817d1d39-71fe-4e6a-95ab-73cecf439429', 'ULDE'),
  ('8becf95f-cfab-4165-b732-e13b45c43ec7', 'UQB1'),
  ('ca130a82-f93b-44a7-ad15-4ec48288ca44', 'UQB2'),
  ('9f05ea0e-c0bc-4197-b4f1-220c93d4ed7c', 'UQE2'),
  ('b07fb137-3df4-4636-b939-d5864c26db04', 'UQM1'),
  ('a3e1c746-e10b-4f7b-aa58-8936b8595311', 'US4E'),
  ('87fef84c-5523-421c-b5da-4f74c65447e8', 'USBG'),
  ('40e18726-e02d-4359-9502-d1da92ed56f3', 'USIQ'),
  ('ade6cd29-5f50-4e9b-ac2c-1a4cf4075707', 'V20D'),
  ('ce38f829-d1ef-4053-9fb3-0334afc8a82c', 'V2SA'),
  ('e6106133-d075-4e05-87ab-b2710e16c763', 'V3DL'),
  ('9023684a-8b46-4a96-af3a-d1e6f3f81fa0', 'V3ML'),
  ('663118de-4830-4260-9969-8506038e61eb', 'V3PL'),
  ('1bb55931-8847-4208-a1e7-a36a5eb7b05e', 'V3RF'),
  ('a9cd4e19-cb46-4040-8d17-1d4dabaaea56', 'V3YL'),
  ('97620eeb-5ce9-4609-a4f0-6f0b9c05e0c3', 'V40D'),
  ('a6774c96-cc30-431e-b6de-c428435ecde6', 'VALU'),
  ('e8da304d-42aa-4de1-bc28-3d6ddb7b8d8f', 'VE6I'),
  ('d2f7feb1-ced0-4dfa-993f-cbd4f71b8a1e', 'VEDA'),
  ('1231f07f-84e7-4aca-9323-4b10e627b779', 'VEGE'),
  ('a996ae64-7b69-4b5d-92dd-d0ac300ded6c', 'VGCE'),
  ('a1f83af9-8576-48ed-a1d8-2c7e049b0dd2', 'VGGF'),
  ('74b1ca8c-c7cf-41bc-8d95-912d3971e4cd', 'VGSA'),
  ('18198120-7549-4695-a78f-c329ae02f3fa', 'VGSD'),
  ('b42a10a8-5f01-4676-a904-bc3095756c6c', 'VIGB'),
  ('3b0e9cb0-9165-464c-89a4-d37ddb61c5fc', 'VITS'),
  ('75bfaee8-0e46-47ff-b9c8-fa5c69737245', 'VJPE'),
  ('07b867d2-ab2c-4752-a093-246172cb9896', 'VLDS'),
  ('1012b0d3-7da9-43fb-b1f5-6bbe5666e197', 'VLEU'),
  ('9df21e3a-00d8-4f09-bbd3-83ebd3482d3e', 'VOOM'),
  ('b2837259-a681-4a49-9058-eb73c63711af', 'VOON'),
  ('3b5a50da-d777-4ff6-8beb-0535a2987ca8', 'VRGU'),
  ('e28c7bc6-9bea-40e0-a421-91b73cc7ee43', 'VS0L'),
  ('cc57ca57-25a7-4e58-8a9b-37fc0a0f2215', 'VT0P'),
  ('f39a0959-0761-4655-83ec-a80072258059', 'VYUS'),
  ('81472230-0c51-4f11-b12c-af80cd3e56d1', 'W311'),
  ('bcfbfa13-9537-449b-9503-60889c0aac48', 'WBKN'),
  ('c9a05a17-2cd9-4992-a665-357081010f77', 'WBLC'),
  ('a57d45cb-7297-45c5-ba58-85617b93e0a7', 'WDEE'),
  ('ac239d49-bd91-4a07-aca7-8d38291f9316', 'WDEY'),
  ('30cf1a3e-a63a-485d-872e-cb1179d95e61', 'WDGE'),
  ('e1c16dd7-75ac-4033-b5cd-03b412098746', 'WDRD'),
  ('e5a227da-fee9-4534-b4b2-63765be9e40a', 'WDRT'),
  ('ae06846a-6ea9-4e02-a704-6be6e0949a77', 'WDSD'),
  ('259adc26-5814-4153-9c02-ec9a332527fc', 'WDTE'),
  ('119a1270-7f5e-41c1-9bc5-7d4cd78d14d9', 'WEBC'),
  ('ee16339d-dc51-4911-a160-7a92bac8d793', 'WEIF'),
  ('46245fa4-ae0c-4a1e-8c6d-da86d9b18f62', 'WELC'),
  ('33eeb3ab-4aab-445f-9d77-41b24ed7ac45', 'WELL'),
  ('32a85165-87a7-4daf-9861-be708d62e6e6', 'WELM'),
  ('d9c1d19f-a197-4dc3-8937-e6fa74f18f79', 'WELP'),
  ('1d9fab3c-06b1-4009-bf97-0d147e874904', 'WELQ'),
  ('d6bf8131-960f-43b9-8d71-c00a3d73fb0a', 'WELR'),
  ('30aae5ea-4512-4790-9ce4-52f4ac0974a5', 'WELT'),
  ('a541d574-1510-458d-a27d-c0478b1f9188', 'WELV'),
  ('a680de17-a7a7-4606-91d6-caa3088e4e5c', 'WELY'),
  ('ccaeea9c-c833-4919-bf9d-d3ab7051e616', 'WEMT'),
  ('375b7128-cf4e-4c95-bd58-1804843de67e', 'WENH'),
  ('387b9215-6ec5-4d8e-b485-943b6586deaf', 'WENU'),
  ('fed9e4bf-5403-4a8d-8423-031f8310aa3e', 'WGDP'),
  ('86e20067-de2c-4077-86cb-87dedc0d6cdd', 'WGES'),
  ('67a8f2d6-240f-4301-abb9-758f22f035b2', 'WGRU'),
  ('e0c9c615-b33e-4540-84a3-a3fa00617dd3', 'WH2E'),
  ('f17e42b5-9398-4fc3-b8d0-6f1612482b2d', 'WIMI'),
  ('ec92fceb-0dc2-4a73-a919-76b0d04d1749', 'WMOT'),
  ('80602a9d-2250-4a64-a676-6b26ef19ed03', 'WRNA'),
  ('fcc1545a-9c69-408a-84ee-51e5c22670d5', 'WSPC'),
  ('74e533b0-a128-4726-bd42-f9c9c2629fd1', 'WTD7'),
  ('5ca2c5d0-90c7-44cc-bc70-e31f763b2e6d', 'WTDH'),
  ('6bcf542a-42fe-49cd-82ff-d93b0660afdd', 'WTDI'),
  ('2b937efc-0fce-42aa-b659-b1bbf4f4b960', 'WTED'),
  ('e9fb63b2-ba0e-4c70-ae2d-6511c7062cd4', 'WTEF'),
  ('8c3beb04-eccc-451b-9ad8-2a6c6af27bac', 'WTEH'),
  ('baba84b5-0ff0-4965-9ec9-a34106d90a46', 'WTES'),
  ('2df52369-c509-45bc-b8e3-5bc35d5e5d06', 'WTEU'),
  ('e91ba819-453c-48b0-8a0f-ef4039729a2d', 'WTIF'),
  ('eca682e2-a46d-48f7-b433-05b88078aa52', 'WTIG'),
  ('ea86fe8c-906d-46be-a814-f460806e4ba4', 'WTIM'),
  ('3945cddd-f0b3-4f9a-a171-32d6d40a1bae', 'WTRE'),
  ('b2f55628-ec3a-4a0c-9ffa-69f54a993d42', 'WUSA'),
  ('2b21df9f-e004-48e9-bd00-820f64c56b6d', 'X03C'),
  ('5d08dae5-146e-454a-b82c-eb70f665c3d8', 'X1GD'),
  ('2afde32d-2db9-4447-ba0b-e226cc5b10b1', 'XAHY'),
  ('847ad8b6-fde9-4a84-aa90-c9c98f680750', 'XAIG'),
  ('4b1cc498-e580-4550-9458-922ffaf4d5e9', 'XAIN'),
  ('ced234e4-80dc-460f-b359-09a04d68be66', 'XASB'),
  ('016112c6-fd04-4d21-b474-bcfb29b1d986', 'XB28'),
  ('3d3ff662-9f46-4037-a2e8-d778b4809083', 'XB30'),
  ('e0617e37-c353-4e2d-b177-3bb313c4c4bc', 'XB32'),
  ('b4d6dc2d-4c93-4f9e-ac7d-29c3b586a3c7', 'XB34'),
  ('5ae1d4ff-e6e4-468d-8630-96ed35c2beb5', 'XB35'),
  ('a124ceff-069f-4698-9db6-cec2ec94e030', 'XBAK'),
  ('a9456bc0-7f28-48e7-849b-3bb31448284b', 'XBAT'),
  ('25a437ee-2171-4958-b959-13325312ccfa', 'XBCT'),
  ('50ff10f3-e125-4607-bb75-7f62e4217f25', 'XBI0'),
  ('86608fc1-09d2-43f4-bf41-2e8b4a08a5d0', 'XBJQ'),
  ('6381da74-905c-425e-a22a-a74c2d7bb24c', 'XBO2'),
  ('7db9e354-79dd-4c5f-91ff-136ec11281b6', 'XBUZ'),
  ('acd3aad5-e85d-4d88-9bad-0fb02a79232a', 'XCBE'),
  ('c0de311d-ca90-46c7-9f4e-3384c97352eb', 'XCEU'),
  ('af64eee0-c576-47f0-ad38-82f7b84b28ec', 'XCO2'),
  ('5ef369f7-07c0-4b0b-84d8-39f221278e83', 'XCS3'),
  ('190128b9-e952-4f25-8908-0ae87daa5683', 'XCTE'),
  ('9bd4bb48-d820-4676-aa43-265002c4ea08', 'XCTW'),
  ('576695c0-03ae-4d60-a38d-3d9087d02256', 'XDCC'),
  ('8107cd11-ea6d-4b4d-8b90-75fd2b979b89', 'XDEF'),
  ('587ac821-c168-4ace-90d1-8a6f4ad9a3dd', 'XDG3'),
  ('e12ccbfd-8544-4f47-8361-41f010379c10', 'XDG7'),
  ('53bdd711-09a7-4ec9-9552-203ba6c75b5f', 'XDGM'),
  ('99ea4406-b85b-45fc-b156-ed79d2e1688d', 'XDJX'),
  ('eff8cdf6-6481-4c3b-99f5-dfc8d70fd342', 'XDNE'),
  ('4805a32a-2870-49a4-aa0d-e85b911a3f1e', 'XDPD'),
  ('63672dd9-7f98-40b2-9d47-859e94756c91', 'XE01'),
  ('3d5742fa-984a-4f08-867c-9253f07ba91c', 'XEC1'),
  ('82bed6d9-1274-4b46-86bf-196444947bcf', 'XECT'),
  ('77af2c5b-dd9f-4de4-8be0-eb5af4c82d00', 'XEEE'),
  ('2f6991eb-311b-4046-9793-c96c1e2b74ad', 'XEML'),
  ('558bd19a-d5eb-4e8b-b668-537b902def92', 'XEMN'),
  ('f117c941-a6a3-42bc-b9f0-2e978c2b5b87', 'XEQL'),
  ('d295c136-3c2f-4c10-b9c6-0bf54745499e', 'XEZG'),
  ('f623c7bc-384f-4418-9a91-e36e9e92f473', 'XFLN'),
  ('ee8e1b8b-aa6b-4d0e-8fd6-987cb50dc119', 'XFNT'),
  ('1453fefb-3e1d-4a67-a172-ad1cbc028065', 'XGB4'),
  ('46f1cfea-52f7-4da6-8940-5cdd6c66c807', 'XGBU'),
  ('6ad0d2fe-cb70-4cbb-93d1-f71bede8f606', 'XGEN'),
  ('6e2fa746-85cb-49cb-8e85-bdcffc300b43', 'XGEZ'),
  ('bad89d32-2548-491e-872e-9bb4af2ba628', 'XGLF'),
  ('30daf5bd-d070-4e21-b9b1-31ae772b948b', 'XGUE'),
  ('ac1b0faa-8824-42b6-aa26-113024f8605c', 'XHW0'),
  ('8c9fac67-9b7e-43ac-84e1-89255efed6df', 'XIFE'),
  ('7dcd9456-4291-4f47-a1c2-767841a91121', 'XIGB'),
  ('3d79a850-cc2a-4ae2-ac7e-5b329c9a5d03', 'XLAI'),
  ('6971908e-9a9b-49ee-adda-8ae140506d4e', 'XLME'),
  ('572869aa-e563-45af-9481-5b127eae1080', 'XM27'),
  ('481deb20-c916-49ae-a02b-9f4ba170224b', 'XM31'),
  ('2f8bf70b-835c-4e9d-867a-9966115c7493', 'XM33'),
  ('a1cd2f3b-856a-4bab-a585-9ba78792a478', 'XMAE'),
  ('ff6624c0-0285-4dfa-943d-9368691640e8', 'XMCX'),
  ('247c8ff2-c5a7-4316-8ae3-6d61c96fa615', 'XMEA'),
  ('1ac336f9-ef04-459d-8816-0fec82713a39', 'XMN1'),
  ('20bf0dc0-d93e-4006-910b-5f487a119da9', 'XMVE'),
  ('b8988889-6a39-4010-b321-99a22a347d26', 'XNZN'),
  ('ec6f16e5-f2b2-460e-b90f-54e2aa0d2e9d', 'XPFI'),
  ('84b6a84c-1a9d-4eec-8f18-a229b715631b', 'XPQP'),
  ('fd32a199-3a4a-455b-a2ed-5d0cd6a80c32', 'XQUD'),
  ('d4871419-90a2-4b82-86bc-7c3bf78caaf8', 'XQUE'),
  ('c048e8ee-ca3d-40f9-b30b-d37b9254e773', 'XREA'),
  ('261c8e77-a247-4cbb-8b8c-ae59e26766dd', 'XS7W'),
  ('be7f9b2d-1f4f-4970-b9da-c547a665faeb', 'XS8R'),
  ('ca19886d-79b2-42ea-9c91-b536a0c2713c', 'XSOE'),
  ('c20fad21-4270-4335-955f-4dc247ec9c69', 'XSWD'),
  ('58b76820-fd8c-4e20-872b-ccfc24dbdb80', 'XSXE'),
  ('66e674f8-ea65-4f5d-8b49-d354f65a3fe2', 'XSXX'),
  ('65827db6-8959-4059-94ac-4414ae8f3bf9', 'XTC5'),
  ('c9099050-5ff8-43f6-86ab-1ca73d039214', 'XTIP'),
  ('4f0198cd-e487-4ddc-b3ba-26e64ae11135', 'XU6C'),
  ('3351f1e4-3d5d-43ec-8bad-9cb45bc08a94', 'XWEB'),
  ('aacb246d-9c63-4f2a-b6e7-48e644e4e447', 'XY2D'),
  ('efc70263-6ec0-417d-a35e-dfedf08a17e3', 'XYLE'),
  ('3dc2b17d-da38-4327-9a5a-cdbc29fb10d9', 'XZ10'),
  ('c8ec0c42-c634-4580-b513-7a953deaee3b', 'XZBE'),
  ('e4689778-afb1-479f-9e33-d48ac706eb53', 'XZDE'),
  ('091041a4-74d2-4f0c-8e6a-7454720320db', 'XZDW'),
  ('e12ecbcb-2b04-4745-90e0-73adad552c2c', 'XZDZ'),
  ('06c5591f-a527-4bc8-8828-e49e37c30539', 'XZEB'),
  ('1e3e1ccc-c6f1-4fe3-90cd-56876760525c', 'XZEP'),
  ('32802d91-66c0-4492-be29-382a9035baaf', 'XZEZ'),
  ('6a49628a-d2f2-4e89-98ae-8d25742b68d0', 'XZHE'),
  ('23e7191b-07bc-46eb-936e-f57a25341a1e', 'XZSW'),
  ('38a02b28-f3c1-4a4a-8079-0a707ee871b5', 'XZWD'),
  ('57eb9f8e-01a5-4664-9fd0-cc978e8c0163', 'YCHP'),
  ('4ae91c7d-2ab6-4ea9-83cb-7af8118618ca', 'YGLD'),
  ('aac71463-15b1-4b5d-b58d-dd97c09a966f', 'YYYY'),
  ('62a0564f-4df8-49a6-b23f-8e97ff447bc3', 'ZAPP'),
  ('a314be0c-5d46-453a-ba2a-cf70ba23dc59', 'ZINS'),
  ('5608e1a1-fc16-4136-bcbc-5f139094d5b9', 'ZPD3'),
  ('ae8713f6-6be1-4ffa-84b0-cd6bd78aa4c2', 'ZPD6'),
  ('b9887db3-630d-4ce2-8eab-ed785ef791f5', 'ZPD9'),
  ('0f786d62-25b4-4604-a928-3661a0ea7e78', 'ZPDW'),
  ('e3152dc0-307c-46a2-9818-612df52d279b', 'ZPR5'),
  ('b5807167-4919-4d75-bbc1-fd04ad677881', 'ZPR6'),
  ('c927a985-4f83-4655-9215-6a780e56154b', 'ZPRL'),
  ('99df1424-7301-49b4-9d41-f838ffaf42ce', 'ZPRM'),
  ('182f602c-e161-4403-8aff-eb37601d0abb', 'ZSG0'),
  ('86ce4633-d49c-4ceb-aece-5eaa65077a59', 'ZSRM');

CREATE TEMP TABLE "_xetra_before" ON COMMIT DROP AS
SELECT count(*) AS "n" FROM "etfs" WHERE "space_id" = 'koala_gains' AND "exchange" = 'XETRA';

-- 1. Checks: anything that no longer qualifies stops the whole script.
CREATE TEMP TABLE "_etf_delete_problems" ON COMMIT DROP AS
SELECT l."symbol",
       CASE WHEN e."id" IS NULL THEN 'not found as this id on XETRA with this ticker'
            WHEN e."last_report_generated_at" IS NOT NULL
              OR EXISTS (SELECT 1 FROM "etf_cached_scores" c WHERE c."etf_id" = e."id")
              OR EXISTS (SELECT 1 FROM "etf_category_analysis_results" c WHERE c."etf_id" = e."id")
              OR EXISTS (SELECT 1 FROM "etf_analysis_category_factor_results" c WHERE c."etf_id" = e."id")
              OR EXISTS (SELECT 1 FROM "etf_key_facts_reports" c WHERE c."etf_id" = e."id")
              OR EXISTS (SELECT 1 FROM "etf_vs_competition" c WHERE c."etf_id" = e."id")
              OR EXISTS (SELECT 1 FROM "etf_future_returns" c WHERE c."etf_id" = e."id") THEN 'has a report'
            WHEN EXISTS (SELECT 1 FROM "etf_generation_requests" g WHERE g."etf_id" = e."id") THEN 'has a generation request'
            WHEN EXISTS (SELECT 1 FROM "favourite_etfs" x WHERE x."etf_id" = e."id") THEN 'is a favourite'
            WHEN EXISTS (SELECT 1 FROM "etf_notes" x WHERE x."etf_id" = e."id") THEN 'has a note'
            WHEN EXISTS (SELECT 1 FROM "report_spends" r WHERE r."report_kind" = 'Etf' AND r."report_target_id" = e."id") THEN 'has a credit spend'
            WHEN EXISTS (SELECT 1 FROM "etf_scenario_etf_links" s
                         WHERE s."etf_id" = e."id" OR (s."space_id" = e."space_id" AND s."symbol" = e."symbol" AND s."exchange" = e."exchange")) THEN 'is in a scenario'
            WHEN EXISTS (SELECT 1 FROM "etfs" o
                         WHERE o."alternative_listings" @> jsonb_build_array(jsonb_build_object('exchange', e."exchange", 'symbol', e."symbol"))) THEN 'is another fund''s alternative listing'
            WHEN e."alternative_listings" <> '[]'::jsonb THEN 'owns an alternative listing' END AS "reason"
FROM "_etf_delete_list" l
LEFT JOIN "etfs" e ON e."id" = l."id" AND e."space_id" = 'koala_gains' AND e."exchange" = 'XETRA' AND e."symbol" = l."symbol";

DO $$
DECLARE bad text;
BEGIN
  SELECT string_agg("symbol" || ' (' || "reason" || ')', ', ' ORDER BY "symbol") INTO bad FROM "_etf_delete_problems" WHERE "reason" IS NOT NULL;
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'Nothing deleted. These listed ETFs no longer qualify: %', bad; END IF;
  IF (SELECT count(*) FROM "_etf_delete_list") <> 624 THEN RAISE EXCEPTION 'Nothing deleted. Expected 624 listed ETFs'; END IF;
  RETURN; END $$;

-- 2. Archive copies of everything that is about to be removed.
CREATE SCHEMA IF NOT EXISTS "etf_archive";
CREATE TABLE "etf_archive"."etfs_20261025" AS
  SELECT e.* FROM "etfs" e JOIN "_etf_delete_list" l ON l."id" = e."id";
CREATE TABLE "etf_archive"."etf_financial_info_20261025" AS
  SELECT c.* FROM "etf_financial_info" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_stock_analyzer_info_20261025" AS
  SELECT c.* FROM "etf_stock_analyzer_info" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_price_history_20261025" AS
  SELECT c.* FROM "etf_price_history" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_analyzer_info_20261025" AS
  SELECT c.* FROM "etf_mor_analyzer_info" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_risk_info_20261025" AS
  SELECT c.* FROM "etf_mor_risk_info" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_people_info_20261025" AS
  SELECT c.* FROM "etf_mor_people_info" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_portfolio_info_20261025" AS
  SELECT c.* FROM "etf_mor_portfolio_info" c JOIN "_etf_delete_list" l ON l."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_similar_etfs_20261025" AS
  SELECT s.* FROM "etf_similar_etfs" s JOIN "_etf_delete_list" l
    ON s."space_id" = 'koala_gains' AND s."exchange" = 'XETRA' AND s."symbol" = l."symbol";

-- 3. Similar-ETF suggestions on other funds that name a removed fund would link to a missing page.
DELETE FROM "etf_similar_etfs" s USING "_etf_delete_list" l
WHERE s."space_id" = 'koala_gains' AND s."exchange" = 'XETRA' AND s."symbol" = l."symbol";

-- 4. One DELETE per ETF. Financial, analyzer, price-history and MOR rows cascade with each.
DELETE FROM "etfs" WHERE "id" = '366e7142-b83b-4f5d-a7d2-1dc2455580ff' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DGXU'; -- WisdomTree Global Ex-USA Quality Dividend Growth UCITS ETF, €27.3M
DELETE FROM "etfs" WHERE "id" = 'b3c49e8d-6440-4084-8ca0-7b29241ed3bd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DOME'; -- iShares Europe Domestic Focus UCITS ETF, €10.4M
DELETE FROM "etfs" WHERE "id" = 'dc7b78a1-1c1b-4f70-aea8-2162bd158493' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DRAM'; -- Defiance Memory UCITS ETF, €93.4M
DELETE FROM "etfs" WHERE "id" = 'c78880d3-db57-4029-9620-582dd653eeb8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DRON'; -- Defiance Drone UCITS ETF, €34.5M
DELETE FROM "etfs" WHERE "id" = '52f8f06b-f3ea-4ee6-ad9c-99193c998c17' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DTNE'; -- iShares US Large Cap Moderate Buffer UCITS ETF, €17.2M
DELETE FROM "etfs" WHERE "id" = 'b1f03687-7e83-4b0e-9233-53b0a4a04c24' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DXSC'; -- Xtrackers MSCI Europe Materials Screened UCITS ETF, €65.4M
DELETE FROM "etfs" WHERE "id" = '30cd2734-55cb-4399-b207-6d931457a7f9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DXSG'; -- Xtrackers MSCI Europe Communication Services Screened UCITS ETF, €14.6M
DELETE FROM "etfs" WHERE "id" = 'f17a1ebc-fc3c-4ac0-93cc-9dd20911b561' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DXSK'; -- Xtrackers MSCI Europe Consumer Staples Screened UCITS ETF, €49.1M
DELETE FROM "etfs" WHERE "id" = '6a60f7ff-d652-4e3e-b584-6f54f85ee72a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DXSL'; -- Xtrackers MSCI Europe Industrials Screened UCITS ETF, €37.9M
DELETE FROM "etfs" WHERE "id" = '4b29c342-de8d-40e1-a100-083dbb2204ea' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DXSP'; -- Xtrackers Euro STOXX 50 Short Daily Swap UCITS ETF, €29.7M
DELETE FROM "etfs" WHERE "id" = 'ee2a300e-c5da-4cdb-b476-269fc9211be4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DYLD'; -- Global X DAX Covered Call UCITS ETF, €13.1M
DELETE FROM "etfs" WHERE "id" = '23532fb1-0105-4ed5-b482-a289f12f4417' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'DZMW'; -- DZ Bank MSCI World UCITS ETF, €27.3M
DELETE FROM "etfs" WHERE "id" = '3a90bf2a-4087-4cba-9d35-5fff46fa4342' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'E0UA'; -- iShares Govt Bond 0-3 Month UCITS ETF, €26.2M
DELETE FROM "etfs" WHERE "id" = 'a31fe285-4a8a-4856-bdc2-86000ccf215e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'E15H'; -- Lyxor Core Euro Government Inflation-Linked Bond (DR) UCITS ETF, €20.1M
DELETE FROM "etfs" WHERE "id" = '4615ee69-db13-4e15-bee1-94dbf858bf24' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'E6BR'; -- AMUNDI STOXX EUROPE 600 BASIC RESOURCES, €57.3M
DELETE FROM "etfs" WHERE "id" = '9e761b18-4f91-427b-af6c-a1a469b57855' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'E903'; -- Amundi DivDAX II UCITS ETF, €66.4M
DELETE FROM "etfs" WHERE "id" = '90d81ccf-c66c-4833-86ab-da4805b81e30' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'E907'; -- Amundi MDAX ESG II UCITS ETF, €85.6M
DELETE FROM "etfs" WHERE "id" = 'cbe23d98-9db1-45c9-8b12-58c6e15a76c1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'E908'; -- Amundi TecDAX UCITS ETF, €84.2M
DELETE FROM "etfs" WHERE "id" = '6daca3c1-cd56-4d47-b53c-4605ff127ec6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ECLM'; -- Guinness Sustainable Energy UCITS ETF, €13.7M
DELETE FROM "etfs" WHERE "id" = 'a58f682a-12d3-4e3a-b2f4-b12297320148' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ECMA'; -- Invesco EUR Corporate Bond ESG Multi-Factor UCITS ETF, €11.1M
DELETE FROM "etfs" WHERE "id" = 'a72013e9-a6c6-43a4-aa99-9cf15e3de97b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ECMD'; -- Invesco EUR Corporate Bond ESG Short Duration Multi-Factor UCITS ETF, €60.3M
DELETE FROM "etfs" WHERE "id" = '8b488abc-5b4c-457b-998b-eadcb67a1c22' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ECMF'; -- Invesco EUR Corporate Bond ESG Multi-Factor UCITS ETF, €23.5M
DELETE FROM "etfs" WHERE "id" = 'b787a580-455d-40ec-8215-0abc80ac06a9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ED3F'; -- Global X Europe Focused Defence Tech UCITS ETF, €21.1M
DELETE FROM "etfs" WHERE "id" = '6f4d4304-5db9-492c-9023-ab4ddf946f69' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDE0'; -- Global Aggregate Bond SRI Fossil Free, €51.2M, USD line
DELETE FROM "etfs" WHERE "id" = '600b8d42-e23a-47c9-a850-5443d8f2e7af' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDE2'; -- MSCI Emerging Ex China, €46.8M, USD line
DELETE FROM "etfs" WHERE "id" = '37d49477-5109-407c-a493-097dc3db8c47' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEF'; -- BNP Paribas Bloomberg Europe Defense UCITS ETF, €10.6M
DELETE FROM "etfs" WHERE "id" = '675409e8-3fae-47a7-90d9-2164016b9dd8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEJ'; -- BNP Paribas Alpha Enhanced Europe UCITS ETF, €61.4M
DELETE FROM "etfs" WHERE "id" = '26522090-60aa-4511-9e04-c6c19831bbec' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEL'; -- MSCI ACWI, €68.7M, USD line
DELETE FROM "etfs" WHERE "id" = '2d18f255-64cf-4a8c-b1a8-d408aa60891c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEM'; -- BNP Paribas MSCI Emerging, €66.1M, USD line
DELETE FROM "etfs" WHERE "id" = 'd58460d3-f405-4b74-aa70-501ddf041705' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEN'; -- BNP Paribas Easy JPM Tilted EMU Government Bond IG 1-10Y, €36.6M
DELETE FROM "etfs" WHERE "id" = '4c2df9f5-0b35-4290-a070-f330e13bfb00' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEP'; -- BNP Paribas MSCI World II Fund, €59.1M, USD line
DELETE FROM "etfs" WHERE "id" = '3380e33d-031e-4516-b1b4-68abeed45778' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEU'; -- BNP Paribas Equity Dividend Europe, €68.7M
DELETE FROM "etfs" WHERE "id" = 'a7ac69e0-9b11-4eb8-ab9b-c65460c36568' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEY'; -- BNP Paribas Easy MSCI Japan Fund, €69.5M
DELETE FROM "etfs" WHERE "id" = '6c5b167c-7ad0-4591-b1f0-6cc686659d91' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EDEZ'; -- BNP Paribas Easy Bloomberg US Treasury, €37.4M, USD line
DELETE FROM "etfs" WHERE "id" = '506a83ab-87c4-4d8c-b7dd-cf5c3e3ff210' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEA1'; -- BNP Paribas MSCI China A, €15.9M, USD line
DELETE FROM "etfs" WHERE "id" = '86865f0a-74a9-408b-a9fa-4a2eb26e85e7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAA'; -- BNP Paribas FTSE EPRA/NAREIT Eurozone Capped, €43.4M
DELETE FROM "etfs" WHERE "id" = 'da564bb3-9b7a-45d2-a339-fb932b5283d0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAB'; -- MSCI ACWI, €73.2M
DELETE FROM "etfs" WHERE "id" = '4ffe3dc2-c563-40f4-bd1a-d12c5c648678' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAG'; -- MSCI EMU, €50.4M
DELETE FROM "etfs" WHERE "id" = '80ab9056-a56e-4cfd-a0bc-71e22aec7c6f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAK'; -- BNP Paribas Jpm Tilted EMU Government Bond IG 0-1Y, €30.8M
DELETE FROM "etfs" WHERE "id" = '39d96cb7-8428-4dd0-b8d2-6ee4d6c098fd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAM'; -- JPM Global Government Bond IG, €31.0M
DELETE FROM "etfs" WHERE "id" = '5b02785f-40dc-4237-ad22-7faa3cf00365' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAP'; -- MSCI World EX USA, €11.4M, USD line
DELETE FROM "etfs" WHERE "id" = '69fd8a83-b916-4d0f-b35c-3ad1eeddbfee' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAS'; -- BNP Paribas Global Equity Long/short, €20.3M
DELETE FROM "etfs" WHERE "id" = '42ed5108-eccb-46b7-8d09-172fcc11828a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAT'; -- European Equity Buffer (June), €31.5M
DELETE FROM "etfs" WHERE "id" = '48629817-1b72-4818-8cc6-1ec5ac9258f7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAU'; -- Managed Futures, €34.0M
DELETE FROM "etfs" WHERE "id" = 'd5e8c4b0-c5f8-4460-b335-69cc5e8a3b15' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAV'; -- BNP Paribas Equity Premium Income, €48.4M
DELETE FROM "etfs" WHERE "id" = '51dc21f4-5d24-4fc7-b5b0-8a7a0a704b50' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEAY'; -- BNP Paribas MSCI World Ex USA Min Te, €33.3M, USD line
DELETE FROM "etfs" WHERE "id" = '50dd00c7-3a93-4d20-868f-f590277a10c3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EEPG'; -- BNP Paribas FTSE EPRA Nareit Developed Europe Green Fund, €49.6M
DELETE FROM "etfs" WHERE "id" = 'ee2aa1a1-5b75-48f4-b0a9-ea9b465c3590' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EGRE'; -- Bnpp Easy - ESG Growth Europe Fund, €21.8M
DELETE FROM "etfs" WHERE "id" = '81161201-0c44-4836-9d08-69a9be39ca47' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EGV1'; -- Lyxor STOXX Europe 600 Insurance UCITS ETF, €32.8M
DELETE FROM "etfs" WHERE "id" = 'e2649be3-7bdb-474b-a2c2-189f1f94e02a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EGV3'; -- Lyxor Euro Government Bond 1-3Y (DR) UCITS ETF, €32.5M
DELETE FROM "etfs" WHERE "id" = '8daf86a5-7101-46aa-adcf-1c93c1beb29d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EGV5'; -- Lyxor Euro Government Bond 3-5Y (DR) UCITS ETF, €15.9M
DELETE FROM "etfs" WHERE "id" = 'e0388402-ad0f-4ef5-922c-321d3e165277' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EGV7'; -- Lyxor EuroMTS 5-7Y Investment Grade (DR) UCITS ETF, €18.8M
DELETE FROM "etfs" WHERE "id" = 'e9a286f8-6e19-4353-bfc1-f0d0efcfe3f9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EGVD'; -- Invesco EUR Government and Related Green Bond Weighted UCITS ETF, €15.0M
DELETE FROM "etfs" WHERE "id" = '9ccd6a48-ebd4-4884-b889-5b028022baab' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EHLT'; -- Amundi STOXX Europe 600 Healthcare UCITS ETF, €68.3M
DELETE FROM "etfs" WHERE "id" = 'f586c148-a6ae-4458-b53f-263136a22263' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EIBB'; -- Invesco Euro Government Bond UCITS ETF, €25.3M
DELETE FROM "etfs" WHERE "id" = '51a86314-ed1a-48a8-b6e1-c10e3567b624' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EIBX'; -- Invesco Euro Government Bond 7-10 Year UCITS ETF, €11.4M
DELETE FROM "etfs" WHERE "id" = '6c42c223-eadf-468b-80a7-f388c93b21a1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EIGA'; -- Franklin Euro IG Corporate UCITS ETF, €14.0M
DELETE FROM "etfs" WHERE "id" = '2418550b-fed2-46d0-9138-e65f3615ab8e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EKLD'; -- BNP Paribas Easy MSCI USA SRI PAB, €96.0M, USD line
DELETE FROM "etfs" WHERE "id" = '7a9286d6-f9a9-4504-89f5-f8c4f092de46' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EKUS'; -- BNP Paribas Easy MSCI USA SRI PAB, €67.0M
DELETE FROM "etfs" WHERE "id" = 'dea6ce34-b8bf-4990-9328-570478aed5ae' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL41'; -- Deka MSCI USA MC UCITS ETF, €50.7M
DELETE FROM "etfs" WHERE "id" = '4dd100af-ca64-4b3c-950d-e3ed4111a1e0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL43'; -- Deka MSCI Europe MC UCITS ETF, €63.9M
DELETE FROM "etfs" WHERE "id" = '9a768e0b-4852-438a-8b7f-1d0b6bcb0090' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL44'; -- Deka MSCI Japan UCITS ETF, €87.5M
DELETE FROM "etfs" WHERE "id" = '87f837a1-2125-41a9-b22d-9b9363ef0cd4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL46'; -- Deka MSCI China ex A Shares UCITS ETF, €73.8M
DELETE FROM "etfs" WHERE "id" = 'a522fec6-bfb6-4f4b-98eb-cf67d1a65048' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL48'; -- Deka iBoxx EUR Liquid Germany Covered Diversified UCITS ETF, €48.9M
DELETE FROM "etfs" WHERE "id" = '8b5d3f00-3b72-4b7c-af86-924556d94884' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4D'; -- Deka STOXX Europe Strong Value 20 UCITS ETF, €51.3M
DELETE FROM "etfs" WHERE "id" = '7cda01c7-d428-4c88-ae81-69e430bf78a2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4E'; -- Deka STOXX Europe Strong Style Composite 40 UCITS ETF, €37.3M
DELETE FROM "etfs" WHERE "id" = 'd2e1ffe8-bb82-4a81-bed4-1616a52086f8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4L'; -- Deka iBoxx EUR Liquid Sovereign Diversified 1-3 UCITS ETF, €25.9M
DELETE FROM "etfs" WHERE "id" = 'bba2e974-32aa-4c38-8fa4-68fc799a4f19' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4N'; -- Deka iBoxx EUR Liquid Sovereign Diversified 5-7 UCITS ETF, €91.5M
DELETE FROM "etfs" WHERE "id" = '43ba78b9-5532-465e-ac8e-c1faa7605156' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4P'; -- Deka iBoxx EUR Liquid Sovereign Diversified 7-10 UCITS ETF, €10.9M
DELETE FROM "etfs" WHERE "id" = '0714f183-6b0f-4c35-bc9e-8e80cd6dfae7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4R'; -- Deka Deutsche Börse EUROGOV Germany UCITS ETF, €83.9M
DELETE FROM "etfs" WHERE "id" = '78eed931-dc80-4396-843a-512a3a9ed526' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4T'; -- Deka Deutsche Börse EUROGOV Germany 3-5 UCITS ETF, €58.7M
DELETE FROM "etfs" WHERE "id" = '09132b34-3858-4e55-a8f1-ae25f5b60a42' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EL4V'; -- Deka Deutsche Börse EUROGOV Germany 10+ UCITS ETF, €51.1M
DELETE FROM "etfs" WHERE "id" = '9e6ed0a7-26ae-4c65-8ade-1f779e7a7521' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ELF0'; -- Deka DAX ex Financials 30 UCITS ETF, €18.9M
DELETE FROM "etfs" WHERE "id" = '7d0fb359-76f8-4877-889a-14db624a4f73' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ELFD'; -- Deka Eurozone Rendite Plus 1-10 UCITS ETF, €15.5M
DELETE FROM "etfs" WHERE "id" = '0d2c7c4e-4f77-44df-8eeb-a93b7b8ed811' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ELFF'; -- Deka Euro Corporates 0-3 Liquid UCITS ETF, €66.7M
DELETE FROM "etfs" WHERE "id" = '54d7ded2-1671-40a6-acae-a73dc06aee43' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EMGM'; -- Franklin FTSE Emerging Markets UCITS ETF, €10.6M
DELETE FROM "etfs" WHERE "id" = '15fbed0c-e866-4680-abd6-3f4b9da073b4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EMSB'; -- Invesco Emerging Markets USD Bond UCITS ETF, €60.3M
DELETE FROM "etfs" WHERE "id" = '7be70508-e329-4e34-98d9-a1450b5a7586' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ENTR'; -- L&G New Energy Commodities UCITS ETF, €12.9M
DELETE FROM "etfs" WHERE "id" = '3dfd0b98-0454-4a4e-be98-f2ffc1f71ab8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EQQJ'; -- Invesco Nasdaq Next Generation 100 UCITS ETF, €45.9M
DELETE FROM "etfs" WHERE "id" = '1395daa6-ae96-4e7c-b6a0-16afb4c9799b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ES6Y'; -- L&G Cyber Security Innovation UCITS ETF, €48.7M
DELETE FROM "etfs" WHERE "id" = '7a4b8505-53fd-47df-8007-45dc68b2ee77' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAA'; -- BNP Paribas Easy S&P 500 Scored And Screened UCITS ETF, €61.8M
DELETE FROM "etfs" WHERE "id" = '4a8d19a8-0664-493a-844b-c3328350421b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAB'; -- BNP Paribas Easy MSCI ACWI Min TE UCITS ETF, €18.3M
DELETE FROM "etfs" WHERE "id" = '335af519-8e03-40f8-806c-6ef6bca44015' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAC'; -- BNP Paribas Easy MSCI ACWI Min TE UCITS ETF, €61.8M, USD line
DELETE FROM "etfs" WHERE "id" = '737986dd-497c-4454-99ee-7b47e56d032b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAD'; -- BNP Paribas FTSE Epra Nareit Global Developed Green Ctb, €36.7M
DELETE FROM "etfs" WHERE "id" = '0cfd68a9-094c-4876-a8c4-4ce85fa1ae0d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAE'; -- BNP Paribas Easy MSCI World Equal Weight Select UCITS ETF, €41.1M
DELETE FROM "etfs" WHERE "id" = '8dc98096-ec69-483e-8880-76d31c6bc83f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAG'; -- BNP Paribas Easy MSCI USA Small Cap Min Te UCITS ETF, €69.8M
DELETE FROM "etfs" WHERE "id" = '611d393c-ba3a-4b91-b76e-bae7ef21890a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAH'; -- BNP Paribas Easy MSCI USA Small Cap Min Te UCITS ETF, €41.4M, USD line
DELETE FROM "etfs" WHERE "id" = '76fe7123-e2b5-4b5c-8f51-6cf2c22dca5a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAI'; -- BNP Paribas Easy Alpha Enhanced US UCITS ETF, €20.3M, USD line
DELETE FROM "etfs" WHERE "id" = 'be626050-6a22-4979-b7e2-88558c2c8795' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAJ'; -- BNP Paribas Easy Alpha Enhanced US UCITS ETF, €20.2M
DELETE FROM "etfs" WHERE "id" = '7cbe1bb6-b738-4251-bb96-25afbb039ba0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAK'; -- BNP Paribas Easy Alpha Enhanced World UCITS ETF, €46.8M
DELETE FROM "etfs" WHERE "id" = '1802be31-0f6b-4eea-8f16-ea5f5dc4a7c2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAL'; -- BNP Paribas Easy Alpha Enhanced World UCITS ETF, €20.3M, USD line
DELETE FROM "etfs" WHERE "id" = 'ebadc77f-a09c-4541-afcd-9c3d79b3baa4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAM'; -- BNP Paribas Easy MSCI World UCITS ETF, €43.8M, USD line
DELETE FROM "etfs" WHERE "id" = '89e5e79e-1ef1-40e1-adb4-232ae5d7ad5c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAQ'; -- BNP Paribas Easy MSCI USA UCITS ETF, €18.3M, USD line
DELETE FROM "etfs" WHERE "id" = 'd481b111-c50b-49be-b2ed-960ebdf6e9f1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESAR'; -- BNP Paribas Easy MSCI USA UCITS ETF, €15.0M
DELETE FROM "etfs" WHERE "id" = '5692c8f8-1b78-431a-bae5-b2311938f5af' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESGJ'; -- Invesco MSCI Japan Universal Screened UCITS ETF, €11.9M
DELETE FROM "etfs" WHERE "id" = '7c76bce7-12d5-4caa-9057-6259de40063a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESGX'; -- Invesco MSCI Europe Ex UK Universal Screened UCITS ETF, €11.1M
DELETE FROM "etfs" WHERE "id" = '08ccb72b-97c2-472e-b269-1d186c612531' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESRI'; -- BNP Paribas Easy MSCI Emerging SRI PAB, €20.7M, USD line
DELETE FROM "etfs" WHERE "id" = '0904b510-3b94-46c1-adbe-7eb5f3160778' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESTA'; -- Invesco EUR IG Corporate Bond Short Duration Active UCITS ETF, €34.6M
DELETE FROM "etfs" WHERE "id" = '6579c6a1-6fce-4e89-bf4e-fa4c81d9811a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESTD'; -- Invesco EUR IG Corporate Bond Short Duration Active UCITS ETF, €25.9M
DELETE FROM "etfs" WHERE "id" = 'b084a1e1-c6ee-41bb-b703-fc2d0dd568a5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ESUF'; -- ETF Platform ICAV - ERSTE ETF US EQUITIES UCITS ETF, €84.0M
DELETE FROM "etfs" WHERE "id" = '4d20e9bd-258d-4127-8310-d905c1fd149e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ETLI'; -- L&G Pharma Breakthrough UCITS ETF, €25.3M
DELETE FROM "etfs" WHERE "id" = '54914f63-3c07-4fd8-8223-c8ae40c8c471' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EU03'; -- iShares Government Bond 0-3 Month UCITS ETF, €12.9M
DELETE FROM "etfs" WHERE "id" = 'ac05017c-c47f-4303-80ab-a84b111045d9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUAI'; -- AI-Enhanced Eurozone Equities UCITS ETF, €83.6M
DELETE FROM "etfs" WHERE "id" = '2a6c1de9-25be-4226-a163-6d7e87a9f5de' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUEB'; -- iShares € Corp Bond Enhanced Active UCITS ETF, €80.6M
DELETE FROM "etfs" WHERE "id" = '3a2597d5-1670-4e6a-aa30-5943d8b0945b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUFG'; -- iShares Europe Foreign Focus UCITS ETF, €10.5M
DELETE FROM "etfs" WHERE "id" = '8f41e980-0fb4-4954-89c9-2e91d2b5b0ee' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUGV'; -- PIMCO Advantage Euro Government Bond UCITS ETF, €29.9M
DELETE FROM "etfs" WHERE "id" = 'a2936f3b-0658-42b0-b46b-7416bc3749f3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUPB'; -- Ossiam Shiller Barclays Cape Global Sector Value Trust UCITS ETF, €16.1M
DELETE FROM "etfs" WHERE "id" = '1b280575-56fa-4732-ac44-d0b4c3039ca5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUPD'; -- Ossiam Shiller Barclays Cape US Sector Screened UCITS ETF, €26.4M
DELETE FROM "etfs" WHERE "id" = '17705bc1-76ef-45e2-9220-ba7c0a3e088c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUPF'; -- Ossiam Shiller Barclays Cape US Sector Screened UCITS ETF, €24.2M, USD line
DELETE FROM "etfs" WHERE "id" = '3e871a07-081a-42fb-aec0-29da36fe1faf' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUTA'; -- Invesco EUR IG Corporate Bond Active UCITS ETF, €35.1M
DELETE FROM "etfs" WHERE "id" = 'e5be6b8a-c872-4dff-aae0-c3cc69b8eb67' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUTD'; -- Invesco EUR IG Corporate Bond Active UCITS ETF, €25.6M
DELETE FROM "etfs" WHERE "id" = '608c85f5-f2b9-423a-be1a-feb2577c85e4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EUVL'; -- Defiance Photonics UCITS ETF, €12.6M
DELETE FROM "etfs" WHERE "id" = '0a0405bf-068a-41e7-9f88-d93cd0950f54' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EWGC'; -- Boerse Stuttgart AG, €24.0M
DELETE FROM "etfs" WHERE "id" = '85bd93e7-072f-41d9-a6bc-9d48505e3d03' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EWRD'; -- BNP Paribas Easy MSCI World SRI PAB, €53.9M, USD line
DELETE FROM "etfs" WHERE "id" = 'af3fdcc9-67bc-4e6c-a861-b73e6b3a2ea4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXH2'; -- iShares STOXX Europe 600 Financial Services UCITS ETF (DE), €92.8M
DELETE FROM "etfs" WHERE "id" = '4792854d-3519-4ab1-bb7c-97539a6c218e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXH6'; -- iShares STOXX Europe 600 Media UCITS ETF (DE), €16.2M
DELETE FROM "etfs" WHERE "id" = 'e1c3aafd-35e9-49c2-aab2-6c8baacbebd9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXH8'; -- iShares STOXX Europe 600 Retail UCITS ETF (DE), €10.8M
DELETE FROM "etfs" WHERE "id" = '89f19448-69ac-4245-84d4-7d5c77277d36' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXHG'; -- iShares STOXX Europe 600 Automobiles & Parts UCITS ETF (DE), €13.0M
DELETE FROM "etfs" WHERE "id" = '167316ac-fd38-4c9b-bbd2-2c152b572a17' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXI5'; -- iShares STOXX Europe 600 Real Estate UCITS ETF (DE), €54.7M
DELETE FROM "etfs" WHERE "id" = '19c0d8ec-69ab-43d4-999b-286b512fdb3b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXIB'; -- iShares TecDAX UCITS ETF (DE), €12.0M
DELETE FROM "etfs" WHERE "id" = 'e4eb1af1-d963-4187-86c8-b6b94e74ebaa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXIC'; -- iShares Core DAX UCITS ETF (DE), €74.4M
DELETE FROM "etfs" WHERE "id" = '0bd099a5-5c37-42d7-bb34-043c39daf2ed' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXID'; -- iShares MDAX UCITS ETF (DE), €30.9M
DELETE FROM "etfs" WHERE "id" = '329c717b-fc24-45ca-a311-34edcc66ca10' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXIF'; -- iShares Dow Jones Global Titans 50 UCITS ETF (DE), €12.6M
DELETE FROM "etfs" WHERE "id" = '189ece46-0683-4674-aacb-7a1ec11c0bd6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXV7'; -- iShares STOXX Europe 600 Chemicals UCITS ETF (DE), €93.3M
DELETE FROM "etfs" WHERE "id" = '3ac89677-22b6-4005-bb4f-36d0c0a2d2e1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXV9'; -- iShares STOXX Europe 600 Travel & Leisure UCITS ETF (DE), €61.8M
DELETE FROM "etfs" WHERE "id" = '1f580574-394a-4141-9a9a-7673b1aba65b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXX6'; -- iShares eb.rexx Government Germany 10.5+yr UCITS ETF (DE), €62.0M
DELETE FROM "etfs" WHERE "id" = '68f16350-825d-4de6-98f5-b2beca89191c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EXXU'; -- iShares Dow Jones China Offshore 50 UCITS ETF (DE), €41.9M
DELETE FROM "etfs" WHERE "id" = '6b635f82-8d43-4831-a621-b5147296af18' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'EYLD'; -- Invesco EUR IG Corporate Bond Yield Plus UCITS ETF, €23.9M
DELETE FROM "etfs" WHERE "id" = '846a85c1-3675-4066-98fe-52c4404a862f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'F702'; -- Amundi Multi-Asset Portfolio Defensive UCITS ETF, €77.2M
DELETE FROM "etfs" WHERE "id" = '19ebe6c7-4d8d-402d-bd4c-ccf2d94e548c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'F703'; -- Amundi Multi-Asset Portfolio Offensive UCITS ETF, €55.4M
DELETE FROM "etfs" WHERE "id" = '87673aed-9bac-4885-88bf-d4f9645bece0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FBIE'; -- Fidelity EUR Corp Bond Research Enhanced UCITS ETF, €52.5M
DELETE FROM "etfs" WHERE "id" = '848aab35-e2fc-4125-9838-47c0c38bb419' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FBIH'; -- Fidelity USD Corp Bond Research Enhanced UCITS ETF, €24.3M
DELETE FROM "etfs" WHERE "id" = 'dfbd9114-7a77-4bf3-b7cd-5995f4068ece' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FBIU'; -- Fidelity USD Corp Bond Research Enhanced UCITS ETF, €19.5M
DELETE FROM "etfs" WHERE "id" = '8d79abf5-bae8-496a-8386-0dccd192335a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FCHP'; -- First Trust Bloomberg Global Semiconductor Supply Chain UCITS ETF, €32.2M
DELETE FROM "etfs" WHERE "id" = '24fb6475-972d-4550-bf7b-e4c28baa4ccb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FEBB'; -- First Trust Vest U.S. Equity Moderate Buffer UCITS ETF-February, €23.4M
DELETE FROM "etfs" WHERE "id" = 'f56bf0cb-3d8b-492e-99c7-325683b46661' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FEIA'; -- Fidelity EUR Corp Bond Research Enhanced PAB UCITS ETF, €26.9M
DELETE FROM "etfs" WHERE "id" = 'c6cc7365-9263-4a76-a00d-7b3a4c513997' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FEIG'; -- Fidelity EUR Corp Bond Research Enhanced PAB UCITS ETF, €25.4M
DELETE FROM "etfs" WHERE "id" = '4cef3c4f-cff4-4ec8-8a09-e143f419940d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FESE'; -- Fidelity ESG USD EM Bond UCITS ETF, €22.3M
DELETE FROM "etfs" WHERE "id" = '36d54f1e-2e5c-4d65-b577-0e26ccf60382' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FEUI'; -- Fidelity Europe Quality Income UCITS ETF, €32.5M
DELETE FROM "etfs" WHERE "id" = '2392dc01-4073-4ccb-b412-58d13aeedb49' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FEUQ'; -- Fidelity Europe Quality Income UCITS ETF, €38.0M
DELETE FROM "etfs" WHERE "id" = '93841361-2619-4f4a-807d-7c9fafc902ed' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FFGE'; -- Fidelity Global HY Corp Bond Research Enhanced PAB UCITS ETF, €32.6M
DELETE FROM "etfs" WHERE "id" = '464fc13e-0428-42a7-9a0a-ffa23cec7de3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FFSM'; -- Fidelity US Fundamental Small-mid Cap UCITS ETF, €13.9M
DELETE FROM "etfs" WHERE "id" = '50aecefc-b5db-43d9-9c6a-f40e74c8633c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FGEA'; -- Fidelity Global Quality Income UCITS ETF, €17.5M
DELETE FROM "etfs" WHERE "id" = '8f2cb1c7-b32a-4e5c-8a81-5ecf3c19fecf' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FGEU'; -- Fidelity Global Quality Income UCITS ETF, €52.0M
DELETE FROM "etfs" WHERE "id" = '37e6a517-66d5-4ad1-83e3-7facf3fdc15e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FINZ'; -- Finanzen.Net MSCI World UCITS ETF, €47.4M
DELETE FROM "etfs" WHERE "id" = 'd0aadea9-51bf-49bb-97da-60a355947f03' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FJ7H'; -- UmweltBank UCITS-ETF - Green & Social Bonds Euro, €15.6M
DELETE FROM "etfs" WHERE "id" = '48e0b281-3de2-4734-938a-9c6199090c1c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FJ7I'; -- UmweltBank UCITS-ETF - Green & Social Bonds Euro, €25.6M
DELETE FROM "etfs" WHERE "id" = '5c1bd19f-1271-46e7-b4b2-3c0f1f452173' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FLCV'; -- Franklin Catholic Principles Emerging Markets Sovereign Debt UCITS ETF, €54.2M
DELETE FROM "etfs" WHERE "id" = 'e6a33ec7-4baa-4ba7-a5de-595958738570' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FLRA'; -- Franklin AI, Metaverse and Blockchain UCITS ETF, €14.7M
DELETE FROM "etfs" WHERE "id" = '03427c7b-e762-4026-9235-2a23b27c3c4d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FLXP'; -- Franklin STOXX EUR 600 Prs Alg Clm UCITS ETF, €38.3M
DELETE FROM "etfs" WHERE "id" = '9983500e-ae68-4eea-84de-e75359b9dd96' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FRC4'; -- UBS BBG Euro Inflation Linked 10+ UCITS ETF, €15.0M
DELETE FROM "etfs" WHERE "id" = 'cff2e6b4-2b36-4d3c-b1c4-d11c5f0e850d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FSCE'; -- Fidelity Global Corp Bond Research Enhanced PAB UCITS USD Hedged ETF, €75.6M
DELETE FROM "etfs" WHERE "id" = '39a1bebf-6842-40c5-976a-c8dbbaa0b304' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FSCI'; -- Fidelity Global Corp Bond Research Enhanced PAB UCITS ETF, €75.7M
DELETE FROM "etfs" WHERE "id" = '1755d3eb-68de-4b48-8284-101923ee7781' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FSCM'; -- Fidelity Global Corp Bond Research Enhanced PAB UCITS ETF, €26.6M
DELETE FROM "etfs" WHERE "id" = 'be62700e-2573-448c-9867-4e080813ccb0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FSPW'; -- Franklin S&P World Screened UCITS ETF, €13.1M
DELETE FROM "etfs" WHERE "id" = '9951c7bf-46fc-439c-8472-29ea33067b47' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTGI'; -- First Trust US Equity Income UCITS ETF, €45.9M
DELETE FROM "etfs" WHERE "id" = '1f543944-752e-4e6a-8dfb-82584ccfd2da' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTGM'; -- First Trust US Momentum UCITS ETF, €84.5M
DELETE FROM "etfs" WHERE "id" = 'e5cb5faa-394b-409c-8fb3-36687f433516' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTGN'; -- First Trust Vest U.S. Equity Moderate Buffer UCITS ETF - August, €28.8M
DELETE FROM "etfs" WHERE "id" = '6464cfb1-a793-4452-b145-1ad841747f54' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTGQ'; -- First Trust Vest Nasdaq-100 Moderate Buffer UCITS ETF, €10.1M
DELETE FROM "etfs" WHERE "id" = 'd231b626-a92f-4129-b7a6-078f4ff6fca0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTGS'; -- First Trust Global Capital Strength ESG Leaders UCITS ETF, €26.2M
DELETE FROM "etfs" WHERE "id" = '50db222c-bb96-43ed-ba1f-83f5e5e55e16' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTSS'; -- iShares FTSE All-World UCITS ETF, €34.8M
DELETE FROM "etfs" WHERE "id" = '7cdaa579-bda6-4da7-9af8-2161b3538cfe' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FTUI'; -- Franklin US Income Equity Focus UCITS ETF, €89.6M
DELETE FROM "etfs" WHERE "id" = 'f3fe28ee-2d6e-42eb-8d64-054df522e1a4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FVUI'; -- Franklin USD Invst Grade Corp Bnd UCITS ETF, €27.5M
DELETE FROM "etfs" WHERE "id" = '5289c0bf-bb6f-4ffd-b789-774552f52df2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FWEA'; -- Invesco FTSE All-World UCITS ETF, €75.1M
DELETE FROM "etfs" WHERE "id" = 'dcabfc50-30be-4fa9-a2ae-f509a083fb7b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'FYEM'; -- Fidelity Emerging Market Quality Income UCIT ETF, €62.4M
DELETE FROM "etfs" WHERE "id" = '509cdf4e-6a56-432d-a97b-e173fa9df5bb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GACB'; -- Goldman Sachs Activebeta(R) Emerging Markets Equity UCITS ETF, €11.5M
DELETE FROM "etfs" WHERE "id" = '959bf736-2986-40b3-b266-335ad7d8193e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GAEB'; -- Goldman Sachs Emerging Markets Hard Currency Bond Active UCITS ETF, €17.7M
DELETE FROM "etfs" WHERE "id" = 'bd9c39dc-9837-4b3e-a147-f5e2e552aff2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GAEM'; -- Goldman Sachs Emerging Markets Green and Social Bond UCITS ETF, €25.0M
DELETE FROM "etfs" WHERE "id" = '57531dce-ffa8-4f13-95a1-49510d75bf1d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GASF'; -- Goldman Sachs Access China Government Bond UCITS ETF, €44.1M
DELETE FROM "etfs" WHERE "id" = '5112d9b3-6d4a-4b71-8a18-27a9bdaa4a2e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GAUG'; -- First Trust Vest U.S. Equity Moderate Buffer UCITS ETF - August, €28.8M
DELETE FROM "etfs" WHERE "id" = 'b90c8c03-7cf9-4104-8a2a-d0f7d2be2a7e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GB1D'; -- Invesco Global High Yield Corporate Bond ESG Climate Transition UCITS ETF, €20.5M
DELETE FROM "etfs" WHERE "id" = '793a4a55-34f6-4840-af4c-4924b03b45f4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GCOR'; -- Franklin Sustainable Euro Green Corp 1-5 Year UCITS ETF, €46.0M
DELETE FROM "etfs" WHERE "id" = 'ea5ec37c-97f8-4f0b-b758-74329e23fe18' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GENY'; -- Amundi MSCI Millennials ESG Screened, €15.8M
DELETE FROM "etfs" WHERE "id" = '0f60d5f7-b68d-445d-ba05-0902d8d9c499' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GEUR'; -- Goldman Sachs ETF Icav, €10.8M
DELETE FROM "etfs" WHERE "id" = '922aa7ab-d536-4aca-a9e0-296e9dd27817' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GFEA'; -- VanEck Global Fallen Angel High Yield Bond UCITS ETF, €49.2M
DELETE FROM "etfs" WHERE "id" = '28469c19-d94e-4600-9b90-01db24141668' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GGUE'; -- UBS Global Gender Equality UCITS ETF, €18.0M
DELETE FROM "etfs" WHERE "id" = '3165c352-f1d9-437d-824b-3481b95a444f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GIGE'; -- Goldman Sachs EUR Investment Grade Corporate Bond Active UCITS ETF, €28.7M
DELETE FROM "etfs" WHERE "id" = 'f4c1fe47-3f04-4e43-86a8-e619a72869c6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GLAD'; -- AB Global Research Advanced Equity Portfolio, €12.6M
DELETE FROM "etfs" WHERE "id" = 'b1d7cee5-3a33-40b3-b9d8-29450188bdaa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GLIG'; -- Global Corporate Bond Portfolio, €22.5M
DELETE FROM "etfs" WHERE "id" = 'a42115d1-39f0-4af6-bfac-53f961b6d96b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GMAY'; -- First Trust Vest U.S. Equity Moderate Buffer UCITS ETF, €45.7M
DELETE FROM "etfs" WHERE "id" = 'dcc66a9f-8c2c-41d7-b245-9efde9b91f0d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GRON'; -- iShares Green Bond UCITS ETF, €69.6M
DELETE FROM "etfs" WHERE "id" = '72c69b64-0b6a-4b38-82ef-9b3d4bc92908' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GSXG'; -- Goldman Sachs Global Green Bond UCITS ETF, €47.4M
DELETE FROM "etfs" WHERE "id" = '17251d64-c968-44a4-911f-b690f8ff49aa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GTIL'; -- Xtrackers World Green Tech Innovators UCITS ETF 1C, €16.4M
DELETE FROM "etfs" WHERE "id" = '5bd2af80-33c9-4f62-adba-2847386f12c1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GXHY'; -- Goldman Sachs EUR High Yield Bond Active UCITS ETF, €98.6M
DELETE FROM "etfs" WHERE "id" = '3e96ebb3-bf25-45a0-9469-23e56a748eb1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GXPE'; -- Goldman Sachs MSCI World Private Equity Return Tracker UCITS ETF, €15.2M
DELETE FROM "etfs" WHERE "id" = '41a8a90e-c7ed-44fd-aae1-5fef4ae28cfb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'GXUS'; -- Amundi Global Ex-Us Government Bond, €97.3M
DELETE FROM "etfs" WHERE "id" = '2a92c323-1500-4aad-80de-295782d4fa4a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H21V'; -- 21Shares Crypto Basket Equal Weight ETP, €16.2M
DELETE FROM "etfs" WHERE "id" = 'b74655b5-35f8-40e5-87e2-9be88701bfd7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H41F'; -- HSBC MSCI Emerging Markets Small Cap ESG UCITS ETF, €63.2M
DELETE FROM "etfs" WHERE "id" = '5afa5185-f3ee-4887-9f78-c90b6902b07d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H41Q'; -- HSBC China Government Local Bond Fund, €74.2M
DELETE FROM "etfs" WHERE "id" = '4ab07dfe-55fc-4d44-a33f-faf55e75dce3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H41S'; -- HSBC Global Government Bond Fund, €73.2M
DELETE FROM "etfs" WHERE "id" = '64b21f86-ac55-4c88-9167-df198e28de16' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H41X'; -- HSBC S&P India Tech UCITS ETF, €13.4M
DELETE FROM "etfs" WHERE "id" = '242d1632-28b5-47cd-ae21-b092d4e033f0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H41Y'; -- HSBC Euro Corporate Bond UCITS ETF, €54.3M
DELETE FROM "etfs" WHERE "id" = 'a3e488b2-cc13-40ba-894d-4c713f155f76' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'H4ZK'; -- Euro Lower Carbon Government 1-3 Year Bond UCITS ETF, €70.2M
DELETE FROM "etfs" WHERE "id" = 'deac2346-4660-444f-9f2d-870449dfe2f2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HGGA'; -- HSBC Bloomberg Global Sustainable Aggregate 1-3 Year Bond UCITS ETF, €66.9M
DELETE FROM "etfs" WHERE "id" = 'd68a53e5-4fa8-49c6-8abb-ac39654c7e60' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HJAP'; -- HSBC MSCI Japan Climate Paris Aligned UCITS ETF, €11.8M
DELETE FROM "etfs" WHERE "id" = 'fb6901b6-76d0-4d2b-aae5-298f758d2a89' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HP2A'; -- HSBC MSCI Ac Asia Pacific Ex Japan Climate Paris Aligned UCITS ETF, €15.7M
DELETE FROM "etfs" WHERE "id" = '743cbd69-6805-45cb-a344-079be0352788' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HP8E'; -- HSBC MSCI Emerging Markets Climate Paris Aligned UCITS ETF, €33.8M
DELETE FROM "etfs" WHERE "id" = 'ff4d2fdf-346e-49ee-92fc-5fa5d43f1c0b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HPAE'; -- HSBC MSCI Europe Climate Paris Aligned UCITS ETF, €36.5M
DELETE FROM "etfs" WHERE "id" = '4afda252-8c12-435d-864e-bc5cbba9dbfe' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HPAU'; -- HSBC MSCI USA Climate Paris Aligned UCITS ETF, €32.2M
DELETE FROM "etfs" WHERE "id" = 'e7364fdc-f859-4624-bdeb-aa3c8abfec7f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HQ5B'; -- iShares iBonds Dec 2027 Term $ Corp UCITS ETF, €22.6M
DELETE FROM "etfs" WHERE "id" = '3af5486a-829c-4802-b3e5-b51bcba4ea77' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HX60'; -- iShares Nasdaq 100 Top 30 UCITS ETF, €45.5M
DELETE FROM "etfs" WHERE "id" = 'd68727d6-35e8-42fd-b9b7-0c1d9433da94' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HY3M'; -- VanEck Emerging Markets High Yield Bond UCITS ETF, €56.9M
DELETE FROM "etfs" WHERE "id" = '366adf0f-8cb0-449f-888f-6e536a6d2a8c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HYCN'; -- Global X Hydrogen UCITS ETF, €28.9M
DELETE FROM "etfs" WHERE "id" = '6ddd677e-4922-422b-a4f2-47243a5c50c0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'HYHE'; -- iShares Broad USD High Yield Corporate Bond UCITS ETF, €18.1M
DELETE FROM "etfs" WHERE "id" = '4017817f-bb19-49a9-b8d6-ceb83d59df58' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IB36'; -- iShares iBonds Dec 2036 Term EUR Corp UCITS ETF, €27.5M
DELETE FROM "etfs" WHERE "id" = '5e48b8fa-8acf-4b53-a61c-38f676ea7955' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IB37'; -- iShares iBonds Dec 2037 Term Corp UCITS ETF, €27.0M
DELETE FROM "etfs" WHERE "id" = '59861d5a-fe3d-48e1-8038-5d16baa5acf9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ICFP'; -- Invesco MSCI Europe ESG Leaders Catholic Principles UCITS ETF, €53.7M
DELETE FROM "etfs" WHERE "id" = 'b8eb80fc-bd9f-486f-9f64-e6d92e6f4714' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IEXA'; -- iShares £ Corporate Bond ex-Financials UCITS ETF, €35.1M
DELETE FROM "etfs" WHERE "id" = '683d9651-fda4-4eeb-8eb5-d9ce91bc9b70' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IG33'; -- iShares iBonds Dec 2033 Term E Corp UCITS ETF, €46.1M
DELETE FROM "etfs" WHERE "id" = '66853b52-b1cd-47d3-9009-46de9157eae8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IG34'; -- iShares iBonds Dec 2034 Term Corp UCITS ETF, €71.8M
DELETE FROM "etfs" WHERE "id" = 'aa5d087b-b1b5-4525-a592-652eacfbc36b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IG35'; -- iShares iBonds Dec 2035 Term Euro Corp UCITS ETF, €52.7M
DELETE FROM "etfs" WHERE "id" = 'a60f2af9-628e-4b25-9932-39bbce8fb7ed' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'INCU'; -- iShares U.S. Equity High Income Active UCITS ETF, €55.2M
DELETE FROM "etfs" WHERE "id" = '9414a6bc-5037-442b-abb2-d65dd0469b78' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'INDU'; -- Lyxor STOXX Europe 600 Industrial Goods & Services UCITS ETF, €31.2M
DELETE FROM "etfs" WHERE "id" = '631faa53-234a-454f-bc66-c6c94011c99f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IS07'; -- iShares STOXX World Equity Multifactor UCITS ETF, €28.6M
DELETE FROM "etfs" WHERE "id" = 'b2378940-83c8-471f-8b6a-d83dcd474642' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IS0S'; -- iShares Emerging Asia Local Government Bond UCITS ETF, €33.5M
DELETE FROM "etfs" WHERE "id" = '38634c24-a8d5-45ca-b4af-39686904f985' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IS31'; -- iShares Edge S&P 500 Minimum Volatility UCITS ETF, €42.1M
DELETE FROM "etfs" WHERE "id" = '4afff50d-9e43-4cfc-99b4-1618e2203812' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IS3Z'; -- iShares MSCI AC Far East ex-Japan UCITS ETF, €95.3M
DELETE FROM "etfs" WHERE "id" = '4fe46894-ef37-4d53-9d94-f671f20fb58b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ISFX'; -- iShares € Flexible Income Bond Active UCITS ETF, €16.3M
DELETE FROM "etfs" WHERE "id" = 'a39ba0ee-d7f8-4fe1-9444-e2e53b135d80' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IUSW'; -- iShares MSCI Saudi Arabia Capped UCITS ETF, €15.0M
DELETE FROM "etfs" WHERE "id" = 'e1c33a12-b4f9-4493-b811-eba56a62ade6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IVAI'; -- Invesco Artificial Intelligence Enablers UCITS ETF, €37.5M
DELETE FROM "etfs" WHERE "id" = '4aa23c0a-0e95-4922-b800-a06a29d40ebe' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'IVCS'; -- Invesco Cybersecurity UCITS ETF, €14.5M
DELETE FROM "etfs" WHERE "id" = '99d00d18-d04a-4490-8d24-c82191c3eec6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JAGA'; -- JPMorgan Global Aggregate Bond Active UCITS ETF, €42.8M
DELETE FROM "etfs" WHERE "id" = 'df36b880-ebd3-41fb-8d44-32fa3eaa3a0f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JAGG'; -- JPMorgan Global Aggregate Bond Active UCITS ETF, €13.9M
DELETE FROM "etfs" WHERE "id" = '8681e71e-3e95-48a7-b7c9-ae085e76de2a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JAUS'; -- JPMorgan US Equity Active UCITS ETF, €44.8M
DELETE FROM "etfs" WHERE "id" = 'de55b012-fb9c-49f5-9171-092cb7105512' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JC11'; -- UBS J.P. Morgan CNY China Gov 1-10 UCITS ETF, €11.4M
DELETE FROM "etfs" WHERE "id" = '7d4ea88a-8c41-439a-b36b-e8ac4c49dd63' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JCEU'; -- Janus Henderson Pan European High Conviction Equity UCITS ETF, €67.2M
DELETE FROM "etfs" WHERE "id" = 'f683a4d6-8162-478c-8f4a-aede7022677f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JE13'; -- JPMorgan BetaBuilders EUR Govt Bond 1-3 yr UCITS ETF, €16.7M
DELETE FROM "etfs" WHERE "id" = 'a18d3501-4a38-4798-9a23-510087bb03fd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEAA'; -- JPMorgan Active EUR Aggregate Bond UCITS ETF, €24.2M
DELETE FROM "etfs" WHERE "id" = 'f6673f2e-9470-4123-bb89-6677dae1a1e7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEBE'; -- JPMorgan EUR IG Corporate Bond Active UCITS ETF, €28.8M
DELETE FROM "etfs" WHERE "id" = 'e15dbcca-6c49-46e6-9439-648b5777ac70' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEEA'; -- JPMorgan Europe Equity Premium Income Active UCITS ETF, €25.9M
DELETE FROM "etfs" WHERE "id" = '293cbb0e-873c-45c0-a5ab-6e672449ab44' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEEG'; -- JPMorgan Etfs (Ireland) Icav EUR Government Bond Active UCITS ETF, €56.0M
DELETE FROM "etfs" WHERE "id" = '3d9b7278-67af-479e-86bf-744eb1d5d7a3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEEM'; -- JPMorgan Global Emerging Markets Research Enhanced Index Equity Active UCITS E, €35.0M
DELETE FROM "etfs" WHERE "id" = '2f3d5dc4-4892-4701-a09c-54ebe67cdf3e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEIA'; -- JPMorgan US Equity Premium Income Active UCITS ETF, €49.4M
DELETE FROM "etfs" WHERE "id" = 'ebb22416-c062-4f30-8ee6-9225c8202f50' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEIE'; -- JPMorgan US Equity Premium Income Active UCITS ETF, €17.3M
DELETE FROM "etfs" WHERE "id" = '43122525-6c47-4c12-a9b4-0b9a5e12a4ac' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JESE'; -- JPMorgan Etfs (Ireland) Icav Europe Research Enhanced Index Equity SRI Paris Aligned UCITS ETF, €17.1M
DELETE FROM "etfs" WHERE "id" = '21faea7f-ac85-41b6-b75a-df9886d84ea1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JESM'; -- JPMorgan Global Emerging Markets Research Enhanced Index Equity Active UCITS E, €31.6M
DELETE FROM "etfs" WHERE "id" = '3fc8e396-dad0-4dcd-be7a-0e0a68a74c48' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEUS'; -- JPMorgan US Research Enhanced Index Equity Active UCITS, €16.8M
DELETE FROM "etfs" WHERE "id" = 'cbc3a826-400a-4efb-9759-426694b8ba30' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JEYE'; -- JPMorgan EUR High Yield Bond Active UCITS ETF, €12.6M
DELETE FROM "etfs" WHERE "id" = 'a8095a7d-523e-4f3f-a531-30396029adea' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JGGE'; -- JPMorgan Active EUR Aggregate Bond UCITS ETF, €11.3M
DELETE FROM "etfs" WHERE "id" = 'cee0bfcf-89bc-4e57-858b-40a7c5aad8e8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JGLE'; -- JPMorgan Global Equity Active UCITS ETF, €12.0M
DELETE FROM "etfs" WHERE "id" = 'f339230d-9a3e-4332-93ab-28d7dd5b9b03' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JGPD'; -- JPMorgan Global Equity Premium Income Active UCITS ETF, €38.8M
DELETE FROM "etfs" WHERE "id" = 'e1d6ce8c-188a-4d89-b2aa-968d1dd0ee4e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JGSD'; -- JPMorgan Global Research Enhanced Index Equity SRI Paris Aligned active UCITS, €41.1M
DELETE FROM "etfs" WHERE "id" = '64134eb2-eb60-46de-829a-084a66a3f932' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JGSE'; -- JPMorgan Global Research Enhanced Index Equity SRI Paris Aligned active UCITS, €16.6M
DELETE FROM "etfs" WHERE "id" = 'a05b8c2a-9c32-41b4-9a89-d8ca529ee5fc' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JGSV'; -- JPMorgan Global Government Bond Active UCITS ETF, €33.7M, SEK line
DELETE FROM "etfs" WHERE "id" = '1466256b-3e3b-4b68-9bfd-d304dc58c1e1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JHES'; -- Janus Henderson EUR Short Duration Income Active Core UCITS ETF, €31.9M
DELETE FROM "etfs" WHERE "id" = '0ed69729-0dd6-431c-8e26-557750b5fc38' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JIGG'; -- JPMorgan Global IG Corporate Bond Active UCITS ETF, €11.9M
DELETE FROM "etfs" WHERE "id" = '4804b852-92d6-466f-8c7c-1cad14077d69' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JIPD'; -- JPMorgan US Equity Premium Income Active UCITS ETF, €44.5M
DELETE FROM "etfs" WHERE "id" = 'f6f99936-d9a8-4bcf-99be-17a221c427a9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JJEH'; -- JPM Japan Research Enhanced Index Equity Active UCITS ETF USD, €33.7M
DELETE FROM "etfs" WHERE "id" = '0b76fb53-ed37-4ac1-8125-9fd575eb1609' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JLOD'; -- JPMorgan Emerging Markets Local Currency Bond Active UCITS ETF, €31.6M
DELETE FROM "etfs" WHERE "id" = 'dca40772-0cec-4234-8f00-77b6246c6bb2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JMLP'; -- Alerian Midstream Energy Dividend Fund, €68.4M
DELETE FROM "etfs" WHERE "id" = 'bd7a406f-6719-486e-adba-861d9236b8a3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JOGS'; -- Jupiter Origin Global Smaller Companies Fund, €17.0M
DELETE FROM "etfs" WHERE "id" = '6f3d46b3-62de-4d47-96fd-4e1fac5a14a9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JP40'; -- Amundi JPX-Nikkei 400, €65.5M
DELETE FROM "etfs" WHERE "id" = 'fd46398f-bfe1-41eb-8906-674fea338ba4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JPBM'; -- JPMorgan USD Emerging Markets Sovereign Bond UCITS ETF, €65.0M
DELETE FROM "etfs" WHERE "id" = 'c61db96d-07e5-4024-8349-e4e849dcb98c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JPUY'; -- JPMorgan USD High Yield Bond Active UCITS ETF, €50.8M
DELETE FROM "etfs" WHERE "id" = 'd7152ef6-87d1-4faf-b858-33a9f3a3506c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JPVD'; -- JPMorgan US Value Equity Active UCITS ETF, €10.8M
DELETE FROM "etfs" WHERE "id" = 'abbb3230-7fd9-435a-896b-34b9520a7d8d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JQPD'; -- JPMorgan Nasdaq Equity Premium Income Active UCITS ETF, €10.4M
DELETE FROM "etfs" WHERE "id" = '82c88112-694e-4a1b-8a54-ef8ad4e57759' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JREI'; -- JPM Japan Research Enhanced Index Equity Active UCITS ETF USD, €47.4M
DELETE FROM "etfs" WHERE "id" = '49c268d3-a711-4750-902a-2018b338dae6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JREW'; -- JPMorgan All Country Research Enhanced Index Equity (ESG) UCITS ETF, €85.5M
DELETE FROM "etfs" WHERE "id" = '07f643f8-d0f9-497b-9050-107dbf73a90d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JRUB'; -- JPMorgan USD IG Corporate Bond Active UCITS ETF, €34.5M
DELETE FROM "etfs" WHERE "id" = '49959e21-2163-47a3-a011-91ca56f1ff4b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JRUE'; -- JPMorgan USD IG Corporate Bond Active UCITS ETF, €21.7M
DELETE FROM "etfs" WHERE "id" = '8071fc6d-f994-471a-976c-38c24b7d404c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JRWE'; -- JPMorgan All Country Research Enhanced Index Equity (ESG) UCITS ETF, €25.1M
DELETE FROM "etfs" WHERE "id" = '127011be-2850-4024-8fc5-ce4e130668a5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JRWU'; -- JPMorgan All Country Research Enhanced Index Equity (ESG) UCITS ETF, €61.3M
DELETE FROM "etfs" WHERE "id" = '4b6688f6-00ac-49c0-a90b-fc8a5e0ff9c0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JSRI'; -- BNP Paribas Easy MSCI Japan SRI PAB UCITS ETF, €20.7M
DELETE FROM "etfs" WHERE "id" = 'd590379c-09a8-4abd-9334-33bd9f9a1fd8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JTEN'; -- iShares US Large Cap Moderate Buffer Jun UCITS ETF, €15.7M
DELETE FROM "etfs" WHERE "id" = '49667473-269d-4c84-8eda-3656a377ee2b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JUIE'; -- JPMorgan US Research Enhanced Index Equity Active UCITS ETF, €87.6M
DELETE FROM "etfs" WHERE "id" = 'df83f38a-20e5-4923-921d-9d047e4a1ed8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JURY'; -- Jury Global High Dividend UCITS ETF, €95.0M
DELETE FROM "etfs" WHERE "id" = 'fd691187-203a-4a04-b7e7-1edb50d1601e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'JYEH'; -- JPMorgan Global High Yield Corporate Bond Multi-Factor Active UCITS ETF, €99.2M
DELETE FROM "etfs" WHERE "id" = '7f9d7902-6d20-4e81-b63f-1e5c86d34435' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'KLMH'; -- Amundi Global Aggregate Green Bond UCITS ETF, €96.8M
DELETE FROM "etfs" WHERE "id" = '0a9c8602-3d40-4ab4-ae50-78b4aa579eda' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'KNG'; -- First Trust Global Funds Public Limited Company First Trust Cboe Vest S&P 500 Dividend Aristocrats, €23.0M
DELETE FROM "etfs" WHERE "id" = '94dbfb2a-e231-449a-a5ae-cfd92df4fe85' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'KSRE'; -- KraneShares ICBCUBS China Technology & Semiconductor STAR 50 Index UCITS ETF, €30.3M
DELETE FROM "etfs" WHERE "id" = '3c8a3a26-5cfb-43da-b706-b01ba8cb23d7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LAAA'; -- Alpha UCITS SICAV - Fair Oaks High Grade Credit Fund, €35.1M
DELETE FROM "etfs" WHERE "id" = '29952459-dc56-479c-8025-1d5d73289991' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LCHM'; -- Amundi STOXX Europe 600 Basic Materials UCITS ETF, €22.8M
DELETE FROM "etfs" WHERE "id" = '9d00a126-489a-4ed4-b6bf-6c6b7ca1d76b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LCVB'; -- Amundi EURO CORP 0-1Y ESG, €32.2M
DELETE FROM "etfs" WHERE "id" = 'bf42abc8-93aa-4891-b7d7-0bc3f261658e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LDAX'; -- Amundi DAX II UCITS ETF, €80.3M
DELETE FROM "etfs" WHERE "id" = 'd615ef74-f349-48e6-885a-ffd58e108d53' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LDGA'; -- L&G Global Quality Dividends UCITS ETF, €61.4M
DELETE FROM "etfs" WHERE "id" = '18a99e2e-7ea9-44c1-97fe-9fa2ef01f6fe' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LEEU'; -- Amundi FTSE EPRA Europe Real Estate UCITS ETF, €25.3M
DELETE FROM "etfs" WHERE "id" = '4c1869ef-816f-4769-a2cf-69fc076c83f5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LFOD'; -- Lyxor STOXX Europe 600 Food & Beverage UCITS ETF, €59.8M
DELETE FROM "etfs" WHERE "id" = '0c773edb-799e-4774-8108-18ce7506e8d4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LGGA'; -- L&G Quality Equity Dividends ESG Exclusions Asia Pacific Ex-Japan UCITS ETF, €58.4M
DELETE FROM "etfs" WHERE "id" = 'd6fdb45d-3b21-4abe-b30c-482e6f90f4ca' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LGGM'; -- L&G Quality Equity Dividends ESG Exclusions Emerging Markets UCITS ETF, €63.5M
DELETE FROM "etfs" WHERE "id" = '923e6ef7-1aab-4e0f-8f7b-ed93fe6dcdcf' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LGQI'; -- Amundi SG Global Quality Income NTR UCITS ETF, €97.5M
DELETE FROM "etfs" WHERE "id" = '65f23051-420d-4f90-8df6-83440abf0282' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LGWT'; -- Amundi MSCI Europe Growth, €89.2M
DELETE FROM "etfs" WHERE "id" = '4097ddf0-e76d-40ca-a5e4-c8dc50cd0b6d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LHKG'; -- Amundi MSCI China ESG Selection Extra UCITS ETF, €79.9M
DELETE FROM "etfs" WHERE "id" = 'd2fea3a8-95ad-4bd0-9f57-7c3679070394' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LION'; -- L&G Lsf African Government Bond (USD) UCITS ETF, €60.5M
DELETE FROM "etfs" WHERE "id" = 'd7f1d99b-6833-4ea6-9580-afc6589ff565' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LM9B'; -- BNP Paribas Easy Sustainable World UCITS ETF, €19.8M, USD line
DELETE FROM "etfs" WHERE "id" = '60cdee33-6457-48b1-9961-5df13e604ac4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LMWE'; -- Amundi FTSE EPRA/NAREIT Global Developed UCITS ETF, €63.0M
DELETE FROM "etfs" WHERE "id" = '6d417fba-8822-45d4-ae3a-a6aa9c943001' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LNXB'; -- Investlinx Balanced Income UCITS ETF, €45.9M
DELETE FROM "etfs" WHERE "id" = 'ac4db848-700e-481a-87e4-75de71914027' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LQEU'; -- Investment Partners Icav - Laiqon – European Equity AI Optimized Active UCITS ETF, €70.3M
DELETE FROM "etfs" WHERE "id" = '08c1a835-e786-4003-9585-3143e117959c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LSK7'; -- Amundi EURO STOXX 50 Daily (-1x) Inverse UCITS ETF, €32.0M
DELETE FROM "etfs" WHERE "id" = '621e7100-57d0-4354-b227-4eddcb5b2477' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LSK8'; -- Amundi EURO STOXX 50 Daily (-2x) Inverse UCITS ETF, €30.1M
DELETE FROM "etfs" WHERE "id" = 'd361f751-fe67-4f1d-a37e-1ccbaeefc549' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LTCM'; -- Lyxor STOXX Europe 600 Telecommunications UCITS ETF, €92.5M
DELETE FROM "etfs" WHERE "id" = '19504b15-ff95-4ef7-8635-d0b85cf4a7c4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LTVL'; -- Amundi STOXX Europe 600 Consumer Discretionary, €46.8M
DELETE FROM "etfs" WHERE "id" = '33fbee09-f328-48f4-925e-bbcba521b190' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LUTL'; -- Lyxor STOXX Europe 600 Utilities UCITS ETF, €22.9M
DELETE FROM "etfs" WHERE "id" = '5bbbe171-0501-47b4-8c5e-043831b2b412' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LVDX'; -- Amundi Daily LevDAX UCITS ETF, €15.9M
DELETE FROM "etfs" WHERE "id" = '426c3744-43c7-42aa-8c3c-c3b773698477' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LVLC'; -- Invesco Global Active Defensive ESG Equity, €55.8M
DELETE FROM "etfs" WHERE "id" = '922e6554-3121-4ef1-8c2f-8560a70dd034' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LVLE'; -- Invesco Global Active Defensive ESG Equity, €65.0M
DELETE FROM "etfs" WHERE "id" = 'f7ede2dc-afb9-4140-b7e0-d54c660ed88c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LWCH'; -- Amundi MSCI World ESG Climate Net Zero Ambition Ctb UCITS ETF, €47.1M
DELETE FROM "etfs" WHERE "id" = '6df7bc1e-6aff-44ee-bd36-31d70837aed7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYQK'; -- Lyxor Bund Daily (-2X) Inverse UCITS ETF, €21.5M
DELETE FROM "etfs" WHERE "id" = 'dcaca30e-423a-4d3c-8bd8-f90ab81dc06a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYQL'; -- Amundi ShortDAX Daily (-2x) Inverse UCITS ETF, €25.3M
DELETE FROM "etfs" WHERE "id" = '57a86e11-5879-4723-926e-6ee6e2afd5ff' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYQS'; -- Amundi USD Emerging Markets Government Bond UCITS ETF, €51.3M
DELETE FROM "etfs" WHERE "id" = '1c676b3c-8eb0-43dc-b87b-d3fa8231777f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYS5'; -- Lyxor EuroMTS Highest Rated Macro-Weighted Govt Bond 3-5Y (DR) UCITS ETF, €49.3M
DELETE FROM "etfs" WHERE "id" = '0ffb1abe-f114-4a85-b16d-295dfe1e9b17' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYX4'; -- Amundi STOXX Europe 600 Basic Materials UCITS ETF, €12.9M
DELETE FROM "etfs" WHERE "id" = '981fc476-7ab7-4335-9928-7b7f57fdb93b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYX8'; -- Amundi USD High Yield Corporate Bond ESG UCITS ETF, €50.2M
DELETE FROM "etfs" WHERE "id" = 'e0539b88-eb20-4ed8-bf69-9c8cc1fbf2a2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'LYYE'; -- Amundi MSCI USA ESG Climate Net Zero Ambition Ctb UCITS ETF, €16.2M
DELETE FROM "etfs" WHERE "id" = '6eaefdef-4960-4874-bfac-c7031fe18526' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'M9SA'; -- Market Access Rogers International Commodity Index UCITS ETF, €65.3M
DELETE FROM "etfs" WHERE "id" = '13669ebb-7b0a-40ef-b818-0ec652b639a4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'M9SV'; -- Market Access STOXX China A Minimum Variance Index UCITS ETF, €38.8M
DELETE FROM "etfs" WHERE "id" = '09b28400-d52a-465c-a8be-cbbacbe8f6ca' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MACV'; -- iShares Conservative Portfolio UCITS ETF, €16.1M
DELETE FROM "etfs" WHERE "id" = 'b669639a-bd20-4ebe-ba7f-87a83048dfcc' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MANU'; -- L&G Market Neutral Commodities UCITS ETF, €33.3M
DELETE FROM "etfs" WHERE "id" = '74372c6d-ac9b-4eed-9403-b9c574e82424' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MAXD'; -- iShares S&P 500 Max Buffer Dec UCITS ETF, €20.5M
DELETE FROM "etfs" WHERE "id" = 'd9234575-99bb-4563-9f74-10c2c34559ab' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MAXJ'; -- iShares S&P 500 Max Buffer Jun UCITS ETF, €22.2M
DELETE FROM "etfs" WHERE "id" = '1e6e58ee-a44d-4495-8081-e9d9d45d80c7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MAXM'; -- iShares S&P 500 Max Buffer Mar UCITS ETF, €17.7M
DELETE FROM "etfs" WHERE "id" = '44bdb0c4-bc4a-4f6a-a53c-041f9fefdb71' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MAXS'; -- iShares S&P 500 Max Buffer Sep UCITS ETF, €27.5M
DELETE FROM "etfs" WHERE "id" = '70c7bfbc-4422-4eb2-9517-d01b3ebb4c2d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MDBU'; -- UBS Sustainable Development Banks Bond UCITS ETF, €34.7M
DELETE FROM "etfs" WHERE "id" = '0965960f-f6ef-47d2-b478-e625b62142aa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MEGA'; -- Amundi MSCI USA Mega Cap UCITS ETF, €10.9M
DELETE FROM "etfs" WHERE "id" = '2f79e275-2f39-460f-a6e0-cf29f7a6f152' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MEWD'; -- Invesco MSCI Europe Equal Weight UCITS ETF, €58.8M
DELETE FROM "etfs" WHERE "id" = '2e003f67-76b7-4ac1-9b10-43a789166c27' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MIVU'; -- Amundi MSCI USA Minimum Volatility Factor, €35.9M
DELETE FROM "etfs" WHERE "id" = 'a62e1663-3df1-4a6a-9fd4-08b224efd0de' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MNTE'; -- iShares US Large Cap Moderate Buffer Mar UCITS ETF, €16.5M
DELETE FROM "etfs" WHERE "id" = '99784f49-beb4-432f-8563-1d1175fcd55f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MODR'; -- iShares Moderate Portfolio UCITS ETF, €47.7M
DELETE FROM "etfs" WHERE "id" = '9e9f0ec7-fe61-409f-bba5-77c15cbe03ea' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MSET'; -- Amundi Euro STOXX 50 Target Income UCITS ETF, €33.7M
DELETE FROM "etfs" WHERE "id" = '4e45fd39-4ad4-42b2-b8be-71e44ad07538' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MTDD'; -- Amundi Euro Government Bond 7-10Y UCITS ETF, €31.9M
DELETE FROM "etfs" WHERE "id" = '5bb7f5c1-af4d-476c-81a9-f9d74d2f860d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MTVR'; -- L&G Metaverse ESG Exclusions UCITS ETF, €32.2M
DELETE FROM "etfs" WHERE "id" = '1041685f-3d9d-416e-93bf-cdf41f7df5a5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MVEE'; -- iShares Edge MSCI Europe Minimum Volatility Advanced UCITS ETF, €29.7M
DELETE FROM "etfs" WHERE "id" = '29a26b53-c669-432a-aa23-e85a3c514dc9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MWDD'; -- Invesco MSCI World UCITS ETF Dist, €43.4M
DELETE FROM "etfs" WHERE "id" = '21ae0ba3-84c8-428e-b3f5-60360cd7cce1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MWHE'; -- Amundi Core MSCI World UCITS ETF, €75.7M
DELETE FROM "etfs" WHERE "id" = '15c2ab6c-64bc-4ef0-b6fb-f3edabf9ca69' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MWOS'; -- Amundi MSCI World ESG Leaders UCITS ETF, €94.5M
DELETE FROM "etfs" WHERE "id" = 'fad263c6-aff4-41d2-aa3e-b45c3e89dbf5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'MWOU'; -- Amundi MSCI USA ESG Leaders Extra UCITS ETF, €33.9M
DELETE FROM "etfs" WHERE "id" = '2ee5a399-c5cf-4f1a-a57a-d0950d0ff8fb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'N1EU'; -- Invesco Nasdaq-100 ESG UCITS ETF, €10.5M
DELETE FROM "etfs" WHERE "id" = 'b6c24c87-bf6b-4021-ba8f-18735c1ebd02' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'NA7Y'; -- YieldMax® Future Of Defence Option Income UCITS ETF, €11.1M
DELETE FROM "etfs" WHERE "id" = 'b7c4694d-10a0-4690-8108-4989909361b9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'NADB'; -- Lyxor EuroMTS 10-15Y Investment Grade (DR) UCITS ETF, €21.7M
DELETE FROM "etfs" WHERE "id" = '6c4f3b8c-1fc7-4c39-ae26-383b1930293c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'NS4E'; -- Invesco JPX-Nikkei 400 UCITS ETF, €14.6M
DELETE FROM "etfs" WHERE "id" = '85c50d04-9c0f-44da-a359-bfc4b3faaf94' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'NSDT'; -- Amundi NASDAQ-100, €28.6M
DELETE FROM "etfs" WHERE "id" = '8a55687c-4f0b-4ed6-a2e3-b018901f9ba5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ODBA'; -- Oddo Bhf Global Balanced Allocation Active UCITS ETF, €11.2M
DELETE FROM "etfs" WHERE "id" = '8d57dce4-4977-4ef0-a4f3-a6fe324590f0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'OIGS'; -- Amundi STOXX Europe 600 Energy ESG Screened UCITS ETF, €42.3M
DELETE FROM "etfs" WHERE "id" = 'b85caa85-8e68-4b6f-bda5-326b89225fec' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'OSX2'; -- Ossiam US Minimum Variance Screened NR UCITS ETF, €10.9M
DELETE FROM "etfs" WHERE "id" = 'da2b443f-0bca-486f-a243-5d215913a81b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'OSX4'; -- Ossiam Europe ESG Machine Learning, €16.9M
DELETE FROM "etfs" WHERE "id" = '85283153-dac0-4f90-959e-54e8e1b1dce9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'OTUS'; -- Lloyd International Equity UCITS ETF, €53.8M
DELETE FROM "etfs" WHERE "id" = '71af4007-502e-4896-b05a-4efb0ffc605d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'P1KA'; -- VanEck Electrification And Power Infrastructure UCITS ETF, €73.6M
DELETE FROM "etfs" WHERE "id" = '896d3b9f-1011-4c2e-ad01-ca3270ebec25' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PAUD'; -- Invesco MSCI World ESG Climate Paris Aligned UCITS ETF, €26.8M
DELETE FROM "etfs" WHERE "id" = '42965e94-28fe-442a-a0fa-99547a84fc26' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PAUE'; -- Invesco MSCI Europe ESG Climate Paris Aligned UCITS ETF, €21.6M
DELETE FROM "etfs" WHERE "id" = '86a0a054-9830-4f68-97d2-0e87460b7ceb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PAUJ'; -- Invesco MSCI Japan ESG Climate Paris Aligned UCITS ETF, €40.6M
DELETE FROM "etfs" WHERE "id" = '364fb0d3-ddca-4982-8ac4-e2d959570073' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PAUS'; -- Invesco MSCI USA ESG Climate Paris Aligned UCITS ETF, €60.5M
DELETE FROM "etfs" WHERE "id" = 'd17d5db7-d4fb-41f7-b290-ae7c37f08fea' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PDSE'; -- Invesco Preferred Shares UCITS ETF, €11.8M
DELETE FROM "etfs" WHERE "id" = '26d1b0af-7185-461e-9028-ab5123fd3699' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PDWD'; -- Pictet AI Enhanced World Equity UCITS ETF, €12.1M
DELETE FROM "etfs" WHERE "id" = '6744dc57-1306-40e2-a02c-fa99b0be3968' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PHWD'; -- Pictet AI Enhanced World Equity UCITS ETF, €35.7M
DELETE FROM "etfs" WHERE "id" = '59878254-5b06-43f3-90e8-d87e4415f121' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PLAN'; -- Amundi Corporate Proceeds Bond UCITS ETF, €11.0M
DELETE FROM "etfs" WHERE "id" = '4f168c30-0710-402c-b7b5-e8b0d8c51fd6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PQUS'; -- Pictet AI Enhanced US Equity UCITS ETF, €27.1M
DELETE FROM "etfs" WHERE "id" = '0c374cd1-0774-40a5-9d59-14e01a9073c4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PQXU'; -- Pictet AI Enhanced World Ex US Equity UCITS ETF, €87.0M
DELETE FROM "etfs" WHERE "id" = '038dc4d3-feac-4482-888c-b9e1c12a3032' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PR1H'; -- Amundi US Treasury Bond 0-1Y UCITS ETF, €75.0M
DELETE FROM "etfs" WHERE "id" = '690bc937-8bfd-4945-9a9b-fb3ca19066ea' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PR1T'; -- Amundi US Treasury Bond 0-1Y UCITS ETF, €41.8M
DELETE FROM "etfs" WHERE "id" = 'b85dc511-27ad-44e3-b0b8-53a37198beb8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PRAG'; -- Amundi Prime Global Government Bond UCITS ETF, €30.5M
DELETE FROM "etfs" WHERE "id" = '1d938382-ca14-487e-913b-bc35c609ab8c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PRAP'; -- Amundi Core USD Corporate Bond UCITS ETF, €88.6M
DELETE FROM "etfs" WHERE "id" = 'ee3b133c-1618-45e9-939c-7a4c7f5bde2f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PRAS'; -- Amundi Core US Treasury Bond, €12.8M
DELETE FROM "etfs" WHERE "id" = 'ab16ea77-c52c-4f4d-84fd-dab70eae1c9a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'PUIG'; -- Invesco USD IG Corporate Bond ESG Climate Transition UCITS ETF Dist, €28.6M
DELETE FROM "etfs" WHERE "id" = 'daba1555-2381-40bd-8417-eb38fb09c71a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QCLN'; -- First Trust Nasdaq Clean Edge Green Energy UCITS ETF, €30.3M
DELETE FROM "etfs" WHERE "id" = '88146d31-d080-4a9d-9c56-9a2249ca0670' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QDEV'; -- State Street SPDR S&P Developed Quality Aristocrats UCITS ETF, €26.5M
DELETE FROM "etfs" WHERE "id" = '810ccab5-d5e9-475b-ab9e-b3ce14b2f358' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QGRW'; -- WisdomTree US Quality Growth UCITS ETF, €43.9M
DELETE FROM "etfs" WHERE "id" = 'ede9d067-408e-4be2-bb9e-df576d9ca5d0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QREU'; -- Columbia Ct Qr European Equity Active UCITS ETF, €75.6M
DELETE FROM "etfs" WHERE "id" = '521b9e0b-5125-4701-b657-132118519b1f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QSEP'; -- First Trust Vest Nasdaq-100 Moderate Buffer UCITS ETF, €12.5M
DELETE FROM "etfs" WHERE "id" = '40fe5570-0747-45f6-9d03-1cd3fa330fc7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QSPA'; -- Invesco S&P 500 Quality UCITS ETF, €22.8M
DELETE FROM "etfs" WHERE "id" = '84b34df8-af8a-4e0f-a8e7-4c684856b93c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'QUEU'; -- BNP Paribas Equity Quality Europe, €36.1M
DELETE FROM "etfs" WHERE "id" = 'e840c7c7-afc9-4f60-b0cb-079490d8aefd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'RDVY'; -- First Trust Rising Dividend Achievers UCITS ETF, €30.0M
DELETE FROM "etfs" WHERE "id" = 'cab41700-a95a-4312-b38c-ea1a028cb18f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'RDYN'; -- Robeco Dynamic Theme Machine UCITS ETF, €14.7M
DELETE FROM "etfs" WHERE "id" = '5e7a3519-f19c-45d9-8cff-3b146fc3ab6e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'REMD'; -- Robeco 3D EM Equity UCITS ETF, €28.2M
DELETE FROM "etfs" WHERE "id" = '6d707f53-2d00-43db-b72c-32f1937a6d10' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'REUS'; -- VanEck Circular Economy UCITS ETF, €18.2M
DELETE FROM "etfs" WHERE "id" = 'd1b5b081-fa6e-4b04-85ae-687599d8e6ee' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'RHYE'; -- Robeco Europe Dynamic High Yield UCITS ETF, €13.7M
DELETE FROM "etfs" WHERE "id" = '47a13ed9-fd6c-4dab-9948-be490d6eb737' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'RIZF'; -- Rize Sustainable Future of Food UCITS ETF, €51.8M
DELETE FROM "etfs" WHERE "id" = 'c0ff784c-e8e8-4f5d-911d-085e3747c87e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SAQL'; -- State Street Saudi Arabia Enhanced Active Equity UCITS ETF, €80.5M
DELETE FROM "etfs" WHERE "id" = '2a318873-b453-4535-bc83-cba6c58703fa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC01'; -- Invesco STOXX Europe 600 Optimised Construction & Materials UCITS ETF, €32.5M
DELETE FROM "etfs" WHERE "id" = 'd7dd720a-778f-42ff-85fe-76854195636b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC0E'; -- Invesco MSCI Europe UCITS ETF, €54.8M
DELETE FROM "etfs" WHERE "id" = '86c6112e-852f-4010-95fb-e9514e69663f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC0T'; -- Invesco STOXX Europe 600 Optimised Health Care UCITS ETF, €10.9M
DELETE FROM "etfs" WHERE "id" = '3fdc8b85-8e6d-4d5b-8020-de2f230e17f5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC0V'; -- Source Markets plc - Source STOXX Europe 600 Optimised Oil & Gas UCITS ETF, €19.8M
DELETE FROM "etfs" WHERE "id" = '6d5967bc-f123-4fcb-a632-fa3c3dca046c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC0W'; -- Invesco STOXX Europe 600 Optimised Basic Resources UCITS ETF, €16.5M
DELETE FROM "etfs" WHERE "id" = '6a26e84f-4968-48b5-a89b-20aea5d5b474' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC0Y'; -- Invesco STOXX Europe 600 Optimised Insurance UCITS ETF, €53.7M
DELETE FROM "etfs" WHERE "id" = '0da4fd8f-f112-49be-a0d7-4a52d344915a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SC2X'; -- Xtrackers MSCI AC World Screened UCITS ETF, €29.3M
DELETE FROM "etfs" WHERE "id" = 'f05350ed-443d-4984-b772-5c2cf5d6b766' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SDG9'; -- Xtrackers MSCI Global SDG 9 Industry, Innovation and Infrastructure UCITS ETF, €10.1M
DELETE FROM "etfs" WHERE "id" = '47eb1114-ce38-45e9-8efd-3583fedc2e47' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SEAA'; -- UBS J.P. Morgan USD EM Diversified Bond 1-5 UCITS ETF, €34.4M
DELETE FROM "etfs" WHERE "id" = '67ffa1f1-f198-4a96-9e65-08f893da793c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SEAD'; -- UBS J.P. Morgan USD EM Diversified Bond 1-5 UCITS ETF, €36.4M
DELETE FROM "etfs" WHERE "id" = 'b47cac65-6e6f-4948-a216-b7a4caf650e0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SEUA'; -- State Street SPDR Bloomberg 0-3 Year Euro Corporate Bond UCITS ETF, €20.2M
DELETE FROM "etfs" WHERE "id" = 'eda89a2c-06c8-4015-a0f3-98afd8fc4d4d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SHTE'; -- Ossiam Shiller Barclays CAPE US Sector Tilted TR Fund, €21.5M
DELETE FROM "etfs" WHERE "id" = '253e9158-0a5d-4096-b7b7-0f42c3e62531' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SJEA'; -- Schroder Japan Equity Active UCITS ETF, €35.3M
DELETE FROM "etfs" WHERE "id" = 'e9131364-5462-4a1d-b641-4cb203a6a80b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SJPS'; -- WisdomTree Long JPY Short EUR, €12.5M
DELETE FROM "etfs" WHERE "id" = '6f64dda9-a133-4c27-861f-aa7c4c4d60af' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SM8T'; -- Amundi Index Equity Global Multi Smart Allocation Scientific Beta UCITS ETF, €32.9M
DELETE FROM "etfs" WHERE "id" = '4890b885-ced9-4b64-9375-176fb7411f10' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SMTV'; -- VanEck Morningstar US SMID Moat UCITS ETF, €11.7M
DELETE FROM "etfs" WHERE "id" = 'd5b50747-5122-4e8b-beaa-faa039a65035' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SNP1'; -- L&G S&P 100 UCITS ETF, €71.2M
DELETE FROM "etfs" WHERE "id" = 'f6371cf1-db39-426d-aeee-2f0440c5790c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SNPE'; -- L&G S&P 100 Equal Weight UCITS ETF, €40.2M
DELETE FROM "etfs" WHERE "id" = 'e520cac2-38ed-4bcc-aeb1-289a045536fe' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SOVE'; -- Amundi European Strategic Autonomy, €26.7M
DELETE FROM "etfs" WHERE "id" = '88fe79ad-ea13-43d2-8b71-24b252b56f0d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPF2'; -- State Street SPDR FTSE Global Convertible Bond UCITS ETF, €46.3M, USD line
DELETE FROM "etfs" WHERE "id" = '73286850-de21-40f6-9c08-576e4f430961' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPFA'; -- State Street SPDR Bloomberg Emerging Markets Local Bond UCITS ETF, €92.2M
DELETE FROM "etfs" WHERE "id" = '2c246a68-81cf-4a2e-920f-cd82616cc2d1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPFD'; -- State Street SPDR Bloomberg Emerging Markets Local Bond UCITS ETF, €79.7M
DELETE FROM "etfs" WHERE "id" = '75c40e8b-9024-4485-863b-1e992d54d5c2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPP7'; -- State Street SPDR Barclays 7-10 Year U.S. Treasury Bond UCITS ETF, €14.1M
DELETE FROM "etfs" WHERE "id" = '47064e64-7e84-4ec9-8e3c-5e2283fb678e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPPD'; -- SSgA Barclays Global High Yield Bond Fund, €43.8M
DELETE FROM "etfs" WHERE "id" = '93c7599e-d119-4fd9-b2f0-bf44a38aaf3a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPPQ'; -- State Street SPDR Bloomberg U.S. High Yield Corporate Scored UCITS ETF, €68.4M
DELETE FROM "etfs" WHERE "id" = 'f4f4074b-f0c0-4aa3-8544-11b4799d9a71' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPQB'; -- Global X S&P 500 Quarterly Buffer UCITS ETF, €25.3M
DELETE FROM "etfs" WHERE "id" = 'acca313e-a8f0-47e0-9b63-e4c32bb7a70c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPY2'; -- State Street SPDR Dow Jones Global Real Estate UCITS ETF, €48.4M
DELETE FROM "etfs" WHERE "id" = 'da74698c-a8ca-48c4-a55e-db97a3e024f1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SPYT'; -- State Street SPDR MSCI Europe Communication Services UCITS ETF, €77.6M
DELETE FROM "etfs" WHERE "id" = '9d8619db-421c-4710-946b-cc23f38930b5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ST4R'; -- iShares Space Technologies UCITS ETF, €26.3M
DELETE FROM "etfs" WHERE "id" = '90806758-8290-4aaa-9839-ccf1799caa5a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'STT6'; -- iShares STOXX Europe 600 UCITS ETF, €12.1M
DELETE FROM "etfs" WHERE "id" = '6c331568-0f22-4a1b-8360-fc4e5c494c4b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'STXH'; -- Amundi STOXX Europe 600 UCITS ETF, €54.2M
DELETE FROM "etfs" WHERE "id" = '285d478c-58ec-4473-a598-b0fe90d6c069' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SUUE'; -- Schroder Europe Equity Active UCITS ETF, €21.8M
DELETE FROM "etfs" WHERE "id" = 'b622ee0e-99b9-413d-bd3b-031ac8862a13' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SXRR'; -- iShares $ Floating Rate Bond UCITS ETF, €63.6M
DELETE FROM "etfs" WHERE "id" = '9a3d8567-d043-4cbe-9b01-f3cdf0effa75' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'SYB4'; -- State Street SPDR Bloomberg 3-5 Year Euro Government Bond UCITS ETF, €27.0M
DELETE FROM "etfs" WHERE "id" = '4cc906be-f484-4088-91ee-147e8b90bc15' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'T05A'; -- iShares STOXX Global Select Dividend 100 UCITS ETF (DE), €70.0M
DELETE FROM "etfs" WHERE "id" = '7e6bb9ea-29ab-46d7-898b-4284b075a5a3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'T7EU'; -- Invesco US Treasury Bond 3-7 Year UCITS ETF, €56.2M
DELETE FROM "etfs" WHERE "id" = 'a0783dc9-a61f-4e5d-a317-91d2f9712375' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TAAA'; -- Eldridge Investment Funds - Eldridge Aaa Clo UCITS ETF, €89.9M, USD line
DELETE FROM "etfs" WHERE "id" = '53c885ec-5215-40ef-8143-3d25c15a9dd4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TABC'; -- Janus Henderson EUR IG Bond Paris-aligned Climate Core UCITS, €27.9M
DELETE FROM "etfs" WHERE "id" = 'f0add133-82bb-4892-86a5-97268e3aed04' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TAEH'; -- Janus Henderson Haitong Asia ex-Japan High Yield Corp USD Bond Screened Core, €17.4M
DELETE FROM "etfs" WHERE "id" = '21ab6c93-41f6-4ce0-98a3-3e711d9ec2c0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TCBT'; -- VanEck iBoxx EUR Corporates UCITS ETF, €37.8M
DELETE FROM "etfs" WHERE "id" = 'e39afdf4-9971-433d-807b-fc6d0cf3063f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TCRS'; -- Janus Henderson HMT Global IG Credit Curve Steepener Core UCITS ETF, €54.8M
DELETE FROM "etfs" WHERE "id" = 'f1a93cd5-10e1-4543-8db4-3b539268c83d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TDVX'; -- VanEck Morningstar Developed Markets Ex-Us Dividend Leaders UCITS ETF, €26.6M
DELETE FROM "etfs" WHERE "id" = '436552f4-d020-4edc-a85d-55b642e97b9d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TGAI'; -- TEQ - General Artificial Intelligence UCITS-ETF, €17.1M
DELETE FROM "etfs" WHERE "id" = '57a760f5-da5c-42c0-a399-520f5460f4b0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TGBT'; -- VanEck iBoxx EUR Sovereign Diversified 1-10 UCITS ETF, €28.8M
DELETE FROM "etfs" WHERE "id" = '31cfd18d-3bb5-4eb4-ba98-26e7cf9c2602' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'THFE'; -- Janus Henderson Global High Yield Fallen Angels Paris-aligned Climate Core, €70.9M
DELETE FROM "etfs" WHERE "id" = '0dc1f9e6-c46f-43d4-9ac3-521811568575' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TIGA'; -- L&G India INR Government Bond UCITS ETF, €29.2M
DELETE FROM "etfs" WHERE "id" = '50ade934-98a8-48c7-918b-dc47dd1ced9c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TOPB'; -- L&G Global Brands UCITS ETF, €50.7M
DELETE FROM "etfs" WHERE "id" = '72342a63-84b5-4421-ac07-e711c59eda16' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TR7A'; -- Invesco US Treasury Bond 3-7 Year UCITS ETF, €38.7M
DELETE FROM "etfs" WHERE "id" = '5a29b864-8143-42a7-a3d0-97e2c76318e1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TRD1'; -- Invesco US Treasury Bond 0-1 Year UCITS ETF, €24.3M
DELETE FROM "etfs" WHERE "id" = '3aec5c88-3bc9-4dc6-b800-753849a005d8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TRDL'; -- Invesco US Treasury Bond 10+ Year UCITS ETF, €29.5M
DELETE FROM "etfs" WHERE "id" = '1869692b-99a7-4375-a3d6-144ff5f2c9ee' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TRXA'; -- Invesco US Treasury Bond 7-10 Year UCITS ETF, €51.3M
DELETE FROM "etfs" WHERE "id" = '9575f033-7326-4942-b19a-5af89a587a6e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TRXL'; -- Invesco US Treasury Bond 10+ Year UCITS ETF, €13.2M
DELETE FROM "etfs" WHERE "id" = '59d5f93b-feef-4407-95d1-2ae7e4ce6d05' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'TUCP'; -- Janus Henderson EUR Ultrashort IG Bond Paris-Aligned Climate Core UCITS ETF, €11.1M
DELETE FROM "etfs" WHERE "id" = '4a916a07-7e9b-407d-aa2c-ec071561a5b4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'U8NJ'; -- Sprott Junior Uranium Miners UCITS ETF, €47.5M
DELETE FROM "etfs" WHERE "id" = 'a102e606-d777-46de-aaa5-e8d618eed058' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UBF6'; -- UBS CMCI Commodity Carry ex-Agriculture SF UCITS ETF, €66.2M
DELETE FROM "etfs" WHERE "id" = 'cbb52eb7-611f-43e5-b4f4-867d77850636' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UBF7'; -- UBS CMCI Commodity Carry ex-Agriculture SF UCITS ETF, €21.2M
DELETE FROM "etfs" WHERE "id" = '2dd861cd-12ce-4ee3-a0bf-900dbb6cb5cd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UBUR'; -- UBS Factor MSCI USA Low Volatility UCITS ETF, €36.0M
DELETE FROM "etfs" WHERE "id" = '69ed33d9-8af7-46bc-9eba-4b755e7d5664' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UBUW'; -- UBS Factor MSCI USA Prime Value Screened UCITS ETF, €18.5M
DELETE FROM "etfs" WHERE "id" = '021b5190-8058-4afd-8bd8-13a8fb1adeca' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UBUX'; -- UBS Factor MSCI USA Quality Screened UCITS ETF, €31.2M
DELETE FROM "etfs" WHERE "id" = 'ddf86700-fe88-439a-878d-196853465ad2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UCT2'; -- Lyxor US Curve Steepening 2-10 UCITS ETF, €17.5M
DELETE FROM "etfs" WHERE "id" = '9023abc5-78f1-44b9-b21c-30c998f5dab7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UEEH'; -- iShares Edge MSCI World Minimum Volatility UCITS ETF, €11.0M
DELETE FROM "etfs" WHERE "id" = 'dea6b4b8-6335-45a8-9714-cbe3857b50ba' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UEF0'; -- UBS BBG US Liquid Corp UCITS ETF, €97.3M
DELETE FROM "etfs" WHERE "id" = 'd2c69092-7d4a-49e8-baab-8394b7f18b13' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UEFF'; -- UBS BBG US Treasury 1-3 UCITS ETF, €14.2M
DELETE FROM "etfs" WHERE "id" = 'e8593bae-f3dd-4248-beb7-47d455dfa6b5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UEQ3'; -- UBS CMCI Composite SF UCITS ETF, €23.7M, GBP line
DELETE FROM "etfs" WHERE "id" = '4ae88a97-59bb-49db-8e43-7ef1af0cba48' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UEQV'; -- UBS Cmci Commodity Carry SF UCITS ETF, €35.5M
DELETE FROM "etfs" WHERE "id" = '07113b9f-2a0a-4166-a3bb-49ffac015117' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UIC1'; -- UBS Solactive China Technology UCITS ETF, €75.5M
DELETE FROM "etfs" WHERE "id" = '617bc6a5-56bb-47e8-a6d4-f79eacb9bd89' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UIMZ'; -- UBS Factor MSCI EMU Prime Value Screened UCITS ETF, €63.2M
DELETE FROM "etfs" WHERE "id" = '05c4a966-d410-46df-b9dc-b814c12b4671' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UIQ1'; -- UBS CMCI Ex-Agriculture SF UCITS ETF, €38.9M
DELETE FROM "etfs" WHERE "id" = 'abead813-1dc7-4965-ba45-7d7c4c50978a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UIQL'; -- UBS BBG MSCI Euro Area Liquid Corp 1-5 Sustainable UCITS ETF, €39.6M
DELETE FROM "etfs" WHERE "id" = '6d2b2df7-8e1f-4bd8-87d1-15b8fb224183' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UIQN'; -- UBS MSCI EMU Select Factor Mix UCITS ETF, €16.2M
DELETE FROM "etfs" WHERE "id" = 'e71e16ff-2523-4d56-a380-a46845579098' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UK1T'; -- Saba Capital Investment Trusts UCITS ETF, €46.7M
DELETE FROM "etfs" WHERE "id" = '753e52ae-a41e-4982-86f7-ba6892ac8965' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UKPH'; -- iShares UK Property UCITS ETF, €12.9M
DELETE FROM "etfs" WHERE "id" = '3daaf9c0-3e6a-472a-9382-d99fbcef674c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UKRN'; -- Defiance Ukraine Reconstruction UCITS ETF, €18.4M
DELETE FROM "etfs" WHERE "id" = '817d1d39-71fe-4e6a-95ab-73cecf439429' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ULDE'; -- iShares MSCI USA Leaders UCITS ETF, €15.4M
DELETE FROM "etfs" WHERE "id" = '8becf95f-cfab-4165-b732-e13b45c43ec7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UQB1'; -- Allsolutions ETF Icav - Uniactive Q Corporate Bonds Euro Enhanced UCITS ETF, €64.9M
DELETE FROM "etfs" WHERE "id" = 'ca130a82-f93b-44a7-ad15-4ec48288ca44' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UQB2'; -- Allsolutions ETF Icav - Uniactive Q Corporate Bonds Euro Enhanced UCITS ETF, €30.5M
DELETE FROM "etfs" WHERE "id" = '9f05ea0e-c0bc-4197-b4f1-220c93d4ed7c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UQE2'; -- Uniactive Q Equities Global Enhanced UCITS ETF, €84.3M
DELETE FROM "etfs" WHERE "id" = 'b07fb137-3df4-4636-b939-d5864c26db04' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'UQM1'; -- Allsolutions ETF ICAV - UniActive Q Equities Emerging Markets Enhanced UCITS ETF, €52.4M
DELETE FROM "etfs" WHERE "id" = 'a3e1c746-e10b-4f7b-aa58-8936b8595311' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'US4E'; -- State Street SPDR S&P 400 US Mid Cap UCITS ETF, €61.3M
DELETE FROM "etfs" WHERE "id" = '87fef84c-5523-421c-b5da-4f74c65447e8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'USBG'; -- Amundi Global Corporate Bond UCITS ETF USD Hedged Acc, €13.7M, USD line
DELETE FROM "etfs" WHERE "id" = '40e18726-e02d-4359-9502-d1da92ed56f3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'USIQ'; -- AI-Enhanced US Equities UCITS ETF, €58.5M
DELETE FROM "etfs" WHERE "id" = 'ade6cd29-5f50-4e9b-ac2c-1a4cf4075707' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V20D'; -- Vanguard Lifestrategy 20 Equity UCITS ETF, €16.5M
DELETE FROM "etfs" WHERE "id" = 'ce38f829-d1ef-4053-9fb3-0334afc8a82c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V2SA'; -- Vanguard Russell 2000 U.S. Small-Cap UCITS ETF, €12.2M
DELETE FROM "etfs" WHERE "id" = 'e6106133-d075-4e05-87ab-b2710e16c763' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V3DL'; -- Vanguard ESG Developed Europe All Cap UCITS ETF, €34.7M
DELETE FROM "etfs" WHERE "id" = '9023684a-8b46-4a96-af3a-d1e6f3f81fa0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V3ML'; -- Vanguard ESG Emerging Markets All Cap UCITS ETF, €21.1M
DELETE FROM "etfs" WHERE "id" = '663118de-4830-4260-9969-8506038e61eb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V3PL'; -- Vanguard ESG Developed Asia-Pacific All Cap UCITS ETF, €52.6M
DELETE FROM "etfs" WHERE "id" = '1bb55931-8847-4208-a1e7-a36a5eb7b05e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V3RF'; -- Vanguard ESG EUR Corporate Bond UCITS ETF, €10.7M
DELETE FROM "etfs" WHERE "id" = 'a9cd4e19-cb46-4040-8d17-1d4dabaaea56' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V3YL'; -- Vanguard ESG North America All Cap UCITS ETF, €30.4M
DELETE FROM "etfs" WHERE "id" = '97620eeb-5ce9-4609-a4f0-6f0b9c05e0c3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'V40D'; -- Vanguard Lifestrategy 40 Equity UCITS ETF, €59.6M
DELETE FROM "etfs" WHERE "id" = 'a6774c96-cc30-431e-b6de-c428435ecde6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VALU'; -- BNP Paribas Equity Value Europe, €45.1M
DELETE FROM "etfs" WHERE "id" = 'e8da304d-42aa-4de1-bc28-3d6ddb7b8d8f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VE6I'; -- VanEck Vectors Sustainable Future Of Foods UCITS ETF, €14.4M
DELETE FROM "etfs" WHERE "id" = 'd2f7feb1-ced0-4dfa-993f-cbd4f71b8a1e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VEDA'; -- Vanguard FTSE Developed Europe Small-Cap UCITS ETF, €72.5M
DELETE FROM "etfs" WHERE "id" = '1231f07f-84e7-4aca-9323-4b10e627b779' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VEGE'; -- Vanguard EUR EUROZONE GOVERNMENT 1-3 YEAR BOND UCITS ETF, €20.0M
DELETE FROM "etfs" WHERE "id" = 'a996ae64-7b69-4b5d-92dd-d0ac300ded6c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VGCE'; -- Vanguard EUR Corporate 1-3 Year Bond UCITS ETF, €45.5M
DELETE FROM "etfs" WHERE "id" = 'a1f83af9-8576-48ed-a1d8-2c7e049b0dd2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VGGF'; -- Vanguard Global Government Bond UCITS ETF, €99.0M
DELETE FROM "etfs" WHERE "id" = '74b1ca8c-c7cf-41bc-8d95-912d3971e4cd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VGSA'; -- Vanguard FTSE Global Small-cap UCITS ETF, €35.0M
DELETE FROM "etfs" WHERE "id" = '18198120-7549-4695-a78f-c329ae02f3fa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VGSD'; -- Vanguard FTSE Global Small-cap UCITS ETF, €10.4M
DELETE FROM "etfs" WHERE "id" = 'b42a10a8-5f01-4676-a904-bc3095756c6c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VIGB'; -- VanEck iBoxx EUR Sovereign Capped AAA-AA 1-5 UCITS ETF, €51.9M
DELETE FROM "etfs" WHERE "id" = '3b0e9cb0-9165-464c-89a4-d37ddb61c5fc' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VITS'; -- Vanguard U.S. Treasury 3-7 Year Bond UCITS ETF, €21.1M
DELETE FROM "etfs" WHERE "id" = '75bfaee8-0e46-47ff-b9c8-fa5c69737245' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VJPE'; -- Vanguard FTSE Japan UCITS ETF, €88.8M
DELETE FROM "etfs" WHERE "id" = '07b867d2-ab2c-4752-a093-246172cb9896' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VLDS'; -- Vanguard U.S. Treasury 7-10 Year Bond UCITS ETF, €21.0M
DELETE FROM "etfs" WHERE "id" = '1012b0d3-7da9-43fb-b1f5-6bbe5666e197' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VLEU'; -- BNP Paribas Equity Low Vol Europe, €60.3M
DELETE FROM "etfs" WHERE "id" = '9df21e3a-00d8-4f09-bbd3-83ebd3482d3e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VOOM'; -- Lyxor Global Gender Equality (DR) UCITS ETF, €49.1M
DELETE FROM "etfs" WHERE "id" = 'b2837259-a681-4a49-9058-eb73c63711af' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VOON'; -- Amundi Nasdaq-100 Daily (-1x) Inverse UCITS ETF, €45.7M
DELETE FROM "etfs" WHERE "id" = '3b5a50da-d777-4ff6-8beb-0535a2987ca8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VRGU'; -- Vanguard Russell 1000 U.S. Growth UCITS ETF, €22.4M
DELETE FROM "etfs" WHERE "id" = 'e28c7bc6-9bea-40e0-a421-91b73cc7ee43' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VS0L'; -- VanEck ETP AG, €72.5M
DELETE FROM "etfs" WHERE "id" = 'cc57ca57-25a7-4e58-8a9b-37fc0a0f2215' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VT0P'; -- VanEck Vectors Crypto Leaders ETN, €53.2M
DELETE FROM "etfs" WHERE "id" = 'f39a0959-0761-4655-83ec-a80072258059' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'VYUS'; -- WisdomTree US Value UCITS ETF, €13.5M
DELETE FROM "etfs" WHERE "id" = '81472230-0c51-4f11-b12c-af80cd3e56d1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'W311'; -- Harbor Health Care UCITS ETF, €13.0M
DELETE FROM "etfs" WHERE "id" = 'bcfbfa13-9537-449b-9503-60889c0aac48' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WBKN'; -- WisdomTree Blockchain UCITS ETF, €37.6M
DELETE FROM "etfs" WHERE "id" = 'c9a05a17-2cd9-4992-a665-357081010f77' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WBLC'; -- WisdomTree Issuer X Limited, €12.8M
DELETE FROM "etfs" WHERE "id" = 'a57d45cb-7297-45c5-ba58-85617b93e0a7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDEE'; -- Invesco S&P World Energy ESG UCITS ETF, €32.5M
DELETE FROM "etfs" WHERE "id" = 'ac239d49-bd91-4a07-aca7-8d38291f9316' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDEY'; -- Invesco Wind Energy UCITS ETF, €15.6M
DELETE FROM "etfs" WHERE "id" = '30cf1a3e-a63a-485d-872e-cb1179d95e61' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDGE'; -- WisdomTree US Quality Dividend Growth UCITS ETF, €11.3M
DELETE FROM "etfs" WHERE "id" = 'e1c16dd7-75ac-4033-b5cd-03b412098746' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDRD'; -- WisdomTree Defensive Defined Return Autocallable EUR Active UCITS ETF, €27.6M
DELETE FROM "etfs" WHERE "id" = 'e5a227da-fee9-4534-b4b2-63765be9e40a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDRT'; -- WisdomTree Defined Return Autocallable EUR Active UCITS ETF, €23.4M
DELETE FROM "etfs" WHERE "id" = 'ae06846a-6ea9-4e02-a704-6be6e0949a77' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDSD'; -- State Street SPDR MSCI World Small Cap UCITS ETF, €44.8M
DELETE FROM "etfs" WHERE "id" = '259adc26-5814-4153-9c02-ec9a332527fc' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WDTE'; -- Invesco S&P World Information Technology ESG UCITS ETF, €33.7M
DELETE FROM "etfs" WHERE "id" = '119a1270-7f5e-41c1-9bc5-7d4cd78d14d9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WEBC'; -- Amundi MSCI North America ESG Climate Net Zero Ambition CTB UCITS ETF, €47.8M
DELETE FROM "etfs" WHERE "id" = 'ee16339d-dc51-4911-a160-7a92bac8d793' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WEIF'; -- WisdomTree Europe Infrastructure UCITS ETF, €26.5M
DELETE FROM "etfs" WHERE "id" = '46245fa4-ae0c-4a1e-8c6d-da86d9b18f62' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELC'; -- Amundi S&P Global Consumer Discretionary ESG UCITS ETF, €15.7M
DELETE FROM "etfs" WHERE "id" = '33eeb3ab-4aab-445f-9d77-41b24ed7ac45' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELL'; -- Amundi S&P Global Communication Services Esg, €70.9M
DELETE FROM "etfs" WHERE "id" = '32a85165-87a7-4daf-9861-be708d62e6e6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELM'; -- Amundi S&P Global Consumer Staples ESG UCITS ETF, €14.9M
DELETE FROM "etfs" WHERE "id" = 'd9c1d19f-a197-4dc3-8937-e6fa74f18f79' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELP'; -- Amundi S&P Global Energy Carbon Reduced UCITS ETF, €16.0M
DELETE FROM "etfs" WHERE "id" = '1d9fab3c-06b1-4009-bf97-0d147e874904' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELQ'; -- Amundi S&P Global Utilities ESG UCITS ETF, €18.7M
DELETE FROM "etfs" WHERE "id" = 'd6bf8131-960f-43b9-8d71-c00a3d73fb0a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELR'; -- Amundi S&P Global Communication Services Esg, €23.9M
DELETE FROM "etfs" WHERE "id" = '30aae5ea-4512-4790-9ce4-52f4ac0974a5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELT'; -- Amundi S&P Global Industrials ESG UCITS ETF, €17.8M
DELETE FROM "etfs" WHERE "id" = 'a541d574-1510-458d-a27d-c0478b1f9188' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELV'; -- Amundi S&P Global Materials ESG UCITS ETF, €12.6M
DELETE FROM "etfs" WHERE "id" = 'a680de17-a7a7-4606-91d6-caa3088e4e5c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WELY'; -- Amundi S&P World Financials Screened UCITS ETF, €32.5M
DELETE FROM "etfs" WHERE "id" = 'ccaeea9c-c833-4919-bf9d-d3ab7051e616' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WEMT'; -- WisdomTree True Emerging Markets UCITS ETF, €29.2M
DELETE FROM "etfs" WHERE "id" = '375b7128-cf4e-4c95-bd58-1804843de67e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WENH'; -- WisdomTree Strategic Metals UCITS ETF, €84.7M
DELETE FROM "etfs" WHERE "id" = '387b9215-6ec5-4d8e-b485-943b6586deaf' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WENU'; -- WisdomTree Strategic Metals UCITS ETF, €46.5M
DELETE FROM "etfs" WHERE "id" = 'fed9e4bf-5403-4a8d-8423-031f8310aa3e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WGDP'; -- Amundi FTSE All World Gdp-Weighted UCITS ETF, €28.7M
DELETE FROM "etfs" WHERE "id" = '86e20067-de2c-4077-86cb-87dedc0d6cdd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WGES'; -- Amundi MSCI World SRI Climate Net Zero Ambition PAB UCITS ETF, €73.2M
DELETE FROM "etfs" WHERE "id" = '67a8f2d6-240f-4301-abb9-758f22f035b2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WGRU'; -- WisdomTree Global Quality Dividend Growth UCITS ETF, €12.5M
DELETE FROM "etfs" WHERE "id" = 'e0c9c615-b33e-4540-84a3-a3fa00617dd3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WH2E'; -- Invesco S&P World Health Care ESG UCITS ETF, €11.5M
DELETE FROM "etfs" WHERE "id" = 'f17e42b5-9398-4fc3-b8d0-6f1612482b2d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WIMI'; -- Xtrackers MSCI World Imi UCITS ETF, €23.7M
DELETE FROM "etfs" WHERE "id" = 'ec92fceb-0dc2-4a73-a919-76b0d04d1749' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WMOT'; -- VanEck Morningstar US Sustainable Wide Moat UCITS ETF, €37.2M
DELETE FROM "etfs" WHERE "id" = '80602a9d-2250-4a64-a676-6b26ef19ed03' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WRNA'; -- WisdomTree Biorevolution UCITS ETF, €36.7M
DELETE FROM "etfs" WHERE "id" = 'fcc1545a-9c69-408a-84ee-51e5c22670d5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WSPC'; -- WisdomTree Space Economy UCITS ETF, €18.9M
DELETE FROM "etfs" WHERE "id" = '74e533b0-a128-4726-bd42-f9c9c2629fd1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTD7'; -- WisdomTree Europe SmallCap Dividend UCITS ETF, €35.2M
DELETE FROM "etfs" WHERE "id" = '5ca2c5d0-90c7-44cc-bc70-e31f763b2e6d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTDH'; -- WisdomTree Europe Equity UCITS ETF, €30.1M
DELETE FROM "etfs" WHERE "id" = '6bcf542a-42fe-49cd-82ff-d93b0660afdd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTDI'; -- WisdomTree AT1 CoCo Bond UCITS ETF, €36.6M
DELETE FROM "etfs" WHERE "id" = '2b937efc-0fce-42aa-b659-b1bbf4f4b960' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTED'; -- WisdomTree Emerging Markets SmallCap Dividend UCITS ETF, €38.3M
DELETE FROM "etfs" WHERE "id" = 'e9fb63b2-ba0e-4c70-ae2d-6511c7062cd4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTEF'; -- WisdomTree US Efficient Core UCITS ETF, €20.5M
DELETE FROM "etfs" WHERE "id" = '8c3beb04-eccc-451b-9ad8-2a6c6af27bac' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTEH'; -- WisdomTree Enhanced Commodity UCITS ETF, €46.4M
DELETE FROM "etfs" WHERE "id" = 'baba84b5-0ff0-4965-9ec9-a34106d90a46' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTES'; -- WisdomTree Europe SmallCap Dividend UCITS ETF, €50.2M
DELETE FROM "etfs" WHERE "id" = '2df52369-c509-45bc-b8e3-5bc35d5e5d06' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTEU'; -- WisdomTree US Equity Income UCITS ETF, €56.2M
DELETE FROM "etfs" WHERE "id" = 'e91ba819-453c-48b0-8a0f-ef4039729a2d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTIF'; -- WisdomTree Japan Equity UCITS ETF, €77.7M
DELETE FROM "etfs" WHERE "id" = 'eca682e2-a46d-48f7-b433-05b88078aa52' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTIG'; -- WisdomTree AT1 CoCo Bond UCITS ETF, €43.9M
DELETE FROM "etfs" WHERE "id" = 'ea86fe8c-906d-46be-a814-f460806e4ba4' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTIM'; -- WisdomTree Eurozone Quality Dividend Growth UCITS ETF, €39.1M
DELETE FROM "etfs" WHERE "id" = '3945cddd-f0b3-4f9a-a171-32d6d40a1bae' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WTRE'; -- WisdomTree New Economy Real Estate UCITS ETF, €14.0M
DELETE FROM "etfs" WHERE "id" = 'b2f55628-ec3a-4a0c-9ffa-69f54a993d42' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'WUSA'; -- Amundi Index Solutions-Core MSCI USA Swap UCITS ETF, €57.5M
DELETE FROM "etfs" WHERE "id" = '2b21df9f-e004-48e9-bd00-820f64c56b6d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'X03C'; -- Xtrackers Eurozone Government Bond 3-5 UCITS ETF, €34.3M
DELETE FROM "etfs" WHERE "id" = '5d08dae5-146e-454a-b82c-eb70f665c3d8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'X1GD'; -- Amundi Govt Bond Lowest Rated EuroMTS Investment Grade, €74.3M
DELETE FROM "etfs" WHERE "id" = '2afde32d-2db9-4447-ba0b-e226cc5b10b1' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XAHY'; -- Xtrackers EUR High Yield Corporate Bond Active UCITS ETF, €90.6M
DELETE FROM "etfs" WHERE "id" = '847ad8b6-fde9-4a84-aa90-c9c98f680750' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XAIG'; -- EUR Investment Grade Corporate Bond Active UCITS ETF, €10.0M
DELETE FROM "etfs" WHERE "id" = '4b1cc498-e580-4550-9458-922ffaf4d5e9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XAIN'; -- Xtrackers MSCI Indonesia Swap UCITS ETF, €48.9M
DELETE FROM "etfs" WHERE "id" = 'ced234e4-80dc-460f-b359-09a04d68be66' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XASB'; -- Xtrackers Ii Salam USD Global Aggregate Sukuk UCITS ETF, €36.8M
DELETE FROM "etfs" WHERE "id" = '016112c6-fd04-4d21-b474-bcfb29b1d986' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XB28'; -- Xtrackers Target Maturity Sept 2028 EUR Corporate Bond UCITS ETF, €35.6M
DELETE FROM "etfs" WHERE "id" = '3d3ff662-9f46-4037-a2e8-d778b4809083' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XB30'; -- Xtrackers Target Maturity Sept 2030 EUR Corporate Bond UCITS ETF, €33.5M
DELETE FROM "etfs" WHERE "id" = 'e0617e37-c353-4e2d-b177-3bb313c4c4bc' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XB32'; -- Xtrackers Target Maturity Sept 2032 EUR Corporate Bond UCITS ETF, €17.0M
DELETE FROM "etfs" WHERE "id" = 'b4d6dc2d-4c93-4f9e-ac7d-29c3b586a3c7' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XB34'; -- Xtrackers Target Maturity Sept 2034 EUR Corporate Bond UCITS ETF, €11.0M
DELETE FROM "etfs" WHERE "id" = '5ae1d4ff-e6e4-468d-8630-96ed35c2beb5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XB35'; -- Xtrackers II Target Maturity Sept 2035 EUR Corporate Bond UCITS ETF, €11.7M
DELETE FROM "etfs" WHERE "id" = 'a124ceff-069f-4698-9db6-cec2ec94e030' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBAK'; -- Xtrackers MSCI Pakistan Swap UCITS ETF, €18.2M
DELETE FROM "etfs" WHERE "id" = 'a9456bc0-7f28-48e7-849b-3bb31448284b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBAT'; -- Xtrackers II Target Maturity Sept 2029 Italy and Spain Government Bond UCITS ETF, €10.2M
DELETE FROM "etfs" WHERE "id" = '25a437ee-2171-4958-b959-13325312ccfa' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBCT'; -- Xtrackers iBoxx Germany Covered Bond Swap UCITS ETF, €19.7M
DELETE FROM "etfs" WHERE "id" = '50ff10f3-e125-4607-bb75-7f62e4217f25' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBI0'; -- Xtrackers World Biodiversity Focus SRI UCITS ETF, €22.9M
DELETE FROM "etfs" WHERE "id" = '86608fc1-09d2-43f4-bf41-2e8b4a08a5d0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBJQ'; -- WisdomTree Short USD Long EUR, €56.7M
DELETE FROM "etfs" WHERE "id" = '6381da74-905c-425e-a22a-a74c2d7bb24c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBO2'; -- Xtrackers Italy Government Bond 0-1 Swap UCITS ETF, €42.9M
DELETE FROM "etfs" WHERE "id" = '7db9e354-79dd-4c5f-91ff-136ec11281b6' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XBUZ'; -- Xtrackers USA Biodiversity Focus SRI UCITS ETF, €11.2M
DELETE FROM "etfs" WHERE "id" = 'acd3aad5-e85d-4d88-9bad-0fb02a79232a' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XCBE'; -- Xtrackers DB Bloomberg Commodity Optimum Yield Swap UCITS ETF, €48.3M
DELETE FROM "etfs" WHERE "id" = 'c0de311d-ca90-46c7-9f4e-3384c97352eb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XCEU'; -- Xtrackers MSCI EMU Climate Transition UCITS ETF, €17.4M
DELETE FROM "etfs" WHERE "id" = 'af64eee0-c576-47f0-ad38-82f7b84b28ec' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XCO2'; -- Amundi Global Aggregate Proceeds Bond 1-10Y UCITS ETF, €15.2M
DELETE FROM "etfs" WHERE "id" = '5ef369f7-07c0-4b0b-84d8-39f221278e83' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XCS3'; -- Xtrackers MSCI Malaysia UCITS ETF, €46.1M
DELETE FROM "etfs" WHERE "id" = '190128b9-e952-4f25-8908-0ae87daa5683' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XCTE'; -- Xtrackers Harvest MSCI China Tech 100 ESG Screened UCITS ETF, €39.2M
DELETE FROM "etfs" WHERE "id" = '9bd4bb48-d820-4676-aa43-265002c4ea08' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XCTW'; -- Xtrackers MSCI World Climate Transition UCITS ETF, €22.4M
DELETE FROM "etfs" WHERE "id" = '576695c0-03ae-4d60-a38d-3d9087d02256' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDCC'; -- Xtrackers USD Corporate Bond UCITS ETF, €66.5M, USD line
DELETE FROM "etfs" WHERE "id" = '8107cd11-ea6d-4b4d-8b90-75fd2b979b89' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDEF'; -- Xtrackers Europe Defence Technologies UCITS ETF, €37.9M
DELETE FROM "etfs" WHERE "id" = '587ac821-c168-4ace-90d1-8a6f4ad9a3dd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDG3'; -- Xtrackers MSCI Global SDG 3 Good Health UCITS ETF, €25.3M
DELETE FROM "etfs" WHERE "id" = 'e12ccbfd-8544-4f47-8361-41f010379c10' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDG7'; -- Xtrackers MSCI Global SDG 7 Affordable And Clean Energy UCITS ETF, €27.1M
DELETE FROM "etfs" WHERE "id" = '53bdd711-09a7-4ec9-9552-203ba6c75b5f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDGM'; -- Xtrackers MDAX ESG Screened UCITS ETF, €72.9M
DELETE FROM "etfs" WHERE "id" = '99ea4406-b85b-45fc-b156-ed79d2e1688d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDJX'; -- Xtrackers Dje Europe Equity Research UCITS ETF, €66.2M
DELETE FROM "etfs" WHERE "id" = 'eff8cdf6-6481-4c3b-99f5-dfc8d70fd342' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDNE'; -- Xtrackers MSCI Japan Screened UCITS ETF, €67.3M
DELETE FROM "etfs" WHERE "id" = '4805a32a-2870-49a4-aa0d-e85b911a3f1e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XDPD'; -- Xtrackers S&P 500 UCITS ETF, €58.6M
DELETE FROM "etfs" WHERE "id" = '63672dd9-7f98-40b2-9d47-859e94756c91' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XE01'; -- Xtrackers Eurozone Government Bond 0-1 UCITS ETF, €18.8M
DELETE FROM "etfs" WHERE "id" = '3d5742fa-984a-4f08-867c-9253f07ba91c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XEC1'; -- Xtrackers EUR Corporate Bond UCITS ETF, €53.6M
DELETE FROM "etfs" WHERE "id" = '82bed6d9-1274-4b46-86bf-196444947bcf' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XECT'; -- Xtrackers MSCI Europe Climate Transition UCITS ETF, €16.9M
DELETE FROM "etfs" WHERE "id" = '77af2c5b-dd9f-4de4-8be0-eb5af4c82d00' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XEEE'; -- Xtrackers Europe Equity Enhanced Active UCITS ETF, €67.3M
DELETE FROM "etfs" WHERE "id" = '2f6991eb-311b-4046-9793-c96c1e2b74ad' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XEML'; -- Xtrackers II J.P. Morgan EM Local Government Bond UCITS ETF, €18.8M
DELETE FROM "etfs" WHERE "id" = '558bd19a-d5eb-4e8b-b668-537b902def92' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XEMN'; -- Xtrackers Emerging Markets Net Zero Pathway Paris Aligned UCITS ETF, €15.5M
DELETE FROM "etfs" WHERE "id" = 'f117c941-a6a3-42bc-b9f0-2e978c2b5b87' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XEQL'; -- Xtrackers S&P 500 Equal Weight Swap UCITS ETF, €19.5M
DELETE FROM "etfs" WHERE "id" = 'd295c136-3c2f-4c10-b9c6-0bf54745499e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XEZG'; -- Xtrackers Eurozone Government Bond 1-10 UCITS ETF, €17.7M
DELETE FROM "etfs" WHERE "id" = 'f623c7bc-384f-4418-9a91-e36e9e92f473' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XFLN'; -- Xtrackers Floating Rate Notes Active UCITS ETF, €32.3M
DELETE FROM "etfs" WHERE "id" = 'ee8e1b8b-aa6b-4d0e-8fd6-987cb50dc119' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XFNT'; -- Xtrackers MSCI Fintech Innovation UCITS ETF, €11.3M
DELETE FROM "etfs" WHERE "id" = '1453fefb-3e1d-4a67-a172-ad1cbc028065' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XGB4'; -- Xtrackers Global Government Bond UCITS ETF, €79.0M
DELETE FROM "etfs" WHERE "id" = '46f1cfea-52f7-4da6-8940-5cdd6c66c807' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XGBU'; -- Xtrackers USD Corporate Green Bond UCITS ETF, €19.3M
DELETE FROM "etfs" WHERE "id" = '6ad0d2fe-cb70-4cbb-93d1-f71bede8f606' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XGEN'; -- Xtrackers MSCI World Biotechnology UCITS ETF, €12.1M
DELETE FROM "etfs" WHERE "id" = '6e2fa746-85cb-49cb-8e85-bdcffc300b43' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XGEZ'; -- Xtrackers II Eurozone Government Green Bond UCITS ETF, €11.0M
DELETE FROM "etfs" WHERE "id" = 'bad89d32-2548-491e-872e-9bb4af2ba628' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XGLF'; -- Xtrackers MSCI GCC Select Swap UCITS ETF, €20.7M
DELETE FROM "etfs" WHERE "id" = '30daf5bd-d070-4e21-b9b1-31ae772b948b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XGUE'; -- Xtrackers USD Corporate Green Bond UCITS ETF, €43.3M
DELETE FROM "etfs" WHERE "id" = 'ac1b0faa-8824-42b6-aa26-113024f8605c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XHW0'; -- Xtrackers Global High Yield Corporate Bond UCITS ETF, €12.5M
DELETE FROM "etfs" WHERE "id" = '8c9fac67-9b7e-43ac-84e1-89255efed6df' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XIFE'; -- Xtrackers S&P Global Infrastructure UCITS ETF, €12.4M
DELETE FROM "etfs" WHERE "id" = '7dcd9456-4291-4f47-a1c2-767841a91121' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XIGB'; -- Xtrackers India Government Bond UCITS ETF, €46.5M
DELETE FROM "etfs" WHERE "id" = '3d79a850-cc2a-4ae2-ac7e-5b329c9a5d03' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XLAI'; -- WisdomTree AI Infrastructure UCITS ETF, €14.1M
DELETE FROM "etfs" WHERE "id" = '6971908e-9a9b-49ee-adda-8ae140506d4e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XLME'; -- 21Shares Stellar (XLM) ETP, €13.6M
DELETE FROM "etfs" WHERE "id" = '572869aa-e563-45af-9481-5b127eae1080' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XM27'; -- Xtrackers II Target Maturity Sept 2027 EUR Corporate Bond UCITS ETF, €36.4M
DELETE FROM "etfs" WHERE "id" = '481deb20-c916-49ae-a02b-9f4ba170224b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XM31'; -- Xtrackers II Target Maturity Sept 2031 EUR Corporate Bond UCITS ETF, €44.6M
DELETE FROM "etfs" WHERE "id" = '2f8bf70b-835c-4e9d-867a-9966115c7493' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XM33'; -- Xtrackers II Target Maturity Sept 2033 EUR Corporate Bond UCITS ETF, €24.3M
DELETE FROM "etfs" WHERE "id" = 'a1cd2f3b-856a-4bab-a585-9ba78792a478' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XMAE'; -- Xtrackers MSCI AC World ESG Screened UCITS ETF, €88.6M
DELETE FROM "etfs" WHERE "id" = 'ff6624c0-0285-4dfa-943d-9368691640e8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XMCX'; -- Xtrackers FTSE 250 UCITS ETF, €35.2M
DELETE FROM "etfs" WHERE "id" = '247c8ff2-c5a7-4316-8ae3-6d61c96fa615' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XMEA'; -- Xtrackers MSCI EM Europe, Middle East & Africa Swap UCITS ETF, €41.5M
DELETE FROM "etfs" WHERE "id" = '1ac336f9-ef04-459d-8816-0fec82713a39' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XMN1'; -- Xtrackers MSCI Nordic UCITS ETF, €61.8M
DELETE FROM "etfs" WHERE "id" = '20bf0dc0-d93e-4006-910b-5f487a119da9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XMVE'; -- Xtrackers MSCI EMU Screened UCITS ETF, €11.6M
DELETE FROM "etfs" WHERE "id" = 'b8988889-6a39-4010-b321-99a22a347d26' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XNZN'; -- Xtrackers Nordic Net Zero Pathway Paris Aligned UCITS ETF, €15.1M
DELETE FROM "etfs" WHERE "id" = 'ec6f16e5-f2b2-460e-b90f-54e2aa0d2e9d' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XPFI'; -- Xtrackers Postfinance Global Portfolio Xtrackers UCITS ETF, €10.5M
DELETE FROM "etfs" WHERE "id" = '84b6a84c-1a9d-4eec-8f18-a229b715631b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XPQP'; -- Xtrackers MSCI Philippines UCITS ETF, €31.7M
DELETE FROM "etfs" WHERE "id" = 'fd32a199-3a4a-455b-a2ed-5d0cd6a80c32' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XQUD'; -- Xtrackers ESG USD Emerging Markets Bond Quality Weighted UCITS ETF, €27.4M
DELETE FROM "etfs" WHERE "id" = 'd4871419-90a2-4b82-86bc-7c3bf78caaf8' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XQUE'; -- Xtrackers ESG USD Emerging Markets Bond Quality Weighted UCITS ETF, €87.0M
DELETE FROM "etfs" WHERE "id" = 'c048e8ee-ca3d-40f9-b30b-d37b9254e773' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XREA'; -- Xtrackers FTSE Developed Europe ex UK Real Estate UCITS ETF, €16.8M
DELETE FROM "etfs" WHERE "id" = '261c8e77-a247-4cbb-8b8c-ae59e26766dd' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XS7W'; -- Concept Fund Solutions plc - db x-trackers Portfolio Income UCITS ETF, €57.6M
DELETE FROM "etfs" WHERE "id" = 'be7f9b2d-1f4f-4970-b9da-c547a665faeb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XS8R'; -- Xtrackers MSCI Europe Information Technology Screened UCITS ETF, €35.7M
DELETE FROM "etfs" WHERE "id" = 'ca19886d-79b2-42ea-9c91-b536a0c2713c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XSOE'; -- WisdomTree Emerging Markets ex-State-Owned Enterprises Fund, €19.2M
DELETE FROM "etfs" WHERE "id" = 'c20fad21-4270-4335-955f-4dc247ec9c69' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XSWD'; -- Xtrackers MSCI World Small Cap UCITS ETF, €15.2M
DELETE FROM "etfs" WHERE "id" = '58b76820-fd8c-4e20-872b-ccfc24dbdb80' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XSXE'; -- Xtrackers STOXX Europe 600 UCITS ETF, €12.6M
DELETE FROM "etfs" WHERE "id" = '66e674f8-ea65-4f5d-8b49-d354f65a3fe2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XSXX'; -- Xtrackers Euro STOXX UCITS ETF, €55.0M
DELETE FROM "etfs" WHERE "id" = '65827db6-8959-4059-94ac-4414ae8f3bf9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XTC5'; -- Xtrackers iTraxx Crossover Short Daily Swap UCITS ETF, €19.6M
DELETE FROM "etfs" WHERE "id" = 'c9099050-5ff8-43f6-86ab-1ca73d039214' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XTIP'; -- Xtrackers II TIPS US Inflation-Linked Bond UCITS ETF, €13.2M
DELETE FROM "etfs" WHERE "id" = '4f0198cd-e487-4ddc-b3ba-26e64ae11135' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XU6C'; -- BNP Paribas Easy MSCI Emerging SRI PAB, €25.7M
DELETE FROM "etfs" WHERE "id" = '3351f1e4-3d5d-43ec-8bad-9cb45bc08a94' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XWEB'; -- Xtrackers MSCI World Minimum Volatility ESG UCITS ETF, €30.5M
DELETE FROM "etfs" WHERE "id" = 'aacb246d-9c63-4f2a-b6e7-48e644e4e447' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XY2D'; -- Xtrackers iBoxx Eurozone Government Bond Yield Plus 1-3 UCITS ETF, €36.4M
DELETE FROM "etfs" WHERE "id" = 'efc70263-6ec0-417d-a35e-dfedf08a17e3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XYLE'; -- Xtrackers USD Corporate Bond Short Duration SRI PAB UCITS ETF, €25.0M
DELETE FROM "etfs" WHERE "id" = '3dc2b17d-da38-4327-9a5a-cdbc29fb10d9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZ10'; -- Xtrackers Eurozone Government Bond 10+ ESG Tilted UCITS ETF, €15.7M
DELETE FROM "etfs" WHERE "id" = 'c8ec0c42-c634-4580-b513-7a953deaee3b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZBE'; -- Xtrackers USD Corporate Bond SRI PAB UCITS ETF, €56.0M
DELETE FROM "etfs" WHERE "id" = 'e4689778-afb1-479f-9e33-d48ac706eb53' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZDE'; -- Xtrackers MSCI Europe High Dividend Yield ESG UCITS ETF, €41.7M
DELETE FROM "etfs" WHERE "id" = '091041a4-74d2-4f0c-8e6a-7454720320db' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZDW'; -- Xtrackers MSCI World High Dividend Yield ESG UCITS ETF, €38.1M
DELETE FROM "etfs" WHERE "id" = 'e12ecbcb-2b04-4745-90e0-73adad552c2c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZDZ'; -- Xtrackers MSCI EMU High Dividend Yield ESG UCITS ETF, €20.6M
DELETE FROM "etfs" WHERE "id" = '06c5591f-a527-4bc8-8828-e49e37c30539' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZEB'; -- Xtrackers II-ESG EUR Government Bond UCITS ETF, €51.0M
DELETE FROM "etfs" WHERE "id" = '1e3e1ccc-c6f1-4fe3-90cd-56876760525c' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZEP'; -- Xtrackers MSCI Europe ESG UCITS ETF, €32.3M
DELETE FROM "etfs" WHERE "id" = '32802d91-66c0-4492-be29-382a9035baaf' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZEZ'; -- Xtrackers MSCI EMU ESG UCITS ETF, €31.6M
DELETE FROM "etfs" WHERE "id" = '6a49628a-d2f2-4e89-98ae-8d25742b68d0' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZHE'; -- Xtrackers EUR High Yield Corporate Bond SRI PAB UCITS ETF, €40.2M
DELETE FROM "etfs" WHERE "id" = '23e7191b-07bc-46eb-936e-f57a25341a1e' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZSW'; -- Xtrackers MSCI World Small Cap ESG UCITS ETF, €10.1M
DELETE FROM "etfs" WHERE "id" = '38a02b28-f3c1-4a4a-8079-0a707ee871b5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'XZWD'; -- Xtrackers ESG MSCI World UCITS ETF, €15.7M
DELETE FROM "etfs" WHERE "id" = '57eb9f8e-01a5-4664-9fd0-cc978e8c0163' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'YCHP'; -- YieldMax Semiconductor Option Income UCITS ETF, €31.3M
DELETE FROM "etfs" WHERE "id" = '4ae91c7d-2ab6-4ea9-83cb-7af8118618ca' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'YGLD'; -- IncomeShares Gold+ Yield ETP, €48.6M
DELETE FROM "etfs" WHERE "id" = 'aac71463-15b1-4b5d-b58d-dd97c09a966f' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'YYYY'; -- YieldMax Big Tech Option Income UCITS ETF, €69.1M
DELETE FROM "etfs" WHERE "id" = '62a0564f-4df8-49a6-b23f-8e97ff447bc3' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZAPP'; -- Global X U.S. Electrification UCITS ETF, €13.4M
DELETE FROM "etfs" WHERE "id" = 'a314be0c-5d46-453a-ba2a-cf70ba23dc59' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZINS'; -- Jupiter Global Government Bond Active UCITS ETF, €16.2M
DELETE FROM "etfs" WHERE "id" = '5608e1a1-fc16-4136-bcbc-5f139094d5b9' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPD3'; -- State Street SPDR S&P Global Dividend Aristocrats Screened UCITS ETF, €21.8M
DELETE FROM "etfs" WHERE "id" = 'ae8713f6-6be1-4ffa-84b0-cd6bd78aa4c2' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPD6'; -- State Street SPDR S&P U.S. Dividend Aristocrats Screened UCITS ETF, €20.8M
DELETE FROM "etfs" WHERE "id" = 'b9887db3-630d-4ce2-8eab-ed785ef791f5' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPD9'; -- State Street SPDR S&P Euro Dividend Aristocrats ESG UCITS ETF, €15.7M
DELETE FROM "etfs" WHERE "id" = '0f786d62-25b4-4604-a928-3661a0ea7e78' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPDW'; -- State Street SPDR MSCI Japan UCITS ETF, €52.5M
DELETE FROM "etfs" WHERE "id" = 'e3152dc0-307c-46a2-9818-612df52d279b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPR5'; -- State Street SPDR ICE BofA 0-5 Year EM USD Government Bond UCITS ETF, €42.1M
DELETE FROM "etfs" WHERE "id" = 'b5807167-4919-4d75-bbc1-fd04ad677881' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPR6'; -- State Street SPDR ICE BofA 0-5 Year EM USD Government Bond UCITS ETF, €25.9M
DELETE FROM "etfs" WHERE "id" = 'c927a985-4f83-4655-9215-6a780e56154b' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPRL'; -- State Street SPDR EURO STOXX Low Volatility UCITS ETF, €30.2M
DELETE FROM "etfs" WHERE "id" = '99df1424-7301-49b4-9d41-f838ffaf42ce' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZPRM'; -- State Street SPDR Bloomberg 1-3 Month T-Bill UCITS ETF, €60.8M, USD line
DELETE FROM "etfs" WHERE "id" = '182f602c-e161-4403-8aff-eb37601d0abb' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZSG0'; -- Gold Miners Screened UCITS ETF, €56.0M
DELETE FROM "etfs" WHERE "id" = '86ce4633-d49c-4ceb-aece-5eaa65077a59' AND "space_id" = 'koala_gains' AND "exchange" = 'XETRA' AND "symbol" = 'ZSRM'; -- BNP Paribas Easy MSCI USA SRI PAB, €89.4M

-- 5. Every listed ETF is gone and XETRA lost exactly 624 rows.
DO $$
DECLARE remaining integer; xetra_now integer; xetra_before integer; archived integer;
BEGIN
  SELECT count(*) INTO remaining FROM "etfs" e JOIN "_etf_delete_list" l ON l."id" = e."id";
  SELECT count(*) INTO xetra_now FROM "etfs" WHERE "space_id" = 'koala_gains' AND "exchange" = 'XETRA';
  SELECT "n" INTO xetra_before FROM "_xetra_before";
  SELECT count(*) INTO archived FROM "etf_archive"."etfs_20261025";
  IF remaining <> 0 OR xetra_before - xetra_now <> 624 OR archived <> 624 THEN
    RAISE EXCEPTION 'Nothing deleted. remaining=%, XETRA % -> %, archived=%', remaining, xetra_before, xetra_now, archived; END IF;
  RETURN; END $$;

SELECT (SELECT "n" FROM "_xetra_before") AS "xetra_before",
       (SELECT count(*) FROM "etfs" WHERE "space_id" = 'koala_gains' AND "exchange" = 'XETRA') AS "xetra_after",
       (SELECT count(*) FROM "etf_archive"."etfs_20261025") AS "archived_etfs",
       (SELECT count(*) FROM "etf_archive"."etf_financial_info_20261025") AS "archived_financial_info",
       (SELECT count(*) FROM "etf_archive"."etf_stock_analyzer_info_20261025") AS "archived_analyzer_info",
       (SELECT count(*) FROM "etf_archive"."etf_price_history_20261025") AS "archived_price_history",
       (SELECT count(*) FROM "etf_archive"."etf_similar_etfs_20261025") AS "archived_similar_etfs";

COMMIT;
