import { LegalDocument } from '../components/LegalDocument.tsx';
import {
  PRIVACY_POLICY_EFFECTIVE,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_MD,
  PRIVACY_POLICY_TITLE,
} from '../content/privacyPolicy.ts';

export function PrivacyPolicy() {
  return (
    <LegalDocument
      title={PRIVACY_POLICY_TITLE}
      effective={PRIVACY_POLICY_EFFECTIVE}
      lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
      markdown={PRIVACY_POLICY_MD}
    />
  );
}

export default PrivacyPolicy;
