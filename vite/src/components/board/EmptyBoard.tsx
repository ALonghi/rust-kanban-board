import { PlusIcon } from "@heroicons/react/20/solid";

export default function EmptyBoard({ setOpen }) {
  return (
    <>
      <div
        className="my-16 relative block w-full rounded-lg border-2 border-dashed border-gray-300
            p-12 text-center hover:border-gray-400 
            focus:outline-none focus:ring-0 "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="mx-auto h-12 w-12 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
          />
        </svg>

        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No board found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating a new one!
        </p>
        <div className="mt-6" onClick={() => setOpen(true)}>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-theme-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-theme-700 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Board
          </button>
        </div>
      </div>
    </>
  );
}
