import type { Metadata } from "next";
import Link from "next/link";
import { Script } from "@/components/brand/doodles";
import { siteConfig } from "@/config/site";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { LegalPage, type LegalSection } from "@/features/marketing/pages/legal-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when your family books online tutoring with Crystal Online Academy.",
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        These terms form the agreement between you (the parent or guardian booking lessons) and {siteConfig.name}. By
        booking a trial, creating an account or paying for a plan, you agree to them. Please read them alongside our{" "}
        <Link href="/privacy">privacy policy</Link>. [Company details to be inserted.]
      </p>
    ),
  },
  {
    id: "service",
    title: "Our service",
    body: (
      <>
        <p>
          We provide live, one-to-one online tutoring with tutors we have vetted and trained, along with session notes,
          progress reports and a parent portal. We aim to keep your child with the same tutor, but may need to arrange cover
          or a rematch from time to time.
        </p>
        <p>Tutoring supports, but does not replace, your child&apos;s schooling, and we cannot guarantee particular grades.</p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <ul>
        <li>You must be 18 or over and the parent or legal guardian of any child you enrol.</li>
        <li>Keep your login details safe; you are responsible for activity on your account.</li>
        <li>Learner accounts are created and supervised by you.</li>
      </ul>
    ),
  },
  {
    id: "trials-plans",
    title: "Trials, plans and payment",
    body: (
      <>
        <ul>
          <li>Your first 30-minute trial lesson is free and carries no obligation.</li>
          <li>Plans are billed monthly in advance in GBP or CAD, at the price shown when you sign up.</li>
          <li>A 10% sibling discount applies to the second and subsequent children in the same family.</li>
          <li>We will give at least 30 days&apos; notice of any price change.</li>
        </ul>
        <p>If a payment fails, we may pause lessons until it is resolved.</p>
      </>
    ),
  },
  {
    id: "lessons",
    title: "Rescheduling and missed lessons",
    body: (
      <ul>
        <li>Reschedule with at least 24 hours&apos; notice and we will find a new time within the same month.</li>
        <li>Lessons missed without notice may be counted as delivered.</li>
        <li>If your tutor cancels, we will always rearrange or credit the lesson.</li>
      </ul>
    ),
  },
  {
    id: "cancellation",
    title: "Pausing and cancelling",
    body: (
      <>
        <p>
          You can pause or cancel your plan with 14 days&apos; notice by emailing{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or messaging us in your portal. Unused prepaid lessons
          after the notice period will be refunded pro rata.
        </p>
        <p>
          If you are a UK consumer, you also have a 14-day statutory right to cancel a new contract. If you ask us to start
          lessons within that period, we may deduct the value of lessons already delivered. Consumers in Canada have the
          cancellation rights given by their provincial consumer protection law.
        </p>
      </>
    ),
  },
  {
    id: "safeguarding",
    title: "Safeguarding and conduct",
    body: (
      <>
        <p>Every child&apos;s safety comes first. To support this:</p>
        <ul>
          <li>Lessons take place only on our approved platforms, and a parent or carer should be nearby for younger children.</li>
          <li>Tutors and families should not arrange private lessons or communicate outside our platform.</li>
          <li>We may suspend lessons immediately if we have a safeguarding concern, and will report concerns where required.</li>
        </ul>
        <p>We expect kindness and respect from everyone: learners, parents and tutors alike.</p>
      </>
    ),
  },
  {
    id: "non-solicitation",
    title: "Working with our tutors",
    body: (
      <p>
        Our tutors are recruited, trained and supported by us. While you are a customer and for six months afterwards, please
        do not engage a tutor you met through us privately. This protects the safeguarding standards families rely on.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <p>
        We provide our service with reasonable care and skill. Nothing in these terms limits liability that cannot be limited
        by law, including for death or personal injury caused by negligence or for fraud. Otherwise, our total liability is
        limited to the fees you paid in the three months before the issue arose.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and complaints",
    body: (
      <>
        <p>
          If something goes wrong, please tell us first at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> and
          we will do our best to put it right quickly.
        </p>
        <p>
          For UK customers these terms are governed by the laws of England and Wales. For customers in Canada, they are governed
          by the laws of your province of residence. Your local mandatory consumer rights always apply.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <LegalPage
        eyebrow="Terms of service"
        title={
          <>
            The fair, <Script>friendly</Script> print
          </>
        }
        subtitle="What you can expect from us, and what we ask of you, written to be read rather than skimmed."
        updated="10 October 2026"
        sections={sections}
      />
      <ClosingCta />
    </>
  );
}
