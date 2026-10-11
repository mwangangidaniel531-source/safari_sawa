
"use strict";

// Safiri Sawa Transport WhatsApp number.
// 0115894399 becomes 254115894399 in international format.
const WHATSAPP_NUMBER = "254115894399";

const $ = (id) => document.getElementById(id);

// ==================================
// FARE CALCULATOR
// ==================================

function estimateFare() {
  const serviceType = $("serviceType");

  // Only run this function on the fares page.
  if (!serviceType) return;

  const isBoda = serviceType.value === "boda";

  $("distanceField").hidden = !isBoda;
  $("routeField").hidden = isBoda;

  const passengers = Math.max(
    1,
    Math.min(14, parseInt($("passengers").value, 10) || 1)
  );

  let fare;
  let note;
  let service;

  if (isBoda) {
    const km = Math.max(
      1,
      Math.min(60, parseFloat($("distance").value) || 1)
    );

    // Sample boda fare:
    // KES 30 per kilometre plus KES 20 base charge.
    // Minimum estimated fare is KES 50.
    fare = Math.max(
      50,
      Math.round((km * 30 + 20) / 10) * 10
    );

    service = "Boda boda (" + km + " km)";

    note = "Sample estimate based on " + km + " km.";

    if (passengers > 1) {
      note =
        "One boda carries one passenger. For " +
        passengers +
        " people, arrange multiple bodas or choose a matatu.";
    }
  } else {
    const routeFare = parseInt($("route").value, 10) || 50;

    fare = routeFare * passengers;

    service = $("route").selectedOptions[0].text.split(" — ")[0];

    note =
      "Sample fixed-route fare for " +
      passengers +
      " passenger(s). Confirm the actual fare before travel.";
  }

  // Display the calculated fare.
  $("fareOutput").textContent =
    "KES " + fare.toLocaleString("en-KE");

  $("fareNote").textContent = note;

  // Send trip details to the booking page.
  const params = new URLSearchParams({
    service: service,
    passengers: String(passengers),
    pickup: $("pickup").value || "",
    destination: $("destination").value || "",
    fare: String(fare)
  });

  $("fareBook").href = "booking.html?" + params.toString();
}

// Listen for changes on the fare calculator.
if ($("fareForm")) {
  [
    "serviceType",
    "distance",
    "route",
    "passengers",
    "pickup",
    "destination"
  ].forEach((id) => {
    const field = $(id);

    if (field) {
      field.addEventListener("input", estimateFare);
      field.addEventListener("change", estimateFare);
    }
  });

  $("recalculate").addEventListener("click", estimateFare);

  // Calculate an initial fare when the page opens.
  estimateFare();
}

// ==================================
// BOOKING FORM
// ==================================

const bookingForm = $("bookingForm");

if (bookingForm) {
  // Read any details sent from the fare calculator.
  const params = new URLSearchParams(window.location.search);

  const serviceParam = params.get("service");

  if (serviceParam) {
    const serviceSelect = $("bookingService");

    const matchingOption = Array.from(
      serviceSelect.options
    ).find((option) =>
      option.value.toLowerCase().startsWith(
        serviceParam.toLowerCase()
      )
    );

    if (matchingOption) {
      serviceSelect.value = matchingOption.value;
    }
  }

  if (params.get("pickup")) {
    $("bookingPickup").value = params.get("pickup");
  }

  if (params.get("destination")) {
    $("bookingDestination").value = params.get("destination");
  }

  if (params.get("passengers")) {
    const count = Number(params.get("passengers"));

    if (Number.isInteger(count) && count >= 1 && count <= 14) {
      $("bookingPassengers").value = count;
    }
  }

  // Prepare the WhatsApp booking message.
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = $("customerName").value.trim();
    const phone = $("bookingPhone").value.trim();
    const service = $("bookingService").value;
    const pickup = $("bookingPickup").value.trim();
    const destination = $("bookingDestination").value.trim();
    const passengers = $("bookingPassengers").value;
    const date = $("bookingDate").value;
    const notes = $("bookingNotes").value.trim();

    const message = [
      "Hello Safiri Sawa Transport, I would like to request a booking.",
      "",
      "Name: " + name,
      "My phone: " + phone,
      "Service: " + service,
      "Pick-up: " + pickup,
      "Destination: " + destination,
      "Passengers: " + passengers,
      "Preferred date and time: " + date,
      "Additional details: " + (notes || "None"),
      "",
      "Please confirm availability and the final fare."
    ].join("\n");

    const whatsappURL =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);

    window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );
  });
}
