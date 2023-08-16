import styled from 'styled-components';

const BackgroundDiv = styled.div`
  background-color: rgba(127, 127, 127, 0.7);
  border-radius: 2rem;
  padding: 100px;
`;

const MainContainer = styled.div`
  min-height: 100vh;
`;

export default function ErrorPage() {
  return (
    <main className="relative isolate min-h-full">
      <img
        src="https://images.unsplash.com/photo-1516822003754-cca485356ecb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3050&q=80&exp=8&con=-15&sat=-75"
        alt="Something seems to be broken."
        className="absolute inset-0 -z-10 h-screen w-full object-cover object-top"
      />
      <MainContainer className="pt-4 flex flex-col justify-center items-center byte-container w-full">
        <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
          <BackgroundDiv>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Something is Broken</h1>
            <p className="mt-4 text-base text-white/70 sm:mt-6">{`Please don't hate us. We are working hard to fix the issue.`}</p>
            <div className="mt-10 flex justify-center">
              <a href="/" className="text-base font-semibold leading-7 text-white">
                Reload
              </a>
            </div>
          </BackgroundDiv>
        </div>
      </MainContainer>
    </main>
  );
}
