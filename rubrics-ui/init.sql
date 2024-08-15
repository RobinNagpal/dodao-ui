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
    INSERT INTO program (
    id, 
    name, 
    details, 
    summary, 
    space_id
) 
VALUES (
    'program-1', 
    'Test Program 1', 
    'Details of Test Program 1', 
    'Summary of Test Program 1', 
    'test-academy-eth'
);

INSERT INTO rubric (
    id, 
    name, 
    summary, 
    description, 
    space_id
) 
VALUES (
    'rubric-1', 
    'Test Rubric 1', 
    'Summary of Test Rubric 1', 
    'Description of Test Rubric 1', 
    'test-academy-eth'
);
INSERT INTO program_rubric_mapping (
    id, 
    "programId",  
    "rubricId"   
) 
VALUES (
    'mapping-1', 
    'program-1', 
    'rubric-1'
);
INSERT INTO rubric_criteria (
    id, 
    title, 
    "rubricId"
) 
VALUES (
    'criteria-1', 
    'Content', 
    'rubric-1'
), 
(
    'criteria-2', 
    'Comprehensibility', 
    'rubric-1'
);

INSERT INTO rubric_level (
    id, 
    "columnName", 
    description, 
    score, 
    "rubricId"
) 
VALUES (
    'level-1', 
    'Excellent', 
    'Complete and clear.', 
    4, 
    'rubric-1'
), 
(
    'level-2', 
    'Good', 
    'Generally clear.', 
    3, 
    'rubric-1'
), 
(
    'level-3', 
    'Fair', 
    'Somewhat unclear.', 
    2, 
    'rubric-1'
), 
(
    'level-4', 
    'Improvement', 
    'Unclear.', 
    1, 
    'rubric-1'
);

INSERT INTO rubric_cell (
    id, 
    description, 
    "rubricId", 
    "levelId", 
    "criteriaId"
) 
VALUES (
    'cell-1', 
    'Detailed and accurate content.', 
    'rubric-1', 
    'level-1', 
    'criteria-1'
), 
(
    'cell-2', 
    'Adequate content.', 
    'rubric-1', 
    'level-2', 
    'criteria-1'
), 
(
    'cell-3', 
    'Content needs more clarity.', 
    'rubric-1', 
    'level-3', 
    'criteria-1'
), 
(
    'cell-4', 
    'Content is unclear.', 
    'rubric-1', 
    'level-4', 
    'criteria-1'
),
(
    'cell-5', 
    'Clear and comprehensible.', 
    'rubric-1', 
    'level-1', 
    'criteria-2'
), 
(
    'cell-6', 
    'Mostly comprehensible.', 
    'rubric-1', 
    'level-2', 
    'criteria-2'
), 
(
    'cell-7', 
    'Somewhat comprehensible.', 
    'rubric-1', 
    'level-3', 
    'criteria-2'
), 
(
    'cell-8', 
    'Incomprehensible.', 
    'rubric-1', 
    'level-4', 
    'criteria-2'
);


