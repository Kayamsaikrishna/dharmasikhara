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
    ? `Adv. ${user.firstName} ${user.lastName}` 
    : 'Adv. Aditi Rao';

  const caseData = [
    {
      title: 'CASE FILE #001',
      caseNumber: 'RK-2025-001',
      leftPage: `═══════════════════════════════════════════
CASE FILE #001 - LEFT PAGE
═══════════════════════════════════════════

Case Number: RK-2025-001
Date Filed: October 15, 2025
Status: ACTIVE

BETWEEN:
    Rajesh Kumar (Petitioner)
                    vs.
    State of Karnataka (Respondent)

Prepared by:
    ${advocateName}
    B.A. LL.B (Hons.)

Contact Information:
    Address: Rao & Associates
             3rd Floor, Justice Complex
             Brigade Road, Bangalore - 560001
    
    Phone: 080-25598745
    Mobile: 9845012345
    Email: aditi.rao@raolaw.com

CASE DETAILS:
This legal proceeding pertains to a criminal 
matter under the jurisdiction of the Magistrate 
Court, Bangalore. The petitioner has been 
wrongfully accused of theft of electronic 
devices from his workplace.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
CASE FILE #001 - RIGHT PAGE
═══════════════════════════════════════════

COURT INFORMATION:
    Court: Magistrate Court
    Judge: Hon'ble Justice Priya Menon
    Court Hall: 2B
    Hearing Date: October 20, 2025

CASE SUMMARY:
The petitioner, Rajesh Kumar, was arrested on 
October 14, 2025, for alleged theft of 50 
smartphones worth ₹2,50,000 from the 
electronics warehouse where he works as a 
supervisor. The petitioner maintains his 
innocence.

PREVIOUS PROCEEDINGS:
    Date: October 15, 2025
    • First appearance in court
    • Bail application filed
    • Arguments heard
    • Bail granted with conditions
    
    Date: October 18, 2025
    • Charges framed
    • Plea recorded
    • Case listed for trial

NEXT HEARING:
    Date: October 20, 2025
    Time: 10:30 AM
    Location: Court Hall 2B

STATUS: Active Proceedings
COUNSEL: ${advocateName}

═══════════════════════════════════════════`
    },
    {
      title: 'CASE FILE #002',
      caseNumber: 'RK-2025-002',
      leftPage: `═══════════════════════════════════════════
PLEADING MEMORANDUM - LEFT PAGE
═══════════════════════════════════════════

Reference: Case #RK-2025-002
Prepared by: ${advocateName}
Date: October 16, 2025

FACTS OF THE CASE:

1. The petitioner, Rajesh Kumar, is a 32-year-
   old warehouse supervisor at TechDistributors.

2. On October 13, 2025, he conducted a routine
   inventory check which revealed 50 missing
   smartphones valued at ₹2,50,000.

3. Security footage shows him leaving the
   warehouse at 7:30 PM as per protocol.

4. There is a gap in the security footage
   from 9:00 PM to 11:00 PM on the same day.

5. Another employee, Ravi, has been acting
   suspiciously and has significant gambling
   debts.

6. A second key exists which was held by the
   manager, Mr. Suresh, who lost it months ago.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
PLEADING MEMORANDUM - RIGHT PAGE
═══════════════════════════════════════════

RELIEF SOUGHT:

1. Quashment of charges under Section 482 CrPC

2. Declaration of innocence

3. Compensation for wrongful arrest and 
   detention

4. Directions to the police to conduct a 
   proper investigation

5. Any other relief deemed fit and proper
   by the Honourable Court

JURISDICTION:
This Court has jurisdiction to entertain this 
petition as per Criminal Procedure Code, 1973.

SUPPORTING DOCUMENTS:
    • Employment records (Exhibit A)
    • Security footage (Exhibit B)
    • Inventory reports (Exhibit C)
    • Ravi's gambling records (Exhibit D)
    • Key access logs (Exhibit E)

═══════════════════════════════════════════`
    },
    {
      title: 'CASE FILE #003',
      caseNumber: 'RK-2025-003',
      leftPage: `═══════════════════════════════════════════
AFFIDAVIT - LEFT PAGE
═══════════════════════════════════════════

IN THE MAGISTRATE COURT

In the matter of: Case #RK-2025-003
Deponent: Rajesh Kumar
Date: October 15, 2025

I, Rajesh Kumar, son of Ramesh Kumar, 
aged 32 years, resident of Flat No. 202, 
Sai Apartments, Basavanagudi, Bangalore - 
560004, do hereby solemnly affirm and state 
as follows:

1. That I am the petitioner in this case and 
   am competent to make this affidavit.

2. That the facts stated herein are true to my 
   knowledge and belief and nothing material 
   has been concealed.

3. That I followed all security protocols at 
   my workplace and properly locked the 
   warehouse on October 13, 2025.

4. That I have no motive to steal from my 
   employer as I have a stable job and family.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
AFFIDAVIT - RIGHT PAGE
═══════════════════════════════════════════

5. That another employee, Ravi, has been 
   acting suspiciously and has gambling debts.

6. That my manager, Mr. Suresh, lost a key 
   months ago but never reported it.

7. That I have been a loyal employee for 5 
   years with no prior incidents.

DECLARATION:
I hereby declare that what is stated above is 
true and correct to the best of my knowledge 
and belief. I am making this affidavit in 
support of my petition for justice.

Signed and sworn before me at Bangalore
this 15th day of October, 2025.

_______________________________
Signature of Deponent
(Rajesh Kumar)

_______________________________
Signature of Notary Public
Date: October 15, 2025

═══════════════════════════════════════════`
    },
    {
      title: 'COURT ORDER',
      caseNumber: 'RK-2025-001',
      leftPage: `═══════════════════════════════════════════
COURT ORDER - LEFT PAGE
═══════════════════════════════════════════

IN THE MAGISTRATE COURT
[Court Address, Bangalore]

Case No.: RK-2025-001
Date: October 16, 2025

Hon'ble Justice Priya Menon
Presiding Officer

BETWEEN:
Rajesh Kumar ........................ Petitioner
                    and
State of Karnataka ............. Respondent

ORDER ON BAIL:

Upon hearing both the counsel for petitioner 
and respondent and perusing the documents on 
record, the Court hereby passes the following 
order on the bail application:

1. Bail application is allowed.

2. Petitioner shall execute a personal bond 
   of ₹50,000/- with one surety.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
COURT ORDER - RIGHT PAGE
═══════════════════════════════════════════

3. Petitioner shall surrender passport and 
   report to the nearest police station 
   weekly.

4. Petitioner shall not leave Bangalore 
   without prior permission of the Court.

5. Petitioner shall not tamper with evidence 
   or influence witnesses.

6. Next hearing scheduled for October 20, 
   2025 at 10:30 AM in Court Hall 2B.

It is so ordered.

                    _______________________________
                    (Signature)
                    Hon'ble Justice Priya Menon
                    
Date: October 16, 2025
Seal of Court: _______________

═══════════════════════════════════════════`
    },
    {
      title: 'EVIDENCE SUMMARY',
      caseNumber: 'RK-2025-001',
      leftPage: `═══════════════════════════════════════════
EVIDENCE SUMMARY - LEFT PAGE
═══════════════════════════════════════════

Case File: RK-2025-001
Prepared by: ${advocateName}
Date: October 17, 2025

DOCUMENTARY EVIDENCE:

Exhibit A: Employment Records
    • Appointment letter (2020)
    • Salary slips (5 years)
    • Performance reviews (excellent)
    • No prior disciplinary actions

Exhibit B: Security Footage
    • Entry/exit logs
    • Gap in recording (9-11 PM)
    • No footage of theft

Exhibit C: Inventory Reports
    • Monthly inventory sheets
    • Digital records
    • Discrepancy report

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
EVIDENCE SUMMARY - RIGHT PAGE
═══════════════════════════════════════════

Exhibit D: Ravi's Records
    • Casino visit records
    • Gambling debts documentation
    • Suspicious behavior reports

Exhibit E: Key Access
    • Key issuance log
    • Mr. Suresh's lost key report
    • Security protocols

ORAL EVIDENCE:

Witness Statements:
    • Mr. Suresh (Manager)
    • Ravi (Assistant)
    • Security Guard
    
Expert Testimony:
    • Forensic expert on entry signs
    • IT expert on security systems

CHAIN OF CUSTODY:
All exhibits properly maintained and catalogued.

Verified by: ${advocateName}
Court Seal: _______________
Date: October 17, 2025

═══════════════════════════════════════════`
    },
    {
      title: 'CASE ANALYSIS',
      caseNumber: 'RK-2025-001',
      leftPage: `═══════════════════════════════════════════
LEGAL ANALYSIS - LEFT PAGE
═══════════════════════════════════════════

CASE ANALYSIS:
RK-2025-001 - Wrongful Accusation

I. LEGAL ISSUES:
1. Circumstantial evidence
2. Burden of proof
3. Right to reputation
4. Applicable legal provisions

II. APPLICABLE LAW:
1. Indian Penal Code, 1860
   • Sections 26, 35, 39, 40
2. Criminal Procedure Code, 1973
   • Sections 438, 482, 437
3. Indian Evidence Act, 1872
   • Sections 3, 8, 10, 13

III. PRECEDENTS:
1. State of U.P. v. Ravindra Prakash, 
   AIR 1992 SC 722
   - Circumstantial evidence requirements
2. Sharad Birdhichand Sarda v. State of 
   Maharashtra, AIR 1984 SC 1673
   - Golden thread of circumstantial evidence

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
LEGAL ANALYSIS - RIGHT PAGE
═══════════════════════════════════════════

IV. STRENGTHS OF CASE:
1. Clean record of petitioner
2. Security footage gaps
3. Alternative suspect with motive
4. Manager's negligence
5. Proper procedures followed

V. WEAKNESSES OF CASE:
1. Petitioner was last seen
2. Missing inventory substantial
3. Possibility of circumstantial evidence
4. Need to prove alternative theory

VI. STRATEGY:
1. Highlight security gaps
2. Present alternative suspect
3. Show manager's negligence
4. Emphasize clean record
5. File for charge quashing

VII. TIMELINE:
1. Next hearing: October 20, 2025
2. Evidence recording: To be scheduled
3. Final arguments: To be scheduled

═══════════════════════════════════════════`
    },
    {
      title: 'PREPARED BY',
      caseNumber: 'RK-2025-001',
      leftPage: `═══════════════════════════════════════════
ATTORNEY PROFILE - LEFT PAGE
═══════════════════════════════════════════

LEGAL COUNSEL:
${advocateName}

EDUCATION:
• Bachelor of Arts (B.A.)
• Bachelor of Laws (LL.B) Honors
• Bar Council of Karnataka enrollment

PROFESSIONAL QUALIFICATIONS:
• Enrolled with Bar Council of Karnataka
• Practicing since 2018
• Specialization in Criminal Defense
• Certified Legal Researcher

PRACTICE AREAS:
• Criminal Law
• Constitutional Law
• Cyber Crime
• White Collar Crime
• Human Rights Law

BAR ASSOCIATION MEMBERSHIPS:
• Karnataka State Bar Council
• Bangalore District Bar Association
• Indian Bar Association

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
ATTORNEY PROFILE - RIGHT PAGE
═══════════════════════════════════════════

CONTACT INFORMATION:
Office Address:
Rao & Associates
3rd Floor, Justice Complex
Brigade Road, Bangalore - 560001

Phone: 080-25598745
Mobile: 9845012345
Email: aditi.rao@raolaw.com

OFFICE HOURS:
Monday to Friday: 9:30 AM - 6:30 PM
Saturday: 9:30 AM - 1:30 PM
Emergency Contact: Available on request

CASE HANDLING CAPACITY:
• Maximum 20 active cases at a time
• Priority given to criminal defense
• Emergency matters handled promptly
• Pro bono work for deserving cases

FEES STRUCTURE:
• Consultation: Rs. 1,500/- per hour
• Appearance: Rs. 7,500/- per hearing
• Drafting: Rs. 3,000/- per document
• Retainership: Rs. 35,000/- per month

═══════════════════════════════════════════
END OF CASE FILE
═══════════════════════════════════════════`
    },
    // Additional pages to increase suspense and detail
    {
      title: 'CONFIDENTIAL INVESTIGATION REPORT',
      caseNumber: 'RK-2025-004',
      leftPage: `═══════════════════════════════════════════
CONFIDENTIAL INVESTIGATION REPORT - LEFT PAGE
═══════════════════════════════════════════

FILE: CONFIDENTIAL - RK-2025-004
DATE: October 18, 2025
PREPARED BY: ${advocateName}
SECURITY LEVEL: HIGHLY CONFIDENTIAL

SUBJECT: UNAUTHORIZED ACCESS TO WAREHOUSE

1. Background Investigation:
   • Security logs show unusual activity
   • Multiple unauthorized entries detected
   • Pattern suggests inside knowledge of 
     security protocols

2. Personnel Analysis:
   • Rajesh Kumar - Clean record
   • Ravi Prasad - Financial difficulties
   • Mr. Suresh - Manager, lost key reported

3. Financial Records:
   • Ravi's bank statements show large 
     unexplained deposits
   • Casino records indicate significant losses
   • Recent pawn shop transactions

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
CONFIDENTIAL INVESTIGATION REPORT - RIGHT PAGE
═══════════════════════════════════════════

4. Physical Evidence:
   • Fingerprints on inventory sheets
   • Unusual wear patterns on security door
   • Missing surveillance footage during 
     critical hours

5. Witness Statements:
   • Security guard reported seeing shadows
   • Night cleaner heard unusual sounds
   • Delivery personnel noticed strange 
     activity

6. Analysis:
   • Theft occurred during security gap
   • Perpetrator had inside knowledge
   • Motive: Financial desperation
   • Opportunity: Lost key access

7. Recommendations:
   • Further investigation of Ravi Prasad
   • Examination of pawn shop records
   • Review of all security protocols

WARNING: This document contains sensitive 
information. Unauthorized disclosure may 
result in legal action.

═══════════════════════════════════════════
[END OF REPORT]
═══════════════════════════════════════════`
    },
    {
      title: 'WITNESS STATEMENT',
      caseNumber: 'RK-2025-005',
      leftPage: `═══════════════════════════════════════════
WITNESS STATEMENT - LEFT PAGE
═══════════════════════════════════════════

STATEMENT OF: Mr. Suresh Kumar
OCCUPATION: Warehouse Manager
DATE RECORDED: October 19, 2025
RECORDED BY: ${advocateName}

EXAMINATION:

Q: When did you first notice the missing key?
A: Approximately 3 months ago, in July 2025.

Q: Did you report this incident?
A: No, I thought I had misplaced it myself.

Q: Can you describe the key?
A: It was a standard brass key, labeled 
   with 'WAREHOUSE-A' engraving.

Q: Who else had access to this key?
A: Only myself and Rajesh, the supervisor.

Q: Did you ever mention this to Rajesh?
A: No, I was embarrassed about losing it.

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
WITNESS STATEMENT - RIGHT PAGE
═══════════════════════════════════════════

Q: When did you realize the key was truly 
   missing?
A: After Rajesh was arrested. I checked 
   my keychain and realized it was gone.

Q: Do you suspect anyone else had access?
A: Possibly Ravi. He was always curious 
   about security procedures.

Q: Have you seen Ravi with any unusual items?
A: Yes, he had a new smartphone recently, 
   despite his salary.

Q: Any other relevant information?
A: Ravi has been acting nervous lately and 
   often stays late without explanation.

ADDITIONAL NOTES:
• Witness appeared cooperative but nervous
• Admission of negligence regarding key
• Possible alternative suspect identified
• Financial motive for alternative suspect

STATEMENT SIGNED:
_______________________________
Mr. Suresh Kumar
Date: October 19, 2025

═══════════════════════════════════════════`
    },
    {
      title: 'SURVEILLANCE ANALYSIS',
      caseNumber: 'RK-2025-006',
      leftPage: `═══════════════════════════════════════════
SURVEILLANCE ANALYSIS - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 19, 2025
ANALYST: Forensic IT Expert
REFERENCE: Security Footage Review

FINDINGS:

1. CAMERA COVERAGE:
   • Main entrance: Fully functional
   • Side entrance: Functional
   • Rear entrance: System failure
   • Internal cameras: Partial coverage

2. TIME GAP ANALYSIS:
   • October 13, 2025
   • 7:30 PM: Rajesh exits (recorded)
   • 8:00 PM - 9:00 PM: Normal activity
   • 9:00 PM - 11:00 PM: System failure
   • 11:00 PM onwards: Functional

3. SYSTEM LOGS:
   • Manual override detected at 8:45 PM
   • Unknown access code used
   • No trace of authorized personnel

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
SURVEILLANCE ANALYSIS - RIGHT PAGE
═══════════════════════════════════════════

4. SUSPICIOUS ACTIVITY:
   • Unusual network traffic at 8:47 PM
   • Multiple login attempts detected
   • Access to security system controls

5. PERSONNEL ACCESS:
   • Rajesh Kumar: Standard access
   • Ravi Prasad: Limited access
   • Mr. Suresh: Administrative access

6. TECHNICAL ANOMALIES:
   • System failure not accidental
   • Deliberate disruption of recording
   • Evidence suggests inside knowledge

7. CONCLUSIONS:
   • Theft occurred during system failure
   • Perpetrator had technical knowledge
   • Security override was intentional
   • Rajesh Kumar not responsible

RECOMMENDATIONS:
• Investigate Ravi Prasad's IT skills
• Examine system logs for additional clues
• Review all personnel with admin access

═══════════════════════════════════════════`
    },
    {
      title: 'FINANCIAL INVESTIGATION',
      caseNumber: 'RK-2025-007',
      leftPage: `═══════════════════════════════════════════
FINANCIAL INVESTIGATION - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 19, 2025
INVESTIGATOR: Financial Crimes Unit
REFERENCE: Ravi Prasad Financial Records

FINDINGS:

1. BANK ACCOUNTS:
   • Savings account: TechDistributors Credit Union
   • Checking account: State Bank of India
   • Credit card: HDFC Platinum

2. RECENT TRANSACTIONS:
   • October 14, 2025: Deposit of ₹2,00,000
   • October 15, 2025: Purchase electronics store
   • October 16, 2025: Cash withdrawal ₹50,000
   • October 17, 2025: Online gambling site

3. INCOME SOURCES:
   • Salary: ₹25,000/month
   • Overtime: ₹5,000/month (average)
   • Other: No declared additional income

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
FINANCIAL INVESTIGATION - RIGHT PAGE
═══════════════════════════════════════════

4. DISCREPANCIES:
   • Deposit of ₹2,00,000 inconsistent with income
   • Electronics purchase without financing
   • Large cash withdrawals with no explanation
   • Gambling transactions during investigation

5. ASSETS:
   • New smartphone (model matching stolen)
   • Luxury watch purchased October 15
   • Recent car loan payment reduction

6. DEBTS:
   • Casino debts: ₹3,50,000
   • Credit card: ₹75,000
   • Personal loans: ₹1,25,000

7. ANALYSIS:
   • Financial motive clearly established
   • Timeline matches theft incident
   • Assets acquired with stolen funds
   • Attempts to launder money through gambling

RECOMMENDATIONS:
• Freeze Ravi Prasad's accounts
• Seize recently acquired assets
• Interview regarding source of funds
• Coordinate with cyber crimes division

═══════════════════════════════════════════`
    },
    {
      title: 'FORENSIC EVIDENCE',
      caseNumber: 'RK-2025-008',
      leftPage: `═══════════════════════════════════════════
FORENSIC EVIDENCE REPORT - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 20, 2025
LAB: Karnataka State Forensic Science Laboratory
REFERENCE: Physical Evidence Analysis

FINDINGS:

1. FINGERPRINT ANALYSIS:
   • Warehouse door handle: 3 sets
   • Inventory sheets: 2 sets
   • Security panel: 1 set

2. MATCHING RESULTS:
   • Set 1: Rajesh Kumar (Petitioner)
   • Set 2: Ravi Prasad (Employee)
   • Set 3: Unknown (No match in database)

3. DNA EVIDENCE:
   • Hair samples from security room
   • Fiber analysis from warehouse floor
   • Skin cells under security panel

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
FORENSIC EVIDENCE REPORT - RIGHT PAGE
═══════════════════════════════════════════

4. DIGITAL FORENSICS:
   • Ravi's computer: Deleted files recovered
   • Security logs: Tampering evidence
   • Phone records: Location data during theft

5. DOCUMENT EXAMINATION:
   • Signatures on inventory sheets
   • Handwriting analysis of notes
   • Paper analysis of anonymous letters

6. CONCLUSIONS:
   • Ravi Prasad's fingerprints at scene
   • DNA evidence links to Ravi
   • Digital evidence of system tampering
   • Petitioner's innocence confirmed

7. RECOMMENDATIONS:
   • Arrest Ravi Prasad on additional charges
   • Recover stolen merchandise
   • File charges for evidence tampering
   • Recommend case dismissal for petitioner

LABORATORY SEAL: _______________
REPORT APPROVED BY: Dr. A. Ramanathan
FORENSIC EXPERT

═══════════════════════════════════════════`
    },
    {
      title: 'CASE STRATEGY',
      caseNumber: 'RK-2025-009',
      leftPage: `═══════════════════════════════════════════
CASE STRATEGY DOCUMENT - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 20, 2025
PREPARED BY: ${advocateName}
STRATEGIC PLANNING DOCUMENT

STRATEGY OVERVIEW:

1. PRIMARY OBJECTIVE:
   • Secure dismissal of charges against client
   • Identify and prosecute actual perpetrator
   • Restore client's reputation and livelihood

2. EVIDENCE PRESENTATION:
   • Forensic evidence linking Ravi Prasad
   • Financial records showing motive
   • Surveillance analysis proving innocence
   • Witness statements corroborating theory

3. LEGAL ARGUMENTS:
   • Lack of evidence against petitioner
   • Strong circumstantial case against Ravi
   • Violation of petitioner's fundamental rights
   • Prosecutorial misconduct investigation

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
CASE STRATEGY DOCUMENT - RIGHT PAGE
═══════════════════════════════════════════

4. COURT PRESENTATION:
   • Opening statement highlighting innocence
   • Systematic presentation of evidence
   • Cross-examination of prosecution witnesses
   • Expert testimony on forensic findings

5. PUBLIC RELATIONS:
   • Controlled media release
   • Client reputation management
   • Professional network notifications
   • Social media monitoring

6. CONTINGENCY PLANNING:
   • If charges not dismissed: Appeal strategy
   • If trial proceeds: Defense preparation
   • If conviction occurs: Immediate appeal
   • Client support throughout process

7. TIMELINE:
   • Next hearing: October 20, 2025
   • Evidence submission: October 22, 2025
   • Final arguments: To be scheduled
   • Expected resolution: November 2025

APPROVAL:
_______________________________
${advocateName}
Date: October 20, 2025

═══════════════════════════════════════════`
    },
    {
      title: 'PROSECUTOR BRIEF',
      caseNumber: 'RK-2025-010',
      leftPage: `═══════════════════════════════════════════
PROSECUTOR BRIEF - LEFT PAGE
═══════════════════════════════════════════

TO: Public Prosecutor's Office
FROM: ${advocateName}
DATE: October 20, 2025
RE: Case RK-2025-001 - Rajesh Kumar

SUBJECT: Request for Case Review and Reopening

1. EXECUTIVE SUMMARY:
   New evidence has emerged that completely 
   exonerates my client, Rajesh Kumar, and 
   identifies the actual perpetrator, Ravi 
   Prasad, as the sole responsible party.

2. KEY EVIDENCE:
   • Forensic evidence linking Ravi to the scene
   • Financial records showing motive and means
   • Surveillance analysis proving system tampering
   • Witness statements corroborating innocence

3. LEGAL IMPLICATIONS:
   • Insufficient evidence against petitioner
   • Strong probable cause against Ravi Prasad
   • Potential misconduct in original investigation
   • Violation of petitioner's fundamental rights

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
PROSECUTOR BRIEF - RIGHT PAGE
═══════════════════════════════════════════

4. RECOMMENDATIONS:
   • Immediate dismissal of charges against Rajesh
   • Arrest and charging of Ravi Prasad
   • Recovery of stolen merchandise
   • Investigation of original investigation quality

5. SUPPORTING DOCUMENTS:
   • Forensic laboratory report (Exhibit F)
   • Financial investigation report (Exhibit G)
   • Surveillance analysis report (Exhibit H)
   • Witness statements (Exhibits I, J, K)

6. TIMELINE CONCERNS:
   • Next hearing scheduled for today
   • Evidence ready for immediate presentation
   • Client's reputation at stake
   • Public interest in proper prosecution

7. REQUESTED ACTIONS:
   • Review of new evidence before hearing
   • Dismissal of charges against petitioner
   • Issuance of arrest warrant for Ravi Prasad
   • Return of client's personal effects

CONTACT:
${advocateName}
Phone: 9845012345
Email: aditi.rao@raolaw.com

═══════════════════════════════════════════`
    },
    {
      title: 'MEDIA STRATEGY',
      caseNumber: 'RK-2025-011',
      leftPage: `═══════════════════════════════════════════
MEDIA STRATEGY DOCUMENT - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 20, 2025
PREPARED BY: ${advocateName}
REFERENCE: Client Reputation Management

STRATEGY OVERVIEW:

1. OBJECTIVES:
   • Protect client's professional reputation
   • Counteract negative publicity from arrest
   • Position client as victim of circumstance
   • Prepare for potential exoneration announcement

2. TARGET AUDIENCES:
   • Legal community and bar associations
   • Local media and news outlets
   • Client's professional network
   • General public in client's community

3. KEY MESSAGES:
   • Client maintains complete innocence
   • New evidence points to actual perpetrator
   • Investigation ongoing with promising leads
   • Client cooperating fully with authorities

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
MEDIA STRATEGY DOCUMENT - RIGHT PAGE
═══════════════════════════════════════════

4. COMMUNICATION CHANNELS:
   • Press release to major news outlets
   • Statement to bar association newsletter
   • Social media updates (controlled)
   • Direct communication with key contacts

5. TIMING:
   • Immediate: Controlled information release
   • Ongoing: Regular updates as appropriate
   • Resolution: Full exoneration announcement
   • Follow-up: Reputation restoration efforts

6. TACTICS:
   • Emphasize strength of defense case
   • Highlight investigative diligence
   • Avoid speculation about outcome
   • Maintain professional decorum

7. CRISIS MANAGEMENT:
   • Rapid response to negative coverage
   • Legal action against defamation
   • Support network activation
   • Client counseling and preparation

APPROVAL:
_______________________________
${advocateName}
Date: October 20, 2025

═══════════════════════════════════════════`
    },
    {
      title: 'COURT HEARING NOTES',
      caseNumber: 'RK-2025-012',
      leftPage: `═══════════════════════════════════════════
COURT HEARING NOTES - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 20, 2025
HEARING: Morning Session
COURT: Magistrate Court, Hall 2B
JUDGE: Hon'ble Justice Priya Menon

ATTENDANCE:
• ${advocateName} - Defense Counsel
• Mr. Rajesh Kumar - Petitioner
• Public Prosecutor - Representing State
• Court Reporter - Documentation
• Security Personnel - Court Security

AGENDA:
1. Review of Bail Conditions
2. Presentation of New Evidence
3. Discussion of Investigation Progress
4. Scheduling of Future Proceedings

OPENING REMARKS:
The Hon'ble Justice welcomed all parties and 
acknowledged receipt of defense submissions.

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
COURT HEARING NOTES - RIGHT PAGE
═══════════════════════════════════════════

EVIDENCE PRESENTATION:
Defense counsel presented comprehensive 
evidence package including:

1. Forensic Reports:
   • Fingerprints matching Ravi Prasad
   • DNA evidence linking to suspect
   • Digital forensics of system tampering

2. Financial Documentation:
   • Bank records showing suspicious deposits
   • Asset acquisition by Ravi Prasad
   • Gambling debts creating motive

3. Surveillance Analysis:
   • System failure during theft window
   • Unauthorized access codes used
   • Technical expertise required for override

JUDGE'S REACTION:
Justice Menon expressed serious concern about 
the new evidence and requested additional time 
to review all materials before making a ruling.

NEXT STEPS:
• Court to review evidence overnight
• Hearing reconvened tomorrow at 10:00 AM
• Prosecution given time to respond
• Potential for immediate resolution

CLOSING REMARKS:
The court emphasized the importance of justice 
and thorough investigation of all facts.

═══════════════════════════════════════════`
    },
    {
      title: 'INVESTIGATION SUMMARY',
      caseNumber: 'RK-2025-013',
      leftPage: `═══════════════════════════════════════════
INVESTIGATION SUMMARY - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 20, 2025
PREPARED BY: ${advocateName}
COMPREHENSIVE INVESTIGATION SUMMARY

INVESTIGATION TIMELINE:

October 13, 2025:
• Theft reported by Rajesh Kumar
• Initial police investigation begun
• Rajesh Kumar wrongfully arrested

October 14-15, 2025:
• Bail hearing for Rajesh Kumar
• Initial forensic collection
• Security footage review begins

October 16-17, 2025:
• Detailed forensic analysis
• Financial investigation initiated
• Witness interviews conducted

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
INVESTIGATION SUMMARY - RIGHT PAGE
═══════════════════════════════════════════

October 18-19, 2025:
• Breakthrough in digital forensics
• Ravi Prasad identified as suspect
• Financial evidence corroborating theory

October 20, 2025:
• Comprehensive evidence package prepared
• Court presentation ready
• Arrest warrant drafted for Ravi Prasad

KEY FINDINGS:

1. PRIMARY SUSPECT:
   • Ravi Prasad, warehouse assistant
   • Strong financial motive
   • Technical knowledge for security override

2. EVIDENCE CATEGORIES:
   • Physical: Fingerprints, DNA, tool marks
   • Digital: System logs, deleted files
   • Financial: Bank records, asset acquisition
   • Testimonial: Witness statements, behavior

3. INVESTIGATION QUALITY:
   • Initial investigation was superficial
   • Key evidence overlooked
   • Wrongful focus on petitioner
   • Need for procedural review

RECOMMENDATIONS:
• Immediate arrest of Ravi Prasad
• Full case dismissal for Rajesh Kumar
• Return of all personal effects
• Investigation of original procedures

═══════════════════════════════════════════`
    },
    {
      title: 'CASE RESOLUTION',
      caseNumber: 'RK-2025-014',
      leftPage: `═══════════════════════════════════════════
CASE RESOLUTION DOCUMENT - LEFT PAGE
═══════════════════════════════════════════

CASE: RK-2025-001
DATE: October 21, 2025
PREPARED BY: Court Registry
REFERENCE: Final Judgment

COURT ORDER:

IN THE MAGISTRATE COURT
[Court Address, Bangalore]

Case No.: RK-2025-001
Date: October 21, 2025

Hon'ble Justice Priya Menon
Presiding Officer

BETWEEN:
Rajesh Kumar ........................ Petitioner
                    and
State of Karnataka ............. Respondent

FINAL JUDGMENT:

Upon thorough review of all evidence presented 
by both parties and consideration of the 
comprehensive investigation findings, this 
Court hereby passes the following judgment:

1. All charges against the petitioner, 
   Rajesh Kumar, are hereby dismissed.

2. The petitioner is fully exonerated of all 
   allegations related to this case.

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
CASE RESOLUTION DOCUMENT - RIGHT PAGE
═══════════════════════════════════════════

3. An arrest warrant is hereby issued for 
   Ravi Prasad, employee of TechDistributors, 
   for theft and evidence tampering.

4. All personal effects of the petitioner 
   shall be immediately returned.

5. The petitioner shall receive a formal 
   apology from the Bangalore Police Department.

6. This case is hereby closed with prejudice.

It is so ordered.

                    _______________________________
                    (Signature)
                    Hon'ble Justice Priya Menon
                    
Date: October 21, 2025
Seal of Court: _______________

NOTES:
• Judgment delivered in open court
• Both parties present during reading
• Petitioner's counsel expressed satisfaction
• Prosecution indicated intention to appeal
• Media present for public interest aspects

═══════════════════════════════════════════
END OF CASE FILE
═══════════════════════════════════════════`
    }
  ];

  // Expand caseData to 30+ pages by duplicating with variations
  const expandedCaseData = [...caseData];
  while (expandedCaseData.length < 35) {
    // Add more suspenseful pages with variations
    const index = expandedCaseData.length - caseData.length + 1;
    expandedCaseData.push({
      title: `INVESTIGATION NOTES #${index.toString().padStart(2, '0')}`,
      caseNumber: `RK-2025-${(index + 14).toString().padStart(3, '0')}`,
      leftPage: `═══════════════════════════════════════════
INVESTIGATION NOTES - LEFT PAGE
═══════════════════════════════════════════

FILE: RK-2025-${(index + 14).toString().padStart(3, '0')}
DATE: October 20, 2025
INVESTIGATOR: Detective Unit ${index}
REFERENCE: Ongoing Case Analysis

SUSPICIOUS ACTIVITIES:

1. UNUSUAL PATTERNS:
   • ${index === 1 ? 'Ravi' : 'Subject'} seen near warehouse after hours
   • Multiple unexplained absences from work
   • Recent changes in behavior and spending

2. DIGITAL TRACES:
   • Internet searches for "security override"
   • Visits to pawn shops and electronics stores
   • Unusual phone activity during critical times

3. WITNESS REPORTS:
   • Neighbor sightings of suspicious activity
   • Colleague observations of nervous behavior
   • Security guard notes about late departures

═══════════════════════════════════════════
[CONTINUED ON NEXT PAGE]
═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
INVESTIGATION NOTES - RIGHT PAGE
═══════════════════════════════════════════

4. FINANCIAL ANOMALIES:
   • Sudden increase in cash transactions
   • Unexplained deposits in bank accounts
   • Purchase of luxury items without income

5. PHYSICAL EVIDENCE:
   • Tool marks matching warehouse security
   • Fibers consistent with warehouse materials
   • Traces of substances used in electronics

6. INTERROGATION NOTES:
   • Subject becomes agitated when questioned
   • Provides inconsistent statements
   • Shows signs of guilt and deception

7. RECOMMENDATIONS:
   • Continue surveillance of subject
   • Obtain search warrant for residence
   • Interview additional witnesses
   • Coordinate with cyber crimes unit

INVESTIGATOR'S NOTES:
The evidence continues to point toward 
${index === 1 ? 'Ravi Prasad' : 'the primary suspect'} 
as the perpetrator. Further investigation 
is warranted to build a stronger case.

_______________________________
Detective Inspector ${String.fromCharCode(64 + index)}
Badge Number: DI-${(1000 + index * 23).toString()}

═══════════════════════════════════════════`
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
            className="relative w-80 h-[500px] bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 rounded-lg shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-amber-600 cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setOpened(true)}
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Law Scales Icon */}
            <div className="mb-6 text-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            
            {/* DharmaSikhara Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-amber-100 mb-2 tracking-wider">DHARMASIKHARA</h1>
              <div className="w-24 h-0.5 bg-amber-200 mx-auto mb-3"></div>
              <h2 className="text-xl font-semibold text-amber-200 tracking-widest">LEGAL SIMULATION</h2>
            </div>
            
            {/* Book Details */}
            <div className="text-center mb-8">
              <div className="border-t border-b border-amber-300 py-3 mb-4">
                <p className="text-amber-100 text-lg font-medium">{advocateName}</p>
                <p className="text-amber-200 text-sm">B.A. LL.B (Hons.)</p>
              </div>
              <p className="text-amber-200 text-sm">2025-2026</p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-300"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-300"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-300"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-300"></div>
            
            {/* Click Indicator */}
            <div className="absolute bottom-6 text-center w-full">
              <p className="text-amber-200 font-semibold text-sm animate-pulse">CLICK TO OPEN CASE FILES</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-700 to-pink-600 text-white p-6 rounded-t-xl flex items-center justify-between mb-0">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{expandedCaseData[currentPage].title}</h1>
          <p className="text-pink-100 text-sm">Case #{expandedCaseData[currentPage].caseNumber}</p>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="p-3 hover:bg-pink-700 rounded-lg transition transform hover:scale-110"
        >
          <X size={32} />
        </button>
      </div>

      {/* Book Container */}
      <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center px-8 py-6 gap-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Left Page */}
        <div className={`w-1/2 bg-yellow-50 rounded-lg shadow-2xl p-10 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 -translate-x-12 rotate-y-45' : 'opacity-100 translate-x-0'} hover:shadow-pink-500/50 relative`} style={{ maxHeight: '70vh' }}>
          <div className="text-gray-800 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text">
            {expandedCaseData[currentPage].leftPage}
          </div>
          <div className="mt-8 pt-4 border-t-2 border-gray-400 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 1}</span>
          </div>
          
          {/* Voice Control for Left Page */}
          {isSpeechSupported && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => speakText(expandedCaseData[currentPage].leftPage, 'left')}
                disabled={isSpeaking && currentSpeech !== 'left'}
                className={`p-2 rounded-full ${isSpeaking && currentSpeech === 'left' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300 transition`}
                title={isSpeaking && currentSpeech === 'left' ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking && currentSpeech === 'left' ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Right Page */}
        <div className={`w-1/2 bg-yellow-50 rounded-lg shadow-2xl p-10 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 translate-x-12 -rotate-y-45' : 'opacity-100 translate-x-0'} hover:shadow-pink-500/50 relative`} style={{ maxHeight: '70vh' }}>
          <div className="text-gray-800 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text">
            {expandedCaseData[currentPage].rightPage}
          </div>
          <div className="mt-8 pt-4 border-t-2 border-gray-400 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 2}</span>
          </div>
          
          {/* Voice Control for Right Page */}
          {isSpeechSupported && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => speakText(expandedCaseData[currentPage].rightPage, 'right')}
                disabled={isSpeaking && currentSpeech !== 'right'}
                className={`p-2 rounded-full ${isSpeaking && currentSpeech === 'right' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300 transition`}
                title={isSpeaking && currentSpeech === 'right' ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking && currentSpeech === 'right' ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-b-xl flex items-center justify-between border-t-4 border-pink-600">
        <button
          onClick={() => flipPage('prev')}
          disabled={currentPage === 0 || isFlipping}
          className="flex items-center gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-bold transform hover:scale-105"
        >
          <ChevronLeft size={24} />
          Previous
        </button>

        <div className="text-center text-white">
          <p className="text-xl font-bold">File {currentPage + 1} of {expandedCaseData.length}</p>
          <p className="text-sm text-gray-400">Double Page Spread • Pages {currentPage * 2 + 1}-{currentPage * 2 + 2}</p>
        </div>

        <button
          onClick={() => flipPage('next')}
          disabled={currentPage === expandedCaseData.length - 1 || isFlipping}
          className="flex items-center gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-bold transform hover:scale-105"
        >
          Next
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}