import { FaReact } from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiPrisma, SiMysql } from 'react-icons/si'

const base = import.meta.env.BASE_URL

const qpsHub = {
  title: 'QPS Post-Course Resource Hub',
  tagline: 'Centralised learning continuity for Queensland Police investigators.',
  description:
    'Developed as part of a QUT IT Capstone Project in collaboration with the Queensland Police Service, this platform provides a centralised post-course resource hub for Specialist Investigators and Detectives. The application includes course management, discussion forums, research resources, and an integrated e-commerce system. Built from the ground up by a team of four students, the project successfully delivered over 110 user stories using modern full-stack technologies.',
  fullDescription: `As part of my QUT IT Capstone Project, Corey McCormick, Rohan Boas, Samuel Telford and I collaborated with the Queensland Police Service to design and deliver a Post-Course Resource Hub from the ground up. The platform provides a new digital environment designed to enhance the training experience for Specialist Investigators, Detectives, and other QPS personnel, giving graduates a structured space to continue learning and access resources long after their courses conclude.
Prior to this system, officers had no persistent digital channel through which to revisit course content, engage in peer discussion, or access ongoing research materials once training ended. Our team of four students worked closely with QPS stakeholders over a full academic semester, following an agile methodology with fortnightly sprints and regular client demonstrations to ensure every sprint delivered working, validated software aligned to operational needs.
We dedicated approximately one month to each of the four core features, working through a comprehensive product backlog of 110 user stories. The platform was built using Next.js and TypeScript, with MySQL and Prisma for data storage, and Tailwind CSS, ShadCN, and Zod for a polished, type-safe interface.`,
  problemStatement: `Queensland Police Service investigators completing specialist training had no persistent digital environment to continue learning after their courses ended. Course materials were fragmented, peer knowledge-sharing was informal and inconsistent, and there was no centralised mechanism to surface relevant research or procure supplementary resources. This created a tangible gap between the skills developed during training and the support available in the field.`,
  architecture: [
    {
      layer: 'Frontend',
      detail:
        'Next.js 14 with the App Router and React for server-side rendering and dynamic client interactions. Tailwind CSS and ShadCN provide a utility-first styling system with a consistent, polished design language across all views.',
    },
    {
      layer: 'Backend & API',
      detail:
        'Next.js API routes handle all server-side logic including authentication, course management, forum operations, and e-commerce workflows. TypeScript and Zod are enforced end-to-end for type safety and runtime validation.',
    },
    {
      layer: 'Database',
      detail:
        'MySQL relational database with Prisma ORM for schema management, migrations, and type-safe query construction. Designed to handle complex relational data across users, courses, resources, and orders.',
    },
    {
      layer: 'Authentication',
      detail:
        'Role-based access control supporting officer, instructor, and administrator personas, each with scoped permissions across the platform.',
    },
  ],
  keyFeatures: [
    {
      title: 'Course Functionality',
      body: 'A dedicated page for each registered course gives users easy access to materials, announcements, and resources in a familiar format similar to Canvas. Course staff can manage enrolments and collaborate with fellow instructors to enhance the learning experience.',
    },
    {
      title: 'Chat Forum',
      body: 'A real-time communication platform allowing investigators, detectives, and course attendees to connect and collaborate. Dedicated channels grouped by course type let users network, share insights, and access resources in a supported community environment.',
    },
    {
      title: 'Research Tab',
      body: 'Keeps users informed with curated access to the latest research articles and updates on legislation. Administrators and instructors manage evidence papers and enable search functionality so users can find relevant materials quickly.',
    },
    {
      title: 'Shop',
      body: 'A convenient storefront for investigators and detectives to purchase QPS branded merchandise and essential tools. Admins can manage products, run promotions, and track sales, while users benefit from wishlist and cart functionality.',
    },
    {
      title: 'Role-Based Access Control',
      body: 'Distinct permission tiers for officers, instructors, and administrators ensure each user sees only the content and controls relevant to their role across every section of the platform.',
    },
    {
      title: 'Agile Delivery',
      body: 'Over 110 user stories delivered across fortnightly sprints with continuous QPS client feedback loops. Approximately one month was dedicated to the development and refinement of each core feature.',
    },
  ],
  businessImpact: [
    { stat: '110+', label: 'User Stories Delivered' },
    { stat: '4', label: 'Core Features Built' },
    { stat: '4', label: 'Person Student Team' },
    { stat: '8 months', label: 'Full Delivery Timeline' },
  ],
  skills: [SiNextdotjs, SiTypescript, SiMysql, SiPrisma, SiTailwindcss, FaReact],
  skillLabels: ['Next.js', 'TypeScript', 'MySQL', 'Prisma', 'Tailwind CSS', 'React'],
  images: [
    `${base}projects/qpsHub/Dashboard.png`,
    `${base}projects/qpsHub/Course Page.png`,
    `${base}projects/qpsHub/Forum.png`,
    `${base}projects/qpsHub/Research - 1.png`,
    `${base}projects/qpsHub/Research - 2.png`,
    `${base}projects/qpsHub/Shop - 1.png`,
    `${base}projects/qpsHub/Shop - 2.png`,
  ],
  link: `${base}projects/qpsHub/Demo.mp4`,
}

export default qpsHub