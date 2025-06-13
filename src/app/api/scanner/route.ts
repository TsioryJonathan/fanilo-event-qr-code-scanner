// API route to handle ticket scanning
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Get the QR code from the request body
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      )
    }

    // Fetch the ticket from the database
    const ticket = await prisma.billet.findUnique({
      where: { code },
      select: {
        id: true,
        type: true,
        scan_limit: true,
        scans_used: true,
        numero: true
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Calculate remaining scans
    const remainingScans = ticket.scan_limit - ticket.scans_used

    // Check if scan limit is reached
    if (remainingScans <= 0) {
      return NextResponse.json(
        { 
          error: 'Ticket has reached its maximum scan limit',
          details: {
            type: ticket.type,
            number: ticket.numero,
            scan_limit: ticket.scan_limit,
            scans_used: ticket.scans_used
          }
        },
        { status: 403 }
      )
    }

    // Update scan count
    const updatedTicket = await prisma.billet.update({
      where: { id: ticket.id },
      data: {
        scans_used: ticket.scans_used + 1
      },
      select: {
        id: true,
        type: true,
        scan_limit: true,
        scans_used: true,
        numero: true
      }
    })

    // Calculate new remaining scans
    const newRemainingScans = updatedTicket.scan_limit - updatedTicket.scans_used

    // Generate appropriate message based on remaining scans
    let message = ''
    if (newRemainingScans === 0) {
      message = 'Last scan allowed! This ticket cannot be scanned anymore.'
    } else if (newRemainingScans === 1) {
      message = '1 scan remaining! Use it carefully.'
    } else {
      message = `${newRemainingScans} scans remaining.`
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message,
      remainingScans: newRemainingScans
    })

  } catch (error) {
    console.error('Error scanning ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
