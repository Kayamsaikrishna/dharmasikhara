import json
import sys
import os
sys.path.append('.')
from legal_ai import analyze_legal_document

# Read the extracted text from the PDF
# We'll simulate what the JavaScript code sends to the Python script
test_data = {
    "document_text": """“The Inventory That Changed Everything”
A Complete Narrative of the Rajesh Kumar Theft Case

Chapter 1: A Routine Morning

October 15, 2025, began like any other for Rajesh Kumar. He woke at 6:00 a.m. in his modest one-room apartment in the bustling neighborhood of Dharavi, Mumbai. As a daily wage laborer at a local factory, punctuality was not just a virtue but a necessity for job security. After a quick breakfast of tea and biscuits, Rajesh left for work, carrying his worn-out lunch box and a small inventory sheet – a habit he had maintained for years to keep track of his personal belongings.

The factory, a medium-scale textile manufacturing unit, was just a fifteen-minute walk from his home. Upon arrival, Rajesh joined his fellow workers in the daily routine, operating sewing machines and sorting fabrics. During his lunch break, he sat under a banyan tree near the factory premises, savoring his simple meal while reviewing his inventory sheet. Among the items listed were a few personal effects: a wristwatch (a gift from his late father), a small amount of cash, and a key to his locker at the factory.

As the day progressed, Rajesh noticed that his inventory sheet was missing. Initially, he dismissed it as a minor oversight, assuming he had misplaced it during his lunch break. However, as evening approached and he prepared to leave, a sense of unease settled in. The inventory sheet was more than just a piece of paper; it was his safeguard against theft, a meticulous record he had maintained for over five years without fail.

Upon returning home, Rajesh conducted a thorough search of his belongings. The watch was missing from his locker, along with a significant portion of his savings. The locker, secured with a simple combination lock, showed no signs of forced entry. This detail puzzled him – how could someone access his locker without the combination?

The next morning, Rajesh reported the incident to the factory management. The manager, Mr. Sharma, was sympathetic but reminded Rajesh that the factory bore no responsibility for personal belongings. Undeterred, Rajesh approached the local police station to file a report. The officer in charge, initially dismissive of what he considered a minor theft, became more attentive when Rajesh mentioned the missing inventory sheet.

Detective Inspector Mehta, assigned to the case, recognized the significance of the inventory sheet. In Rajesh's methodical approach to documenting his belongings, the sheet had become an inadvertent key to his personal security system. The thief, by obtaining this document, had gained insight into Rajesh's daily routine, his locker combination (possibly noted somewhere on the sheet), and the exact value of items stored.

The investigation took an unexpected turn when security footage from the factory revealed a suspicious individual near the locker area during Rajesh's lunch break. The footage was grainy, but Detective Mehta noticed the person picking up something from the ground – likely the dropped inventory sheet.

Further investigation led to the identification of the suspect: Ramesh, a former factory employee who had been dismissed six months earlier for disciplinary issues. Ramesh had been loitering around the factory premises, ostensibly visiting friends still employed there. His knowledge of the factory layout and Rajesh's habits, gained during his employment, made him a person of interest.

When questioned, Ramesh initially denied any involvement. However, when confronted with the security footage and the realization that his fingerprints might be on the inventory sheet, he confessed. He admitted to following Rajesh on multiple occasions, learning his routine, and opportunistically picking up the inventory sheet when Rajesh dropped it during his lunch break.

Ramesh's confession revealed a calculated crime. He had studied the inventory sheet over several days, noting the value of Rajesh's possessions and the pattern of his daily activities. The sheet, in Rajesh's careful handwriting, contained more information than its owner realized – including a note about the locker combination written in the margin, a detail Rajesh had added for his own convenience.

The case highlighted the double-edged nature of personal documentation. While Rajesh's inventory system was designed to protect his belongings, it inadvertently provided a blueprint for their theft. The recovered items, including the wristwatch and cash, were returned to Rajesh, but the psychological impact of the betrayal lingered.

Detective Mehta advised Rajesh to be more cautious with personal documents and suggested using a secure digital system for inventory management. The case was closed, but it served as a reminder that in an interconnected world, even the most well-intentioned security measures can have unforeseen vulnerabilities.

Epilogue

Rajesh's case became a topic of discussion in the local community, with many residents reviewing their own security practices. The factory management, prompted by the incident, installed additional security cameras and introduced a formal system for reporting lost items. Rajesh, though victimized, became an advocate for personal security awareness, sharing his experience to help others avoid similar pitfalls.

The inventory sheet that changed everything now rests in a safety deposit box, a reminder that in the digital age, even the simplest paper documents can hold the key to our personal security."""
}

# Test the analyze_legal_document function directly
print("Testing analyze_legal_document function directly...")
result = analyze_legal_document(test_data["document_text"])
print("Result:", json.dumps(result, indent=2))