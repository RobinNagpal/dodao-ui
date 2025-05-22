INSERT INTO public.spaces (id,
                           verified,
                           created_at,
                           creator,
                           name,
                           updated_at,
                           avatar,
                           admin_usernames_v1,
                           domains,

                           auth_settings,

                           features,
                           theme_colors
                           )
VALUES ('compound',
        true,
        '2024-06-02 00:38:06.673',
        'clhqrymsy0006s9awkhi9o7k6',
        'COMPOUND',
        '2024-06-02 00:38:06.673',
        'https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png',
        '{"{\"username\": \"0xDA878e846D2DF54e10224E45587c302DeDd02292\", \"nameOfTheUser\": \"neusha\"}","{\"username\": \"neusha@dodao.io\", \"nameOfTheUser\": \"neusha\"}","{\"username\": \"0xB0Bc2970c3A870E7E3383357AA98770Fc8eAE3F1\", \"nameOfTheUser\": \"Sami\"}"}',
        '{compound.education,compound-localhost.education}',

        '{}',

        '{}',
        '{
          "primaryColor": "#00AD79",
          "bgColor": "#0D131A",
          "textColor": "#f1f1f3",
          "linkColor": "#f1f1f3",
          "headingColor": "#f1f1f3",
          "borderColor": "#d1d5da",
          "blockBg": "#1e202d"
        }');
