import type { ISOClause, ISOSchoolProgress } from "@/components/iso/types"

export const sampleIsoClauses: ISOClause[] = [
  {
    id: "clause-1",
    number: "4.1",
    title: "Understanding the organization and its context",
    description:
      "The organization shall determine external and internal issues that are relevant to its purpose and its strategic direction and that affect its ability to achieve the intended result(s) of its EOMS.",
    requirements: [
      "Determine external and internal issues relevant to the organization's purpose and strategic direction",
      "Monitor and review information about these external and internal issues",
      "Document how these issues affect the organization's ability to achieve intended results",
    ],
    status: "approved",
    lastUpdated: "2023-05-10T14:30:00Z",
    submittedBy: "Sarah Williams",
    submittedAt: "2023-05-08T10:15:00Z",
    reviewedBy: "Alex Johnson",
    reviewedAt: "2023-05-10T14:30:00Z",
    comments: "All requirements have been met. Documentation is comprehensive and well-organized.",
    documents: [
      {
        id: "doc-1",
        name: "Context Analysis Report.pdf",
        fileUrl: "#",
        fileType: "application/pdf",
        uploadedBy: "Sarah Williams",
        uploadedAt: "2023-05-08T10:15:00Z",
        size: "2.4 MB",
      },
      {
        id: "doc-2",
        name: "Strategic Direction Document.docx",
        fileUrl: "#",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploadedBy: "Sarah Williams",
        uploadedAt: "2023-05-08T10:15:00Z",
        size: "1.8 MB",
      },
    ],
  },
  {
    id: "clause-2",
    number: "4.2",
    title: "Understanding the needs and expectations of interested parties",
    description:
      "The organization shall determine the interested parties that are relevant to the EOMS, and the requirements of these interested parties.",
    requirements: [
      "Identify all interested parties relevant to the educational organization",
      "Determine the requirements of these interested parties",
      "Monitor and review information about these interested parties and their relevant requirements",
    ],
    status: "submitted",
    lastUpdated: "2023-05-12T09:45:00Z",
    submittedBy: "Sarah Williams",
    submittedAt: "2023-05-12T09:45:00Z",
    documents: [
      {
        id: "doc-3",
        name: "Stakeholder Analysis.xlsx",
        fileUrl: "#",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        uploadedBy: "Sarah Williams",
        uploadedAt: "2023-05-12T09:45:00Z",
        size: "1.2 MB",
      },
    ],
  },
  {
    id: "clause-3",
    number: "4.3",
    title: "Determining the scope of the management system for educational organizations",
    description:
      "The organization shall determine the boundaries and applicability of the EOMS to establish its scope.",
    requirements: [
      "Define the boundaries and applicability of the EOMS",
      "Consider external and internal issues referred to in 4.1",
      "Consider the requirements of relevant interested parties referred to in 4.2",
      "Consider the products and services of the organization",
    ],
    status: "rejected",
    lastUpdated: "2023-05-05T16:20:00Z",
    submittedBy: "Sarah Williams",
    submittedAt: "2023-05-03T11:30:00Z",
    reviewedBy: "Alex Johnson",
    reviewedAt: "2023-05-05T16:20:00Z",
    comments:
      "The scope definition is incomplete. Please include all educational services provided by the organization and clarify the boundaries of the management system.",
    documents: [
      {
        id: "doc-4",
        name: "EOMS Scope Document.pdf",
        fileUrl: "#",
        fileType: "application/pdf",
        uploadedBy: "Sarah Williams",
        uploadedAt: "2023-05-03T11:30:00Z",
        size: "980 KB",
      },
    ],
  },
  {
    id: "clause-4",
    number: "4.4",
    title: "Management system for educational organizations (EOMS)",
    description:
      "The organization shall establish, implement, maintain and continually improve an EOMS, including the processes needed and their interactions, in accordance with the requirements of this document.",
    requirements: [
      "Establish processes needed for the EOMS and their interactions",
      "Implement and maintain these processes",
      "Continually improve the EOMS",
      "Determine criteria and methods for effective operation and control",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
  {
    id: "clause-5",
    number: "5.1",
    title: "Leadership and commitment",
    description: "Top management shall demonstrate leadership and commitment with respect to the EOMS.",
    requirements: [
      "Take accountability for the effectiveness of the EOMS",
      "Ensure the EOMS policy and objectives are established and compatible with the context and strategic direction",
      "Ensure integration of the EOMS requirements into the organization's business processes",
      "Promote the use of the process approach and risk-based thinking",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
  {
    id: "clause-6",
    number: "5.2",
    title: "Policy",
    description: "Top management shall establish, review and maintain an educational policy.",
    requirements: [
      "Establish an educational policy appropriate to the purpose of the organization",
      "Provide a framework for setting educational objectives",
      "Include a commitment to satisfy applicable requirements",
      "Include a commitment to continual improvement of the EOMS",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
  {
    id: "clause-7",
    number: "6.1",
    title: "Actions to address risks and opportunities",
    description:
      "The organization shall consider the issues referred to in 4.1 and the requirements referred to in 4.2 and determine the risks and opportunities that need to be addressed.",
    requirements: [
      "Determine risks and opportunities that need to be addressed",
      "Plan actions to address these risks and opportunities",
      "Integrate and implement the actions into EOMS processes",
      "Evaluate the effectiveness of these actions",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
  {
    id: "clause-8",
    number: "7.1",
    title: "Resources",
    description:
      "The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the EOMS.",
    requirements: [
      "Determine and provide necessary resources for the EOMS",
      "Consider the capabilities of, and constraints on, existing internal resources",
      "Determine what needs to be obtained from external providers",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
  {
    id: "clause-9",
    number: "8.1",
    title: "Operational planning and control",
    description:
      "The organization shall plan, implement and control the processes needed to meet the requirements for the provision of educational products and services.",
    requirements: [
      "Determine the requirements for the educational products and services",
      "Establish criteria for the processes",
      "Determine the resources needed to achieve conformity to the requirements",
      "Implement control of the processes in accordance with the criteria",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
  {
    id: "clause-10",
    number: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    description:
      "The organization shall determine what needs to be monitored and measured, and the methods for monitoring, measurement, analysis and evaluation.",
    requirements: [
      "Determine what needs to be monitored and measured",
      "Determine methods for monitoring, measurement, analysis and evaluation",
      "Determine when the monitoring and measuring shall be performed",
      "Determine when the results from monitoring and measurement shall be analyzed and evaluated",
    ],
    status: "pending",
    lastUpdated: "2023-04-15T08:00:00Z",
  },
]

export const sampleSchoolProgress: ISOSchoolProgress = {
  schoolId: "2",
  schoolName: "Riverside Academy",
  totalClauses: 10,
  pendingClauses: 7,
  submittedClauses: 1,
  approvedClauses: 1,
  rejectedClauses: 1,
  progress: 10,
  isCertified: false,
  lastUpdated: "2023-05-12T09:45:00Z",
}
