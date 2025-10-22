import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function BookViewer() {
  const [opened, setOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const caseData = [
    {
      title: 'CASE FILE #001',
      caseNumber: 'LF-2024-001',
      leftPage: `═══════════════════════════════════════════
CASE FILE #001 - LEFT PAGE
═══════════════════════════════════════════

Case Number: LF-2024-001
Date Filed: October 15, 2024
Status: ACTIVE

BETWEEN:
    PETITIONER
                    vs.
    RESPONDENT

Prepared by:
    Adv. Ashish S Swar
    B.COM, LL.B, M.A

Contact Information:
    Address: Ashish Swar Chambers
             1st Floor, Cyber Square
             Purnea, Goa - 605112
    
    Phone: 0832-2301572
    Mobile: 9764921100
    Email: ashishswar8@gmail.com

CASE DETAILS:
This legal proceeding pertains to a civil 
matter under the jurisdiction of the District 
Court. All parties involved have been properly 
notified of the proceedings and court orders.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
CASE FILE #001 - RIGHT PAGE
═══════════════════════════════════════════

COURT INFORMATION:
    Court: District Court
    Judge: Hon'ble Justice
    Court Hall: A-3
    Hearing Date: November 15, 2025

CASE SUMMARY:
The petitioner filed this case on October 15, 
2024, alleging breach of contract by the 
respondent. The matter involves a commercial 
dispute valued at Rs. 5,00,000 (Five lakhs).

PREVIOUS PROCEEDINGS:
    Date: October 20, 2024
    • First hearing conducted
    • Both parties presented arguments
    • Case posted for further hearing
    
    Date: October 25, 2024
    • Interim relief granted
    • Respondent ordered to deposit 50%

NEXT HEARING:
    Date: November 15, 2025
    Time: 10:00 AM
    Location: Court Hall A-3

STATUS: Active Proceedings
COUNSEL: Adv. Ashish S Swar

═══════════════════════════════════════════`
    },
    {
      title: 'CASE FILE #002',
      caseNumber: 'LF-2024-002',
      leftPage: `═══════════════════════════════════════════
PLEADING MEMORANDUM - LEFT PAGE
═══════════════════════════════════════════

Reference: Case #LF-2024-002
Prepared by: Adv. Ashish S Swar
Date: October 18, 2025

FACTS OF THE CASE:

1. The petitioner is a natural person residing 
   at the address mentioned in the petition.

2. The respondent, by his acts and omissions, 
   has caused considerable damages to the 
   petitioner's business interests.

3. All previous attempts at settlement have 
   failed and this legal action is necessary 
   for justice.

4. The matter involves a breach of contract 
   dated June 15, 2024, wherein the respondent 
   agreed to deliver goods/services.

5. The respondent failed to fulfill his 
   obligations despite repeated reminders.

6. The petitioner has suffered both financial 
   and reputational loss due to this breach.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
PLEADING MEMORANDUM - RIGHT PAGE
═══════════════════════════════════════════

RELIEF SOUGHT:

1. Monetary compensation of Rs. 5,00,000/-
   (Five lakhs only) for damages suffered

2. Injunction restraining respondent from 
   causing further violation

3. Interest on the claimed amount @ 12% p.a.
   from date of breach till date of payment

4. Cost of litigation including court fees
   and attorney charges

5. Any other relief deemed fit and proper
   by the Honourable Court

JURISDICTION:
This Court has territorial jurisdiction to 
entertain this petition as per Civil Procedure 
Code Section 13, 1908.

SUPPORTING DOCUMENTS:
    • Original Agreement (Exhibit A)
    • Email Correspondence (Exhibit B)
    • Bank Statements (Exhibit C)
    • Photographs & Evidence (Exhibit D)
    • Medical Reports (if applicable)

═══════════════════════════════════════════`
    },
    {
      title: 'CASE FILE #003',
      caseNumber: 'LF-2024-003',
      leftPage: `═══════════════════════════════════════════
AFFIDAVIT - LEFT PAGE
═══════════════════════════════════════════

IN THE DISTRICT COURT

In the matter of: Case #LF-2024-003
Deponent: Ram Kumar Singh
Date: October 10, 2025

I, Ram Kumar Singh, son of Shri Hari Singh, 
aged 35 years, resident of Plot No. 123, 
Sector 5, New Delhi - 110001, do hereby 
solemnly affirm and state as follows:

1. That I am the petitioner in this case and 
   am competent to make this affidavit.

2. That the facts stated herein are true to my 
   knowledge and belief and nothing material 
   has been concealed.

3. That the respondent has willfully violated 
   the terms and conditions as agreed upon 
   vide the agreement dated June 15, 2024.

4. That despite multiple notices and reminders, 
   the respondent has failed to comply.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
AFFIDAVIT - RIGHT PAGE
═══════════════════════════════════════════

5. That I have suffered significant financial 
   losses as a result of said violation 
   amounting to Rs. 5,00,000/- (Five lakhs).

6. That all statements made herein are correct 
   and authentic and I am ready to prove the 
   same before the Honourable Court.

7. That I have not filed any other case 
   against the respondent in any other court.

DECLARATION:
I hereby declare that what is stated above is 
true and correct to the best of my knowledge 
and belief. I am making this affidavit for 
the purposes of justice and establishing my 
claim before this Honourable Court.

Signed and sworn before me at New Delhi
this 10th day of October, 2025.

_______________________________
Signature of Deponent
(Ram Kumar Singh)

_______________________________
Signature of Notary Public
Date: October 10, 2025

═══════════════════════════════════════════`
    },
    {
      title: 'COURT ORDER',
      caseNumber: 'LF-2024-001',
      leftPage: `═══════════════════════════════════════════
COURT ORDER - LEFT PAGE
═══════════════════════════════════════════

IN THE DISTRICT COURT
[Court Address, Purnea]

Case No.: LF-2024-001
Date: October 25, 2025

Hon'ble Justice (Name)
Presiding Officer

BETWEEN:
Petitioner ............................ Appellant
                    and
Respondent ....................... Respondent

ORDER:

Upon hearing both the counsel for petitioner 
and respondent and perusing the documents on 
record, the Court hereby passes the following 
order:

1. The petition is admitted for hearing on 
   merits and interim relief is granted.

2. Both parties are directed to file their 
   detailed written submissions within 14 days 
   from the date of this order.

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
COURT ORDER - RIGHT PAGE
═══════════════════════════════════════════

3. The respondent is directed not to cause 
   any further harm or damage to the petitioner 
   during the pendency of this case.

4. The respondent is also directed to deposit 
   50% of the claimed amount with the Court 
   registry as an interim measure within 30 
   days from the date of this order.

5. Next hearing is scheduled for November 15, 
   2025 at 10:00 AM in Court Hall A-3.

6. The parties are directed to maintain status 
   quo till the next hearing.

7. Both parties are directed to appear either 
   personally or through authorized counsel 
   on the date of next hearing.

It is so ordered.

                    _______________________________
                    (Signature)
                    Hon'ble Justice
                    
Date: October 25, 2025
Seal of Court: _______________

═══════════════════════════════════════════`
    },
    {
      title: 'EVIDENCE SUMMARY',
      caseNumber: 'LF-2024-001',
      leftPage: `═══════════════════════════════════════════
EVIDENCE SUMMARY - LEFT PAGE
═══════════════════════════════════════════

Case File: LF-2024-001
Prepared by: Adv. Ashish S Swar
Date: October 28, 2025

DOCUMENTARY EVIDENCE:

Exhibit A: Agreement dated June 15, 2024
    • Original contract between parties
    • Witnessed by two independent persons
    • Notarized on June 20, 2024
    • Value mentioned: Rs. 5,00,000/-
    • Terms and conditions clearly stated

Exhibit B: Communication Records
    • Email correspondence (15 documents)
    • WhatsApp chat logs (12 conversations)
    • SMS records (8 messages)
    • Registered letters (4 documents)
    • All duly authenticated

Exhibit C: Financial Records
    • Bank statements (June-Oct 2024)
    • Invoice copies (5 documents)
    • Payment receipts (3 documents)

═══════════════════════════════════════════`,
      rightPage: `═══════════════════════════════════════════
EVIDENCE SUMMARY - RIGHT PAGE
═══════════════════════════════════════════

Exhibit D: Photographs and Video
    • Scene documentation (25 photos)
    • Damage assessment (12 photos)
    • Timestamp verification available
    • Expert report attached

ORAL EVIDENCE:

Witness Statements:
    • Witness 1: Business Associate
    • Witness 2: Financial Advisor
    • Witness 3: Independent Observer
    
Expert Testimony:
    • Chartered Accountant (Financial audit)
    • Technical Expert (if required)

CHAIN OF CUSTODY:
All exhibits properly maintained and catalogued 
with proper chain of custody documentation as 
per law of evidence.

Verified by: Adv. Ashish S Swar
Court Seal: _______________
Date: October 28, 2025

═══════════════════════════════════════════`
    }
  ];

  const handleMouseMove = (e) => {
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

  const handleTouchMove = (e) => {
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

  const flipPage = (direction) => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => {
      if (direction === 'next' && currentPage < caseData.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
      setIsFlipping(false);
    }, 400);
  };

  if (!opened) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        {/* 3D Book Cover */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-pink-600 to-pink-400 opacity-20 rounded-2xl"></div>
          
          <div 
            className="relative w-96 h-[500px] bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center border-8 border-pink-500 cursor-pointer"
            onClick={() => setOpened(true)}
            style={{
              transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.1)`,
              transition: 'transform 0.2s ease-out'
            }}>
            
            {/* Left spine effect */}
            <div className="absolute left-0 top-0 w-4 h-full bg-black opacity-30 rounded-l-2xl"></div>
            
            {/* Book text */}
            <div className="text-center z-10">
              <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">LEGAL</h1>
              <h2 className="text-6xl font-black text-white mb-8 drop-shadow-lg">CASE</h2>
              <h3 className="text-5xl font-bold text-pink-100 mb-12 drop-shadow-lg">FILES</h3>
              
              <div className="border-t-2 border-b-2 border-white py-4 my-6">
                <p className="text-white text-xl font-semibold">Adv. Ashish S Swar</p>
                <p className="text-pink-100 text-base">B.COM, LL.B, M.A</p>
              </div>
              
              <p className="text-white text-base opacity-80">2024-2025</p>
            </div>
            
            {/* Right shadow effect */}
            <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-black to-transparent opacity-40 rounded-r-2xl"></div>
            
            {/* Click indicator */}
            <div className="absolute bottom-6 text-center">
              <p className="text-white font-bold text-base animate-bounce">CLICK TO OPEN</p>
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
          <h1 className="text-3xl font-bold">{caseData[currentPage].title}</h1>
          <p className="text-pink-100 text-sm">Case #{caseData[currentPage].caseNumber}</p>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="p-3 hover:bg-pink-700 rounded-lg transition transform hover:scale-110"
        >
          <X size={32} />
        </button>
      </div>

      {/* Book Container */}
      <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center px-8 py-6 gap-6">
        {/* Left Page */}
        <div className={`w-1/2 h-full bg-yellow-50 rounded-lg shadow-2xl p-10 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 -translate-x-12 rotate-y-45' : 'opacity-100 translate-x-0'} hover:shadow-pink-500/50`}>
          <div className="text-gray-800 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text">
            {caseData[currentPage].leftPage}
          </div>
          <div className="mt-8 pt-4 border-t-2 border-gray-400 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 1}</span>
          </div>
        </div>

        {/* Right Page */}
        <div className={`w-1/2 h-full bg-yellow-50 rounded-lg shadow-2xl p-10 overflow-y-auto transition-all duration-500 transform ${isFlipping ? 'opacity-50 translate-x-12 -rotate-y-45' : 'opacity-100 translate-x-0'} hover:shadow-pink-500/50`}>
          <div className="text-gray-800 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text">
            {caseData[currentPage].rightPage}
          </div>
          <div className="mt-8 pt-4 border-t-2 border-gray-400 text-center">
            <span className="text-xs text-gray-500 font-mono">Page {currentPage * 2 + 2}</span>
          </div>
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
          <p className="text-xl font-bold">File {currentPage + 1} of {caseData.length}</p>
          <p className="text-sm text-gray-400">Double Page Spread • Pages {currentPage * 2 + 1}-{currentPage * 2 + 2}</p>
        </div>

        <button
          onClick={() => flipPage('next')}
          disabled={currentPage === caseData.length - 1 || isFlipping}
          className="flex items-center gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-bold transform hover:scale-105"
        >
          Next
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}