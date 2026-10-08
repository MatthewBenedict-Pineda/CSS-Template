/* Published template data. Replace this file (or use Settings > Export data.js in the app) to update the site for everyone. */
window.TEMPLATE_DATA = {
  "version": "2026-10-08.1",
  "source": "Templates - Marc Angelo Perez.docx",
  "settings": {
    "signature": "Marc P.\n**Clinical Systems Support**\nClinical Research\nPPD, part of Thermo Fisher Scientific\n[thermofisher.com/ppd](https://thermofisher.com/ppd) | Phone & Chat: [https://support.ppd.com](https://support.ppd.com)",
    "fullSignature": "**Marc Angelo Perez**\nSpecialist, Clinical Systems Support\n**Clinical Research**\n**PPD, part of ThermoFisher Scientific**\n22nd Floor Seven/NEO Building (formerly Net Park Building)\n5th Avenue E-Square Crescent Park West Bonifacio Global City\nTaguig City, Metro Manila, Philippines 1634\nTel: +63 28 689 6584\n[marcangelo.perez@thermofisher.com](mailto:marcangelo.perez@thermofisher.com) | [thermofisher.com/ppd](https://thermofisher.com/ppd)"
  },
  "templates": [
    {
      "id": "inbound-chat",
      "title": "Inbound chat",
      "category": "Chat",
      "type": "chat",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "Chat template. Use the Opening and Closing blocks separately (each has its own copy button).",
      "body": "## Opening\nHello, good day. This is Marc from Clinical Systems Support. How can I help?\n\n## Closing\nThank you for contacting Clinical Systems Support. Have a great day ahead."
    },
    {
      "id": "epip-archive-study",
      "title": "ePIP Archive Study",
      "category": "ePIP",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{PM Name}},\n\nThis is a follow-up regarding RITM{{RITM number}}.\n\nAs part of the archiving process, please review the ePIP Closeout Checklist and confirm that all applicable ePIFs have been filed to the eTMF.\n\nAdditionally, please verify the protocol ID indicated in the ticket before providing approval for us to proceed with archiving the study.\n\nUpon your written confirmation, we will proceed with archiving the following study: **{{Study}}**\n\nKind regards,\n{{signature}}"
    },
    {
      "id": "ctms-business-justification-request",
      "title": "CTMS Business Justification Request",
      "category": "CTMS",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "Attach the Responsibility Master Sheet before sending.",
      "body": "Dear {{Recipient}},\n\nThis is a follow-up regarding RITM{{RITM number}}.\n\nCould you please provide the specific access level you require for your role in Siebel CTMS? For your reference, I have attached the Responsibility Master Sheet.\n\nAdditionally, kindly provide a brief business justification explaining why the requested access is needed for your role.\n\nThank you in advance.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "ctms-business-justification-approval",
      "title": "CTMS Business Justification Approval",
      "category": "CTMS",
      "type": "email",
      "to": "Julie.McClure@thermofisher.com; Marijke.VanGruijthuijsen@thermofisher.com",
      "cc": "marcangelo.perez@thermofisher.com",
      "subject": "",
      "note": "Listed as \"CTMS Access business justification\" in the original document index.",
      "body": "Dear Julie and Marijke,\n\n**{{User}}** (**{{Job title}}**) is requesting for **{{Access level}}** access in CTMS. The requestor's job title is currently not listed in the Curricula List.\n\n**{{PM}}** approved the request.\n\n**{{User}}** provided the following business justification: \"{{Business justification|multiline}}\"\n\nCould you kindly approve or reject?\n\nThank you in advance.\n\nKind regards,\n{{signature}}"
    },
    {
      "id": "escalation-email",
      "title": "Escalation Email",
      "category": "General",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{Recipient}},\n\nPlease be advised that I have escalated this case via **{{Escalation channel}}** for further assistance with your inquiry.\n\nThe current ticket, {{Ticket number}} will now be closed.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "medidata-user-listing-report",
      "title": "Medidata User Listing Report",
      "category": "Medidata",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "Attach the Medidata User Listing Report before sending.",
      "body": "Dear {{Recipient}},\n\nPlease find the attached Medidata User Listing Report requested for your study.\n\nThe current ticket is now closed.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "epip-study-configuration-setup",
      "title": "ePIP Study Configuration/Setup",
      "category": "ePIP",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{Recipient}},\n\nThank you for contacting us.\n\nThis is a follow up regarding RITM{{RITM number}}. Please be advised that study {{Study}} is now active in ePIP and ready to receive users. However, we cannot change the sponsor recipients globally for the protocol, as they are assigned on a case by case basis by the PM who handles the particular ePIF - the PM/MM who forwards the ePIF to Sponsor for review can select any sponsor recipients they choose.\n\nPlease coordinate with the PVG Manager assigned to this study to ensure all Medical Monitoring Staff for each region are included.\n\nePIP Study Start up tools and resources can be found on the [intranet](https://thermofisher.sharepoint.com/sites/CRG_electronicProtocolInquiryPlatformePIP).\n\nPlease be advised that it takes up to 24 hours after activation the study to be available in the drop down list for ePIP Access Request.\n\nThe current ticket is now closed.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "dru-missing-study",
      "title": "DRU Missing Study",
      "category": "DRU",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{Recipient}},\n\nThis is a follow up regarding **RITM{{RITM number}}**.\n\nPlease be advised that we are not able to locate the study **{{Study}}** in DRU. Could you please confirm with your colleagues who may already have access to the study on how the protocol is exactly spelled?\n\nThank you!\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "ctms-visit-report",
      "title": "CTMS Visit Report",
      "category": "CTMS",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "Attach the requested report(s) before sending.",
      "body": "Dear {{Recipient}},\n\nThank you for your inquiry.\n\nPlease see the requested report(s) for your filing and review.\n\nThe ticket will now be closed.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "ctms-visit-report-more-than-3",
      "title": "CTMS Visit Report (more than 3)",
      "category": "CTMS",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "Attach the job aid before sending.",
      "body": "Dear {{Recipient}},\n\nThank you for your inquiry.\n\nFor requests involving more than three reports, please submit a request to the Hypercare Team.\n\nPlease refer to the attached job aid for instructions on submitting your request through the [AskAnExpert](https://thermofisher.sharepoint.com/sites/CRG_AskAnExpert/SitePages/Home.aspx) channel.\n\nThe ticket will now be closed. Thank you.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "vault-mobile",
      "title": "Vault Mobile",
      "category": "Veeva",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{Recipient}},\n\nThank you for your inquiry.\n\nCould you please try these troubleshooting steps below?\n\n- Open Veeva Vault Mobile\n- Enter your username, {{username}}@ppdi.com\n- Tap continue\n- You will be taken to the SSO page to login using your ThermoFisher email and password\n\nAdditionally, you may also follow this job aid: [Vault Mobile User Guide.pdf](https://thermofisher.sharepoint.com/sites/CRG_Veeva-Vault-Clinical-Operations/KnowledgeCenter/Vault%20Mobile%20User%20Guid%D0%B5.pdf?CID=e2d696b0-e03a-454e-8b77-e14e69d22fee)\n\nIf you encounter any issues following the instructions above, please let us know and send us a screenshot if possible.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "epip-study-coordinator-update",
      "title": "ePIP Study Coordinator Update",
      "category": "ePIP",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{Recipient}},\n\nThank you for your inquiry.\n\nPlease note that the Clinical Systems Support Team is unable to change the Study Coordinator directly in ePIP.\n\nThe Study Coordinator must first be updated by the CRA in CTMS. Once the change is made in CTMS, it will automatically synchronize with ePIP. Please contact your CRA and ask them to update the Study Coordinator in CTMS.\n\nIf multiple Study Coordinators are listed for the same site in CTMS, ePIP will only display the first Study Coordinator listed. To ensure that the correct Study Coordinator appears on the ePIF, the other coordinators should be assigned the Back-up Study Coordinator role in CTMS.\n\nPlease also note:\n\n- CTMS and ePIP synchronize every 24 hours, so changes may take up to 24 hours to appear.\n- For inquiries that have already been submitted, the Study Coordinator's name cannot be changed.\n\nAs there are no further actions that can be taken from our end, this ticket will now be closed.\n\nKind Regards,\n{{signature}}"
    },
    {
      "id": "veeva-ctms-change-request",
      "title": "Veeva CTMS – Change Request",
      "category": "CTMS",
      "type": "email",
      "to": "CRGClinicalSystemsEngagement.sm@thermofisher.com; {{PM/CTM or ticket submitter email}}",
      "cc": "",
      "subject": "Change Request - {{Change type|Payment Trigger;Sponsor;Protocol Title;Protocol#;BC#}} - Case: {{Case number}}, REQ# - {{REQ number}}, T3# - {{T3 number}}",
      "note": "Send from Outlook (personal email). Pick the change type for the subject line.",
      "body": "Dear Team,\n\n***Please action on the following:***\n\n{{Paste request|multiline}}\n\n***Impact analysis is complete and following are the impacts and actions that need to be taken after the change.***\n\n{{Paste impact analysis|multiline}}\n\nThank you.\n\nKind regards,\n{{fullSignature}}"
    },
    {
      "id": "siebel-ctms-migrated-studies",
      "title": "Siebel CTMS Migrated Studies",
      "category": "CTMS",
      "type": "email",
      "to": "",
      "cc": "",
      "subject": "",
      "note": "",
      "body": "Dear {{Recipient}},\n\nThank you for your inquiry.\n\nPlease be advised that any changes or deletions for migrated studies should have been completed in Siebel CTMS prior to migration. Following migration, any necessary updates should be made directly in Veeva Vault by the study team.\n\nChanges made to migrated studies in Siebel CTMS may negatively impact the existing migrated data. Therefore, we are unable to make the requested changes in Siebel.\n\nAs no further action can be taken from our end, this ticket will now be closed.\n\nThank you.\n\nKind regards,\n{{signature}}"
    }
  ],
  "changelog": [
    {
      "date": "2026-10-08",
      "note": "Initial version converted from Templates - Marc Angelo Perez.docx (14 templates)."
    }
  ]
};
