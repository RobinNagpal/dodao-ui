# Project Guidelines

## While adding code 
* Add typescript types explicitly. Try to use existing types and existing code as much as possible

#### For new UI code
* Dont use useMemo or useCallback. Try to see if you can avoid use of useEffect, if not then its fine to add
* Reuse useFetchData, usePostData etc hooks as much as possible when making server side requests in the client components.
