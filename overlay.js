// Widget state management
const widgetStates = {
  IDLE: "idle",
  ALERT: "alert",
  SOCIAL: "social",
  SPONSOR: "sponsor",
  EVENT: "event",
};

// Queue to store pending states
let stateQueue = [];

// Current active state
let currentState = widgetStates.IDLE;

// State durations in milliseconds
const stateDurations = {
  [widgetStates.IDLE]: 0, // Always visible unless another state is active
  [widgetStates.ALERT]: 7000, // 7 seconds for alerts
  [widgetStates.SOCIAL]: 5000, // 5 seconds for social messages
  [widgetStates.SPONSOR]: 6000, // 6 seconds for sponsor messages
  [widgetStates.EVENT]: 5000, // 5 seconds for event messages
};

// Animation durations
const animationDuration = {
  resize: 300, // Container resize duration (matches the CSS transition)
  content: 200, // Content fade in/out duration
  delay: 200, // Delay between animations
};

// Reference to widget container and state containers
let widgetContainer;
let stateContainers = {};
let contentContainers = {};
let alertSound;

// Widget configuration from fields
let fieldData = {};
let sponsors = [];
let socials = [];

// Rotator slide duration
let rotatorSlideDuration = 5000; // Default 5s per slide

// Rotator states
let activeSocialRotation = false;
let activeSponsorRotation = false;
let activeEventRotation = false;

// Current indices for rotations
let currentSocialIndex = 0;
let currentSponsorIndex = 0;

// Alert GIFs collections
let alertGifs = {
  SUB: [],
  SUB_GIFT: [],
  SUB_COMMUNITY: [],
  SUB_FIRST: [],
  SUB_RESUB: [],
  FOLLOW: [],
  CHEER: [],
  TIP: [],
  RAID: [],
};

// Initialize the widget when loaded
window.addEventListener("onWidgetLoad", function (obj) {
  // Save field data for later use
  fieldData = obj.detail.fieldData;

  // Set rotator slide duration if provided
  if (fieldData.rotatorSlideDuration) {
    rotatorSlideDuration = fieldData.rotatorSlideDuration * 1000;
  }

  // Parse GIF JSON data
  try {
    if (fieldData.subGifsJson) {
      alertGifs.SUB = JSON.parse(fieldData.subGifsJson);
    }
    if (fieldData.subGiftGifsJson) {
      alertGifs.SUB_GIFT = JSON.parse(fieldData.subGiftGifsJson);
    }
    if (fieldData.subCommunityGifsJson) {
      alertGifs.SUB_COMMUNITY = JSON.parse(fieldData.subCommunityGifsJson);
    }
    if (fieldData.subFirstGifsJson) {
      alertGifs.SUB_FIRST = JSON.parse(fieldData.subFirstGifsJson);
    }
    if (fieldData.subResubGifsJson) {
      alertGifs.SUB_RESUB = JSON.parse(fieldData.subResubGifsJson);
    }
    if (fieldData.followGifsJson) {
      alertGifs.FOLLOW = JSON.parse(fieldData.followGifsJson);
    }
    if (fieldData.cheerGifsJson) {
      alertGifs.CHEER = JSON.parse(fieldData.cheerGifsJson);
    }
    if (fieldData.tipGifsJson) {
      alertGifs.TIP = JSON.parse(fieldData.tipGifsJson);
    }
    if (fieldData.raidGifsJson) {
      alertGifs.RAID = JSON.parse(fieldData.raidGifsJson);
    }
  } catch (e) {
    console.error("Error parsing GIF JSON:", e);
  }

  // Build sponsors array from individual inputs
  sponsors = buildSponsorsArray();

  // Build socials array from individual inputs
  socials = buildSocialsArray();

  // Update durations from field data
  if (fieldData.alertDuration) {
    stateDurations[widgetStates.ALERT] = fieldData.alertDuration * 1000;
  }
  if (fieldData.sponsorRotationInterval) {
    stateDurations[widgetStates.SPONSOR] =
      fieldData.sponsorRotationInterval * 1000;
  }
  if (fieldData.socialRotationInterval) {
    stateDurations[widgetStates.SOCIAL] =
      fieldData.socialRotationInterval * 1000;
  }
  if (fieldData.eventRotationInterval) {
    stateDurations[widgetStates.EVENT] = fieldData.eventRotationInterval * 1000;
  }

  // Get references to DOM elements
  widgetContainer = document.getElementById("widget-container");
  alertSound = document.getElementById("alert-sound");

  // Get references to all state containers
  stateContainers[widgetStates.ALERT] =
    document.getElementById("alert-container");
  stateContainers[widgetStates.SOCIAL] =
    document.getElementById("social-container");
  stateContainers[widgetStates.SPONSOR] =
    document.getElementById("sponsor-container");
  stateContainers[widgetStates.EVENT] =
    document.getElementById("event-container");

  // Get references to content containers
  contentContainers[widgetStates.ALERT] =
    document.querySelector(".alert-content");
  contentContainers[widgetStates.SOCIAL] =
    document.querySelector(".social-content");
  contentContainers[widgetStates.SPONSOR] =
    document.querySelector(".sponsor-content");
  contentContainers[widgetStates.EVENT] =
    document.querySelector(".event-content");

  // Apply custom styles from field data
  applyCustomStyles();

  // Set initial widget position
  if (fieldData.widgetPosition) {
    widgetContainer.className = `widget-position-${fieldData.widgetPosition}`;
  }

  // Set logo width
  if (fieldData.logoWidth) {
    const logo = document.getElementById("logo");
    if (logo) {
      logo.style.width = `${fieldData.logoWidth}%`;
    }
  }

  // Start rotations if enabled
  if (fieldData.enableRotations) {
    startRotations();
  }
});

