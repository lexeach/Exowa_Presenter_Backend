const leads = [
  {
    name: "Rahul",
    phone: "9876543210",
    status: "NEW",
    attempts: 1,
    demoTime: "5:00 PM"
  }
];

<LeadDashboard leads={leads} />

<SalesAnalytics
  totalLeads={50}
  demosBooked={20}
  closedSales={8}
  referrals={15}
/>

<CalendarBooking
  onBook={(booking) => console.log(booking)}
/>
