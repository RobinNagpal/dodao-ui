--  Some script to initialize the database
--
-- PostgreSQL database dump
--

-- Dumped from database version 13.13
-- Dumped by pg_dump version 14.8 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;


-- Grant all privileges on the database to 'admin'
GRANT ALL PRIVILEGES ON DATABASE next_app_localhost_db_base_ui TO admin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'admin';

-- Create table for 'spaces'
CREATE TABLE public.spaces (
  id VARCHAR(64),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  creator VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  avatar VARCHAR(255),
  admin_usernames_v1 JSONB[],
  domains TEXT[] DEFAULT '{}',
  auth_settings JSONB DEFAULT '{}' NOT NULL,
  features TEXT[] NOT NULL,
  theme_colors JSONB
);

-- Create table for 'users'
CREATE TABLE public.users (
  id VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255),
  email_verified TIMESTAMPTZ,
  image VARCHAR(255),
  public_address VARCHAR(255),
  phone_number VARCHAR(255),
  password VARCHAR(255),
  space_id VARCHAR(64) NOT NULL,
  username VARCHAR(255) NOT NULL,
  auth_provider VARCHAR(255) NOT NULL,
);

-- Create table for 'accounts'
CREATE TABLE public.accounts (
  id VARCHAR(255),
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255),
  access_token VARCHAR(255),
  expires_at INT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token VARCHAR(255),
  session_state VARCHAR(255)
);

-- Create table for 'sessions'
CREATE TABLE public.sessions (
  id VARCHAR(255),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

-- Create table for 'verification_tokens'
CREATE TABLE public.verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
);

-- Create table for 'crypto_login_nonce'
CREATE TABLE public.crypto_login_nonce (
  user_id VARCHAR(255) UNIQUE NOT NULL,
  nonce VARCHAR(255) NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);


ALTER TABLE public.spaces OWNER TO postgres;

ALTER TABLE public.users OWNER TO postgres;

ALTER TABLE public.verification_tokens OWNER TO postgres;

ALTER TABLE public.sessions OWNER TO postgres;

ALTER TABLE public.crypto_login_nonce OWNER TO postgres;

ALTER TABLE public.accounts OWNER TO postgres;


ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);
    
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);



CREATE UNIQUE INDEX users_email_space_id_key ON public.users USING btree (email, space_id);

CREATE UNIQUE INDEX users_public_address_space_id_key ON public.users USING btree (public_address, space_id);

CREATE UNIQUE INDEX users_username_space_id_key ON public.users USING btree (username, space_id);

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token)


ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.crypto_login_nonce
    ADD CONSTRAINT crypto_login_nonce_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


    
