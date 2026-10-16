export default function ContactUsLink() {
  return (
    <div className="flex justify-center text-center align-center">
      <a href="mailto:info@dodao.com" className="text-link hover:underline">
        Contact Us <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
