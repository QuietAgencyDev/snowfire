import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";
import { BUSINESS } from "@/lib/legal/business";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms you agree to when booking snow removal or firewood through SnowFire.ca.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      intro={`These terms apply when you use ${BUSINESS.name} to request snow removal or order firewood. If you do not agree with them, please do not use the site.`}
    >
      <LegalSection heading="Your account">
        <p>
          You are responsible for the accuracy of what you enter, particularly
          the service address and access instructions — a crew sent to the wrong
          driveway is a visit you may still be charged for. Keep your password to
          yourself and tell us promptly if you think someone else has it.
        </p>
      </LegalSection>

      <LegalSection heading="Requests are not automatically accepted">
        <p>
          Submitting a request asks us to do work; it does not by itself create a
          booking. We confirm what we can service, and we may decline a property
          we cannot safely or practically reach.
        </p>
      </LegalSection>

      <LegalSection heading="Prices and quotes">
        <p>
          Prices shown are based on what you tell us about the property — its
          size, slope, and the depth of snow that triggers a visit. A quote is an
          estimate. If conditions on site differ materially from what was
          described, we will tell you before doing extra work rather than
          surprise you on an invoice.
        </p>
      </LegalSection>

      <LegalSection heading="Seasonal contracts">
        <p>
          A seasonal agreement covers a defined winter period rather than a fixed
          number of visits, at the rate agreed when you signed up. Its start and
          end dates, and what it includes, are recorded on the contract itself.
        </p>
      </LegalSection>

      <LegalSection heading="Timing during storms">
        <p>
          During a storm we work through properties in priority order, and
          conditions change faster than any schedule. We do not promise a
          specific arrival time, and continuing snowfall may mean a driveway
          needs clearing again.
        </p>
      </LegalSection>

      <LegalSection heading="Photos of your property">
        <p>
          Our crews photograph the work area before and after a visit. This is
          how you get proof the work was done and how we resolve disputes about
          it. These photos are kept privately as part of your property record. If
          you do not want photographs taken, tell us before booking, as it may
          mean we cannot offer service.
        </p>
      </LegalSection>

      <LegalSection heading="Damage and limits">
        <p>
          Tell us in advance about anything at risk of being hit — edging,
          lighting, sprinkler heads, decorative stone, or a soft lawn edge. Mark
          it if you can. We take reasonable care, and we ask that you report any
          damage promptly so we can look at it while the evidence is fresh.
        </p>
        <p>
          We are not responsible for pre-existing damage, for conditions created
          by weather rather than by us, or for items left in the service area
          that were not disclosed.
        </p>
      </LegalSection>

      <LegalSection heading="Payment">
        <p>
          We do not currently take payment online. Work is invoiced, and invoices
          are payable on the terms shown on them.
        </p>
      </LegalSection>

      <LegalSection heading="Cancelling">
        <p>
          You can cancel a request before a crew is dispatched at no charge. Once
          a crew has been dispatched to your property, the visit may be charged.
          You can stop using your account at any time and ask us to close it.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and governing law">
        <p>
          We may update these terms; the date at the top of this page shows when
          they last changed. These terms are governed by the laws of{" "}
          {BUSINESS.region}.
        </p>
        <p>
          How we handle your information is described in our{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          . Questions go to{" "}
          <a className="underline" href={`mailto:${BUSINESS.contactEmail}`}>
            {BUSINESS.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
