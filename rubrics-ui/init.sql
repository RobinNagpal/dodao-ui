--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8 (Homebrew)
-- Dumped by pg_dump version 15.8 (Homebrew)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: admin
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: admin
--


CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO admin;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO admin;

--
-- Name: crypto_login_nonce; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.crypto_login_nonce (
    user_id text NOT NULL,
    nonce text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.crypto_login_nonce OWNER TO admin;

--
-- Name: program_rubric_mappings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.program_rubric_mappings (
    id character varying(64) NOT NULL,
    program_id character varying(64) NOT NULL,
    rubric_id character varying(64) NOT NULL
);


ALTER TABLE public.program_rubric_mappings OWNER TO admin;

--
-- Name: programs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.programs (
    id character varying(64) NOT NULL,
    name text NOT NULL,
    details text,
    summary text NOT NULL,
    space_id character varying(255) NOT NULL
);


ALTER TABLE public.programs OWNER TO admin;

--
-- Name: rating_cell_selections; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rating_cell_selections (
    id character varying(64) NOT NULL,
    rubric_cell_id character varying(64) NOT NULL,
    rubric_rating_id character varying(64) NOT NULL,
    comment text NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.rating_cell_selections OWNER TO admin;

--
-- Name: rubric_cells; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rubric_cells (
    id character varying(64) NOT NULL,
    description character varying(64) NOT NULL,
    level_id character varying(64) NOT NULL,
    criteria_id character varying(64) NOT NULL,
    rubric_id character varying(64) NOT NULL,
    is_archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public.rubric_cells OWNER TO admin;

--
-- Name: rubric_criterias; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rubric_criterias (
    id text NOT NULL,
    title character varying(64) NOT NULL,
    rubric_id character varying(64) NOT NULL,
    is_archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public.rubric_criterias OWNER TO admin;

--
-- Name: rubric_levels; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rubric_levels (
    id character varying(64) NOT NULL,
    column_name character varying(64) NOT NULL,
    description character varying(64),
    score integer NOT NULL,
    rubric_id character varying(64) NOT NULL,
    is_archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public.rubric_levels OWNER TO admin;

--
-- Name: rubric_ratings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rubric_ratings (
    id character varying(64) NOT NULL,
    rubric_id character varying(64) NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.rubric_ratings OWNER TO admin;

--
-- Name: rubrics; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.rubrics (
    id character varying(64) NOT NULL,
    name character varying(64) NOT NULL,
    summary text NOT NULL,
    description text,
    space_id character varying(255) NOT NULL
);


ALTER TABLE public.rubrics OWNER TO admin;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    session_token text NOT NULL,
    user_id text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO admin;

--
-- Name: spaces; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.spaces (
    id character varying(64) NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    creator character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    avatar character varying(255),
    admin_usernames_v1 jsonb[],
    domains text[] DEFAULT ARRAY[]::text[],
    auth_settings json DEFAULT '{}'::json NOT NULL,
    features text[],
    theme_colors json
);


ALTER TABLE public.spaces OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text,
    email_verified timestamp(3) without time zone,
    image text,
    public_address text,
    phone_number text,
    password text,
    space_id text NOT NULL,
    username text NOT NULL,
    auth_provider text NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO admin;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3f81111f-a991-48d2-9a84-f758f01a85f5	d17a6a322c53f7e11c6e164352587c996cebf9dd0c51308bf84cd1b4da2790ce	2024-08-15 08:46:29.590098-04	20240815124629_init	\N	\N	2024-08-15 08:46:29.544566-04	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: crypto_login_nonce; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.crypto_login_nonce (user_id, nonce, expires) FROM stdin;
\.


--
-- Data for Name: program_rubric_mappings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.program_rubric_mappings (id, program_id, rubric_id) FROM stdin;
mapping-1	program-1	rubric-1
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.programs (id, name, details, summary, space_id) FROM stdin;
program-1	Test Program 1	Details of Test Program 1	Summary of Test Program 1	test-academy-eth
\.


--
-- Data for Name: rating_cell_selections; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rating_cell_selections (id, rubric_cell_id, rubric_rating_id, comment, user_id) FROM stdin;
\.


--
-- Data for Name: rubric_cells; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rubric_cells (id, description, level_id, criteria_id, rubric_id, is_archived) FROM stdin;
cell-1	Detailed and accurate content.	level-1	criteria-1	rubric-1	f
cell-2	Adequate content.	level-2	criteria-1	rubric-1	f
cell-3	Content needs more clarity.	level-3	criteria-1	rubric-1	f
cell-4	Content is unclear.	level-4	criteria-1	rubric-1	f
cell-5	Clear and comprehensible.	level-1	criteria-2	rubric-1	f
cell-6	Mostly comprehensible.	level-2	criteria-2	rubric-1	f
cell-7	Somewhat comprehensible.	level-3	criteria-2	rubric-1	f
cell-8	Incomprehensible.	level-4	criteria-2	rubric-1	f
\.


--
-- Data for Name: rubric_criterias; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rubric_criterias (id, title, rubric_id, is_archived) FROM stdin;
criteria-1	Content	rubric-1	f
criteria-2	Comprehensibility	rubric-1	f
\.


--
-- Data for Name: rubric_levels; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rubric_levels (id, column_name, description, score, rubric_id, is_archived) FROM stdin;
level-1	Excellent	Complete and clear.	4	rubric-1	f
level-2	Good	Generally clear.	3	rubric-1	f
level-3	Fair	Somewhat unclear.	2	rubric-1	f
level-4	Improvement	Unclear.	1	rubric-1	f
\.


--
-- Data for Name: rubric_ratings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rubric_ratings (id, rubric_id, user_id) FROM stdin;
\.


--
-- Data for Name: rubrics; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.rubrics (id, name, summary, description, space_id) FROM stdin;
rubric-1	Test Rubric 1	Summary of Test Rubric 1	Description of Test Rubric 1	test-academy-eth
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sessions (id, session_token, user_id, expires) FROM stdin;
\.


--
-- Data for Name: spaces; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.spaces (id, verified, created_at, creator, name, updated_at, avatar, admin_usernames_v1, domains, auth_settings, features, theme_colors) FROM stdin;
test-academy-eth	t	2023-07-08 19:19:16.998	clhjfyne00000mc08gc4wsqs0	The Test Academy	2023-08-10 20:04:43.664	https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg	{}	{}	{"enableLogin":false,"loginOptions":["Discord","MetaMask","Google","Coinbase","Near"]}	{}	{"primaryColor":"#384aff","bgColor":"#ffffff","textColor":"#57606a","linkColor":"#111111","headingColor":"#111111","borderColor":"#d0d7de","blockBg":"#F5F9FF"}
my-rubrics-home	t	2023-07-08 19:19:16.998	clhjfyne00000mc08gc4wsqs0	My Rubrics Home	2023-08-10 20:04:43.664	https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg	{}	{}	{"enableLogin":false,"loginOptions":["Discord","MetaMask","Google","Coinbase","Near"]}	{}	{"primaryColor":"#384aff","bgColor":"#ffffff","textColor":"#57606a","linkColor":"#111111","headingColor":"#111111","borderColor":"#d0d7de","blockBg":"#F5F9FF"}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, name, email, email_verified, image, public_address, phone_number, password, space_id, username, auth_provider) FROM stdin;
clzvcgzej0000s94lgmjkdbfo	\N	\N	\N	\N	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	\N	\N	test-academy-eth	0x470579d16401a36BF63b1428eaA7189FBdE5Fee9	crypto
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: program_rubric_mappings program_rubric_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.program_rubric_mappings
    ADD CONSTRAINT program_rubric_mappings_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: rating_cell_selections rating_cell_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rating_cell_selections
    ADD CONSTRAINT rating_cell_selections_pkey PRIMARY KEY (id);


--
-- Name: rubric_cells rubric_cells_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_cells
    ADD CONSTRAINT rubric_cells_pkey PRIMARY KEY (id);


--
-- Name: rubric_criterias rubric_criterias_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_criterias
    ADD CONSTRAINT rubric_criterias_pkey PRIMARY KEY (id);


--
-- Name: rubric_levels rubric_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_levels
    ADD CONSTRAINT rubric_levels_pkey PRIMARY KEY (id);


--
-- Name: rubric_ratings rubric_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_ratings
    ADD CONSTRAINT rubric_ratings_pkey PRIMARY KEY (id);


--
-- Name: rubrics rubrics_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubrics
    ADD CONSTRAINT rubrics_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: spaces spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);


--
-- Name: crypto_login_nonce_user_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX crypto_login_nonce_user_id_key ON public.crypto_login_nonce USING btree (user_id);


--
-- Name: program_rubric_mappings_program_id_rubric_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX program_rubric_mappings_program_id_rubric_id_key ON public.program_rubric_mappings USING btree (program_id, rubric_id);


--
-- Name: rating_cell_selections_rubric_cell_id_rubric_rating_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX rating_cell_selections_rubric_cell_id_rubric_rating_id_key ON public.rating_cell_selections USING btree (rubric_cell_id, rubric_rating_id);


--
-- Name: rubric_cells_rubric_id_level_id_criteria_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX rubric_cells_rubric_id_level_id_criteria_id_key ON public.rubric_cells USING btree (rubric_id, level_id, criteria_id);


--
-- Name: rubric_criterias_rubric_id_title_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX rubric_criterias_rubric_id_title_key ON public.rubric_criterias USING btree (rubric_id, title);


--
-- Name: rubric_ratings_rubric_id_user_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX rubric_ratings_rubric_id_user_id_key ON public.rubric_ratings USING btree (rubric_id, user_id);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: users_email_space_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_email_space_id_key ON public.users USING btree (email, space_id);


--
-- Name: users_public_address_space_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_public_address_space_id_key ON public.users USING btree (public_address, space_id);


--
-- Name: users_username_space_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_username_space_id_key ON public.users USING btree (username, space_id);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: crypto_login_nonce crypto_login_nonce_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.crypto_login_nonce
    ADD CONSTRAINT crypto_login_nonce_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: program_rubric_mappings program_rubric_mappings_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.program_rubric_mappings
    ADD CONSTRAINT program_rubric_mappings_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: program_rubric_mappings program_rubric_mappings_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.program_rubric_mappings
    ADD CONSTRAINT program_rubric_mappings_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.rubrics(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: programs programs_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rating_cell_selections rating_cell_selections_rubric_cell_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rating_cell_selections
    ADD CONSTRAINT rating_cell_selections_rubric_cell_id_fkey FOREIGN KEY (rubric_cell_id) REFERENCES public.rubric_cells(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rating_cell_selections rating_cell_selections_rubric_rating_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rating_cell_selections
    ADD CONSTRAINT rating_cell_selections_rubric_rating_id_fkey FOREIGN KEY (rubric_rating_id) REFERENCES public.rubric_ratings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rating_cell_selections rating_cell_selections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rating_cell_selections
    ADD CONSTRAINT rating_cell_selections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_cells rubric_cells_criteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_cells
    ADD CONSTRAINT rubric_cells_criteria_id_fkey FOREIGN KEY (criteria_id) REFERENCES public.rubric_criterias(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_cells rubric_cells_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_cells
    ADD CONSTRAINT rubric_cells_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.rubric_levels(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_cells rubric_cells_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_cells
    ADD CONSTRAINT rubric_cells_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.rubrics(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_criterias rubric_criterias_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_criterias
    ADD CONSTRAINT rubric_criterias_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.rubrics(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_levels rubric_levels_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_levels
    ADD CONSTRAINT rubric_levels_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.rubrics(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_ratings rubric_ratings_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_ratings
    ADD CONSTRAINT rubric_ratings_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.rubrics(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubric_ratings rubric_ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubric_ratings
    ADD CONSTRAINT rubric_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubrics rubrics_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.rubrics
    ADD CONSTRAINT rubrics_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

