import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating sample terms...');

  // Sample terms data
  const sampleTerms = [
    {
      name: 'Terms of Service',
      termsDetailUrl: '/terms/service',
      content: `
# Terms of Service

These Terms of Service ("Terms") govern your access to and use of our services, including our website, APIs, email notifications, applications, buttons, and widgets (the "Services"), and any information, text, links, graphics, photos, audio, videos, or other materials or arrangements of materials uploaded, downloaded or appearing on the Services (collectively referred to as "Content").

By using the Services you agree to be bound by these Terms. If you are using the Services on behalf of a company, organization, government, or other legal entity, you represent that you are authorized to do so.

## 1. Who May Use the Services

You may use the Services only if you agree to form a binding contract with us and are not a person barred from receiving services under the laws of the applicable jurisdiction. If you are accepting these Terms and using the Services on behalf of a company, organization, government, or other legal entity, you represent and warrant that you are authorized to do so.

## 2. Privacy

Our Privacy Policy describes how we handle the information you provide to us when you use our Services. You understand that through your use of the Services you consent to the collection and use of this information, including the transfer of this information to other countries for storage, processing and use by us and our affiliates.

## 3. Content on the Services

You are responsible for your use of the Services and for any Content you provide, including compliance with applicable laws, rules, and regulations. You should only provide Content that you are comfortable sharing with others.

## 4. Using the Services

You may use the Services only in compliance with these Terms and all applicable laws, rules, and regulations.

Our Services evolve constantly. As such, the Services may change from time to time, at our discretion. We may stop (permanently or temporarily) providing the Services or any features within the Services to you or to users generally. We also retain the right to create limits on use and storage at our sole discretion at any time. We may also remove or refuse to distribute any Content on the Services, limit distribution or visibility of any Content on the service, suspend or terminate users, and reclaim usernames without liability to you.

## 5. Limitations of Liability

By using the Services you agree that we, our parents, affiliates, related companies, officers, directors, employees, agents representatives, partners and licensors, liability is limited to the maximum extent permissible in your country of residence.

## 6. General

We may revise these Terms from time to time. The changes will not be retroactive, and the most current version of the Terms, which will always be at our website, will govern our relationship with you. By continuing to access or use the Services after those revisions become effective, you agree to be bound by the revised Terms.
      `,
      version: '1.0',
      isRequired: true,
    },
    {
      name: 'Privacy Policy',
      termsDetailUrl: '/terms/privacy',
      content: `
# Privacy Policy

This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of our Services.

## 1. Information We Collect

### 1.1 Information You Provide to Us

We collect information you provide directly to us, such as when you create or modify your account, request customer service, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, financial and credit card information, and other information you choose to provide.

### 1.2 Information We Collect Through Your Use of Our Services

When you use our Services, we collect information about you in the following general categories:

- **Location Information**: When you use the Services, we may collect precise location data from your device if you enable this feature.
- **Transaction Information**: We collect transaction details related to your use of our Services, including the type of service requested, date and time the service was provided, amount charged, and other related transaction details.
- **Usage and Preference Information**: We collect information about how you and site visitors interact with our Services, preferences expressed, and settings chosen.
- **Device Information**: We may collect information about your mobile device, including, for example, the hardware model, operating system and version, software and file names and versions, preferred language, unique device identifier, advertising identifiers, serial number, device motion information, and mobile network information.
- **Log Information**: When you interact with the Services, we collect server logs, which may include information like device IP address, access dates and times, app features or pages viewed, app crashes and other system activity, type of browser, and the third-party site or service you were using before interacting with our Services.

## 2. How We Use Your Information

We may use the information we collect about you to:

- Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to users, develop safety features, authenticate users, and send product updates and administrative messages;
- Perform internal operations, including, for example, to prevent fraud and abuse of our Services; to troubleshoot software bugs and operational problems; to conduct data analysis, testing, and research; and to monitor and analyze usage and activity trends;
- Send or facilitate communications between you and other users, such as estimated times of arrival;
- Send you communications we think will be of interest to you, including information about products, services, promotions, news, and events, where permissible and according to local applicable laws; and to process contest, sweepstake, or other promotion entries and fulfill any related awards;
- Personalize and improve the Services, including to provide or recommend features, content, social connections, referrals, and advertisements.

## 3. Sharing of Information

We may share the information we collect about you as described in this Privacy Policy or as described at the time of collection or sharing, including as follows:

### 3.1 Through Our Services

We may share your information:

- With other users as needed to provide the Services;
- With third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us;
- With the general public if you submit content in a public forum, such as blog comments, social media posts, or other features of our Services that are viewable by the general public;
- With third parties with whom you choose to let us share information, for example other apps or websites that integrate with our API or Services, or those with an API or Service with which we integrate; and
- With your employer (or similar entity) and any necessary third parties engaged by us or your employer, if you participate in any of our enterprise solutions.

### 3.2 Other Important Sharing

We may share your information:

- With our subsidiaries and affiliated entities;
- With vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf;
- In response to a request for information by a competent authority if we believe disclosure is in accordance with, or is otherwise required by, any applicable law, regulation, or legal process;
- With law enforcement officials, government authorities, or other third parties if we believe your actions are inconsistent with our user agreements, Terms of Service, or policies, or to protect the rights, property, or safety of us or others;
- In connection with, or during negotiations of, any merger, sale of company assets, consolidation or restructuring, financing, or acquisition of all or a portion of our business by or into another company;
- If we otherwise notify you and you consent to the sharing; and
- In an aggregated and/or anonymized form which cannot reasonably be used to identify you.

## 4. Your Choices

You may be able to access, update, and delete certain information about you by visiting your account settings. You can also request that we delete your account information by contacting us as described below.

## 5. Changes to the Privacy Policy

We may change this Privacy Policy from time to time. If we make significant changes in the way we treat your personal information, or to the Privacy Policy, we will provide you notice through the Services or by some other means, such as email. Your continued use of the Services after such notice constitutes your consent to the changes. We encourage you to periodically review the Privacy Policy for the latest information on our privacy practices.

## 6. Contact Us

If you have any questions about this Privacy Policy, please contact us at privacy@example.com.
      `,
      version: '1.0',
      isRequired: true,
    },
    {
      name: 'Marketing Communications',
      termsDetailUrl: '/terms/marketing',
      content: `
# Marketing Communications Consent

By agreeing to these terms, you consent to receive marketing communications from us about our products, services, promotions, and news. We may send these communications via email, SMS, push notifications, or other electronic means.

## What You'll Receive

When you opt in to marketing communications, you may receive:

- Updates about new products and services
- Special offers and promotions
- Newsletters and company updates
- Invitations to events or webinars
- Surveys and feedback requests

## How Often We'll Contact You

We strive to send communications at a reasonable frequency, typically no more than once per week. However, during special promotions or events, the frequency may temporarily increase.

## Your Control Over Communications

You can opt out of marketing communications at any time by:

- Clicking the "unsubscribe" link in any marketing email
- Replying "STOP" to any marketing SMS
- Adjusting your notification preferences in your account settings
- Contacting our customer support team

## Data Usage

Information collected through marketing communications will be used in accordance with our Privacy Policy. We may use analytics to track engagement with our communications to improve our services and tailor content to your interests.

## Changes to Marketing Practices

We may update our marketing practices from time to time. Any significant changes will be communicated to you through our website or via email.
      `,
      version: '1.0',
      isRequired: false,
    },
    {
      name: 'Data Processing Agreement',
      termsDetailUrl: '/terms/data-processing',
      content: `
# Data Processing Agreement

This Data Processing Agreement ("DPA") forms part of the Terms of Service between you and us.

## 1. Definitions

- "Data Protection Laws" means all applicable laws and regulations regarding the processing of Personal Data.
- "Personal Data" means any information relating to an identified or identifiable natural person.
- "Processing" means any operation performed on Personal Data, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.
- "Data Controller" means the entity which determines the purposes and means of the Processing of Personal Data.
- "Data Processor" means the entity which Processes Personal Data on behalf of the Data Controller.
- "Sub-processor" means any Processor engaged by us.

## 2. Processing of Personal Data

We will Process Personal Data only in accordance with your documented instructions for the following purposes: (i) Processing in accordance with the Terms of Service; (ii) Processing initiated by you in your use of the Services; and (iii) Processing to comply with other documented reasonable instructions provided by you where such instructions are consistent with the terms of the Agreement.

## 3. Rights of Data Subjects

We will, to the extent legally permitted, promptly notify you if we receive a request from a Data Subject to exercise the Data Subject's right of access, right to rectification, restriction of Processing, erasure, data portability, object to the Processing, or its right not to be subject to automated individual decision making ("Data Subject Request"). Taking into account the nature of the Processing, we will assist you by appropriate technical and organizational measures, insofar as this is possible, for the fulfillment of your obligation to respond to a Data Subject Request under Data Protection Laws. In addition, to the extent you, in your use of the Services, do not have the ability to address a Data Subject Request, we will, upon your request, provide commercially reasonable efforts to assist you in responding to such Data Subject Request, to the extent we are legally permitted to do so and the response to such Data Subject Request is required under Data Protection Laws.

## 4. Personnel

We will ensure that our personnel engaged in the Processing of Personal Data are informed of the confidential nature of the Personal Data, have received appropriate training on their responsibilities, and have executed written confidentiality agreements. We will take commercially reasonable steps to ensure the reliability of any of our personnel engaged in the Processing of Personal Data.

## 5. Security

We will implement and maintain appropriate technical and organizational measures to protect the Personal Data against unauthorized or unlawful Processing and against accidental loss, destruction, damage, theft, alteration or disclosure. These measures will be appropriate to the harm that might result from unauthorized or unlawful Processing or accidental loss, destruction or damage and the nature of the data to be protected.

## 6. Sub-processing

You acknowledge and agree that we may engage third-party Sub-processors in connection with the provision of the Services. We will enter into a written agreement with each Sub-processor containing data protection obligations not less protective than those in this DPA with respect to the protection of your Personal Data to the extent applicable to the nature of the Services provided by such Sub-processor.

## 7. Data Transfers

We will ensure that any transfer of Personal Data to a third country or international organization will be subject to appropriate safeguards as described in Data Protection Laws.

## 8. Return and Deletion of Personal Data

Upon termination of the Services, we will delete or return all Personal Data to you as requested, and delete existing copies unless applicable law requires storage of the Personal Data.

## 9. Audit Rights

We will make available to you all information necessary to demonstrate compliance with the obligations laid down in this DPA and allow for and contribute to audits, including inspections, conducted by you or another auditor mandated by you.
      `,
      version: '1.0',
      isRequired: true,
    },
    {
      name: 'Cookie Policy',
      termsDetailUrl: '/terms/cookies',
      content: `
# Cookie Policy

This Cookie Policy explains how we use cookies and similar technologies in connection with our website and any other services we offer that link to this Cookie Policy (collectively, the "Services").

## What are Cookies?

Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.

Cookies set by the website owner (in this case, us) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.

## Why Do We Use Cookies?

We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Services to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Services. Third parties serve cookies through our Services for advertising, analytics, and other purposes.

## Types of Cookies We Use

### Essential Cookies

These cookies are strictly necessary to provide you with services available through our Services and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Services, you cannot refuse them without impacting how our Services function.

### Performance and Functionality Cookies

These cookies are used to enhance the performance and functionality of our Services but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.

### Analytics and Customization Cookies

These cookies collect information that is used either in aggregate form to help us understand how our Services are being used or how effective our marketing campaigns are, or to help us customize our Services for you in order to enhance your experience.

### Advertising Cookies

These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.

### Social Media Cookies

These cookies are used to enable you to share pages and content that you find interesting on our Services through third-party social networking and other websites. These cookies may also be used for advertising purposes.

## How Can You Control Cookies?

You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner or cookie policy on our website.

You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our Services though your access to some functionality and areas of our Services may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.

In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit http://www.aboutads.info/choices/ or http://www.youronlinechoices.com.

## How Often Will We Update This Cookie Policy?

We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.

The date at the top of this Cookie Policy indicates when it was last updated.

## Where Can You Get Further Information?

If you have any questions about our use of cookies or other technologies, please email us at privacy@example.com.
      `,
      version: '1.0',
      isRequired: false,
    }
  ];

  // Create terms
  for (const termData of sampleTerms) {
    try {
      // Check if term already exists
      const existingTerm = await prisma.terms.findFirst({
        where: {
          name: termData.name,
          isDeleted: false,
        },
      });

      if (existingTerm) {
        console.log(`Term "${termData.name}" already exists, skipping...`);
        continue;
      }

      // Get the next terms ID
      const lastTerms = await prisma.terms.findFirst({
        orderBy: {
          termsId: 'desc',
        },
      });

      const nextTermsId = lastTerms ? lastTerms.termsId + 1 : 1;

      // Create the term
      const term = await prisma.terms.create({
        data: {
          termsId: nextTermsId,
          name: termData.name,
          termsDetailUrl: termData.termsDetailUrl,
          content: termData.content,
          version: termData.version,
          isRequired: termData.isRequired,
        },
      });

      console.log(`Created term "${termData.name}" with ID ${term.termsId}`);
    } catch (error) {
      console.error(`Error creating term "${termData.name}":`, error);
      
      // Try without content and version if there's an error
      try {
        // Get the next terms ID
        const lastTerms = await prisma.terms.findFirst({
          orderBy: {
            termsId: 'desc',
          },
        });

        const nextTermsId = lastTerms ? lastTerms.termsId + 1 : 1;

        // Create the term without content and version
        const term = await prisma.terms.create({
          data: {
            termsId: nextTermsId,
            name: termData.name,
            termsDetailUrl: termData.termsDetailUrl,
            isRequired: termData.isRequired,
          },
        });

        console.log(`Created term "${termData.name}" with ID ${term.termsId} (without content and version)`);
      } catch (fallbackError) {
        console.error(`Failed to create term "${termData.name}" even without content and version:`, fallbackError);
      }
    }
  }

  console.log('Sample terms creation completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 