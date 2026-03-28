export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Privacy Policy
      </h1>

      <p className="text-sm sm:text-base mb-4" style={{ color: "var(--text-secondary)" }}>
        iTube values your privacy. This policy explains what information we use and how we handle it.
      </p>

      <section className="space-y-3 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
        <p>
          We use your Google sign-in information (such as name, email, and profile details) only to provide account features,
          personalize your experience, and save your learning roadmaps.
        </p>
        <p>
          Your saved learning data is used only to support your roadmap progress in this app. We do not sell your personal data.
        </p>
        <p>
          We may use analytics to understand product usage and improve the app experience.
        </p>
        <p>
          If you want to ask about your privacy or request support, contact us at:
          <a
            href="mailto:itubelearn.me@gmail.com"
            className="ml-1 underline-offset-4 hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            itubelearn.me@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
