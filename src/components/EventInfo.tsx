import { CalendarDays, Clock, MapPin, Users } from "lucide-react"

export default function EventInfo() {
  // In a real app, this would be fetched from your backend
  const eventDetails = {
    name: "Tech Conference 2025",
    date: "June 15-17, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Convention Center, San Francisco",
    attendees: 1250,
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-4">{eventDetails.name}</h2>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="bg-muted rounded-md p-2">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Date</p>
            <p className="text-sm text-muted-foreground">{eventDetails.date}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-muted rounded-md p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Time</p>
            <p className="text-sm text-muted-foreground">{eventDetails.time}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-muted rounded-md p-2">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Location</p>
            <p className="text-sm text-muted-foreground">{eventDetails.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-muted rounded-md p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Attendees</p>
            <p className="text-sm text-muted-foreground">{eventDetails.attendees} registered</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-muted rounded-md text-sm">
        <p className="font-medium">Scanner Instructions:</p>
        <ol className="list-decimal ml-5 mt-1 text-muted-foreground space-y-1">
          <li>Switch to the "Scan QR" tab</li>
          <li>Click "Start Scanning" and allow camera access</li>
          <li>Point camera at attendee's QR code</li>
          <li>Verify attendee information after successful scan</li>
        </ol>
      </div>
    </div>
  )
}
