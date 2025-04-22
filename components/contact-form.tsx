export function ContactForm() {
  return (
    <div className="bg-retro-screen rounded-md shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-retro-display mb-4">Contact Us</h2>
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-retro-display">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-retro-teal focus:ring-retro-teal sm:text-sm text-retro-dark"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-retro-display">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-retro-teal focus:ring-retro-teal sm:text-sm text-retro-dark"
            placeholder="Your Email"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-retro-display">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-retro-teal focus:ring-retro-teal sm:text-sm text-retro-dark"
            placeholder="Your Message"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-retro-display bg-retro-purple hover:bg-retro-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-retro-teal"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  )
}
