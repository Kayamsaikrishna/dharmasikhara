import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function BookViewer() {
  const { user } = useUser();
  const [opened, setOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<'left' | 'right' | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const advocateName = user?.firstName && user?.lastName 
    ? 'Adv. ' + user.firstName + ' ' + user.lastName 
    : 'Adv. Aditi Rao';

  const caseData = [
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'CASE FILE #001 - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'Case Number: RK-2025-001\n' +
               'Date Filed: October 15, 2025\n' +
               'Status: ACTIVE\n\n' +
               'BETWEEN:\n' +
               '    Rajesh Kumar (Petitioner)\n' +
               '                    vs.\n' +
               '    State of Karnataka (Respondent)\n\n' +
               'Prepared by:\n' +
               '    ' + advocateName + '\n' +
               '    B.A. LL.B (Hons.)\n\n' +
               'Contact Information:\n' +
               '    Address: Rao & Associates\n' +
               '             3rd Floor, Justice Complex\n' +
               '             Brigade Road, Bangalore - 560001\n    \n' +
               '    Phone: 080-25598745\n' +
               '    Mobile: 9845012345\n' +
               '    Email: aditi.rao@raolaw.com\n\n' +
               'CASE DETAILS:\n' +
               'This legal proceeding pertains to a criminal \n' +
               'matter under the jurisdiction of the Magistrate \n' +
               'Court, Bangalore. The petitioner has been \n' +
               'wrongfully accused of theft of a laptop from \n' +
               'Vijay Electronics where he works.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'CASE FILE #001 - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'COURT INFORMATION:\n' +
                '    Court: Magistrate Court\n' +
                '    Judge: Hon\'ble Justice Priya Menon\n' +
                '    Court Hall: 2B\n' +
                '    Hearing Date: October 20, 2025\n\n' +
                'CASE SUMMARY:\n' +
                'The petitioner, Rajesh Kumar (28 years), was \n' +
                'arrested on October 16, 2025, for alleged theft \n' +
                'of a Dell Inspiron laptop worth ₹45,000 from \n' +
                'Vijay Electronics where he works as a sales \n' +
                'executive. The petitioner maintains his \n' +
                'innocence and claims CCTV footage was \n' +
                'misinterpreted.\n\n' +
                'PREVIOUS PROCEEDINGS:\n' +
                '    Date: October 16, 2025\n' +
                '    • Arrest and first appearance\n' +
                '    • Bail application filed\n    \n' +
                '    Date: October 17, 2025\n' +
                '    • Bail hearing scheduled\n' +
                '    • Defense evidence prepared\n\n' +
                'NEXT HEARING:\n' +
                '    Date: October 20, 2025\n' +
                '    Time: 10:30 AM\n' +
                '    Location: Court Hall 2B\n\n' +
                'STATUS: Active Proceedings\n' +
                'COUNSEL: ' + advocateName + '\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'PLEADING MEMORANDUM - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'Reference: Case #RK-2025-001\n' +
               'Prepared by: ' + advocateName + '\n' +
               'Date: October 16, 2025\n\n' +
               'FACTS OF THE CASE:\n\n' +
               '1. The petitioner, Rajesh Kumar, is a 28-year-\n' +
               '   old sales executive at Vijay Electronics.\n\n' +
               '2. Has worked at Vijay Electronics for 4 years\n' +
               '   with excellent record and no prior incidents.\n\n' +
               '3. On October 15, 2025, during routine inventory,\n' +
               '   a Dell Inspiron laptop (₹45,000) went missing.\n\n' +
               '4. At 11:02 AM, CCTV captured Rajesh picking up\n' +
               '   his mobile charger from the floor.\n\n' +
               '5. Due to high camera angle and low resolution,\n' +
               '   the charger\'s hard case appeared laptop-sized.\n\n' +
               '6. Junior clerk discovered falsified digital log:\n' +
               '   laptop marked "dispatched to Service Center"\n' +
               '   at 9:47 AM - before inventory began.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'PLEADING MEMORANDUM - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '7. No service ticket, technician signature, or\n' +
                '   service center record exists.\n\n' +
                '8. Laptop never recovered from petitioner\'s\n' +
                '   possession, home, or anywhere.\n\n' +
                '9. Colleague Prakash Mehta witnessed the charger\n' +
                '   incident and supports petitioner\'s account.\n\n' +
                '10. Manager Mr. Desai was under pressure and\n' +
                '    rushed to conclusions based on ambiguous\n' +
                '    CCTV footage.\n\n' +
                'RELIEF SOUGHT:\n\n' +
                '1. Grant of bail on personal bond\n\n' +
                '2. Investigation of falsified digital log\n\n' +
                '3. Proper forensic analysis of CCTV footage\n\n' +
                '4. Investigation of actual perpetrator\n\n' +
                '5. Protection of petitioner\'s reputation\n\n' +
                'SUPPORTING DOCUMENTS:\n' +
                '    • Employment records (Exhibit A)\n' +
                '    • CCTV footage analysis (Exhibit B)\n' +
                '    • Digital log evidence (Exhibit C)\n' +
                '    • Witness statements (Exhibit D)\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'AFFIDAVIT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'IN THE MAGISTRATE COURT\n\n' +
               'In the matter of: Case #RK-2025-001\n' +
               'Deponent: Rajesh Kumar\n' +
               'Date: October 16, 2025\n\n' +
               'I, Rajesh Kumar, son of Ramesh Kumar, \n' +
               'aged 28 years, resident of Flat No. 202, \n' +
               'Sai Apartments, Basavanagudi, Bangalore - \n' +
               '560004, do hereby solemnly affirm and state \n' +
               'as follows:\n\n' +
               '1. That I am the petitioner in this case and \n' +
               '   am competent to make this affidavit.\n\n' +
               '2. That I work as sales executive at Vijay \n' +
               '   Electronics for the past 4 years.\n\n' +
               '3. That on October 15, 2025, I was conducting\n' +
               '   inventory with colleague Prakash Mehta.\n\n' +
               '4. That at 11:02 AM, my mobile charger fell\n' +
               '   from my bag and I picked it up immediately.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'AFFIDAVIT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '5. That what appeared on CCTV was my charger\n' +
                '   in its hard plastic case, not a laptop.\n\n' +
                '6. That the laptop was never in my possession\n' +
                '   and has not been recovered from me.\n\n' +
                '7. That I earn ₹42,000/month, have no debts,\n' +
                '   and was recently considered for promotion.\n\n' +
                '8. That I have strong family ties: wife Priya,\n' +
                '   daughter Ananya (2 years), father (grocer),\n' +
                '   and brother-in-law (teacher).\n\n' +
                '9. That I am willing to surrender my passport\n' +
                '   and provide two sureties for bail.\n\n' +
                'DECLARATION:\n' +
                'I hereby declare that what is stated above is \n' +
                'true and correct to the best of my knowledge \n' +
                'and belief.\n\n' +
                'Signed and sworn before me at Bangalore\n' +
                'this 16th day of October, 2025.\n\n' +
                '_______________________________\n' +
                'Signature of Deponent\n' +
                '(Rajesh Kumar)\n\n' +
                '_______________________________\n' +
                'Signature of Notary Public\n' +
                'Date: October 16, 2025\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'WITNESS STATEMENT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'STATEMENT OF: Prakash Mehta\n' +
               'OCCUPATION: Sales Executive, Vijay Electronics\n' +
               'DATE RECORDED: October 16, 2025\n' +
               'RECORDED BY: ' + advocateName + '\n\n' +
               'EXAMINATION:\n\n' +
               'Q: How long have you known Rajesh Kumar?\n' +
               'A: We have been colleagues for 6 years at\n' +
               '   Vijay Electronics.\n\n' +
               'Q: Were you present during the inventory on\n' +
               '   October 15, 2025?\n' +
               'A: Yes, Rajesh and I were paired together\n' +
               '   for the inventory check.\n\n' +
               'Q: Can you describe what happened at 11:02 AM?\n' +
               'A: Rajesh\'s charger fell from his bag when he\n' +
               '   set it down. He bent down and picked it up.\n' +
               '   I even joked with him about not losing his\n' +
               '   "lifeline."\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'WITNESS STATEMENT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'Q: Did you see what he picked up?\n' +
               'A: Yes, it was his mobile charger in a hard\n' +
                '   plastic case. It took less than three\n' +
                '   seconds.\n\n' +
                'Q: Did Rajesh take anything else?\n' +
                'A: No, absolutely not. He only picked up his\n' +
                '   charger that had fallen.\n\n' +
                'Q: What is Rajesh\'s reputation at work?\n' +
                'A: Excellent. He\'s punctual, honest, and\n' +
                '   trusted. Our boss always says "If Rajesh\n' +
                '   says it\'s there, it\'s there."\n\n' +
                'Q: Have you noticed anything suspicious about\n' +
                '   the digital inventory logs?\n' +
                'A: A junior clerk mentioned the laptop was\n' +
                '   marked "dispatched" before we even started\n' +
                '   inventory. That doesn\'t make sense.\n\n' +
                'STATEMENT SIGNED:\n' +
                '_______________________________\n' +
                'Prakash Mehta\n' +
                'Date: October 16, 2025\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'EVIDENCE ANALYSIS - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'Case File: RK-2025-001\n' +
               'Prepared by: ' + advocateName + '\n' +
               'Date: October 17, 2025\n\n' +
               'CCTV FOOTAGE ANALYSIS:\n\n' +
               '1. Camera Position:\n' +
               '   • Ceiling-mounted in hallway\n' +
               '   • High angle, low resolution\n' +
               '   • Monitors access to storage room\n\n' +
               '2. Incident at 11:02 AM:\n' +
               '   • Rajesh enters storage room at 11:03 AM\n' +
               '   • Stays for 14 minutes\n' +
               '   • Places object in bag upon exit\n' +
               '   • Object appears rectangular and substantial\n\n' +
               '3. Technical Limitations:\n' +
               '   • Low resolution cannot distinguish details\n' +
               '   • High angle creates optical illusion\n' +
               '   • Charger in hard case appears laptop-sized\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'EVIDENCE ANALYSIS - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'DIGITAL LOG ANALYSIS:\n\n' +
                '1. Falsified Entry:\n' +
                '   • Laptop marked "dispatched to Service\n' +
                '     Center" at 9:47 AM\n' +
                '   • Inventory began at 10:45 AM\n' +
                '   • Entry made before theft discovered\n\n' +
                '2. Missing Documentation:\n' +
                '   • No service ticket exists\n' +
                '   • No technician signature\n' +
                '   • No record at service center\n' +
                '   • Suggests internal fraud\n\n' +
                '3. Physical Evidence:\n' +
                '   • Laptop not recovered from petitioner\n' +
                '   • Not found in home, bag, or vehicle\n' +
                '   • No evidence of sale or disposal\n\n' +
                'EMPLOYMENT RECORDS:\n' +
                '   • 4 years at Vijay Electronics\n' +
                '   • Excellent performance reviews\n' +
                '   • No prior incidents\n' +
                '   • Recently considered for promotion\n' +
                '   • Earns ₹42,000/month, no financial motive\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'LEGAL ARGUMENTS - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'BAIL APPLICATION ARGUMENTS:\n' +
               'Prepared by: ' + advocateName + '\n' +
               'Date: October 17, 2025\n\n' +
               'I. GROUNDS FOR BAIL:\n\n' +
               '1. INSUFFICIENT EVIDENCE:\n' +
               '   • Only evidence is ambiguous CCTV footage\n' +
               '   • Eyewitness confirms it was a charger\n' +
               '   • Laptop never recovered from petitioner\n' +
               '   • No forensic evidence linking petitioner\n\n' +
               '2. ALTERNATIVE EXPLANATION:\n' +
               '   • Falsified digital log indicates fraud\n' +
               '   • Entry made before inventory began\n' +
               '   • No documentation supports service dispatch\n' +
               '   • Suggests involvement of other parties\n\n' +
               '3. NO FLIGHT RISK:\n' +
               '   • Strong family ties in Bangalore\n' +
               '   • Stable employment for 4 years\n' +
               '   • Willing to surrender passport\n' +
               '   • Offers two sureties (father and brother-in-law)\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'LEGAL ARGUMENTS - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '4. NO TAMPERING RISK:\n' +
               '   • All evidence already documented\n' +
               '   • CCTV footage secured\n' +
               '   • Digital logs preserved\n' +
               '   • Witnesses already recorded statements\n\n' +
                '5. CLEAN RECORD:\n' +
                '   • No criminal history\n' +
                '   • Excellent employment record\n' +
                '   • Respected in community\n' +
                '   • First-time accused\n\n' +
                'II. PRECEDENTS:\n\n' +
                '1. Bail is the rule, jail is the exception\n' +
                '   (Gudikanti Narasimhulu v. Public Prosecutor)\n\n' +
                '2. Presumption of innocence until proven guilty\n' +
                '   (Constitution of India, Article 21)\n\n' +
                '3. Circumstantial evidence must be conclusive\n' +
                '   (Sharad Birdhichand Sarda v. State of MH)\n\n' +
                'III. CONCLUSION:\n' +
                'The petitioner respectfully submits that all\n' +
                'conditions for grant of bail are satisfied.\n' +
                'Justice demands his release pending trial.\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'COURT ORDER - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'IN THE MAGISTRATE COURT\n' +
               '[Court Address, Bangalore]\n\n' +
               'Case No.: RK-2025-001\n' +
               'Date: October 17, 2025\n\n' +
               'Hon\'ble Justice Priya Menon\n' +
               'Presiding Officer\n\n' +
               'BETWEEN:\n' +
               'Rajesh Kumar ........................ Petitioner\n' +
               '                    and\n' +
               'State of Karnataka ............. Respondent\n\n' +
               'ORDER ON BAIL APPLICATION:\n\n' +
               'Upon hearing the counsel for petitioner and\n' +
               'perusing the documents on record, this Court\n' +
               'makes the following observations:\n\n' +
               '1. The evidence against petitioner is primarily\n' +
               '   circumstantial and based on CCTV footage of\n' +
               '   questionable clarity.\n\n' +
               '2. Petitioner has strong roots in the community\n' +
               '   and poses no flight risk.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'COURT ORDER - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '3. The falsified digital log entry raises\n' +
                '   serious questions about the investigation.\n\n' +
                '4. Petitioner has clean record and offers\n' +
                '   passport surrender with sureties.\n\n' +
                'THEREFORE, the bail application is ALLOWED\n' +
                'subject to the following conditions:\n\n' +
                '1. Petitioner shall execute personal bond of\n' +
                '   ₹50,000/- with two sureties.\n\n' +
                '2. Petitioner shall surrender passport to the\n' +
                '   Court and report to police station weekly.\n\n' +
                '3. Petitioner shall not leave Bangalore without\n' +
                '   prior permission of the Court.\n\n' +
                '4. Petitioner shall not tamper with evidence\n' +
                '   or influence witnesses.\n\n' +
                '5. Next hearing: October 20, 2025 at 10:30 AM.\n\n' +
                'It is so ordered.\n\n' +
                '                    _______________________________\n' +
                '                    (Signature)\n' +
                '                    Hon\'ble Justice Priya Menon\n' +
                'Date: October 17, 2025\n' +
                'Seal of Court: _______________\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE NARRATIVE',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'THE INVENTORY THAT CHANGED EVERYTHING\n' +
               '═══════════════════════════════════════════\n\n' +
               'CHAPTER 1: A ROUTINE MORNING\n\n' +
               'October 15, 2025, began like any other for\n' +
               'Rajesh Kumar. He woke at 6:00 AM in his small\n' +
               'but tidy apartment in Basavanagudi, Bangalore.\n' +
               'His two-year-old daughter, Ananya, was already\n' +
               'babbling in her crib.\n\n' +
               'His wife, Priya, handed him a steaming cup of\n' +
               'tea and reminded him: "Don\'t forget—inventory\n' +
               'day today."\n\n' +
               'Rajesh smiled. "I\'ve done it a dozen times.\n' +
               'Nothing to worry about."\n\n' +
               'For four years, Rajesh had worked as a sales\n' +
               'executive at Vijay Electronics, a well-known\n' +
               'local chain that sold everything from\n' +
               'smartphones to home appliances.\n\n' +
               'That morning, he wore his usual attire: pressed\n' +
               'trousers, a light blue shirt, and his company\n' +
               'ID clipped to his pocket. Slung over his\n' +
               'shoulder was a dark navy fabric bag—a gift\n' +
               'from Priya on their wedding anniversary.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'THE INVENTORY THAT CHANGED EVERYTHING\n' +
                '═══════════════════════════════════════════\n\n' +
                'Inside his bag: his lunchbox, a water bottle,\n' +
                'and a slim black mobile charger in a hard\n' +
                'plastic case.\n\n' +
                'CHAPTER 2: THE INVENTORY ROOM\n\n' +
                'At 10:45 AM, Rajesh reported to the first-\n' +
                'floor storage room. The monthly inventory had\n' +
                'begun. This month, the focus was on high-value\n' +
                'IT assets, including five new laptops purchased\n' +
                'for the marketing team.\n\n' +
                'One of them—a Dell Inspiron valued at ₹45,000—\n' +
                'had just been unboxed the day before.\n\n' +
                'Rajesh was paired with Prakash Mehta, a\n' +
                'colleague of six years. They worked in\n' +
                'comfortable silence, scanning barcodes and\n' +
                'ticking off items on a printed sheet.\n\n' +
                'At 11:02 AM, Rajesh bent down to pick up his\n' +
                'charger, which had slipped from his bag when\n' +
                'he set it on the floor.\n\n' +
                '"Careful," Prakash joked. "Don\'t lose your\n' +
                'lifeline!"\n\n' +
                'Rajesh chuckled and dropped the charger back\n' +
                'into his bag. The entire motion took less than\n' +
                'three seconds.\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE NARRATIVE',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'THE INVENTORY THAT CHANGED EVERYTHING\n' +
               '═══════════════════════════════════════════\n\n' +
               'Unbeknownst to them, a ceiling-mounted CCTV\n' +
               'camera in the hallway—meant to monitor access\n' +
               'to the storage room—captured the moment.\n\n' +
               'Due to its high angle and low resolution, the\n' +
               'charger\'s hard case appeared rectangular and\n' +
               'substantial, almost like a slim laptop.\n\n' +
               'CHAPTER 3: THE DISAPPEARANCE\n\n' +
               'By 2:00 PM, the inventory team hit a snag.\n' +
               'Four laptops were accounted for. The fifth—\n' +
               'the ₹45,000 Dell—was nowhere to be found.\n\n' +
               'Panic rippled through the office. The store\n' +
               'manager, Mr. Desai, immediately locked the\n' +
               'storage room and pulled up the CCTV footage.\n\n' +
               'He watched as Rajesh entered at 11:03 AM,\n' +
               'stayed for 14 minutes, and exited—placing\n' +
               'something into his bag.\n\n' +
               '"No one else went in," Desai muttered. "It has\n' +
               'to be him."\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'THE INVENTORY THAT CHANGED EVERYTHING\n' +
                '═══════════════════════════════════════════\n\n' +
                'When confronted, Rajesh turned pale. "That\n' +
                'wasn\'t the laptop! It was my charger—I swear!"\n\n' +
                'Prakash backed him up: "He\'s telling the truth.\n' +
                'I was right there."\n\n' +
                'But Desai was under pressure. The laptop hadn\'t\n' +
                'been logged out to anyone. And the footage…\n' +
                'it looked damning.\n\n' +
                'CHAPTER 4: THE TWIST - A HIDDEN DETAIL\n\n' +
                'Later that evening, while reviewing the digital\n' +
                'inventory log, a junior clerk noticed something\n' +
                'odd:\n\n' +
                'The missing laptop had been marked "dispatched\n' +
                'to Service Center" at 9:47 AM—before the\n' +
                'inventory even began.\n\n' +
                'But there was no service ticket, no technician\n' +
                'signature, and no record at the service center.\n\n' +
                'Someone had falsified the digital log.\n\n' +
                'Was Rajesh being framed? Or was this a red\n' +
                'herring?\n\n' +
                'The police, however, weren\'t swayed. "The CCTV\n' +
                'shows him taking something," the investigating\n' +
                'officer said. "Until we find that laptop—or\n' +
                'prove it was never there—your client is our\n' +
                'prime suspect."\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE NARRATIVE',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'THE INVENTORY THAT CHANGED EVERYTHING\n' +
               '═══════════════════════════════════════════\n\n' +
               'CHAPTER 5: ARREST AND AFTERMATH\n\n' +
               'At 7:30 AM on October 16, two officers knocked\n' +
               'on Rajesh\'s door. Priya burst into tears.\n' +
               'Ananya clung to her father\'s leg.\n\n' +
               'Rajesh didn\'t resist. "I\'ll go peacefully.\n' +
               'But I didn\'t do this."\n\n' +
               'At the police station, he was calm but shaken.\n' +
               'When asked if he had a passport, he pulled it\n' +
               'from his wallet without hesitation.\n\n' +
               '"Take it. I\'m not running. I have a daughter\n' +
               'who needs me."\n\n' +
               'He named his father, Ramesh Kumar—a respected\n' +
               'grocer in Shankarapuram—and his brother-in-law,\n' +
               'Arjun Rao, a school teacher, as sureties.\n\n' +
               'Both arrived within the hour, offering whatever\n' +
               'it took to bring Rajesh home.\n\n' +
               'But the law was clear: theft of property valued\n' +
               'over ₹5,000 is non-bailable under Indian law.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'THE INVENTORY THAT CHANGED EVERYTHING\n' +
                '═══════════════════════════════════════════\n\n' +
                'Rajesh would have to apply for bail in court.\n\n' +
                'CHAPTER 6: THE UNANSWERED QUESTIONS\n\n' +
                'As of October 17, the morning of the bail\n' +
                'hearing, several facts remained unresolved:\n\n' +
                '• The laptop had not been recovered—not in\n' +
                '  Rajesh\'s home, not in his bag, not anywhere.\n\n' +
                '• Prakash stood by Rajesh, but admitted he\n' +
                '  never saw what was placed in the bag.\n\n' +
                '• The falsified inventory log suggested possible\n' +
                '  internal fraud—but no other employee had been\n' +
                '  investigated.\n\n' +
                '• Rajesh had no motive: he earned ₹42,000/month,\n' +
                '  had no debts, and had recently been considered\n' +
                '  for a promotion.\n\n' +
                '• His passport surrender, family ties, job\n' +
                '  stability, and clean record all pointed to\n' +
                '  low flight risk.\n\n' +
                'Yet the prosecution would argue:\n' +
                '"An employee stole a high-value asset. The\n' +
                'evidence is on camera. Bail would undermine\n' +
                'the investigation."\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE NARRATIVE',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'THE INVENTORY THAT CHANGED EVERYTHING\n' +
               '═══════════════════════════════════════════\n\n' +
               'CHAPTER 7: ON THE EVE OF JUSTICE\n\n' +
               'Rajesh sat in his cell that night, staring at\n' +
               'a photo of Ananya on his phone (confiscated but\n' +
               'briefly returned for a call).\n\n' +
               'He whispered, "I just want to be there for her\n' +
               'birthday next week."\n\n' +
               'The story does not end with a verdict—because\n' +
               'this is where the legal process begins.\n\n' +
               'Rajesh Kumar\'s fate now rests not on guilt or\n' +
               'innocence, but on a fundamental legal principle:\n\n' +
               '"Bail is the rule; jail is the exception."\n\n' +
               'Whether he walks out of court tomorrow—or\n' +
               'remains behind bars while the truth is\n' +
               'uncovered—depends on how well his lawyer can\n' +
               'translate his human story into legal grounds\n' +
               'for liberty.\n\n' +
               'But one thing is certain:\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'THE INVENTORY THAT CHANGED EVERYTHING\n' +
                '═══════════════════════════════════════════\n\n' +
                'In a system where a three-second gesture can\n' +
                'look like a crime...\n\n' +
                'Presumption of innocence isn\'t just a right—\n' +
                'it\'s a lifeline.\n\n' +
                'FACTUAL ANCHORS:\n\n' +
                '• Accused: Rajesh Kumar, 28 years\n' +
                '• Position: Sales executive, 4 years at\n' +
                '  Vijay Electronics\n' +
                '• Offense: IPC 379 (Theft) of ₹45,000 laptop\n' +
                '• Claims: CCTV misinterpreted, was his charger\n' +
                '• Witness: Colleague Prakash Mehta\n' +
                '• Criminal history: None\n' +
                '• Family: Wife Priya, daughter Ananya (2 years),\n' +
                '  father Ramesh (grocer), brother-in-law Arjun\n' +
                '  (teacher)\n' +
                '• Community ties: Strong, stable residence\n' +
                '• Offers: Passport surrender + two sureties\n' +
                '• Status: Laptop not recovered, investigation\n' +
                '  ongoing\n' +
                '• Offense type: Non-bailable (value > ₹5,000)\n' +
                '• Co-accused: None\n' +
                '• Recovered property: None\n' +
                '• Prior cases: None\n\n' +
                '═══════════════════════════════════════════\n' +
                'END OF CASE NARRATIVE\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'ATTORNEY PROFILE',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'ATTORNEY PROFILE - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'LEGAL COUNSEL:\n' +
               advocateName + '\n\n' +
               'EDUCATION:\n' +
               '• Bachelor of Arts (B.A.)\n' +
               '• Bachelor of Laws (LL.B) Honors\n' +
               '• Bar Council of Karnataka enrollment\n\n' +
               'PROFESSIONAL QUALIFICATIONS:\n' +
               '• Enrolled with Bar Council of Karnataka\n' +
               '• Practicing since 2018\n' +
               '• Specialization in Criminal Defense\n' +
               '• Certified Legal Researcher\n\n' +
               'PRACTICE AREAS:\n' +
               '• Criminal Law\n' +
               '• Constitutional Law\n' +
               '• Cyber Crime\n' +
               '• White Collar Crime\n' +
               '• Human Rights Law\n\n' +
               'BAR ASSOCIATION MEMBERSHIPS:\n' +
               '• Karnataka State Bar Council\n' +
               '• Bangalore District Bar Association\n' +
               '• Indian Bar Association\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'ATTORNEY PROFILE - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'CONTACT INFORMATION:\n' +
                'Office Address:\n' +
                'Rao & Associates\n' +
                '3rd Floor, Justice Complex\n' +
                'Brigade Road, Bangalore - 560001\n\n' +
                'Phone: 080-25598745\n' +
                'Mobile: 9845012345\n' +
                'Email: aditi.rao@raolaw.com\n\n' +
                'OFFICE HOURS:\n' +
                'Monday to Friday: 9:30 AM - 6:30 PM\n' +
                'Saturday: 9:30 AM - 1:30 PM\n' +
                'Emergency Contact: Available on request\n\n' +
                'CASE HANDLING CAPACITY:\n' +
                '• Maximum 20 active cases at a time\n' +
                '• Priority given to criminal defense\n' +
                '• Emergency matters handled promptly\n' +
                '• Pro bono work for deserving cases\n\n' +
                'FEES STRUCTURE:\n' +
                '• Consultation: Rs. 1,500/- per hour\n' +
                '• Appearance: Rs. 7,500/- per hearing\n' +
                '• Drafting: Rs. 3,000/- per document\n' +
                '• Retainership: Rs. 35,000/- per month\n\n' +
                '═══════════════════════════════════════════\n' +
                'END OF CASE FILE\n' +
                '═══════════════════════════════════════════'
    }
  ];

  // Continue with rest of component code...
  const expandedCaseData = [...caseData];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateY = (mouseX / rect.width) * 40;
    const rotateX = -(mouseY / rect.height) * 40;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const touchX = e.touches[0].clientX - centerX;
    const touchY = e.touches[0].clientY - centerY;
    
    const rotateY = (touchX / rect.width) * 40;
    const rotateX = -(touchY / rect.height) * 40;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const flipPage = (direction: 'next' | 'prev') => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
    
    if (isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => {
      if (direction === 'next' && currentPage < expandedCaseData.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsFlipping(false);
    }, 400);
  };

  const speakText = (text: string, side: 'left' | 'right') => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (isSpeaking && currentSpeech === side) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeech(side);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const isSpeechSupported = 'speechSynthesis' in window;

  useEffect(() => {
    if (!showIntro) return;
    
    const timer = setTimeout(() => {
      if (introStep < 4) {
        setIntroStep(introStep + 1);
      } else {
        setShowIntro(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [showIntro, introStep]);

  if (showIntro) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className={'absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 ' + (introStep >= 1 ? 'animate-blob' : '')}></div>
          <div className={'absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animation-delay-2000 ' + (introStep >= 1 ? 'animate-blob' : '')}></div>
          <div className={'absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animation-delay-4000 ' + (introStep >= 1 ? 'animate-blob' : '')}></div>
        </div>
        
        {introStep === 0 && (
          <div className="text-center z-10 animate-fade-in">
            <div className="animate-pulse mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">धर्मशिखर</h1>
            <p className="text-3xl text-amber-200 font-semibold">DHARMASIKHARA</p>
          </div>
        )}
        
        {introStep === 1 && (
          <div className="text-center z-10 animate-fade-in">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider animate-pulse">धर्मशिखर</h1>
            <p className="text-3xl text-amber-200 font-semibold animate-pulse">DHARMASIKHARA</p>
            <p className="text-2xl text-amber-100 mt-6 animate-fade-in">The Pinnacle of Law</p>
          </div>
        )}
        
        {introStep === 2 && (
          <div className="text-center z-10 animate-fade-in">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">धर्मशिखर</h1>
            <p className="text-3xl text-amber-200 font-semibold">DHARMASIKHARA</p>
            <p className="text-2xl text-amber-100 mt-6">Legal Practice Simulator</p>
          </div>
        )}
        
        {introStep === 3 && (
          <div className="text-center z-10 animate-fade-in">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">धर्मशिखर</h1>
            <p className="text-3xl text-amber-200 font-semibold mb-8">DHARMASIKHARA</p>
            <div className="border-t border-b border-amber-300 py-4 mb-5">
              <p className="text-amber-100 text-xl font-medium">{advocateName}</p>
              <p className="text-amber-200 text-lg">B.A. LL.B (Hons.)</p>
            </div>
            <p className="text-amber-200 text-base">2025-2026</p>
          </div>
        )}
        
        {introStep === 4 && (
          <div className="text-center z-10 animate-fade-in">
            <div className="mb-8 animate-bounce">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">धर्मशिखर</h1>
            <p className="text-3xl text-amber-200 font-semibold mb-8">DHARMASIKHARA</p>
            <p className="text-2xl text-amber-100">Ready to Open Case Files</p>
            <button 
              onClick={() => setShowIntro(false)}
              className="mt-10 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg text-xl"
            >
              ENTER SIMULATION
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!opened) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10">
          <div 
            className="relative w-96 h-[580px] bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 rounded-xl shadow-2xl p-10 flex flex-col items-center justify-center border-4 border-amber-600 cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setOpened(true)}
            style={{
              transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(20px)`,
              transition: 'transform 0.1s ease-out',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(251, 191, 36, 0.3)'
            }}
          >
            <div className="mb-8 text-amber-100 transform transition-transform duration-300 hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-amber-100 mb-3 tracking-wider">DHARMASIKHARA</h1>
              <div className="w-32 h-1 bg-amber-200 mx-auto mb-4 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-amber-200 tracking-widest">LEGAL SIMULATION</h2>
            </div>
            
            <div className="text-center mb-10">
              <div className="border-t border-b border-amber-300 py-4 mb-5">
                <p className="text-amber-100 text-xl font-medium">{advocateName}</p>
                <p className="text-amber-200 text-lg">B.A. LL.B (Hons.)</p>
              </div>
              <p className="text-amber-200 text-base">2025-2026</p>
            </div>
            
            <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-amber-300 rounded-tl-lg"></div>
            <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-amber-300 rounded-tr-lg"></div>
            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-amber-300 rounded-bl-lg"></div>
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-amber-300 rounded-br-lg"></div>
            
            <div className="absolute bottom-8 text-center w-full">
              <p className="text-amber-200 font-bold text-xl animate-pulse transform transition-all duration-300 hover:scale-110 hover:text-amber-100">
                CLICK TO OPEN CASE FILES
              </p>
              <div className="mt-3 w-10 h-1.5 bg-amber-400 mx-auto rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col p-2">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-3 rounded-t-lg flex items-center justify-between mb-0">
        <div className="flex-1">
          <h1 className="text-xl font-bold">{expandedCaseData[currentPage].title}</h1>
          <p className="text-amber-100 text-xs">Case #{expandedCaseData[currentPage].caseNumber}</p>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="p-2 hover:bg-amber-700 rounded-lg transition transform hover:scale-105"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center px-4 py-3 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className={`w-1/2 bg-yellow-50 rounded-lg shadow-xl p-6 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 -translate-x-8 rotate-y-30' : 'opacity-100 translate-x-0'} hover:shadow-amber-500/30 relative`} style={{ maxHeight: '75vh' }}>
          <div className="text-gray-800 text-sm leading-relaxed font-mono whitespace-pre-wrap select-text">
            {expandedCaseData[currentPage].leftPage}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-300 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 1}</span>
          </div>
          
          {isSpeechSupported && (
            <div className="absolute top-2 right-2">
              <button
                onClick={() => speakText(expandedCaseData[currentPage].leftPage, 'left')}
                disabled={isSpeaking && currentSpeech !== 'left'}
                className={`p-1 rounded-full ${isSpeaking && currentSpeech === 'left' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300 transition`}
                title={isSpeaking && currentSpeech === 'left' ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking && currentSpeech === 'left' ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          )}
        </div>

        <div className={`w-1/2 bg-yellow-50 rounded-lg shadow-xl p-6 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 translate-x-8 -rotate-y-30' : 'opacity-100 translate-x-0'} hover:shadow-amber-500/30 relative`} style={{ maxHeight: '75vh' }}>
          <div className="text-gray-800 text-sm leading-relaxed font-mono whitespace-pre-wrap select-text">
            {expandedCaseData[currentPage].rightPage}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-300 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 2}</span>
          </div>
          
          {isSpeechSupported && (
            <div className="absolute top-2 right-2">
              <button
                onClick={() => speakText(expandedCaseData[currentPage].rightPage, 'right')}
                disabled={isSpeaking && currentSpeech !== 'right'}
                className={`p-1 rounded-full ${isSpeaking && currentSpeech === 'right' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300 transition`}
                title={isSpeaking && currentSpeech === 'right' ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking && currentSpeech === 'right' ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded-b-lg flex items-center justify-between border-t-2 border-amber-600">
        <button
          onClick={() => flipPage('prev')}
          disabled={currentPage === 0 || isFlipping}
          className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition font-medium transform hover:scale-105 text-sm"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="text-center text-white">
          <p className="font-bold text-sm">File {currentPage + 1} of {expandedCaseData.length}</p>
          <p className="text-xs text-gray-400">Pages {currentPage * 2 + 1}-{currentPage * 2 + 2}</p>
        </div>

        <button
          onClick={() => flipPage('next')}
          disabled={currentPage === expandedCaseData.length - 1 || isFlipping}
          className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition font-medium transform hover:scale-105 text-sm"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}