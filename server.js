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

// Person details route
app.get('/person/:uid', (req, res) => {
    const uid = req.params.uid;
    const person = data.find((p) => p.UID === uid);
    if (person) {
      let html = `
        <link rel="stylesheet" href="/styles.css">
        <div class="person-details">
          <h1>${person.Name}</h1>
          <p><strong>Gender:</strong> <span id="gender">${person['M/F']}</span></p>
          <p><strong>Age:</strong> <span id="age">${person.Age || 'N/A'}</span></p>
          <p><strong>Occupation:</strong> <span id="occupation">${person.Occupation || 'N/A'}</span></p>
          <p><strong>Children:</strong> <span id="children">${person.Children || 'N/A'}</span></p>
          <p><strong>Children Condition:</strong> <span id="children-condition">${person['Children Condition'] || 'N/A'}</span></p>
          <p><strong>Current Problem:</strong> <span id="current-problem">${person['Current Problem'] || 'N/A'}</span></p>
          <p><strong>Phone:</strong> <span id="phone">${person.Phone}</span></p>
          <p><strong>Location:</strong> <span id="location">${person.Location}</span></p>
          <p><strong>Remarks:</strong> <span id="remarks">${person.Remarks}</span></p>
          <p><strong>Amount (2025):</strong> <span id="amount2025">${person['Amount (2025)'] || 'N/A'}</span></p>
          <p><strong>Given (2025):</strong> <span id="given2025">${person['Given (2025)'] || 'N/A'}</span></p>
          <p><strong>Amount (2024):</strong> <span id="amount2024">${person['Amount (2024)'] || 'N/A'}</span></p>
          <p><strong>Given (2024):</strong> <span id="given2024">${person['Given (2024)'] || 'N/A'}</span></p>

          <button onclick="enableEdit()">Edit</button>
          <form id="edit-form" style="display: none;" onsubmit="saveChanges(event, '${person.UID}')">
          <label for="edit-name">Name:</label>
            <input type="text" id="edit-name" value="${person['Name']}"><br>  
          <label for="edit-gender">Gender:</label>
            <input type="text" id="edit-gender" value="${person['M/F']}"><br>
            <label for="edit-age">Age:</label>
            <input type="text" id="edit-age" value="${person.Age || ''}"><br>
            <label for="edit-occupation">Occupation:</label>
            <input type="text" id="edit-occupation" value="${person.Occupation || ''}"><br>
            <label for="edit-children">Children:</label>
            <input type="text" id="edit-children" value="${person.Children || ''}"><br>
            <label for="edit-children-condition">Children Condition:</label>
            <input type="text" id="edit-children-condition" value="${person['Children Condition'] || ''}"><br>
            <label for="edit-current-problem">Current Problem:</label>
            <input type="text" id="edit-current-problem" value="${person['Current Problem'] || ''}"><br>
            <label for="edit-phone">Phone:</label>
            <input type="text" id="edit-phone" value="${person.Phone}"><br>
            <label for="edit-location">Location:</label>
            <input type="text" id="edit-location" value="${person.Location}"><br>
            <label for="edit-remarks">Remarks:</label>
            <input type="text" id="edit-remarks" value="${person.Remarks}"><br>
            <label for="edit-amount2025">Amount (2025):</label>
            <input type="text" id="edit-amount2025" value="${person['Amount (2025)'] || ''}"><br>
            <label for="edit-given2025">Given (2025):</label>
            <input type="text" id="edit-given2025" value="${person['Given (2025)'] || ''}"><br>
            <button type="submit">Save</button>
          </form>
          <a href="/" class="back-link">Back to Home</a>
        </div>
        <script src="/scripts.js"></script>`;
      res.send(html);
    } else {
      res.status(404).send('Person not found');
    }
  });



// Save changes route
app.post('/save/:uid', express.urlencoded({ extended: true }), (req, res) => {
    const uid = req.params.uid;
    const updatedData = req.body;
  
    // Find the person in the data array
    const personIndex = data.findIndex((p) => p.UID === uid);
    if (personIndex !== -1) {
      // Update the person's data
      data[personIndex] = { ...data[personIndex], ...updatedData };
  
      // Write the updated data back to the CSV file
      const csvData = [headerRow, ...data.map((row) => Object.values(row).join(','))].join('\n');
      fs.writeFileSync('Zakat All Years_yamin.xlsx - 2025.csv', csvData);
  
      res.redirect(`/person/${uid}`);
    } else {
      res.status(404).send('Person not found');
    }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});