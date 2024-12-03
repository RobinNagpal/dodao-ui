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
GRANT ALL PRIVILEGES ON DATABASE next_app_localhost_db TO admin;

-- Create the Prisma migrations table
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

-- Create the TweetCollection table
CREATE TABLE public.tweet_collections (
    id character varying(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description character varying(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    archive BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.tweet_collections OWNER TO admin;

-- Create the TwitterHandle table
CREATE TABLE public.twitter_handles (
    id character varying(64) NOT NULL,
    handle VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    archive BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.twitter_handles OWNER TO admin;

-- Create the mapping table for TweetCollection and TwitterHandle
CREATE TABLE public.tweet_collection_handles_mappings (
    id SERIAL PRIMARY KEY,
    tweet_collection_id character varying(64) NOT NULL,
    twitter_handle_id character varying(64) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    archive boolean DEFAULT false
);
ALTER TABLE public.tweet_collection_handles_mappings OWNER TO admin;

-- Create the Tweets table
CREATE TABLE public.tweets (
    id character varying(64) NOT NULL,
    twitter_handle_id character varying(64) NOT NULL,
    collection_id character varying(64) NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[],
    date TIMESTAMP NOT NULL,
    lang VARCHAR(10) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_display_name VARCHAR(255) NOT NULL,
    user_username VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    archive BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.tweets OWNER TO admin;

-- Indexes for optimization
CREATE INDEX idx_tweets_collection_id ON public.tweets (collection_id);
CREATE INDEX idx_tweets_twitter_handle_id ON public.tweets (twitter_handle_id);

-- Constraints for TweetCollection
ALTER TABLE ONLY public.tweet_collections ADD CONSTRAINT pk_tweet_collections PRIMARY KEY (id);

-- Constraints for TwitterHandle
ALTER TABLE ONLY public.twitter_handles ADD CONSTRAINT pk_twitter_handles PRIMARY KEY (id);

-- Constraints for TweetCollectionHandles
ALTER TABLE ONLY public.tweet_collection_handles_mappings 
ADD CONSTRAINT fk_tweet_collection FOREIGN KEY (tweet_collection_id) REFERENCES public.tweet_collections (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.tweet_collection_handles_mappings 
ADD CONSTRAINT fk_twitter_handle FOREIGN KEY (twitter_handle_id) REFERENCES public.twitter_handles (id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Constraints for Tweets
ALTER TABLE ONLY public.tweets ADD CONSTRAINT pk_tweets PRIMARY KEY (id);

ALTER TABLE ONLY public.tweets 
ADD CONSTRAINT fk_twitter_handle_tweet FOREIGN KEY (twitter_handle_id) REFERENCES public.twitter_handles (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.tweets 
ADD CONSTRAINT fk_tweet_collection_tweet FOREIGN KEY (collection_id) REFERENCES public.tweet_collections (id) ON UPDATE CASCADE ON DELETE CASCADE;
