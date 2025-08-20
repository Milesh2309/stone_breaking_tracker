// Stone Breaking Tracker JavaScript

// Initialize data storage
let workers = JSON.parse(localStorage.getItem('stoneWorkers')) || [];

// Constants
const RATE_PER_KG = 5;

// DOM Elements
const workerForm = document.getElementById('workerForm');
const workersList = document.getElementById('workersList');
const totalWorkersEl = document.getElementById('totalWorkers');
const totalStonesEl = document.getElementById('totalStones');
const totalPaymentEl = document.getElementById('totalPayment');
const paymentTableBody = document.getElementById('paymentTableBody');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderWorkers();
    updateStats();
    renderPaymentTable();
});

// Form submission handler
workerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workerName = document.getElementById('workerName').value.trim();
    const stonesBroken = parseFloat(document.getElementById('stonesBroken').value);
    
    if (workerName && stonesBroken >= 0) {
        addWorker(workerName, stonesBroken);
        workerForm.reset();
    }
});

// Add new worker
function addWorker(name, stones) {
    const worker = {
        id: Date.now(),
        name: name,
        stonesBroken: stones,
        payment: calculatePayment(stones),
        dateAdded: new Date().toLocaleDateString('gu-IN')
    };
    
    workers.push(worker);
    saveToStorage();
    renderWorkers();
    updateStats();
    renderPaymentTable();
    
    // Show success message
    showNotification(`${name} ને સફળતાપૂર્વક ઉમેરાયો!`);
}

// Calculate payment based on stones broken
function calculatePayment(stones) {
    return Math.round(stones * RATE_PER_KG * 100) / 100;
}

// Render workers list
function renderWorkers() {
    if (workers.length === 0) {
        workersList.innerHTML = '<p class="no-workers">હજુ સુધી કોઈ કામદાર ઉમેરાયો નથી</p>';
        return;
    }
    
    workersList.innerHTML = workers.map(worker => `
        <div class="worker-card fade-in">
            <div class="worker-info">
                <h4>${worker.name}</h4>
                <p><strong>માર્ચી:</strong> ${worker.stonesBroken} kg</p>
                <p><strong>વેતન:</strong> ₹${worker.payment}</p>
                <p><strong>તારીખ:</strong> ${worker.dateAdded}</p>
            </div>
            <button class="edit-btn" onclick="editWorker(${worker.id})">સુધારો</button>
            <button class="delete-btn" onclick="deleteWorker(${worker.id})">ડિલીટ</button>
        </div>
    `).join('');
}

// Edit worker
function editWorker(id) {
    const worker = workers.find(w => w.id === id);
    const newWeight = prompt("નવો વજન (kg માં) દાખલ કરો:", worker.stonesBroken);
    
    if (newWeight !== null && !isNaN(newWeight) && newWeight >= 0) {
        worker.stonesBroken = parseFloat(newWeight);
        worker.payment = calculatePayment(worker.stonesBroken);
        saveToStorage();
        renderWorkers();
        updateStats();
        renderPaymentTable();
        showNotification(`${worker.name} નું વજન સફળતાપૂર્વક સુધારાયું!`);
    } else {
        alert("કૃપા કરીને માન્ય વજન દાખલ કરો.");
    }
}

// Update statistics
function updateStats() {
    const totalWorkers = workers.length;
    const totalStones = workers.reduce((sum, worker) => sum + worker.stonesBroken, 0);
    const totalPayment = workers.reduce((sum, worker) => sum + worker.payment, 0);
    
    totalWorkersEl.textContent = totalWorkers;
    totalStonesEl.textContent = totalStones.toFixed(1);
    totalPaymentEl.textContent = `₹${totalPayment.toFixed(2)}`;
}

// Render payment table
function renderPaymentTable() {
    if (workers.length === 0) {
        paymentTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">કોઈ ડેટા નથી</td></tr>';
        return;
    }
    
    paymentTableBody.innerHTML = workers.map((worker, index) => `
        <tr class="fade-in">
            <td>${index + 1}</td>
            <td>${worker.name}</td>
            <td>${worker.stonesBroken} kg</td>
            <td>₹${worker.payment}</td>
            <td>
                <button class="delete-btn" onclick="deleteWorker(${worker.id})">ડિલીટ</button>
            </td>
        </tr>
    `).join('');
}

