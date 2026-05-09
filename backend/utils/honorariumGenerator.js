const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const numberToWords = require('number-to-words');
const Honorarium = require('../models/Honorarium');
const ActivityReport = require('../models/ActivityReport');
const User = require('../models/User');

const calculateAndGenerate = async (popId, month, year, department = 'CSE') => {
  try {
    const pop = await User.findById(popId);
    if (!pop) throw new Error('PoP not found');

    const ratePerSession = pop.honorariumRate || (pop.role === 'AssistantPoP' ? 5000 : 10000);

    // Calculate total sessions from HOD_APPROVED activities in the selected month
    const startOfMonth = new Date(`${year}-${month}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

    const approvedActivitiesCount = await ActivityReport.countDocuments({
      pop_id: popId,
      status: 'HOD_APPROVED',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalAmount = approvedActivitiesCount * ratePerSession;
    
    // Amount in words
    const amountInWords = totalAmount > 0 
      ? `Rupees ${numberToWords.toWords(totalAmount).replace(/-/g, ' ').toUpperCase()} ONLY`
      : 'ZERO RUPEES';

    const joinDate = pop.createdAt ? new Date(pop.createdAt).toLocaleDateString('en-IN') : 'Date of Joining';
    const monthYear = `${startOfMonth.toLocaleString('default', { month: 'long' })} ${year}`;
    const todayStr = new Date().toLocaleDateString('en-IN');

    // Generate HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px; color: #000; margin: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .subject { font-weight: bold; margin: 20px 0; }
  .box { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 20px 0; font-weight: bold; }
  .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
</style>
</head>
<body>
  <div class="header">
    <div>Date : ${todayStr}</div>
    <div>Place : Hyderabad</div>
  </div>

  <div>
    To,<br/>
    The Principal,<br/>
    VNR VJIET, Hyderabad.
  </div>

  <div style="margin-top: 20px;">Respected Sir,</div>

  <div class="subject">
    Sub: Honorarium for ${pop.name}, Professor of Practice, ${department}<br/>
    for the Month of ${monthYear} - Reg.
  </div>

  <div>
    ${pop.name} joined as Professor of Practice in the Department of ${department}<br/>
    on ${joinDate}. He/She is guiding students and faculty towards projects<br/>
    with innovative technologies.
  </div>

  <div style="margin-top: 15px;">
    Approval was taken for professional consultancy charges of<br/>
    Rs.${ratePerSession}/- per visit.
  </div>

  <div style="margin-top: 15px;">
    Professional Consultancy Charges for ${approvedActivitiesCount} visits -&gt; Rs.${totalAmount}
  </div>

  <div class="box">
    Total amount -&gt; Rs.${totalAmount}/-
  </div>

  <div>
    I request you to sanction an amount of Rs.${totalAmount}/-<br/>
    (${amountInWords}) towards Professional Consultancy Charges<br/>
    of ${pop.name}.
  </div>

  <div style="margin-top: 20px;">
    Bank: ${pop.bankDetails?.bankName || 'N/A'}<br/>
    Name: ${pop.name}<br/>
    A/C: ${pop.bankDetails?.accountNumber || 'N/A'}<br/>
    IFSC: ${pop.bankDetails?.IFSC || 'N/A'}
  </div>

  <div style="margin-top: 30px;">Yours Truly,</div>

  <div class="signatures">
    <div>Coordinator Signature</div>
    <div>HOD Signature</div>
  </div>

  <div style="margin-top: 40px; font-weight: bold;">
    Attachments:<br/>
    1. List of visits and work done
  </div>
</body>
</html>
`;

    const pdfDir = path.join(__dirname, '../public/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFilename = `Honorarium_${pop.name.replace(/\\s+/g, '_')}_${month}_${year}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFilename);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: pdfPath, format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();

    // Upsert Honorarium
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    let honorarium = await Honorarium.findOne({ pop_id: popId, month: monthStr });

    if (!honorarium) {
      honorarium = new Honorarium({
        pop_id: popId,
        pop: popId,
        month: monthStr,
        year: year.toString(),
        department,
      });
    }

    honorarium.pop = popId;
    honorarium.lecture = 'Activities'; 
    honorarium.year = year.toString();
    honorarium.totalSessions = approvedActivitiesCount;
    honorarium.ratePerSession = ratePerSession;
    honorarium.amount = totalAmount;
    honorarium.totalAmount = totalAmount;
    honorarium.amountInWords = amountInWords;
    honorarium.generatedLetterHTML = htmlContent;
    honorarium.generatedPDFPath = `/public/pdfs/${pdfFilename}`;
    honorarium.status = 'GENERATED';

    await honorarium.save();
    return honorarium;

  } catch (error) {
    console.error('Error generating honorarium:', error);
    throw error;
  }
};

module.exports = { calculateAndGenerate };
