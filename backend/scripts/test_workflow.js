const API_URL = 'http://localhost:5001/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return await res.arrayBuffer();
}

async function runTest() {
  try {
    console.log("--- PART 6: FULL SYSTEM FLOW TEST ---");

    // 1. Admin login
    console.log("1. Admin Login...");
    let data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: "admin@vnr.edu", password: "admin123" })
    });
    const adminToken = data.token;
    console.log("   Admin login successful.");

    // 2. Create FacultyCoordinator, PoP, HOD
    console.log("2. Creating Users...");
    const fcData = { name: "Test FC", email: `fc_${Date.now()}@test.com`, password: "password", role: "FacultyCoordinator" };
    const popData = { name: "Test PoP", email: `pop_${Date.now()}@test.com`, password: "password", role: "PoP", honorariumRate: 10000 };
    const hodData = { name: "Test HOD", email: `hod_${Date.now()}@test.com`, password: "password", role: "HOD" };

    const authHeadersAdmin = { 'Authorization': `Bearer ${adminToken}` };
    const fcRes = await fetchAPI('/users', { method: 'POST', headers: authHeadersAdmin, body: JSON.stringify(fcData) });
    const popRes = await fetchAPI('/users', { method: 'POST', headers: authHeadersAdmin, body: JSON.stringify(popData) });
    const hodRes = await fetchAPI('/users', { method: 'POST', headers: authHeadersAdmin, body: JSON.stringify(hodData) });
    console.log("   Users created successfully.");

    // 3. Login as FacultyCoordinator
    console.log("3. FC Login...");
    data = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email: fcData.email, password: "password" }) });
    const fcToken = data.token;
    const authHeadersFC = { 'Authorization': `Bearer ${fcToken}` };
    console.log("   FC login successful.");

    // 4. Assign lecture (as FC)
    console.log("4. FC Assigning Lecture...");
    const lectureData = {
      topic: "Test Topic",
      subject: "Test Subject",
      subjectCode: "TS101",
      date: new Date().toISOString(),
      assigned_to: popRes._id
    };
    data = await fetchAPI('/lectures', { method: 'POST', headers: authHeadersFC, body: JSON.stringify(lectureData) });
    const lectureId = data._id;
    console.log("   Lecture created successfully! ID:", lectureId);

    // 5. Login as PoP and Accept lecture
    console.log("5. PoP Login & Accept Lecture...");
    data = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email: popData.email, password: "password" }) });
    const popToken = data.token;
    const authHeadersPoP = { 'Authorization': `Bearer ${popToken}` };
    await fetchAPI(`/lectures/${lectureId}/status`, { method: 'PUT', headers: authHeadersPoP, body: JSON.stringify({ status: "POP_APPROVED" }) });
    console.log("   Lecture accepted by PoP.");

    // 6. Login as HOD and Approve lecture
    console.log("6. HOD Login & Approve Lecture...");
    data = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email: hodData.email, password: "password" }) });
    const hodToken = data.token;
    const authHeadersHOD = { 'Authorization': `Bearer ${hodToken}` };
    await fetchAPI(`/lectures/${lectureId}/status`, { method: 'PUT', headers: authHeadersHOD, body: JSON.stringify({ status: "HOD_APPROVED" }) });
    console.log("   Lecture approved by HOD.");

    // 7. Mark lecture as CONDUCTED (as PoP)
    console.log("7. Marking Lecture as CONDUCTED (PoP)...");
    await fetchAPI(`/lectures/${lectureId}/status`, { method: 'PUT', headers: authHeadersPoP, body: JSON.stringify({ status: "CONDUCTED" }) });
    console.log("   Lecture marked as CONDUCTED.");

    // 8. Submit Activity Report (as PoP)
    console.log("8. Submit Activity Report (PoP)...");
    const reportData = { subject: "Test Subject", subjectCode: "TS101", topic: "Test Topic", hours: 2 };
    await fetchAPI('/reports/activity', { method: 'POST', headers: authHeadersPoP, body: JSON.stringify(reportData) });
    console.log("   Activity report submitted.");

    // 9. Generate Honorarium (as FC)
    console.log("9. Generate Honorarium (FC)...");
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    data = await fetchAPI('/honorariums/generate', { method: 'POST', headers: authHeadersFC, body: JSON.stringify({ pop_id: popRes._id, month: currentMonth, department: "CSE" }) });
    const honorariumId = data._id;
    console.log("   Honorarium generated! Amount:", data.amount);

    // 10. Download PDF (as PoP, or anyone. Just checking the API)
    console.log("10. Download PDF...");
    const pdfData = await fetchAPI(`/honorariums/${honorariumId}/pdf`, { method: 'GET', headers: authHeadersPoP });
    console.log("    PDF downloaded successfully! Size:", pdfData.byteLength, "bytes");

    // 11. Mark payment as PAID (as FC)
    console.log("11. Mark payment as PAID (FC)...");
    await fetchAPI(`/honorariums/${honorariumId}/status`, { method: 'PUT', headers: authHeadersFC, body: JSON.stringify({ status: "PAID", transactionDetails: "TXN12345" }) });
    console.log("    Payment marked as PAID.");

    console.log("✅ ALL TESTS PASSED! Entire system verified end-to-end.");

  } catch (err) {
    console.error("❌ TEST FAILED:", err.message);
    process.exit(1);
  }
}

runTest();
