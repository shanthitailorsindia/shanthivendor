

# Intelligent Monthly Payment Planner for Dashboard

## What You Already Have
- `vendor_profiles` with `opening_balance`, `credit_limit`, `payment_terms`
- `purchase_bills` with `due_date`, `total_amount`, `paid_amount`, `payment_status`
- `vendor_payments` with `amount`, `due_date`, `status`
- `vendor_balance_summary` view with `current_balance` per vendor
- `calculate_vendor_balance` DB function

## What to Build on Dashboard

### 1. Monthly Payment Planner Widget
A new section below the existing dashboard content that:
- Fetches all **unpaid/partial bills** with their `due_date` and outstanding amounts
- Groups them by **week** within the current month (Week 1-4)
- Shows a **timeline view** with vendor name, bill number, due date, outstanding amount
- Highlights **overdue** bills in red, **due this week** in amber, **upcoming** in default
- Includes a **monthly budget input** field where you set your total payment budget for the month
- Auto-distributes payments by priority: overdue first, then by due date, then by vendor credit limit proximity

### 2. Vendor Priority Score
For each vendor with pending dues, calculate a priority based on:
- **Days overdue** (higher = more urgent)
- **Balance vs credit limit** ratio (closer to limit = more urgent)
- **Payment terms** from vendor profile
- Display as a sorted list: "Pay These First" section

### 3. Cash Flow Forecast Chart
A bar/area chart (using recharts, already installed) showing:
- X-axis: weeks of current month
- Bars: scheduled outgoing payments by week
- Line: cumulative spend vs budget
- Helps visualize payment load distribution

### 4. Suggested Payment Schedule Table
Based on the monthly budget input:
- Algorithm splits budget across weeks
- Prioritizes overdue, then nearest due dates
- Shows: Vendor | Bill | Due Date | Amount | Suggested Pay Date | Priority (High/Medium/Low)
- "Defer" badge on bills that can safely wait (within payment terms)

---

## Advisory: Features to Make a Complete Vendor Management System

Beyond what you already have, here are recommendations:

1. **Vendor Rating/Scoring** -- Track delivery reliability, pricing competitiveness, payment flexibility. Score vendors A/B/C.
2. **Purchase Order Management** -- Create POs before bills. Track PO-to-bill matching and partial deliveries.
3. **Recurring Bills** -- Auto-generate expected bills for vendors with regular supply schedules.
4. **Credit Limit Alerts** -- Dashboard warnings when vendor balance approaches their credit limit.
5. **Payment Reminders/Notifications** -- Auto email/SMS reminders for upcoming due dates.
6. **Vendor Comparison Reports** -- Compare pricing across vendors for the same product categories.
7. **GST/Tax Reports** -- Monthly GST input credit summary, GSTR-2 compatible exports.
8. **Aging Analysis** -- Standard 30/60/90/120 day aging report for payables.
9. **Bank Reconciliation** -- Match payments against bank statements.
10. **Audit Trail** -- Log all bill edits, payment changes, and who made them.

---

## Technical Plan (Implementation)

### No DB Changes Required
All data needed exists in `purchase_bills`, `vendor_profiles`, and `vendor_balance_summary`. The planner is purely a **client-side calculation** using existing queries.

### File Changes
**`src/pages/Dashboard.tsx`** -- Add three new sections:

1. **Monthly Budget Input + Payment Planner**
   - State: `monthlyBudget` (number input, persisted to localStorage)
   - Query: fetch all bills where `payment_status != 'paid'` with vendor names
   - Compute priority score per bill, sort, and allocate budget

2. **Cash Flow Chart**
   - Group unpaid bills by due_date week
   - Render a `BarChart` + `Line` using recharts `ComposedChart`
   - Config via `ChartContainer` from existing `chart.tsx`

3. **Suggested Payment Schedule**
   - Table showing prioritized bills with suggested pay dates
   - Color-coded priority badges (High = overdue, Medium = due this month, Low = future)
   - Running total column showing remaining budget after each payment

### Algorithm (Priority Score)
```text
score = (daysOverdue * 10) + (balanceRatio * 5) + (1 / paymentTerms * 3)
where balanceRatio = currentBalance / creditLimit (capped at 1)
```
Bills sorted descending by score. Budget allocated top-down until exhausted.

