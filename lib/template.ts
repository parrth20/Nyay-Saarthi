// lib/templates.ts

export interface TemplateVariable {
  key: string; // e.g., "tenantName"
  label: string; // e.g., "किरायेदार का नाम / Tenant Name"
  type: 'text' | 'date' | 'number' | 'textarea';
  aiAssist?: boolean; // Flag to enable AI assist button
}

export interface TemplateContent {
  hindi: string;
  english: string;
  variables: TemplateVariable[];
}

export interface Template {
  id: string;
  name: {
    hindi: string;
    english: string;
  };
  description: {
    hindi: string;
    english: string;
  };
  content: TemplateContent;
}

// --- Template Definitions ---

const rentalAgreement: Template = {
  id: 'rental-agreement',
  name: { hindi: 'किराया समझौता', english: 'Rental Agreement' },
  description: {
    hindi: 'एक मकान मालिक और किरायेदार के बीच एक मानक आवासीय किराया समझौता।',
    english: 'A standard residential rental agreement between a landlord and tenant.',
  },
  content: {
    hindi: `किराया समझौता\n\nयह समझौता [agreementDate] को [landlordName] (मकान मालिक) और [tenantName] (किरायेदार) के बीच किया गया है।\n\nसंपत्ति का पता: [propertyAddress]\nकिराया राशि: ₹[rentAmount] प्रति माह\nअवधि: [leaseTerm] महीने\n\nविशेष शर्तें:\n[additionalTerms]\n\nहस्ताक्षर:\nमकान मालिक: __________\nकिरायेदार: __________`,
    english: `Rental Agreement\n\nThis Agreement is made on [agreementDate] between [landlordName] (Landlord) and [tenantName] (Tenant).\n\nProperty Address: [propertyAddress]\nRent Amount: ₹[rentAmount] per month\nTerm: [leaseTerm] months\n\nAdditional Terms:\n[additionalTerms]\n\nSignatures:\nLandlord: __________\nTenant: __________`,
    variables: [
      { key: 'agreementDate', label: 'समझौते की तारीख / Agreement Date', type: 'date' },
      { key: 'landlordName', label: 'मकान मालिक का नाम / Landlord Name', type: 'text' },
      { key: 'tenantName', label: 'किरायेदार का नाम / Tenant Name', type: 'text' },
      { key: 'propertyAddress', label: 'संपत्ति का पता / Property Address', type: 'textarea' },
      { key: 'rentAmount', label: 'किराया राशि / Rent Amount (₹)', type: 'number' },
      { key: 'leaseTerm', label: 'अवधि (महीने) / Term (months)', type: 'number' },
      // *** ADDED aiAssist: true ***
      { key: 'additionalTerms', label: 'विशेष शर्तें / Additional Terms', type: 'textarea', aiAssist: true },
    ],
  },
};

const nda: Template = {
  id: 'nda',
  name: { hindi: 'गैर-प्रकटीकरण समझौता', english: 'Non-Disclosure Agreement (NDA)' },
  description: {
    hindi: 'दो पक्षों के बीच गोपनीय जानकारी की सुरक्षा के लिए एक मानक समझौता।',
    english: 'A standard agreement to protect confidential information between two parties.',
  },
  content: {
    hindi: `गैर-प्रकटीकरण समझौता\n\nयह समझौता [agreementDate] को [disclosingParty] (प्रकट करने वाला पक्ष) और [receivingParty] (प्राप्त करने वाला पक्ष) के बीच किया गया है।\n\nगोपनीय जानकारी का उद्देश्य: [purpose]\nअवधि: [ndaTerm] वर्ष\n\n[receivingParty] सहमत है कि वे [disclosingParty] द्वारा प्रदान की गई गोपनीय जानकारी का खुलासा नहीं करेंगे।\n\nहस्ताक्षर:\nप्रकट करने वाला पक्ष: __________\nप्राप्त करने वाला पक्ष: __________`,
    english: `Non-Disclosure Agreement (NDA)\n\nThis Agreement is made on [agreementDate] between [disclosingParty] (Disclosing Party) and [receivingParty] (Receiving Party).\n\nPurpose of Confidential Information: [purpose]\nTerm: [ndaTerm] years\n\n[receivingParty] agrees not to disclose the confidential information provided by [disclosingParty].\n\nSignatures:\nDisclosing Party: __________\nReceiving Party: __________`,
    variables: [
       { key: 'agreementDate', label: 'समझौते की तारीख / Agreement Date', type: 'date' },
       { key: 'disclosingParty', label: 'प्रकट करने वाला पक्ष / Disclosing Party', type: 'text' },
       { key: 'receivingParty', label: 'प्राप्त करने वाला पक्ष / Receiving Party', type: 'text' },
       // *** ADDED aiAssist: true ***
       { key: 'purpose', label: 'गोपनीय जानकारी का उद्देश्य / Purpose', type: 'textarea', aiAssist: true },
       { key: 'ndaTerm', label: 'अवधि (वर्ष) / Term (years)', type: 'number' },
    ],
  },
};


// --- Export Templates ---
export const templates: Template[] = [rentalAgreement, nda];

export const getTemplateById = (id: string): Template | undefined => {
    return templates.find(t => t.id === id);
}

