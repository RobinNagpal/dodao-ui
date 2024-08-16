export default function GetStarted() {
  return (
    <div className="bg-indigo-100 rounded-xl ring-1 ring-gray-900/10 mx-12 ">
      {' '}
      <div className="px-3 py-5 sm:py-20 lg:px-12">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Do you want your opinions to make a difference?
          <br />
        </h2>
        <p className="text-1xl  tracking-tight text-gray-900 sm:text-3xl mt-5">
          Whether you are passionate about influencing policies, improving community initiatives, or giving feedback on projects, using rubrics is an effective
          way to ensure your voice is heard clearly and constructively.
        </p>
        <div className="flex items-center gap-x-6 mt-6">
          <a
            href="/rubrics"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started
          </a>
        </div>
      </div>
    </div>
  );
}
