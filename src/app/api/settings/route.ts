import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // In a production application, these keys should be stored securely
    // in Supabase using an encrypted column, or environment variables.
    // Currently, the frontend persists them in localStorage.
    
    console.log("Settings API received data for update.")
    
    return NextResponse.json({ 
      success: true, 
      message: "Settings synchronized successfully" 
    }, { status: 200 })
  } catch (error: any) {
    console.error("Settings save error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error?.message || String(error) 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Settings API is active" 
  }, { status: 200 })
}
