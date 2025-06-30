// Select elements
const customerForm = document.getElementById('customerForm');
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const dukaanForm = document.getElementById('dukaanForm');
const dukaanCustomer = document.getElementById('dukaanCustomer');
const dukaanItem = document.getElementById('dukaanItem');
const dukaanAmount = document.getElementById('dukaanAmount');
const summaryTable = document.getElementById('summaryTable');
const totalSummary = document.getElementById('totalSummary');
const customerBalances = document.getElementById('customerBalances');

let customers = JSON.parse(localStorage.getItem('customers')) || [];
let entries = JSON.parse(localStorage.getItem('dukaanEntries')) || [];
let showAll = false;

customerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = customerName.value.trim();
  const phone = customerPhone.value.trim();
  if (!name) return alert("Enter customer name");

  const id = Date.now().toString();
  customers.push({ id, name, phone });
  localStorage.setItem('customers', JSON.stringify(customers));
  customerName.value = '';
  customerPhone.value = '';
  renderCustomerOptions();
  renderCustomerList();
  alert("Customer added!");
});

dukaanForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const customerId = dukaanCustomer.value;
  const item = dukaanItem.value.trim();
  const amount = parseFloat(dukaanAmount.value);
  if (!customerId || !item || isNaN(amount)) return alert("Fill all fields");

  const customer = customers.find(c => c.id === customerId);
  const entry = {
    id: Date.now().toString(),
    customerId,
    customerName: customer.name,
    item,
    amount,
    date: new Date().toLocaleDateString()
  };
  entries.push(entry);
  localStorage.setItem('dukaanEntries', JSON.stringify(entries));
  dukaanItem.value = '';
  dukaanAmount.value = '';
  renderDukaanTable();
});

function renderCustomerOptions() {
  dukaanCustomer.innerHTML = '';
  customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.phone})`;
    dukaanCustomer.appendChild(opt);
  });
}

function renderCustomerList() {
  const list = document.getElementById('customerList');
  list.innerHTML = '';
  customers.forEach(c => {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-gray-50 p-2 rounded';
    li.innerHTML = `
      <span>${c.name} (${c.phone})</span>
      <button onclick="removeCustomer('${c.id}')" class="delete-btn">Remove</button>
    `;
    list.appendChild(li);
  });
}

function removeCustomer(id) {
  const hasEntries = entries.some(e => e.customerId === id);
  if (hasEntries) return alert("❌ Cannot delete customer with existing entries.");
  if (confirm("Are you sure you want to remove this customer?")) {
    customers = customers.filter(c => c.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
    renderCustomerOptions();
    renderCustomerList();
    alert("✅ Customer removed.");
  }
}

function renderDukaanTable() {
  summaryTable.innerHTML = '';
  const filteredEntries = showAll ? entries : entries.filter(e => e.date === new Date().toLocaleDateString());
  let total = 0;
  filteredEntries.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.customerName}</td>
      <td>${entry.item}</td>
      <td>₹${entry.amount}</td>
      <td>${entry.date}</td>
      <td>
        <button class="whatsapp-btn mr-1" onclick="sendReminder('${entry.customerName}', '${entry.amount}', '${entry.item}')">Remind</button>
        <button class="delete-btn" onclick="deleteEntry('${entry.id}')">Delete</button>
      </td>
    `;
    summaryTable.appendChild(row);
    total += entry.amount;
  });
  renderPrintTable(filteredEntries);
  renderCustomerTotals();
  totalSummary.textContent = `Total Pending: ₹${total}`;
}

function renderCustomerTotals() {
  const map = {};
  entries.forEach(e => {
    if (!map[e.customerName]) map[e.customerName] = 0;
    map[e.customerName] += e.amount;
  });
  customerBalances.innerHTML = '<strong>Per Customer Total:</strong><br>' +
    Object.entries(map).map(([k, v]) => `${k}: ₹${v}`).join('<br>');
}

function deleteEntry(id) {
  if (confirm("Delete this entry?")) {
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem('dukaanEntries', JSON.stringify(entries));
    renderDukaanTable();
  }
}

function sendReminder(name, amount, item) {
  const msg = `Namaste ${name}, you have ₹${amount} pending for ${item}. Kindly pay soon. – Dukaan`; 
  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function downloadPDF() {
  const element = document.getElementById("printableArea");
  html2pdf().from(element).save('Dukaan-Summary.pdf');
}

function sendMonthlySummary() {
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const summaryMap = {};
  let total = 0;
  entries.forEach(e => {
    const name = e.customerName;
    if (!summaryMap[name]) summaryMap[name] = { total: 0, count: 0 };
    summaryMap[name].total += e.amount;
    summaryMap[name].count += 1;
    total += e.amount;
  });

  let message = ` Dukaan Summary\n`;
  Object.entries(summaryMap).forEach(([name, data]) => {
    message += `- ${name}: ₹${data.total} (${data.count} items)\n`;
  });
  message += `Total: ₹${total}`;
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function toggleView() {
  showAll = !showAll;
  document.getElementById('toggleViewBtn').textContent = showAll ? '🔒 Show Today Only' : '🔓 Show All Entries';
  renderDukaanTable();
}

function toggleCustomerManager() {
  const manager = document.getElementById('customerManager');
  manager.classList.toggle('hidden');
}

function renderPrintTable(filteredEntries) {
  const printTable = document.getElementById('printTableBody');
  printTable.innerHTML = '';
  filteredEntries.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.customerName}</td>
      <td>${entry.item}</td>
      <td>₹${entry.amount}</td>
      <td>${entry.date}</td>
    `;
    printTable.appendChild(row);
  });
}




renderCustomerOptions();
renderCustomerList();
renderDukaanTable();
