from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, ListFlowable, ListItem
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.units import inch
import re

md_path = Path(r"c:\Users\Ganesh Daware\PageForge\Page-Forge\PageForge_Interview_QA.md")
pdf_path = Path(r"c:\Users\Ganesh Daware\PageForge\Page-Forge\PageForge_Interview_QA.pdf")

text = md_path.read_text(encoding='utf-8')

# Split into lines
lines = text.splitlines()

styles = getSampleStyleSheet()

# Avoid redefining styles that may already exist in the base stylesheet
for name, spec in [
    ('Heading1', dict(parent=styles['Title'], fontName='Helvetica-Bold', fontSize=20, leading=24, spaceAfter=10, textColor=colors.HexColor('#111827'))),
    ('Heading2', dict(parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=13, leading=16, spaceAfter=6, textColor=colors.HexColor('#1f2937'))),
    ('Heading3', dict(parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=11.5, leading=14, spaceAfter=4, textColor=colors.HexColor('#374151'))),
    ('Body', dict(parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5, leading=12.5, spaceAfter=4, textColor=colors.HexColor('#111827'))),
    ('Answer', dict(parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5, leading=12.5, spaceAfter=6, textColor=colors.HexColor('#111827'))),
    ('Bold', dict(parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=9.5, leading=12.5, spaceAfter=4, textColor=colors.HexColor('#111827'))),
]:
    if name not in styles: 
        styles.add(ParagraphStyle(name=name, **spec))

story = []

for line in lines:
    if not line.strip():
        story.append(Spacer(1, 4))
        continue

    if line.startswith('# '):
        story.append(Paragraph(line[2:], styles['Heading1']))
    elif line.startswith('## '):
        story.append(Paragraph(line[3:], styles['Heading2']))
    elif line.startswith('### '):
        story.append(Paragraph(line[4:], styles['Heading3']))
    elif line.startswith('**Answer:**') or line.startswith('**Interviewer:**'):
        story.append(Paragraph(line.replace('**', ''), styles['Answer']))
    elif line.startswith('**Follow-up:**'):
        story.append(Paragraph(line.replace('**', ''), styles['Bold']))
    elif line.startswith('**Follow-up:'):
        story.append(Paragraph(line.replace('**', ''), styles['Bold']))
    else:
        # Handle bullet-like lines and preserve text
        content = line.strip()
        if content.startswith('- '):
            story.append(Paragraph(content[2:], styles['Body']))
        else:
            story.append(Paragraph(content, styles['Body']))

story.append(Spacer(1, 12))

# Write PDF
doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, rightMargin=0.7*inch, leftMargin=0.7*inch, topMargin=0.7*inch, bottomMargin=0.7*inch)
doc.build(story)
print(f'PDF created: {pdf_path}')
