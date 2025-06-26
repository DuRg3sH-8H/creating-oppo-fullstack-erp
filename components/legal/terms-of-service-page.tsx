"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "@/components/theme-context"

export function TermsOfServicePage() {
  useTheme()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-[var(--primary-color)] hover:text-[var(--accent-color)] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Terms of Service</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the School ERP System, you agree to be bound by these Terms of Service. If you do
              not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">2. Description of Service</h2>
            <p>
              The School ERP System is a comprehensive platform designed to facilitate school management, including
              student information management, academic tracking, extracurricular activities, ISO compliance, and other
              educational administrative functions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">3. User Accounts</h2>
            <p className="mb-3">When using our platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to provide accurate and complete information when creating an account.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">4. User Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the platform for any illegal purpose or in violation of any laws.</li>
              <li>Interfere with or disrupt the integrity or performance of the platform.</li>
              <li>Attempt to gain unauthorized access to any part of the platform.</li>
              <li>Use the platform to transmit harmful code or malware.</li>
              <li>Impersonate any person or entity or falsely state your affiliation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the School ERP System, including but not limited to text,
              graphics, logos, icons, and software, are the exclusive property of the School ERP System and are
              protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">6. Data Privacy</h2>
            <p>
              Our collection and use of personal information is governed by our
              <Link href="/privacy-policy" className="text-[var(--primary-color)] hover:underline mx-1">
                Privacy Policy
              </Link>
              which is incorporated into these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the School ERP System shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">8. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will provide notice of significant
              changes by posting the updated terms on our platform. Your continued use of the platform after such
              modifications constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the platform at our sole discretion, without prior
              notice or liability, for any reason, including but not limited to a breach of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">10. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of Nepal, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:legal@schoolerp.com" className="text-[var(--primary-color)] hover:underline">
                legal@schoolerp.com
              </a>
            </p>
          </section>

          <div className="border-t border-gray-200 pt-4 mt-8">
            <p className="text-sm text-gray-500">Last Updated: May 14, 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
