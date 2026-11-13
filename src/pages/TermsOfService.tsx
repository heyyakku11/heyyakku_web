import { LegalDocument } from '../components/LegalDocument.tsx';
import {
  TERMS_OF_SERVICE_EFFECTIVE,
  TERMS_OF_SERVICE_LAST_UPDATED,
  TERMS_OF_SERVICE_MD,
  TERMS_OF_SERVICE_TITLE,
} from '../content/termsOfService.ts';

export function TermsOfService() {
  return (
    <LegalDocument
      title={TERMS_OF_SERVICE_TITLE}
      effective={TERMS_OF_SERVICE_EFFECTIVE}
      lastUpdated={TERMS_OF_SERVICE_LAST_UPDATED}
      markdown={TERMS_OF_SERVICE_MD}
    />
  );
}

export default TermsOfService;
