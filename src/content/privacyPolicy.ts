// Privacy Policy body, kept as Markdown so the draft can be edited as text.
// Section 17 (Contact Us) is rendered by the page from VITE_* env values, not from here.
export const PRIVACY_POLICY_LAST_UPDATED = 'October 28, 2026';

export const PRIVACY_POLICY_MD = `
## 1. Introduction

Welcome to Yakku ("Yakku," "we," "our," or "us").

Yakku is an anonymous polling platform that enables users to create polls, participate in polls and predefined checks, share cards through links, and express their opinions.

This Privacy Policy explains how we collect, use, store, disclose, and delete personal information when you use the Yakku mobile applications, website, and related services.

Yakku is intended for individuals aged 18 and above.

By using Yakku, you acknowledge that you have had the opportunity to read this Privacy Policy. Where consent is required by applicable law, we will obtain it through the appropriate process.

## 2. Information We Collect

We collect information necessary to provide, maintain, secure, and improve Yakku.

### 2.1 Account Information

When you register or sign in to Yakku, we may collect:

- Your mobile phone number.
- Your name, where provided.
- Your internal user and account identifiers.
- Authentication and session-related information.
- Information necessary to manage your account and provide our services.

Yakku uses one-time passwords (OTPs) to verify mobile phone numbers and authenticate registered users.

### 2.2 Real Identity and Anonymous Yakku Identity

Yakku maintains two distinct identity representations for registered users.

**Real account identity:** This includes the information associated with your actual account, such as your phone number, name, and internal account identifiers.

**Anonymous Yakku identity:** This is a separate identity used to represent you in supported public interactions within Yakku.

Other users are shown your anonymous Yakku identity rather than your real account identity in the relevant interactions.

Yakku may internally associate these identities to operate the service, manage accounts, maintain voting integrity, prevent misuse, and provide customer support where necessary.

**Important:** Anonymous identity does not mean that Yakku itself cannot associate activity with your account. It means that your real identity is not displayed to other users in the relevant anonymous interactions.

Users should avoid including identifying or sensitive personal information in poll questions, answer options, responses, or explanations that they share.

### 2.3 Device and Technical Information

When you use Yakku, we may collect technical information, including:

- Device model and related device details.
- Operating system and application version, where available.
- Push notification tokens.
- Internet Protocol (IP) addresses.
- Session and authentication-related identifiers.
- Technical, diagnostic, and security logs.

We use this information to manage sessions, deliver notifications, diagnose technical problems, maintain service reliability, protect accounts, and detect suspicious or unauthorized activity.

### 2.4 Polls, Checks, Votes, and Answers

We process information required to provide Yakku's polling functionality, including:

- Poll questions created by registered users.
- Poll answer options.
- Predefined checks created by Yakku.
- Votes and selected answers.
- Answers written by voters when that option is available.
- Reasons or explanations submitted by voters.
- Card identifiers, share codes, and related records.
- Information used to maintain voting integrity and prevent duplicate or invalid votes.

Yakku currently supports question-based cards and does not offer media-based cards as part of its polling functionality.

Depending on the card, voters may choose an existing answer option or provide their own answer. Where supported, voters may also explain why they selected an answer.

This content is processed to operate the voting system and display the relevant card and results.

### 2.5 Saved Cards and Voting Results

Registered users can save cards for future viewing.

Yakku displays voting results after at least one vote has been recorded for the relevant card. Before the first vote, results are not displayed.

The information displayed after voting depends on the card's functionality and configuration.

### 2.6 Guest Information

Yakku allows people to vote on supported shared cards without creating or signing in to a registered account.

Guest users can participate in supported voting experiences but cannot create polls or checks using guest access.

Guest sessions may use authentication tokens, browser cookies, and browser storage to maintain session continuity and support voting functionality.

Guest tokens are designed to expire after approximately 30 days. Token expiry does not necessarily mean that all associated records, browser data, or logs are automatically deleted at the same time.

Guest users may also generate technical information, such as IP addresses and session-related records.

## 3. How We Use Your Information

We use collected information for the following purposes:

- Creating and managing registered accounts.
- Verifying mobile phone numbers through OTP authentication.
- Maintaining real and anonymous identity representations.
- Enabling poll creation, card sharing, voting, and check participation.
- Recording answers, opinions, and explanations submitted by voters.
- Saving cards for future viewing.
- Displaying voting results.
- Managing authentication tokens and user sessions.
- Delivering push notifications, in-app notifications, SMS messages, and WhatsApp messages.
- Maintaining voting integrity and preventing duplicate votes or misuse.
- Detecting security issues and protecting the platform.
- Diagnosing errors and maintaining service reliability.
- Processing account deletion requests.
- Maintaining limited records where necessary for security, operational, accounting, or legal purposes.

Yakku does not currently offer in-app purchases or monetization features. If these practices change, we will review and update this Privacy Policy as appropriate.

## 4. Authentication and Session Management

Yakku uses OTP-based authentication and JSON Web Tokens (JWTs) to manage registered-user sessions.

Our current token configuration is designed around the following expiry periods:

- **Access token:** 15 minutes.
- **Refresh token:** 7 days.
- **Guest token:** 30 days.

These periods describe the intended token validity, not the retention period of all information associated with a session.

Guest authentication on the web may use cookies and browser storage. These mechanisms support guest session continuity and voting functionality.

Users should not share OTPs or other authentication credentials with anyone.

## 5. Poll Sharing and External Platforms

Registered users can share polls and checks through supported social media and messaging platforms, including:

- Instagram.
- WhatsApp.
- Facebook.
- Snapchat.

Users can also copy a shareable link and distribute it through other channels.

People who receive a shared link may be able to open the card and vote as guests without registering, where guest voting is supported.

When you share a card, its recipients may access the information made available through the shared link. Please review your card content before sharing it.

External platforms may process information associated with links or shared content according to their own privacy policies. Yakku does not control the privacy practices of those external platforms.

## 6. Notifications and Communications

Yakku uses notifications to inform users about card activity and relevant service events.

### 6.1 Vote Notifications

Yakku is designed to notify card creators when other users vote on their cards.

Our current notification approach is as follows:

- The first three votes on a card may generate separate notifications.
- After the first three vote notifications, subsequent vote activity may be grouped into three-hour notification windows.
- Where applicable, activity received during a window is combined into a single notification.

This approach is intended to keep users informed while reducing excessive notifications.

Actual delivery depends on device permissions, connectivity, notification settings, and service availability.

### 6.2 Other Notifications

Depending on the functionality involved, Yakku may send:

- Push notifications.
- In-app notifications.
- SMS messages.
- WhatsApp messages.

These communications may be used for OTP verification, authentication, account security, service updates, card activity, weekly checks, and other relevant service communications.

Push notification delivery may require a device-specific push token. SMS and WhatsApp delivery may require your mobile phone number and an external messaging provider.

Users can manage push notification permissions through their device settings. Disabling push notifications may prevent push delivery but may not disable other necessary service communications.

Where consent is required for a particular communication, we will obtain it as required by applicable law.

## 7. Weekly Checks

Yakku provides predefined checks that are refreshed weekly.

We process the information needed to make available the current checks, record responses, maintain voting integrity, and display relevant results.

Users can participate in and share supported checks. Checks are predefined by Yakku and are distinct from polls created by registered users.

## 8. Third-Party Service Providers

Yakku uses third-party infrastructure and service providers to operate the application, website, backend, database, notifications, and related functionality.

Our current providers include:

**Firebase:** Used for supported application services and push notification functionality, as applicable to the implementation.

**Neon:** Used to host our database.

**Render:** Used to host our ASP.NET Core backend services.

**Vercel:** Used to host our React-based website and admin dashboard and provide related web delivery infrastructure.

**Upstash:** Used for managed Redis functionality.

**Resend:** Used for email-related functionality where configured.

These providers may process information on our behalf as necessary to provide their services. The information involved depends on the functionality being used and the provider's role.

We do not sell users' personal information as part of our current business model. We do not intentionally provide user information to unrelated third parties for their independent advertising or marketing purposes.

We may disclose information where necessary to comply with applicable law, respond to lawful requests, protect users or Yakku, investigate security incidents, or establish, exercise, or defend legal claims.

### SMS and WhatsApp Providers

The provider used for SMS and WhatsApp delivery has not yet been finalized.

Before introducing a provider, we will review its role, the information it processes, and any applicable privacy requirements. We will update this Policy where necessary to reflect the provider and its processing activities.

## 9. Hosting and International Data Processing

Yakku's current infrastructure includes the following hosting arrangements:

- **Database:** Neon, hosted in Singapore.
- **Backend:** Render, hosted in Singapore.
- **Website and admin dashboard:** Vercel hosting and delivery infrastructure.
- **CDN:** The current website delivery configuration includes a location in Washington, United States.
- **Caching and Redis functionality:** Upstash.
- **Additional services:** Firebase and Resend.

The primary hosting location of a database or backend does not necessarily mean all related information is processed exclusively in that location. Processing and transfers may occur in other locations depending on provider architecture, configuration, and service delivery.

Where international transfers or processing are subject to applicable legal requirements, we will take the required measures.

## 10. Data Retention and Account Deletion

### 10.1 Requesting Account Deletion

Registered users can request account deletion from within the Yakku application.

When a deletion request is submitted, the account enters a pending-deletion period of 30 days.

During this period:

- The account remains in a pending-deletion state.
- Polls created by the account remain available to other users.
- If the user signs in again during the 30-day period, the pending deletion is cancelled under the current deletion process.

If the user does not sign in during this period, the account proceeds to permanent deletion.

### 10.2 Permanent Deletion

Once permanent deletion is completed, Yakku deletes the user's account information and user-created polls, together with associated personal information and content covered by the deletion process.

Yakku may retain limited log records and payment-history references after deletion where necessary for security, operational, accounting, or legal purposes.

Retained records will be limited to the applicable purpose and handled in accordance with relevant legal requirements.

### 10.3 Backups and Third-Party Systems

Information may be processed or temporarily retained in provider systems, backups, or logs subject to separate retention cycles.

Where applicable, deletion requests will be handled in accordance with the relevant provider capabilities, contractual arrangements, and legal requirements. Information will be deleted or de-identified when it is no longer required to be retained.

### 10.4 Guest Data

Guest tokens are designed to expire after approximately 30 days. Token expiry does not necessarily delete all related voting records, browser cookies, browser storage, or technical logs.

Guest information is retained according to its purpose, system configuration, and applicable legal requirements.

## 11. Cookies and Browser Storage

Yakku's web-based guest voting functionality may use cookies and browser storage to maintain guest authentication and session continuity.

These technologies support the operation of the voting experience and related security controls.

Clearing browser storage or disabling cookies may affect guest sessions or prevent certain features from functioning correctly.

Where additional cookies or similar technologies are introduced, we will provide appropriate disclosures and obtain consent where required by applicable law.

## 12. Data Security

We use technical and organizational measures intended to protect personal information against unauthorized access, loss, misuse, alteration, and disclosure.

Depending on the system and functionality, these measures may include authentication controls, access restrictions, token-based session management, infrastructure security controls, and appropriate handling of operational logs.

No online system can be guaranteed to be completely secure. Users should protect their devices and authentication credentials and avoid sharing OTPs with others.

## 13. Your Privacy Rights

Depending on applicable law, you may have rights to:

- Request access to personal information associated with you.
- Request correction of inaccurate information.
- Request deletion of personal information, subject to applicable legal obligations.
- Withdraw consent where processing is based on consent.
- Raise a complaint or submit a privacy-related request.

You can initiate account deletion through the Yakku application. For other privacy requests, use the contact details provided at the end of this Policy.

We will review and respond to requests in accordance with applicable legal requirements.

## 14. Minimum Age and Eligibility

Yakku is intended for individuals who are **18 years of age or older**.

By creating an account or using features that require registration, you confirm that you meet this minimum age requirement.

Yakku is not intended for individuals under 18. If we become aware that an individual under 18 has created an account or provided personal information in violation of this requirement, we may take appropriate steps, including restricting or terminating the account and handling the associated information in accordance with applicable law.

If you believe that an individual under 18 is using Yakku, please contact us using the details provided below.

## 15. Third-Party Websites and Services

Yakku may contain links to external websites or services, including social media platforms and shared poll links.

External websites and services operate independently and may have their own privacy policies and data-handling practices.

We encourage users to review the privacy policies of external services they choose to use.

## 16. Changes to This Privacy Policy

We may update this Privacy Policy when our features, data practices, infrastructure, or legal obligations change.

When changes are material, we will take appropriate steps to notify users where required by applicable law.

The updated Policy will be published with a revised "Last Updated" date.
`;

export const PRIVACY_POLICY_CONTACT_INTRO =
  'If you have questions about this Privacy Policy or Yakku’s handling of personal information, contact us using the details below.';