// Build sponsors array from individual inputs
function buildSponsorsArray() {
  const sponsors = [];

  // Loop through potential sponsor entries
  for (let i = 1; i <= 5; i++) {
    const nameKey = `sponsor${i}Name`;
    const urlKey = `sponsor${i}Url`;

    if (fieldData[nameKey] && fieldData[urlKey]) {
      sponsors.push({
        name: fieldData[nameKey],
        image: fieldData[urlKey],
      });
    }
  }

  return sponsors;
}

// Build socials array from individual inputs
function buildSocialsArray() {
  const socials = [];

  // Loop through potential social entries
  for (let i = 1; i <= 5; i++) {
    const platformKey = `social${i}Platform`;
    const commandKey = `social${i}Command`;

    if (fieldData[platformKey] && fieldData[commandKey]) {
      socials.push({
        platform: fieldData[platformKey],
        command: fieldData[commandKey],
      });
    }
  }

  return socials;
}

// Apply custom styles from field data
function applyCustomStyles() {
  // Apply background color
  if (fieldData.backgroundColor) {
    widgetContainer.style.backgroundColor = fieldData.backgroundColor;
  }

  // Create and apply custom CSS
  let customStyles = document.createElement("style");

  // Build CSS string
  let css = "";

  if (fieldData.badgeColor) {
    css += ".badge { background-color: " + fieldData.badgeColor + "; }";
  }

  if (fieldData.badgeTextColor) {
    css += ".badge { color: " + fieldData.badgeTextColor + "; }";
  }

  if (fieldData.nameColor) {
    css += ".name { color: " + fieldData.nameColor + "; }";
  }

  if (fieldData.amountColor) {
    css += ".amount { color: " + fieldData.amountColor + "; }";
  }

  if (fieldData.messageColor) {
    css += ".message { color: " + fieldData.messageColor + "; }";
  }

  // Apply custom CSS from field data
  if (fieldData.customCSS) {
    css += fieldData.customCSS;
  }

  customStyles.innerHTML = css;
  document.head.appendChild(customStyles);
}

