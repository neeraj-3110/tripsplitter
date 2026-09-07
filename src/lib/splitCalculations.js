// All money math is done in integer paise (1 rupee = 100 paise) to avoid
// floating point drift, then converted back to rupees only for display/storage.

export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100)
}

export function toRupees(paise) {
  return Math.round(paise) / 100
}

export function formatCurrency(amount) {
  const value = Number(amount) || 0
  return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Splits a rupee amount equally among participantIds.
 * Guarantees the shares sum to EXACTLY the original amount (no rounding drift)
 * by giving any leftover paise to the first participants in the list.
 *
 * Returns: [{ memberId, shareAmount }] with shareAmount in rupees (2 decimals).
 */
export function splitEqually(amount, participantIds) {
  const n = participantIds.length
  if (n === 0) return []

  const totalPaise = toPaise(amount)
  const basePaise = Math.floor(totalPaise / n)
  const remainder = totalPaise - basePaise * n // 0 <= remainder < n

  return participantIds.map((memberId, index) => {
    const paise = basePaise + (index < remainder ? 1 : 0)
    return { memberId, shareAmount: toRupees(paise) }
  })
}

/**
 * Computes, for every member, how much they paid, how much they owe, and
 * their net balance across all expenses of a trip.
 *
 * members: [{ id, name }]
 * expenses: [{ id, amount, paid_by, expense_participants: [{ member_id, share_amount }] }]
 *
 * Returns a map: { [memberId]: { paid, owed, net } } (values in rupees)
 */
export function computeBalances(members, expenses) {
  const balances = {}
  members.forEach((m) => {
    balances[m.id] = { paid: 0, owed: 0, net: 0 }
  })

  expenses.forEach((expense) => {
    if (balances[expense.paid_by]) {
      balances[expense.paid_by].paid = toRupees(toPaise(balances[expense.paid_by].paid) + toPaise(expense.amount))
    }
    ;(expense.expense_participants || []).forEach((p) => {
      if (balances[p.member_id]) {
        balances[p.member_id].owed = toRupees(toPaise(balances[p.member_id].owed) + toPaise(p.share_amount))
      }
    })
  })

  Object.keys(balances).forEach((id) => {
    balances[id].net = toRupees(toPaise(balances[id].paid) - toPaise(balances[id].owed))
  })

  return balances
}

/**
 * Greedy debt-simplification: turns a set of net balances into the minimum
 * number of "X pays Y" transactions.
 *
 * balances: { [memberId]: { net } }  (positive = is owed, negative = owes)
 * Returns: [{ from, to, amount }] (amount in rupees, always > 0)
 */
export function simplifySettlements(balances) {
  const creditors = []
  const debtors = []

  Object.entries(balances).forEach(([id, b]) => {
    const paise = toPaise(b.net)
    if (paise > 0) creditors.push({ id, paise })
    else if (paise < 0) debtors.push({ id, paise: -paise })
  })

  creditors.sort((a, b) => b.paise - a.paise)
  debtors.sort((a, b) => b.paise - a.paise)

  const transactions = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const settled = Math.min(debtor.paise, creditor.paise)

    if (settled > 0) {
      transactions.push({ from: debtor.id, to: creditor.id, amount: toRupees(settled) })
    }

    debtor.paise -= settled
    creditor.paise -= settled

    if (debtor.paise === 0) i += 1
    if (creditor.paise === 0) j += 1
  }

  return transactions
}

export const CATEGORIES = [
  { key: 'Food', icon: '🍔' },
  { key: 'Hotel', icon: '🏨' },
  { key: 'Transport', icon: '🚕' },
  { key: 'Activities', icon: '🎟️' },
  { key: 'Shopping', icon: '🛍️' },
  { key: 'Entertainment', icon: '🎬' },
  { key: 'Other', icon: '📦' }
]

export function categoryIcon(category) {
  return CATEGORIES.find((c) => c.key === category)?.icon || '📦'
}

/**
 * Builds the Trip Insights data set from a trip's expenses.
 */
export function buildInsights(expenses) {
  const totalPaise = expenses.reduce((sum, e) => sum + toPaise(e.amount), 0)

  const byCategoryPaise = {}
  expenses.forEach((e) => {
    byCategoryPaise[e.category] = (byCategoryPaise[e.category] || 0) + toPaise(e.amount)
  })

  const categories = Object.entries(byCategoryPaise)
    .map(([category, paise]) => ({
      category,
      amount: toRupees(paise),
      percent: totalPaise > 0 ? Math.round((paise / totalPaise) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  const biggest = categories[0] || null
  const count = expenses.length
  const average = count > 0 ? toRupees(Math.round(totalPaise / count)) : 0
  const highest = expenses.reduce((max, e) => (e.amount > (max?.amount || 0) ? e : max), null)

  const statements = []
  if (biggest) {
    statements.push(`${biggest.category} was your biggest expense category.`)
    statements.push(`The group spent ${formatCurrency(biggest.amount)} on ${biggest.category}.`)
    statements.push(`${biggest.category} accounted for ${biggest.percent}% of total spending.`)
  }

  return {
    total: toRupees(totalPaise),
    categories,
    biggest,
    count,
    average,
    highest,
    statements
  }
}
