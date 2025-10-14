import { DashboardData } from '../types';

export const mockDashboardData: DashboardData = {
  businessName: "TechCorp Solutions",
  periodStartDate: "December 1, 2024",
  periodEndDate: "December 31, 2024",
  roi: {
    revenue: 125000,
    cost: 45000,
    roi: 177.8,
    explanation: "For every $1 invested, we're capturing $2.78 in revenue."
  },
  stats: [
    {
      title: "After-Hours Calls",
      value: "2,847",
      change: "12.5%",
      icon: "Clock"
    },
    {
      title: "Calls Answered",
      value: "1,923",
      change: "8.2%",
      icon: "Phone"
    },
    {
      title: "Appointments Booked",
      value: "456",
      change: "15.3%",
      icon: "Calendar"
    },
    {
      title: "Coverage Hours",
      value: "24/7",
      change: "0%",
      icon: "Shield"
    }
  ],
  callLog: [
    {
      id: 1,
      date: "2024-12-10T14:30:00Z",
      caller: "John Smith",
      duration: "3:45",
      outcome: "Appointment Booked",
      service: "Emergency Pumping",
      appointment: "Dec 15, 2024 - 9:00 AM",
      notes: "Septic tank overflowing, urgent service needed"
    },
    {
      id: 2,
      date: "2024-12-10T14:15:00Z",
      caller: "Sarah Johnson",
      duration: "2:20",
      outcome: "Info Request",
      service: "Routine Maintenance",
      appointment: "Follow-up call scheduled",
      notes: "Inquired about annual maintenance schedule"
    },
    {
      id: 3,
      date: "2024-12-10T13:45:00Z",
      caller: "Mike Davis",
      duration: "0:00",
      outcome: "Hang Up",
      service: "System Inspection",
      appointment: "N/A",
      notes: "Caller hung up before connection"
    },
    {
      id: 4,
      date: "2024-12-10T13:20:00Z",
      caller: "Lisa Wilson",
      duration: "4:10",
      outcome: "Appointment Booked",
      service: "Emergency Pumping",
      appointment: "Dec 11, 2024 - 1:00 PM",
      notes: "Backup in basement, immediate attention required"
    },
    {
      id: 5,
      date: "2024-12-10T12:55:00Z",
      caller: "Robert Brown",
      duration: "0:00",
      outcome: "Hang Up",
      service: "System Repair",
      appointment: "N/A",
      notes: "No answer after 3 rings"
    },
    {
      id: 6,
      date: "2024-12-10T12:30:00Z",
      caller: "Emily Chen",
      duration: "2:55",
      outcome: "Appointment Booked",
      service: "Routine Pumping",
      appointment: "Dec 15, 2024 - 10:00 AM",
      notes: "Regular 3-year maintenance cycle"
    },
    {
      id: 7,
      date: "2024-12-10T12:10:00Z",
      caller: "David Miller",
      duration: "0:00",
      outcome: "Hang Up",
      service: "New Installation",
      appointment: "N/A",
      notes: "Caller disconnected immediately"
    },
    {
      id: 8,
      date: "2024-12-10T11:45:00Z",
      caller: "Jennifer Taylor",
      duration: "3:25",
      outcome: "Appointment Booked",
      service: "Emergency Pumping",
      appointment: "Dec 10, 2024 - 4:00 PM",
      notes: "Weekend emergency, same-day service"
    }
  ],
  cta: {
    title: "Ready to Scale Your Business?",
    description: "Upgrade to our Professional plan for advanced features and unlimited calls.",
    buttonText: "Upgrade Now",
    buttonLink: "/billing"
  }
};
