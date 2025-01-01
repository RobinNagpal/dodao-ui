# Generated Files
1. The generated files should be saved in proposer folder structure. They should have standard or consistent files names
and enclosing folders. 
2. Before executing a step, we can see if a file exists, if exists, we can skip the step. else execute it. This will 
help to partially run the steps and avoid re-executing the steps that are already fine.
3. This also helps in case some of the steps fail in the middle, the steps that ran successfully will not be re-executed.
4. Important thing to note is that the file is written as part of the final thing in each step. So, if the step fails in the middle,
the file will not be written. This is a good thing as we can see the file and know that it is complete.

We can determine the id for the project and the top folder can be created with the id. The id can also be passed by the user.

# Information provided by user
We can create a form(fields) that the user can fill in. For example latestSecFiling is a string which will have the url of the latest sec filing.

Some fields that I can think of are

1. `latestSecFiling`
2. `crowdfundingLink`
3. `id` - so that the folder name for the project is always the same.
4. `websiteUrl` - Can be derived from the crowdfundingLink. 


We need to think of these more and add more fields that are required.


# Relevance of the report
We will run it for 10 projects and make sure it produces very relevant reports. 

# Final Report as 2-3 pager document
The final report should be a 2-3 pager document that can be shared with the user. It will have different sections 
corresponding to each step. 

# Proper arrangement of nodes and proper usage of edges/tools

# Deployment of the code on the server where we can run it from the browser

# Code cleanup

# A site where will be publish these reports on ongoing basis.


