`/api/[spaceId]/rubric-ratings` - this is for list or create

`api/[spaceId]/rubric-ratings/[ratingId]` - this is for get a rating or update or delete
`api/[spaceId]/net-ratings/[ratingId]` - this is for get a rating or update or delete

`api/[spaceId]/actions/rubric-ratings/[ratingId]/finalize` - this is for specific action on a rating


- [ ] The rating should be removed from the cell selection and added to the rubric rating table. Initially it should be
set and InProgress. Create an enum for it.
- [ ] move the finalize route to the right directory
- [ ] move the net ratings route to the right directory `api/[spaceId]/net-ratings/[ratingId]`