// Delete worker
function deleteWorker(id) {
    if (confirm('શું તમે ખરેખર આ કામદારને ડિલીટ કરવા માંગો છો?')) {
        workers = workers.filter(worker => worker.id !== id);
        saveToStorage();
        renderWorkers();
        updateStats();
        renderPaymentTable();
        showNotification('કામદાર સફળતાપૂર્વક ડિલીટ થયો!');
    }
}

// Save to localStorage
function saveToStorage() {
    localStorage.setItem('stoneWorkers', JSON.stringify(workers));
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        font-family: 'Noto Sans Gujarati', sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export data functionality
function exportData() {
    const dataStr = JSON.stringify(workers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stone_breaking_data.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Import data functionality
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    workers = importedData;
                    saveToStorage();
                    renderWorkers();
                    updateStats();
                    renderPaymentTable();
                    showNotification('ડેટા સફળતાપૂર્વક આયાત થયો!');
                }
            } catch (error) {
                showNotification('અમાન્ય ફાઈલ ફોર્મેટ!');
            }
        };
        reader.readAsText(file);
    }
}

// Print payment report
function printReport() {
    const printWindow = window.open('', '_blank');
    const reportHTML = `
        <html>
        <head>
            <title>વેતન રિપોર્ટ</title>
            <style>
                body { font-family: 'Noto Sans Gujarati', sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>માર્ચી તોડવાનું કામ વેતન રિપોર્ટ</h1>
            <p>તારીખ: ${new Date().toLocaleDateString('gu-IN')}</p>
            <table>
                <thead>
                    <tr>
                        <th>ક્રમાંક</th>
                        <th>કામદારનું નામ</th>
                        <th>માર્ચી (kg)</th>
                        <th>વેતન (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${workers.map((worker, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${worker.name}</td>
                            <td>${worker.stonesBroken}</td>
                            <td>₹${worker.payment}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>કુલ વેતન: ₹${workers.reduce((sum, w) => sum + w.payment, 0).toFixed(2)}</strong></p>
        </body>
        </html>
    `;
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
});

// Add some utility functions for better UX
function formatCurrency(amount) {
    return new Intl.NumberFormat('gu-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Initialize tooltips or additional features
function initializeTooltips() {
    // Add any tooltip functionality here if needed
}

// Real-time calculation preview
document.getElementById('stonesBroken').addEventListener('input', (e) => {
    const stones = parseFloat(e.target.value) || 0;
    const previewPayment = calculatePayment(stones);
    
    const preview = document.getElementById('paymentPreview');
    if (!preview) {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'paymentPreview';
        previewDiv.style.cssText = 'margin-top: 10px; color: #667eea; font-weight: 600;';
        e.target.parentElement.appendChild(previewDiv);
    }
    
    document.getElementById('paymentPreview').textContent = 
        `અંદાજિત વેતન: ₹${previewPayment}`;
});

// Clear all data functionality
function clearAllData() {
    if (confirm('શું તમે ખરેખર બધો ડેટા ક્લિયર કરવા માંગો છો?')) {
        workers = [];
        saveToStorage();
        renderWorkers();
        updateStats();
        renderPaymentTable();
        showNotification('બધો ડેટા ક્લિયર થયો!');
    }
}

// Add floating action button for quick actions
function addFloatingActions() {
    const fab = document.createElement('div');
    fab.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    `;
    
    fab.innerHTML = `
        <button onclick="exportData()" style="margin: 5px; padding: 10px; background: #667eea; color: white; border: none; border-radius: 50%; cursor: pointer;">📊</button>
        <button onclick="printReport()" style="margin: 5px; padding: 10px; background: #ff6b6b; color: white; border: none; border-radius: 50%; cursor: pointer;">🖨️</button>
    `;
    
    document.body.appendChild(fab);
}

// Initialize floating actions
addFloatingActions();
