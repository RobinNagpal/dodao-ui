export default function ContactUsButton() {
  return (
    <div className="flex justify-center text-center align-center mt-4">
      <a
        href="mailto:info@dodao.com"
        className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Contact Us
      </a>
    </div>
  );
}
