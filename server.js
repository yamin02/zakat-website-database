const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = 5000;

// Serve static files (CSS, JS, etc.)
app.use(express.static('public'));

// Parse CSV file into an array of objects
const data = [];
let headerRow = '';

fs.createReadStream('Zakat All Years_yamin.xlsx - 2025.csv')
  .pipe(csv())
  .on('headers', (headers) => {
    // Store the header row
    headerRow = headers.join(',');
  })
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Homepage route - Display list of names
app.get('/', (req, res) => {
  // Calculate totals
  const totalPersonsPaid = data.filter((person) => person['Amount (2025)'] && person['Amount (2025)'].trim() !== '').length;
  const totalAmountPaid = data.reduce((sum, person) => {
    const amount = parseFloat(person['Amount (2025)']) || 0;
    return sum + amount;
  }, 0);

  let html = `
    <link rel="stylesheet" href="/styles.css">
    <div class="header">
      <h1>Villagers Taking Zakat (2025)</h1>
      <div class="totals">
        <p>Total Persons Paid: <strong>${totalPersonsPaid}</strong></p>
        <p>Total Amount Paid: <strong>${totalAmountPaid.toFixed(2)}</strong></p>
      </div>
      <a href="/add-new"><button id="add-new-button">Add New Entries</button></a>
    </div>
    <div class="search-container">
      <input type="text" id="search" placeholder="Search by name, UID, gender, or location..." oninput="filterNames()">
      <div id="search-result-count"></div>
    </div>
    <ul id="name-list">`;
  data.forEach((person) => {
    const hasAmount = person['Amount (2025)'] && person['Amount (2025)'].trim() !== '';
    html += `
      <li id="UID-${person.UID}" class="${hasAmount ? 'has-amount' : ''}">
        <a href="/person/${person.UID}">${person.Name}</a>
        <div class="uid"><strong>UID:</strong> ${person.UID}</div>
        <div class="Gender"><strong>M/F:</strong> ${person['M/F']}</div>
        <div class="location"><strong>Location:</strong> ${person.Location}</div>
        <div class="remarks"><strong>Remarks:</strong> ${person.Remarks}</div>
      </li>`;
  });
  html += `</ul>
    <script src="/scripts.js"></script>`;
  res.send(html);
});

// Route to handle "Add New Entries" button
app.get('/add-new', (req, res) => {
  // Generate the next UID
  const maxUID = data.reduce((max, person) => Math.max(max, parseInt(person.UID)), 0);
  const newUID = (maxUID + 1).toString();

  // Redirect to the person details page with the new UID
  res.redirect(`/person/${newUID}`);
});

