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
  const [showIntro, setShowIntro] = useState(true); // For animation intro
  const [introStep, setIntroStep] = useState(0); // For step-by-step animation
  const containerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Get advocate name from user profile or use default
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
               'wrongfully accused of theft of electronic \n' +
               'devices from his workplace.\n\n' +
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
                'The petitioner, Rajesh Kumar, was arrested on \n' +
                'October 14, 2025, for alleged theft of 50 \n' +
                'smartphones worth ₹2,50,000 from the \n' +
                'electronics warehouse where he works as a \n' +
                'supervisor. The petitioner maintains his \n' +
                'innocence.\n\n' +
                'PREVIOUS PROCEEDINGS:\n' +
                '    Date: October 15, 2025\n' +
                '    • First appearance in court\n' +
                '    • Bail application filed\n' +
                '    • Arguments heard\n' +
                '    • Bail granted with conditions\n    \n' +
                '    Date: October 18, 2025\n' +
                '    • Charges framed\n' +
                '    • Plea recorded\n' +
                '    • Case listed for trial\n\n' +
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
               '1. The petitioner, Rajesh Kumar, is a 32-year-\n' +
               '   old warehouse supervisor at TechDistributors.\n\n' +
               '2. On October 13, 2025, he conducted a routine\n' +
               '   inventory check which revealed 50 missing\n' +
               '   smartphones valued at ₹2,50,000.\n\n' +
               '3. Security footage shows him leaving the\n' +
               '   warehouse at 7:30 PM as per protocol.\n\n' +
               '4. There is a gap in the security footage\n' +
               '   from 9:00 PM to 11:00 PM on the same day.\n\n' +
               '5. Another employee, Ravi, has been acting\n' +
               '   suspiciously and has significant gambling\n' +
               '   debts.\n\n' +
               '6. A second key exists which was held by the\n' +
               '   manager, Mr. Suresh, who lost it months ago.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'PLEADING MEMORANDUM - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'RELIEF SOUGHT:\n\n' +
                '1. Quashment of charges under Section 482 CrPC\n\n' +
                '2. Declaration of innocence\n\n' +
                '3. Compensation for wrongful arrest and \n' +
                '   detention\n\n' +
                '4. Directions to the police to conduct a \n' +
                '   proper investigation\n\n' +
                '5. Any other relief deemed fit and proper\n' +
                '   by the Honourable Court\n\n' +
                'JURISDICTION:\n' +
                'This Court has jurisdiction to entertain this \n' +
                'petition as per Criminal Procedure Code, 1973.\n\n' +
                'SUPPORTING DOCUMENTS:\n' +
                '    • Employment records (Exhibit A)\n' +
                '    • Security footage (Exhibit B)\n' +
                '    • Inventory reports (Exhibit C)\n' +
                '    • Ravi\'s gambling records (Exhibit D)\n' +
                '    • Key access logs (Exhibit E)\n\n' +
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
               'Date: October 15, 2025\n\n' +
               'I, Rajesh Kumar, son of Ramesh Kumar, \n' +
               'aged 32 years, resident of Flat No. 202, \n' +
               'Sai Apartments, Basavanagudi, Bangalore - \n' +
               '560004, do hereby solemnly affirm and state \n' +
               'as follows:\n\n' +
               '1. That I am the petitioner in this case and \n' +
               '   am competent to make this affidavit.\n\n' +
               '2. That the facts stated herein are true to my \n' +
               '   knowledge and belief and nothing material \n' +
               '   has been concealed.\n\n' +
               '3. That I followed all security protocols at \n' +
               '   my workplace and properly locked the \n' +
               '   warehouse on October 13, 2025.\n\n' +
               '4. That I have no motive to steal from my \n' +
               '   employer as I have a stable job and family.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'AFFIDAVIT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '5. That another employee, Ravi, has been \n' +
                '   acting suspiciously and has gambling debts.\n\n' +
                '6. That my manager, Mr. Suresh, lost a key \n' +
                '   months ago but never reported it.\n\n' +
                '7. That I have been a loyal employee for 5 \n' +
                '   years with no prior incidents.\n\n' +
                'DECLARATION:\n' +
                'I hereby declare that what is stated above is \n' +
                'true and correct to the best of my knowledge \n' +
                'and belief. I am making this affidavit in \n' +
                'support of my petition for justice.\n\n' +
                'Signed and sworn before me at Bangalore\n' +
                'this 15th day of October, 2025.\n\n' +
                '_______________________________\n' +
                'Signature of Deponent\n' +
                '(Rajesh Kumar)\n\n' +
                '_______________________________\n' +
                'Signature of Notary Public\n' +
                'Date: October 15, 2025\n\n' +
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
               'Date: October 16, 2025\n\n' +
               'Hon\'ble Justice Priya Menon\n' +
               'Presiding Officer\n\n' +
               'BETWEEN:\n' +
               'Rajesh Kumar ........................ Petitioner\n' +
               '                    and\n' +
               'State of Karnataka ............. Respondent\n\n' +
               'ORDER ON BAIL:\n\n' +
               'Upon hearing both the counsel for petitioner \n' +
               'and respondent and perusing the documents on \n' +
               'record, the Court hereby passes the following \n' +
               'order on the bail application:\n\n' +
               '1. Bail application is allowed.\n\n' +
               '2. Petitioner shall execute a personal bond \n' +
               '   of ₹50,000/- with one surety.\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'COURT ORDER - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '3. Petitioner shall surrender passport and \n' +
                '   report to the nearest police station \n' +
                '   weekly.\n\n' +
                '4. Petitioner shall not leave Bangalore \n' +
                '   without prior permission of the Court.\n\n' +
                '5. Petitioner shall not tamper with evidence \n' +
                '   or influence witnesses.\n\n' +
                '6. Next hearing scheduled for October 20, \n' +
                '   2025 at 10:30 AM in Court Hall 2B.\n\n' +
                'It is so ordered.\n\n' +
                '                    _______________________________\n' +
                '                    (Signature)\n' +
                '                    Hon\'ble Justice Priya Menon\n                    \n' +
                'Date: October 16, 2025\n' +
                'Seal of Court: _______________\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'EVIDENCE SUMMARY - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'Case File: RK-2025-001\n' +
               'Prepared by: ' + advocateName + '\n' +
               'Date: October 17, 2025\n\n' +
               'DOCUMENTARY EVIDENCE:\n\n' +
               'Exhibit A: Employment Records\n' +
               '    • Appointment letter (2020)\n' +
               '    • Salary slips (5 years)\n' +
               '    • Performance reviews (excellent)\n' +
               '    • No prior disciplinary actions\n\n' +
               'Exhibit B: Security Footage\n' +
               '    • Entry/exit logs\n' +
               '    • Gap in recording (9-11 PM)\n' +
               '    • No footage of theft\n\n' +
               'Exhibit C: Inventory Reports\n' +
               '    • Monthly inventory sheets\n' +
               '    • Digital records\n' +
               '    • Discrepancy report\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'EVIDENCE SUMMARY - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'Exhibit D: Ravi\'s Records\n' +
                '    • Casino visit records\n' +
                '    • Gambling debts documentation\n' +
                '    • Suspicious behavior reports\n\n' +
                'Exhibit E: Key Access\n' +
                '    • Key issuance log\n' +
                '    • Mr. Suresh\'s lost key report\n' +
                '    • Security protocols\n\n' +
                'ORAL EVIDENCE:\n\n' +
                'Witness Statements:\n' +
                '    • Mr. Suresh (Manager)\n' +
                '    • Ravi (Assistant)\n' +
                '    • Security Guard\n    \n' +
                'Expert Testimony:\n' +
                '    • Forensic expert on entry signs\n' +
                '    • IT expert on security systems\n\n' +
                'CHAIN OF CUSTODY:\n' +
                'All exhibits properly maintained and catalogued.\n\n' +
                'Verified by: ' + advocateName + '\n' +
                'Court Seal: _______________\n' +
                'Date: October 17, 2025\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'LEGAL ANALYSIS - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE ANALYSIS:\n' +
               'RK-2025-001 - Wrongful Accusation\n\n' +
               'I. LEGAL ISSUES:\n' +
               '1. Circumstantial evidence\n' +
               '2. Burden of proof\n' +
               '3. Right to reputation\n' +
               '4. Applicable legal provisions\n\n' +
               'II. APPLICABLE LAW:\n' +
               '1. Indian Penal Code, 1860\n' +
               '   • Sections 26, 35, 39, 40\n' +
               '2. Criminal Procedure Code, 1973\n' +
               '   • Sections 438, 482, 437\n' +
               '3. Indian Evidence Act, 1872\n' +
               '   • Sections 3, 8, 10, 13\n\n' +
               'III. PRECEDENTS:\n' +
               '1. State of U.P. v. Ravindra Prakash, \n' +
               '   AIR 1992 SC 722\n' +
               '   - Circumstantial evidence requirements\n' +
               '2. Sharad Birdhichand Sarda v. State of \n' +
               '   Maharashtra, AIR 1984 SC 1673\n' +
               '   - Golden thread of circumstantial evidence\n\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'LEGAL ANALYSIS - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'IV. STRENGTHS OF CASE:\n' +
                '1. Clean record of petitioner\n' +
                '2. Security footage gaps\n' +
                '3. Alternative suspect with motive\n' +
                '4. Manager\'s negligence\n' +
                '5. Proper procedures followed\n\n' +
                'V. WEAKNESSES OF CASE:\n' +
                '1. Petitioner was last seen\n' +
                '2. Missing inventory substantial\n' +
                '3. Possibility of circumstantial evidence\n' +
                '4. Need to prove alternative theory\n\n' +
                'VI. STRATEGY:\n' +
                '1. Highlight security gaps\n' +
                '2. Present alternative suspect\n' +
                '3. Show manager\'s negligence\n' +
                '4. Emphasize clean record\n' +
                '5. File for charge quashing\n\n' +
                'VII. TIMELINE:\n' +
                '1. Next hearing: October 20, 2025\n' +
                '2. Evidence recording: To be scheduled\n' +
                '3. Final arguments: To be scheduled\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
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
    },
    // Additional pages to increase suspense and detail
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'CONFIDENTIAL INVESTIGATION REPORT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'FILE: CONFIDENTIAL - RK-2025-001\n' +
               'DATE: October 18, 2025\n' +
               'PREPARED BY: ' + advocateName + '\n' +
               'SECURITY LEVEL: HIGHLY CONFIDENTIAL\n\n' +
               'SUBJECT: UNAUTHORIZED ACCESS TO WAREHOUSE\n\n' +
               '1. Background Investigation:\n' +
               '   • Security logs show unusual activity\n' +
               '   • Multiple unauthorized entries detected\n' +
               '   • Pattern suggests inside knowledge of \n' +
               '     security protocols\n\n' +
               '2. Personnel Analysis:\n' +
               '   • Rajesh Kumar - Clean record\n' +
               '   • Ravi Prasad - Financial difficulties\n' +
               '   • Mr. Suresh - Manager, lost key reported\n\n' +
               '3. Financial Records:\n' +
               '   • Ravi\'s bank statements show large \n' +
               '     unexplained deposits\n' +
               '   • Casino records indicate significant losses\n' +
               '   • Recent pawn shop transactions\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'CONFIDENTIAL INVESTIGATION REPORT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '4. Physical Evidence:\n' +
                '   • Fingerprints on inventory sheets\n' +
                '   • Unusual wear patterns on security door\n' +
                '   • Missing surveillance footage during \n' +
                '     critical hours\n\n' +
                '5. Witness Statements:\n' +
                '   • Security guard reported seeing shadows\n' +
                '   • Night cleaner heard unusual sounds\n' +
                '   • Delivery personnel noticed strange \n' +
                '     activity\n\n' +
                '6. Analysis:\n' +
                '   • Theft occurred during security gap\n' +
                '   • Perpetrator had inside knowledge\n' +
                '   • Motive: Financial desperation\n' +
                '   • Opportunity: Lost key access\n\n' +
                '7. Recommendations:\n' +
                '   • Further investigation of Ravi Prasad\n' +
                '   • Examination of pawn shop records\n' +
                '   • Review of all security protocols\n\n' +
                'WARNING: This document contains sensitive \n' +
                'information. Unauthorized disclosure may \n' +
                'result in legal action.\n\n' +
                '═══════════════════════════════════════════\n' +
                '[END OF REPORT]\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'WITNESS STATEMENT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'STATEMENT OF: Mr. Suresh Kumar\n' +
               'OCCUPATION: Warehouse Manager\n' +
               'DATE RECORDED: October 19, 2025\n' +
               'RECORDED BY: ' + advocateName + '\n\n' +
               'EXAMINATION:\n\n' +
               'Q: When did you first notice the missing key?\n' +
               'A: Approximately 3 months ago, in July 2025.\n\n' +
               'Q: Did you report this incident?\n' +
               'A: No, I thought I had misplaced it myself.\n\n' +
               'Q: Can you describe the key?\n' +
               'A: It was a standard brass key, labeled \n' +
               '   with \'WAREHOUSE-A\' engraving.\n\n' +
               'Q: Who else had access to this key?\n' +
               'A: Only myself and Rajesh, the supervisor.\n\n' +
               'Q: Did you ever mention this to Rajesh?\n' +
               'A: No, I was embarrassed about losing it.\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'WITNESS STATEMENT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'Q: When did you realize the key was truly \n' +
                '   missing?\n' +
                'A: After Rajesh was arrested. I checked \n' +
                '   my keychain and realized it was gone.\n\n' +
                'Q: Do you suspect anyone else had access?\n' +
                'A: Possibly Ravi. He was always curious \n' +
                '   about security procedures.\n\n' +
                'Q: Have you seen Ravi with any unusual items?\n' +
                'A: Yes, he had a new smartphone recently, \n' +
                '   despite his salary.\n\n' +
                'Q: Any other relevant information?\n' +
                'A: Ravi has been acting nervous lately and \n' +
                '   often stays late without explanation.\n\n' +
                'ADDITIONAL NOTES:\n' +
                '• Witness appeared cooperative but nervous\n' +
                '• Admission of negligence regarding key\n' +
                '• Possible alternative suspect identified\n' +
                '• Financial motive for alternative suspect\n\n' +
                'STATEMENT SIGNED:\n' +
                '_______________________________\n' +
                'Mr. Suresh Kumar\n' +
                'Date: October 19, 2025\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'SURVEILLANCE ANALYSIS - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE: RK-2025-001\n' +
               'DATE: October 19, 2025\n' +
               'ANALYST: Forensic IT Expert\n' +
               'REFERENCE: Security Footage Review\n\n' +
               'FINDINGS:\n\n' +
               '1. CAMERA COVERAGE:\n' +
               '   • Main entrance: Fully functional\n' +
               '   • Side entrance: Functional\n' +
               '   • Rear entrance: System failure\n' +
               '   • Internal cameras: Partial coverage\n\n' +
               '2. TIME GAP ANALYSIS:\n' +
               '   • October 13, 2025\n' +
               '   • 7:30 PM: Rajesh exits (recorded)\n' +
               '   • 8:00 PM - 9:00 PM: Normal activity\n' +
               '   • 9:00 PM - 11:00 PM: System failure\n' +
               '   • 11:00 PM onwards: Functional\n\n' +
               '3. SYSTEM LOGS:\n' +
               '   • Manual override detected at 8:45 PM\n' +
               '   • Unknown access code used\n' +
               '   • No trace of authorized personnel\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'SURVEILLANCE ANALYSIS - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '4. SUSPICIOUS ACTIVITY:\n' +
                '   • Unusual network traffic at 8:47 PM\n' +
                '   • Multiple login attempts detected\n' +
                '   • Access to security system controls\n\n' +
                '5. PERSONNEL ACCESS:\n' +
                '   • Rajesh Kumar: Standard access\n' +
                '   • Ravi Prasad: Limited access\n' +
                '   • Mr. Suresh: Administrative access\n\n' +
                '6. TECHNICAL ANOMALIES:\n' +
                '   • System failure not accidental\n' +
                '   • Deliberate disruption of recording\n' +
                '   • Evidence suggests inside knowledge\n\n' +
                '7. CONCLUSIONS:\n' +
                '   • Theft occurred during system failure\n' +
                '   • Perpetrator had technical knowledge\n' +
                '   • Security override was intentional\n' +
                '   • Rajesh Kumar not responsible\n\n' +
                'RECOMMENDATIONS:\n' +
                '• Investigate Ravi Prasad\'s IT skills\n' +
                '• Examine system logs for additional clues\n' +
                '• Review all personnel with admin access\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'FINANCIAL INVESTIGATION - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE: RK-2025-001\n' +
               'DATE: October 19, 2025\n' +
               'INVESTIGATOR: Financial Crimes Unit\n' +
               'REFERENCE: Ravi Prasad Financial Records\n\n' +
               'FINDINGS:\n\n' +
               '1. BANK ACCOUNTS:\n' +
               '   • Savings account: TechDistributors Credit Union\n' +
               '   • Checking account: State Bank of India\n' +
               '   • Credit card: HDFC Platinum\n\n' +
               '2. RECENT TRANSACTIONS:\n' +
               '   • October 14, 2025: Deposit of ₹2,00,000\n' +
               '   • October 15, 2025: Purchase electronics store\n' +
               '   • October 16, 2025: Cash withdrawal ₹50,000\n' +
               '   • October 17, 2025: Online gambling site\n\n' +
               '3. INCOME SOURCES:\n' +
               '   • Salary: ₹25,000/month\n' +
               '   • Overtime: ₹5,000/month (average)\n' +
               '   • Other: No declared additional income\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'FINANCIAL INVESTIGATION - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '4. DISCREPANCIES:\n' +
                '   • Deposit of ₹2,00,000 inconsistent with income\n' +
                '   • Electronics purchase without financing\n' +
                '   • Large cash withdrawals with no explanation\n' +
                '   • Gambling transactions during investigation\n\n' +
                '5. ASSETS:\n' +
                '   • New smartphone (model matching stolen)\n' +
                '   • Luxury watch purchased October 15\n' +
                '   • Recent car loan payment reduction\n\n' +
                '6. DEBTS:\n' +
                '   • Casino debts: ₹3,50,000\n' +
                '   • Credit card: ₹75,000\n' +
                '   • Personal loans: ₹1,25,000\n\n' +
                '7. ANALYSIS:\n' +
                '   • Financial motive clearly established\n' +
                '   • Timeline matches theft incident\n' +
                '   • Assets acquired with stolen funds\n' +
                '   • Attempts to launder money through gambling\n\n' +
                'RECOMMENDATIONS:\n' +
                '• Freeze Ravi Prasad\'s accounts\n' +
                '• Seize recently acquired assets\n' +
                '• Interview regarding source of funds\n' +
                '• Coordinate with cyber crimes division\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'FORENSIC EVIDENCE REPORT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE: RK-2025-001\n' +
               'DATE: October 20, 2025\n' +
               'LAB: Karnataka State Forensic Science Laboratory\n' +
               'REFERENCE: Physical Evidence Analysis\n\n' +
               'FINDINGS:\n\n' +
               '1. FINGERPRINT ANALYSIS:\n' +
               '   • Warehouse door handle: 3 sets\n' +
               '   • Inventory sheets: 2 sets\n' +
               '   • Security panel: 1 set\n\n' +
               '2. MATCHING RESULTS:\n' +
               '   • Set 1: Rajesh Kumar (Petitioner)\n' +
               '   • Set 2: Ravi Prasad (Employee)\n' +
               '   • Set 3: Unknown (No match in database)\n\n' +
               '3. DNA EVIDENCE:\n' +
               '   • Hair samples from security room\n' +
               '   • Fiber analysis from warehouse floor\n' +
               '   • Skin cells under security panel\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'FORENSIC EVIDENCE REPORT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '4. DIGITAL FORENSICS:\n' +
                '   • Ravi\'s computer: Deleted files recovered\n' +
                '   • Security logs: Tampering evidence\n' +
                '   • Phone records: Location data during theft\n\n' +
                '5. DOCUMENT EXAMINATION:\n' +
                '   • Signatures on inventory sheets\n' +
                '   • Handwriting analysis of notes\n' +
                '   • Paper analysis of anonymous letters\n\n' +
                '6. CONCLUSIONS:\n' +
                '   • Ravi Prasad\'s fingerprints at scene\n' +
                '   • DNA evidence links to Ravi\n' +
                '   • Digital evidence of system tampering\n' +
                '   • Petitioner\'s innocence confirmed\n\n' +
                '7. RECOMMENDATIONS:\n' +
                '   • Arrest Ravi Prasad on additional charges\n' +
                '   • Recover stolen merchandise\n' +
                '   • File charges for evidence tampering\n' +
                '   • Recommend case dismissal for petitioner\n\n' +
                'LABORATORY SEAL: _______________\n' +
                'REPORT APPROVED BY: Dr. A. Ramanathan\n' +
                'FORENSIC EXPERT\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'CASE STRATEGY DOCUMENT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE: RK-2025-001\n' +
               'DATE: October 20, 2025\n' +
               'PREPARED BY: ' + advocateName + '\n' +
               'STRATEGIC PLANNING DOCUMENT\n\n' +
               'STRATEGY OVERVIEW:\n\n' +
               '1. PRIMARY OBJECTIVE:\n' +
               '   • Secure dismissal of charges against client\n' +
               '   • Identify and prosecute actual perpetrator\n' +
               '   • Restore client\'s reputation and livelihood\n\n' +
               '2. EVIDENCE PRESENTATION:\n' +
               '   • Forensic evidence linking Ravi Prasad\n' +
               '   • Financial records showing motive\n' +
               '   • Surveillance analysis proving innocence\n' +
               '   • Witness statements corroborating theory\n\n' +
               '3. LEGAL ARGUMENTS:\n' +
               '   • Lack of evidence against petitioner\n' +
               '   • Strong circumstantial case against Ravi\n' +
               '   • Violation of petitioner\'s fundamental rights\n' +
               '   • Prosecutorial misconduct investigation\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'CASE STRATEGY DOCUMENT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '4. COURT PRESENTATION:\n' +
                '   • Opening statement highlighting innocence\n' +
                '   • Systematic presentation of evidence\n' +
                '   • Cross-examination of prosecution witnesses\n' +
                '   • Expert testimony on forensic findings\n\n' +
                '5. PUBLIC RELATIONS:\n' +
                '   • Controlled media release\n' +
                '   • Client reputation management\n' +
                '   • Professional network notifications\n' +
                '   • Social media monitoring\n\n' +
                '6. CONTINGENCY PLANNING:\n' +
                '   • If charges not dismissed: Appeal strategy\n' +
                '   • If trial proceeds: Defense preparation\n' +
                '   • If conviction occurs: Immediate appeal\n' +
                '   • Client support throughout process\n\n' +
                '7. TIMELINE:\n' +
                '   • Next hearing: October 20, 2025\n' +
                '   • Evidence submission: October 22, 2025\n' +
                '   • Final arguments: To be scheduled\n' +
                '   • Expected resolution: November 2025\n\n' +
                'APPROVAL:\n' +
                '_______________________________\n' +
                advocateName + '\n' +
                'Date: October 20, 2025\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'INVESTIGATION SUMMARY',
      caseNumber: 'RK-2025-001',
      leftPage: [
        '═══════════════════════════════════════════',
        'INVESTIGATION SUMMARY - LEFT PAGE',
        '═══════════════════════════════════════════',
        '',
        'CASE: RK-2025-001',
        'DATE: October 20, 2025',
        'PREPARED BY: ' + advocateName,
        'COMPREHENSIVE INVESTIGATION SUMMARY',
        '',
        'INVESTIGATION TIMELINE:',
        '',
        'October 13, 2025:',
        '• Theft reported by Rajesh Kumar',
        '• Initial police investigation begun',
        '• Rajesh Kumar wrongfully arrested',
        '',
        'October 14-15, 2025:',
        '• Bail hearing for Rajesh Kumar',
        '• Initial forensic collection',
        '• Security footage review begins',
        '',
        'October 16-17, 2025:',
        '• Detailed forensic analysis',
        '• Financial investigation initiated',
        '• Witness interviews conducted',
        '',
        '═══════════════════════════════════════════',
        '[CONTINUED ON NEXT PAGE]',
        '═══════════════════════════════════════════'
      ].join('\n'),
      rightPage: [
        '═══════════════════════════════════════════',
        'INVESTIGATION SUMMARY - RIGHT PAGE',
        '═══════════════════════════════════════════',
        '',
        'October 18-19, 2025:',
        '• Breakthrough in digital forensics',
        '• Ravi Prasad identified as suspect',
        '• Financial evidence corroborating theory',
        '',
        'October 20, 2025:',
        '• Comprehensive evidence package prepared',
        '• Court presentation ready',
        '• Arrest warrant drafted for Ravi Prasad',
        '',
        'KEY FINDINGS:',
        '',
        '1. PRIMARY SUSPECT:',
        '   • Ravi Prasad, warehouse assistant',
        '   • Strong financial motive',
        '   • Technical knowledge for security override',
        '',
        '2. EVIDENCE CATEGORIES:',
        '   • Physical: Fingerprints, DNA, tool marks',
        '   • Digital: System logs, deleted files',
        '   • Financial: Bank records, asset acquisition',
        '   • Testimonial: Witness statements, behavior',
        '',
        '3. INVESTIGATION QUALITY:',
        '   • Initial investigation was superficial',
        '   • Key evidence overlooked',
        '   • Wrongful focus on petitioner',
        '   • Need for procedural review',
        '',
        'RECOMMENDATIONS:',
        '• Immediate arrest of Ravi Prasad',
        '• Full case dismissal for Rajesh Kumar',
        '• Return of all personal effects',
        '• Investigation of original procedures',
        '',
        '═══════════════════════════════════════════'
      ].join('\n')
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: [
        '═══════════════════════════════════════════',
        'CASE RESOLUTION DOCUMENT - LEFT PAGE',
        '═══════════════════════════════════════════',
        '',
        'CASE: RK-2025-001',
        'DATE: October 21, 2025',
        'PREPARED BY: Court Registry',
        'REFERENCE: Final Judgment',
        '',
        'COURT ORDER:',
        '',
        'IN THE MAGISTRATE COURT',
        '[Court Address, Bangalore]',
        '',
        'Case No.: RK-2025-001',
        'Date: October 21, 2025',
        '',
        'Hon\'ble Justice Priya Menon',
        'Presiding Officer',
        '',
        'BETWEEN:',
        'Rajesh Kumar ........................ Petitioner',
        '                    and',
        'State of Karnataka ............. Respondent',
        '',
        'FINAL JUDGMENT:',
        '',
        'Upon thorough review of all evidence presented ',
        'by both parties and consideration of the ',
        'comprehensive investigation findings, this ',
        'Court hereby passes the following judgment:',
        '',
        '1. All charges against the petitioner, ',
        '   Rajesh Kumar, are hereby dismissed.',
        '',
        '2. The petitioner is fully exonerated of all ',
        '   allegations related to this case.',
        '',
        '═══════════════════════════════════════════',
        '[CONTINUED ON NEXT PAGE]',
        '═══════════════════════════════════════════'
      ].join('\n'),
      rightPage: [
        '═══════════════════════════════════════════',
        'CASE RESOLUTION DOCUMENT - RIGHT PAGE',
        '═══════════════════════════════════════════',
        '',
        '3. An arrest warrant is hereby issued for ',
        '   Ravi Prasad, employee of TechDistributors, ',
        '   for theft and evidence tampering.',
        '',
        '4. All personal effects of the petitioner ',
        '   shall be immediately returned.',
        '',
        '5. The petitioner shall receive a formal ',
        '   apology from the Bangalore Police Department.',
        '',
        '6. This case is hereby closed with prejudice.',
        '',
        'It is so ordered.',
        '',
        '                    _______________________________',
        '                    (Signature)',
        '                    Hon\'ble Justice Priya Menon',
        '                    ',
        'Date: October 21, 2025',
        'Seal of Court: _______________',
        '',
        'NOTES:',
        '• Judgment delivered in open court',
        '• Both parties present during reading',
        '• Petitioner\'s counsel expressed satisfaction',
        '• Prosecution indicated intention to appeal',
        '• Media present for public interest aspects',
        '',
        '═══════════════════════════════════════════',
        'END OF CASE FILE',
        '═══════════════════════════════════════════'
      ].join('\n')
    },
    {
      title: 'PROSECUTOR BRIEF',
      caseNumber: 'RK-2025-001',
      leftPage: [
        '═══════════════════════════════════════════',
        'PROSECUTOR BRIEF - LEFT PAGE',
        '═══════════════════════════════════════════',
        '',
        'TO: Public Prosecutor\'s Office',
        'FROM: ' + advocateName,
        'DATE: October 20, 2025',
        'RE: Case RK-2025-001 - Rajesh Kumar',
        '',
        'SUBJECT: Request for Case Review and Reopening',
        '',
        '1. EXECUTIVE SUMMARY:',
        '   New evidence has emerged that completely ',
        '   exonerates my client, Rajesh Kumar, and ',
        '   identifies the actual perpetrator, Ravi ',
        '   Prasad, as the sole responsible party.',
        '',
        '2. KEY EVIDENCE:',
        '   • Forensic evidence linking Ravi to the scene',
        '   • Financial records showing motive and means',
        '   • Surveillance analysis proving system tampering',
        '   • Witness statements corroborating innocence',
        '',
        '3. LEGAL IMPLICATIONS:',
        '   • Insufficient evidence against petitioner',
        '   • Strong probable cause against Ravi Prasad',
        '   • Potential misconduct in original investigation',
        '   • Violation of petitioner\'s fundamental rights',
        '',
        '═══════════════════════════════════════════',
        '[CONTINUED ON NEXT PAGE]',
        '═══════════════════════════════════════════'
      ].join('\n'),
      rightPage: [
        '═══════════════════════════════════════════',
        'PROSECUTOR BRIEF - RIGHT PAGE',
        '═══════════════════════════════════════════',
        '',
        '4. RECOMMENDATIONS:',
        '   • Immediate dismissal of charges against Rajesh',
        '   • Arrest and charging of Ravi Prasad',
        '   • Recovery of stolen merchandise',
        '   • Investigation of original investigation quality',
        '',
        '5. SUPPORTING DOCUMENTS:',
        '   • Forensic laboratory report (Exhibit F)',
        '   • Financial investigation report (Exhibit G)',
        '   • Surveillance analysis report (Exhibit H)',
        '   • Witness statements (Exhibits I, J, K)',
        '',
        '6. TIMELINE CONCERNS:',
        '   • Next hearing scheduled for today',
        '   • Evidence ready for immediate presentation',
        '   • Client\'s reputation at stake',
        '   • Public interest in proper prosecution',
        '',
        '7. REQUESTED ACTIONS:',
        '   • Review of new evidence before hearing',
        '   • Dismissal of charges against petitioner',
        '   • Issuance of arrest warrant for Ravi Prasad',
        '   • Return of client\'s personal effects',
        '',
        'CONTACT:',
        advocateName,
        'Phone: 9845012345',
        'Email: aditi.rao@raolaw.com',
        '',
        '═══════════════════════════════════════════'
      ].join('\n')
    },
    {
      title: 'MEDIA STRATEGY DOCUMENT',
      caseNumber: 'RK-2025-001',
      leftPage: [
        '═══════════════════════════════════════════',
        'MEDIA STRATEGY DOCUMENT - LEFT PAGE',
        '═══════════════════════════════════════════',
        '',
        'CASE: RK-2025-001',
        'DATE: October 20, 2025',
        'PREPARED BY: ' + advocateName,
        'REFERENCE: Client Reputation Management',
        '',
        'STRATEGY OVERVIEW:',
        '',
        '1. OBJECTIVES:',
        '   • Protect client\'s professional reputation',
        '   • Counteract negative publicity from arrest',
        '   • Position client as victim of circumstance',
        '   • Prepare for potential exoneration announcement',
        '',
        '2. TARGET AUDIENCES:',
        '   • Legal community and bar associations',
        '   • Local media and news outlets',
        '   • Client\'s professional network',
        '   • General public in client\'s community',
        '',
        '3. KEY MESSAGES:',
        '   • Client maintains complete innocence',
        '   • New evidence points to actual perpetrator',
        '   • Investigation ongoing with promising leads',
        '   • Client cooperating fully with authorities',
        '',
        '═══════════════════════════════════════════',
        '[CONTINUED ON NEXT PAGE]',
        '═══════════════════════════════════════════'
      ].join('\n'),
      rightPage: [
        '═══════════════════════════════════════════',
        'MEDIA STRATEGY DOCUMENT - RIGHT PAGE',
        '═══════════════════════════════════════════',
        '',
        '4. COMMUNICATION CHANNELS:',
        '   • Press release to major news outlets',
        '   • Statement to bar association newsletter',
        '   • Social media updates (controlled)',
        '   • Direct communication with key contacts',
        '',
        '5. TIMELINE:',
        '   • Immediate: Controlled information release',
        '   • Ongoing: Regular updates as appropriate',
        '   • Resolution: Full exoneration announcement',
        '   • Follow-up: Reputation restoration efforts',
        '',
        '6. TACTICS:',
        '   • Emphasize strength of defense case',
        '   • Highlight investigative diligence',
        '   • Avoid speculation about outcome',
        '   • Maintain professional decorum',
        '',
        '7. CRISIS MANAGEMENT:',
        '   • Rapid response to negative coverage',
        '   • Legal action against defamation',
        '   • Support network activation',
        '   • Client counseling and preparation',
        '',
        'APPROVAL:',
        '_______________________________',
        advocateName,
        'Date: October 20, 2025',
        '',
        '═══════════════════════════════════════════'
      ].join('\n')
    },
    {
      title: 'COURT HEARING NOTES',
      caseNumber: 'RK-2025-001',
      leftPage: [
        '═══════════════════════════════════════════',
        'COURT HEARING NOTES - LEFT PAGE',
        '═══════════════════════════════════════════',
        '',
        'CASE: RK-2025-001',
        'DATE: October 20, 2025',
        'HEARING: Morning Session',
        'COURT: Magistrate Court, Hall 2B',
        'JUDGE: Hon\'ble Justice Priya Menon',
        '',
        'ATTENDANCE:',
        '• ' + advocateName + ' - Defense Counsel',
        '• Mr. Rajesh Kumar - Petitioner',
        '• Public Prosecutor - Representing State',
        '• Court Reporter - Documentation',
        '• Security Personnel - Court Security',
        '',
        'AGENDA:',
        '1. Review of Bail Conditions',
        '2. Presentation of New Evidence',
        '3. Discussion of Investigation Progress',
        '4. Scheduling of Future Proceedings',
        '',
        'OPENING REMARKS:',
        'The Hon\'ble Justice welcomed all parties and ',
        'acknowledged receipt of defense submissions.',
        '',
        '═══════════════════════════════════════════',
        '[CONTINUED ON NEXT PAGE]',
        '═══════════════════════════════════════════'
      ].join('\n'),
      rightPage: [
        '═══════════════════════════════════════════',
        'COURT HEARING NOTES - RIGHT PAGE',
        '═══════════════════════════════════════════',
        '',
        'EVIDENCE PRESENTATION:',
        'Defense counsel presented comprehensive ',
        'evidence package including:',
        '',
        '1. Forensic Reports:',
        '   • Fingerprints matching Ravi Prasad',
        '   • DNA evidence linking to suspect',
        '   • Digital forensics of system tampering',
        '',
        '2. Financial Documentation:',
        '   • Bank records showing suspicious deposits',
        '   • Asset acquisition by Ravi Prasad',
        '   • Gambling debts creating motive',
        '',
        '3. Surveillance Analysis:',
        '   • System failure during theft window',
        '   • Unauthorized access codes used',
        '   • Technical expertise required for override',
        '',
        'JUDGE\'S REACTION:',
        'Justice Menon expressed serious concern about ',
        'the new evidence and requested additional time ',
        'to review all materials before making a ruling.',
        '',
        'NEXT STEPS:',
        '• Court to review evidence overnight',
        '• Hearing reconvened tomorrow at 10:00 AM',
        '• Prosecution given time to respond',
        '• Potential for immediate resolution',
        '',
        'CLOSING REMARKS:',
        'The court emphasized the importance of justice ',
        'and thorough investigation of all facts.',
        '',
        '═══════════════════════════════════════════'
      ].join('\n')
    },
    {
      title: 'INVESTIGATION SUMMARY',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'INVESTIGATION SUMMARY - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE: RK-2025-001\n' +
               'DATE: October 20, 2025\n' +
               'PREPARED BY: ' + advocateName + '\n' +
               'COMPREHENSIVE INVESTIGATION SUMMARY\n\n' +
               'INVESTIGATION TIMELINE:\n\n' +
               'October 13, 2025:\n' +
               '• Theft reported by Rajesh Kumar\n' +
               '• Initial police investigation begun\n' +
               '• Rajesh Kumar wrongfully arrested\n\n' +
               'October 14-15, 2025:\n' +
               '• Bail hearing for Rajesh Kumar\n' +
               '• Initial forensic collection\n' +
               '• Security footage review begins\n\n' +
               'October 16-17, 2025:\n' +
               '• Detailed forensic analysis\n' +
               '• Financial investigation initiated\n' +
               '• Witness interviews conducted\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'INVESTIGATION SUMMARY - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                'October 18-19, 2025:\n' +
                '• Breakthrough in digital forensics\n' +
                '• Ravi Prasad identified as suspect\n' +
                '• Financial evidence corroborating theory\n\n' +
                'October 20, 2025:\n' +
                '• Comprehensive evidence package prepared\n' +
                '• Court presentation ready\n' +
                '• Arrest warrant drafted for Ravi Prasad\n\n' +
                'KEY FINDINGS:\n\n' +
                '1. PRIMARY SUSPECT:\n' +
                '   • Ravi Prasad, warehouse assistant\n' +
                '   • Strong financial motive\n' +
                '   • Technical knowledge for security override\n\n' +
                '2. EVIDENCE CATEGORIES:\n' +
                '   • Physical: Fingerprints, DNA, tool marks\n' +
                '   • Digital: System logs, deleted files\n' +
                '   • Financial: Bank records, asset acquisition\n' +
                '   • Testimonial: Witness statements, behavior\n\n' +
                '3. INVESTIGATION QUALITY:\n' +
                '   • Initial investigation was superficial\n' +
                '   • Key evidence overlooked\n' +
                '   • Wrongful focus on petitioner\n' +
                '   • Need for procedural review\n\n' +
                'RECOMMENDATIONS:\n' +
                '• Immediate arrest of Ravi Prasad\n' +
                '• Full case dismissal for Rajesh Kumar\n' +
                '• Return of all personal effects\n' +
                '• Investigation of original procedures\n\n' +
                '═══════════════════════════════════════════'
    },
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: '═══════════════════════════════════════════\n' +
               'CASE RESOLUTION DOCUMENT - LEFT PAGE\n' +
               '═══════════════════════════════════════════\n\n' +
               'CASE: RK-2025-001\n' +
               'DATE: October 21, 2025\n' +
               'PREPARED BY: Court Registry\n' +
               'REFERENCE: Final Judgment\n\n' +
               'COURT ORDER:\n\n' +
               'IN THE MAGISTRATE COURT\n' +
               '[Court Address, Bangalore]\n\n' +
               'Case No.: RK-2025-001\n' +
               'Date: October 21, 2025\n\n' +
               'Hon\'ble Justice Priya Menon\n' +
               'Presiding Officer\n\n' +
               'BETWEEN:\n' +
               'Rajesh Kumar ........................ Petitioner\n' +
               '                    and\n' +
               'State of Karnataka ............. Respondent\n\n' +
               'FINAL JUDGMENT:\n\n' +
               'Upon thorough review of all evidence presented \n' +
               'by both parties and consideration of the \n' +
               'comprehensive investigation findings, this \n' +
               'Court hereby passes the following judgment:\n\n' +
               '1. All charges against the petitioner, \n' +
               '   Rajesh Kumar, are hereby dismissed.\n\n' +
               '2. The petitioner is fully exonerated of all \n' +
               '   allegations related to this case.\n\n' +
               '═══════════════════════════════════════════\n' +
               '[CONTINUED ON NEXT PAGE]\n' +
               '═══════════════════════════════════════════',
      rightPage: '═══════════════════════════════════════════\n' +
                'CASE RESOLUTION DOCUMENT - RIGHT PAGE\n' +
                '═══════════════════════════════════════════\n\n' +
                '3. An arrest warrant is hereby issued for \n' +
                '   Ravi Prasad, employee of TechDistributors, \n' +
                '   for theft and evidence tampering.\n\n' +
                '4. All personal effects of the petitioner \n' +
                '   shall be immediately returned.\n\n' +
                '5. The petitioner shall receive a formal \n' +
                '   apology from the Bangalore Police Department.\n\n' +
                '6. This case is hereby closed with prejudice.\n\n' +
                'It is so ordered.\n\n' +
                '                    _______________________________\n' +
                '                    (Signature)\n' +
                '                    Hon\'ble Justice Priya Menon\n' +
                '                    \n' +
                'Date: October 21, 2025\n' +
                'Seal of Court: _______________\n\n' +
                'NOTES:\n' +
                '• Judgment delivered in open court\n' +
                '• Both parties present during reading\n' +
                '• Petitioner\'s counsel expressed satisfaction\n' +
                '• Prosecution indicated intention to appeal\n' +
                '• Media present for public interest aspects\n\n' +
                '═══════════════════════════════════════════\n' +
                'END OF CASE FILE\n' +
                '═══════════════════════════════════════════'
    }
  ];

  // Expand caseData to 35+ pages by duplicating with variations
  const expandedCaseData = [...caseData];
  while (expandedCaseData.length < 35) {
    // Add more suspenseful pages with variations
    const index = expandedCaseData.length - caseData.length + 1;
    expandedCaseData.push({
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: [
        '═══════════════════════════════════════════',
        'INVESTIGATION NOTES - LEFT PAGE',
        '═══════════════════════════════════════════',
        '',
        'FILE: RK-2025-001',
        'DATE: October 20, 2025',
        'INVESTIGATOR: Detective Unit ' + index,
        'REFERENCE: Ongoing Case Analysis',
        '',
        'SUSPICIOUS ACTIVITIES:',
        '',
        '1. UNUSUAL PATTERNS:',
        '   • ' + (index === 1 ? 'Ravi' : 'Subject') + ' seen near warehouse after hours',
        '   • Multiple unexplained absences from work',
        '   • Recent changes in behavior and spending',
        '',
        '2. DIGITAL TRACES:',
        '   • Internet searches for "security override"',
        '   • Visits to pawn shops and electronics stores',
        '   • Unusual phone activity during critical times',
        '',
        '3. WITNESS REPORTS:',
        '   • Neighbor sightings of suspicious activity',
        '   • Colleague observations of nervous behavior',
        '   • Security guard notes about late departures',
        '',
        '═══════════════════════════════════════════',
        '[CONTINUED ON NEXT PAGE]',
        '═══════════════════════════════════════════'
      ].join('\n'),
      rightPage: [
        '═══════════════════════════════════════════',
        'INVESTIGATION NOTES - RIGHT PAGE',
        '═══════════════════════════════════════════',
        '',
        '4. FINANCIAL ANOMALIES:',
        '   • Sudden increase in cash transactions',
        '   • Unexplained deposits in bank accounts',
        '   • Purchase of luxury items without income',
        '',
        '5. PHYSICAL EVIDENCE:',
        '   • Tool marks matching warehouse security',
        '   • Fibers consistent with warehouse materials',
        '   • Traces of substances used in electronics',
        '',
        '6. INTERROGATION NOTES:',
        '   • Subject becomes agitated when questioned',
        '   • Provides inconsistent statements',
        '   • Shows signs of guilt and deception',
        '',
        '7. RECOMMENDATIONS:',
        '   • Continue surveillance of subject',
        '   • Obtain search warrant for residence',
        '   • Interview additional witnesses',
        '   • Coordinate with cyber crimes unit',
        '',
        'INVESTIGATOR\'S NOTES:',
        'The evidence continues to point toward ',
        (index === 1 ? 'Ravi Prasad' : 'the primary suspect'),
        'as the perpetrator. Further investigation ',
        'is warranted to build a stronger case.',
        '',
        '_______________________________',
        'Detective Inspector ' + String.fromCharCode(64 + index),
        'Badge Number: DI-' + (1000 + index * 23).toString(),
        '',
        '═══════════════════════════════════════════'
      ].join('\n')
    });
  }

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
    // Stop any ongoing speech when flipping pages
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

  // Text-to-speech function
  const speakText = (text: string, side: 'left' | 'right') => {
    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // If we're already speaking this side, stop it
    if (isSpeaking && currentSpeech === side) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
      return;
    }

    // Create new speech
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

  // Check if speech synthesis is supported
  const isSpeechSupported = 'speechSynthesis' in window;

  // Intro animation sequence
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

  // Enhanced intro animation
  if (showIntro) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={'absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 ' + (introStep >= 1 ? 'animate-blob' : '')}></div>
          <div className={'absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animation-delay-2000 ' + (introStep >= 1 ? 'animate-blob' : '')}></div>
          <div className={'absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animation-delay-4000 ' + (introStep >= 1 ? 'animate-blob' : '')}></div>
          
          {/* Indian law decorative elements */}
          <div className={'absolute top-10 left-10 text-amber-200 opacity-20 ' + (introStep >= 2 ? 'animate-fade-in' : 'opacity-0')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <div className={'absolute bottom-10 right-10 text-amber-200 opacity-20 ' + (introStep >= 2 ? 'animate-fade-in' : 'opacity-0')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        
        {/* Step-by-step animation */}
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
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-spin-slow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-amber-300 animate-ping opacity-20"></div>
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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Main Book Cover */}
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
            {/* Law Scales Icon */}
            <div className="mb-8 text-amber-100 transform transition-transform duration-300 hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            
            {/* DharmaSikhara Title */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-amber-100 mb-3 tracking-wider">DHARMASIKHARA</h1>
              <div className="w-32 h-1 bg-amber-200 mx-auto mb-4 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-amber-200 tracking-widest">LEGAL SIMULATION</h2>
            </div>
            
            {/* Book Details */}
            <div className="text-center mb-10">
              <div className="border-t border-b border-amber-300 py-4 mb-5">
                <p className="text-amber-100 text-xl font-medium">{advocateName}</p>
                <p className="text-amber-200 text-lg">B.A. LL.B (Hons.)</p>
              </div>
              <p className="text-amber-200 text-base">2025-2026</p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-amber-300 rounded-tl-lg"></div>
            <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-amber-300 rounded-tr-lg"></div>
            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-amber-300 rounded-bl-lg"></div>
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-amber-300 rounded-br-lg"></div>
            
            {/* Click Indicator */}
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
      {/* Header */}
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

      {/* Book Container */}
      <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center px-4 py-3 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Left Page */}
        <div className={`w-1/2 bg-yellow-50 rounded-lg shadow-xl p-6 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 -translate-x-8 rotate-y-30' : 'opacity-100 translate-x-0'} hover:shadow-amber-500/30 relative`} style={{ maxHeight: '75vh' }}>
          <div className="text-gray-800 text-sm leading-relaxed font-mono whitespace-pre-wrap select-text">
            {expandedCaseData[currentPage].leftPage}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-300 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 1}</span>
          </div>
          
          {/* Voice Control for Left Page */}
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

        {/* Right Page */}
        <div className={`w-1/2 bg-yellow-50 rounded-lg shadow-xl p-6 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 translate-x-8 -rotate-y-30' : 'opacity-100 translate-x-0'} hover:shadow-amber-500/30 relative`} style={{ maxHeight: '75vh' }}>
          <div className="text-gray-800 text-sm leading-relaxed font-mono whitespace-pre-wrap select-text">
            {expandedCaseData[currentPage].rightPage}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-300 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 2}</span>
          </div>
          
          {/* Voice Control for Right Page */}
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

      {/* Navigation Footer */}
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

