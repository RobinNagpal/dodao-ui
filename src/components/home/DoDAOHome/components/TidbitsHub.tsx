import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

export function TidbitsHub() {
  return (
    <section id="tidibits-hub" aria-labelledby="tidibits-hub-title" className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32 text-left">
      <Container size="lg">
        <SectionHeading number="1" id="tidibits-hub-title">
          TidbitsHub
        </SectionHeading>
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl pt-8">
            <div className="mx-auto max-w-6xl gap-x-14 lg:mx-0 lg:flex lg:items-center">
              <div className="w-full max-w-6xl lg:shrink-0 ">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">We’re changing the way people connect.</h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Unlock bite-sized learning at its best. Tidbits Hub presents content in clear, manageable steps for quick yet profound understanding. Each
                  tidbit is a powerful nugget of knowledge, designed to deliver swift and efficient learning. Along with this, concise one-minute videos are
                  embedded to bring topics to life, making your educational journey with us both dynamic and engaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
