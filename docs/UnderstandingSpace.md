# What is a space
- Normally in any application you will create a project/organization and users and entities belonging to that organization
- Here we call that project/organization as a space


# Domains on our side
- We have a domain like `tidbitshub.com` or `myrubrics.com`
- When we create a space, we create a subdomain for that space like `${space-id}.tidbitshub.com` or `${space-id}.myrubrics.com`
- We use the subdomain to show the content specific to that space.
- We only show the content of one space at a time. We never show the content of all spaces together.
- So based on the url, we determine the space and show the data of that space only.
- See `academy-ui/src/utils/space/getSpaceServerSide.tsx` to understand how UI makes a request to the server with the space host(domain in the url).
- See how we then use that host to determine the space `academy-ui/src/app/api/spaces/route.ts`

# On main domain
The first check in `academy-ui/src/app/api/spaces/route.ts` is
```typescript
const { searchParams } = new URL(req.url);
const domain = searchParams.get('domain');

const space = await prisma.space.findFirst({
  where: {
    domains: {
      has: domain,
    },
  },
});
```
So on the server side, we can render the space on any domain. We can render the space on `example-project.tidbitshub.com` 
or `tidbitshubexample.com` or `tidbitshub.example.com`. We just need to make sure that domain is added to the space.

We have some more logic to make it convenient to determine the space based on the domain. See the code in `academy-ui/src/app/api/spaces/route.ts`

# For Customers
Customers might want to use their own domain like `realfinance.com` instead of `realfinance.tidbitshub.com` or `realfinance.myrubrics.com`
because they don't their users to go to another domain. They want to keep the users on their domain.

So we provide the ability to map their domain to the space. This is done by adding a CNAME record in the DNS settings 
of the domain provider. They will have to do this themselves. On our side, we use Vercel's domain alias feature to 
make this work. [See Here](https://vercel.com/docs/projects/domains/add-a-domain)


# Subdomains
A domain is like your website's main address (e.g., "example.com"), and a subdomain adds a word before this address to 
create a separate section (like "blog.example.com" or "docs.example.com"). Subdomains function independently from the 
main domain, allowing you to host completely different content or applications under the same overall website. For 
example, "blog.example.com" might feature news and articles, while "docs.example.com" could provide technical manuals 
or user guides. This setup helps organize content and services effectively, even though they're all part of the same 
primary domain.

Technically, domains and subdomains are managed through the Domain Name System (DNS), which translates human-readable 
names into IP addresses that computers use to communicate. The main domain (e.g., "example.com") is registered and 
associated with DNS records pointing to a server's IP address. Subdomains like "blog.example.com" or "docs.example.com" 
are created by adding a prefix to the main domain and configuring additional DNS records. These subdomains can point 
to the same server as the main domain or **to entirely different servers and directories**. This flexibility allows each 
subdomain to host different websites or applications, enabling completely separate content under the umbrella of 
the main domain.

# Space and Subdomains
There are some more features that are added to the space to make the product more useful:
- We want to have a different subdomain for each space. This architecture allows anyone to map a "custom" domain
  to their space(or our product + space). 

### How we load site for the subdomain: `realfinance.tidbitshub.com`
- When a user goes to `realfinance.tidbitshub.com`, we determine the space based on the subdomain and show the content specific to that space.
- See `academy-ui/src/utils/space/getSpaceServerSide.tsx` to understand how UI makes a request to the server passing the space host(domain in the url).
- We have logic in `academy-ui/src/app/api/spaces/route.ts` to determine the space based on the domain.
  ```typescript
    if (domain?.includes('.tidbitshub.org') || domain?.includes('.tidbitshub-localhost.org')) {
      const idFromDomain = domain.split('.')[0];
      const space = await prisma.space.findFirst({
        where: {
          id: idFromDomain,
        },
      });
      return NextResponse.json([space]);
    }
  ``` 
- Here we check if the domain includes `.tidbitshub.org` or `.tidbitshub-localhost.org` and then we get the space based on the id in the domain.
- The subdomain is the space id. So we get the space based on the space i.e. the subdomain.

# Custom domains
- Many projects(example.com) have docs website or blogs. and they are hosted on a subdomain like `docs.example.com` or `blog.example.com`.
  Similarly we want to provide the ability to host `tidbitshub` or `rubrics` on a subdomain like `tidbitshub.example.com` or `rubrics.example.com`.
- Here `tidbitshub.example.com` should use the theme of `example.com` and the content shown should be specific to the project/space `example.com`.
- We also provide the ability to have a parent(not subdomain) custom domain like `tidbitsexample.com` which will show a specific space's content and theme.

Example:
We want an finance company "realfinance.com" to use our tidbits hub for sharing information with their customers, and
we want them to use rubrics for their internal team.

### On our side:
- We will create a space for them called "realfinance"
- On `tidbitshub.com`, we will map this space to `realfinance.tidbitshub.com` and show the content specific to the space "realfinance"
- To make these subdomains work we use [vercel's](https://vercel.com/docs/projects/domains/working-with-domains#wildcard-domain) wildcard domain feature.
- Similarly, we will map the rubrics to `realfinance.myrubrics.com` and show the content specific to the space "realfinance"


### On the side of "realfinance.com":
- They would want to load tidbitshub when a users go to `tidbitshub.realfinance.com` and show the content specific to the space "realfinance". 
  This is very similar to how many websites have a blog or docs website on a subdomain like `docs.realfinance.com` or `blog.realfinance.com`
- They don't want their customers to go to `realfinance.tidbitshub.com` but instead go to `tidbitshub.realfinance.com`


### Custom domains
- Many times people might want to use the main domain like `tisbitsrealfinance.com` instead of `realfinance.tidbitshub.com` or `realfinance.myrubrics.com`
- We will provide the ability to map the custom domain to the space.

Mapping of `tisbitsrealfinance.com` to `realfinance.tidbitshub.com` is done by adding a CNAME record in the DNS 
settings of the domain provider. They will have to do this themselves. On our side, we use Vercel's domain alias feature
to make this work. [See Here](https://vercel.com/docs/projects/domains/add-a-domain)


# Spaces and Data
- We always separate the data of each space and we never show data of all spaces together. We only show it one at a time for a particular url/space.


# Checklist to make sure you understand
- [ ] How we determine the space based on the domain in the url
- [ ] How we show the content specific to the space based on the domain in the url
- [ ] How subdomains work
- [ ] How we use the subdomain to determine the space
- [ ] How subdomain is the space id
- [ ] How we use the custom domain to determine the space
- [ ] How to add a custom domain to the space
