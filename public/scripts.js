function filterNames() {
    const input = document.getElementById('search').value.toLowerCase();
    const list = document.getElementById('name-list').getElementsByTagName('li');
    let visibleCount = 0;
  
    for (let i = 0; i < list.length; i++) {
      const nameElement = list[i].getElementsByTagName('a')[0];
      const uidElement = list[i].querySelector('.uid');
      const genderElement = list[i].querySelector('.Gender');
      const locationElement = list[i].querySelector('.location');
  
      const name = nameElement.textContent.toLowerCase();
      const uid = uidElement.textContent.toLowerCase();
      const gender = genderElement.textContent.toLowerCase();
      const location = locationElement.textContent.toLowerCase();
  
      // Check if any of the fields match the search input
      if (
        name.includes(input) ||
        uid.includes(input) ||
        gender.includes(input) ||
        location.includes(input)
      ) {
        list[i].style.display = '';
        visibleCount++;
        // Highlight matching text in the name
        const regex = new RegExp(input, 'gi');
        nameElement.innerHTML = nameElement.textContent.replace(regex, (match) => `<span class="highlight">${match}</span>`);
      } else {
        list[i].style.display = 'none';
      }
    }
  
    // Update the search result count
    const searchResultCount = document.getElementById('search-result-count');
    searchResultCount.textContent = `Results: ${visibleCount}`;
  }

  function enableEdit() {
    document.getElementById('edit-form').style.display = 'block';
  }
  
  // Toggle between read-only and edit mode
function toggleEdit(field) {
    const span = document.getElementById(field);
    const input = document.getElementById(`edit-${field}`);
    const button = span.nextElementSibling.nextElementSibling;
  
    if (span.style.display === 'none') {
      // Switch back to read-only mode
      span.style.display = 'inline';
      input.style.display = 'none';
      button.textContent = 'Edit';
    } else {
      // Switch to edit mode
      span.style.display = 'none';
      input.style.display = 'inline';
      input.focus();
      button.textContent = 'Cancel';
    }
  }
  
  // Save changes
  function saveChanges(uid) {
    const updatedData = {
      Name: document.getElementById('edit-name').value,
      'M/F': document.getElementById('edit-gender').value,
      Phone: document.getElementById('edit-phone').value,
      Location: document.getElementById('edit-location').value,
      Remarks: document.getElementById('edit-remarks').value,
      'Amount (2025)': document.getElementById('edit-amount2025').value,
      'Given (2025)': document.getElementById('edit-given2025').value,
      Age: document.getElementById('edit-age').value,
      Occupation: document.getElementById('edit-occupation').value,
      Children: document.getElementById('edit-children').value,
      'Children Condition': document.getElementById('edit-children-condition').value,
      'Current Problem': document.getElementById('edit-current-problem').value,
    };
  
    fetch(`/save/${uid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(updatedData),
    }).then(() => {
      window.location.reload(); // Reload the page to reflect changes
    });
  }



  // Show the Add New Entries form
function showAddForm() {
    document.getElementById('add-form-popup').style.display = 'block';
  }
  
  // Hide the Add New Entries form
  function hideAddForm() {
    document.getElementById('add-form-popup').style.display = 'none';
  }
  
  // Close the form if the user clicks outside of it
  window.onclick = function (event) {
    const popup = document.getElementById('add-form-popup');
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  };

