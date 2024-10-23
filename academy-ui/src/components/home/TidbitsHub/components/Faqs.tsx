import { Container } from './Container';

const faqs = [
  {
    question: 'How can you help me save on support costs?',
    answer:
      'By offering a robust platform where customers can easily access all the information they need, our platform reduces the reliance on customer support teams. This means lower overhead costs for your business and faster, more efficient customer service.',
  },
  {
    question: 'What insights can I gain about my customers through your platform?',
    answer:
      "We provide valuable insights into your customers' behaviors and preferences through their interactions with the platform's educational content. This data can be used to personalize customer experiences and further enhance satisfaction and loyalty.",
  },
  {
    question: 'How do you empower customers?',
    answer:
      'We empower customers by providing them with the tools and resources they need to fully understand and appreciate your products or services. It helps customers to become more confident and capable, which enhances their overall experience with your brand.',
  },
  {
    question: 'How does your platform help to reduce churn rates?',
    answer:
      'By providing engaging, user-friendly educational content, we keep customers invested in your brand. This high level of engagement reduces churn rates by promoting customer loyalty and satisfaction.',
  },
  {
    question: 'How do you engage and educate customers?',
    answer:
      'We offer a variety of interactive features in our Tidbits including quizzes and short videos. These engaging tools make learning about your products and services both fun and effective for your customers.',
  },
  {
    question: 'How do you help create long-term customer relationships?',
    answer:
      'By providing comprehensive and accessible knowledge, our platform fosters trust and satisfaction among your customers. This, combined with continuous learning opportunities, helps to build strong, lasting relationships.',
  },
];

export function Faqs() {
  return (
    <section id="faqs" aria-labelledby="faqs-title" className="border-t border-gray-200 py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="faqs-title" className="text-3xl font-medium tracking-tight mb-6">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-lg">
            If you have anything else you want to ask,{' '}
            <a href="mailto:info@example.com" className="underline">
              reach out to us
            </a>
            .
          </p>
        </div>
        <ul role="list" className="mx-auto mt-16 grid max-w-2xl gap-12 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {faqs.map((faq, index) => (
            <li key={index} className="space-y-4">
              <h3 className="text-base font-semibold leading-tight">{faq.question}</h3>
              <p className="text-base">{faq.answer}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
