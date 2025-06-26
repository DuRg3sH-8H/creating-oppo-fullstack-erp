"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "@/components/theme-context"

export function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Privacy Policy</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">1. Introduction</h2>
            <p>
              Welcome to the School ERP System. We respect your privacy and are committed to protecting your personal
              data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect several types of information, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, email address, contact details, and other information you
                provide when creating an account.
              </li>
              <li>
                <strong>Student Information:</strong> Academic records, attendance, and other educational data necessary
                for school management.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our platform, including access
                times, pages viewed, and features used.
              </li>
              <li>
                <strong>Device Information:</strong> Information about the device you use to access our platform,
                including IP address, browser type, and operating system.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing and maintaining our services</li>
              <li>Improving and personalizing user experience</li>
              <li>Managing student records and academic progress</li>
              <li>Communicating with users about updates and changes</li>
              <li>Ensuring the security and integrity of our platform</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate or incomplete data</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing of your data</li>
              <li>Data portability</li>
              <li>Objection to processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">
              7. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@schoolerp.com" className="text-[var(--primary-color)] hover:underline">
                privacy@schoolerp.com
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
