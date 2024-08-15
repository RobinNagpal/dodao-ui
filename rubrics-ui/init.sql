insert into
    spaces (
        id,
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
values
    (
        'test-academy-eth',
        true,
        '2023-07-08 19:19:16.998',
        'clhjfyne00000mc08gc4wsqs0',
        'The Test Academy',
        '2023-08-10 20:04:43.664',
        'https://d31h13bdjwgzxs.cloudfront.net/academy/daocubator/daocubator_logo.jpg',
        '{}',
        '{}',
        '{"enableLogin":false,"loginOptions":["Discord","MetaMask","Google","Coinbase","Near"]}',
        '{}',
        '{"primaryColor":"#384aff","bgColor":"#ffffff","textColor":"#57606a","linkColor":"#111111","headingColor":"#111111","borderColor":"#d0d7de","blockBg":"#F5F9FF"}'
    );
    