// Listen for events (alerts, etc.)
window.addEventListener("onEventReceived", function (obj) {
  const listener = obj.detail.listener;
  const event = obj.detail.event;

  // Handle different event types
  switch (listener) {
    case "subscriber-latest":
      if (fieldData.enableSubAlerts) {
        // Determine the subscription type
        let subType = "SUB";
        let subTypeText = "SUB";
        let gifType = "SUB";

        // Check if it's a gift subscription
        if (event.gifted) {
          subType = "SUB_GIFT";
          subTypeText = "GIFT SUB";
          gifType = "SUB_GIFT";
        }
        // Check if it's a community gift (multiple subs)
        else if (event.bulkGifted) {
          subType = "SUB_COMMUNITY";
          subTypeText = "COMMUNITY GIFT";
          gifType = "SUB_COMMUNITY";
        }
        // Check if it's a first-time subscription
        else if (event.amount <= 1) {
          subType = "SUB_FIRST";
          subTypeText = "NEW SUB";
          gifType = "SUB_FIRST";
        }
        // It's a resub (2+ months)
        else {
          subType = "SUB_RESUB";
          subTypeText = "RESUB";
          gifType = "SUB_RESUB";
        }

        // Use specific GIF if available, otherwise fallback to regular SUB GIF
        const gifUrl =
          alertGifs[gifType]?.length > 0
            ? getRandomGif(gifType)
            : getRandomGif("SUB");

        // Display the alert with the proper type
        showAlertState(
          subTypeText,
          event.name,
          event.amount,
          event.message,
          gifUrl,
          fieldData.subSoundUrl
        );
      }
      break;
    case "follower-latest":
      if (fieldData.enableFollowAlerts) {
        showAlertState(
          "FOLLOW",
          event.name,
          "",
          "",
          getRandomGif("FOLLOW"),
          fieldData.followSoundUrl
        );
      }
      break;
    case "cheer-latest":
      if (fieldData.enableCheerAlerts) {
        showAlertState(
          "CHEER",
          event.name,
          event.amount,
          event.message,
          getRandomGif("CHEER"),
          fieldData.cheerSoundUrl
        );
      }
      break;
    case "tip-latest":
      if (fieldData.enableTipAlerts) {
        showAlertState(
          "TIP",
          event.name,
          event.amount,
          event.message,
          getRandomGif("TIP"),
          fieldData.tipSoundUrl
        );
      }
      break;
    case "raid-latest":
      if (fieldData.enableRaidAlerts) {
        showAlertState(
          "RAID",
          event.name,
          event.amount,
          "",
          getRandomGif("RAID"),
          fieldData.raidSoundUrl
        );
      }
      break;
  }
});

// Get a random GIF from the collection for the alert type
function getRandomGif(alertType) {
  const gifs = alertGifs[alertType];

  // If no GIFs defined, return a default or fallback to SUB type
  if (!gifs || gifs.length === 0) {
    if (alertType.startsWith("SUB_") && alertGifs.SUB.length > 0) {
      // Fallback to generic SUB GIFs if specific type not available
      return getRandomGif("SUB");
    }
    return `https://i.imgur.com/default_${alertType
      .toLowerCase()
      .replace("_", "-")}.gif`;
  }

  // Return a random GIF from the collection
  const randomIndex = Math.floor(Math.random() * gifs.length);
  return gifs[randomIndex];
}

// Show a specific alert state with provided data
function showAlertState(type, name, amount, message, imageUrl, soundUrl) {
  const alertData = {
    state: widgetStates.ALERT,
    data: {
      type: type,
      name: name,
      amount: amount,
      message: message,
      image: imageUrl,
      sound: soundUrl,
    },
  };

  // Add to queue or show immediately if idle
  if (currentState === widgetStates.IDLE) {
    activateState(alertData);
  } else {
    stateQueue.push(alertData);
  }
}

// Play alert sound
function playAlertSound(soundUrl) {
  if (!soundUrl) return;

  try {
    // Set the source and volume
    alertSound.src = soundUrl;
    alertSound.volume = fieldData.alertVolume
      ? fieldData.alertVolume / 100
      : 0.5;

    // Play the sound
    alertSound.play().catch((e) => {
      console.error("Error playing alert sound:", e);
    });
  } catch (e) {
    console.error("Error setting up alert sound:", e);
  }
}