COPY public.spaces (id, verified, created_at, creator, name, updated_at, avatar, admin_usernames_v1, domains, skin, discord_invite, telegram_invite, invite_links, auth_settings, guide_settings, social_settings, byte_settings, features, "botDomains", theme_colors, type, tidbits_homepage, admin_usernames, admins) FROM stdin;
unstoppable-academy-eth-1	f	2023-05-23 11:55:08.688	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	Unstoppable Academy	2023-05-23 11:55:08.688	ipfs://QmaFtT8WkXaaEZaBWePzCBXMYGHd4nZapBrTx9Y7QFQvEi	{}	{}	unstoppable	\N	\N	\N	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
grindery-eth-1	f	2023-05-23 11:55:19.022	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	Grindery	2023-05-23 11:55:19.022	ipfs://QmWmDYragsqFKsV5kBTNvkUX7PJzjNS9t3EmfvAi5cPVYb	{}	{}	balancer	\N	\N	{"discordInviteLink": "https://discord.gg/PCMTWg3KzE", "showAnimatedButtonForDiscord": true}	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
dodao-1	f	2023-05-23 11:57:39.89	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	DoDAO	2023-05-23 11:57:39.89	ipfs://QmfDoQKTFNdzWunFW5k1QioAEyEuGtysswxFnAiuTwq2V9	{}	{}	dodao	\N	\N	\N	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
aave-eth-1	t	2024-01-23 10:34:58.77	clhjfyne00000mc08gc4wsqs0	Aave	2024-01-23 10:34:58.77	ipfs://QmTr7YXEpahqAEL2nj752MZFPPibgHNZiwrGNu3givhtR3	{"{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"Nuesha\\"}"}	{aave.academy,aave-localhost.academy}	AaveTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#2EBAC6","bgColor":"#1B2030","textColor":"#f1f1f3","linkColor":"#f1f1f3","headingColor":"#f1f1f3","borderColor":"#d1d5da","blockBg":"#383D51"}	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
maker-university	t	2023-12-19 08:00:08.472	clhqrymsy0006s9awkhi9o7k6	Maker University	2023-12-19 08:00:08.472		{}	{}	CompoundTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{makerchat.org}	\N	ACADEMY_SITE	\N	{0x4031e923240382b47b1BF4696c8e060b7cE6CdcD}	{}
kleros-eth-1	t	2023-12-19 08:03:34.604	clhqrymsy0006s9awkhi9o7k6	Kleros	2023-12-19 08:03:34.604	ipfs://QmdnS6QTJ2njj5swrox8tPxCFFHoWMvDGWqZfjzAtMzLT6	{}	{kleros.dodao.io,kleros.academy,kleros-localhost.academy}	KlerosTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{"enableLogin":false,"loginOptions":["Coinbase","MetaMask"]}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{0x25F73d547c8A847eB0aC99AF0cBA5399D027f070}	{clhjfyne00000mc08gc4wsqs0}
fuse	t	2023-12-19 08:00:28.366	clhqrymsy0006s9awkhi9o7k6	Fuse	2024-01-03 18:42:47.601	https://d31h13bdjwgzxs.cloudfront.net/academy/fuse/AcademyLogo/fuse/1690817565968_fuse_png.png	{}	{fuse.university,fuse-localhost.university}	FuseTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{"enableLogin":true,"loginOptions":["MetaMask","Coinbase"]}	{}	{}	{}	{}	{}	{"primaryColor":"#000000","bgColor":"#FFFFFF","textColor":"#000000","linkColor":"#333333","headingColor":"#000000","borderColor":"#BBBBBB","blockBg":"#EEEEEE"}	ACADEMY_SITE	\N	{0x7A11d1FD70ae383Fb75616C7Ba3D2eF5439AaE13,0xE7ae546939DeF22f5E8e5563cFcC6182cbA469FC}	{}
balancer-eth-1	t	2023-08-19 23:42:53.434	clhjfyne00000mc08gc4wsqs0	Balancer	2024-02-23 15:11:25.438	https://d31h13bdjwgzxs.cloudfront.net/academy/balancer/balancer-bal-logo.png	{}	{balancer.academy,balancer-eth-1.tidbitshub.org}	Balancer	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
dodao-tidbits	t	2024-03-07 21:54:26.677	2013nibor@gmail.com	DoDAO Tidbits	2024-03-07 21:54:26.677	https://d31h13bdjwgzxs.cloudfront.net/academy/dodao-academy/AcademyLogo/dodao_academy/1691168329774_dodao_logo%2Btext%20rectangle.svg	{"{\\"username\\": \\"2013nibor@gmail.com\\", \\"nameOfTheUser\\": \\"2013nibor@gmail.com\\"}","{\\"username\\": \\"ialidar2001@gmail.com\\", \\"nameOfTheUser\\": \\"ALI\\"}","{\\"username\\": \\"robinnagpal.tiet@gmail.com\\", \\"nameOfTheUser\\": \\"Robin\\"}"}	{dodao-tidbits.tidbitshub.org,dodao-tidbits.tidbitshub-localhost.org}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{"enableLogin":false,"loginOptions":[]}	{}	{}	{}	{}	{}	\N	TidbitsSite	\N	{}	{}
empowerher-academy	t	2023-09-06 10:38:29.553	clhqrymsy0006s9awkhi9o7k6	EmpowerHer Academy	2023-09-06 10:38:29.553	https://d31h13bdjwgzxs.cloudfront.net/academy/empowerher-academy/AcademyLogo/empowerher_academy/1693572853931_android-chrome-512x512.png	{}	{empowerher.academy,empowerher-localhost.academy}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{neusha@dodao.io,areesha@dodao.io}	{}
life-insurance-tips	t	2023-12-19 08:01:37.698	clhqrymsy0006s9awkhi9o7k6	Life Insurance Tips	2024-02-22 16:08:11.958	https://d31h13bdjwgzxs.cloudfront.net/academy/life-insurance-tips/AcademyLogo/life_insurance_tips/1702471277889_android-chrome-512x512.png	{}	{lifeinsure.tips,lifeinsure-localhost.tips,life-insurance-tips.dodao.io}	ArbitrumTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{0xDA878e846D2DF54e10224E45587c302DeDd02292}	{}
dodao-academy-eth-1	t	2023-07-10 16:08:23.773	clhjfyne00000mc08gc4wsqs0	DoDAO Academy	2023-07-10 16:08:23.773	ipfs://QmWy8EeMnxqx96VEPx2NBwzqtKxvMQqVVYvmPKgAYS2cUi	{}	{dodao.academy}	dodao	\N	\N	{"discordInviteLink":"https://discord.gg/BMGVWkbFDW","showAnimatedButtonForDiscord":true,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
compound-eth-1	t	2024-06-02 00:38:06.673	clhqrymsy0006s9awkhi9o7k6	COMPOUND	2024-06-02 00:38:06.673	https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png	{"{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"neusha\\"}","{\\"username\\": \\"neusha@dodao.io\\", \\"nameOfTheUser\\": \\"neusha\\"}","{\\"username\\": \\"0xB0Bc2970c3A870E7E3383357AA98770Fc8eAE3F1\\", \\"nameOfTheUser\\": \\"Sami\\"}"}	{compound.education,compound-localhost.education}	CompoundTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#00AD79","bgColor":"#0D131A","textColor":"#f1f1f3","linkColor":"#f1f1f3","headingColor":"#f1f1f3","borderColor":"#d1d5da","blockBg":"#1e202d"}	ACADEMY_SITE	\N	{0x98fdE0e52fd38eeE6D319B3E45bcaFF48237384c,0x8eF5e84d7ca55580D0cfDC9a118f34BED9fca088}	{clhjfyne00000mc08gc4wsqs0}
etherfi	t	2024-03-27 17:52:22.081	jebipe8895@glaslack.com	Ether.Fi	2024-04-15 13:17:43.422	https://d31h13bdjwgzxs.cloudfront.net/academy/etherfi/Space/etherfi/1711532486532_header_logo.webp	{"{\\"username\\": \\"neusha@dodao.io\\", \\"nameOfTheUser\\": \\"neusha\\"}","{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"neusha\\"}"}	{etherfi.tidbitshub.org,etherfi.tidbitshub-localhost.org}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#6464e4","bgColor":"#1a163b","textColor":"#ffffff","linkColor":"#ffffff","headingColor":"#ffffff","borderColor":"#d0d7de","blockBg":"#312a65"}	TidbitsSite	{"heading":"Master ether.fi: Staking Made Simple","shortDescription":"Grasping ether.fi’s approach to Ethereum staking doesn’t have to be a challenge. Tidbits simplify complex details to prepare you to stake ETH with confidence!"}	{}	{}
bioxyz-eth-1	f	2023-05-23 11:55:08.912	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	bio.xyz	2023-05-23 11:55:08.912	https://d31h13bdjwgzxs.cloudfront.net/academy/bioxyz/bio.xyz+Icon.png	{}	{}	bioxyz	\N	\N	\N	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
daocubator-near-mainnet	f	2023-05-23 11:55:09.139	robinnagpal.near	DAOCubator	2023-05-23 11:55:09.139	https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg	{}	{}	daocubator	\N	\N	\N	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
ens-domains-eth-1	f	2023-05-23 11:55:18.905	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	ENS Domains	2023-05-23 11:55:18.905	https://d31h13bdjwgzxs.cloudfront.net/logos/ETH/ENS/ens_logo.png	{}	{}	dodao	\N	\N	\N	{}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{}	{clhjfyne00000mc08gc4wsqs0}
credit-union-academy	t	2023-12-22 18:27:09.555	clhjfyne00000mc08gc4wsqs0	Credit Union Academy	2023-12-22 18:27:09.555	https://d31h13bdjwgzxs.cloudfront.net/academy/credit-union-academy/AcademyLogo/credit_union_academy/1687943003089_download.png	{}	{creditunion.academy,creditunion-localhost.academy}	DoDAO	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{"linkedSharePdfBackgroundImage":"https://d31h13bdjwgzxs.cloudfront.net/academy/credit-union-academy/Social/PdfBackground/linkedSharePdfBackgroundImage/1688828443124_april_18_-_news.png"}	{}	{}	{}	\N	ACADEMY_SITE	\N	{work.jahnavimenon@gmail.com,rodriguesgrege@gmail.com,0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8}	{}
ndc-near-mainnet	t	2023-08-11 01:29:24.022	clhjfyne00000mc08gc4wsqs0	The NDC	2023-08-11 01:29:24.022	https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg	{}	{thendc.academy}	Balancer	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{"enableLogin":false,"loginOptions":["Near"]}	{}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{blaze.near,yuensid.near,vikash.near,neardigitalcollective.near,chloe.near}	{clhjfyne00000mc08gc4wsqs0}
tidbitshub	t	2024-03-28 09:38:09.56		TidbitsHub	2024-03-28 09:38:09.56	https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png	{"{\\"username\\": \\"areesha@dodao.io\\", \\"nameOfTheUser\\": \\"Areesha\\"}"}	{tidbitshub.org,tidbitshub-localhost.org}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{"enableLogin":true,"loginOptions":["Email"]}	{}	{}	{}	{}	{}	\N		\N	{}	{}
top-crypto-projects	t	2024-01-17 18:52:04.915	clhjfyne00000mc08gc4wsqs0	Top Crypto Projects	2024-01-17 18:52:04.915	https://d31h13bdjwgzxs.cloudfront.net/academy/top-crypto-projects/AcademyLogo/top_crypto_projects/1705517522225_crypto_gelato_icon.png	{}	{cryptogelato.com,cryptogelato-localhost.com,dodao-ui-git-nikhil-projects-robinnagpal-s-team.vercel.app}	CryptoGelatoTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#4560fd","bgColor":"#0D131A","textColor":"#f1f1f3","linkColor":"#f1f1f3","headingColor":"#f1f1f3","borderColor":"#d1d5da","blockBg":"#1e202d"}	ACADEMY_SITE	\N	{0xDA878e846D2DF54e10224E45587c302DeDd02292,0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8,0x8eF5e84d7ca55580D0cfDC9a118f34BED9fca088}	{}
dodao-academy	t	2024-03-14 14:13:40.623	clhqrymsy0006s9awkhi9o7k6	DoDAO Academy	2024-03-28 09:21:56.928	https://d31h13bdjwgzxs.cloudfront.net/academy/dodao-academy/AcademyLogo/dodao_academy/1691168329774_dodao_logo%2Btext%20rectangle.svg	{}	{academy.dodao.io,dodao-localhost.io,dodao.io,www.dodao.io,dodao-academy.dodao.io}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{"askForLoginToSubmit":null,"captureRating":true,"showCategoriesInSidebar":null,"showIncorrectAfterEachStep":null,"showIncorrectOnCompletion":null}	{}	{}	{}	{}	\N	ACADEMY_SITE	\N	{neusha@dodao.io,areesha@dodao.io}	{}
eigenlayer	t	2024-04-24 17:47:18.009	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	EigenLayer	2024-04-24 17:47:18.009	https://d31h13bdjwgzxs.cloudfront.net/academy/eigenlayer/Space/eigenlayer/1713980832192_hq720-removebg-preview.png	{"{\\"username\\": \\"0x470579d16401a36BF63b1428eaA7189FBdE5Fee9\\", \\"nameOfTheUser\\": \\"0x470579d16401a36BF63b1428eaA7189FBdE5Fee9\\"}","{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"Neusha\\"}"}	{}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#a7bffc","bgColor":"#0e0548","textColor":"#edf0f3","linkColor":"#a7bffc","headingColor":"#f0f1f5","borderColor":"#63708c","blockBg":"#1a0c6d"}	TidbitsSite	\N	{}	{}
arbitrum-university	t	2024-08-07 18:38:46.614	clhjfyne00000mc08gc4wsqs0	Arbitrum University	2024-08-07 18:38:46.614	https://d31h13bdjwgzxs.cloudfront.net/academy/arbitrum-university/AcademyLogo/arbitrum_university/1696374389613_arbitrum_logo.png	{"{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"Neusha\\"}","{\\"username\\": \\"0x6246E46b5750952f8975B2AdacF447a8a2Eeafd5\\", \\"nameOfTheUser\\": \\"Hussain\\"}"}	{arbitrum.education,arbitrum-localhost.education}	ArbitrumTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"showAnimatedButtonForTelegram":null,"telegramInviteLink":null}	{}	{"askForLoginToSubmit":null,"captureRating":true,"showCategoriesInSidebar":null,"showIncorrectAfterEachStep":null,"showIncorrectOnCompletion":null}	{}	{}	{}	{arbitrumchat.org}	{"primaryColor":"#1B4ADD","bgColor":"#0A0A0A","textColor":"#f8fafc","linkColor":"#ffffff","headingColor":"#ffffff","borderColor":"#4971E9","blockBg":"#11192d"}	ACADEMY_SITE	\N	{}	{}
optimism-university	t	2024-08-07 18:39:42.638	clhqrymsy0006s9awkhi9o7k6	Optimism University	2024-08-07 18:39:42.638	https://d31h13bdjwgzxs.cloudfront.net/academy/optimism-university/AcademyLogo/optimism_university/1694773002830_optimism-logo.png	{"{\\"username\\": \\"0x6246E46b5750952f8975B2AdacF447a8a2Eeafd5\\", \\"nameOfTheUser\\": \\"Hussain\\"}"}	{optimism.university,optimism-localhost.university}	OptimismTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"showAnimatedButtonForTelegram":null,"telegramInviteLink":null}	{"enableLogin":false,"loginOptions":["MetaMask","Google","Coinbase"]}	{}	{}	{}	{}	{opbot.click,optimismchat.org}	\N	ACADEMY_SITE	\N	{}	{}
uniswap-eth-1	t	2024-08-19 11:19:04.103	clhqrymsy0006s9awkhi9o7k6	Uniswap	2024-08-19 11:19:04.103	https://d31h13bdjwgzxs.cloudfront.net/academy/uniswap/uniswap_icon.svg	{"{\\"username\\": \\"0xB0Bc2970c3A870E7E3383357AA98770Fc8eAE3F1\\", \\"nameOfTheUser\\": \\"Sami\\"}","{\\"username\\": \\"0x6246E46b5750952f8975B2AdacF447a8a2Eeafd5\\", \\"nameOfTheUser\\": \\"Hussain\\"}","{\\"username\\": \\"0xE1eD81e508F3F901Cf55eD05729016f5A1D93A3A\\", \\"nameOfTheUser\\": \\"Moez\\"}","{\\"username\\": \\"0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8\\", \\"nameOfTheUser\\": \\"Dawood\\"}"}	{uniswap.university,uniswap-localhost.university,neusha@dodao.io}	UniswapTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"showAnimatedButtonForTelegram":null,"telegramInviteLink":null}	{}	{}	{}	{}	{}	{uniswapbot.click,uniswapbot-localhost.click}	{"primaryColor":"#6f6cbd","bgColor":"#14141c","textColor":"#c2c5ca","linkColor":"#ffffff","headingColor":"#6f6cbd","borderColor":"#909294","blockBg":"#212429"}	ACADEMY_SITE	\N	{neusha@dodao.io}	{clhjfyne00000mc08gc4wsqs0}
velodrome	t	2024-04-19 14:39:31.259	0xDA878e846D2DF54e10224E45587c302DeDd02292	Velodrome	2024-04-24 17:37:04.201	https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/new_space/1713537564504_velodrome.svg	{"{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\"}"}	{velodrome.tidbitshub.org}	dodao	\N	\N	{}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#ef2524","bgColor":"#272a2a","textColor":"#ffffff","linkColor":"#ee2524","headingColor":"#ffffff","borderColor":"#decfcf","blockBg":"#514d4d"}	TidbitsSite	\N	{}	{}
alchemix	t	2024-08-20 13:59:08.588		Alchemix	2024-08-20 13:59:08.588	https://d31h13bdjwgzxs.cloudfront.net/academy/alchemix/Space/alchemix/1723555696123_alcx_std_logo.svg	{"{\\"username\\": \\"0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8\\", \\"nameOfTheUser\\": \\"Dawood\\"}","{\\"username\\": \\"0xB0Bc2970c3A870E7E3383357AA98770Fc8eAE3F1\\", \\"nameOfTheUser\\": \\"Sami\\"}"}	{}	dodao	\N	\N	{}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#ff6e30","bgColor":"#000000","textColor":"#ffffff","linkColor":"#ff4d00","headingColor":"#ffffff","borderColor":"#d0d7de","blockBg":"#231d15"}	TidbitsSite	\N	{}	{}
phoenix	t	2024-04-26 13:35:46.51	0xDA878e846D2DF54e10224E45587c302DeDd02292	Phoenix	2024-04-26 13:35:46.51	https://d31h13bdjwgzxs.cloudfront.net/academy/phoenix/Space/phoenix/1714138542050_o_kx2dae_400x400-removebg-preview.png	{"{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\"}"}	{phoenix.tidbitshub.org}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#ff6e30","bgColor":"#0f1215","textColor":"#ffffff","linkColor":"#ffffff","headingColor":"#ff6e30","borderColor":"#c7b9b3","blockBg":"#514d4d"}	TidbitsSite	\N	{}	{}
opportunity-bank	t	2024-04-08 15:34:50.059	robinnagpal@dodao.io	Opportunity Bank.	2024-04-08 15:34:50.059	https://d31h13bdjwgzxs.cloudfront.net/academy/opportunity-bank/Space/opportunity_bank/1712590488672_android-chrome-512x512.png	{"{\\"username\\": \\"robinnagpal@dodao.io\\", \\"nameOfTheUser\\": \\"robinnagpal@dodao.io\\"}","{\\"username\\": \\"areesha@dodao.io\\", \\"nameOfTheUser\\": \\"Areesha\\"}","{\\"username\\": \\"neusha@dodao.io\\", \\"nameOfTheUser\\": \\"Neusha\\"}","{\\"username\\": \\"robinnagpal.tiet@gmail.com\\", \\"nameOfTheUser\\": \\"Robin\\"}"}	{opportunity-bank.tidbitshub.org,opportunity-bank.tidbitshub-localhost.org,dodao-ui-git-sami-user-exp-robinnagpal-s-team.vercel.app}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{"enableLogin":false,"loginOptions":[]}	{}	{}	{}	{}	{}	{"primaryColor":"#384aff","bgColor":"#0a0a24","textColor":"#eeeeee","linkColor":"#eeeeee","headingColor":"#384aff","borderColor":"#6e6f7c","blockBg":"#11164f"}	TidbitsSite	\N	{}	{}
rocket-pool	t	2024-04-04 14:36:16.045	robinnagpal.tiet@gmail.com	Rocket Pool	2024-04-05 18:09:46.678	https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/new_space/1712240850318_rocket_pool_logo.webp	{"{\\"username\\": \\"robinnagpal.tiet@gmail.com\\", \\"nameOfTheUser\\": \\"robinnagpal.tiet@gmail.com\\"}","{\\"username\\": \\"0xDA878e846D2DF54e10224E45587c302DeDd02292\\", \\"nameOfTheUser\\": \\"neusha\\"}"}	{}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#ff6e30","bgColor":"#0f1215","textColor":"#ffffff","linkColor":"#ffffff","headingColor":"#ff6e30","borderColor":"#c7b9b3","blockBg":"#3d342e"}	TidbitsSite	{"heading":"Master Rocket Pool: Staking Made Simple","shortDescription":"Grasping Rocket Pool's approach to Ethereum staking doesn’t have to be a challenge. Tidbits simplify complex details to prepare you to stake ETH with confidence!"}	{}	{}
test-tidbits	t	2024-03-22 09:53:06.936	support@dodao.io	Test Tidbits	2024-03-22 13:04:01.099	https://d31h13bdjwgzxs.cloudfront.net/academy/dodao-academy/AcademyLogo/dodao_academy/1691168329774_dodao_logo%2Btext%20rectangle.svg	{"{\\"username\\": \\"support@dodao.io\\", \\"nameOfTheUser\\": \\"support@dodao.io\\"}","{\\"username\\": \\"0xB0Bc2970c3A870E7E3383357AA98770Fc8eAE3F1\\", \\"nameOfTheUser\\": \\"Sami\\"}"}	{test-tidbits.tidbitshub.org,test-tidbits.tidbitshub-localhost.org}	dodao	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"telegramInviteLink":null,"showAnimatedButtonForTelegram":null}	{}	{}	{}	{}	{}	{}	{"primaryColor":"#88b98e","bgColor":"#4d5650","textColor":"#cbd3dc","linkColor":"#f0f0f5","headingColor":"#dfe1e7","borderColor":"#d0d7de","blockBg":"#122e59"}	TidbitsSite	\N	{}	{}
test-academy-eth	t	2024-08-16 18:28:30.491	clhqrymsy0006s9awkhi9o7k6	The Test Academy	2024-08-16 18:28:30.491	https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg	{"{\\"username\\": \\"0x6973F931Ab1f07CC522921e761Ee6c7530131dC6\\", \\"nameOfTheUser\\": \\"Someone\\"}","{\\"username\\": \\"0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8\\", \\"nameOfTheUser\\": \\"Someone\\"}","{\\"username\\": \\"0xB0Bc2970c3A870E7E3383357AA98770Fc8eAE3F1\\", \\"nameOfTheUser\\": \\"Sami\\"}","{\\"username\\": \\"0x6246E46b5750952f8975B2AdacF447a8a2Eeafd5\\", \\"nameOfTheUser\\": \\"Hussain\\"}","{\\"username\\": \\"0x494B3274127906265B6525De62FF25c336C54CD1\\", \\"nameOfTheUser\\": \\"Usman\\"}","{\\"username\\": \\"0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8\\", \\"nameOfTheUser\\": \\"Dawood\\"}","{\\"username\\": \\"0x0b46A6A970Ca9D6E509D83239cfF3EE67dFa38Df\\", \\"nameOfTheUser\\": \\"Dawood2\\"}"}	{test-academy.dodao.io,test-academy-eth.tidbitshub.org}	GlobalTheme	\N	\N	{"discordInviteLink":null,"showAnimatedButtonForDiscord":null,"showAnimatedButtonForTelegram":null,"telegramInviteLink":null}	{"enableLogin":false,"loginOptions":["Discord","MetaMask","Google","Coinbase","Near"]}	{}	{}	{}	{}	{}	{"primaryColor":"#1c9c02","bgColor":"#0c0d0c","textColor":"#ffffff","linkColor":"#29b503","headingColor":"#ffffff","borderColor":"#d0d7de","blockBg":"#252825"}	ACADEMY_SITE	\N	{}	{}
\.
