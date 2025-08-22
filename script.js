let voltage = 0, energy = 0;
let chartCtx, chart;
let voltageData = [], labels = [];

window.onload = function () {
  chartCtx = document.getElementById('chart').getContext('2d');
  chart = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Voltage (V)',
        data: voltageData,
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0,255,204,0.1)',
        tension: 0.3
      }]
    },
    options: {
      scales: { x: { display: false }, y: { beginAtZero: true, max: 5 } },
      plugins: { legend: { display: false } }
    }
  });

  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = Math.random() * 100 + 'vh';
    p.style.animationDuration = (5 + Math.random() * 5) + 's';
    p.style.opacity = Math.random();
    document.body.appendChild(p);
  }

  // ✅ Attach event listener for the new connect button
  document.getElementById("connectBtn").addEventListener("click", connectBluetooth);
};

async function connectBluetooth() {
  try {
    const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: [0xFFE0] });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(0xFFE0);
    const characteristic = await service.getCharacteristic(0xFFE1);
    characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', event => {
      const data = new TextDecoder().decode(event.target.value);
      const [steps, volt, battery] = data.trim().split(',');

      document.getElementById('steps').textContent = steps;
      document.getElementById('voltage').textContent = volt + ' V';
      document.getElementById('battery').textContent = battery + '%';
      document.getElementById('batteryBar').style.width = battery + '%';

      voltage = parseFloat(volt);
      energy += voltage * 0.01 * 0.5;
      document.getElementById('energy').textContent = energy.toFixed(2) + ' J';

      let co2 = (energy / 3600) * 0.4;
      document.getElementById('co2').textContent = co2.toFixed(3) + ' g';

      const goal = 20;
      const stepsLeft = goal - parseInt(steps);
      document.getElementById('motivation').textContent = stepsLeft > 0
        ? `Take ${stepsLeft} more steps to reach your goal!`
        : `🎉 Goal reached! Keep it up!`;

      if (voltageData.length > 20) {
        voltageData.shift();
        labels.shift();
      }
      voltageData.push(voltage);
      labels.push('');
      chart.update();
    });
    alert("✅ Connected to Arduino via Bluetooth!");
  } catch (err) {
    alert("❌ Error: " + err);
  }
}

function sendToArduino(message) {
  alert('🔧 Sending: ' + message + ' (Setup writeCharacteristic)');
}

function expandCard(card) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = card.innerHTML;
  modal.style.display = 'flex';
}

function closeModal(e) {
  if (e.target.id === 'modal' || e.target.classList.contains('close-btn')) {
    document.getElementById('modal').style.display = 'none';
  }
}
