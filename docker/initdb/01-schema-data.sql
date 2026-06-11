--
-- PostgreSQL database dump
--


-- Dumped from database version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.9 (Debian 17.9-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Team" DROP CONSTRAINT IF EXISTS "Team_groupId_fkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."PasswordResetRequest" DROP CONSTRAINT IF EXISTS "PasswordResetRequest_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."GroupPrediction" DROP CONSTRAINT IF EXISTS "GroupPrediction_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."BracketPrediction" DROP CONSTRAINT IF EXISTS "BracketPrediction_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."BonusPrediction" DROP CONSTRAINT IF EXISTS "BonusPrediction_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."BonusPrediction" DROP CONSTRAINT IF EXISTS "BonusPrediction_questionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Team_name_key";
DROP INDEX IF EXISTS public."Team_code_key";
DROP INDEX IF EXISTS public."Session_sessionToken_key";
DROP INDEX IF EXISTS public."PasswordResetRequest_status_idx";
DROP INDEX IF EXISTS public."InviteCode_code_key";
DROP INDEX IF EXISTS public."InviteCode_code_idx";
DROP INDEX IF EXISTS public."Group_name_key";
DROP INDEX IF EXISTS public."GroupPrediction_userId_idx";
DROP INDEX IF EXISTS public."GroupPrediction_userId_groupId_key";
DROP INDEX IF EXISTS public."Deadline_phase_key";
DROP INDEX IF EXISTS public."BracketPrediction_userId_round_matchIndex_key";
DROP INDEX IF EXISTS public."BracketPrediction_userId_idx";
DROP INDEX IF EXISTS public."BracketMatchup_round_matchIndex_key";
DROP INDEX IF EXISTS public."BonusQuestion_slug_key";
DROP INDEX IF EXISTS public."BonusPrediction_userId_questionId_key";
DROP INDEX IF EXISTS public."BonusPrediction_userId_idx";
DROP INDEX IF EXISTS public."ActualGroupResult_groupId_key";
DROP INDEX IF EXISTS public."ActualBracketResult_round_matchIndex_key";
DROP INDEX IF EXISTS public."Account_provider_providerAccountId_key";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Team" DROP CONSTRAINT IF EXISTS "Team_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."PasswordResetRequest" DROP CONSTRAINT IF EXISTS "PasswordResetRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."InviteCode" DROP CONSTRAINT IF EXISTS "InviteCode_pkey";
ALTER TABLE IF EXISTS ONLY public."Group" DROP CONSTRAINT IF EXISTS "Group_pkey";
ALTER TABLE IF EXISTS ONLY public."GroupPrediction" DROP CONSTRAINT IF EXISTS "GroupPrediction_pkey";
ALTER TABLE IF EXISTS ONLY public."Deadline" DROP CONSTRAINT IF EXISTS "Deadline_pkey";
ALTER TABLE IF EXISTS ONLY public."BracketPrediction" DROP CONSTRAINT IF EXISTS "BracketPrediction_pkey";
ALTER TABLE IF EXISTS ONLY public."BracketMatchup" DROP CONSTRAINT IF EXISTS "BracketMatchup_pkey";
ALTER TABLE IF EXISTS ONLY public."BonusQuestion" DROP CONSTRAINT IF EXISTS "BonusQuestion_pkey";
ALTER TABLE IF EXISTS ONLY public."BonusPrediction" DROP CONSTRAINT IF EXISTS "BonusPrediction_pkey";
ALTER TABLE IF EXISTS ONLY public."AppConfig" DROP CONSTRAINT IF EXISTS "AppConfig_pkey";
ALTER TABLE IF EXISTS ONLY public."ActualGroupResult" DROP CONSTRAINT IF EXISTS "ActualGroupResult_pkey";
ALTER TABLE IF EXISTS ONLY public."ActualBracketResult" DROP CONSTRAINT IF EXISTS "ActualBracketResult_pkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Team";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."PasswordResetRequest";
DROP TABLE IF EXISTS public."InviteCode";
DROP TABLE IF EXISTS public."GroupPrediction";
DROP TABLE IF EXISTS public."Group";
DROP TABLE IF EXISTS public."Deadline";
DROP TABLE IF EXISTS public."BracketPrediction";
DROP TABLE IF EXISTS public."BracketMatchup";
DROP TABLE IF EXISTS public."BonusQuestion";
DROP TABLE IF EXISTS public."BonusPrediction";
DROP TABLE IF EXISTS public."AppConfig";
DROP TABLE IF EXISTS public."ActualGroupResult";
DROP TABLE IF EXISTS public."ActualBracketResult";
DROP TABLE IF EXISTS public."Account";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: ActualBracketResult; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ActualBracketResult" (
    id text NOT NULL,
    round text NOT NULL,
    "matchIndex" integer NOT NULL,
    "teamName" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ActualGroupResult; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ActualGroupResult" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    positions text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AppConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AppConfig" (
    id text DEFAULT 'singleton'::text NOT NULL,
    data text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BonusPrediction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BonusPrediction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "questionId" text NOT NULL,
    answer text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BonusQuestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BonusQuestion" (
    id text NOT NULL,
    slug text NOT NULL,
    question text NOT NULL,
    type text NOT NULL,
    points integer DEFAULT 5 NOT NULL,
    answer text,
    "closesAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BracketMatchup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BracketMatchup" (
    id text NOT NULL,
    round text NOT NULL,
    "matchIndex" integer NOT NULL,
    "teamA" text NOT NULL,
    "teamB" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BracketPrediction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BracketPrediction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    round text NOT NULL,
    "matchIndex" integer NOT NULL,
    "teamName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Deadline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Deadline" (
    id text NOT NULL,
    phase text NOT NULL,
    "closesAt" timestamp(3) without time zone NOT NULL,
    label text DEFAULT ''::text NOT NULL
);


--
-- Name: Group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Group" (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: GroupPrediction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GroupPrediction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "groupId" text NOT NULL,
    positions text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: InviteCode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InviteCode" (
    id text NOT NULL,
    code text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    "usedBy" text,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PasswordResetRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PasswordResetRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "newPassword" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: Team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Team" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "flagUrl" text DEFAULT ''::text NOT NULL,
    "groupId" text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'USER'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    alias text,
    "avatarUrl" text
);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: ActualBracketResult; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ActualBracketResult" (id, round, "matchIndex", "teamName", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ActualGroupResult; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ActualGroupResult" (id, "groupId", positions, "updatedAt") FROM stdin;
cmp0zno5u000ot773xsi1xjsj	cmouadrs1000azdf9lj6orwbm	["Canada","Bosnia and Herzegovina","Qatar","Switzerland"]	2026-05-11 09:17:39.474
cmozo5nip00003qus9f8cw5ii	cmouadrrp0001zdf9qbom05ix	["Mexico","Czech Republic","South Korea","South Africa"]	2026-05-11 09:17:40.218
\.


--
-- Data for Name: AppConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AppConfig" (id, data, "updatedAt") FROM stdin;
\.


--
-- Data for Name: BonusPrediction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BonusPrediction" (id, "userId", "questionId", answer, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BonusQuestion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BonusQuestion" (id, slug, question, type, points, answer, "closesAt", "createdAt", "updatedAt") FROM stdin;
cmp10efka0037t7w5syl6x6hn	top_scorer	¿Quién será el máximo goleador del torneo?	player	10	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.042	2026-05-11 10:14:31.252
cmp10efkc0038t7w5f267jsx0	champion	¿Qué selección ganará el Mundial?	team	15	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.045	2026-05-11 10:14:31.253
cmp10efke0039t7w5pg72xmcu	best_goalkeeper	¿Qué selección recibirá menos goles?	team	8	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.047	2026-05-11 10:14:31.255
cmp10efkg003at7w57jidzvoa	hat_trick	¿Qué jugador hará el primer hat-trick del torneo?	player	5	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.049	2026-05-11 10:14:31.256
cmp10efki003bt7w5msfuy08s	most_goals_match	¿Cuántos goles tendrá el partido con más goles?	number	8	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.05	2026-05-11 10:14:31.257
cmp10efkk003ct7w5mzvqtauc	surprise_team	¿Qué selección no favorita llegará más lejos? (fuera del top 10 FIFA)	team	10	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.052	2026-05-11 10:14:31.259
cmp10efkl003dt7w58rxb1yks	red_cards	¿Cuántas tarjetas rojas habrá en todo el torneo?	number	5	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.053	2026-05-11 10:14:31.26
cmp10efkn003et7w5gg4ru0h9	own_goals	¿Cuántos autogoles habrá en el torneo?	number	5	\N	2026-06-11 22:00:00	2026-05-11 09:38:28.055	2026-05-11 10:14:31.261
\.


--
-- Data for Name: BracketMatchup; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BracketMatchup" (id, round, "matchIndex", "teamA", "teamB", "updatedAt") FROM stdin;
cmp0znuif000qt773l9wxpjdw	ROUND_OF_32	0	DR Congo	England	2026-05-11 09:18:14.869
\.


--
-- Data for Name: BracketPrediction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BracketPrediction" (id, "userId", round, "matchIndex", "teamName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Deadline; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Deadline" (id, phase, "closesAt", label) FROM stdin;
cmouadrut0031zdf9jsfxu447	GROUP_STAGE	2026-06-11 22:00:00	Fase de Grupos
cmouadruv0032zdf9dpavlh7c	ROUND_OF_32	2026-06-28 00:00:00	Dieciseisavos
cmouadrux0033zdf9jsr0eukm	ROUND_OF_16	2026-07-04 00:00:00	Octavos de Final
cmouadruy0034zdf94h3e4sg4	QUARTER_FINALS	2026-07-09 00:00:00	Cuartos de Final
cmouadruz0035zdf9n2vl6mcn	SEMI_FINALS	2026-07-14 00:00:00	Semifinales
cmouadrv10036zdf9hpu0q5ai	FINAL	2026-07-18 00:00:00	Final
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Group" (id, name) FROM stdin;
cmouadrrp0001zdf9qbom05ix	A
cmouadrs1000azdf9lj6orwbm	B
cmouadrsa000jzdf967032u3i	C
cmouadrsj000szdf9igsaaihs	D
cmouadrss0011zdf9qyhecgq3	E
cmouadrt0001azdf92zrn4cws	F
cmouadrt7001jzdf9c8esjr2i	G
cmouadrth001szdf9x6t929ch	H
cmouadrtr0021zdf97sfdx8fc	I
cmouadru1002azdf9iade7ku6	J
cmouadru9002jzdf903wa8jqi	K
cmouadruk002szdf92zsa2iob	L
\.


--
-- Data for Name: GroupPrediction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GroupPrediction" (id, "userId", "groupId", positions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InviteCode; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InviteCode" (id, code, note, "usedBy", "usedAt", "createdAt") FROM stdin;
cmp1e32ai000001ggof60uk65	QZAJSMEZ		\N	\N	2026-05-11 16:01:32.251
\.


--
-- Data for Name: PasswordResetRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PasswordResetRequest" (id, "userId", message, status, "newPassword", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Team" (id, name, code, "flagUrl", "groupId") FROM stdin;
cmouadrrv0005zdf9hf6j4ap0	South Africa	RSA	https://flagcdn.com/w160/za.png	cmouadrrp0001zdf9qbom05ix
cmouadrrx0007zdf934r8eh4l	South Korea	KOR	https://flagcdn.com/w160/kr.png	cmouadrrp0001zdf9qbom05ix
cmouadrrz0009zdf9tpnmrvkl	Czech Republic	CZE	https://flagcdn.com/w160/cz.png	cmouadrrp0001zdf9qbom05ix
cmouadrs4000czdf9xgyz32x0	Canada	CAN	https://flagcdn.com/w160/ca.png	cmouadrs1000azdf9lj6orwbm
cmouadrs5000ezdf93uyt8x2r	Bosnia and Herzegovina	BIH	https://flagcdn.com/w160/ba.png	cmouadrs1000azdf9lj6orwbm
cmouadrs7000gzdf9b14gn8co	Qatar	QAT	https://flagcdn.com/w160/qa.png	cmouadrs1000azdf9lj6orwbm
cmouadrtf001rzdf92g6khjjj	New Zealand	NZL	https://flagcdn.com/w160/nz.png	cmouadrt7001jzdf9c8esjr2i
cmouadrtj001uzdf98b5pjj79	Spain	ESP	https://flagcdn.com/w160/es.png	cmouadrth001szdf9x6t929ch
cmouadrtl001wzdf95xb1dbvb	Cape Verde	CPV	https://flagcdn.com/w160/cv.png	cmouadrth001szdf9x6t929ch
cmouadrtn001yzdf9i6hd1wxm	Saudi Arabia	KSA	https://flagcdn.com/w160/sa.png	cmouadrth001szdf9x6t929ch
cmouadrs8000izdf97ejugu15	Switzerland	SUI	https://flagcdn.com/w160/ch.png	cmouadrs1000azdf9lj6orwbm
cmouadrsc000lzdf9kbl09mwz	Brazil	BRA	https://flagcdn.com/w160/br.png	cmouadrsa000jzdf967032u3i
cmouadrse000nzdf991cw8nxh	Morocco	MAR	https://flagcdn.com/w160/ma.png	cmouadrsa000jzdf967032u3i
cmouadrsf000pzdf9nezxp81f	Haiti	HAI	https://flagcdn.com/w160/ht.png	cmouadrsa000jzdf967032u3i
cmouadrsh000rzdf9m54ipm8l	Scotland	SCO	https://flagcdn.com/w160/gb-sct.png	cmouadrsa000jzdf967032u3i
cmouadrsl000uzdf9pa3sp8ex	USA	USA	https://flagcdn.com/w160/us.png	cmouadrsj000szdf9igsaaihs
cmouadrsm000wzdf9jzsifinw	Paraguay	PAR	https://flagcdn.com/w160/py.png	cmouadrsj000szdf9igsaaihs
cmouadrso000yzdf9zy9ny9rc	Australia	AUS	https://flagcdn.com/w160/au.png	cmouadrsj000szdf9igsaaihs
cmouadrsq0010zdf9sgq1ex86	Turkey	TUR	https://flagcdn.com/w160/tr.png	cmouadrsj000szdf9igsaaihs
cmouadrst0013zdf9lkbaexpm	Germany	GER	https://flagcdn.com/w160/de.png	cmouadrss0011zdf9qyhecgq3
cmouadrsv0015zdf9iidddwga	Curaçao	CUW	https://flagcdn.com/w160/cw.png	cmouadrss0011zdf9qyhecgq3
cmouadrsw0017zdf9gx71jwkb	Ivory Coast	CIV	https://flagcdn.com/w160/ci.png	cmouadrss0011zdf9qyhecgq3
cmouadrsy0019zdf904qk4yjt	Ecuador	ECU	https://flagcdn.com/w160/ec.png	cmouadrss0011zdf9qyhecgq3
cmouadrt2001czdf9g76mpqdl	Netherlands	NED	https://flagcdn.com/w160/nl.png	cmouadrt0001azdf92zrn4cws
cmouadrt3001ezdf98mruaxq7	Japan	JPN	https://flagcdn.com/w160/jp.png	cmouadrt0001azdf92zrn4cws
cmouadrt5001gzdf9usbev6t0	Sweden	SWE	https://flagcdn.com/w160/se.png	cmouadrt0001azdf92zrn4cws
cmouadrt6001izdf9pmd9july	Tunisia	TUN	https://flagcdn.com/w160/tn.png	cmouadrt0001azdf92zrn4cws
cmouadrt9001lzdf9jtef7xdm	Belgium	BEL	https://flagcdn.com/w160/be.png	cmouadrt7001jzdf9c8esjr2i
cmouadrtb001nzdf9dylkn1w0	Egypt	EGY	https://flagcdn.com/w160/eg.png	cmouadrt7001jzdf9c8esjr2i
cmouadrtd001pzdf98wl1knzg	Iran	IRN	https://flagcdn.com/w160/ir.png	cmouadrt7001jzdf9c8esjr2i
cmouadruo002wzdf9tnd2gcw8	Croatia	CRO	https://flagcdn.com/w160/hr.png	cmouadruk002szdf92zsa2iob
cmouadrup002yzdf9j8k9rbxh	Ghana	GHA	https://flagcdn.com/w160/gh.png	cmouadruk002szdf92zsa2iob
cmouadrur0030zdf9zeapm8fl	Panama	PAN	https://flagcdn.com/w160/pa.png	cmouadruk002szdf92zsa2iob
cmouadrrs0003zdf9p606gvv2	Mexico	MEX	https://flagcdn.com/w160/mx.png	cmouadrrp0001zdf9qbom05ix
cmouadrtp0020zdf9scivqi6r	Uruguay	URU	https://flagcdn.com/w160/uy.png	cmouadrth001szdf9x6t929ch
cmouadrtu0023zdf9zgl93p2c	France	FRA	https://flagcdn.com/w160/fr.png	cmouadrtr0021zdf97sfdx8fc
cmouadrtw0025zdf9vk3pw2r0	Senegal	SEN	https://flagcdn.com/w160/sn.png	cmouadrtr0021zdf97sfdx8fc
cmouadrtx0027zdf98tf040wu	Iraq	IRQ	https://flagcdn.com/w160/iq.png	cmouadrtr0021zdf97sfdx8fc
cmouadrtz0029zdf9gcihmdrr	Norway	NOR	https://flagcdn.com/w160/no.png	cmouadrtr0021zdf97sfdx8fc
cmouadru3002czdf9ohwmrb4z	Argentina	ARG	https://flagcdn.com/w160/ar.png	cmouadru1002azdf9iade7ku6
cmouadru4002ezdf9ntp35bnv	Algeria	ALG	https://flagcdn.com/w160/dz.png	cmouadru1002azdf9iade7ku6
cmouadru6002gzdf97wyo7mjf	Austria	AUT	https://flagcdn.com/w160/at.png	cmouadru1002azdf9iade7ku6
cmouadru8002izdf9azt81d6c	Jordan	JOR	https://flagcdn.com/w160/jo.png	cmouadru1002azdf9iade7ku6
cmouadruc002lzdf98zkaw621	Portugal	POR	https://flagcdn.com/w160/pt.png	cmouadru9002jzdf903wa8jqi
cmouadrue002nzdf9dl4r1ehs	DR Congo	COD	https://flagcdn.com/w160/cd.png	cmouadru9002jzdf903wa8jqi
cmouadrug002pzdf973i2m5hh	Uzbekistan	UZB	https://flagcdn.com/w160/uz.png	cmouadru9002jzdf903wa8jqi
cmouadrui002rzdf9156oqd8a	Colombia	COL	https://flagcdn.com/w160/co.png	cmouadru9002jzdf903wa8jqi
cmouadrum002uzdf9ae5vlgss	England	ENG	https://flagcdn.com/w160/gb-eng.png	cmouadruk002szdf92zsa2iob
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt", alias, "avatarUrl") FROM stdin;
cmp2utvmp0000wmybarv66oph	testusera5hwaazo@example.com	$2a$10$s/pIU1XpRmIsdyK/wVnSg.FpJasmZCSW48P2sNfGqYMfZJ.knM8xe	John	Doe	USER	2026-05-12 16:38:03.361	2026-05-12 16:38:03.361	\N	\N
cmp11osn00001t75kfd5f1ume	daniizarsan@gmail.com	$2a$10$H.7JDMydnxUigZkJYpToHu0DT9RSNnW/EVHsq45P5QD4BZwoDvzeK	Zarza		ADMIN	2026-05-11 10:14:31.164	2026-05-11 16:18:40.506	Zarza	/images/dragonite.png
cmp1eqhag0000ulbv3qkofmk2	testuserizz8fhif@example.com	$2a$10$.MUC4jS3GyjjJD.93qplneCKIDRftmDowuUiUr8HJdsqeK7Ohjysq	John	Doe	USER	2026-05-11 16:19:44.777	2026-05-11 16:19:44.777	\N	\N
cmp136bba0000t7vgoxddt5lv	john@doe.com	$2a$10$4DwHVVVch58Gy8Jj4woehe3ps8aV/CpGq5oLpF2/qLGPFrE6BmYUu	Test	User	USER	2026-05-11 10:56:08.134	2026-05-11 10:56:08.134	\N	\N
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: ActualBracketResult ActualBracketResult_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActualBracketResult"
    ADD CONSTRAINT "ActualBracketResult_pkey" PRIMARY KEY (id);


--
-- Name: ActualGroupResult ActualGroupResult_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActualGroupResult"
    ADD CONSTRAINT "ActualGroupResult_pkey" PRIMARY KEY (id);


--
-- Name: AppConfig AppConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AppConfig"
    ADD CONSTRAINT "AppConfig_pkey" PRIMARY KEY (id);


--
-- Name: BonusPrediction BonusPrediction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BonusPrediction"
    ADD CONSTRAINT "BonusPrediction_pkey" PRIMARY KEY (id);


--
-- Name: BonusQuestion BonusQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BonusQuestion"
    ADD CONSTRAINT "BonusQuestion_pkey" PRIMARY KEY (id);


--
-- Name: BracketMatchup BracketMatchup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BracketMatchup"
    ADD CONSTRAINT "BracketMatchup_pkey" PRIMARY KEY (id);


--
-- Name: BracketPrediction BracketPrediction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BracketPrediction"
    ADD CONSTRAINT "BracketPrediction_pkey" PRIMARY KEY (id);


--
-- Name: Deadline Deadline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deadline"
    ADD CONSTRAINT "Deadline_pkey" PRIMARY KEY (id);


--
-- Name: GroupPrediction GroupPrediction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupPrediction"
    ADD CONSTRAINT "GroupPrediction_pkey" PRIMARY KEY (id);


--
-- Name: Group Group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);


--
-- Name: InviteCode InviteCode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InviteCode"
    ADD CONSTRAINT "InviteCode_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetRequest PasswordResetRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordResetRequest"
    ADD CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: ActualBracketResult_round_matchIndex_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ActualBracketResult_round_matchIndex_key" ON public."ActualBracketResult" USING btree (round, "matchIndex");


--
-- Name: ActualGroupResult_groupId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ActualGroupResult_groupId_key" ON public."ActualGroupResult" USING btree ("groupId");


--
-- Name: BonusPrediction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BonusPrediction_userId_idx" ON public."BonusPrediction" USING btree ("userId");


--
-- Name: BonusPrediction_userId_questionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BonusPrediction_userId_questionId_key" ON public."BonusPrediction" USING btree ("userId", "questionId");


--
-- Name: BonusQuestion_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BonusQuestion_slug_key" ON public."BonusQuestion" USING btree (slug);


--
-- Name: BracketMatchup_round_matchIndex_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BracketMatchup_round_matchIndex_key" ON public."BracketMatchup" USING btree (round, "matchIndex");


--
-- Name: BracketPrediction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BracketPrediction_userId_idx" ON public."BracketPrediction" USING btree ("userId");


--
-- Name: BracketPrediction_userId_round_matchIndex_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BracketPrediction_userId_round_matchIndex_key" ON public."BracketPrediction" USING btree ("userId", round, "matchIndex");


--
-- Name: Deadline_phase_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Deadline_phase_key" ON public."Deadline" USING btree (phase);


--
-- Name: GroupPrediction_userId_groupId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GroupPrediction_userId_groupId_key" ON public."GroupPrediction" USING btree ("userId", "groupId");


--
-- Name: GroupPrediction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GroupPrediction_userId_idx" ON public."GroupPrediction" USING btree ("userId");


--
-- Name: Group_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Group_name_key" ON public."Group" USING btree (name);


--
-- Name: InviteCode_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InviteCode_code_idx" ON public."InviteCode" USING btree (code);


--
-- Name: InviteCode_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "InviteCode_code_key" ON public."InviteCode" USING btree (code);


--
-- Name: PasswordResetRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PasswordResetRequest_status_idx" ON public."PasswordResetRequest" USING btree (status);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Team_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Team_code_key" ON public."Team" USING btree (code);


--
-- Name: Team_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Team_name_key" ON public."Team" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BonusPrediction BonusPrediction_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BonusPrediction"
    ADD CONSTRAINT "BonusPrediction_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."BonusQuestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BonusPrediction BonusPrediction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BonusPrediction"
    ADD CONSTRAINT "BonusPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BracketPrediction BracketPrediction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BracketPrediction"
    ADD CONSTRAINT "BracketPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GroupPrediction GroupPrediction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupPrediction"
    ADD CONSTRAINT "GroupPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PasswordResetRequest PasswordResetRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordResetRequest"
    ADD CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Team Team_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


