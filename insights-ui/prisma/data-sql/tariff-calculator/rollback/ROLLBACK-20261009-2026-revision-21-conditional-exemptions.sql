-- DO NOT RUN unless undoing 20261009-2026-revision-21-conditional-exemptions.sql (applied 2026-10-09). Restores the 69 hts_codes rows it reformatted and empties tariff_measures / tariff_chapter99_headings.
-- ROLLBACK for 20261009-2026-revision-21-conditional-exemptions.sql (generated from a read-only backup before applying).
-- Restores 69 hts_codes rows to their previous values and empties the two new tables (they held 0 headings / 0 measures before).
BEGIN;
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = 'Free', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '0309.90.10';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = 'Free', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '0309.90.40';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = 'Free', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '0309.90.50';
UPDATE hts_codes SET general_rate_of_duty = '$1.128/kg', special_rate_of_duty = 'Free (BH,CL,JO,KR,MA,OM,P,PE,SG) See 9823.04.01-9823.04.54 (S+) See 9908.04.05 (IL) See 9918.04.50, 9918.04.58 (CO) See 9919.04.50, 9919.04.57, 9919.04.67 (PA (PA)', column2_rate_of_duty = '$1.328/kg', unit_of_quantity = ARRAY['kg', 'kg cmsc']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '0406.90.94.00';
UPDATE hts_codes SET general_rate_of_duty = '0.5¢/kg', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '1.7¢/kg', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '0701.90.10';
UPDATE hts_codes SET general_rate_of_duty = '4.3¢/kg on drained weight', special_rate_of_duty = 'Free (A*,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '10¢/kg on drained weight', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2005.70.75';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.10.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.21.00.00';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.29.00.10';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.29.00.20';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.29.00.30';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.29.00.55';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.30.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['thousand m<sup>3</sup>']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2804.40.00.00';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = 'Free', unit_of_quantity = ARRAY['t', 'NH<sub>3</sub> t']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2814.20.00.00';
UPDATE hts_codes SET general_rate_of_duty = '5.4%', special_rate_of_duty = 'Free 
(A+, AU, BH,CL, CO, D, E, IL,JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '46.3%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2903.62.10.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2903.71.01.00';
UPDATE hts_codes SET general_rate_of_duty = '5.5%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,L,KR,L,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '15.4¢/kg + 48.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '2908.91.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.1%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, K, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3204.18.00.00';
UPDATE hts_codes SET general_rate_of_duty = '6.5%', special_rate_of_duty = 'Free
(A, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P, PA, PE, S, SG)', column2_rate_of_duty = '15.4¢/kg + 52.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3402.31.10.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A, AU, BH, CL,CO, D, E, IL, JO, KR, MA, OM, P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3402.31.90.00';
UPDATE hts_codes SET general_rate_of_duty = '4%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P, PA, PE, S, SG)', column2_rate_of_duty = '15.4¢/kg + 53.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3402.39.10.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, K, KR, MA, OM, P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3402.42.90.00';
UPDATE hts_codes SET general_rate_of_duty = '3%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO,D,E, IL, JO, KR, MA, OM, P, PA, PE, S, SG)', column2_rate_of_duty = '30%', unit_of_quantity = ARRAY[]::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3816.00.20';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.12.00.00';
UPDATE hts_codes SET general_rate_of_duty = '6.5%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, K, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '114.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.13.00.00';
UPDATE hts_codes SET general_rate_of_duty = '6.5%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, K, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '114.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.14.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, K, KR, MA,OM, P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.40.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.51.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.59.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.61.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.63.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.64.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.65.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.68.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.69.00.00';
UPDATE hts_codes SET general_rate_of_duty = '6.5%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '114.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.90.10.00';
UPDATE hts_codes SET general_rate_of_duty = '3.7%', special_rate_of_duty = 'Free 
(A+, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM,P, PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3827.90.90.00';
UPDATE hts_codes SET general_rate_of_duty = '6.5%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, K, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '2.2¢/kg  +  33.5%', unit_of_quantity = ARRAY['kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '3911.20.00.00';
UPDATE hts_codes SET general_rate_of_duty = '3%', special_rate_of_duty = 'Free 
(A, AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P,PA, PE, S, SG)', column2_rate_of_duty = '25%', unit_of_quantity = ARRAY[]::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '4015.19.11';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['No.', ' kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '4202.22.40.20';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['doz. ', 'kg']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '6203.42.45.51';
UPDATE hts_codes SET general_rate_of_duty = '5%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '55%', unit_of_quantity = ARRAY['No.']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '7020.00.60.00';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['pcs ']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '7113.19.50.21';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['pcs ']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '7113.19.50.45';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = '25%', unit_of_quantity = ARRAY[' ']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '7306.30.10';
UPDATE hts_codes SET general_rate_of_duty = '2.6%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '35%', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '8543.30.90';
UPDATE hts_codes SET general_rate_of_duty = '2.6%', special_rate_of_duty = 'Free (A*,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '35%', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '8543.40.00';
UPDATE hts_codes SET general_rate_of_duty = '2.6%', special_rate_of_duty = 'Free (A,AU,B,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '35%', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '8544.42.90';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = '40%', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9403.30.80';
UPDATE hts_codes SET general_rate_of_duty = '5.3%', special_rate_of_duty = 'Free (AU,BH,CL, CO,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '40%', unit_of_quantity = ARRAY['', '
']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9404.90.10';
UPDATE hts_codes SET general_rate_of_duty = '6%', special_rate_of_duty = 'Free (A,AU,BH,CL,CO,D,E,IL,JO,KR,MA,OM,P,PA,PE,S,SG)', column2_rate_of_duty = '40%', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9404.90.20';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.12';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.45';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.55';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.79';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.94';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.97';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.10.98';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.80.30';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.80.40';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9801.00.80.90';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = 'Free (See U.S. note 4 of this subchapter)', column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['
']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9802.00.91.00';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = NULL, column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9813.00.05.40';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = 'The rate applicable in the absence of this heading', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9817.00.50.00';
UPDATE hts_codes SET general_rate_of_duty = 'Free', special_rate_of_duty = NULL, column2_rate_of_duty = 'The rate applicable in the absence of this heading', unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9817.00.60.00';
UPDATE hts_codes SET general_rate_of_duty = 'The duty provided in the applicable subheading +25%', special_rate_of_duty = 'The duty provided in the applicable subheading +25%', column2_rate_of_duty = 'The duty provided in the applicable subheading +25%', unit_of_quantity = ARRAY[]::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9903.79.01';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = 'Free (P+)', column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9915.04.17';
UPDATE hts_codes SET general_rate_of_duty = NULL, special_rate_of_duty = 'Free (PA)', column2_rate_of_duty = NULL, unit_of_quantity = ARRAY['']::text[], updated_at = now() WHERE space_id = 'koala_gains' AND hts_number = '9919.02.02';
DELETE FROM tariff_measures WHERE space_id = 'koala_gains';
DELETE FROM tariff_chapter99_headings WHERE space_id = 'koala_gains';
COMMIT;
