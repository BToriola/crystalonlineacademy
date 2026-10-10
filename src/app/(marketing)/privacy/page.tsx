import type { Metadata } from "next";
import Link from "next/link";
import { Script } from "@/components/brand/doodles";
import { siteConfig } from "@/config/site";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { LegalPage, type LegalSection } from "@/features/marketing/pages/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Crystal Online Academy collects, uses and protects personal information about parents, children and tutors under UK GDPR and Canada's PIPEDA.",
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides live one-to-one online tutoring for children in the
          United Kingdom and Canada. We are the <strong>controller</strong> of the personal information described here for
          the purposes of the UK General Data Protection Regulation and Data Protection Act 2018 (&ldquo;UK GDPR&rdquo;), and
          we are accountable for it under Canada&apos;s Personal Information Protection and Electronic Documents Act
          (&ldquo;PIPEDA&rdquo;) and applicable provincial laws.
        </p>
        <p>
          [Registered company name, number and address to be inserted.] Our privacy lead can be reached at{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: (
      <>
        <h3>From parents and guardians</h3>
        <ul>
          <li>Name, email address, phone or WhatsApp number, country and time zone.</li>
          <li>Billing details (processed by our payment provider; we do not store full card numbers).</li>
          <li>Messages you send us and your tutor.</li>
        </ul>
        <h3>About children</h3>
        <ul>
          <li>First name, year group or grade, subjects and learning goals.</li>
          <li>Learning notes, session notes, homework, progress reports, stars and badges.</li>
          <li>Any learning needs you choose to share so we can support your child well.</li>
        </ul>
        <h3>From tutors and applicants</h3>
        <ul>
          <li>Contact details, qualifications, CV, references, interview notes and assessment results.</li>
          <li>Identity and safeguarding check outcomes, and payment details for paying tutors.</li>
        </ul>
        <h3>Automatically</h3>
        <ul>
          <li>Basic technical data such as device type, browser and time zone, and essential cookies that keep you signed in.</li>
        </ul>
        <p>We do not record lessons unless we have told you in advance and, where required, asked for your consent.</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use it, and our legal bases",
    body: (
      <>
        <ul>
          <li>
            <strong>To deliver tutoring</strong> — matching, scheduling, lessons, notes and reports (performance of our contract
            with you).
          </li>
          <li>
            <strong>To keep children safe</strong> — vetting tutors, monitoring for safeguarding concerns and acting on them
            (legal obligation and legitimate interests).
          </li>
          <li>
            <strong>To run our business</strong> — billing, customer support, improving our service and preventing fraud
            (contract and legitimate interests).
          </li>
          <li>
            <strong>To keep in touch</strong> — occasional updates and offers, only where you have opted in. You can unsubscribe
            at any time (consent).
          </li>
        </ul>
        <p>
          Under PIPEDA we rely on your knowledge and consent, which you give when you book a trial, create an account or apply
          to tutor. You may withdraw consent at any time, subject to legal or contractual restrictions.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's information",
    body: (
      <>
        <p>
          Our service is arranged by parents and guardians. We collect children&apos;s information from the parent, keep it to
          the minimum needed to teach well, and never use it for advertising or profiling. Learner accounts are created and
          controlled by the parent.
        </p>
        <p>
          We design our service with the UK Information Commissioner&apos;s Age Appropriate Design Code in mind: high privacy
          settings by default, no nudging, and clear explanations for young learners.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We never sell personal information. We share it only with:</p>
        <ul>
          <li>Your child&apos;s assigned tutor, who sees only what they need to teach.</li>
          <li>
            Trusted service providers acting on our instructions, such as hosting and database (e.g. Supabase), video
            conferencing, email and payment processors.
          </li>
          <li>Authorities, where the law requires it or a child may be at risk of harm.</li>
        </ul>
      </>
    ),
  },
  {
    id: "international",
    title: "International transfers",
    body: (
      <p>
        Our tutors are based mainly in Nigeria and West Africa, and some providers store data outside the UK and Canada. Where
        information is transferred, we use appropriate safeguards such as the UK International Data Transfer Agreement or
        Addendum, contractual protections and strict access controls, and we remain accountable for it.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep account and learning records while your child is enrolled and for up to [two] years afterwards, financial
        records for as long as tax law requires (typically six years in the UK), and unsuccessful tutor applications for up
        to [six] months. Safeguarding records may be kept longer where the law or statutory guidance requires.
      </p>
    ),
  },
  {
    id: "security",
    title: "Keeping it secure",
    body: (
      <p>
        We use encryption in transit, role-based access, row-level database security and regular reviews of who can see what.
        Tutors receive data protection and safeguarding training. If a breach occurs that is likely to put you at risk, we will
        tell you and the relevant regulator promptly.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Depending on where you live, you can ask us to:</p>
        <ul>
          <li>Access the information we hold about you or your child.</li>
          <li>Correct anything inaccurate or incomplete.</li>
          <li>Delete information, or restrict or object to how we use it.</li>
          <li>Provide your information in a portable format.</li>
          <li>Withdraw consent you have given.</li>
        </ul>
        <p>
          Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> and we will respond within one month (UK) or 30
          days (Canada). You may also complain to the UK{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            Information Commissioner&apos;s Office
          </a>{" "}
          or the{" "}
          <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer">
            Office of the Privacy Commissioner of Canada
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        We use only essential cookies to keep you signed in and remember preferences such as your colour theme. If we add
        analytics or marketing cookies in future, we will ask for your consent first.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will post any updates here and let account holders know about significant changes. Questions? Visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <LegalPage
        eyebrow="Privacy policy"
        title={
          <>
            Your family&apos;s privacy, <Script>protected</Script>
          </>
        }
        subtitle="Plain-English answers about what we collect, why we need it and the choices you have."
        updated="10 October 2026"
        sections={sections}
      />
      <ClosingCta
        title={
          <>
            Questions about <Script className="text-sun">your data?</Script>
          </>
        }
        body="Our team is happy to explain anything in this policy or help you exercise your rights."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Read our terms", href: "/terms" }}
      />
    </>
  );
}
