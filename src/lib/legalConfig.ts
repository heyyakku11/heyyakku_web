// Company / contact details shown on legal pages. Set these in .env (VITE_LEGAL_*).
const read = (value: string | undefined) => (value ?? '').trim();

export const legalConfig = {
  entityName: read(import.meta.env.VITE_LEGAL_ENTITY_NAME),
  contactEmail: read(import.meta.env.VITE_PRIVACY_CONTACT_EMAIL),
  address: read(import.meta.env.VITE_LEGAL_BUSINESS_ADDRESS),
  websiteUrl: read(import.meta.env.VITE_WEBSITE_URL),
};