// Activate a specific state and update the UI
function activateState(stateData) {
  const { state, data } = stateData;

  // Save current state
  currentState = state;

  // Remove active class from all containers
  Object.keys(stateContainers).forEach((state) => {
    stateContainers[state].classList.remove("active");
  });

  // Update widget container class based on state
  widgetContainer.classList.remove(
    "alert-active",
    "social-active",
    "sponsor-active",
    "event-active"
  );

  // Update content based on state type
  switch (state) {
    case widgetStates.ALERT:
      // Update alert content
      const badgeElement = document.querySelector("#alert-container .badge");
      badgeElement.textContent = `${data.type}`;

      // Add data-type attribute for custom styling based on alert type
      badgeElement.setAttribute("data-type", data.type);

      document.querySelector("#alert-container .name").innerText = data.name;

      // Modified amount display based on alert type
      const amountElement = document.querySelector("#alert-container .amount");
      if (data.type === "TIP") {
        // For tips: display "amount PLN {{currency}}"
        amountElement.innerText = data.amount
          ? `${data.amount} PLN `
          : "";
      } else if (data.type === "FOLLOW") {
        // For follows: display "Dzięki za follow"
        amountElement.innerText = "Dzięki za follow";
      } else {
        // For other types: keep the original format
        amountElement.innerText = data.amount ? `x ${data.amount}` : "";
      }

      document.querySelector("#alert-container .message").innerText =
        data.message || "";

      // Update alert image
      const alertImage = document.getElementById("alert-image");
      if (alertImage && data.image) {
        alertImage.src = data.image;
      }

      // Play alert sound if available
      if (data.sound) {
        playAlertSound(data.sound);
      }

      // First, add the class to resize the container
      widgetContainer.classList.add("alert-active");
      break;

    case widgetStates.SOCIAL:
      // Update social content
      document.querySelector("#social-container .social-name").innerText =
        data.platform;
      document.querySelector("#social-container .badge").innerText =
        data.command || "Napisz na czacie";
      widgetContainer.classList.add("social-active");
      break;

    case widgetStates.SPONSOR:
      // Update sponsor content
      document.querySelector("#sponsor-container .sponsor-name").innerText =
        data.name;
      widgetContainer.classList.add("sponsor-active");
      break;

    case widgetStates.EVENT:
      // Update event content
      document.querySelector("#event-container .name").innerText = data.name;
      document.querySelector("#event-container .amount").innerText = data.amount
        ? `x ${data.amount}`
        : "";
      widgetContainer.classList.add("event-active");
      break;
  }

  // Make the state container visible
  stateContainers[state].classList.add("active");

  // Wait for container resize, then show content
  setTimeout(() => {
    // Show the content with animation
    if (contentContainers[state]) {
      contentContainers[state].classList.add("active");
    }

    // Schedule state deactivation after duration
    if (state !== widgetStates.IDLE) {
      // For rotating content, deactivation is handled by their respective functions
      if (
        !activeSocialRotation &&
        !activeSponsorRotation &&
        !activeEventRotation
      ) {
        setTimeout(() => deactivateState(), stateDurations[state]);
      }
    }
  }, animationDuration.resize);
}

// Deactivate current state and check queue for next state
function deactivateState() {
  // If we're in the middle of a rotation, don't deactivate
  if (
    (activeSocialRotation && currentState === widgetStates.SOCIAL) ||
    (activeSponsorRotation && currentState === widgetStates.SPONSOR) ||
    (activeEventRotation && currentState === widgetStates.EVENT)
  ) {
    return;
  }

  // Stop sound if it's playing
  if (alertSound && !alertSound.paused) {
    alertSound.pause();
    alertSound.currentTime = 0;
  }

  // First, hide the content
  if (contentContainers[currentState]) {
    contentContainers[currentState].classList.remove("active");
  }

  // Wait for content to hide, then resize container
  setTimeout(() => {
    // Remove active class from state container
    stateContainers[currentState].classList.remove("active");

    // Resize container back to idle size
    widgetContainer.classList.remove(
      "alert-active",
      "social-active",
      "sponsor-active",
      "event-active"
    );

    // Wait for resize animation to finish
    setTimeout(() => {
      // Update current state
      currentState = widgetStates.IDLE;

      // Check if there are any states in queue
      if (stateQueue.length > 0) {
        // Get next state from queue
        const nextState = stateQueue.shift();

        // Activate next state after a small delay
        setTimeout(() => activateState(nextState), 500);
      }
    }, animationDuration.resize);
  }, animationDuration.content);
}