// Person details route
app.get('/person/:uid', (req, res) => {
    const uid = req.params.uid;
    const person = data.find((p) => p.UID === uid);
  
    // If the person doesn't exist, create a new empty person object
    const isNewPerson = !person;
    const personData = person || {
      UID: uid,
      Name: '',
      'M/F': '',
      Phone: '',
      Location: '',
      Remarks: '',
      'Amount (2025)': '',
      'Given (2025)': '',
      Age: '',
      Occupation: '',
      Children: '',
      'Children Condition': '',
      'Current Problem': '',
      'Amount (2024)': '',
      'Given (2024)': '',
      'Amount with charge': '',
      'given / not  (2022)': '',
      'amount (2022)': ''
    };
  
    let html = `
      <link rel="stylesheet" href="/styles.css">
      <div class="person-details">
        <h1>${isNewPerson ? 'Add New Person' : personData.Name}</h1>
        <div class="details-container">
          <!-- Name -->
          <div class="detail-item">
            <strong>Name:</strong>
            <span id="name">${personData.Name}</span>
            <input type="text" id="edit-name" value="${personData.Name}" style="display: none;">
            <button onclick="toggleEdit('name')">Edit</button>
          </div>
          <!-- Gender -->
          <div class="detail-item">
            <strong>Gender:</strong>
            <span id="gender">${personData['M/F']}</span>
            <input type="text" id="edit-gender" value="${personData['M/F']}" style="display: none;">
            <button onclick="toggleEdit('gender')">Edit</button>
          </div>
          <!-- Phone -->
          <div class="detail-item">
            <strong>Phone:</strong>
            <span id="phone">${personData.Phone}</span>
            <input type="text" id="edit-phone" value="${personData.Phone}" style="display: none;">
            <button onclick="toggleEdit('phone')">Edit</button>
          </div>
          <!-- Location -->
          <div class="detail-item">
            <strong>Location:</strong>
            <span id="location">${personData.Location}</span>
            <input type="text" id="edit-location" value="${personData.Location}" style="display: none;">
            <button onclick="toggleEdit('location')">Edit</button>
          </div>
          <!-- Remarks -->
          <div class="detail-item">
            <strong>Remarks:</strong>
            <span id="remarks">${personData.Remarks}</span>
            <input type="text" id="edit-remarks" value="${personData.Remarks}" style="display: none;">
            <button onclick="toggleEdit('remarks')">Edit</button>
          </div>
          <!-- Amount (2025) -->
          <div class="detail-item">
            <strong>Amount (2025):</strong>
            <span id="amount2025">${personData['Amount (2025)']}</span>
            <input type="text" id="edit-amount2025" value="${personData['Amount (2025)']}" style="display: none;">
            <button onclick="toggleEdit('amount2025')">Edit</button>
          </div>
          <!-- Given (2025) -->
          <div class="detail-item">
            <strong>Given (2025):</strong>
            <span id="given2025">${personData['Given (2025)']}</span>
            <input type="text" id="edit-given2025" value="${personData['Given (2025)']}" style="display: none;">
            <button onclick="toggleEdit('given2025')">Edit</button>
          </div>
          <!-- Age -->
          <div class="detail-item">
            <strong>Age:</strong>
            <span id="age">${personData.Age}</span>
            <input type="text" id="edit-age" value="${personData.Age}" style="display: none;">
            <button onclick="toggleEdit('age')">Edit</button>
          </div>
          <!-- Occupation -->
          <div class="detail-item">
            <strong>Occupation:</strong>
            <span id="occupation">${personData.Occupation}</span>
            <input type="text" id="edit-occupation" value="${personData.Occupation}" style="display: none;">
            <button onclick="toggleEdit('occupation')">Edit</button>
          </div>
          <!-- Children -->
          <div class="detail-item">
            <strong>Children:</strong>
            <span id="children">${personData.Children}</span>
            <input type="text" id="edit-children" value="${personData.Children}" style="display: none;">
            <button onclick="toggleEdit('children')">Edit</button>
          </div>
          <!-- Children Condition -->
          <div class="detail-item">
            <strong>Children Condition:</strong>
            <span id="children-condition">${personData['Children Condition']}</span>
            <input type="text" id="edit-children-condition" value="${personData['Children Condition']}" style="display: none;">
            <button onclick="toggleEdit('children-condition')">Edit</button>
          </div>
          <!-- Current Problem -->
          <div class="detail-item">
            <strong>Current Problem:</strong>
            <span id="current-problem">${personData['Current Problem']}</span>
            <input type="text" id="edit-current-problem" value="${personData['Current Problem']}" style="display: none;">
            <button onclick="toggleEdit('current-problem')">Edit</button>
          </div>
        </div>
        <button class=saveChanges onclick="saveChanges('${uid}')">Save</button>
        <a href="/" class="back-link">Back to Home</a>
      </div>
      <script src="/scripts.js"></script>`;
    res.send(html);
  });

// Save changes route (handles both new and existing entries)
app.post('/save/:uid', express.urlencoded({ extended: true }), (req, res) => {
  const uid = req.params.uid;
  const updatedData = req.body;

  // Find the person in the data array
  const personIndex = data.findIndex((p) => p.UID === uid);

  if (personIndex !== -1) {
    // Update existing person's data
    data[personIndex] = { ...data[personIndex], ...updatedData };
  } else {
    // Add new person to the data array
    data.push({ UID: uid, ...updatedData });
  }

  // Write the updated data back to the CSV file
  const csvData = [headerRow, ...data.map((row) => Object.values(row).join(','))].join('\n');
  fs.writeFileSync('Zakat All Years_yamin.xlsx - 2025.csv', csvData);

  // Redirect to the person's details page
  res.redirect(`/person/${uid}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});