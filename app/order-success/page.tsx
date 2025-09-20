"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, ArrowRight } from "lucide-react"

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
    }
  }, [orderId])

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.data.order)
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    }
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <div className="container mx-auto px-4 max-w-3xl py-30 flex-1 flex flex-col justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 border-white/20">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-serif text-gray-800 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600">Thank you for your order.                   We&apos;re preparing your order with care!</p>
            </div>

            {order && (
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Order ID:</span>
                    <span>#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span>₹{order.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Method:</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="capitalize">{order.status}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push("/products")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/orders")}
                className="bg-white/80 backdrop-blur-sm"
              >
                View Orders
              </Button>
            </div>

            <div className="mt-8 text-sm text-gray-600">
              <p>You will receive an email confirmation shortly.</p>
              <p>Estimated delivery: 2-4 business days</p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 max-w-7xl py-20 flex-1 flex flex-col justify-center">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 border-white/20 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}