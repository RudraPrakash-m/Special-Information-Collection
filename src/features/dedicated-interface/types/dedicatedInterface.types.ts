import type { CollectionStatus } from '@/features/manage-collections/types/manageCollections.types';

export interface InterfaceDownloadItem {
  id: string;
  fileName: string;
  fileSize: string;
  format: 'PDF' | 'XLSX' | 'DOCX';
}

export interface DedicatedInterfaceConfig {
  id: string;
  collectionId: string;
  collectionTitle: string;
  surveyTitle?: string;
  targetInstitutions?: string;
  frequency?: string;
  linkName: string;
  dedicatedLink: string;
  pageHeading: string;
  instructions: string;
  downloadFileName?: string;
  downloads?: InterfaceDownloadItem[];
  helpdeskContact: string;
  showAsDedicatedMenu: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LinkStatus = 'Active' | 'Inactive' | 'Closed';

/** The dedicated link is active only after the collection is published (SRS 1.3); it follows the collection's status. */
export const getLinkStatus = (collectionStatus?: CollectionStatus): LinkStatus => {
  if (collectionStatus === 'Published' || collectionStatus === 'Active') return 'Active';
  if (collectionStatus === 'Closed') return 'Closed';
  return 'Inactive';
};

export const INITIAL_INTERFACES: DedicatedInterfaceConfig[] = [
  {
    id: 'INTF-2026-001',
    collectionId: 'IC-2026-001',
    collectionTitle: 'Quarterly Degree College Academic & Lab Equipment Census',
    surveyTitle: 'State Science Talent & Student Lab Facilities Report',
    targetInstitutions: 'All Higher Secondary and Undergraduate Science Colleges (310 Colleges)',
    frequency: 'Quarterly',
    linkName: 'quarterly-academic-infra-2026',
    dedicatedLink: 'https://himsplus.odisha.gov.in/portal/collection/quarterly-academic-infra-2026',
    pageHeading: 'Quarterly Degree College Academic & Lab Infrastructure Self-Appraisal (2026-27)',
    instructions: 'All state-aided and government degree colleges with science streams must provide verified figures for operational practical laboratories, major scientific equipment inventories, and adherence to safety and ventilation standards.',
    downloadFileName: 'Annexure-A_Lab_Equipment_Asset_Register.xlsx',
    downloads: [
      {
        id: 'dl-1',
        fileName: 'Annexure-A_Lab_Equipment_Asset_Register.xlsx',
        fileSize: '1.4 MB',
        format: 'XLSX',
      },
    ],
    helpdeskContact: 'Dr. Sanjit Pattnaik | 0674-2391244 | nodal-hims@odisha.gov.in',
    showAsDedicatedMenu: true,
    createdAt: '2026-10-18',
    updatedAt: '2026-10-20',
  },
  {
    id: 'INTF-2026-002',
    collectionId: 'IC-2026-002',
    collectionTitle: 'Mo College Abhijan Infrastructure Phase-2 Data Collection',
    surveyTitle: 'Mo College Infrastructure & Campus Amenities Audit',
    targetInstitutions: 'Government Degree Colleges — Western & Northern Zones (128 Colleges)',
    frequency: 'One-time',
    linkName: 'mo-college-phase2-audit',
    dedicatedLink: 'https://himsplus.odisha.gov.in/portal/collection/mo-college-phase2-audit',
    pageHeading: 'Mo College Abhijan Infrastructure & Campus Amenities Physical Audit 2026',
    instructions: 'Colleges receiving developmental grants under Mo College Abhijan Phase-2 are required to upload geo-tagged physical progress photographs and utilization certificates.',
    downloadFileName: 'Mo_College_Audit_Format_Annexure_B.xlsx',
    downloads: [
      {
        id: 'dl-2',
        fileName: 'Mo_College_Audit_Format_Annexure_B.xlsx',
        fileSize: '780 KB',
        format: 'XLSX',
      },
    ],
    helpdeskContact: 'Sri Rakesh Kumar Sahoo | 0674-2395511 | mocollege@hed.gov.in',
    showAsDedicatedMenu: false,
    createdAt: '2026-10-24',
    updatedAt: '2026-10-24',
  },
];