// Start rotations between social, sponsor, and event states
function startRotations() {
  // Sponsor rotation (highest priority)
  if (fieldData.enableSponsorRotator && sponsors.length > 0) {
    setInterval(() => {
      // Only start rotation if we're idle
      if (currentState === widgetStates.IDLE && !activeSponsorRotation) {
        activeSponsorRotation = true;
        currentSponsorIndex = 0;

        // Start showing sponsors
        showNextSponsor();
      }
    }, fieldData.sponsorRotationInterval * 1000 || 120000);
  }

  // Social rotation (second priority)
  if (fieldData.enableSocialRotator && socials.length > 0) {
    setInterval(() => {
      // Only start rotation if we're idle
      if (currentState === widgetStates.IDLE && !activeSocialRotation) {
        activeSocialRotation = true;
        currentSocialIndex = 0;

        // Start showing socials
        showNextSocial();
      }
    }, fieldData.socialRotationInterval * 1000 || 180000);
  }

  // Event rotation (lowest priority)
  if (fieldData.enableEventRotator) {
    setInterval(() => {
      // Only show if we're idle
      if (currentState === widgetStates.IDLE && !activeEventRotation) {
        // We'll expand this in the future
        // Example for now - show latest sub
        const sessionData = SE_API.store.session;

        if (sessionData && sessionData["subscriber-latest"]) {
          activeEventRotation = true;
          const latestSub = sessionData["subscriber-latest"];

          const eventData = {
            state: widgetStates.EVENT,
            data: {
              name: latestSub.name,
              amount: latestSub.amount,
            },
          };

          activateState(eventData);

          // After the event duration, deactivate event and rotation
          setTimeout(() => {
            deactivateState();
            activeEventRotation = false;
          }, stateDurations[widgetStates.EVENT]);
        }
      }
    }, fieldData.eventRotationInterval * 1000 || 300000);
  }
}

// Show next sponsor in rotation
function showNextSponsor() {
  // Check if we should continue rotation
  if (!activeSponsorRotation || currentSponsorIndex >= sponsors.length) {
    activeSponsorRotation = false;
    if (currentState === widgetStates.SPONSOR) {
      deactivateState();
    }
    return;
  }

  // Get current sponsor
  const currentSponsor = sponsors[currentSponsorIndex];

  if (currentSponsor) {
    // If already in sponsor state, just update content
    if (currentState === widgetStates.SPONSOR) {
      const sponsorNameEl = document.querySelector(
        "#sponsor-container .sponsor-name"
      );

      // Hide content first
      contentContainers[widgetStates.SPONSOR].classList.remove("active");

      // After animation completes, update and show again
      setTimeout(() => {
        sponsorNameEl.innerText = currentSponsor.name;
        contentContainers[widgetStates.SPONSOR].classList.add("active");
      }, animationDuration.content);
    } else {
      // Activate new sponsor state
      const sponsorData = {
        state: widgetStates.SPONSOR,
        data: {
          name: currentSponsor.name,
          image: currentSponsor.image,
        },
      };

      activateState(sponsorData);
    }

    // Increment to next sponsor
    currentSponsorIndex++;

    // Schedule next sponsor after slide duration
    setTimeout(showNextSponsor, rotatorSlideDuration);
  } else {
    activeSponsorRotation = false;
    if (currentState === widgetStates.SPONSOR) {
      deactivateState();
    }
  }
}

// Show next social in rotation
function showNextSocial() {
  // Check if we should continue rotation
  if (!activeSocialRotation || currentSocialIndex >= socials.length) {
    activeSocialRotation = false;
    if (currentState === widgetStates.SOCIAL) {
      deactivateState();
    }
    return;
  }

  // Get current social
  const currentSocial = socials[currentSocialIndex];

  if (currentSocial) {
    // If already in social state, just update content
    if (currentState === widgetStates.SOCIAL) {
      const socialNameEl = document.querySelector(
        "#social-container .social-name"
      );
      const socialBadgeEl = document.querySelector("#social-container .badge");

      // Hide content first
      contentContainers[widgetStates.SOCIAL].classList.remove("active");

      // After animation completes, update and show again
      setTimeout(() => {
        socialNameEl.innerText = currentSocial.platform;
        socialBadgeEl.innerText = currentSocial.command || "Napisz na czacie";
        contentContainers[widgetStates.SOCIAL].classList.add("active");
      }, animationDuration.content);
    } else {
      // Activate new social state
      const socialData = {
        state: widgetStates.SOCIAL,
        data: {
          platform: currentSocial.platform,
          command: currentSocial.command,
        },
      };

      activateState(socialData);
    }

    // Increment to next social
    currentSocialIndex++;

    // Schedule next social after slide duration
    setTimeout(showNextSocial, rotatorSlideDuration);
  } else {
    activeSocialRotation = false;
    if (currentState === widgetStates.SOCIAL) {
      deactivateState();
    }
  }
}
