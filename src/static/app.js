document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const title = document.createElement("h4");
        title.textContent = name;

        const description = document.createElement("p");
        description.textContent = details.description;

        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule:";
        schedule.appendChild(scheduleLabel);
        schedule.append(` ${details.schedule}`);

        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability:";
        availability.appendChild(availabilityLabel);
        availability.append(` ${spotsLeft} spots left`);

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants.length === 0) {
          const emptyItem = document.createElement("li");
          emptyItem.className = "participants-empty";
          emptyItem.textContent = "No participants yet";
          participantsList.appendChild(emptyItem);
        } else {
          details.participants.forEach((participantEmail) => {
            const participantItem = document.createElement("li");

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = participantEmail;

            const unregisterButton = document.createElement("button");
            unregisterButton.type = "button";
            unregisterButton.className = "participant-delete-button";
            unregisterButton.innerHTML = "&times;";
            unregisterButton.setAttribute("aria-label", `Unregister ${participantEmail} from ${name}`);

            unregisterButton.addEventListener("click", async () => {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(participantEmail)}`,
                  {
                    method: "DELETE",
                  }
                );

                const result = await response.json();

                if (response.ok) {
                  showMessage(result.message, "success");
                  fetchActivities();
                } else {
                  showMessage(result.detail || "An error occurred", "error");
                }
              } catch (error) {
                showMessage("Failed to unregister participant. Please try again.", "error");
                console.error("Error unregistering participant:", error);
              }
            });

            participantItem.appendChild(emailSpan);
            participantItem.appendChild(unregisterButton);
            participantsList.appendChild(participantItem);
          });
        }

        participantsSection.appendChild(participantsHeading);
        participantsSection.appendChild(participantsList);

        activityCard.appendChild(title);
        activityCard.appendChild(description);
        activityCard.appendChild(schedule);
        activityCard.appendChild(availability);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
