// routes/supplier.js
// Ye file supplier panel (jaha se aap resell karne ke liye services khareedte ho) se
// baat karti hai. Zyadatr SMM supplier panels ka API format same hota hai (SMM API v2 standard).
// Jab customer order place kare, ye function supplier ko order bhejta hai.

const fetch = require('node-fetch');
require('dotenv').config();

const SUPPLIER_API_URL = process.env.SUPPLIER_API_URL;
const SUPPLIER_API_KEY = process.env.SUPPLIER_API_KEY;

// Supplier ko naya order bhejna
async function placeSupplierOrder({ supplierServiceId, link, quantity }) {
  // NOTE: Jab tak aap real supplier account nahi lete (jaise SMMKing, JAP, GrowFollows),
  // ye function kaam nahi karega. Abhi ke liye ye ek "simulate" mode me hai taaki
  // aap bina supplier ke bhi website test kar sako.

  if (!SUPPLIER_API_URL || SUPPLIER_API_URL.includes('supplierpanel.com')) {
    // SIMULATE MODE - real supplier connect hone tak
    console.log(`[SIMULATE] Order bheja gaya: service=${supplierServiceId}, link=${link}, qty=${quantity}`);
    return { order: 'SIMULATED-' + Date.now(), status: 'pending' };
  }

  const response = await fetch(SUPPLIER_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      key: SUPPLIER_API_KEY,
      action: 'add',
      service: supplierServiceId,
      link: link,
      quantity: quantity
    })
  });

  const data = await response.json();
  return data; // { order: 12345 } ya { error: "..." }
}

// Supplier se order ka status check karna
async function checkSupplierOrderStatus(supplierOrderId) {
  if (!SUPPLIER_API_URL || SUPPLIER_API_URL.includes('supplierpanel.com')) {
    return { status: 'In progress', simulate: true };
  }

  const response = await fetch(SUPPLIER_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      key: SUPPLIER_API_KEY,
      action: 'status',
      order: supplierOrderId
    })
  });

  return await response.json();
}

module.exports = { placeSupplierOrder, checkSupplierOrderStatus };
