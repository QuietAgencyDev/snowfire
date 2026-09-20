import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";
import { BUSINESS } from "@/lib/legal/business";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What SnowFire.ca collects, why, who it is shared with, and how to get a copy or have it deleted.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro={`${BUSINESS.name} provides snow removal and firewood in ${BUSINESS.serviceArea}. This page explains what we collect when you use the site, why we need it, and how to get a copy of it or have it deleted.`}
    >
      <LegalSection heading="What we collect">
        <p>
          <strong>Your account.</strong> Your name, email address, and phone
          number. If you sign in with Google, we receive your name and email
          address from Google — never your Google password.
        </p>
        <p>
          <strong>Your properties.</strong> The service address, its approximate
          coordinates, and anything you tell us in order to do the work
          correctly: which areas to clear, where hazards are, and access notes.
        </p>
        <p>
          <strong>Photos.</strong> Photos you upload of your driveway, and photos
          our crews take before and after a visit as a record of the work. These
          are stored privately, not publicly, and are shown through links that
          expire.
        </p>
        <p>
          <strong>Service history.</strong> Your requests, scheduled visits,
          crew notes, materials used, seasonal contracts, and invoices.
        </p>
        <p>
          We do not run advertising or analytics trackers on this site, and we do
          not sell your information to anyone.
        </p>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <p>
          To quote work, schedule it, dispatch a crew to the right address, show
          you proof it was done, bill you, and keep the history of a property so
          the next visit is better informed than the last.
        </p>
      </LegalSection>

      <LegalSection heading="Who else sees it">
        <p>
          We use a small number of service providers, each of which sees only
          what it needs:
        </p>
        <ul className="ml-5 grid list-disc gap-2">
          <li>
            <strong>Supabase</strong> stores the database, your sign-in
            credentials, and uploaded photos.
          </li>
          <li>
            <strong>Vercel</strong> runs and serves the website.
          </li>
          <li>
            <strong>OpenStreetMap</strong> receives a property address when we
            need to turn it into map coordinates.
          </li>
          <li>
            <strong>Open-Meteo</strong> receives a property&apos;s approximate
            coordinates to return the local forecast.
          </li>
          <li>
            <strong>Google Maps</strong> is used to display a property location,
            and Google handles sign-in if you choose that option.
          </li>
        </ul>
        <p>
          Our crews see the property details and instructions for visits they are
          assigned to. We will also disclose information if the law requires it.
        </p>
      </LegalSection>

      <LegalSection heading="Where it is stored">
        <p>
          Our hosting and database providers operate outside Canada, and your
          information is stored and processed in the United States. That means it
          may be accessible to authorities there under their laws. If that is not
          acceptable to you, please do not use the site.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We set cookies only to keep you signed in. There are no advertising,
          marketing, or analytics cookies. Clearing them signs you out.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          A property&apos;s service history is the point of the product, so we
          keep it for as long as you have an account, and afterwards only as long
          as we need it for tax and accounting obligations. You can ask us to
          delete your account and its photos at any time.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can ask us for a copy of what we hold about you, ask us to correct
          it, or ask us to delete it. You can withdraw consent, though we may not
          be able to keep providing service without the details needed to do the
          work. Email{" "}
          <a className="underline" href={`mailto:${BUSINESS.contactEmail}`}>
            {BUSINESS.contactEmail}
          </a>{" "}
          and we will respond within 30 days.
        </p>
        <p>
          If you are not satisfied with our answer, you can complain to the
          Office of the Privacy Commissioner of Canada.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          This is a service for property owners and occupants. We do not
          knowingly collect information from children.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>
          If we change this policy we will update the date at the top of this
          page. Questions go to{" "}
          <a className="underline" href={`mailto:${BUSINESS.contactEmail}`}>
            {BUSINESS.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
