from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_simple_pdf():
    # Create a simple PDF file
    c = canvas.Canvas("simple_test.pdf", pagesize=letter)
    width, height = letter
    
    # Add some text
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 100, "This is a simple test PDF document.")
    c.drawString(100, height - 120, "It contains some basic text for testing PDF extraction.")
    c.drawString(100, height - 140, "The PDF parser should be able to extract this content.")
    
    # Save the PDF
    c.save()
    print("Simple test PDF created successfully!")

if __name__ == "__main__":
    create_simple_pdf()