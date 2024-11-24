function checkLoginStatus() {
  const token = localStorage.getItem("authToken");

  if (!token) {
      console.log('No token found. Redirecting to login page...');
      window.location.href = 'https://goly67.github.io/FlightPlannerLogin/';
      return;
  }

  // Validate the token with the server
  fetch('https://loginapilogger.glitch.me/api/validate-token', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
  })
  .then(response => {
      if (response.ok) {
          console.log('Token is valid. User is logged in.');
          return response.json(); // Optionally process the response
      } else {
          console.log('Invalid or expired token. Redirecting to login page...');
          localStorage.removeItem("authToken");
          localStorage.removeItem("userName");
          localStorage.removeItem("isLoggedIn");
          window.location.href = 'https://goly67.github.io/FlightPlannerLogin/';
      }
  })
  .catch(error => {
      console.error('Error validating token:', error);
      alert("An error occurred. Please log in again.");
      window.location.href = 'https://goly67.github.io/FlightPlannerLogin/';
  });
}

window.onload = function() {
  // Check if the user is logged in when the page loads
  checkLoginStatus();
};

function displayFlightPlans() {
    const flightPlansList = document.getElementById('flightPlansList');
    const flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
    if (flightPlans.length === 0) {
        flightPlansList.innerHTML = '<p class="no-plans">No flight plans submitted yet.</p>';
        return;
    }
    flightPlansList.innerHTML = flightPlans.map(plan => `
        <div class="flight-plan" id="plan-${plan.id}">
            <input type="checkbox" id="delete-${plan.id}"> 
            <h2>${plan.callsign} - ${plan.departure} to ${plan.arrival}</h2>
            <p><strong>Aircraft:</strong> ${plan.aircraft}</p>
            <p><strong>Flight Type:</strong> ${plan.flightRule}</p>
            <p><strong>SID:</strong> <span id="sid-display-${plan.id}">${plan.sid}</span></p>
            <p><strong>Cruising Level:</strong> ${plan.cruisingLevel}</p>
            <p><strong>Squawk:</strong> <span id="squawk-display-${plan.id}">${plan.squawk || 'Not assigned'}</span></p>
            <div class="edit-form">
                <label style="font-size: 130%; margin-top: -0.5rem;" for="sid-${plan.id}">SID:</label>
                <input type="text" id="sid-${plan.id}" value="${plan.sid}">
                <label style="margin-top: -0.5rem;" for="squawk-${plan.id}">Squawk:</label>
                <input style="font-size: 130%;" type="text" id="squawk-${plan.id}" value="${plan.squawk || ''}">
                <button style="margin-top: 1rem;" onclick="saveChanges(${plan.id})">Save Changes</button>
                <button class="delete-btn" onclick="deletePlan(${plan.id})">Delete Plan</button>
            </div>
        </div>
    `).join('');
}

function saveChanges(id) {
    let flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
    const updatedPlan = flightPlans.find(plan => plan.id === id);

    if (updatedPlan) {
        updatedPlan.sid = document.getElementById(`sid-${id}`).value;
        updatedPlan.squawk = document.getElementById(`squawk-${id}`).value;
        localStorage.setItem('flightPlans', JSON.stringify(flightPlans));

        document.getElementById(`sid-display-${id}`).textContent = updatedPlan.sid;
        document.getElementById(`squawk-display-${id}`).textContent = updatedPlan.squawk || 'Not assigned';

        alert('Flight plan updated successfully!');
    }
}

function deletePlan(id) {
    if (confirm('Are you sure you want to delete this flight plan?')) {
        let flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
        flightPlans = flightPlans.filter(plan => plan.id !== id);
        localStorage.setItem('flightPlans', JSON.stringify(flightPlans));

        const planElement = document.getElementById(`plan-${id}`);
        if (planElement) {
            planElement.remove();
        }

        if (flightPlans.length === 0) {
            document.getElementById('flightPlansList').innerHTML = '<p class="no-plans">No flight plans submitted yet.</p>';
        }

        alert('Flight plan deleted successfully!');
    }
}

function deleteSelectedPlans() {
    if (confirm('Are you sure you want to delete the selected flight plans?')) {
        let flightPlans = JSON.parse(localStorage.getItem('flightPlans')) || [];
        const selectedIds = [];
        for (let i = 0; i < flightPlans.length; i++) {
            if (document.getElementById(`delete-${flightPlans[i].id}`).checked) {
                selectedIds.push(flightPlans[i].id);
            }
        }
        flightPlans = flightPlans.filter(plan => !selectedIds.includes(plan.id));
        localStorage.setItem('flightPlans', JSON.stringify(flightPlans));

        selectedIds.forEach(id => {
            const planElement = document.getElementById(`plan-${id}`);
            if (planElement) {
                planElement.remove();
            }
        });

        if (flightPlans.length === 0) {
            document.getElementById('flightPlansList').innerHTML = '<p class="no-plans">No flight plans submitted yet.</p>';
        }
        alert('Selected flight plans deleted successfully!');
    }
}

function goToFlightPlanner() {
    window.location.href = 'https://goly67.github.io/FlightPlans';
}

displayFlightPlans();
