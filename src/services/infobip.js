const INFOBIP_API_KEY = import.meta.env.VITE_INFOBIP_API_KEY
const INFOBIP_BASE_URL = import.meta.env.VITE_INFOBIP_BASE_URL

function buildOrderMessage(order, items) {
  const itemsList = items
    .map(i => `- ${i.quantity}x ${i.menu_item_name}${i.modifications ? ` (${i.modifications})` : ''} — ${formatPrice(i.item_total)}`)
    .join('\n')

  return `Nova narudžba #${order.order_number}!\n\nKupac: ${order.customer_name}\nAdresa: ${order.delivery_address}\nTelefon: ${order.customer_phone}\n\nNarudžba:\n${itemsList}\n\nUkupno: ${formatPrice(order.total_amount)}€\n\nPrijavite se na panel za prihvat: hocu-jesti.hr/restaurant`
}

function formatPrice(amount) {
  return Number(amount).toFixed(2)
}

async function sendWhatsApp(to, message) {
  const response = await fetch(`${INFOBIP_BASE_URL}/whatsapp/1/message/text`, {
    method: 'POST',
    headers: {
      Authorization: `App ${INFOBIP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '385XXXXXXXXX',
      to,
      content: { text: message },
    }),
  })
  return response.ok
}

async function sendSMS(to, message) {
  const response = await fetch(`${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
    method: 'POST',
    headers: {
      Authorization: `App ${INFOBIP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ from: 'HocuJesti', destinations: [{ to }], text: message }],
    }),
  })
  return response.ok
}

export async function notifyRestaurant(order, items, restaurantPhone) {
  const message = buildOrderMessage(order, items)
  const phone = restaurantPhone.replace(/\D/g, '')
  const sent = await sendWhatsApp(phone, message)
  if (!sent) await sendSMS(phone, message)
}

export async function notifyCustomer(order) {
  const message = `Hvala na narudžbi #${order.order_number}! Vaša narudžba je primljena i čeka potvrdu restorana. Pratite status na: hocu-jesti.hr/narudzba/${order.order_number}`
  const phone = order.customer_phone.replace(/\D/g, '')
  const sent = await sendWhatsApp(phone, message)
  if (!sent) await sendSMS(phone, message)
}
